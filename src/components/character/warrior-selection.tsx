"use client";

import { usePlayer } from "@/store/player-context";
import type { Character } from "@/types/player.types";
import { useRouter } from "next/navigation";
import { useRef, useMemo } from "react";
import { SectionHeader } from "../ui/section-header";
import { CharacterCard } from "./playable-character-card";
import { NewCharacterCard } from "./new-character-card";
import { CharacterCardSkeleton } from "../ui/skeletons/character-card-skeleton";

interface WarriorSelectionProps {
  selectedCharacter: Character | null;
  onSelectCharacter: (character: Character) => void;
  onDeselectCharacter: () => void;
}

export function WarriorSelection({
  selectedCharacter,
  onSelectCharacter,
  onDeselectCharacter,
}: WarriorSelectionProps) {
  const router = useRouter();
  const characterListRef = useRef<HTMLDivElement>(null);
  const { createCharacter, isCreatingCharacter, txHash } = usePlayer();
  const { characters: players, isLoading } = usePlayer();
  console.log("players", players);

  const handleViewDetails = (character: Character) => {
    router.push(`/character/${character.playerId}`);
  };

  // Generate stable skeleton keys
  const skeletonKeys = useMemo(() => 
    Array(4).fill(0).map((_, i) => `skeleton-${i}`), 
    []
  );

  // Render skeleton loaders while characters are loading
  const renderSkeletons = () => {
    return skeletonKeys.map((key, index) => 
      <CharacterCardSkeleton key={key} index={index} />
    );
  };

  return (
    <section className="mt-8 md:mt-12">
      <SectionHeader
        title="Warriors"
        subtitle="Select your warrior to enter the battles"
      />

      <div
        ref={characterListRef}
        className="flex space-x-4 md:space-x-6 mt-4 overflow-x-auto pb-4 snap-x"
      >
        {isLoading ? (
          renderSkeletons()
        ) : (
          <>
            {players.map((character, index) => (
              <CharacterCard
                key={character.playerId}
                character={character}
                index={index}
                isSelected={selectedCharacter?.playerId === character.playerId}
                onSelect={() => onSelectCharacter(character)}
                onDeselect={onDeselectCharacter}
                onViewDetails={() => handleViewDetails(character)}
              />
            ))}

            {/* Character Creation Card */}
            <NewCharacterCard
              delay={players.length}
              onClick={createCharacter}
              isCreating={isCreatingCharacter}
              txHash={txHash}
            />
          </>
        )}
      </div>
    </section>
  );
}
