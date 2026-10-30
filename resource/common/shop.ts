import {
  bool,
  int,
  num,
  record,
  str,
  vec4,
  type Vec4,
} from "@aicore-fivem/lib/shared"

/** ai-vehicleshop's contracts and panel content. No natives. */

export const EVENTS = {
  /** Callback: (shopId, model, color) -> { ok, netId } pay, create the owned vehicle and deliver it. */
  buy: "ai-vehicleshop:buy",
} as const

export interface CatalogEntry {
  model: string
  /** Empty = the game's name of the model. */
  label: string
  price: number
  category: string
}

export interface Shop {
  id: string
  label: string
  x: number
  y: number
  z: number
  radius: number
  /** Where the previewed vehicle stands. */
  preview: Vec4
  /** Where the preview camera stands, facing `heading`. */
  camera: Vec4
  /** Where a bought vehicle appears. */
  delivery: Vec4
  categories: string[]
  jobs: string[]
  blip: boolean
}

/** GTA colour indexes the screen offers (black, white, silver, red, blue, green, yellow, orange). */
export const COLORS = [0, 111, 4, 27, 64, 53, 88, 38] as const

const names = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []

export function readCatalog(raw: unknown): Map<string, CatalogEntry> {
  const out = new Map<string, CatalogEntry>()
  for (const [id, value] of Object.entries(record(raw))) {
    const v = record(value)
    const model = str(v.model, id, 32).toLowerCase()
    out.set(id, {
      model,
      label: str(v.label, "", 48),
      price: int(v.price, 0, 0, 100_000_000),
      category: str(v.category, "other", 32),
    })
  }
  return out
}

export function readShops(raw: unknown): Map<string, Shop> {
  const out = new Map<string, Shop>()
  for (const [id, value] of Object.entries(record(raw))) {
    const v = record(value)
    const c = record(v.coords)
    const at = { x: num(c.x, 0), y: num(c.y, 0), z: num(c.z, 0), heading: 0 }
    out.set(id, {
      id,
      label: str(v.label, id, 48),
      ...at,
      radius: num(v.radius, 5, 1, 30),
      preview: vec4(v.preview, at),
      camera: vec4(v.camera, at),
      delivery: vec4(v.delivery, at),
      categories: names(v.categories),
      jobs: names(v.jobs),
      blip: bool(v.blip, true),
    })
  }
  return out
}

export interface ShopView {
  id: string
  label: string
  vehicles: Array<{
    model: string
    label: string
    price: number
    category: string
  }>
}

/** Client -> NUI messages. */
export type NuiMessage =
  | {
      action: "open"
      data: {
        texts: Record<string, string>
        shop: ShopView
        colors: readonly number[]
      }
    }
  | { action: "close"; data: null }
