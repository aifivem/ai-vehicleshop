import type { FileSpec, TabSpec } from "@aicore-fivem/shared";

export const catalogFile: FileSpec = {
  kind: "records",
  sync: "all",
  labelPath: "model",
  newRecord: { label: "", model: "", price: 10000, category: "sedans" },
  sections: {
    label: { type: "text", min: 0, max: 48 },
    model: { type: "text", min: 2, max: 32, pattern: "^[a-z0-9_]{2,32}$" },
    price: { type: "number", min: 0, max: 100_000_000, integer: true },
    category: {
      type: "text",
      min: 2,
      max: 32,
      pattern: "^[a-z0-9_]{2,32}$",
    },
  },
};

export const catalogTab: TabSpec = {
  id: "catalog",
  file: "catalog",
  icon: "car",
  label: "ADMIN_TAB_CATALOG",
  desc: "ADMIN_TAB_CATALOG_DESC",
  listSub: "category",
  createLabel: "ADMIN_NEW_VEHICLE",
  deleteLabel: "ADMIN_DELETE_VEHICLE",
  deleteDesc: "ADMIN_DELETE_VEHICLE_DESC",
  cards: [
    {
      icon: "car",
      title: "ADMIN_C_VEHICLE",
      desc: "ADMIN_C_VEHICLE_DESC",
      fields: [
        {
          widget: "text",
          path: "model",
          label: "ADMIN_F_MODEL",
          hint: "ADMIN_H_MODEL",
          placeholder: "ADMIN_P_MODEL",
        },
        {
          widget: "text",
          path: "label",
          label: "ADMIN_F_LABEL",
          hint: "ADMIN_H_LABEL",
          placeholder: "ADMIN_P_LABEL",
        },
        {
          widget: "number",
          path: "price",
          label: "ADMIN_F_PRICE",
          min: 0,
          max: 100_000_000,
          step: 1000,
          unit: "$",
        },
        {
          widget: "text",
          path: "category",
          label: "ADMIN_F_CATEGORY",
          hint: "ADMIN_H_CATEGORY",
          placeholder: "ADMIN_P_CATEGORY",
        },
      ],
    },
  ],
};
