import { registerExport } from "@aicore-fivem/lib/server";
import { RecordObjects } from "@aicore-fivem/lib/shared";
import { readEntry, type CatalogEntry } from "common/shop";
import { panel } from "./content";

/** Catalog entries by model, kept per edited entry (the first record of a model wins). */
export const byModel = new Map<string, CatalogEntry>();
new RecordObjects(panel, "catalog", readEntry, (_id, entry) => {
  if (byModel.has(entry.model)) return;
  byModel.set(entry.model, entry);
  return () => byModel.delete(entry.model);
});

/** A model's catalog price (ai-vehiclesales' dealer buy-back); null when the catalog has no such model. */
registerExport("GetCatalogPrice", (model: unknown) => {
  if (typeof model !== "string") return null;
  return byModel.get(model.toLowerCase())?.price ?? null;
});
