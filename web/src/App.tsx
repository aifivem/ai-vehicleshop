import { Fragment, useEffect, useMemo, useState } from "react";
import { fetchNui, useNuiEvent } from "fivem-nui-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCarSide, faDoorOpen, faXmark } from "@fortawesome/free-solid-svg-icons";
import type { NuiMessage } from "../../resource/common/shop";
import { Tabs, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Hint, TooltipProvider } from "./components/ui/tooltip";
import { VirtualList } from "./components/VirtualList";
import { MOCK_OPEN } from "./dev/mock";
import { setTexts, useLang } from "./lib/lang";
import { categoryIcon } from "./features/categoryIcon";
import { Detail } from "./features/Detail";
import { VehicleCard } from "./features/VehicleCard";

type OpenData = Extract<NuiMessage, { action: "open" }>["data"];
const OPEN_MOCK = { mockData: MOCK_OPEN, mockDelay: 100 };
const OK = { mockData: { ok: true } };
const close = () => void fetchNui("close", undefined, OK);

/** The showroom over the preview camera (tgiann-vehicleshop look): title, category bar, ESC close; detail left; vehicle strip below. */
export function App() {
  const t = useLang();
  const [data, setData] = useState<OpenData | null>(null);
  const [category, setCategory] = useState("");
  const [model, setModel] = useState<string | null>(null);
  const [color, setColor] = useState(0);
  const [busy, setBusy] = useState(false);

  useNuiEvent<OpenData>(
    "open",
    (d) => {
      setTexts(d.texts);
      setData(d);
      setCategory(d.shop.vehicles[0]?.category ?? "");
      setModel(null);
    },
    OPEN_MOCK,
  );
  useNuiEvent("close", () => setData(null));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && data && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [data]);

  const categories = useMemo(() => [...new Set(data?.shop.vehicles.map((v) => v.category) ?? [])], [data]);
  const list = useMemo(() => data?.shop.vehicles.filter((v) => v.category === category) ?? [], [data, category]);
  if (!data) return null;
  const selected = data.shop.vehicles.find((v) => v.model === model);

  const pick = (m: string) => {
    setModel(m);
    void fetchNui("preview", { model: m, color }, OK);
  };
  const paint = (c: number) => {
    setColor(c);
    void fetchNui("color", { color: c }, OK);
  };
  const buy = async () => {
    if (!selected) return;
    setBusy(true);
    await fetchNui("buy", { model: selected.model, color }, OK).catch(() => null);
    setBusy(false);
  };

  return (
    <TooltipProvider delayDuration={300} skipDelayDuration={0}>
      <div className="fixed inset-0 animate-fade">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0.15)_30%,rgba(0,0,0,0.85))]" />
        <div className="relative flex h-full flex-col justify-between p-[2vh]">
          <div className="grid grid-cols-[30%_minmax(0,1fr)_30%] items-start">
            <div className="flex min-w-0 flex-col gap-[0.6vh]">
              <h1 className="font-display text-[4.4vh] leading-none font-extrabold tracking-[-0.01em] uppercase">{t("UI_SHOWROOM")}</h1>
              <p className="truncate text-[1.8vh] text-text-2">{data.shop.label}</p>
            </div>
            <Tabs value={category} onValueChange={setCategory} className="flex justify-center">
              {categories.length > 1 && (
                <TabsList>
                  {categories.map((c, i) => (
                    <Fragment key={c}>
                      {i > 0 && <FontAwesomeIcon icon={faXmark} aria-hidden className="text-[1.2vh] text-white/30" />}
                      <Hint label={t(`CATEGORY_${c.toUpperCase()}`)}>
                        <TabsTrigger value={c} aria-label={t(`CATEGORY_${c.toUpperCase()}`)}>
                          <FontAwesomeIcon icon={categoryIcon(c)} />
                        </TabsTrigger>
                      </Hint>
                    </Fragment>
                  ))}
                </TabsList>
              )}
            </Tabs>
            <button type="button" onClick={close} className="group flex items-center gap-[1vh] justify-self-end">
              <span className="text-[1.4vh] font-extrabold text-text-2 transition-colors duration-150 group-hover:text-white">{t("UI_ESC_CLOSE")}</span>
              <span className="flex size-[4.4vh] items-center justify-center rounded-full bg-black/60 text-[1.8vh] text-text-3 transition-colors duration-150 group-hover:bg-[#101010B3] group-hover:text-white">
                <FontAwesomeIcon icon={faDoorOpen} />
              </span>
            </button>
          </div>
          <div className="flex min-h-0">
            {selected && (
              <Detail key={selected.model} vehicle={selected} colors={data.colors} color={color} busy={busy} onColor={paint} onBuy={() => void buy()} />
            )}
          </div>
          <VirtualList
            horizontal
            className="h-[15vh] shrink-0 pb-[0.6vh]"
            items={list}
            estimateSize={36}
            gap={1.2}
            getItemKey={(v) => v.model}
            empty={
              <div className="flex h-full flex-col items-center justify-center gap-[1vh] rounded-[1.4vh] border border-white/10 bg-white/2 text-text-3">
                <FontAwesomeIcon icon={faCarSide} className="text-[2.4vh]" />
                <span className="text-[1.5vh]">{t("UI_EMPTY")}</span>
              </div>
            }
            renderItem={(v) => (
              <div className="h-full w-[36vh]">
                <VehicleCard vehicle={v} active={v.model === model} onClick={() => pick(v.model)} />
              </div>
            )}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
