"use client";

import { useState } from "react";
import { StanceType } from "@/types/equipment.types";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Shield, Swords, Flame } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import type { Fighter } from "@/types/fighter-types";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";

interface StanceSelectorProps {
  character: Fighter;
  currentStance: StanceType;
  onStanceChange: (newStance: StanceType) => void;
}

export function StanceSelector({
  character,
  currentStance,
  onStanceChange,
}: StanceSelectorProps) {
  const [stance, setStance] = useState<StanceType>(currentStance);
  const queryClient = useQueryClient();
  const { address } = useAccount();

  // Icons and descriptions for different stances
  const stanceInfo = {
    [StanceType.Defensive]: {
      icon: <Shield className="h-4 w-4" />,
      label: "Defensive",
      description: "Higher block chance, lower damage",
      color: "bg-gradient-to-r from-emerald-700 to-emerald-500",
    },
    [StanceType.Balanced]: {
      icon: <Swords className="h-4 w-4" />,
      label: "Balanced",
      description: "Equal offense and defense",
      color: "bg-gradient-to-r from-blue-700 to-blue-500",
    },
    [StanceType.Offensive]: {
      icon: <Flame className="h-4 w-4" />,
      label: "Offensive",
      description: "Higher damage, lower defense",
      color: "bg-gradient-to-r from-orange-700 to-orange-500",
    },
  };

  const handleStanceChange = (value: string) => {
    const newStance = Number(value) as StanceType;
    setStance(newStance);
    onStanceChange(newStance);
    // Update the React Query cache for both hooks

    // 1. Update individual player cache
    queryClient.setQueryData(
      ["player", character.id],
      (oldData: Fighter | undefined) => {
        if (!oldData) return undefined;
        return { ...oldData, stance: newStance };
      },
    );

    // 2. Update the owned-players cache
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

  return (
    <motion.div
      className="space-y-3 px-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay: 0.1 }}
    >
      <motion.p
        className="text-xs font-medium text-zinc-400"
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.15 }}
      >
        Combat Stance
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <ToggleGroup
          type="single"
          value={String(stance)}
          onValueChange={handleStanceChange}
          className="flex justify-between p-1 bg-stone-800/60 rounded-lg border border-yellow-500/20"
        >
          {Object.entries(stanceInfo).map(([value, info]) => (
            <ToggleGroupItem
              key={value}
              value={value}
              className="flex-1 h-full data-[state=on]:bg-transparent relative group"
            >
              <div className="flex flex-col items-center gap-1 py-2 relative z-10">
                <span className="text-yellow-400">{info.icon}</span>
                <span className="text-xs font-medium text-zinc-200">
                  {info.label}
                </span>
              </div>

              {stance === Number(value) && (
                <motion.div
                  layoutId="stance-highlight"
                  className={`absolute inset-0 ${info.color} rounded opacity-20`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.2 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </motion.div>

      <motion.p
        className="text-[11px] text-center text-zinc-500 italic"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.25 }}
      >
        {stanceInfo[stance].description}
      </motion.p>
    </motion.div>
  );
}
