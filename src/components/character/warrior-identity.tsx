"use client";

import type { Player } from "@/types/player.types";
import { motion } from "framer-motion";
import { Flag, Trash2, Loader2 } from "lucide-react";
import { StatBox } from "./profile-helpers";
import { Button } from "@/components/ui/button";

interface WarriorIdentityProps {
  character: Player;
  isOwner?: boolean;
  onRetireClick?: () => void;
  isRetiring?: boolean;
}

export function WarriorIdentity({
  character,
  isOwner,
  onRetireClick,
  isRetiring,
}: WarriorIdentityProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="bg-gradient-to-b from-amber-900/10 to-stone-900/40 rounded-lg border border-yellow-600/20 p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-600/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        <h3 className="text-xl font-semibold text-yellow-500 mb-4 flex items-center relative z-10">
          <Flag className="mr-2 h-5 w-5" />
          Warrior Identity
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          <StatBox
            label="ID"
            value={`#${character.id}`}
            className="text-stone-200"
          />

          <StatBox
            label="Status"
            value={character.isRetired ? "Retired" : "Active"}
            className={character.isRetired ? "text-red-400" : "text-green-400"}
            actionIcon={
              isOwner && !character.isRetired ? (
                isRetiring ? (
                  <Loader2 className="h-4 w-4 animate-spin text-red-400" />
                ) : (
                  <Trash2 className="h-4 w-4 text-red-400 hover:text-red-300" />
                )
              ) : undefined
            }
            onActionClick={
              isOwner && !character.isRetired && !isRetiring
                ? onRetireClick
                : undefined
            }
            isActionDisabled={isRetiring}
          />

          <StatBox
            label="Immortal"
            value={character.isImmortal ? "Yes" : "No"}
            className={
              character.isImmortal ? "text-yellow-400" : "text-stone-200"
            }
          />
        </div>
      </div>
    </motion.div>
  );
}
