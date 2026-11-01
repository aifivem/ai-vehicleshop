import {
  callAction,
  loadLocaleTexts,
  notify,
  NuiScreen,
  onStop,
  PreviewVehicle,
  ScriptCamera,
  vehicleLabel,
} from "@aicore-fivem/lib/client";
import { isRecord } from "@aicore-fivem/lib/shared";
import { Locale } from "common";
import { COLORS, EVENTS, type NuiMessage, type Shop } from "common/shop";
import { NUI_LAYER } from "@aicore-fivem/shared";
import { content } from "./content";

// Stacking among NUI pages (`NUI_LAYER`): set at start, not left to load order.
SetNuiZindex(NUI_LAYER.screen);

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
  private readonly preview = new PreviewVehicle();

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
    await this.preview.show(model, this.shop.preview, (vehicle) =>
      SetVehicleColours(vehicle, color, color),
    );
  }

  color(color: number): void {
    const vehicle = this.preview.vehicle;
    if (vehicle) SetVehicleColours(vehicle, color, color);
  }

  /** The page closed: the preview vehicle and the camera go. */
  end(): void {
    this.preview.clear();
    this.camera.stop(400);
    this.shop = null;
  }
}

export const showroom = new Showroom();

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
onStop(() => {
  if (showroom.shop) page.close();
});
