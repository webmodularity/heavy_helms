"use client";

import type { Player } from "@/types/player.types";
import { useRouter } from "next/navigation";
import { useRef, useMemo, useEffect, useState } from "react";
import { SectionHeader } from "../ui/section-header";
import { CharacterCard } from "./playable-character-card";
import { NewCharacterCard } from "./new-character-card";
import { CharacterCardSkeleton } from "../ui/skeletons/character-card-skeleton";
import { useCreateCharacter } from "@/hooks/use-create-character";
import { useOwnPlayers } from "@/hooks/use-own-players";
import type { StanceType } from "@/types/equipment.types";
import { useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";

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
        // Call onSelectCharacter with the fresh player object and its current stance
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

  // Generate stable skeleton keys
  // const skeletonKeys = useMemo(
  //   () =>
  //     Array(4)
  //       .fill(0)
  //       .map((_, i) => `skeleton-${i}`),
  //   [],
  // );

  const numPlayerCards = players?.length ?? 0;
  const showNewCharacterCard = players && players.length < MAX_PLAYERS;
  const totalScrollItems = numPlayerCards + (showNewCharacterCard ? 1 : 0);

  useEffect(() => {
    if (isLoading || !characterListRef.current || totalScrollItems <= 1) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            // Find the index of the intersecting element
            const elementNode = entry.target as HTMLElement;
            const index = Array.from(
              characterListRef.current?.children ?? [],
            ).indexOf(elementNode);
            if (index !== -1) {
              setActiveIndex(index);
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
  }, [isLoading, totalScrollItems]);

  // Render skeleton loaders while characters are loading
  const renderSkeletons = () => {
    // return skeletonKeys.map((key, index) => (
    return <CharacterCardSkeleton index={0} />;
    // ));
  };
  return (
    <section className="mt-4">
      <SectionHeader
        title="Warriors"
        subtitle="Select your warrior to enter the battles"
      />

      <div className="relative max-w-full px-4">
        <div
          ref={characterListRef}
          className="flex gap-2 mt-4 overflow-x-auto pb-4 pt-2 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-yellow-600/20 scrollbar-track-transparent items-start overscroll-x-contain"
        >
          {isLoading ? (
            renderSkeletons()
          ) : (
            <>
              {players?.map((character, index) => (
                <div
                  key={character.id}
                  className="flex-shrink-0 snap-center w-full"
                >
                  <CharacterCard
                    character={character as Player}
                    index={index}
                    isSelected={selectedCharacter?.id === character.id}
                    onSelect={(newStance) => {
                      onSelectCharacter(
                        character as Player,
                        (newStance as unknown as StanceType) ??
                          character.stance,
                      );
                      if (address) {
                        queryClient.invalidateQueries({
                          queryKey: ["owned-players", address],
                        });
                      }
                    }}
                    onDeselect={() => {
                      onDeselectCharacter();
                      if (address) {
                        queryClient.invalidateQueries({
                          queryKey: ["owned-players", address],
                        });
                      }
                    }}
                    onViewDetails={() => handleViewDetails(character as Player)}
                  />
                </div>
              ))}

              {/* Character Creation Card */}
              {players && players.length < MAX_PLAYERS ? (
                <div className="flex-shrink-0 snap-center w-full">
                  <NewCharacterCard
                    delay={players?.length || 0}
                    onClick={(namePreference: NamePreference) =>
                      createCharacter(namePreference)
                    }
                    isCreating={isCreatingCharacter}
                    txHash={txHash}
                  />
                </div>
              ) : (
                <></>
              )}
            </>
          )}
        </div>

        {/* Scroll Dots Indicator */}
        {!isLoading && totalScrollItems > 1 && (
          <div className="flex justify-center items-center pt-3 space-x-2">
            {Array.from({ length: totalScrollItems }).map((_, index) => (
              <div
                key={`dot-${index}`}
                className={`w-2 h-2 rounded-full transition-colors duration-150 ${
                  index === activeIndex ? "bg-yellow-400" : "bg-gray-600"
                }`}
              />
            ))}
          </div>
        )}

        {/* Scroll Indicators - Optional enhancement */}
        {/* The following div will be removed as it's md:block and desktop is not a priority */}
        {/* <div className="hidden md:block absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black/40 to-transparent pointer-events-none" /> */}
      </div>
    </section>
  );
}
