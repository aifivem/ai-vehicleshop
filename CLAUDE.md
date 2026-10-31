# ai-vehicleshop

Vehicle shops: a catalog (model, price, category) and shops that sell some categories, with a preview vehicle under a camera, colour swatches and delivery outside. Depends on ai-core (money, prompts, admin panel) and ai-vehicles (creating and spawning the bought vehicle).

## Decisions

- The preview is a local, frozen vehicle at the shop's preview point with a lib `ScriptCamera`; nothing networked exists until the server delivers a bought vehicle.
- Buying: the server checks the shop, distance, access (the shop's lib access fields `jobs` / `gangs` / `onDuty`, `online.allows`) and catalog entry (a by-model index kept per edited catalog record), takes the price from the panel's accounts in order (`settings.accounts`, default bank then cash), creates the vehicle in ai-vehicles (owned by the character, state out) and spawns it at the delivery point with the picked colour as ai-vehicles' spawn `setup` (`{ colors }`), which ai-vehicles keeps until the first parking stores full props, so a vehicle never parked keeps its colour. When ai-vehicles cannot create the vehicle the price goes back to the account it came from (`SHOP_ERR_FAILED`).
- Shop blip looks (any shop, motorcycle-only shop) are panel settings; `settings` is `sync: "all"`.
- Shop points come from `RecordObjects`: an edited shop rebuilds only its point, a blip setting change rebuilds every shop. A locked shop shows (point and blip) only to who passes its access rule (`allows`); memberships rebuild only the locked shops.
- The showroom camera is a lib `ScriptCamera` (500 ms ease in, 400 ms out).
- Colours are eight GTA colour indexes (`COLORS`); no mods or test drive.
- The screen keeps its list in component state (one snapshot from the catalog the client mirrors).

## Contracts

- Callback: `resource/common/shop.ts`. Server export `GetCatalogPrice(model)` (a model's catalog price or null; ai-vehiclesales' dealer buy-back). Panel files `data/settings.json`, `data/catalog.json`, `data/shops.json` (`sync: "all"`).

## Entry points

- Server: buying `resource/server/index.ts`; panel `server/schema.ts`.
- Client: showroom camera and preview, shop points (lib `Points`, shown on foot only) `resource/client/index.ts`.
- NUI (tgiann-vehicleshop look, full screen over the preview camera): `web/src/App.tsx`, detail and cards in `web/src/features/`; browser preview `bun run webdev`.
