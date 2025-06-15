"use client";

import type { Player } from "@/types/player.types";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { CompactCharacterCard } from "./compact-character-card";
import { CompactNewCharacterCard } from "./compact-new-character-card";
import { CharacterCardGridSkeleton } from "../ui/skeletons/character-card-grid-skeleton";
import { useCreateCharacter } from "@/hooks/use-create-character";
import { useOwnPlayers } from "@/hooks/use-own-players";
import type { StanceType } from "@/types/equipment.types";
import { HapticFeedback } from "@/lib/miniapp-utils";

// Define type for name preference
type NamePreference = "male" | "female";

interface WarriorSelectionGridProps {
  selectedCharacter: Player | null;
  onSelectCharacter: (character: Player, stance?: StanceType) => void;
  onDeselectCharacter: () => void;
}

// TODO: This is a temporary limit. We will remove this hardcoded value once we have the ability to buy a new player slot
const MAX_PLAYERS = 5;

export function WarriorSelectionGrid({
  selectedCharacter,
  onSelectCharacter,
  onDeselectCharacter,
}: WarriorSelectionGridProps) {
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

  // Auto-select first character when component mounts
  useEffect(() => {
    if (players && players.length > 0 && !selectedCharacter) {
      onSelectCharacter(players[0] as Player, (players[0] as Player).stance);
    }
  }, [players, selectedCharacter, onSelectCharacter]);

  const handleViewDetails = (character: Player) => {
    router.push(`/character/${character.id}`);
  };

  const handleCharacterSelect = useCallback(async (
    character: Player,
    newStance?: StanceType,
  ) => {
    onSelectCharacter(character, newStance ?? character.stance);
    await HapticFeedback.SELECT();
  }, [onSelectCharacter]);

  const showNewCharacterCard = players && players.length < MAX_PLAYERS;

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
        <CharacterCardGridSkeleton />
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

      <div className="grid grid-cols-2 gap-4 p-4">
        {players?.map((character, index) => (
          <CompactCharacterCard
            key={character.id}
            character={character as Player}
            index={index}
            isSelected={selectedCharacter?.id === character.id}
            onSelect={(char, stance) => handleCharacterSelect(char, stance)}
            onViewDetails={() => handleViewDetails(character as Player)}
          />
        ))}

        {/* Character Creation Card */}
        {showNewCharacterCard && (
          <CompactNewCharacterCard
            delay={players?.length || 0}
            onClick={(namePreference: NamePreference) =>
              createCharacter(namePreference)
            }
            isCreating={isCreatingCharacter}
            txHash={txHash}
          />
        )}
      </div>
    </section>
  );
} 