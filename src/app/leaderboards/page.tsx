"use client";

import { useState } from "react";
// Import only the needed component and icons
import { WarriorLeaderboard } from "@/components/leaderboards/warrior-leaderboard"; // Assuming it's reusable
import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LeaderboardsPage() {
  // State for tabs, even if only one initially
  const [activeTab, setActiveTab] = useState("warriors");

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Placeholder refresh handler - can be removed if not used
  // const handleRefresh = () => {
  //   console.log("Placeholder: Refresh leaderboards...");
  // };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 space-y-6">
      {/* Header - Smaller and more compact */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-yellow-500">
            Leaderboards
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Rankings of the mightiest warriors and wealthiest participants.
          </p>
        </div>
        {/* Removed the Refresh Ranks Button */}
        {/* 
        <Button
          onClick={handleRefresh} 
          className="border-yellow-600/20 hover:bg-yellow-500/10 hover:text-yellow-400 text-stone-200 bg-stone-900" 
        >
          <RefreshCw className="h-4 w-4 mr-2 text-yellow-500" /> 
          Refresh Ranks
        </Button> 
        */}
      </div>

      {/* Tabs navigation - More compact */}
      <div className="sticky top-2 z-10 bg-stone-950/80 backdrop-blur-md p-2.5 rounded-lg border border-stone-800/60 shadow-md">
        <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
          <button
            type="button"
            onClick={() => handleTabChange("warriors")}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
              activeTab === "warriors"
                ? "bg-yellow-500 text-black"
                : "bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-stone-100"
            }`}
          >
            <Trophy className="h-3 w-3" />
            Warrior Leaderboard
          </button>
          {/* Add placeholders for future tabs if desired */}
          {/*
          <button type="button" className="... styles ... opacity-50 cursor-not-allowed">Top Wagers</button>
          <button type="button" className="... styles ... opacity-50 cursor-not-allowed">Most Accepted</button>
          <button type="button" className="... styles ... opacity-50 cursor-not-allowed">Most Created</button>
          */}
        </div>
      </div>

      {/* Content section */}
      <div>
        {/* Render only the Warrior Leaderboard initially */}
        {activeTab === "warriors" && <WarriorLeaderboard />}
      </div>
    </div>
  );
}
