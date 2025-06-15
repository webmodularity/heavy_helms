"use client";

import type { Player } from "@/types/player.types";
import { useRouter } from "next/navigation";
import { useRef, useEffect, useState } from "react";
import { CharacterCard } from "./playable-character-card";
import { NewCharacterCard } from "./new-character-card";
import { CharacterCardSkeleton } from "../ui/skeletons/character-card-skeleton";
import { useCreateCharacter } from "@/hooks/use-create-character";
import { useOwnPlayers } from "@/hooks/use-own-players";
import type { StanceType } from "@/types/equipment.types";
import { useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { HapticFeedback } from '@/lib/miniapp-utils';

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
  const characterListRef = useRef<HTMLDivElement>(null);
  const { players, isLoading } = useOwnPlayers();
  const { createCharacter, isCreatingCharacter, txHash } = useCreateCharacter();
  const queryClient = useQueryClient();
  const { address } = useAccount();
  const [activeIndex, setActiveIndex] = useState(0);

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

  const numPlayerCards = players?.length ?? 0;
  const showNewCharacterCard = players && players.length < MAX_PLAYERS;
  const totalScrollItems = numPlayerCards + (showNewCharacterCard ? 1 : 0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (isLoading || !characterListRef.current || totalScrollItems <= 1) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const elementNode = entry.target as HTMLElement;
            const index = Array.from(
              characterListRef.current?.children ?? [],
            ).indexOf(elementNode);

            if (index !== -1) {
              setActiveIndex(index);

              if (players && index < players.length) {
                const character = players[index] as Player;
                if (selectedCharacter?.id !== character.id) {
                  onSelectCharacter(character, character.stance);
                  // if (address) { // Temporarily comment out
                  //   queryClient.invalidateQueries({ queryKey: ["owned-players", address] });
                  // }
                }
              } else if (
                players &&
                index === players.length &&
                selectedCharacter
              ) {
                onDeselectCharacter();
              }
            }
          }
        }
      },
      {
        root: characterListRef.current,
        threshold: 0.5, // Trigger when 50% of the item is visible
      },
    );

    const children = characterListRef.current.children;
    for (let i = 0; i < children.length; i++) {
      observer.observe(children[i]);
    }

    return () => {
      for (let i = 0; i < children.length; i++) {
        observer.unobserve(children[i]);
      }
      observer.disconnect();
    };
  }, [
    isLoading,
    totalScrollItems,
    players,
    onSelectCharacter,
    onDeselectCharacter,
    address,
    queryClient,
  ]);

  const handleCharacterSelect = async (character: Player, newStance?: StanceType) => {
    onSelectCharacter(character, newStance ?? character.stance);
    await HapticFeedback.SELECT();
  };

  // Render skeleton loaders while characters are loading
  const renderSkeletons = () => {
    return <CharacterCardSkeleton index={0} />;
  };
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

      <div className="relative max-w-full">
        <div
          ref={characterListRef}
          className="flex gap-4 mt-3 overflow-x-auto pb-3 pt-1 snap-x snap-mandatory scrollbar-none items-start overscroll-x-contain px-[10%]"
        >
          {isLoading ? (
            renderSkeletons()
          ) : (
            <>
              {players?.map((character, index) => (
                <div
                  key={character.id}
                  className={`flex-shrink-0 snap-center w-[80%] transition-transform duration-300 ${
                    activeIndex === index
                      ? "scale-105 z-10"
                      : "scale-95 opacity-85"
                  }`}
                >
                  <CharacterCard
                    character={character as Player}
                    index={index}
                    isSelected={selectedCharacter?.id === character.id}
                    onSelect={(newStance) => {
                      handleCharacterSelect(character as Player, newStance as unknown as StanceType);
                    }}
                    onViewDetails={() => handleViewDetails(character as Player)}
                  />
                </div>
              ))}

              {/* Character Creation Card */}
              {players && players.length < MAX_PLAYERS ? (
                <div
                  className={`flex-shrink-0 snap-center w-[80%] transition-transform duration-300 ${
                    activeIndex === players.length
                      ? "scale-105 z-10"
                      : "scale-95 opacity-85"
                  }`}
                >
                  <NewCharacterCard
                    delay={players?.length || 0}
                    onClick={(namePreference: NamePreference) =>
                      createCharacter(namePreference)
                    }
                    isCreating={isCreatingCharacter}
                    txHash={txHash}
                  />
                </div>
              ) : null}
            </>
          )}
        </div>

        {/* Scroll Dots Indicator */}
        {!isLoading && totalScrollItems > 1 && (
          <div className="flex justify-center items-center pt-2 space-x-1.5">
            {Array.from({ length: totalScrollItems }).map((_, index) => (
              <div
                key={`dot-${
                  // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                  index
                }`}
                className={`w-1.5 h-1.5 rounded-full transition-colors duration-150 ${
                  index === activeIndex ? "bg-yellow-400" : "bg-gray-600"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
