"use client";

import { useState, useEffect } from "react";
import { StanceType } from "@/types/equipment.types";
import { Shield, Swords, Flame } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import type { Fighter } from "@/types/fighter-types";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { RetroToggleGroup, RetroToggleGroupItem } from "@/components/ui/retro-toggle-group";

interface RetroStanceSelectorProps {
  character: Fighter;
  currentStance: StanceType;
  onStanceChange: (newStance: StanceType) => void;
  size?: "sm" | "default" | "lg";
}

export function RetroStanceSelector({
  character,
  currentStance,
  onStanceChange,
  size = "default",
}: RetroStanceSelectorProps) {
  const [selectedStance, setSelectedStance] = useState<string>(currentStance.toString());
  const queryClient = useQueryClient();
  const { address } = useAccount();

  // Sync with external prop changes
  useEffect(() => {
    setSelectedStance(currentStance.toString());
  }, [currentStance]);

  const stanceInfo = {
    [StanceType.Defensive]: {
      icon: <Shield className={cn(size === "sm" ? "h-2.5 w-2.5" : "h-4 w-4")} />,
      label: "DEF",
      description: "HIGHER BLOCK • LOWER DAMAGE",
      value: StanceType.Defensive.toString(),
      color: "text-success",
    },
    [StanceType.Balanced]: {
      icon: <Swords className={cn(size === "sm" ? "h-2.5 w-2.5" : "h-4 w-4")} />,
      label: "BAL",
      description: "EQUAL OFFENSE • DEFENSE",
      value: StanceType.Balanced.toString(),
      color: "text-primary",
    },
    [StanceType.Offensive]: {
      icon: <Flame className={cn(size === "sm" ? "h-2.5 w-2.5" : "h-4 w-4")} />,
      label: "OFF",
      description: "HIGHER DAMAGE • LOWER DEFENSE",
      value: StanceType.Offensive.toString(),
      color: "text-destructive",
    },
  };

  const handleStanceChange = (value: string) => {
    console.log("Stance selector handleStanceChange:", value); // Debug log
    const newStance = Number(value) as StanceType;
    
    setSelectedStance(value);
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

  console.log("Current selectedStance:", selectedStance); // Debug log

  return (
    <motion.div
      className="space-y-1.5 pixel-perfect"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay: 0.1 }}
    >
      <motion.p
        className={cn(
          "font-pixel font-bold text-primary/80 uppercase tracking-wider text-center retro-glow",
          size === "sm" ? "text-pixel-xs" : "text-pixel-sm"
        )}
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.15 }}
      >
        COMBAT STANCE
      </motion.p>

      <RetroToggleGroup
        type="single"
        value={selectedStance}
        onValueChange={handleStanceChange}
        variant="arcade"
        size={size === "sm" ? "sm" : "default"}
      >
        {Object.values(stanceInfo).map((stance) => (
          <RetroToggleGroupItem
            key={stance.value}
            value={stance.value}
            icon={
              <span className={stance.color}>
                {stance.icon}
              </span>
            }
            label={stance.label}
            aria-label={`Set stance to ${stance.label}`}
          />
        ))}
      </RetroToggleGroup>

      {size !== "sm" && (
        <motion.p
          className="text-pixel-xs text-center text-foreground/60 font-pixel uppercase tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.25 }}
        >
          {stanceInfo[Number(selectedStance) as StanceType]?.description}
        </motion.p>
      )}
    </motion.div>
  );
} 