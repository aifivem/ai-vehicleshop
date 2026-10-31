import {
  AdminPanel,
  aiLog,
  aiLogChannels,
  isNear,
  onClientCallback,
  online,
  registerExport,
  resourceExport,
} from "@aicore-fivem/lib/server";
import { fail, readText, RecordObjects } from "@aicore-fivem/lib/shared";
import {
  COLORS,
  EVENTS,
  readEntry,
  readSettings,
  readShop,
  type CatalogEntry,
} from "common/shop";
import { shopSchema } from "./schema";

const core = resourceExport("ai-core");
const vehiclesApi = resourceExport("ai-vehicles");
const panel = new AdminPanel(shopSchema);
const content = {
  settings: panel.view("settings", readSettings),
  shops: panel.records("shops", readShop),
};
/** Catalog entries by model, kept per edited entry (the first record of a model wins). */
const byModel = new Map<string, CatalogEntry>();
new RecordObjects(panel, "catalog", readEntry, (_id, entry) => {
  if (byModel.has(entry.model)) return;
  byModel.set(entry.model, entry);
  return () => byModel.delete(entry.model);
});
aiLogChannels({ purchases: {} });

/** Takes the price from the panel's accounts in order; answers the account it came from, or null. */
function charge(source: number, price: number, reason: string): string | null {
  for (const account of content.settings.value.accounts)
    if (core.RemoveMoney(source, account, price, reason)) return account;
  return null;
}

onClientCallback(
  EVENTS.buy,
  {
    args: ([shopId, model, color]): [string, string, number] | null => {
      const shop = readText(shopId, 64);
      const name = readText(model, 32);
      return shop !== null &&
        name !== null &&
        typeof color === "number" &&
        (COLORS as readonly number[]).includes(color)
        ? [shop, name, color]
        : null;
    },
    lock: true,
  },
  async (source, shopId, model, color) => {
    const shop = content.shops.get(shopId);
    const entry = byModel.get(model);
    if (!shop || !entry || !shop.categories.includes(entry.category))
      return fail("SHOP_ERR_GONE");
    if (!isNear(source, shop, shop.radius + 3)) return fail("SHOP_ERR_FAR");
    if (!online.allows(source, shop.access)) return fail("SHOP_ERR_DENIED");
    const character = online.character(source);
    if (!character) return fail("SHOP_ERR_GONE");
    const reason = `vehicle:${model}`;
    const account = charge(source, entry.price, reason);
    if (account === null) return fail("SHOP_ERR_MONEY");
    const created = vehiclesApi.CreateVehicle(
      { type: "character", id: String(character.id) },
      model,
      null,
    );
    if (!created) {
      core.AddMoney(source, account, entry.price, `${reason}:refund`);
      return fail("SHOP_ERR_FAILED");
    }
    // The picked colour as the spawn setup: ai-vehicles keeps it until the first parking stores full props.
    const netId = await new Promise<number | null>((resolve) =>
      vehiclesApi.SpawnVehicle(
        created.id,
        shop.delivery,
        source,
        resolve,
        "purchase",
        { colors: [color, color] },
      ),
    );
    aiLog(
      "purchases",
      `bought ${model} (${created.plate}) for $${entry.price} at ${shop.id}`,
      {
        source,
        metadata: {
          model,
          plate: created.plate,
          price: entry.price,
          account,
          shop: shop.id,
        },
      },
    );
    return { ok: true, netId, plate: created.plate };
  },
);

/** A model's catalog price (ai-vehiclesales' dealer buy-back); null when the catalog has no such model. */
registerExport("GetCatalogPrice", (model: unknown) => {
  if (typeof model !== "string") return null;
  return byModel.get(model.toLowerCase())?.price ?? null;
});
