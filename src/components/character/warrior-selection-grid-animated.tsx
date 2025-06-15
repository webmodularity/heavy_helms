"use client";

import type { Player } from "@/types/player.types";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { EnhancedCompactCharacterCard } from "./enhanced-compact-character-card";
import { CompactNewCharacterCard } from "./compact-new-character-card";
import { CharacterCardGridSkeleton } from "../ui/skeletons/character-card-grid-skeleton";
import { SelectionAnimationEffects } from "./selection-animation-effects";
import { useCreateCharacter } from "@/hooks/use-create-character";
import { useOwnPlayers } from "@/hooks/use-own-players";
import type { StanceType } from "@/types/equipment.types";
import { HapticFeedback } from "@/lib/miniapp-utils";
import { motion, AnimatePresence } from "framer-motion";

type NamePreference = "male" | "female";

interface WarriorSelectionGridAnimatedProps {
  selectedCharacter: Player | null;
  onSelectCharacter: (character: Player, stance?: StanceType) => void;
  onDeselectCharacter: () => void;
}

const MAX_PLAYERS = 5;

export function WarriorSelectionGridAnimated({
  selectedCharacter,
  onSelectCharacter,
  onDeselectCharacter,
}: WarriorSelectionGridAnimatedProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const { players, isLoading } = useOwnPlayers();
  const { createCharacter, isCreatingCharacter, txHash } = useCreateCharacter();
  const [previousSelectedId, setPreviousSelectedId] = useState<string | number | null>(null);
  const [justSelectedId, setJustSelectedId] = useState<string | number | null>(null);
  const [hoveredCharacterId, setHoveredCharacterId] = useState<string | number | null>(null);

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
    // Track the transition
    if (selectedCharacter && character.id !== selectedCharacter.id) {
      setPreviousSelectedId(selectedCharacter.id);
      setJustSelectedId(character.id);
      
      // Clear hover state immediately when selecting
      setHoveredCharacterId(null);
      
      // Clear the "just selected" state after animation
      setTimeout(() => {
        setJustSelectedId(null);
      }, 1000);
    }
    
    onSelectCharacter(character, newStance ?? character.stance);
    await HapticFeedback.SELECT();
  }, [onSelectCharacter, selectedCharacter]);

  const handleCharacterHover = useCallback((characterId: string | number | null) => {
    // Immediately update hover state - this ensures clean transitions
    setHoveredCharacterId(characterId);
  }, []);

  const showNewCharacterCard = players && players.length < MAX_PLAYERS;

  if (isLoading) {
    return (
      <section className="mt-3">
        <motion.div 
          className="text-center mb-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600 uppercase tracking-wider">
            Warriors
          </h2>
          <div className="text-yellow-400/90 text-xs font-medium">
            Select your warrior to enter the battles
          </div>
        </motion.div>
        <CharacterCardGridSkeleton />
      </section>
    );
  }

  return (
    <section className="mt-3">
      <motion.div 
        className="text-center mb-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600 uppercase tracking-wider">
          Warriors
        </h2>
        <div className="text-yellow-400/90 text-xs font-medium">
          Select your warrior to enter the battles
        </div>
      </motion.div>

      <div className="relative">
        <motion.div 
          ref={containerRef}
          className="grid grid-cols-2 gap-4 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <AnimatePresence mode="popLayout">
            {players?.map((character, index) => (
              <EnhancedCompactCharacterCard
                key={character.id}
                character={character as Player}
                index={index}
                isSelected={selectedCharacter?.id === character.id}
                wasJustSelected={justSelectedId === character.id}
                isCurrentlyHovered={hoveredCharacterId === character.id}
                onSelect={(char, stance) => handleCharacterSelect(char, stance)}
                onViewDetails={() => handleViewDetails(character as Player)}
                onHover={handleCharacterHover}
              />
            ))}

            {showNewCharacterCard && (
              <motion.div
                key="new-character"
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <CompactNewCharacterCard
                  delay={players?.length || 0}
                  onClick={(namePreference: NamePreference) =>
                    createCharacter(namePreference)
                  }
                  isCreating={isCreatingCharacter}
                  txHash={txHash}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Selection Animation Effects Overlay */}
        <SelectionAnimationEffects
          selectedCharacterId={selectedCharacter?.id || null}
          previousSelectedId={previousSelectedId}
          hoveredCharacterId={hoveredCharacterId}
          containerRef={containerRef}
        />
      </div>
    </section>
  );
} 