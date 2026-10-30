import en from "../../../locales/en.json"
import catalog from "../../../data/catalog.json"
import shops from "../../../data/shops.json"

/** Browser preview only (`bun run webdev`): Premium Deluxe Motorsport with the default catalog. */
const shop = shops.pdm
export const MOCK_OPEN = {
  texts: en,
  colors: [0, 111, 4, 27, 64, 53, 88, 38],
  shop: {
    id: "pdm",
    label: shop.label,
    vehicles: Object.values(catalog)
      .filter((e) => shop.categories.includes(e.category))
      .map((e) => ({
        model: e.model,
        label: e.model.charAt(0).toUpperCase() + e.model.slice(1),
        price: e.price,
        category: e.category,
      })),
  },
}
