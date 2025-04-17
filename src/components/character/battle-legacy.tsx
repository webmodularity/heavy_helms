"use client";

import type { Player } from "@/types/player.types";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { StatBox, formatBattleRating } from "./profile-helpers"; // Import from helpers

interface BattleLegacyProps {
  character: Player;
}

export function BattleLegacy({ character }: BattleLegacyProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }} // Adjust delay if needed
    >
      <div className="bg-gradient-to-b from-amber-900/10 to-stone-900/40 rounded-lg border border-yellow-600/20 p-6 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-700/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
        <h3 className="text-xl font-semibold text-yellow-500 mb-4 flex items-center relative z-10">
          <Trophy className="mr-2 h-5 w-5" />
          Battle Legacy
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative z-10">
          <StatBox
            label="Rank"
            value={character?.rank ? `#${character.rank}` : "N/A"}
            className="text-amber-500"
          />
          <StatBox
            label="Rating"
            value={formatBattleRating(character.battleRating)}
            className="text-yellow-400"
          />
          <StatBox
            label="Wins"
            value={character.record.wins.toString()}
            className="text-green-400"
          />
          <StatBox
            label="Losses"
            value={character.record.losses.toString()}
            className="text-red-400"
          />
          <StatBox
            label="Kills"
            value={character.record.kills.toString()}
            className="text-stone-200"
          />
        </div>
      </div>
    </motion.div>
  );
}
