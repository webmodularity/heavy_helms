"use client";

import type { Player } from "@/types/player.types";
import { useRouter } from "next/navigation";
import { useRef, useMemo } from "react";
import { SectionHeader } from "../ui/section-header";
import { CharacterCard } from "./playable-character-card";
import { NewCharacterCard } from "./new-character-card";
import { CharacterCardSkeleton } from "../ui/skeletons/character-card-skeleton";
import { useCreateCharacter } from "@/hooks/use-create-character";
import { useOwnPlayers } from "@/hooks/use-own-players";

interface WarriorSelectionProps {
  selectedCharacter: Player | null;
  onSelectCharacter: (character: Player) => void;
  onDeselectCharacter: () => void;
}

export function WarriorSelection({
  selectedCharacter,
  onSelectCharacter,
  onDeselectCharacter,
}: WarriorSelectionProps) {
  const router = useRouter();
  const characterListRef = useRef<HTMLDivElement>(null);
  const { players, isLoading } = useOwnPlayers();
  const { createCharacter, isCreatingCharacter, txHash } = useCreateCharacter();

  const handleViewDetails = (character: Player) => {
    router.push(`/character/${character.id}`);
  };

  // Generate stable skeleton keys
  const skeletonKeys = useMemo(
    () =>
      Array(4)
        .fill(0)
        .map((_, i) => `skeleton-${i}`),
    [],
  );

  // Render skeleton loaders while characters are loading
  const renderSkeletons = () => {
    return skeletonKeys.map((key, index) => (
      <CharacterCardSkeleton key={key} index={index} />
    ));
  };

  return (
    <section className="mt-8 md:mt-12">
      <SectionHeader
        title="Warriors"
        subtitle="Select your warrior to enter the battles"
      />

      <div className="relative max-w-full px-4 md:px-6">
        <div
          ref={characterListRef}
          className="flex gap-4 md:gap-5 mt-4 overflow-x-auto pb-4 pt-2 snap-x scrollbar-thin scrollbar-thumb-yellow-600/20 scrollbar-track-transparent" 
        >
          {isLoading ? (
            renderSkeletons()
          ) : (
            <>
              {players?.map((character, index) => (
                <CharacterCard
                  key={character.id}
                  character={character}
                  index={index}
                  isSelected={selectedCharacter?.id === character.id}
                  onSelect={() => onSelectCharacter(character as Player)}
                  onDeselect={onDeselectCharacter}
                  onViewDetails={() => handleViewDetails(character as Player)}
                />
              ))}

              {/* Character Creation Card */}
              <NewCharacterCard
                delay={players?.length || 0}
                onClick={createCharacter}
                isCreating={isCreatingCharacter}
                txHash={txHash}
              />
            </>
          )}
        </div>
        
        {/* Scroll Indicators - Optional enhancement */}
        <div className="hidden md:block absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black/40 to-transparent pointer-events-none" />
      </div>
    </section>
  );
}
