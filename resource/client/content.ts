import { AdminWorld } from "@aicore-fivem/lib/client";
import { readEntry, readSettings } from "common/shop";

export const world = new AdminWorld(["settings", "catalog", "shops"]);
export const content = {
  settings: world.view("settings", readSettings),
  catalog: world.records("catalog", readEntry),
};
