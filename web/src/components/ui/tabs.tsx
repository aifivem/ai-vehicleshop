import type { ComponentProps } from "react";
import { Tabs as TabsPrimitive } from "radix-ui";
import { cn } from "../../lib/utils";

/** Radix tabs as TGIANN round icon tabs (vehicleshop category bar): the active one gets a dashed green ring (aria-selected: a Tooltip trigger around it overrides data-state). */
export const Tabs = TabsPrimitive.Root;

export function TabsList({ className, ...props }: ComponentProps<typeof TabsPrimitive.List>) {
  return <TabsPrimitive.List data-slot="tabs-list" className={cn("flex items-center gap-[1vh]", className)} {...props} />;
}

export function TabsTrigger({ className, ...props }: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "flex size-[4.4vh] shrink-0 items-center justify-center rounded-full border-[0.2vh] border-transparent bg-black/60 text-[1.9vh] text-text-3 transition-[border-color,color,transform] duration-150 hover:border-tgi-green hover:text-white active:[transform:scale(0.96)] aria-selected:border-dashed aria-selected:border-tgi-green aria-selected:text-white",
        className,
      )}
      {...props}
    />
  );
}
