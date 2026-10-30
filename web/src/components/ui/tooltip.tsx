import type { ReactNode } from "react"
import { Tooltip as TooltipPrimitive } from "radix-ui"

/** Radix tooltip in the TGIANN floating surface; the app root wraps everything in `TooltipProvider`. */
export const TooltipProvider = TooltipPrimitive.Provider

export function Hint({
  label,
  side = "bottom",
  children,
}: {
  label: string
  side?: "top" | "bottom" | "left" | "right"
  children: ReactNode
}) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={6}
          className="z-50 max-w-[24vh] rounded-[0.6vh] bg-float px-[0.8vh] py-[0.4vh] text-[1.2vh] text-white/90 [box-shadow:0_0_0_1px_rgba(255,255,255,0.08),0_0.4vh_1.2vh_rgba(0,0,0,0.4)]"
        >
          {label}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}
