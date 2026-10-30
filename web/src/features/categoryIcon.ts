import {
  faCar,
  faCarSide,
  faFire,
  faFlagCheckered,
  faGaugeHigh,
  faMotorcycle,
  faMountain,
  faTableCellsLarge,
  faTruckPickup,
  faVanShuttle,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";

const ICONS: Record<string, IconDefinition> = {
  compacts: faCarSide,
  sedans: faCar,
  suvs: faTruckPickup,
  sports: faFlagCheckered,
  super: faGaugeHigh,
  muscle: faFire,
  offroad: faMountain,
  vans: faVanShuttle,
  motorcycles: faMotorcycle,
};

/** Glyph of a catalog category (panel categories outside the defaults get the grid glyph). */
export const categoryIcon = (category: string): IconDefinition => ICONS[category] ?? faTableCellsLarge;
