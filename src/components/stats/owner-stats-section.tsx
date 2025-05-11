"use client";

import { Users, User } from "lucide-react";
import { SectionHeader } from "./section-header";
import { StatsCard } from "./stats-card";

interface OwnerStats {
  uniqueOwnersCount: number;
  playerCount: number;
}

interface OwnerStatsSectionProps {
  stats: OwnerStats;
}

export function OwnerStatsSection({ stats }: OwnerStatsSectionProps) {
  const avgFightersPerOwner = stats.uniqueOwnersCount > 0 
    ? (stats.playerCount / stats.uniqueOwnersCount).toFixed(2) 
    : "0";

  return (
    <section>
      <SectionHeader 
        title="Owner Statistics" 
        description="Overview of player ownership in Heavy Helms."
        icon={<User className="h-4 w-4" />}
      />
      
      <div className="grid grid-cols-2 gap-2">
        <StatsCard
          title="Unique Owners"
          value={stats.uniqueOwnersCount.toLocaleString()}
          icon={<Users className="h-4 w-4" />}
          className="bg-gradient-to-br from-stone-900/80 to-blue-950/20 border-blue-900/20"
          valueClassName="text-blue-400"
        />
        
        <StatsCard
          title="Avg. Fighters per Owner"
          value={avgFightersPerOwner}
          icon={<User className="h-4 w-4" />}
          className="bg-gradient-to-br from-stone-900/80 to-amber-950/20 border-amber-900/20"
          valueClassName="text-amber-400"
        />
      </div>
      
      <div className="mt-4 bg-stone-900/80 border border-stone-800/60 rounded-lg p-2.5 shadow-md">
        <h3 className="text-base font-semibold text-yellow-500 mb-2">Owner Distribution</h3>
        
        <div className="flex flex-col md:flex-row items-center justify-around gap-3">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-900/20 mb-1">
              <Users className="h-5 w-5 text-blue-400" />
            </div>
            <div className="text-lg font-bold text-blue-400">
              {stats.uniqueOwnersCount.toLocaleString()}
            </div>
            <div className="text-[10px] text-stone-400 mt-0.5">
              Unique Owners
            </div>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-900/20 mb-1">
              <User className="h-5 w-5 text-amber-400" />
            </div>
            <div className="text-lg font-bold text-amber-400">
              {avgFightersPerOwner}
            </div>
            <div className="text-[10px] text-stone-400 mt-0.5">
              Avg. Fighters per Owner
            </div>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-yellow-900/20 mb-1">
              <div className="text-yellow-500 font-bold text-sm">
                {stats.uniqueOwnersCount > 0 
                  ? `${((stats.playerCount / stats.uniqueOwnersCount) * 100).toFixed(1)}%`
                  : "0%"}
              </div>
            </div>
            <div className="text-lg font-bold text-yellow-500">
              {stats.playerCount.toLocaleString()}
            </div>
            <div className="text-[10px] text-stone-400 mt-0.5">
              Total Fighters
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 