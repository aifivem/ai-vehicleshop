import { useEffect, useMemo, useState } from "react"
import { fetchNui, useNuiEvent } from "fivem-nui-react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faArrowPointer,
  faCarSide,
  faDoorOpen,
} from "@fortawesome/free-solid-svg-icons"
import type { NuiMessage } from "../../resource/common/shop"
import { Tabs, TabsList, TabsTrigger } from "./components/ui/tabs"
import { VirtualList } from "./components/VirtualList"
import { MOCK_OPEN } from "./dev/mock"
import { setTexts, useLang } from "./lib/lang"
import { categoryIcon } from "./features/categoryIcon"
import { Detail } from "./features/Detail"
import { VehicleCard } from "./features/VehicleCard"

type OpenData = Extract<NuiMessage, { action: "open" }>["data"]
const OPEN_MOCK = { mockData: MOCK_OPEN, mockDelay: 100 }
const OK = { mockData: { ok: true } }
const close = () => void fetchNui("close", undefined, OK)

/** The showroom over the preview camera (tgiann-vehicleshop look): title and ESC close; detail left; category pills and the vehicle strip below. */
export function App() {
  const t = useLang()
  const [data, setData] = useState<OpenData | null>(null)
  const [category, setCategory] = useState("")
  const [model, setModel] = useState<string | null>(null)
  const [color, setColor] = useState(0)
  const [busy, setBusy] = useState(false)

  useNuiEvent<OpenData>(
    "open",
    (d) => {
      setTexts(d.texts)
      setData(d)
      setCategory(d.shop.vehicles[0]?.category ?? "")
      setModel(null)
    },
    OPEN_MOCK
  )
  useNuiEvent("close", () => setData(null))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && data && close()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [data])

  /** Categories in catalog order with how many vehicles each has. */
  const categories = useMemo(() => {
    const counts = new Map<string, number>()
    for (const v of data?.shop.vehicles ?? [])
      counts.set(v.category, (counts.get(v.category) ?? 0) + 1)
    return [...counts]
  }, [data])
  const list = useMemo(
    () => data?.shop.vehicles.filter((v) => v.category === category) ?? [],
    [data, category]
  )
  if (!data) return null
  const selected = data.shop.vehicles.find((v) => v.model === model)

  const pick = (m: string) => {
    setModel(m)
    void fetchNui("preview", { model: m, color }, OK)
  }
  const paint = (c: number) => {
    setColor(c)
    void fetchNui("color", { color: c }, OK)
  }
  const buy = async () => {
    if (!selected) return
    setBusy(true)
    await fetchNui("buy", { model: selected.model, color }, OK).catch(
      () => null
    )
    setBusy(false)
  }

  return (
    <div className="fixed inset-0 animate-fade">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0.15)_30%,rgba(0,0,0,0.85))]"
      />
      <div className="relative flex h-full flex-col justify-between p-[2vh]">
        <div className="flex items-start justify-between gap-[4vh]">
          <div className="flex min-w-0 flex-col gap-[0.6vh]">
            <h1 className="font-display text-[4.4vh] leading-none font-extrabold tracking-[-0.01em] uppercase">
              {t("UI_SHOWROOM")}
            </h1>
            <p className="truncate text-[1.8vh] text-text-2">
              {data.shop.label}
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            className="group flex shrink-0 items-center gap-[1vh]"
          >
            <span className="text-[1.4vh] font-extrabold text-text-2 transition-colors duration-150 group-hover:text-white">
              {t("UI_ESC_CLOSE")}
            </span>
            <span className="flex size-[4.4vh] items-center justify-center rounded-full bg-black/60 text-[1.8vh] text-text-3 transition-colors duration-150 group-hover:bg-[#101010B3] group-hover:text-white">
              <FontAwesomeIcon icon={faDoorOpen} />
            </span>
          </button>
        </div>
        <div className="flex min-h-0">
          {selected ? (
            <Detail
              key={selected.model}
              vehicle={selected}
              colors={data.colors}
              color={color}
              busy={busy}
              onColor={paint}
              onBuy={() => void buy()}
            />
          ) : (
            list.length > 0 && (
              <div className="flex w-[38vh] animate-rise items-center gap-[1.2vh] rounded-[1.4vh] border border-white/10 bg-black/50 p-[1.4vh]">
                <span className="flex size-[3.6vh] shrink-0 items-center justify-center rounded-full bg-tgi-green-10 text-[1.5vh] text-tgi-green">
                  <FontAwesomeIcon icon={faArrowPointer} />
                </span>
                <span className="flex min-w-0 flex-col gap-[0.3vh]">
                  <span className="text-[1.5vh] leading-[1.3] font-semibold">
                    {t("UI_PICK_TITLE")}
                  </span>
                  <span className="text-[1.3vh] leading-[1.4] text-text-3">
                    {t("UI_PICK_HINT")}
                  </span>
                </span>
              </div>
            )
          )}
        </div>
        <div className="flex shrink-0 flex-col gap-[1.2vh]">
          {categories.length > 1 && (
            <Tabs value={category} onValueChange={setCategory}>
              <TabsList className="flex-wrap">
                {categories.map(([c, count]) => (
                  <TabsTrigger key={c} value={c}>
                    <FontAwesomeIcon
                      icon={categoryIcon(c)}
                      className="text-[1.4vh] transition-colors duration-150 group-data-[state=active]:text-tgi-green"
                    />
                    {t(`CATEGORY_${c.toUpperCase()}`)}
                    <span className="flex h-[2.4vh] min-w-[2.4vh] items-center justify-center rounded-full bg-white/8 px-[0.6vh] text-[1.1vh] font-bold text-text-3 tabular-nums group-data-[state=active]:bg-tgi-green group-data-[state=active]:text-tgi-green-text">
                      {count}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}
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
                <VehicleCard
                  vehicle={v}
                  active={v.model === model}
                  onClick={() => pick(v.model)}
                />
              </div>
            )}
          />
        </div>
      </div>
    </div>
  )
}
