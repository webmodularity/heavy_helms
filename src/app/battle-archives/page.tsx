"use client";

import { MostDuelsAccepted } from "@/components/battle-archives/most-duels-accepted";
import { MostDuelsCreated } from "@/components/battle-archives/most-duels-created";
import { OpenChallenges } from "@/components/battle-archives/open-challenges";
import { RecentBattles } from "@/components/battle-archives/recent-battles";
import { TopDuelsByWager } from "@/components/battle-archives/top-duels-by-wager";
import { WarriorLeaderboard } from "@/components/battle-archives/warrior-leaderboard";

export default function BattleArchivesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-yellow-500 mb-2">
          Battle Archives
        </h1>
        <p className="text-stone-400">
          Chronicles of combat and glory in the Heavy Helms arena
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* First row - full width on mobile, split on desktop */}
        <div className="md:col-span-2">
          <RecentBattles />
        </div>

        {/* Second row - split on all sizes */}
        <div>
          <OpenChallenges />
        </div>
        <div>
          <WarriorLeaderboard />
        </div>

        {/* Third row - split on all sizes */}
        <div>
          <TopDuelsByWager />
        </div>
        <div>
          <MostDuelsAccepted />
        </div>

        {/* Fourth row - full width on mobile, split on desktop */}
        <div className="md:col-span-2">
          <MostDuelsCreated />
        </div>
      </div>
    </div>
  );
}
