import type { FileSpec, TabSpec } from "@aicore-fivem/shared";
import { blip } from "./blip";

export const settingsFile: FileSpec = {
  kind: "settings",
  sync: "all",
  sections: {
    accounts: {
      type: "names",
      lookup: "account",
      max: 5,
      itemMax: 32,
      pattern: "^[a-z0-9_]{2,32}$",
    },
    blip: blip,
    bikeBlip: blip,
  },
  defaults: { accounts: ["bank", "cash"] },
};

export const settingsTab: TabSpec = {
  id: "settings",
  file: "settings",
  icon: "sliders",
  label: "ADMIN_TAB_SETTINGS",
  desc: "ADMIN_TAB_SETTINGS_DESC",
  cards: [
    {
      icon: "money-bill-wave",
      title: "ADMIN_C_PAYMENT",
      desc: "ADMIN_C_PAYMENT_DESC",
      fields: [
        {
          widget: "tags",
          lookup: "account",
          path: "accounts",
          label: "ADMIN_F_ACCOUNTS",
          hint: "ADMIN_H_ACCOUNTS",
          placeholder: "ADMIN_P_ACCOUNTS",
        },
      ],
    },
    {
      icon: "map",
      title: "ADMIN_C_BLIPS",
      desc: "ADMIN_C_BLIPS_DESC",
      fields: [
        { widget: "blip", path: "blip", label: "ADMIN_F_SHOP_BLIP" },
        {
          widget: "blip",
          path: "bikeBlip",
          label: "ADMIN_F_BIKE_BLIP",
          hint: "ADMIN_H_BIKE_BLIP",
        },
      ],
    },
  ],
};
