import {
  AdminWorld,
  allows,
  cache,
  callAction,
  loadLocaleTexts,
  notify,
  NuiScreen,
  onCache,
  onMembershipChange,
  Points,
  requestModel,
  ScriptCamera,
  vehicleLabel,
} from "@aicore-fivem/lib/client";
import { isPublic, isRecord, RecordObjects } from "@aicore-fivem/lib/shared";
import { Locale, ResourceName } from "common";
import {
  COLORS,
  EVENTS,
  readEntry,
  readSettings,
  readShop,
  type NuiMessage,
  type Shop,
} from "common/shop";

const world = new AdminWorld(["settings", "catalog", "shops"]);
const content = {
  settings: world.view("settings", readSettings),
  catalog: world.records("catalog", readEntry),
};
const texts = loadLocaleTexts();
/** The showroom page; closing it ends the preview and the camera. */
const page = new NuiScreen<NuiMessage>("vehicleshop", {
  onClose: () => showroom.end(),
});

/**
 * The showroom: a local preview vehicle at the shop's preview point under a scripted camera while the screen is open.
 * Local entities only (nothing networked until the server delivers a bought vehicle).
 */
class Showroom {
  shop: Shop | null = null;
  private readonly camera = new ScriptCamera();
  private preview = 0;
  private token = 0;

  open(shop: Shop): void {
    this.shop = shop;
    const c = shop.camera;
    this.camera.start(
      c,
      { rotation: { x: -8, y: 0, z: c.heading }, fov: 50 },
      500,
    );
    const catalog = content.catalog;
    const vehicles = [...catalog.values()]
      .filter((e) => shop.categories.includes(e.category))
      .map((e) => ({
        model: e.model,
        label: e.label || vehicleLabel(e.model),
        price: e.price,
        category: e.category,
      }));
    page.open({
      action: "open",
      data: {
        texts,
        shop: { id: shop.id, label: shop.label, vehicles },
        colors: COLORS,
      },
    });
  }

  async show(model: string, color: number): Promise<void> {
    if (!this.shop) return;
    const token = ++this.token;
    const hash = await requestModel(model).catch(() => 0);
    if (!hash || token !== this.token || !this.shop) return;
    this.clearPreview();
    const p = this.shop.preview;
    this.preview = CreateVehicle(hash, p.x, p.y, p.z, p.heading, false, false);
    SetVehicleColours(this.preview, color, color);
    SetVehicleDirtLevel(this.preview, 0);
    FreezeEntityPosition(this.preview, true);
    SetEntityInvincible(this.preview, true);
    SetModelAsNoLongerNeeded(hash);
  }

  color(color: number): void {
    if (this.preview) SetVehicleColours(this.preview, color, color);
  }

  /** The page closed: the preview vehicle and the camera go. */
  end(): void {
    this.token++;
    this.clearPreview();
    this.camera.stop(400);
    this.shop = null;
  }

  private clearPreview(): void {
    if (this.preview) DeleteEntity(this.preview);
    this.preview = 0;
  }
}

const showroom = new Showroom();

/**
 * Shop points with their blips: an edited shop rebuilds only its own point, the blip settings every shop. A shop locked
 * to jobs or gangs shows (and has a blip) only for who passes its access rule.
 */
const points = new Points();
const shops = new RecordObjects(world, "shops", readShop, (id, shop) => {
  const { blip, bikeBlip } = content.settings.value;
  points.add(`vshop:${id}`, {
    ped: shop.ped ?? undefined,
    coords: { x: shop.x, y: shop.y, z: shop.z },
    label: Locale("SHOP_PROMPT", shop.label),
    icon: "car",
    radius: shop.radius,
    blip:
      shop.blip && allows(shop.access)
        ? {
            ...(shop.categories.includes("motorcycles") &&
            shop.categories.length === 1
              ? bikeBlip
              : blip),
            label: shop.label,
          }
        : undefined,
    canShow: () =>
      cache.vehicle === false && !showroom.shop && allows(shop.access),
    onPressed: () => showroom.open(shop),
  });
  return () => points.remove(`vshop:${id}`);
});

world.onChange("settings", () => shops.rebuildAll());
// Blips follow memberships: only the locked shops are built again.
onMembershipChange(() => {
  for (const [id, shop] of shops.records)
    if (!isPublic(shop.access)) shops.rebuild(id);
});
onCache("vehicle", () => points.refresh());

page.on(
  "preview",
  (d) =>
    isRecord(d) && typeof d.model === "string" && typeof d.color === "number"
      ? { model: d.model, color: d.color }
      : null,
  ({ model, color }) => void showroom.show(model, color),
);
page.on(
  "color",
  (d) => (isRecord(d) && typeof d.color === "number" ? d.color : null),
  (color) => showroom.color(color),
);
page.on(
  "buy",
  (d) =>
    isRecord(d) && typeof d.model === "string" && typeof d.color === "number"
      ? { model: d.model, color: d.color }
      : null,
  async ({ model, color }) => {
    const shop = showroom.shop;
    if (!shop) return { ok: false };
    const result = await callAction(EVENTS.buy, [shop.id, model, color], {
      fallback: "SHOP_ERR_GONE",
      timeout: 15_000,
    });
    if (!result) return { ok: false };
    page.close();
    notify(
      Locale(
        "SHOP_BOUGHT",
        typeof result.plate === "string" ? result.plate : "",
      ),
      "success",
    );
    return { ok: true };
  },
);
on("onResourceStop", (resource: string) => {
  if (resource === ResourceName && showroom.shop) page.close();
});
