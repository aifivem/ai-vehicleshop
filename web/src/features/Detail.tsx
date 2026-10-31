import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping, faPalette } from "@fortawesome/free-solid-svg-icons";
import type { ShopView } from "../../../resource/common/shop";
import { Button } from "../components/ui/button";
import { useLang } from "../lib/lang";
import { cn } from "../lib/utils";
import { groupDigits } from "@aicore-fivem/lib/shared";

/** Swatch colours for the GTA colour indexes in `COLORS` (same order). */
const SWATCH = [
  "#0d0d0d",
  "#f2f2f2",
  "#9aa0a6",
  "#c1121f",
  "#1d4ed8",
  "#15803d",
  "#facc15",
  "#f97316",
];

interface Props {
  vehicle: ShopView["vehicles"][number];
  colors: readonly number[];
  color: number;
  busy: boolean;
  onColor: (color: number) => void;
  onBuy: () => void;
}

/** Left column of the showroom (tgiann-vehicleshop detail): name, price and class, paint swatches, the one Buy button. */
export function Detail({
  vehicle,
  colors,
  color,
  busy,
  onColor,
  onBuy,
}: Props) {
  const t = useLang();
  return (
    <div className="flex w-[38vh] animate-rise flex-col gap-[2vh]">
      <div className="flex flex-col gap-[0.8vh]">
        <span className="text-[2.4vh] leading-[1.2] font-extrabold text-white uppercase">
          {vehicle.label}
        </span>
        <div className="flex flex-wrap items-center gap-[1vh]">
          <span className="text-[1.8vh] font-bold text-tgi-green tabular-nums">
            {t("UI_PRICE", groupDigits(vehicle.price))}
          </span>
          <span className="rounded-full border border-white/10 px-[1.4vh] py-[0.7vh] text-[1.3vh] leading-none font-medium text-warn uppercase">
            {t(`CATEGORY_${vehicle.category.toUpperCase()}`)}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-[1vh]">
        <div className="flex h-[3.8vh] items-center gap-[0.8vh] rounded-full bg-black/50 px-[1.4vh] text-[1.3vh] font-medium">
          <FontAwesomeIcon
            icon={faPalette}
            className="text-[1.3vh] text-tgi-green"
          />
          {t("UI_COLOR")}
        </div>
        <div
          className="grid grid-cols-8 gap-[0.6vh]"
          role="radiogroup"
          aria-label={t("UI_COLOR")}
        >
          {colors.map((c, i) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={c === color}
              aria-label={t("UI_COLOR")}
              onClick={() => onColor(c)}
              className={cn(
                "h-[3.2vh] rounded-[0.6vh] border-[0.2vh] border-transparent [box-shadow:inset_0_0_0_1px_rgba(255,255,255,0.12)] transition-[border-color,transform] duration-150 hover:border-tgi-green active:[transform:scale(0.94)]",
                c === color && "border-dashed border-tgi-green",
              )}
              style={{ background: SWATCH[i] }}
            />
          ))}
        </div>
      </div>
      <Button variant="primary" className="w-full" busy={busy} onClick={onBuy}>
        {!busy && (
          <FontAwesomeIcon icon={faCartShopping} data-icon="inline-start" />
        )}
        {t("UI_BUY")}
      </Button>
    </div>
  );
}
