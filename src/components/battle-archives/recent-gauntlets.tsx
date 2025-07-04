"use client";

import { Trophy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Accordion } from "@/components/ui/accordion";
import { GauntletAccordionItem } from "@/components/gauntlet/gauntlet-accordion-item";
import {
  useArchivedGauntlets,
  type GauntletChronicle,
} from "@/hooks/use-archived-gauntlets";
import { GauntletAccordionItemSkeleton } from "./gauntlet-accordion-item-skeleton";

// Updated Gauntlet Interface
interface RecentGauntlet {
  id: string;
  idNumber: number;
  name?: string;
  championName?: string;
  participantCount: 4 | 8 | 16 | 32;
  endDate: string;
  status: "Completed" | "In Progress";
  transactionHash?: string;
  prizeAmount?: string;
  entryFee?: string;
}

// Helper to get styling based on participant count
function getGauntletStyleProps(count: 4 | 8 | 16 | 32): {
  color: string; // For Icon and Number
  iconSize: string;
  numberSize: string; // For the participant count number
} {
  switch (count) {
    case 4:
      return {
        color: "text-stone-400",
        iconSize: "h-7 w-7",
        numberSize: "text-2xl font-bold",
      };
    case 8:
      return {
        color: "text-stone-200",
        iconSize: "h-7 w-7",
        numberSize: "text-2xl font-bold",
      };
    case 16:
      return {
        color: "text-yellow-400",
        iconSize: "h-7 w-7",
        numberSize: "text-2xl font-bold",
      };
    case 32:
      return {
        color: "text-purple-400",
        iconSize: "h-7 w-7",
        numberSize: "text-2xl font-bold",
      };
    default:
      return {
        color: "text-stone-500",
        iconSize: "h-7 w-7",
        numberSize: "text-2xl font-bold",
      };
  }
}

export function RecentGauntlets() {
  const {
    gauntlets,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  } = useArchivedGauntlets();

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [expandedGauntletId, setExpandedGauntletId] = useState<string | null>(
    null,
  );

  // State to track which fight is currently active/selected
  const [activeFightKey, setActiveFightKey] = useState<string | null>(null);

  // State to track which fight accordion is expanded
  const [expandedFightId, setExpandedFightId] = useState<string | null>(null);

  const handleFightAccordionToggle = (fightId: string | null) => {
    setExpandedFightId(fightId);
  };

  const handleRefetch = async () => {
    await refetch();
  };

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );

    if (loadMoreRef.current) observerRef.current.observe(loadMoreRef.current);
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <div className="bg-stone-900 border border-yellow-600/20 rounded-lg overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-amber-900/50 to-stone-900 border-b border-yellow-600/20 flex items-center justify-center">
        <div className="flex items-center">
          <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
          <h2 className="text-xl font-bold text-yellow-400">
            Recent Gauntlets
          </h2>
        </div>
      </div>

      {isLoading && gauntlets.length === 0 ? (
        <div className="p-4 space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <GauntletAccordionItemSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-400">
          <p>Failed to load recent gauntlets.</p>
          <Button
            onClick={handleRefetch}
            className="mt-4"
            size="sm"
            variant="outline"
            disabled={isRefetching}
          >
            <Loader2
              className={`mr-2 h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
            />
            Try Again
          </Button>
        </div>
      ) : gauntlets.length === 0 ? (
        <div className="text-center py-8 text-stone-300">
          <p>No recent gauntlets found.</p>
        </div>
      ) : (
        <Accordion
          type="single"
          collapsible
          className="w-full p-4 space-y-2"
          onValueChange={(value) => setExpandedGauntletId(value || null)}
          value={expandedGauntletId || undefined}
        >
          {gauntlets.map((gauntlet: GauntletChronicle) => (
            <GauntletAccordionItem
              key={gauntlet.id}
              gauntlet={gauntlet}
              selectedCharacter={null}
              itemValue={gauntlet.id}
              isExpanded={expandedGauntletId === gauntlet.id}
              activeFightKey={activeFightKey || undefined}
              onFightClick={setActiveFightKey}
              expandedFightId={expandedFightId || undefined}
              onFightAccordionToggle={handleFightAccordionToggle}
            />
          ))}
        </Accordion>
      )}

      <div
        ref={loadMoreRef}
        className="p-4 flex justify-center border-t border-yellow-600/20"
      >
        {isFetchingNextPage ? (
          <Loader2 className="h-6 w-6 text-yellow-500 animate-spin" />
        ) : hasNextPage ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchNextPage()}
            className="border-yellow-600/20 hover:bg-yellow-500/10 hover:text-yellow-400 text-stone-400"
          >
            Load More Gauntlets
          </Button>
        ) : gauntlets.length > 0 ? (
          <span className="text-sm text-stone-400">
            End of gauntlet history
          </span>
        ) : null}
      </div>
    </div>
  );
}
