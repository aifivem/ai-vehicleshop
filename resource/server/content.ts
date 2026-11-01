import { AdminPanel } from "@aicore-fivem/lib/server";
import { readSettings, readShop } from "common/shop";
import { shopSchema } from "./schema";

export const panel = new AdminPanel(shopSchema);
export const content = {
  settings: panel.view("settings", readSettings),
  shops: panel.records("shops", readShop),
};
