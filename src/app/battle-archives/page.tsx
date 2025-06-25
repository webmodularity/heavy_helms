"use client";

import { useState } from "react";
// Remove imports for hidden components
// import { MostDuelsAccepted } from "@/components/battle-archives/most-duels-accepted";
// import { MostDuelsCreated } from "@/components/battle-archives/most-duels-created";
import { RecentDuels } from "@/components/battle-archives/recent-battles";
import { RecentGauntlets } from "@/components/battle-archives/recent-gauntlets";
import { Challenges } from "@/components/battle-archives/challenges";
import {
  // Remove unused icons
  // RefreshCw, Shield, Swords, CircleDollarSign, Trophy, Users
  Clock,
  Swords,
  ArchiveX,
  Trophy,
} from "lucide-react";
// Remove Button import if Refresh button is not needed here anymore
// import { Button } from "@/components/ui/button";

// Removed RecentGauntletsPlaceholder as it's now imported

export default function BattleArchivesPage() {
  const [activeTab, setActiveTab] = useState("recent-gauntlets");

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-2 md:py-4 space-y-6 md:space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-yellow-500">
            Battle Archives
          </h1>
          <p className="text-xs md:text-sm text-stone-400 mt-1">
            Chronicles of combat and glory.
          </p>
        </div>
      </div>

      {/* Clean text navigation */}
      <div className="flex justify-center items-center gap-8">
        <button
          type="button"
          onClick={() => handleTabChange("recent-gauntlets")}
          className={`text-base md:text-lg transition-colors ${
            activeTab === "recent-gauntlets"
              ? "text-yellow-500 underline"
              : "text-stone-200 hover:text-yellow-400"
          }`}
        >
          Gauntlets
        </button>
        <button
          type="button"
          onClick={() => handleTabChange("recent-duels")}
          className={`text-base md:text-lg transition-colors ${
            activeTab === "recent-duels"
              ? "text-yellow-500 underline"
              : "text-stone-200 hover:text-yellow-400"
          }`}
        >
          Duels
        </button>
        <button
          type="button"
          onClick={() => handleTabChange("challenges")}
          className={`text-base md:text-lg transition-colors ${
            activeTab === "challenges"
              ? "text-yellow-500 underline"
              : "text-stone-200 hover:text-yellow-400"
          }`}
        >
          Challenges
        </button>
      </div>

      {/* Content sections */}
      <div>
        {activeTab === "recent-gauntlets" && <RecentGauntlets />}
        {activeTab === "recent-duels" && <RecentDuels />}
        {activeTab === "challenges" && <Challenges />}
      </div>
    </div>
  );
}
