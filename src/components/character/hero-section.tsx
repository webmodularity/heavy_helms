import type { Player } from "@/types/player.types";
import type { ReactNode } from "react";
import { useCharacterSubtitle } from "@/hooks/use-character-subtitle";
import { motion } from "framer-motion";
import { User, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  character: Player;
  subtitleElement?: ReactNode;
}

export function HeroSection({ character, subtitleElement }: HeroSectionProps) {
  // Get the correctly formatted subtitle
  const { subtitle } = useCharacterSubtitle(
    character.owner?.address,
    character.id,
  );

  return (
    <motion.div
      className="text-center space-y-2 py-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-center gap-2">
        {character.isImmortal && (
          <Crown className="h-5 w-5 text-warning" />
        )}
        <h1 className="font-pixel text-pixel-lg text-primary font-bold">
          {character.name.fullName || "UNKNOWN WARRIOR"}
        </h1>
        {character.isImmortal && (
          <Crown className="h-5 w-5 text-warning" />
        )}
      </div>
      
      <motion.div
        className="font-pixel text-pixel-sm text-primary/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {subtitle}
      </motion.div>

      {character.isImmortal && (
        <motion.div
          className="font-pixel text-pixel-xs text-warning font-bold uppercase tracking-wider"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
        >
          IMMORTAL STATUS
        </motion.div>
      )}
    </motion.div>
  );
}
