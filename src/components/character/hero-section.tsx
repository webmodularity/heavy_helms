import { SectionHeader } from "@/components/ui/section-header";
import { motion } from "framer-motion";
import type { Player } from "@/types/player.types";

interface HeroSectionProps {
  character: Player;
}

export function HeroSection({ character }: HeroSectionProps) {
  return (
    <motion.div
      className="relative rounded-lg overflow-hidden mb-12 border border-yellow-600/20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-amber-900/30 via-stone-900/70 to-amber-900/30 z-0 animate-gradient-x" />
      <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,rgba(251,191,36,0.05)_0deg,rgba(41,37,36,0.1)_120deg,rgba(251,191,36,0.05)_240deg,rgba(41,37,36,0.05)_360deg)] opacity-30 z-0" />

      <div className="relative z-10 p-8 md:p-12">
        <SectionHeader
          title={character.name.fullName || "Warrior Details"}
          subtitle={character.id}
        />

        <p className="text-yellow-400/70 max-w-2xl mt-4 text-center md:text-left">
          A {character.isImmortal ? "immortal" : "mortal"} warrior with a legacy
          of {character.record.wins} victories in the arena. Known for
          exceptional{" "}
          {character.attributes.strength > 7
            ? "strength"
            : character.attributes.agility > 7
              ? "agility"
              : "balanced skills"}{" "}
          and tactical prowess.
        </p>
      </div>
    </motion.div>
  );
}
