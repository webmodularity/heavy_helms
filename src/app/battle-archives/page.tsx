"use client";

import { useState } from "react";
// Remove imports for hidden components
// import { MostDuelsAccepted } from "@/components/battle-archives/most-duels-accepted";
// import { MostDuelsCreated } from "@/components/battle-archives/most-duels-created";
import { OpenChallenges } from "@/components/battle-archives/open-challenges";
import { RecentBattles } from "@/components/battle-archives/recent-battles";
import { ExpiredChallenges } from "@/components/battle-archives/expired-challenges";
// import { TopDuelsByWager } from "@/components/battle-archives/top-duels-by-wager";
// import { WarriorLeaderboard } from "@/components/battle-archives/warrior-leaderboard";
import {
  // Remove unused icons
  // RefreshCw, Shield, Swords, CircleDollarSign, Trophy, Users
  Clock,
  Swords,
  ArchiveX,
} from "lucide-react";
// Remove Button import if Refresh button is not needed here anymore
// import { Button } from "@/components/ui/button";

export default function BattleArchivesPage() {
  // Only need state for the two remaining tabs
  const [activeTab, setActiveTab] = useState("recent");

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-yellow-500">
            Battle Archives
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Chronicles of combat and glory in the Heavy Helms arena
          </p>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="sticky top-2 z-10 bg-stone-950/80 backdrop-blur-md p-2.5 rounded-lg border border-stone-800/60 shadow-lg">
        <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
          <button
            type="button"
            onClick={() => handleTabChange("recent")}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
              activeTab === "recent"
                ? "bg-yellow-500 text-black"
                : "bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-stone-100"
            }`}
          >
            <Clock className="h-3 w-3" />
            Recent Battles
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("challenges")}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
              activeTab === "challenges"
                ? "bg-yellow-500 text-black"
                : "bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-stone-100"
            }`}
          >
            <Swords className="h-3 w-3" />
            Open Challenges
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("expired")}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
              activeTab === "expired"
                ? "bg-yellow-500 text-black"
                : "bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-stone-100"
            }`}
          >
            <ArchiveX className="h-3 w-3" />
            Expired Challenges
          </button>
          {/* Removed other buttons */}
        </div>
      </div>

      {/* Content sections */}
      <div>
        {activeTab === "recent" && <RecentBattles />}
        {activeTab === "challenges" && <OpenChallenges />}
        {activeTab === "expired" && <ExpiredChallenges />}
        {/* Removed other content sections */}
      </div>
    </div>
  );
}
