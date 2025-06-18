"use client";

import { useState } from "react";
// Remove imports for hidden components
// import { MostDuelsAccepted } from "@/components/battle-archives/most-duels-accepted";
// import { MostDuelsCreated } from "@/components/battle-archives/most-duels-created";
import { OpenChallenges } from "@/components/battle-archives/open-challenges";
import { RecentDuels } from "@/components/battle-archives/recent-battles";
import { ExpiredChallenges } from "@/components/battle-archives/expired-challenges";
import { RecentGauntlets } from "@/components/battle-archives/recent-gauntlets";
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
  // Only need state for the two remaining tabs
  const [activeTab, setActiveTab] = useState("recent-gauntlets");

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-yellow-500">
            Battle Archives
          </h1>
          <p className="text-sm text-stone-400 mt-1">
            Chronicles of combat and glory in the Heavy Helms arena
          </p>
        </div>
      </div>

      {/* Tabs navigation - Reduced to two tabs */}
      <div className="sticky top-4 z-10 bg-stone-950/80 backdrop-blur-md p-4 rounded-lg border border-stone-800/60 shadow-lg">
        {/* Adjusted flex properties for fewer tabs if needed, or keep as is */}
        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
          <button
            type="button"
            onClick={() => handleTabChange("recent-gauntlets")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === "recent-gauntlets"
                ? "bg-yellow-500 text-black"
                : "bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-stone-100"
            }`}
          >
            <Trophy className="h-4 w-4" />
            Recent Gauntlets
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("recent-duels")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === "recent-duels"
                ? "bg-yellow-500 text-black"
                : "bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-stone-100"
            }`}
          >
            <Clock className="h-4 w-4" />
            Recent Duels
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("challenges")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === "challenges"
                ? "bg-yellow-500 text-black"
                : "bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-stone-100"
            }`}
          >
            <Swords className="h-4 w-4" />
            Open Challenges
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("expired")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === "expired"
                ? "bg-yellow-500 text-black"
                : "bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-stone-100"
            }`}
          >
            <ArchiveX className="h-4 w-4" />
            Expired Challenges
          </button>
          {/* Removed other buttons */}
        </div>
      </div>

      {/* Content sections - Reduced to two */}
      <div>
        {activeTab === "recent-gauntlets" && <RecentGauntlets />}
        {activeTab === "recent-duels" && <RecentDuels />}
        {activeTab === "challenges" && <OpenChallenges />}
        {activeTab === "expired" && <ExpiredChallenges />}
        {/* Removed other content sections */}
      </div>
    </div>
  );
}
