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
import type { Challenge } from "@/hooks/use-challenges";
import { StanceType } from "@/types/equipment.types";
import type { Player } from "@/types/player.types";
import {
  getArmorDisplayName,
  getWeaponDisplayName,
} from "@/lib/equipment-utils";
import { RetroButton } from "@/components/ui/retro-button";
import { cn } from "@/lib/utils";

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

  // Stance information mapping with retro colors
  const stanceInfo = {
    [StanceType.Defensive]: {
      icon: <Shield className="h-2.5 w-2.5" />,
      label: "Defensive",
      color: "text-success",
      bgColor: "bg-success/20",
      borderColor: "border-success/30",
    },
    [StanceType.Balanced]: {
      icon: <Swords className="h-2.5 w-2.5" />,
      label: "Balanced",
      color: "text-primary",
      bgColor: "bg-primary/20",
      borderColor: "border-primary/30",
    },
    [StanceType.Offensive]: {
      icon: <Flame className="h-2.5 w-2.5" />,
      label: "Offensive",
      color: "text-destructive",
      bgColor: "bg-destructive/20",
      borderColor: "border-destructive/30",
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
      className="border border-primary/30 rounded-pixel-md overflow-hidden bg-arcade-screen/20 mb-2 pixel-perfect"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ 
        borderColor: "rgb(var(--color-primary) / 0.5)",
        boxShadow: "0 0 8px rgb(var(--color-primary) / 0.3)"
      }}
    >
      {/* Challenge Summary - Always Visible */}
      <motion.div
        className="p-2.5 flex justify-between items-center cursor-pointer hover:bg-primary/5 transition-colors duration-200"
        onClick={onToggleExpand}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-2">
          <div className="bg-primary/20 p-1 rounded-pixel border border-primary/30 retro-box-glow">
            <Shield className="h-3 w-3 text-primary" />
          </div>
          <div>
            <h4 className="font-pixel text-pixel-xs text-primary font-bold uppercase">
              {isChallenger ? "YOUR CHALLENGE" : "DEFEND CHALLENGE"}
            </h4>
            <p className="font-pixel text-pixel-xs text-primary/70 truncate max-w-[180px]">
              {isChallenger
                ? `VS ${challenge.defenderName || `FIGHTER ${challenge.defenderId}`}`
                : `${challenge.challengerName || `FIGHTER ${challenge.challengerId}`} CHALLENGES YOU`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-warning font-pixel text-pixel-xs font-bold retro-text-glow">
            {formatEther(challenge.wagerAmount)} ETH
          </span>
          <ChevronRight
            className={cn(
              "h-3 w-3 text-primary/70 transition-transform duration-200",
              isExpanded ? "rotate-90" : ""
            )}
          />
        </div>
      </motion.div>

      {/* Expanded Challenge Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-primary/20 p-2.5 bg-arcade-bezel/30">
              {/* Challenge Info */}
              <motion.div 
                className="grid grid-cols-2 gap-y-1 mb-3"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                <span className="font-pixel text-pixel-xs text-primary/60 uppercase">ID:</span>
                <span className="font-pixel text-pixel-xs text-primary font-mono">
                  #{challenge.id.toString().slice(-6)}
                </span>

                <span className="font-pixel text-pixel-xs text-primary/60 uppercase">Block:</span>
                <span className="font-pixel text-pixel-xs text-primary">
                  #{challenge.createdBlock.toString()}
                </span>

                <span className="font-pixel text-pixel-xs text-primary/60 uppercase">Status:</span>
                <span className="font-pixel text-pixel-xs">
                  {challenge.fulfilled ? (
                    <span className="text-warning retro-text-glow">COMPLETED</span>
                  ) : (
                    <span className="text-success retro-text-glow">ACTIVE</span>
                  )}
                </span>
              </motion.div>

              {/* Fighter Comparison */}
              <motion.div 
                className="mb-3"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <h5 className="font-pixel text-pixel-sm text-primary font-bold uppercase mb-2 retro-text-glow">
                  COMBATANTS
                </h5>
                <div className="grid grid-cols-2 gap-2">
                  {/* Challenger */}
                  <motion.div 
                    className="bg-arcade-screen/30 p-2 rounded-pixel border border-primary/20 pixel-perfect"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: 0.25 }}
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <h6 className="font-pixel text-pixel-xs text-primary/70 uppercase">
                        Challenger
                      </h6>
                      {isChallenger && (
                        <span className="font-pixel text-[8px] bg-primary/20 text-primary px-1 py-0.5 rounded-pixel border border-primary/30 retro-text-glow">
                          YOU
                        </span>
                      )}
                    </div>
                    <p className="text-primary font-pixel text-pixel-xs font-bold mb-2 truncate">
                      {challenge.challengerName ||
                        `FIGHTER #${challenge.challengerId}`}
                    </p>

                    {/* Stance Badge */}
                    <div className="mb-2 flex items-center gap-1">
                      <div
                        className={cn(
                          "p-0.5 rounded-pixel border pixel-perfect",
                          stanceInfo[challengerStance]?.bgColor || "bg-primary/20",
                          stanceInfo[challengerStance]?.borderColor || "border-primary/30"
                        )}
                      >
                        {stanceInfo[challengerStance]?.icon || (
                          <Swords className="h-2.5 w-2.5" />
                        )}
                      </div>
                      <span
                        className={cn(
                          "font-pixel text-[9px] uppercase font-bold",
                          stanceInfo[challengerStance]?.color || "text-primary"
                        )}
                      >
                        {stanceInfo[challengerStance]?.label || "Unknown"}
                      </span>
                    </div>

                    {/* Equipment Section */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <div className="bg-warning/20 p-0.5 rounded-pixel border border-warning/30">
                          <Axe className="h-2 w-2 text-warning" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-pixel text-[8px] text-primary/60 block uppercase">
                            Weapon
                          </span>
                          <span className="font-pixel text-[9px] text-warning font-bold truncate block">
                            {getWeaponDisplayName(challengerWeapon)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <div className="bg-primary/20 p-0.5 rounded-pixel border border-primary/30">
                          <Shield className="h-2 w-2 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-pixel text-[8px] text-primary/60 block uppercase">
                            Armor
                          </span>
                          <span className="font-pixel text-[9px] text-primary font-bold truncate block">
                            {getArmorDisplayName(challengerArmor)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Defender */}
                  <motion.div 
                    className="bg-arcade-screen/30 p-2 rounded-pixel border border-primary/20 pixel-perfect"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: 0.3 }}
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <h6 className="font-pixel text-pixel-xs text-primary/70 uppercase">
                        Defender
                      </h6>
                      {!isChallenger && (
                        <span className="font-pixel text-[8px] bg-primary/20 text-primary px-1 py-0.5 rounded-pixel border border-primary/30 retro-text-glow">
                          YOU
                        </span>
                      )}
                    </div>
                    <p className="text-primary font-pixel text-pixel-xs font-bold mb-2 truncate">
                      {challenge.defenderName ||
                        `FIGHTER #${challenge.defenderId}`}
                    </p>

                    {/* Stance Badge */}
                    <div className="mb-2 flex items-center gap-1">
                      <div
                        className={cn(
                          "p-0.5 rounded-pixel border pixel-perfect",
                          stanceInfo[defenderStance]?.bgColor || "bg-primary/20",
                          stanceInfo[defenderStance]?.borderColor || "border-primary/30"
                        )}
                      >
                        {stanceInfo[defenderStance]?.icon || (
                          <Shield className="h-2.5 w-2.5" />
                        )}
                      </div>
                      <span
                        className={cn(
                          "font-pixel text-[9px] uppercase font-bold",
                          stanceInfo[defenderStance]?.color || "text-primary"
                        )}
                      >
                        {stanceInfo[defenderStance]?.label || "Unknown"}
                      </span>
                    </div>

                    {/* Equipment Section */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <div className="bg-warning/20 p-0.5 rounded-pixel border border-warning/30">
                          <Axe className="h-2 w-2 text-warning" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-pixel text-[8px] text-primary/60 block uppercase">
                            Weapon
                          </span>
                          <span className="font-pixel text-[9px] text-warning font-bold truncate block">
                            {getWeaponDisplayName(defenderWeapon)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <div className="bg-primary/20 p-0.5 rounded-pixel border border-primary/30">
                          <Shield className="h-2 w-2 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-pixel text-[8px] text-primary/60 block uppercase">
                            Armor
                          </span>
                          <span className="font-pixel text-[9px] text-primary font-bold truncate block">
                            {getArmorDisplayName(defenderArmor)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              <motion.div 
                className="flex flex-col gap-1.5"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.35 }}
              >
                {canAccept && (
                  <RetroButton
                    variant="arcade"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAccept(challenge);
                    }}
                    className="w-full retro-glow"
                    disabled={isProcessing || isAcceptingChallenge}
                  >
                    {isProcessing && isAcceptingChallenge ? (
                      <>
                        <Loader2 className="mr-1 h-2.5 w-2.5 animate-spin" />
                        <span className="font-pixel text-pixel-xs">ACCEPTING...</span>
                      </>
                    ) : (
                      <span className="font-pixel text-pixel-xs">ACCEPT CHALLENGE</span>
                    )}
                  </RetroButton>
                )}

                {canCancel && (
                  <RetroButton
                    variant="pixel"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCancel(challenge);
                    }}
                    className="w-full"
                    disabled={isProcessing || isCancellingChallenge}
                  >
                    {isProcessing && isCancellingChallenge ? (
                      <>
                        <Loader2 className="mr-1 h-2.5 w-2.5 animate-spin" />
                        <span className="font-pixel text-pixel-xs">CANCELLING...</span>
                      </>
                    ) : (
                      <span className="font-pixel text-pixel-xs">CANCEL CHALLENGE</span>
                    )}
                  </RetroButton>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
