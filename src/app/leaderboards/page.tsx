"use client";

import { useState } from "react";
// Import only the needed component and icons
import { WarriorLeaderboard } from "@/components/leaderboards/warrior-leaderboard"; // Assuming it's reusable
import { VelvetRopeLeaderboard } from "@/components/leaderboards/velvet-rope-leaderboard";
import { GreenRoomLeaderboard } from "@/components/leaderboards/green-room-leaderboard";
import { Trophy, Heart, Leaf } from "lucide-react";

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
          onClick={() => handleTabChange("velvet-rope")}
          className={`text-base md:text-lg transition-colors ${
            activeTab === "velvet-rope"
              ? "text-pink-500 underline"
              : "text-stone-200 hover:text-pink-400"
          }`}
        >
          Velvet Rope
        </button>
        <button
          type="button"
          onClick={() => handleTabChange("green-room")}
          className={`text-base md:text-lg transition-colors ${
            activeTab === "green-room"
              ? "text-green-500 underline"
              : "text-stone-200 hover:text-green-400"
          }`}
        >
          Green Room
        </button>
      </div>

      {/* Content section */}
      <div>
        {activeTab === "warriors" && <WarriorLeaderboard />}
        {activeTab === "velvet-rope" && <VelvetRopeLeaderboard />}
        {activeTab === "green-room" && <GreenRoomLeaderboard />}
      </div>
    </div>
  );
}
