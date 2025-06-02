"use client";

import { useState } from "react";
import { StanceType } from "@/types/equipment.types";
import { Shield, Swords, Flame } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import type { Fighter } from "@/types/fighter-types";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface RetroStanceSelectorProps {
  character: Fighter;
  currentStance: StanceType;
  onStanceChange: (newStance: StanceType) => void;
  size?: "compact" | "default";
}

export function RetroStanceSelector({
  character,
  currentStance,
  onStanceChange,
  size = "default",
}: RetroStanceSelectorProps) {
  const [stance, setStance] = useState<StanceType>(currentStance);
  const queryClient = useQueryClient();
  const { address } = useAccount();

  // Icons and descriptions for different stances with retro styling
  const stanceInfo = {
    [StanceType.Defensive]: {
      icon: <Shield className={cn(size === "compact" ? "h-2.5 w-2.5" : "h-4 w-4")} />,
      label: "DEF",
      description: "HIGHER BLOCK • LOWER DAMAGE",
      color: "from-success/60 to-success/90",
      borderColor: "border-success/30",
      textColor: "text-success",
    },
    [StanceType.Balanced]: {
      icon: <Swords className={cn(size === "compact" ? "h-2.5 w-2.5" : "h-4 w-4")} />,
      label: "BAL",
      description: "EQUAL OFFENSE • DEFENSE",
      color: "from-primary/60 to-primary/90", 
      borderColor: "border-primary/30",
      textColor: "text-primary",
    },
    [StanceType.Offensive]: {
      icon: <Flame className={cn(size === "compact" ? "h-2.5 w-2.5" : "h-4 w-4")} />,
      label: "OFF",
      description: "HIGHER DAMAGE • LOWER DEFENSE",
      color: "from-destructive/60 to-destructive/90",
      borderColor: "border-destructive/30", 
      textColor: "text-destructive",
    },
  };

  const handleStanceChange = (newStance: StanceType) => {
    setStance(newStance);
    onStanceChange(newStance);

    // Update React Query cache
    queryClient.setQueryData(
      ["player", character.id],
      (oldData: Fighter | undefined) => {
        if (!oldData) return undefined;
        return { ...oldData, stance: newStance };
      },
    );

    queryClient.setQueryData(
      ["owned-players", address],
      (oldData: Fighter[] | undefined) => {
        if (!oldData) return undefined;
        return oldData.map((player) =>
          player.id === character.id
            ? { ...player, stance: newStance }
            : player,
        );
      },
    );
  };

  const isCompact = size === "compact";

  return (
    <motion.div
      className="space-y-1.5 pixel-perfect"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay: 0.1 }}
    >
      <motion.p
        className={cn(
          "font-pixeloid font-bold text-primary/60 uppercase tracking-wider",
          isCompact ? "text-pixel-xs" : "text-pixel-sm"
        )}
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.15 }}
      >
        COMBAT STANCE
      </motion.p>

      <motion.div
        className={cn(
          "grid grid-cols-3 gap-0.5 bg-card/60 rounded-pixel border border-primary/20 p-1",
          isCompact ? "p-1" : "p-1.5"
        )}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        {Object.entries(stanceInfo).map(([value, info]) => {
          const stanceValue = Number(value) as StanceType;
          const isSelected = stance === stanceValue;
          
          return (
            <motion.button
              key={value}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleStanceChange(stanceValue);
              }}
              className={cn(
                "relative flex flex-col items-center gap-0.5 rounded-pixel-sm transition-all duration-200 font-pixeloid pixel-perfect cursor-pointer",
                isCompact ? "py-1 px-1" : "py-1.5 px-2",
                isSelected 
                  ? `bg-gradient-to-b ${info.color} border ${info.borderColor} retro-glow` 
                  : "bg-card/40 border border-muted/20 hover:border-primary/30 hover:bg-card/60"
              )}
              whileHover={!isSelected ? { scale: 1.02 } : {}}
              whileTap={{ scale: 0.98 }}
            >
              {/* Icon */}
              <span className={cn(
                isSelected ? info.textColor : "text-muted",
                "transition-colors duration-200"
              )}>
                {info.icon}
              </span>
              
              {/* Label */}
              <span className={cn(
                "font-bold uppercase tracking-wider transition-colors duration-200",
                isCompact ? "text-pixel-xs" : "text-pixel-xs",
                isSelected ? "text-background" : "text-foreground/70"
              )}>
                {info.label}
              </span>

              {/* Selection indicator */}
              {isSelected && (
                <motion.div
                  className="absolute inset-0 border border-primary/50 rounded-pixel-sm"
                  layoutId="stance-selection"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}

              {/* Scanlines effect for selected */}
              {isSelected && (
                <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(255,255,255,0.05)_50%)] bg-[length:100%_2px] pointer-events-none rounded-pixel-sm" />
              )}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Description */}
      {!isCompact && (
        <motion.p
          className="text-pixel-xs text-center text-foreground/60 font-pixeloid uppercase tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.25 }}
        >
          {stanceInfo[stance].description}
        </motion.p>
      )}
    </motion.div>
  );
} 