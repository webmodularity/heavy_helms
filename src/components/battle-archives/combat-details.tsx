"use client";

import { useCombatResult } from "@/hooks/use-combat-result";
import {
  extractCombatMetrics,
  formatAccuracy,
  formatDamage,
  hasHealthStaminaData,
  getAttackBreakdown,
  getAccuracyInfo,
  formatMitigationRate,
  getDefenseInfo,
} from "@/lib/combat-stats-utils";
import {
  getWinConditionShort,
  getWinConditionClasses,
  getWinConditionIcon,
} from "@/lib/win-condition-utils";
import {
  Loader2,
  Swords,
  Heart,
  Zap,
  Target,
  Shield,
  Crown,
  Info,
} from "lucide-react";
import { useState } from "react";

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
  const [showPlayer1Breakdown, setShowPlayer1Breakdown] = useState(false);
  const [showPlayer2Breakdown, setShowPlayer2Breakdown] = useState(false);
  const [showPlayer1Defense, setShowPlayer1Defense] = useState(false);
  const [showPlayer2Defense, setShowPlayer2Defense] = useState(false);

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

  // Get win condition info
  const winCondition = combatResult.winCondition || "HEALTH";
  const getWinConditionLabel = (condition: string) => {
    switch (condition.toUpperCase()) {
      case "HEALTH":
        return "Victory by Combat";
      case "EXHAUSTION":
        return "Victory by Exhaustion";
      case "MAX_ROUNDS":
        return "Victory by Endurance";
      case "DEATH":
        return "Victory by Death";
      default:
        return "Victory";
    }
  };

  return (
    <div className="bg-gradient-to-br from-amber-950/20 to-stone-900/30 rounded-lg p-4 mt-3 border border-amber-800/20 backdrop-blur-sm">
      {/* Win Condition Header */}
      <div className="flex items-center justify-center mb-4">
        <div className="flex items-center space-x-3 bg-amber-900/20 px-4 py-2 rounded-full border border-amber-700/30">
          <Crown className="h-4 w-4 text-amber-400" />
          <span className="text-amber-200 font-medium text-sm">
            {getWinConditionLabel(winCondition)}
          </span>
          {combatResult.roundCount && (
            <span className="text-amber-300/70 text-xs">
              ({combatResult.roundCount} rounds)
            </span>
          )}
        </div>
      </div>

      {/* Combat Statistics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Player 1 Stats */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 pb-2 border-b border-amber-800/30">
              <Swords className="h-4 w-4 text-amber-400" />
              <span className="text-amber-200 font-medium text-sm">
                {combatResult.player1Won ? winnerName : loserName}
              </span>
              {combatResult.player1Won && (
                <Crown className="h-3 w-3 text-amber-400" />
              )}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-stone-300 text-xs flex items-center">
                  <Target className="h-3 w-3 mr-1.5 text-stone-400" />
                  Damage Dealt
                </span>
                <span className="text-amber-300 font-medium text-xs">
                  {formatDamage(metrics.player1.totalDamage)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-300 text-xs flex items-center">
                  <Target className="h-3 w-3 mr-1.5 text-stone-400" />
                  Accuracy
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-amber-300 font-medium text-xs">
                    {formatAccuracy(metrics.player1.accuracy)}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setShowPlayer1Breakdown(!showPlayer1Breakdown)
                    }
                    className="text-stone-400 hover:text-amber-400 transition-colors"
                    title="Show detailed attack breakdown"
                  >
                    <Info className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Player 1 Attack Breakdown Accordion */}
              {showPlayer1Breakdown && (
                <div className="mt-2 p-3 bg-amber-950/10 rounded border border-amber-800/20">
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-stone-400">Total Attempts:</span>
                      <span className="text-stone-200">
                        {metrics.player1.totalAttackAttempts}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-400">✓ Successful Hits:</span>
                      <span className="text-green-300">
                        {metrics.player1.hits}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">○ Misses:</span>
                      <span className="text-stone-300">
                        {metrics.player1.misses}
                      </span>
                    </div>
                    {metrics.player1.attacksBlocked > 0 && (
                      <div className="flex justify-between">
                        <span className="text-blue-400">🛡 Blocked:</span>
                        <span className="text-blue-300">
                          {metrics.player1.attacksBlocked}
                        </span>
                      </div>
                    )}
                    {metrics.player1.attacksCountered > 0 && (
                      <div className="flex justify-between">
                        <span className="text-orange-400">⚔ Countered:</span>
                        <span className="text-orange-300">
                          {metrics.player1.attacksCountered}
                        </span>
                      </div>
                    )}
                    {metrics.player1.attacksDodged > 0 && (
                      <div className="flex justify-between">
                        <span className="text-cyan-400">💨 Dodged:</span>
                        <span className="text-cyan-300">
                          {metrics.player1.attacksDodged}
                        </span>
                      </div>
                    )}
                    {metrics.player1.attacksParried > 0 && (
                      <div className="flex justify-between">
                        <span className="text-purple-400">⚡ Parried:</span>
                        <span className="text-purple-300">
                          {metrics.player1.attacksParried}
                        </span>
                      </div>
                    )}
                    {metrics.player1.attacksRiposted > 0 && (
                      <div className="flex justify-between">
                        <span className="text-red-400">🗡 Riposted:</span>
                        <span className="text-red-300">
                          {metrics.player1.attacksRiposted}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-stone-300 text-xs flex items-center">
                  <Shield className="h-3 w-3 mr-1.5 text-stone-400" />
                  Mitigation
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-emerald-300 font-medium text-xs">
                    {formatMitigationRate(metrics.player1.mitigationRate)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPlayer1Defense(!showPlayer1Defense)}
                    className="text-stone-400 hover:text-emerald-400 transition-colors"
                    title="Show detailed defense breakdown"
                  >
                    <Info className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Player 1 Defense Breakdown Accordion */}
              {showPlayer1Defense && (
                <div className="mt-2 p-3 bg-emerald-950/10 rounded border border-emerald-800/20">
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-stone-400">Attacks Against:</span>
                      <span className="text-stone-200">
                        {metrics.player1.totalAttacksReceived}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-emerald-400">✓ Defended:</span>
                      <span className="text-emerald-300">
                        {metrics.player1.successfulDefenses}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-400">✗ Hits:</span>
                      <span className="text-red-300">
                        {metrics.player1.totalAttacksReceived -
                          metrics.player1.successfulDefenses}
                      </span>
                    </div>
                    {metrics.player1.blocks > 0 && (
                      <div className="flex justify-between">
                        <span className="text-blue-400">🛡 Blocked:</span>
                        <span className="text-blue-300">
                          {metrics.player1.blocks}
                        </span>
                      </div>
                    )}
                    {metrics.player1.counters > 0 && (
                      <div className="flex justify-between">
                        <span className="text-orange-400">⚔ Countered:</span>
                        <span className="text-orange-300">
                          {metrics.player1.counters}
                        </span>
                      </div>
                    )}
                    {metrics.player1.dodges > 0 && (
                      <div className="flex justify-between">
                        <span className="text-cyan-400">💨 Dodged:</span>
                        <span className="text-cyan-300">
                          {metrics.player1.dodges}
                        </span>
                      </div>
                    )}
                    {metrics.player1.parries > 0 && (
                      <div className="flex justify-between">
                        <span className="text-purple-400">⚡ Parried:</span>
                        <span className="text-purple-300">
                          {metrics.player1.parries}
                        </span>
                      </div>
                    )}
                    {metrics.player1.ripostes > 0 && (
                      <div className="flex justify-between">
                        <span className="text-red-400">🗡 Riposted:</span>
                        <span className="text-red-300">
                          {metrics.player1.ripostes}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-stone-300 text-xs flex items-center">
                  <Swords className="h-3 w-3 mr-1.5 text-stone-400" />
                  Critical Hits
                </span>
                <span className="text-amber-300 font-medium text-xs">
                  {metrics.player1.crits}
                </span>
              </div>
              {hasHealthData && metrics.player1.maxHealth && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-300 text-xs flex items-center">
                      <Heart className="h-3 w-3 mr-1.5 text-red-400" />
                      Health
                    </span>
                    <span className="text-red-300 font-medium text-xs">
                      {metrics.player1.endingHealth}/{metrics.player1.maxHealth}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-300 text-xs flex items-center">
                      <Zap className="h-3 w-3 mr-1.5 text-blue-400" />
                      Stamina
                    </span>
                    <span className="text-blue-300 font-medium text-xs">
                      {metrics.player1.endingStamina}/
                      {metrics.player1.maxStamina}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Player 2 Stats */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 pb-2 border-b border-amber-800/30">
              <Shield className="h-4 w-4 text-amber-400" />
              <span className="text-amber-200 font-medium text-sm">
                {combatResult.player1Won ? loserName : winnerName}
              </span>
              {!combatResult.player1Won && (
                <Crown className="h-3 w-3 text-amber-400" />
              )}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-stone-300 text-xs flex items-center">
                  <Target className="h-3 w-3 mr-1.5 text-stone-400" />
                  Damage Dealt
                </span>
                <span className="text-amber-300 font-medium text-xs">
                  {formatDamage(metrics.player2.totalDamage)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-300 text-xs flex items-center">
                  <Target className="h-3 w-3 mr-1.5 text-stone-400" />
                  Accuracy
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-amber-300 font-medium text-xs">
                    {formatAccuracy(metrics.player2.accuracy)}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setShowPlayer2Breakdown(!showPlayer2Breakdown)
                    }
                    className="text-stone-400 hover:text-amber-400 transition-colors"
                    title="Show detailed attack breakdown"
                  >
                    <Info className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Player 2 Attack Breakdown Accordion */}
              {showPlayer2Breakdown && (
                <div className="mt-2 p-3 bg-amber-950/10 rounded border border-amber-800/20">
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-stone-400">Total Attempts:</span>
                      <span className="text-stone-200">
                        {metrics.player2.totalAttackAttempts}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-400">✓ Successful Hits:</span>
                      <span className="text-green-300">
                        {metrics.player2.hits}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">○ Misses:</span>
                      <span className="text-stone-300">
                        {metrics.player2.misses}
                      </span>
                    </div>
                    {metrics.player2.attacksBlocked > 0 && (
                      <div className="flex justify-between">
                        <span className="text-blue-400">🛡 Blocked:</span>
                        <span className="text-blue-300">
                          {metrics.player2.attacksBlocked}
                        </span>
                      </div>
                    )}
                    {metrics.player2.attacksCountered > 0 && (
                      <div className="flex justify-between">
                        <span className="text-orange-400">⚔ Countered:</span>
                        <span className="text-orange-300">
                          {metrics.player2.attacksCountered}
                        </span>
                      </div>
                    )}
                    {metrics.player2.attacksDodged > 0 && (
                      <div className="flex justify-between">
                        <span className="text-cyan-400">💨 Dodged:</span>
                        <span className="text-cyan-300">
                          {metrics.player2.attacksDodged}
                        </span>
                      </div>
                    )}
                    {metrics.player2.attacksParried > 0 && (
                      <div className="flex justify-between">
                        <span className="text-purple-400">⚡ Parried:</span>
                        <span className="text-purple-300">
                          {metrics.player2.attacksParried}
                        </span>
                      </div>
                    )}
                    {metrics.player2.attacksRiposted > 0 && (
                      <div className="flex justify-between">
                        <span className="text-red-400">🗡 Riposted:</span>
                        <span className="text-red-300">
                          {metrics.player2.attacksRiposted}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-stone-300 text-xs flex items-center">
                  <Shield className="h-3 w-3 mr-1.5 text-stone-400" />
                  Mitigation
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-emerald-300 font-medium text-xs">
                    {formatMitigationRate(metrics.player2.mitigationRate)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPlayer2Defense(!showPlayer2Defense)}
                    className="text-stone-400 hover:text-emerald-400 transition-colors"
                    title="Show detailed defense breakdown"
                  >
                    <Info className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Player 2 Defense Breakdown Accordion */}
              {showPlayer2Defense && (
                <div className="mt-2 p-3 bg-emerald-950/10 rounded border border-emerald-800/20">
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-stone-400">Attacks Against:</span>
                      <span className="text-stone-200">
                        {metrics.player2.totalAttacksReceived}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-emerald-400">✓ Defended:</span>
                      <span className="text-emerald-300">
                        {metrics.player2.successfulDefenses}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-400">✗ Hits:</span>
                      <span className="text-red-300">
                        {metrics.player2.totalAttacksReceived -
                          metrics.player2.successfulDefenses}
                      </span>
                    </div>
                    {metrics.player2.blocks > 0 && (
                      <div className="flex justify-between">
                        <span className="text-blue-400">🛡 Blocked:</span>
                        <span className="text-blue-300">
                          {metrics.player2.blocks}
                        </span>
                      </div>
                    )}
                    {metrics.player2.counters > 0 && (
                      <div className="flex justify-between">
                        <span className="text-orange-400">⚔ Countered:</span>
                        <span className="text-orange-300">
                          {metrics.player2.counters}
                        </span>
                      </div>
                    )}
                    {metrics.player2.dodges > 0 && (
                      <div className="flex justify-between">
                        <span className="text-cyan-400">💨 Dodged:</span>
                        <span className="text-cyan-300">
                          {metrics.player2.dodges}
                        </span>
                      </div>
                    )}
                    {metrics.player2.parries > 0 && (
                      <div className="flex justify-between">
                        <span className="text-purple-400">⚡ Parried:</span>
                        <span className="text-purple-300">
                          {metrics.player2.parries}
                        </span>
                      </div>
                    )}
                    {metrics.player2.ripostes > 0 && (
                      <div className="flex justify-between">
                        <span className="text-red-400">🗡 Riposted:</span>
                        <span className="text-red-300">
                          {metrics.player2.ripostes}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-stone-300 text-xs flex items-center">
                  <Swords className="h-3 w-3 mr-1.5 text-stone-400" />
                  Critical Hits
                </span>
                <span className="text-amber-300 font-medium text-xs">
                  {metrics.player2.crits}
                </span>
              </div>
              {hasHealthData && metrics.player2.maxHealth && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-300 text-xs flex items-center">
                      <Heart className="h-3 w-3 mr-1.5 text-red-400" />
                      Health
                    </span>
                    <span className="text-red-300 font-medium text-xs">
                      {metrics.player2.endingHealth}/{metrics.player2.maxHealth}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-300 text-xs flex items-center">
                      <Zap className="h-3 w-3 mr-1.5 text-blue-400" />
                      Stamina
                    </span>
                    <span className="text-blue-300 font-medium text-xs">
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
        <div className="mt-4 pt-3 border-t border-amber-800/30">
          <div className="text-xs text-amber-600/60 text-center">
            Game Engine v{combatResult.gameEngineVersion}
          </div>
        </div>
      )}
    </div>
  );
}
