"use client";

import { CreditCard, CircleDollarSign, Trophy, Percent } from "lucide-react";
import { SectionHeader } from "./section-header";
import { StatsCard } from "./stats-card";
import { formatEther } from "viem";

interface WagerStats {
  // Keep the interface expecting bigint, but we'll validate at runtime
  totalWageredAmount: bigint | number | string; // Loosen type for runtime flexibility
  totalFeesCollected: bigint | number | string;
  totalWinnerPayouts: bigint | number | string;
  averageWagerAmount: bigint | number | string;
}

interface WagerStatsSectionProps {
  stats: WagerStats;
}

// Helper function for formatting and rounding
function formatAndRoundEther(
  value: bigint | number | string,
  decimals = 5,
): string {
  try {
    const bigIntValue = typeof value === "bigint" ? value : BigInt(value);
    const formatted = formatEther(bigIntValue);
    const parsed = Number.parseFloat(formatted);
    if (Number.isNaN(parsed)) {
      return "0"; // Return simple 0 if NaN
    }
    // Format to fixed decimals, then remove trailing zeros after decimal
    let fixed = parsed.toFixed(decimals);
    if (fixed.includes(".")) {
      fixed = fixed.replace(/\.?0+$/, ""); // Remove trailing .000 or 000
    }
    // Handle case where removing zeros leaves just "0." -> return "0"
    return fixed === "0." ? "0" : fixed;
  } catch (e) {
    console.error("Error formatting ether value:", value, e);
    return "Error";
  }
}

// Helper function for safe percentage calculation with explicit conversions
function calculatePercentage(
  numeratorInput: bigint | number | string,
  denominatorInput: bigint | number | string,
): number {
  try {
    const numerator =
      typeof numeratorInput === "bigint"
        ? numeratorInput
        : BigInt(numeratorInput);
    const denominator =
      typeof denominatorInput === "bigint"
        ? denominatorInput
        : BigInt(denominatorInput);

    // Replace 0n with BigInt(0) for compatibility
    if (denominator === BigInt(0)) {
      return 0;
    }
    // Perform calculation using only BigInts, replace 100n with BigInt(100)
    const scaledNumerator = numerator * BigInt(100);
    const percentageBigInt = scaledNumerator / denominator;
    // Convert only the final result for rounding
    return Math.round(Number(percentageBigInt));
  } catch (e) {
    console.error(
      "Error calculating percentage:",
      { numeratorInput, denominatorInput },
      e,
    );
    return 0; // Return 0 on error
  }
}

export function WagerStatsSection({ stats }: WagerStatsSectionProps) {
  // Explicitly log the types coming in from props for debugging
  // console.log("Stats types:", {
  //   totalWageredAmount: typeof stats.totalWageredAmount,
  //   totalWinnerPayouts: typeof stats.totalWinnerPayouts,
  //   totalFeesCollected: typeof stats.totalFeesCollected,
  // });

  // Use the safe percentage helper
  const winnerPayoutPercentage = calculatePercentage(
    stats.totalWinnerPayouts,
    stats.totalWageredAmount,
  );
  const feesCollectedPercentage = calculatePercentage(
    stats.totalFeesCollected,
    stats.totalWageredAmount,
  );

  // Ensure averageWagerAmount is also handled correctly if used elsewhere
  const formattedAverageWager = formatAndRoundEther(stats.averageWagerAmount);

  return (
    <section>
      <SectionHeader
        title="Wager Statistics"
        description="Overview of wagers placed on duels in Heavy Helms."
        icon={<CircleDollarSign className="h-4 w-4" />}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatsCard
          title="Total Wagered"
          value={formatAndRoundEther(stats.totalWageredAmount)}
          icon={<CreditCard className="h-4 w-4" />}
          className="bg-gradient-to-br from-stone-900/80 to-emerald-950/20 border-emerald-900/20"
          valueClassName="text-emerald-500"
        />

        <StatsCard
          title="Winner Payouts"
          value={formatAndRoundEther(stats.totalWinnerPayouts)}
          icon={<Trophy className="h-4 w-4" />}
          className="bg-gradient-to-br from-stone-900/80 to-yellow-950/20 border-yellow-900/20"
          valueClassName="text-yellow-500"
        />

        <StatsCard
          title="Fees Collected"
          value={formatAndRoundEther(stats.totalFeesCollected)}
          icon={<Percent className="h-4 w-4" />}
          className="bg-gradient-to-br from-stone-900/80 to-blue-950/20 border-blue-900/20"
          valueClassName="text-blue-400"
        />

        <StatsCard
          title="Average Wager"
          value={formattedAverageWager}
          className="bg-gradient-to-br from-stone-900/80 to-purple-950/20 border-purple-900/20"
          valueClassName="text-purple-400"
        />
      </div>

      <div className="mt-4 bg-stone-900/80 border border-stone-800/60 rounded-lg p-2.5 shadow-md">
        <h3 className="text-base font-semibold text-yellow-500 mb-2">
          Wager Distribution
        </h3>

        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-yellow-900/20 mb-1">
              <Trophy className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="text-base font-bold text-yellow-500">
              {formatAndRoundEther(stats.totalWinnerPayouts)}
            </div>
            <div className="text-[10px] text-stone-400 mt-0.5">Winner Payouts</div>
            <div className="text-[9px] text-stone-500 mt-0.5">
              {`${winnerPayoutPercentage}%`} of total
            </div>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-900/20 mb-1">
              <Percent className="h-5 w-5 text-blue-400" />
            </div>
            <div className="text-base font-bold text-blue-400">
              {formatAndRoundEther(stats.totalFeesCollected)}
            </div>
            <div className="text-[10px] text-stone-400 mt-0.5">Fees Collected</div>
            <div className="text-[9px] text-stone-500 mt-0.5">
              {`${feesCollectedPercentage}%`} of total
            </div>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-900/20 mb-1">
              <CreditCard className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="text-base font-bold text-emerald-500">
              {formatAndRoundEther(stats.totalWageredAmount)}
            </div>
            <div className="text-[10px] text-stone-400 mt-0.5">Total Wagered</div>
            <div className="text-[9px] text-stone-500 mt-0.5">
              Across all wager duels
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
