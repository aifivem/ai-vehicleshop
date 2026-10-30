# ai-vehicleshop

Vehicle shops: a catalog (model, price, category) and shops that sell some categories, with a preview vehicle under a camera, colour swatches and delivery outside. Depends on ai-core (money, prompts, admin panel) and ai-vehicles (creating and spawning the bought vehicle).

## Decisions

- The preview is a local, frozen vehicle at the shop's preview point with a scripted camera; nothing networked exists until the server delivers a bought vehicle.
- Buying: the server checks the shop, distance, job and catalog entry, takes the price from the panel's accounts in order (`settings.accounts`, default bank then cash), creates the vehicle in ai-vehicles (owned by the character, state out) and spawns it at the delivery point with the picked colour; the owner's client saves the full props on the first parking. When ai-vehicles cannot create the vehicle the price goes back to the account it came from (`SHOP_ERR_FAILED`).
- Known gap: the picked colour lives only on the entity until the first parking (ai-vehicles' `SpawnVehicle` takes no lib `setup`, and `CreateVehicle` wants full props); a vehicle never parked comes out of storage in the model's default colour.
- Shop blip looks (any shop, motorcycle-only shop) are panel settings; `settings` is `sync: "all"`.
- Colours are eight GTA colour indexes (`COLORS`); no mods or test drive.
- The screen keeps its list in component state (one snapshot from the catalog the client mirrors).

## Contracts

- Callback: `resource/common/shop.ts`. Panel files `data/settings.json`, `data/catalog.json`, `data/shops.json` (`sync: "all"`).

## Entry points

- Server: buying `resource/server/index.ts`; panel `server/schema.ts`.
- Client: showroom camera and preview, shop points (lib `Points`, shown on foot only) `resource/client/index.ts`.
- NUI (tgiann-vehicleshop look, full screen over the preview camera): `web/src/App.tsx`, detail and cards in `web/src/features/`; browser preview `bun run webdev`.
