"use client";

import type { Player } from "@/types/player.types";
import { useRouter } from "next/navigation";
import { useRef, useEffect, useState } from "react";
import { RetroCharacterCard } from "@/components/character/retro-character-card";
import { RetroNewCharacterCard } from "@/components/character/retro-new-character-card";
import {
  RetroCard,
  RetroCardContent,
  RetroCardHeader,
  RetroCardTitle,
} from "@/components/ui/retro-card";
import { RetroSpinner } from "@/components/ui/retro-spinner";
import { useCreateCharacter } from "@/hooks/use-create-character";
import { useOwnPlayers } from "@/hooks/use-own-players";
import type { StanceType } from "@/types/equipment.types";
import { useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { cn } from "@/lib/utils";

type NamePreference = "male" | "female";

interface RetroWarriorSelectionProps {
  selectedCharacter: Player | null;
  onSelectCharacter: (character: Player, stance?: StanceType) => void;
  onDeselectCharacter: () => void;
}

const MAX_PLAYERS = 5;

export function RetroWarriorSelection({
  selectedCharacter,
  onSelectCharacter,
  onDeselectCharacter,
}: RetroWarriorSelectionProps) {
  const router = useRouter();
  const characterListRef = useRef<HTMLDivElement>(null);
  const { players, isLoading } = useOwnPlayers();
  const { createCharacter, isCreatingCharacter, txHash } = useCreateCharacter();
  const queryClient = useQueryClient();
  const { address } = useAccount();
  const [activeIndex, setActiveIndex] = useState(0);

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
        threshold: 0.5,
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

  const renderSkeletons = () => {
    return (
      <div className="flex gap-4 px-[10%] py-4">
        {[...Array(3)].map((_, i) => (
          <RetroCard
            key={i}
            variant="pixel"
            className="flex-shrink-0 w-[80%] h-64 animate-pulse"
          >
            <RetroCardContent className="h-full flex items-center justify-center">
              <RetroSpinner variant="arcade" size="lg" withGlow />
            </RetroCardContent>
          </RetroCard>
        ))}
      </div>
    );
  };

  return (
    <section className="mt-3">
      {/* Section Header */}
      <RetroCard variant="arcade" className="mb-6" size="sm">
        <RetroCardHeader variant="arcade">
          <RetroCardTitle variant="arcade" className="text-center">
            WARRIOR ROSTER
          </RetroCardTitle>
        </RetroCardHeader>
        <RetroCardContent>
          <div className="text-center font-pixel text-pixel-xs text-primary/80">
            SELECT COMBAT UNIT • CONFIGURE STANCE • DEPLOY TO BATTLEFIELD
          </div>
        </RetroCardContent>
      </RetroCard>

      {/* Character Selection Scroll - IMPROVED SPACING */}
      <div className="relative max-w-full">
        {/* Added breathing room container */}
        <div className="py-6 px-2">
          <div
            ref={characterListRef}
            className={cn(
              "flex gap-4 overflow-x-auto snap-x snap-mandatory",
              "scrollbar-none items-start overscroll-x-contain",
              "px-[8%] py-4", // Added more padding for glow effects
              "bg-gradient-to-r from-transparent via-primary/5 to-transparent rounded-retro",
            )}
          >
            {isLoading ? (
              renderSkeletons()
            ) : (
              <>
                {players?.map((character, index) => (
                  <div
                    key={character.id}
                    className={cn(
                      "flex-shrink-0 snap-center w-[75%] transition-all duration-300",
                      // Added more spacing for glow effects to breathe
                      "p-2", // Padding around each card for glow space
                      activeIndex === index
                        ? "scale-105 z-10"
                        : "scale-95 opacity-75",
                    )}
                  >
                    <RetroCharacterCard
                      character={character as Player}
                      index={index}
                      isSelected={selectedCharacter?.id === character.id}
                      onSelect={(newStance) => {
                        onSelectCharacter(
                          character as Player,
                          (newStance as unknown as StanceType) ??
                            character.stance,
                        );
                      }}
                      onViewDetails={() => handleViewDetails(character as Player)}
                    />
                  </div>
                ))}

                {showNewCharacterCard && (
                  <div
                    className={cn(
                      "flex-shrink-0 snap-center w-[75%] transition-all duration-300",
                      "p-2", // Consistent padding for glow space
                      activeIndex === numPlayerCards
                        ? "scale-105 z-10"
                        : "scale-95 opacity-75",
                    )}
                  >
                    <RetroNewCharacterCard
                      delay={0.5}
                      onClick={() => {}}
                      isCreating={false}
                      txHash={null}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
