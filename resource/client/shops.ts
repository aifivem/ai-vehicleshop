import {
  allows,
  cache,
  onCache,
  onMembershipChange,
  Points,
} from "@aicore-fivem/lib/client";
import { isPublic, RecordObjects } from "@aicore-fivem/lib/shared";
import { Locale } from "common";
import { readShop } from "common/shop";
import { content, world } from "./content";
import { showroom } from "./showroom";

/**
 * Shop points with their blips: an edited shop rebuilds only its own point, the blip settings every shop. A shop locked
 * to jobs or gangs shows (and has a blip) only for who passes its access rule.
 */
const points = new Points();
const shops = new RecordObjects(world, "shops", readShop, (id, shop) => {
  const { blip, bikeBlip } = content.settings.value;
  points.add(`vshop:${id}`, {
    ped: shop.ped ?? undefined,
    coords: { x: shop.x, y: shop.y, z: shop.z },
    label: Locale("SHOP_PROMPT", shop.label),
    icon: "car",
    radius: shop.radius,
    blip:
      shop.blip && allows(shop.access)
        ? {
            ...(shop.categories.includes("motorcycles") &&
            shop.categories.length === 1
              ? bikeBlip
              : blip),
            label: shop.label,
          }
        : undefined,
    canShow: () =>
      cache.vehicle === false && !showroom.shop && allows(shop.access),
    onPressed: () => showroom.open(shop),
  });
  return () => points.remove(`vshop:${id}`);
});

world.onChange("settings", () => shops.rebuildAll());
// Blips follow memberships: only the locked shops are built again.
onMembershipChange(() => {
  for (const [id, shop] of shops.records)
    if (!isPublic(shop.access)) shops.rebuild(id);
});
onCache("vehicle", () => points.refresh());
