"use client";

import { useState } from "react";
import { MostDuelsAccepted } from "@/components/battle-archives/most-duels-accepted";
import { MostDuelsCreated } from "@/components/battle-archives/most-duels-created";
import { OpenChallenges } from "@/components/battle-archives/open-challenges";
import { RecentBattles } from "@/components/battle-archives/recent-battles";
import { TopDuelsByWager } from "@/components/battle-archives/top-duels-by-wager";
import { WarriorLeaderboard } from "@/components/battle-archives/warrior-leaderboard";
import {
  RefreshCw,
  Shield,
  Swords,
  CircleDollarSign,
  Trophy,
  Clock,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BattleArchivesPage() {
  const [activeTab, setActiveTab] = useState("recent");

  // Function to handle tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    // Apply max-w-7xl and spacing consistent with StatsPage
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header with title */}
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

      {/* Tabs navigation */}
      <div className="sticky top-4 z-10 bg-stone-950/80 backdrop-blur-md p-4 rounded-lg border border-stone-800/60 shadow-lg">
        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
          <button
            type="button"
            onClick={() => handleTabChange("recent")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === "recent"
                ? "bg-yellow-500 text-black"
                : "bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-stone-100"
            }`}
          >
            <Clock className="h-4 w-4" />
            Recent Battles
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
            onClick={() => handleTabChange("leaderboard")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === "leaderboard"
                ? "bg-yellow-500 text-black"
                : "bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-stone-100"
            }`}
          >
            <Trophy className="h-4 w-4" />
            Warrior Leaderboard
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("wagers")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === "wagers"
                ? "bg-yellow-500 text-black"
                : "bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-stone-100"
            }`}
          >
            <CircleDollarSign className="h-4 w-4" />
            Top Wagers
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("accepted")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === "accepted"
                ? "bg-yellow-500 text-black"
                : "bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-stone-100"
            }`}
          >
            <Shield className="h-4 w-4" />
            Most Accepted
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("created")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === "created"
                ? "bg-yellow-500 text-black"
                : "bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-stone-100"
            }`}
          >
            <Users className="h-4 w-4" />
            Most Created
          </button>
        </div>
      </div>

      {/* Content sections */}
      <div>
        {activeTab === "recent" && <RecentBattles />}
        {activeTab === "challenges" && <OpenChallenges />}
        {activeTab === "leaderboard" && <WarriorLeaderboard />}
        {activeTab === "wagers" && <TopDuelsByWager />}
        {activeTab === "accepted" && <MostDuelsAccepted />}
        {activeTab === "created" && <MostDuelsCreated />}
      </div>
    </div>
  );
}
