import {
  AdminPanel,
  aiLog,
  aiLogChannels,
  onClientCallback,
  resourceExport,
} from "@aicore-fivem/lib/server"
import { COLORS, EVENTS, readCatalog, readShops } from "common/shop"
import { shopSchema } from "./schema"

const core = resourceExport("ai-core")
const vehiclesApi = resourceExport("ai-vehicles")
const panel = new AdminPanel(shopSchema)
/** Catalog and shops, parsed again after every panel change. */
const content = {
  catalog: readCatalog(panel.get("catalog")),
  shops: readShops(panel.get("shops")),
}
panel.onChange(
  "catalog",
  () => (content.catalog = readCatalog(panel.get("catalog")))
)
panel.onChange("shops", () => (content.shops = readShops(panel.get("shops"))))
aiLogChannels({ purchases: {} })

const fail = (error: string) => ({ ok: false as const, error })

onClientCallback(
  EVENTS.buy,
  {
    args: ([shopId, model, color]) =>
      typeof shopId === "string" &&
      typeof model === "string" &&
      typeof color === "number" &&
      (COLORS as readonly number[]).includes(color)
        ? [shopId, model, color]
        : null,
    lock: true,
  },
  async (source, shopId, model, color) => {
    const shop = content.shops.get(shopId)
    const entry = [...content.catalog.values()].find((e) => e.model === model)
    if (!shop || !entry || !shop.categories.includes(entry.category))
      return fail("SHOP_ERR_GONE")
    const [x = 0, y = 0, z = 0] = GetEntityCoords(GetPlayerPed(String(source)))
    if (Math.hypot(x - shop.x, y - shop.y, z - shop.z) > shop.radius + 3)
      return fail("SHOP_ERR_FAR")
    if (
      shop.jobs.length &&
      !(core.GetJobs(source) ?? []).some((m) => shop.jobs.includes(m.job))
    )
      return fail("SHOP_ERR_DENIED")
    const character = core.GetCharacter(source)
    if (!character) return fail("SHOP_ERR_GONE")
    if (
      !core.RemoveMoney(source, "bank", entry.price, `vehicle:${model}`) &&
      !core.RemoveMoney(source, "cash", entry.price, `vehicle:${model}`)
    )
      return fail("SHOP_ERR_MONEY")
    const created = vehiclesApi.CreateVehicle(
      { type: "character", id: String(character.id) },
      model,
      null
    )
    if (!created) return fail("SHOP_ERR_GONE")
    const netId = await new Promise<number | null>((resolve) =>
      vehiclesApi.SpawnVehicle(
        created.id,
        shop.delivery,
        source,
        resolve,
        "purchase"
      )
    )
    if (netId !== null) {
      const entity = NetworkGetEntityFromNetworkId(netId)
      // The picked colour; the owner's client saves it with the other props on the first parking.
      if (entity) SetVehicleColours(entity, color, color)
    }
    aiLog(
      "purchases",
      `bought ${model} (${created.plate}) for $${entry.price} at ${shop.id}`,
      {
        source,
        metadata: {
          model,
          plate: created.plate,
          price: entry.price,
          shop: shop.id,
        },
      }
    )
    return { ok: true, netId, plate: created.plate }
  }
)
