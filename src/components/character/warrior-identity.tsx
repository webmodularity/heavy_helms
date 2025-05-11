"use client";

import type { Player } from "@/types/player.types";
import { motion } from "framer-motion";
import { Flag } from "lucide-react";
import { StatBox } from "./profile-helpers";

interface WarriorIdentityProps {
  character: Player;
}

export function WarriorIdentity({ character }: WarriorIdentityProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-600/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl" />
        <h3 className="text-sm font-semibold text-yellow-500 mb-2 flex items-center relative z-10">
          <Flag className="mr-1 h-3 w-3" />
          Warrior Identity
        </h3>

        <div className="grid grid-cols-3 gap-2 relative z-10">
          <CompactStat 
            label="ID" 
            value={`#${character.id}`} 
            className="text-stone-200"
          />
          <CompactStat 
            label="Status" 
            value={character.isRetired ? "Retired" : "Active"} 
            className={character.isRetired ? "text-red-400" : "text-green-400"} 
          />
          <CompactStat 
            label="Immortal" 
            value={character.isImmortal ? "Yes" : "No"} 
            className={character.isImmortal ? "text-yellow-400" : "text-stone-200"} 
          />
        </div>
      </div>
    </motion.div>
  );
}

// A more compact version of StatBox specifically for this component
function CompactStat({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className="text-center p-1 bg-stone-800/30 rounded border border-yellow-600/10">
      <div className={`text-sm font-semibold ${className}`}>
        {value}
      </div>
      <div className="text-stone-400 text-xs">
        {label}
      </div>
    </div>
  );
}
