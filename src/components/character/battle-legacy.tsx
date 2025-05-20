"use client";

import type { Player } from "@/types/player.types";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { formatBattleRating } from "./profile-helpers";

interface BattleLegacyProps {
  character: Player;
}

export function BattleLegacy({ character }: BattleLegacyProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-amber-700/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />
        <h3 className="text-sm font-semibold text-yellow-500 mb-2 flex items-center relative z-10">
          <Trophy className="mr-1 h-3 w-3" />
          Battle Legacy
        </h3>

        <div className="grid grid-cols-5 gap-1 relative z-10">
          <CompactStat
            label="Rank"
            value={character?.rank ? `#${character.rank}` : "N/A"}
            className="text-amber-500"
          />
          <CompactStat
            label="Rating"
            value={formatBattleRating(character.battleRating)}
            className="text-yellow-400"
          />
          <CompactStat
            label="Wins"
            value={character.record.wins.toString()}
            className="text-green-400"
          />
          <CompactStat
            label="Losses"
            value={character.record.losses.toString()}
            className="text-red-400"
          />
          <CompactStat
            label="Kills"
            value={character.record.kills.toString()}
            className="text-stone-200"
          />
        </div>
      </div>
    </motion.div>
  );
}

// A more compact version of StatBox specifically for this component
function CompactStat({
  label,
  value,
  className = "",
}: { label: string; value: string; className?: string }) {
  return (
    <div className="text-center p-1 bg-stone-800/30 rounded border border-yellow-600/10">
      <div className={`text-sm font-semibold ${className}`}>{value}</div>
      <div className="text-stone-400 text-xs">{label}</div>
    </div>
  );
}
