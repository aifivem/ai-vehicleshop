import type { PanelSchema } from "@aicore-fivem/shared";
import { catalogFile, catalogTab } from "./catalog";
import { shopsFile, shopsTab } from "./shops";
import { settingsFile, settingsTab } from "./settings";

/** ai-vehicleshop's panel: the vehicle catalog, the shops that sell its categories, payment and map look. */
export const shopSchema: PanelSchema = {
  title: "ADMIN_TITLE",
  icon: "car",
  files: {
    settings: settingsFile,
    catalog: catalogFile,
    shops: shopsFile,
  },
  tabs: [catalogTab, shopsTab, settingsTab],
};
