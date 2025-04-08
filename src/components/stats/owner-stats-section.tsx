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
        icon={<User className="h-6 w-6" />}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatsCard
          title="Unique Owners"
          value={stats.uniqueOwnersCount.toLocaleString()}
          icon={<Users className="h-5 w-5" />}
          className="bg-gradient-to-br from-stone-900/80 to-blue-950/20 border-blue-900/20"
          valueClassName="text-blue-400"
        />
        
        <StatsCard
          title="Avg. Fighters per Owner"
          value={avgFightersPerOwner}
          icon={<User className="h-5 w-5" />}
          className="bg-gradient-to-br from-stone-900/80 to-amber-950/20 border-amber-900/20"
          valueClassName="text-amber-400"
        />
      </div>
      
      <div className="mt-6 bg-stone-900/80 border border-stone-800/60 rounded-lg p-4 shadow-lg">
        <h3 className="text-lg font-semibold text-yellow-500 mb-4">Owner Distribution</h3>
        
        <div className="flex flex-col md:flex-row items-center justify-around gap-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-900/20 mb-2">
              <Users className="h-8 w-8 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-blue-400">
              {stats.uniqueOwnersCount.toLocaleString()}
            </div>
            <div className="text-xs text-stone-400 mt-1">
              Unique Owners
            </div>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-900/20 mb-2">
              <User className="h-8 w-8 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-400">
              {avgFightersPerOwner}
            </div>
            <div className="text-xs text-stone-400 mt-1">
              Avg. Fighters per Owner
            </div>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-900/20 mb-2">
              <div className="text-yellow-500 font-bold text-lg">
                {stats.uniqueOwnersCount > 0 
                  ? `${((stats.playerCount / stats.uniqueOwnersCount) * 100).toFixed(1)}%`
                  : "0%"}
              </div>
            </div>
            <div className="text-2xl font-bold text-yellow-500">
              {stats.playerCount.toLocaleString()}
            </div>
            <div className="text-xs text-stone-400 mt-1">
              Total Fighters
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 