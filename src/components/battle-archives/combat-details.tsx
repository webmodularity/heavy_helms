"use client";

import { useCombatResult } from "@/hooks/use-combat-result";
import {
  extractCombatMetrics,
  formatAccuracy,
  formatDamage,
  hasHealthStaminaData,
} from "@/lib/combat-stats-utils";
import {
  getWinConditionShort,
  getWinConditionClasses,
  getWinConditionIcon,
} from "@/lib/win-condition-utils";
import { Loader2, Swords, Heart, Zap, Target, Shield } from "lucide-react";

interface CombatDetailsProps {
  transactionHash: string;
  winnerName: string;
  loserName: string;
}

export function CombatDetails({
  transactionHash,
  winnerName,
  loserName,
}: CombatDetailsProps) {
  const {
    data: combatResult,
    isLoading,
    error,
  } = useCombatResult(transactionHash);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-yellow-500 mr-2" />
        <span className="text-stone-400">Loading combat details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-400">
        <p className="text-sm">Failed to load combat details</p>
      </div>
    );
  }

  if (!combatResult) {
    return (
      <div className="text-center py-4 text-stone-400">
        <p className="text-sm">No combat data available</p>
      </div>
    );
  }

  const metrics = extractCombatMetrics(combatResult);
  const hasHealthData = hasHealthStaminaData(combatResult);

  return (
    <div className="bg-stone-800/50 rounded-lg p-4 mt-3 border border-stone-700">
      {/* Win Condition Header */}
      <div className="flex items-center justify-center mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-lg">
            {getWinConditionIcon(combatResult.winCondition || "HEALTH")}
          </span>
          <div
            className={getWinConditionClasses(
              combatResult.winCondition || "HEALTH",
            )}
          >
            {getWinConditionShort(combatResult.winCondition || "HEALTH")}
          </div>
          {combatResult.roundCount && (
            <span className="text-stone-400">
              ({combatResult.roundCount} rounds)
            </span>
          )}
        </div>
      </div>

      {/* Combat Statistics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Player 1 Stats */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-yellow-400 flex items-center">
              <Swords className="h-4 w-4 mr-1" />
              {combatResult.player1Won ? winnerName : loserName}
            </h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-400">Damage:</span>
                <span className="text-red-400">
                  {formatDamage(metrics.player1.totalDamage)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Accuracy:</span>
                <span className="text-blue-400">
                  {formatAccuracy(metrics.player1.accuracy)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Crits:</span>
                <span className="text-orange-400">{metrics.player1.crits}</span>
              </div>
              {hasHealthData && metrics.player1.maxHealth && (
                <>
                  <div className="flex justify-between">
                    <span className="text-stone-400 flex items-center">
                      <Heart className="h-3 w-3 mr-1" />
                      Health:
                    </span>
                    <span className="text-green-400">
                      {metrics.player1.endingHealth}/{metrics.player1.maxHealth}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400 flex items-center">
                      <Zap className="h-3 w-3 mr-1" />
                      Stamina:
                    </span>
                    <span className="text-cyan-400">
                      {metrics.player1.endingStamina}/
                      {metrics.player1.maxStamina}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Player 2 Stats */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-yellow-400 flex items-center">
              <Shield className="h-4 w-4 mr-1" />
              {combatResult.player1Won ? loserName : winnerName}
            </h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-400">Damage:</span>
                <span className="text-red-400">
                  {formatDamage(metrics.player2.totalDamage)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Accuracy:</span>
                <span className="text-blue-400">
                  {formatAccuracy(metrics.player2.accuracy)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Crits:</span>
                <span className="text-orange-400">{metrics.player2.crits}</span>
              </div>
              {hasHealthData && metrics.player2.maxHealth && (
                <>
                  <div className="flex justify-between">
                    <span className="text-stone-400 flex items-center">
                      <Heart className="h-3 w-3 mr-1" />
                      Health:
                    </span>
                    <span className="text-green-400">
                      {metrics.player2.endingHealth}/{metrics.player2.maxHealth}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400 flex items-center">
                      <Zap className="h-3 w-3 mr-1" />
                      Stamina:
                    </span>
                    <span className="text-cyan-400">
                      {metrics.player2.endingStamina}/
                      {metrics.player2.maxStamina}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Game Engine Version */}
      {combatResult.gameEngineVersion && (
        <div className="mt-3 pt-3 border-t border-stone-700">
          <div className="text-xs text-stone-500 text-center">
            Game Engine v{combatResult.gameEngineVersion}
          </div>
        </div>
      )}
    </div>
  );
}
