// src/components/battle-archives/gauntlet-accordion-item-skeleton.tsx
import { Trophy } from "lucide-react";

export function GauntletAccordionItemSkeleton() {
  return (
    <div className="bg-stone-800/30 border border-stone-700/50 rounded-md px-0 animate-pulse">
      <div className="px-4 py-3">
        <div className="flex items-start gap-3 w-full">
          <div className="flex flex-col items-center mr-2 pt-1">
            <Trophy className="h-7 w-7 text-stone-600" />
            <div className="text-lg font-bold text-stone-700 mt-1 h-5 w-6 bg-stone-700 rounded" />
          </div>
          <div className="text-left w-full space-y-1.5">
            <div className="font-semibold text-lg h-6 w-4/5 bg-stone-700 rounded" />
            <div className="text-sm h-4 w-3/5 bg-stone-700 rounded" />
            <div className="text-xs h-3 w-1/2 bg-stone-700 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
