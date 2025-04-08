"use client";

import { useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useGameStats } from "@/hooks/use-game-stats";

import { StatsTabs } from "@/components/stats/stats-tabs";
import { FighterStatsSection } from "@/components/stats/fighter-stats-section";
import { CombatStatsSection } from "@/components/stats/combat-stats-section";
import { DuelStatsSection } from "@/components/stats/duel-stats-section";
import { WagerStatsSection } from "@/components/stats/wager-stats-section";
import { SkinStatsSection } from "@/components/stats/skin-stats-section";
import { OwnerStatsSection } from "@/components/stats/owner-stats-section";
import { StatsHeader } from "@/components/stats/stats-header";

export default function StatsPage() {
  const { stats, isLoading, error, refetch } = useGameStats();
  const [activeSection, setActiveSection] = useState("fighters");

  // References to each section for scrolling
  const fightersSectionRef = useRef<HTMLDivElement>(null);
  const combatSectionRef = useRef<HTMLDivElement>(null);
  const duelsSectionRef = useRef<HTMLDivElement>(null);
  const wagersSectionRef = useRef<HTMLDivElement>(null);
  const skinsSectionRef = useRef<HTMLDivElement>(null);
  const ownersSectionRef = useRef<HTMLDivElement>(null);

  // Function to handle section changes
  const handleSectionChange = (section: string) => {
    setActiveSection(section);

    // Scroll to the corresponding section
    const scrollOptions = { behavior: "smooth" as ScrollBehavior };

    switch (section) {
      case "fighters":
        fightersSectionRef.current?.scrollIntoView(scrollOptions);
        break;
      case "combat":
        combatSectionRef.current?.scrollIntoView(scrollOptions);
        break;
      case "duels":
        duelsSectionRef.current?.scrollIntoView(scrollOptions);
        break;
      case "wagers":
        wagersSectionRef.current?.scrollIntoView(scrollOptions);
        break;
      case "skins":
        skinsSectionRef.current?.scrollIntoView(scrollOptions);
        break;
      case "owners":
        ownersSectionRef.current?.scrollIntoView(scrollOptions);
        break;
      default:
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Loader2 className="h-12 w-12 text-yellow-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-6 text-center">
          <h2 className="text-xl font-medium text-red-400 mb-2">
            Error Loading Stats
          </h2>
          <p className="text-red-300">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-stone-900/20 border border-stone-800/30 rounded-lg p-6 text-center">
          <h2 className="text-xl font-medium text-stone-400 mb-2">
            No Stats Available
          </h2>
          <p className="text-stone-300">
            Statistics are currently unavailable.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header with last updated time */}
      <StatsHeader lastUpdated={stats.lastUpdated} />

      {/* Tabs navigation */}
      <div className="sticky top-4 z-10 bg-stone-950/80 backdrop-blur-md p-4 rounded-lg border border-stone-800/60 shadow-lg">
        <StatsTabs
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
        />
      </div>

      {/* Owner Stats Section */}
      <div ref={ownersSectionRef}>
        <OwnerStatsSection stats={stats} />
      </div>

      {/* Fighter Stats Section */}
      <div ref={fightersSectionRef}>
        <FighterStatsSection stats={stats} />
      </div>

      {/* Combat Stats Section */}
      <div ref={combatSectionRef}>
        <CombatStatsSection stats={stats} />
      </div>

      {/* Duel Stats Section */}
      <div ref={duelsSectionRef}>
        <DuelStatsSection stats={stats} />
      </div>

      {/* Wager Stats Section */}
      <div ref={wagersSectionRef}>
        <WagerStatsSection stats={stats} />
      </div>

      {/* Skin Stats Section */}
      <div ref={skinsSectionRef}>
        <SkinStatsSection stats={stats} />
      </div>
    </div>
  );
}
