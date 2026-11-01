import {
  ACCESS_FIELDS,
  accessFields,
  PLACE_PED_SPEC,
  placePedFields,
} from "@aicore-fivem/lib/shared";
import type { FileSpec, TabSpec } from "@aicore-fivem/shared";
import { blip } from "./blip";

export const shopsFile: FileSpec = {
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
    gangs: [],
    blip: true,
  },
  sections: {
    ped: PLACE_PED_SPEC,
    label: { type: "text", min: 1, max: 48 },
    coords: { type: "vec3" },
    radius: { type: "number", min: 1, max: 30 },
    preview: { type: "vec4" },
    camera: { type: "vec4" },
    delivery: { type: "vec4" },
    categories: {
      type: "names",
      max: 30,
      itemMax: 32,
      pattern: "^[a-z0-9_]{2,32}$",
    },
    ...ACCESS_FIELDS,
    blip: { type: "bool" },
  },
};

export const shopsTab: TabSpec = {
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
        {
          widget: "text",
          path: "label",
          suggest: { from: "coords" },
          label: "ADMIN_F_SHOP_LABEL",
          placeholder: "ADMIN_P_SHOP_LABEL",
        },
        {
          widget: "point",
          path: "coords",
          label: "ADMIN_F_COORDS",
          hint: "ADMIN_H_COORDS",
          ground: true,
        },
        {
          widget: "number",
          path: "radius",
          label: "ADMIN_F_RADIUS",
          min: 1,
          max: 30,
          unit: "m",
        },
        {
          widget: "tags",
          path: "categories",
          label: "ADMIN_F_CATEGORIES",
          hint: "ADMIN_H_CATEGORIES",
          placeholder: "ADMIN_P_CATEGORY",
        },
        ...accessFields(),
        { widget: "switch", path: "blip", label: "ADMIN_F_BLIP" },
      ],
    },
    {
      icon: "camera",
      title: "ADMIN_C_SHOWROOM",
      desc: "ADMIN_C_SHOWROOM_DESC",
      fields: [
        {
          widget: "point",
          path: "preview",
          label: "ADMIN_F_PREVIEW",
          hint: "ADMIN_H_PREVIEW",
          heading: true,
          ground: true,
        },
        {
          widget: "point",
          path: "camera",
          label: "ADMIN_F_CAMERA",
          hint: "ADMIN_H_CAMERA",
          heading: true,
          from: "camera",
        },
        {
          widget: "point",
          path: "delivery",
          label: "ADMIN_F_DELIVERY",
          hint: "ADMIN_H_DELIVERY",
          heading: true,
          ground: true,
        },
      ],
    },
    {
      icon: "user",
      title: "ADMIN_C_PED",
      desc: "ADMIN_C_PED_DESC",
      fields: placePedFields(),
    },
  ],
};
