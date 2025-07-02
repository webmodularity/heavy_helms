"use client";

import { motion } from "framer-motion";
import { History, Sword, Shield, Trophy, Clock, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SkinCombatHistoryProps {
  skinData: {
    collection: {
      id: string;
      contractAddress: string;
      isVerified: boolean;
      skinType: number;
      requiredNFTAddress: string | null;
    };
    tokenId: number;
    metadataURI: string;
    weapon: number;
    armor: number;
    imageURL?: string;
    spritesheet?: unknown;
  };
}

interface CombatHistoryItem {
  id: string;
  timestamp: Date;
  opponent: {
    name: string;
    id: number;
  };
  result: "win" | "loss";
  winCondition: "DEATH" | "HEALTH" | "EXHAUSTION" | "MAX_ROUNDS";
  damageDealt: number;
  damageTaken: number;
  roundCount: number;
  stance: number;
}

export function SkinCombatHistory({ skinData }: SkinCombatHistoryProps) {
  // Mock combat history data - will be replaced with real data
  const combatHistory: CombatHistoryItem[] = [
    {
      id: "1",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      opponent: { name: "Warrior #1247", id: 1247 },
      result: "win",
      winCondition: "DEATH",
      damageDealt: 142,
      damageTaken: 67,
      roundCount: 8,
      stance: 2, // Offensive
    },
    {
      id: "2",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      opponent: { name: "Warrior #892", id: 892 },
      result: "loss",
      winCondition: "HEALTH",
      damageDealt: 89,
      damageTaken: 134,
      roundCount: 12,
      stance: 1, // Balanced
    },
    {
      id: "3",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      opponent: { name: "Warrior #445", id: 445 },
      result: "win",
      winCondition: "EXHAUSTION",
      damageDealt: 98,
      damageTaken: 45,
      roundCount: 15,
      stance: 0, // Defensive
    },
    {
      id: "4",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      opponent: { name: "Warrior #1673", id: 1673 },
      result: "win",
      winCondition: "DEATH",
      damageDealt: 156,
      damageTaken: 78,
      roundCount: 6,
      stance: 2, // Offensive
    },
    {
      id: "5",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      opponent: { name: "Warrior #1156", id: 1156 },
      result: "loss",
      winCondition: "MAX_ROUNDS",
      damageDealt: 76,
      damageTaken: 82,
      roundCount: 20,
      stance: 1, // Balanced
    },
  ];

  const getStanceName = (stance: number): string => {
    const names = ["Defensive", "Balanced", "Offensive"];
    return names[stance] || "Unknown";
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

  const getWinConditionIcon = (condition: string) => {
    switch (condition) {
      case "DEATH":
        return <Sword className="h-4 w-4" />;
      case "HEALTH":
        return <Shield className="h-4 w-4" />;
      case "EXHAUSTION":
        return <Clock className="h-4 w-4" />;
      case "MAX_ROUNDS":
        return <Trophy className="h-4 w-4" />;
      default:
        return <Trophy className="h-4 w-4" />;
    }
  };

  const getWinConditionColor = (condition: string): string => {
    switch (condition) {
      case "DEATH":
        return "text-red-400";
      case "HEALTH":
        return "text-orange-400";
      case "EXHAUSTION":
        return "text-blue-400";
      case "MAX_ROUNDS":
        return "text-yellow-400";
      default:
        return "text-stone-400";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="pb-6"
    >
      <h3 className="text-xl font-semibold text-yellow-500 mb-4 flex items-center">
        <History className="mr-2 h-5 w-5" />
        Recent Combat History
      </h3>

      <div className="space-y-4">
        {combatHistory.map((combat) => (
          <motion.div
            key={combat.id}
            className="bg-stone-800/40 rounded-lg border border-yellow-600/20 p-4 hover:border-yellow-600/40 transition-all duration-300 group"
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-full ${combat.result === "win" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
                >
                  {combat.result === "win" ? (
                    <Trophy className="h-4 w-4" />
                  ) : (
                    <Sword className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`font-semibold ${combat.result === "win" ? "text-green-400" : "text-red-400"}`}
                    >
                      {combat.result === "win" ? "Victory" : "Defeat"}
                    </span>
                    <span className="text-stone-400">vs</span>
                    <span className="text-stone-200 font-medium">
                      {combat.opponent.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-stone-400 mt-1">
                    <span className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span className={getStanceColor(combat.stance)}>
                        {getStanceName(combat.stance)}
                      </span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {formatDistanceToNow(combat.timestamp, {
                          addSuffix: true,
                        })}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 text-sm">
                  <span className={getWinConditionColor(combat.winCondition)}>
                    {getWinConditionIcon(combat.winCondition)}
                  </span>
                  <span className="text-stone-400">{combat.winCondition}</span>
                </div>
                <div className="text-xs text-stone-500 mt-1">
                  Round {combat.roundCount}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-3 border-t border-yellow-600/10">
              <div className="text-center">
                <div className="text-sm text-stone-400">Damage Dealt</div>
                <div className="text-lg font-semibold text-red-400">
                  {combat.damageDealt}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-stone-400">Damage Taken</div>
                <div className="text-lg font-semibold text-orange-400">
                  {combat.damageTaken}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-stone-400">Efficiency</div>
                <div className="text-lg font-semibold text-yellow-400">
                  {(combat.damageDealt / combat.damageTaken).toFixed(2)}x
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {combatHistory.length === 0 && (
        <div className="text-center py-8 text-stone-400">
          <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No combat history available</p>
          <p className="text-sm">This skin hasn't been used in battle yet</p>
        </div>
      )}
    </motion.div>
  );
}
