"use client";

import { CreditCard, CircleDollarSign, Trophy, Percent } from "lucide-react";
import { SectionHeader } from "./section-header";
import { StatsCard } from "./stats-card";
import { formatEther } from "viem";

interface WagerStats {
  totalWageredAmount: number;
  totalFeesCollected: number;
  totalWinnerPayouts: number;
  averageWagerAmount: number;
}

interface WagerStatsSectionProps {
  stats: WagerStats;
}

export function WagerStatsSection({ stats }: WagerStatsSectionProps) {
  // Format currency values with 2 decimal places

  return (
    <section>
      <SectionHeader
        title="Wager Statistics"
        description="Overview of wagers placed on duels in Heavy Helms."
        icon={<CircleDollarSign className="h-6 w-6" />}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Wagered"
          value={formatEther(BigInt(stats.totalWageredAmount))}
          icon={<CreditCard className="h-5 w-5" />}
          className="bg-gradient-to-br from-stone-900/80 to-emerald-950/20 border-emerald-900/20"
          valueClassName="text-emerald-500"
        />

        <StatsCard
          title="Winner Payouts"
          value={formatEther(BigInt(stats.totalWinnerPayouts))}
          icon={<Trophy className="h-5 w-5" />}
          className="bg-gradient-to-br from-stone-900/80 to-yellow-950/20 border-yellow-900/20"
          valueClassName="text-yellow-500"
        />

        <StatsCard
          title="Fees Collected"
          value={formatEther(BigInt(stats.totalFeesCollected))}
          icon={<Percent className="h-5 w-5" />}
          className="bg-gradient-to-br from-stone-900/80 to-blue-950/20 border-blue-900/20"
          valueClassName="text-blue-400"
        />

        <StatsCard
          title="Average Wager"
          value={formatEther(BigInt(stats.averageWagerAmount))}
          className="bg-gradient-to-br from-stone-900/80 to-purple-950/20 border-purple-900/20"
          valueClassName="text-purple-400"
        />
      </div>

      <div className="mt-6 bg-stone-900/80 border border-stone-800/60 rounded-lg p-4 shadow-lg">
        <h3 className="text-lg font-semibold text-yellow-500 mb-4">
          Wager Distribution
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-900/20 mb-2">
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="text-xl font-bold text-yellow-500">
              {formatEther(BigInt(stats.totalWinnerPayouts))}
            </div>
            <div className="text-xs text-stone-400 mt-1">Winner Payouts</div>
            <div className="text-xs text-stone-500 mt-1">
              {stats.totalWageredAmount > 0
                ? `${Math.round((stats.totalWinnerPayouts / stats.totalWageredAmount) * 100)}%`
                : "0%"}{" "}
              of total wagered
            </div>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-900/20 mb-2">
              <Percent className="h-8 w-8 text-blue-400" />
            </div>
            <div className="text-xl font-bold text-blue-400">
              {formatEther(BigInt(stats.totalFeesCollected))}
            </div>
            <div className="text-xs text-stone-400 mt-1">Fees Collected</div>
            <div className="text-xs text-stone-500 mt-1">
              {stats.totalWageredAmount > 0
                ? `${Math.round((stats.totalFeesCollected / stats.totalWageredAmount) * 100)}%`
                : "0%"}{" "}
              of total wagered
            </div>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-900/20 mb-2">
              <CreditCard className="h-8 w-8 text-emerald-500" />
            </div>
            <div className="text-xl font-bold text-emerald-500">
              {formatEther(BigInt(stats.totalWageredAmount))}
            </div>
            <div className="text-xs text-stone-400 mt-1">Total Wagered</div>
            <div className="text-xs text-stone-500 mt-1">
              Across all wager duels
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
