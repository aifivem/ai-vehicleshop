import {
  type AccessRule,
  bool,
  int,
  num,
  type PlacePed,
  readAccess,
  readBlipStyle,
  readPlacePed,
  record,
  str,
  vec4,
  type Vec4,
} from "@aicore-fivem/lib/shared";

/** ai-vehicleshop's contracts and panel content. No natives. */

export const EVENTS = {
  /** Callback: (shopId, model, color) -> { ok, netId } pay, create the owned vehicle and deliver it. */
  buy: "ai-vehicleshop:buy",
} as const;

export interface CatalogEntry {
  model: string;
  /** Empty = the game's name of the model. */
  label: string;
  price: number;
  category: string;
}

export interface Shop {
  /** NPC standing at the place (panel), null for none. */
  ped: PlacePed | null;
  id: string;
  label: string;
  x: number;
  y: number;
  z: number;
  radius: number;
  /** Where the previewed vehicle stands. */
  preview: Vec4;
  /** Where the preview camera stands, facing `heading`. */
  camera: Vec4;
  /** Where a bought vehicle appears. */
  delivery: Vec4;
  categories: string[];
  /** Who may buy here (lib access fields; empty: everyone). */
  access: AccessRule;
  blip: boolean;
}

/** GTA colour indexes the screen offers (black, white, silver, red, blue, green, yellow, orange). */
export const COLORS = [0, 111, 4, 27, 64, 53, 88, 38] as const;

const names = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

/** One catalog record (`panel.records` / `world.records`). */
export function readEntry(
  id: string,
  v: Record<string, unknown>,
): CatalogEntry {
  return {
    model: str(v.model, id, 32).toLowerCase(),
    label: str(v.label, "", 48),
    price: int(v.price, 0, 0, 100_000_000),
    category: str(v.category, "other", 32),
  };
}

/** One shop record (`panel.records` / `world.records`). */
export function readShop(id: string, v: Record<string, unknown>): Shop {
  const c = record(v.coords);
  const at = { x: num(c.x, 0), y: num(c.y, 0), z: num(c.z, 0), heading: 0 };
  return {
    ped: readPlacePed(v.ped),
    id,
    label: str(v.label, id, 48),
    ...at,
    radius: num(v.radius, 5, 1, 30),
    preview: vec4(v.preview, at),
    camera: vec4(v.camera, at),
    delivery: vec4(v.delivery, at),
    categories: names(v.categories),
    access: readAccess(v),
    blip: bool(v.blip, true),
  };
}

export interface BlipStyle {
  sprite: number;
  color: number;
  scale: number;
}

export interface Settings {
  /** Accounts a purchase is paid from, tried in order. */
  accounts: string[];
  /** Map blip of shops; `bikeBlip` for a shop that sells only motorcycles. */
  blip: BlipStyle;
  bikeBlip: BlipStyle;
}

export function readSettings(raw: unknown): Settings {
  const v = record(raw);
  const accounts = names(v.accounts);
  return {
    accounts: accounts.length > 0 ? accounts : ["bank", "cash"],
    blip: readBlipStyle(v.blip, { sprite: 326, color: 3, scale: 0.7 }),
    bikeBlip: readBlipStyle(v.bikeBlip, { sprite: 226, color: 3, scale: 0.7 }),
  };
}

export interface ShopView {
  id: string;
  label: string;
  vehicles: Array<{
    model: string;
    label: string;
    price: number;
    category: string;
  }>;
}

/** Client -> NUI messages. */
export type NuiMessage =
  | {
      action: "open";
      data: {
        texts: Record<string, string>;
        shop: ShopView;
        colors: readonly number[];
      };
    }
  | { action: "close"; data: null };
