import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ShopView } from "../../../resource/common/shop";
import { useLang } from "../lib/lang";
import { cn } from "../lib/utils";
import { categoryIcon } from "./categoryIcon";

/** One vehicle of the bottom strip (tgiann-vehicleshop card): glyph block, name, class chip, green price. */
export function VehicleCard({ vehicle, active, onClick }: { vehicle: ShopView["vehicles"][number]; active: boolean; onClick: () => void }) {
  const t = useLang();
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "grid h-full w-full grid-cols-[11vh_minmax(0,1fr)] gap-[1.6vh] rounded-[1.4vh] border p-[1.6vh] text-left transition-colors duration-150",
        active ? "border-tgi-green bg-white/6" : "border-white/10 bg-white/2 hover:bg-white/6",
      )}
    >
      <span className="flex items-center justify-center border-r border-white/10 pr-[1.6vh]">
        <FontAwesomeIcon icon={categoryIcon(vehicle.category)} className={cn("text-[4.4vh] transition-colors duration-150", active ? "text-tgi-green" : "text-text-4")} />
      </span>
      <span className="flex min-w-0 flex-col justify-between">
        <span className="flex flex-col gap-[0.7vh]">
          <span className="truncate text-[1.6vh] leading-[1.3] font-medium text-white">{vehicle.label}</span>
          <span className="w-fit rounded-full border border-white/10 px-[1.2vh] py-[0.6vh] text-[1.2vh] leading-none font-medium text-warn uppercase">
            {t(`CATEGORY_${vehicle.category.toUpperCase()}`)}
          </span>
        </span>
        <span className="text-[1.5vh] font-semibold text-tgi-green tabular-nums">{t("UI_PRICE", vehicle.price.toLocaleString("en-US"))}</span>
      </span>
    </button>
  );
}
