import {
  AdminWorld,
  cache,
  hud,
  loadLocaleTexts,
  notify,
  onCache,
  Points,
  requestModel,
  triggerServerCallback,
} from "@aicore-fivem/lib/client";
import { Locale } from "common";
import {
  COLORS,
  EVENTS,
  readCatalog,
  readShops,
  type NuiMessage,
  type Shop,
} from "common/shop";

const world = new AdminWorld(["catalog", "shops"]);
const texts = loadLocaleTexts();
const send = (m: NuiMessage): void => SendNUIMessage(m);

/**
 * The showroom: a local preview vehicle at the shop's preview point under a scripted camera while the screen is open.
 * Local entities only (nothing networked until the server delivers a bought vehicle).
 */
class Showroom {
  shop: Shop | null = null;
  private camera = 0;
  private preview = 0;
  private token = 0;

  open(shop: Shop): void {
    this.shop = shop;
    const c = shop.camera;
    this.camera = CreateCamWithParams(
      "DEFAULT_SCRIPTED_CAMERA",
      c.x,
      c.y,
      c.z,
      -8,
      0,
      c.heading,
      50,
      false,
      0,
    );
    SetCamActive(this.camera, true);
    RenderScriptCams(true, true, 500, true, true);
    const catalog = readCatalog(world.get("catalog"));
    const vehicles = [...catalog.values()]
      .filter((e) => shop.categories.includes(e.category))
      .map((e) => ({
        model: e.model,
        label:
          e.label ||
          GetLabelText(GetDisplayNameFromVehicleModel(GetHashKey(e.model))),
        price: e.price,
        category: e.category,
      }));
    SetNuiFocus(true, true);
    hud.hide("vehicleshop");
    send({
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

  close(): void {
    this.token++;
    this.clearPreview();
    if (this.camera) {
      RenderScriptCams(false, true, 400, true, true);
      DestroyCam(this.camera, false);
      this.camera = 0;
    }
    this.shop = null;
    SetNuiFocus(false, false);
    hud.show("vehicleshop");
    send({ action: "close", data: null });
  }

  private clearPreview(): void {
    if (this.preview) DeleteEntity(this.preview);
    this.preview = 0;
  }
}

const showroom = new Showroom();

/** Shop points with their blips, rebuilt on panel changes. */
const points = new Points();
function rebuild(): void {
  points.clear();
  for (const shop of readShops(world.get("shops")).values())
    points.add(`vshop:${shop.id}`, {
      ped: shop.ped ?? undefined,
      coords: { x: shop.x, y: shop.y, z: shop.z },
      label: Locale("SHOP_PROMPT", shop.label),
      icon: "car",
      radius: shop.radius,
      blip: shop.blip
        ? {
            sprite:
              shop.categories.includes("motorcycles") &&
              shop.categories.length === 1
                ? 226
                : 326,
            color: 3,
            scale: 0.7,
            label: shop.label,
          }
        : undefined,
      canShow: () => cache.vehicle === false && !showroom.shop,
      onPressed: () => showroom.open(shop),
    });
}

rebuild();
world.onChange("shops", rebuild);
onCache("vehicle", () => points.refresh());

type Reply = (r: unknown) => void;
const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;
RegisterNuiCallback("preview", (d: unknown, cb: Reply) => {
  if (isObj(d) && typeof d.model === "string" && typeof d.color === "number")
    void showroom.show(d.model, d.color);
  cb({ ok: true });
});
RegisterNuiCallback("color", (d: unknown, cb: Reply) => {
  if (isObj(d) && typeof d.color === "number") showroom.color(d.color);
  cb({ ok: true });
});
RegisterNuiCallback("close", (_d: unknown, cb: Reply) => {
  showroom.close();
  cb({ ok: true });
});
RegisterNuiCallback("buy", (d: unknown, cb: Reply) => {
  const shop = showroom.shop;
  if (
    !shop ||
    !isObj(d) ||
    typeof d.model !== "string" ||
    typeof d.color !== "number"
  )
    return cb({ ok: false });
  void triggerServerCallback(EVENTS.buy, [shop.id, d.model, d.color], 15_000)
    .catch(() => null)
    .then((result) => {
      const ok = isObj(result) && result.ok === true;
      cb({ ok });
      if (ok) {
        showroom.close();
        notify(
          Locale(
            "SHOP_BOUGHT",
            isObj(result) && typeof result.plate === "string"
              ? result.plate
              : "",
          ),
          "success",
        );
      } else {
        const error =
          isObj(result) && typeof result.error === "string"
            ? result.error
            : "SHOP_ERR_GONE";
        notify(texts[error] ?? error, "error");
      }
    });
});
on("onResourceStop", (resource: string) => {
  if (resource === GetCurrentResourceName() && showroom.shop) showroom.close();
});
