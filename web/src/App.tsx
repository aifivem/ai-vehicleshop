import { useEffect, useMemo, useState } from "react";
import { fetchNui, useNuiEvent } from "fivem-nui-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import type { NuiMessage } from "../../resource/common/shop";
import { Button } from "./components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "./components/ui/tabs";
import { VirtualList } from "./components/VirtualList";
import { MOCK_OPEN } from "./dev/mock";
import { setTexts, useLang } from "./lib/lang";
import { cn } from "./lib/utils";

type OpenData = Extract<NuiMessage, { action: "open" }>["data"];
const OPEN_MOCK = { mockData: MOCK_OPEN, mockDelay: 100 };
const OK = { mockData: { ok: true } };
/** Swatch colours for the GTA colour indexes in `COLORS` (same order). */
const SWATCH = ["#0d0d0d", "#f2f2f2", "#9aa0a6", "#c1121f", "#1d4ed8", "#15803d", "#facc15", "#f97316"];

/** The showroom: categories, the vehicle list, colour swatches and the buy button; the game shows the preview. */
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
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && data && void fetchNui("close", undefined, OK);
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
  const buy = async () => {
    if (!selected) return;
    setBusy(true);
    await fetchNui("buy", { model: selected.model, color }, OK).catch(() => null);
    setBusy(false);
  };

  return (
    <div className="fixed inset-y-0 left-0 flex w-[52vh] animate-fade flex-col gap-[1.6vh] p-[3vh]">
      <section className="flex min-h-0 flex-1 flex-col gap-[1.4vh] rounded-[1.2vh] border border-line bg-[rgba(var(--panel-rgb),0.94)] p-[2vh]">
        <header className="flex items-start justify-between">
          <div className="flex flex-col gap-[0.4vh]">
            <span className="text-[1.2vh] uppercase tracking-[0.24em] text-text-3">{t("UI_SHOWROOM")}</span>
            <h1 className="text-[2.2vh] font-semibold leading-none">{data.shop.label}</h1>
          </div>
          <Button variant="icon" aria-label={t("UI_CLOSE")} onClick={() => void fetchNui("close", undefined, OK)}>
            <FontAwesomeIcon icon={faXmark} />
          </Button>
        </header>
        <Tabs value={category} onValueChange={setCategory}>
          <TabsList active={categories.indexOf(category)} count={categories.length}>
            {categories.map((c) => (
              <TabsTrigger key={c} value={c}>
                {t(`CATEGORY_${c.toUpperCase()}`)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <VirtualList
          className="min-h-0 flex-1"
          items={list}
          estimateSize={5.6}
          gap={0.6}
          getItemKey={(v) => v.model}
          empty={<p className="py-[4vh] text-center text-[1.4vh] text-text-3">{t("UI_EMPTY")}</p>}
          renderItem={(v) => (
            <button
              type="button"
              onClick={() => pick(v.model)}
              className={cn(
                "flex h-[5.6vh] w-full items-center justify-between rounded-[0.8vh] border px-[1.4vh] text-left transition-colors duration-150",
                v.model === model ? "border-accent bg-[rgba(var(--accent-rgb),0.08)]" : "border-line bg-bg hover:bg-raised",
              )}
            >
              <span className="truncate text-[1.45vh] font-medium text-text">{v.label}</span>
              <span className="text-[1.35vh] tabular-nums text-text-2">{t("UI_PRICE", v.price.toLocaleString("en-US"))}</span>
            </button>
          )}
        />
      </section>
      {selected && (
        <section className="flex animate-rise flex-col gap-[1.4vh] rounded-[1.2vh] border border-line bg-[rgba(var(--panel-rgb),0.94)] p-[2vh]">
          <div className="flex items-baseline justify-between">
            <span className="text-[1.8vh] font-semibold">{selected.label}</span>
            <span className="text-[1.8vh] font-semibold tabular-nums text-accent">{t("UI_PRICE", selected.price.toLocaleString("en-US"))}</span>
          </div>
          <div className="flex gap-[0.8vh]" role="radiogroup" aria-label={t("UI_COLOR")}>
            {data.colors.map((c, i) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={c === color}
                aria-label={t("UI_COLOR")}
                onClick={() => {
                  setColor(c);
                  void fetchNui("color", { color: c }, OK);
                }}
                className={cn("size-[3.2vh] rounded-full border-2 transition-transform duration-150 active:[transform:scale(0.92)]", c === color ? "border-accent" : "border-line")}
                style={{ background: SWATCH[i] }}
              />
            ))}
          </div>
          <Button variant="filled" busy={busy} onClick={() => void buy()}>
            {t("UI_BUY")}
          </Button>
        </section>
      )}
    </div>
  );
}
