"use client";

import type { Player } from "@/types/player.types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CharacterCard } from "./playable-character-card";
import { NewCharacterCard } from "./new-character-card";
import { CharacterCardSkeleton } from "../ui/skeletons/character-card-skeleton";
import { RetroCarousel } from "@/components/ui/retro-carousel";
import { useCreateCharacter } from "@/hooks/use-create-character";
import { useOwnPlayers } from "@/hooks/use-own-players";
import type { StanceType } from "@/types/equipment.types";

// Define type for name preference - can be shared or defined locally
type NamePreference = "male" | "female";

interface WarriorSelectionProps {
  selectedCharacter: Player | null;
  onSelectCharacter: (character: Player, stance?: StanceType) => void;
  onDeselectCharacter: () => void;
}

// TODO: This is a temporary limit. We will remove this hardcoded value once we have the ability to buy a new player slot
const MAX_PLAYERS = 5;

export function WarriorSelection({
  selectedCharacter,
  onSelectCharacter,
  onDeselectCharacter,
}: WarriorSelectionProps) {
  const router = useRouter();
  const { players, isLoading } = useOwnPlayers();
  const { createCharacter, isCreatingCharacter, txHash } = useCreateCharacter();

  // Effect to refresh selectedCharacter if its underlying data changes
  useEffect(() => {
    if (selectedCharacter && players && players.length > 0) {
      const currentlySelectedPlayerFromList = players.find(
        (p) => p.id === selectedCharacter.id,
      );

      if (
        currentlySelectedPlayerFromList &&
        currentlySelectedPlayerFromList.gauntletStatus !==
          selectedCharacter.gauntletStatus
      ) {
        onSelectCharacter(
          currentlySelectedPlayerFromList as Player,
          (currentlySelectedPlayerFromList as Player).stance,
        );
      }
    }
  }, [players, selectedCharacter, onSelectCharacter]);

  const handleViewDetails = (character: Player) => {
    router.push(`/character/${character.id}`);
  };

  // Handle carousel item intersection
  const handleItemIntersect = (index: number, isIntersecting: boolean) => {
    if (!isIntersecting || !players) return;

    if (index < players.length) {
      const character = players[index] as Player;
      if (selectedCharacter?.id !== character.id) {
        onSelectCharacter(character, character.stance);
      }
    } else if (index === players.length && selectedCharacter) {
      onDeselectCharacter();
    }
  };

  // Create carousel items
  const carouselItems = [
    ...(players?.map((character, index) => (
      <CharacterCard
        key={character.id}
        character={character as Player}
        index={index}
        isSelected={selectedCharacter?.id === character.id}
        onSelect={(newStance) => {
          onSelectCharacter(
            character as Player,
            (newStance as unknown as StanceType) ?? character.stance,
          );
        }}
        onViewDetails={() => handleViewDetails(character as Player)}
      />
    )) || []),
    ...(players && players.length < MAX_PLAYERS ? [
      <NewCharacterCard
        key="new-character"
        delay={players?.length || 0}
        onClick={(namePreference: NamePreference) =>
          createCharacter(namePreference)
        }
        isCreating={isCreatingCharacter}
        txHash={txHash}
      />
    ] : [])
  ];

  if (isLoading) {
    return (
      <section className="mt-3">
        <div className="text-center mb-3">
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600 uppercase tracking-wider">
            Warriors
          </h2>
          <div className="text-yellow-400/90 text-xs font-medium">
            Select your warrior to enter the battles
          </div>
        </div>
        <CharacterCardSkeleton index={0} />
      </section>
    );
  }

  return (
    <section className="mt-3">
      <div className="text-center mb-3">
        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600 uppercase tracking-wider">
          Warriors
        </h2>
        <div className="text-yellow-400/90 text-xs font-medium">
          Select your warrior to enter the battles
        </div>
      </div>

      <RetroCarousel
        variant="warrior"
        itemWidth="medium"
        showNavigation={false}
        showDots={true}
        autoSelect={true}
        items={carouselItems}
        onItemIntersect={handleItemIntersect}
        loading={isLoading}
      />
    </section>
  );
}
