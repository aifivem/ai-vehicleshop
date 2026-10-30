import type { PanelSchema } from "@aicore-fivem/shared";

/** ai-vehicleshop's panel: the vehicle catalog and the shops that sell its categories. */
export const shopSchema: PanelSchema = {
  title: "ADMIN_TITLE",
  icon: "car",
  files: {
    catalog: {
      kind: "records",
      sync: "all",
      labelPath: "model",
      newRecord: { label: "", model: "", price: 10000, category: "sedans" },
      sections: {
        label: { type: "text", min: 0, max: 48 },
        model: { type: "text", min: 2, max: 32, pattern: "^[a-z0-9_]{2,32}$" },
        price: { type: "number", min: 0, max: 100_000_000, integer: true },
        category: { type: "text", min: 2, max: 32, pattern: "^[a-z0-9_]{2,32}$" },
      },
    },
    shops: {
      kind: "records",
      sync: "all",
      labelPath: "label",
      newRecord: {
        label: "",
        coords: { x: 0, y: 0, z: 0 },
        radius: 5,
        preview: { x: 0, y: 0, z: 0, heading: 0 },
        camera: { x: 0, y: 0, z: 0, heading: 0 },
        delivery: { x: 0, y: 0, z: 0, heading: 0 },
        categories: [],
        jobs: [],
        blip: true,
      },
      sections: {
        label: { type: "text", min: 1, max: 48 },
        coords: { type: "vec3" },
        radius: { type: "number", min: 1, max: 30 },
        preview: { type: "vec4" },
        camera: { type: "vec4" },
        delivery: { type: "vec4" },
        categories: { type: "names", max: 30, itemMax: 32, pattern: "^[a-z0-9_]{2,32}$" },
        jobs: { type: "names", max: 20, itemMax: 32, pattern: "^[a-z0-9_]{2,32}$" },
        blip: { type: "bool" },
      },
    },
  },
  tabs: [
    {
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
            { widget: "text", path: "model", label: "ADMIN_F_MODEL", hint: "ADMIN_H_MODEL", placeholder: "ADMIN_P_MODEL" },
            { widget: "text", path: "label", label: "ADMIN_F_LABEL", hint: "ADMIN_H_LABEL", placeholder: "ADMIN_P_LABEL" },
            { widget: "number", path: "price", label: "ADMIN_F_PRICE", min: 0, max: 100_000_000, step: 1000, unit: "$" },
            { widget: "text", path: "category", label: "ADMIN_F_CATEGORY", hint: "ADMIN_H_CATEGORY", placeholder: "ADMIN_P_CATEGORY" },
          ],
        },
      ],
    },
    {
      id: "shops",
      file: "shops",
      icon: "store",
      label: "ADMIN_TAB_SHOPS",
      desc: "ADMIN_TAB_SHOPS_DESC",
      createLabel: "ADMIN_NEW_SHOP",
      deleteLabel: "ADMIN_DELETE_SHOP",
      cards: [
        {
          icon: "store",
          title: "ADMIN_C_SHOP",
          desc: "ADMIN_C_SHOP_DESC",
          fields: [
            { widget: "text", path: "label", label: "ADMIN_F_SHOP_LABEL", placeholder: "ADMIN_P_SHOP_LABEL" },
            { widget: "point", path: "coords", label: "ADMIN_F_COORDS", hint: "ADMIN_H_COORDS", ground: true },
            { widget: "number", path: "radius", label: "ADMIN_F_RADIUS", min: 1, max: 30, unit: "m" },
            { widget: "tags", path: "categories", label: "ADMIN_F_CATEGORIES", hint: "ADMIN_H_CATEGORIES", placeholder: "ADMIN_P_CATEGORY" },
            { widget: "tags", path: "jobs", label: "ADMIN_F_JOBS", hint: "ADMIN_H_JOBS", placeholder: "ADMIN_P_JOBS" },
            { widget: "switch", path: "blip", label: "ADMIN_F_BLIP" },
          ],
        },
        {
          icon: "camera",
          title: "ADMIN_C_SHOWROOM",
          desc: "ADMIN_C_SHOWROOM_DESC",
          fields: [
            { widget: "point", path: "preview", label: "ADMIN_F_PREVIEW", hint: "ADMIN_H_PREVIEW", heading: true, ground: true },
            { widget: "point", path: "camera", label: "ADMIN_F_CAMERA", hint: "ADMIN_H_CAMERA", heading: true, from: "camera" },
            { widget: "point", path: "delivery", label: "ADMIN_F_DELIVERY", hint: "ADMIN_H_DELIVERY", heading: true, ground: true },
          ],
        },
      ],
    },
  ],
};
