import { SectionHeader } from "@/components/ui/section-header";
import type { Player } from "@/types/player.types";
import type { ReactNode } from "react";
import { useCharacterSubtitle } from "@/hooks/use-character-subtitle";

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
    <div className="p-2 bg-gradient-to-b from-amber-900/10 to-stone-900/40 rounded-lg border border-yellow-600/20 relative overflow-hidden">
      <div className="flex flex-col items-center">
        <h2 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600 uppercase tracking-wider">
          {character.name.fullName || "Warrior Details"}
        </h2>
        <div className="text-yellow-400/90 text-xs md:text-sm font-medium">
          {subtitle}
        </div>
      </div>
    </div>
  );
}
