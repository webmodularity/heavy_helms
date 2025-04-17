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
    <div className="flex items-center justify-center bg-gradient-to-b from-amber-900/10 to-stone-900/40 rounded-lg border border-yellow-600/20 p-6 relative overflow-hidden">
      <div className="flex items-center justify-center h-full min-h-[50px]">
        <SectionHeader
          title={character.name.fullName || "Warrior Details"}
          subtitle={subtitleElement || subtitle}
          className="relative z-10 text-center mb-0"
        />
      </div>
    </div>
  );
}
