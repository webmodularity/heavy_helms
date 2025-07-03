"use client";

import { motion } from "framer-motion";
import { Shield, Target, Sword, TrendingUp, Activity } from "lucide-react";

interface SkinStatsSectionProps {
  stanceData: Array<{
    id: string;
    stance: number;
    totalCombats: number;
    wins: number;
    losses: number;
    winRate: string;
    kills: number;
    deaths: number;
    killRate: string;
    deathRate: string;
    killDeathRatio: string;
    survivalRate: string;
    totalDamageDealt: string;
    averageDamageDealt: string;
    maxDamageDealt: string;
    totalDamageTaken: string;
    averageDamageTaken: string;
    damageEfficiency: string;
    knockouts: number;
    knockedOut: number;
    exhaustions: number;
    exhausted: number;
    maxRoundWins: number;
    maxRoundLosses: number;
  }>;
}

export function SkinStatsSection({ stanceData }: SkinStatsSectionProps) {
  const getStanceName = (stance: number): string => {
    const names = ["DEFENSIVE", "BALANCED", "OFFENSIVE"];
    return names[stance] || "UNKNOWN";
  };

  const getStanceIcon = (stance: number) => {
    switch (stance) {
      case 0:
        return <Shield className="h-5 w-5" />;
      case 1:
        return <Target className="h-5 w-5" />;
      case 2:
        return <Sword className="h-5 w-5" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
  };

  const getStanceColor = (stance: number): string => {
    switch (stance) {
      case 0:
        return "text-blue-400"; // Defensive
      case 1:
        return "text-green-400"; // Balanced
      case 2:
        return "text-red-400"; // Offensive
      default:
        return "text-stone-400";
    }
  };

  const getPerformanceRating = (
    winRate: string,
    totalCombats: number,
  ): string => {
    if (totalCombats < 5) return "N/A";

    const rate = Number.parseFloat(winRate);
    if (rate >= 0.8) return "S-Tier";
    if (rate >= 0.7) return "A-Tier";
    if (rate >= 0.6) return "B-Tier";
    if (rate >= 0.5) return "C-Tier";
    return "D-Tier";
  };

  const formatPercentage = (value: string): string => {
    return `${(Number.parseFloat(value) * 100).toFixed(1)}%`;
  };

  // Create a complete set of 3 stances, filling in missing ones with default values
  const getCompleteStanceData = () => {
    const allStances = [0, 1, 2]; // Defensive, Balanced, Offensive
    return allStances.map((stanceNumber) => {
      const existingData = stanceData.find((s) => s.stance === stanceNumber);
      if (existingData) {
        return existingData;
      }
      // Return default data for stances with no combat history
      return {
        id: `default-${stanceNumber}`,
        stance: stanceNumber,
        totalCombats: 0,
        wins: 0,
        losses: 0,
        winRate: "0.0",
        kills: 0,
        deaths: 0,
        killRate: "0.0",
        deathRate: "0.0",
        killDeathRatio: "0.0",
        survivalRate: "0.0",
        totalDamageDealt: "0",
        averageDamageDealt: "0.0",
        maxDamageDealt: "0",
        totalDamageTaken: "0",
        averageDamageTaken: "0.0",
        damageEfficiency: "0.0",
        knockouts: 0,
        knockedOut: 0,
        exhaustions: 0,
        exhausted: 0,
        maxRoundWins: 0,
        maxRoundLosses: 0,
      };
    });
  };

  const completeStanceData = getCompleteStanceData();

  return (
    <motion.div
      className="mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h3 className="text-xl font-semibold text-yellow-500 mb-4 flex items-center">
        <TrendingUp className="mr-2 h-5 w-5" />
        Stance Performance
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {completeStanceData.map((stance) => (
          <StanceCard
            key={stance.id}
            stance={stance.stance}
            name={getStanceName(stance.stance)}
            winRate={formatPercentage(stance.winRate)}
            totalCombats={stance.totalCombats}
            performance={getPerformanceRating(
              stance.winRate,
              stance.totalCombats,
            )}
            icon={getStanceIcon(stance.stance)}
            color={getStanceColor(stance.stance)}
            wins={stance.wins}
            losses={stance.losses}
            kills={stance.kills}
            averageDamageDealt={stance.averageDamageDealt}
            averageDamageTaken={stance.averageDamageTaken}
            damageEfficiency={stance.damageEfficiency}
            knockouts={stance.knockouts}
            exhaustions={stance.exhaustions}
          />
        ))}
      </div>
    </motion.div>
  );
}

interface StanceCardProps {
  stance: number;
  name: string;
  winRate: string;
  totalCombats: number;
  performance: string;
  icon: React.ReactNode;
  color: string;
  wins: number;
  losses: number;
  kills: number;
  averageDamageDealt: string;
  averageDamageTaken: string;
  damageEfficiency: string;
  knockouts: number;
  exhaustions: number;
}

function StanceCard({
  stance,
  name,
  winRate,
  totalCombats,
  performance,
  icon,
  color,
  wins,
  losses,
  kills,
  averageDamageDealt,
  averageDamageTaken,
  damageEfficiency,
  knockouts,
  exhaustions,
}: StanceCardProps) {
  // Generate a dynamic color based on the win rate
  const getWinRateColor = (rate: string) => {
    const numRate = Number.parseFloat(rate);
    if (numRate >= 75) return "text-yellow-400";
    if (numRate >= 60) return "text-green-400";
    if (numRate >= 45) return "text-blue-400";
    return "text-stone-400";
  };

  // Calculate finishing move statistics (as percentage of WINS, not total combats)
  const calculateKORate = () => {
    if (wins === 0) return "0.0%";
    return `${((knockouts / wins) * 100).toFixed(1)}%`;
  };

  const calculateExhaustionRate = () => {
    if (wins === 0) return "0.0%";
    return `${((exhaustions / wins) * 100).toFixed(1)}%`;
  };

  return (
    <motion.div
      className="bg-stone-800/40 rounded-lg border border-yellow-600/20 p-4 hover:border-yellow-600/40 transition-all duration-300 group relative overflow-hidden"
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-yellow-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex items-center mb-3 relative z-10">
        <div className="flex items-center space-x-2">
          <div className={color}>{icon}</div>
          <span className="font-semibold text-stone-200">{name}</span>
        </div>
      </div>

      <div className="space-y-2 relative z-10">
        <div className="flex justify-between">
          <span className="text-stone-400 text-sm">Win Rate</span>
          <span className={`font-bold text-lg ${getWinRateColor(winRate)}`}>
            {winRate}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-stone-400 text-sm">W-L-K</span>
          <span className="text-stone-200 font-medium">
            {wins}-{losses}-{kills}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-stone-400 text-sm">Battles</span>
          <span className="text-stone-200 font-medium">{totalCombats}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-stone-400 text-sm">Avg DMG</span>
          <span className="text-green-400 font-medium">
            {Math.ceil(Number.parseFloat(averageDamageDealt))}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-stone-400 text-sm">Avg MIT</span>
          <span className="text-blue-400 font-medium">
            {Math.ceil(Number.parseFloat(averageDamageTaken))}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-stone-400 text-sm">DMG EFF</span>
          <span className="text-purple-400 font-medium">
            {Number.parseFloat(damageEfficiency).toFixed(2)}x
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-stone-400 text-sm">KO Rate</span>
          <span className="text-orange-400 font-medium">
            {calculateKORate()}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-stone-400 text-sm">Exhaustion Rate</span>
          <span className="text-cyan-400 font-medium">
            {calculateExhaustionRate()}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-stone-400 text-sm">Rating</span>
          <span
            className={`font-medium text-sm ${
              performance === "S-Tier"
                ? "text-yellow-400"
                : performance === "A-Tier"
                  ? "text-green-400"
                  : performance === "B-Tier"
                    ? "text-blue-400"
                    : performance === "C-Tier"
                      ? "text-orange-400"
                      : "text-stone-400"
            }`}
          >
            {performance}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
