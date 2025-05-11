"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Swords,
  Flame,
  ChevronRight,
  Loader2,
  Axe,
} from "lucide-react";
import { formatEther } from "viem";
import { YellowButton } from "@/components/ui/yellow-button";
import type { Challenge } from "@/hooks/use-challenges";
import { StanceType } from "@/types/equipment.types";
import type { Player } from "@/types/player.types";
import {
  getArmorDisplayName,
  getWeaponDisplayName,
} from "@/lib/equipment-utils";

interface ChallengeCardProps {
  challenge: Challenge;
  selectedCharacter: Player | null;
  isProcessing: boolean;
  isCancellingChallenge: boolean;
  isAcceptingChallenge: boolean;
  onAccept: (challenge: Challenge) => void;
  onCancel: (challenge: Challenge) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export function ChallengeCard({
  challenge,
  selectedCharacter,
  isProcessing,
  isCancellingChallenge,
  isAcceptingChallenge,
  onAccept,
  onCancel,
  isExpanded,
  onToggleExpand,
}: ChallengeCardProps) {
  const isChallenger =
    challenge.challengerId ===
    (selectedCharacter?.id ? Number(selectedCharacter.id) : -1);

  const canAccept = !isChallenger && selectedCharacter !== null;
  const canCancel = isChallenger;

  // Stance information mapping
  const stanceInfo = {
    [StanceType.Defensive]: {
      icon: <Shield className="h-3 w-3" />,
      label: "Defensive",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/20",
    },
    [StanceType.Balanced]: {
      icon: <Swords className="h-3 w-3" />,
      label: "Balanced",
      color: "text-blue-500",
      bgColor: "bg-blue-500/20",
    },
    [StanceType.Offensive]: {
      icon: <Flame className="h-3 w-3" />,
      label: "Offensive",
      color: "text-orange-500",
      bgColor: "bg-orange-500/20",
    },
  };

  const challengerStance = challenge.challengerLoadout.stance;
  const defenderStance = challenge.defenderLoadout.stance;
  const challengerWeapon = challenge.challengerLoadout.weapon;
  const defenderWeapon = challenge.defenderLoadout.weapon;
  const challengerArmor = challenge.challengerLoadout.armor;
  const defenderArmor = challenge.defenderLoadout.armor;

  return (
    <motion.div
      className="border border-yellow-600/20 rounded-lg overflow-hidden bg-gradient-to-r from-amber-900/10 to-transparent"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Challenge Summary - Always Visible */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
      <div
        className="p-2 flex justify-between items-center cursor-pointer"
        onClick={onToggleExpand}
      >
        <div className="flex items-center space-x-2">
          <div className="bg-yellow-600/20 p-1.5 rounded-full">
            <Shield className="h-3.5 w-3.5 text-yellow-500" />
          </div>
          <div>
            <h4 className="font-medium text-xs text-yellow-400">
              {isChallenger ? "Your Challenge" : "Challenge to Defend"}
            </h4>
            <p className="text-xs text-stone-300">
              {isChallenger
                ? `You challenged ${challenge.defenderName || `Fighter ${challenge.defenderId}`}`
                : `${challenge.challengerName || `Fighter ${challenge.challengerId}`} challenged you`}
            </p>
          </div>
        </div>

        <div className="flex items-center">
          <span className="text-yellow-500 text-xs font-medium mr-2">
            {formatEther(challenge.wagerAmount)} ETH
          </span>
          <ChevronRight
            className={`h-4 w-4 text-yellow-500 transition-transform ${isExpanded ? "rotate-90" : ""}`}
          />
        </div>
      </div>

      {/* Expanded Challenge Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="border-t border-yellow-600/10 p-2 bg-stone-900/30">
              {/* Challenge Info */}
              <div className="grid grid-cols-2 gap-y-1 text-xs mb-3">
                <span className="text-stone-400">Challenge ID:</span>
                <span className="text-stone-200 font-mono text-xs">
                  {challenge.id.toString()}
                </span>

                <span className="text-stone-400">Created At:</span>
                <span className="text-stone-200">
                  Block #{challenge.createdBlock.toString()}
                </span>

                <span className="text-stone-400">Status:</span>
                <span className="text-stone-200">
                  {challenge.fulfilled ? (
                    <span className="text-yellow-500">Completed</span>
                  ) : (
                    <span className="text-green-500">Active</span>
                  )}
                </span>
              </div>

              {/* Fighter Comparison */}
              <div className="mt-2 mb-3">
                <h5 className="text-xs font-medium text-yellow-400 mb-2">
                  Combatants
                </h5>
                <div className="grid grid-cols-2 gap-2">
                  {/* Challenger */}
                  <div className="bg-stone-800/40 p-2 rounded-lg border border-yellow-500/10">
                    <div className="flex justify-between items-center mb-1">
                      <h6 className="text-xs font-medium text-stone-200">
                        Challenger
                      </h6>
                      {isChallenger && (
                        <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-yellow-400 text-xs font-medium mb-2 truncate">
                      {challenge.challengerName ||
                        `Fighter #${challenge.challengerId}`}
                    </p>

                    {/* Stance Badge */}
                    <div className="mb-2 flex items-center gap-1.5">
                      <div
                        className={`p-0.5 rounded-md ${stanceInfo[challengerStance]?.bgColor || "bg-gray-500/20"}`}
                      >
                        {stanceInfo[challengerStance]?.icon || (
                          <Swords className="h-3 w-3" />
                        )}
                      </div>
                      <span
                        className={`text-[10px] ${stanceInfo[challengerStance]?.color || "text-gray-400"}`}
                      >
                        {stanceInfo[challengerStance]?.label || "Unknown"}{" "}
                        Stance
                      </span>
                    </div>

                    {/* Equipment Section */}
                    <div className="space-y-1.5">
                      <div className="flex items-center">
                        <div className="bg-amber-700/30 p-0.5 rounded-md mr-1.5">
                          <Axe className="h-2.5 w-2.5 text-amber-400" />
                        </div>
                        <div className="flex-1">
                          <span className="text-[10px] text-stone-400 block leading-tight">
                            Weapon
                          </span>
                          <span className="text-[10px] text-amber-300 font-medium">
                            {getWeaponDisplayName(challengerWeapon)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <div className="bg-slate-600/30 p-0.5 rounded-md mr-1.5">
                          <Shield className="h-2.5 w-2.5 text-slate-400" />
                        </div>
                        <div className="flex-1">
                          <span className="text-[10px] text-stone-400 block leading-tight">
                            Armor
                          </span>
                          <span className="text-[10px] text-slate-300 font-medium">
                            {getArmorDisplayName(challengerArmor)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Defender */}
                  <div className="bg-stone-800/40 p-2 rounded-lg border border-yellow-500/10">
                    <div className="flex justify-between items-center mb-1">
                      <h6 className="text-xs font-medium text-stone-200">
                        Defender
                      </h6>
                      {!isChallenger && (
                        <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-yellow-400 text-xs font-medium mb-2 truncate">
                      {challenge.defenderName ||
                        `Fighter #${challenge.defenderId}`}
                    </p>

                    {/* Stance Badge */}
                    <div className="mb-2 flex items-center gap-1.5">
                      <div
                        className={`p-0.5 rounded-md ${stanceInfo[defenderStance]?.bgColor || "bg-gray-500/20"}`}
                      >
                        {stanceInfo[defenderStance]?.icon || (
                          <Shield className="h-3 w-3" />
                        )}
                      </div>
                      <span
                        className={`text-[10px] ${stanceInfo[defenderStance]?.color || "text-gray-400"}`}
                      >
                        {stanceInfo[defenderStance]?.label || "Unknown"} Stance
                      </span>
                    </div>

                    {/* Equipment Section */}
                    <div className="space-y-1.5">
                      <div className="flex items-center">
                        <div className="bg-amber-700/30 p-0.5 rounded-md mr-1.5">
                          <Axe className="h-2.5 w-2.5 text-amber-400" />
                        </div>
                        <div className="flex-1">
                          <span className="text-[10px] text-stone-400 block leading-tight">
                            Weapon
                          </span>
                          <span className="text-[10px] text-amber-300 font-medium">
                            {getWeaponDisplayName(defenderWeapon)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <div className="bg-slate-600/30 p-0.5 rounded-md mr-1.5">
                          <Shield className="h-2.5 w-2.5 text-slate-400" />
                        </div>
                        <div className="flex-1">
                          <span className="text-[10px] text-stone-400 block leading-tight">
                            Armor
                          </span>
                          <span className="text-[10px] text-slate-300 font-medium">
                            {getArmorDisplayName(defenderArmor)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-1.5 mt-3">
                {canAccept && (
                  <YellowButton
                    onClick={(e) => {
                      e.stopPropagation();
                      onAccept(challenge);
                    }}
                    className="w-full text-xs py-1.5 h-auto sm:text-xs sm:w-auto"
                    disabled={isProcessing || isAcceptingChallenge}
                  >
                    {isProcessing && isAcceptingChallenge ? (
                      <>
                        <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />{" "}
                        Accepting...
                      </>
                    ) : (
                      "Accept Challenge"
                    )}
                  </YellowButton>
                )}

                {canCancel && (
                  <YellowButton
                    onClick={(e) => {
                      e.stopPropagation();
                      onCancel(challenge);
                    }}
                    className="w-full text-xs py-1.5 h-auto sm:text-xs sm:w-auto"
                    variant="outline"
                    disabled={isProcessing || isCancellingChallenge}
                  >
                    {isProcessing && isCancellingChallenge ? (
                      <>
                        <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />{" "}
                        Cancelling...
                      </>
                    ) : (
                      "Cancel Challenge"
                    )}
                  </YellowButton>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
