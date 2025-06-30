"use client";

import { useState } from "react";
// Import only the needed component and icons
import { WarriorLeaderboard } from "@/components/leaderboards/warrior-leaderboard";
import { SkinLeaderboard } from "@/components/leaderboards/skin-leaderboard";

export default function LeaderboardsPage() {
  // State for tabs, even if only one initially
  const [activeTab, setActiveTab] = useState("warriors");

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-2 md:py-4 space-y-6 md:space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-yellow-500">
            Leaderboards
          </h1>
          <p className="text-xs md:text-sm text-stone-400 mt-1">
            Rankings of the mightiest warriors.
          </p>
        </div>
      </div>

      {/* Navigation matching subtitle style */}
      <div className="flex justify-center items-center gap-6">
        <button
          type="button"
          onClick={() => handleTabChange("warriors")}
          className={`text-base md:text-lg transition-colors ${
            activeTab === "warriors"
              ? "text-yellow-500 underline"
              : "text-stone-200 hover:text-yellow-400"
          }`}
        >
          Warriors
        </button>
        <button
          type="button"
          onClick={() => handleTabChange("skins")}
          className={`text-base md:text-lg transition-colors ${
            activeTab === "skins"
              ? "text-yellow-500 underline"
              : "text-stone-200 hover:text-yellow-400"
          }`}
        >
          Skins
        </button>
      </div>

      {/* Content section */}
      <div>
        {activeTab === "warriors" && <WarriorLeaderboard />}
        {activeTab === "skins" && <SkinLeaderboard />}
      </div>
    </div>
  );
}
