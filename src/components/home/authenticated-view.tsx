// src/components/home/authenticated-view.tsx
"use client";
import type { Player } from "@/types/player.types";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import React from "react";
import { useInView } from "react-intersection-observer";
import { BattleSection } from "../battle/battle-section";
import { WarriorSelection } from "../character/warrior-selection";
import type { StanceType } from "@/types/equipment.types";
import { useOwnPlayers } from "@/hooks/use-own-players";
import { useRouter, useSearchParams } from "next/navigation";
import { MagicalPortalButton } from "../magical-dimension";
import type { Fighter } from "@/types/fighter-types";
import { useFollowingData } from "@/hooks/use-following-data";
import { AlternateDimension } from "../magical-dimension/alternate-dimension";
import { WarriorSelectionGrid } from "../character/warrior-selection-grid";

export function AuthenticatedView() {
  const searchParams = useSearchParams();
  const initialSelectedCharacterId = searchParams.get("selectedCharacter");

  const [selectedCharacter, setSelectedCharacter] = useState<Player | null>(
    null,
  );
  const { players } = useOwnPlayers();
  const { currentUserFid } = useFollowingData();
  const router = useRouter();

  // Magical dimension states
  const [isDimensionOpen, setIsDimensionOpen] = useState(false);
  const [challengeConfirmation, setChallengeConfirmation] = useState<{
    isOpen: boolean;
    opponent: Fighter | null;
  }>({ isOpen: false, opponent: null });

  const battleSectionRef = useRef<HTMLElement>(null);
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.1,
  });
  const [hasBattleInView, setHasBattleInView] = useState(false);

  const scrollToBattleSection = useCallback(() => {
    battleSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Function to select a character - memoized
  // This is defined before the useEffect that might call it for initial selection
  const handleSelectCharacter = useCallback(
    (character: Player, stance?: StanceType) => {
      setSelectedCharacter((prev) => {
        if (
          prev?.id === character.id &&
          prev.stance === (stance ?? character.stance)
        )
          return prev; // Avoid re-render if identical
        return { ...character, stance: stance ?? character.stance }; // Ensure a new object for state update if changed
      });
      router.push(`/?selectedCharacter=${character.id}`, { scroll: false });
    },
    [router],
  ); // router is stable

  // Effect to handle initial character selection from query param
  useEffect(() => {
    if (
      initialSelectedCharacterId &&
      players &&
      players.length > 0 &&
      !selectedCharacter
    ) {
      const playerFromQuery = players.find(
        (p) => p.id.toString() === initialSelectedCharacterId,
      );
      if (playerFromQuery) {
        handleSelectCharacter(playerFromQuery as Player, undefined);
      }
    }
  }, [
    initialSelectedCharacterId,
    players,
    selectedCharacter,
    handleSelectCharacter,
  ]); // Added handleSelectCharacter as a dependency

  // Update hasBattleInView state when inView changes
  useEffect(() => {
    setHasBattleInView(inView);
  }, [inView]);

  // Function to deselect a character - memoized
  const handleDeselectCharacter = useCallback(() => {
    setSelectedCharacter((prev) => {
      if (prev === null) return null; // Avoid re-render if already null
      return null;
    });
    router.push("/", { scroll: false }); // Corrected template literal
  }, [router]); // router is stable

  // Set up the ref for the battle section
  useEffect(() => {
    if (battleSectionRef.current) {
      inViewRef(battleSectionRef.current);
    }
  }, [inViewRef]);

  // Modified handlers - DON'T close dimension when opening confirmation
  const handleChallengePlayer = useCallback((opponent: Fighter) => {
    // Keep dimension open - only show confirmation overlay
    setChallengeConfirmation({ isOpen: true, opponent });
  }, []);

  const handleCloseChallengeConfirmation = useCallback(() => {
    setChallengeConfirmation({ isOpen: false, opponent: null });
    // Dimension remains open so user can try other friends
  }, []);

  const handleChallengeSuccess = useCallback(() => {
    setChallengeConfirmation({ isOpen: false, opponent: null });
    // Close dimension after successful challenge
    setIsDimensionOpen(false);
  }, []);

  // Show portal button when character is selected and user has Farcaster
  const showPortalButton = Boolean(selectedCharacter && currentUserFid);

  // Automatically scroll to battle section if a character is selected and it's not in view
  // useEffect(() => {
  //   if (selectedCharacter && !hasBattleInView) {
  //     const timer = setTimeout(() => {
  //       scrollToBattleSection();
  //     }, 300);
  //     return () => clearTimeout(timer);
  //   }
  // }, [selectedCharacter, hasBattleInView, scrollToBattleSection]);

  const handleClose = useCallback(() => {
    // Your close logic
  }, []);

  return (
    <>
      <div className="max-w-7xl mx-auto px-0 sm:px-2 md:px-4">
        <WarriorSelectionGrid
          selectedCharacter={selectedCharacter}
          onSelectCharacter={handleSelectCharacter}
          onDeselectCharacter={handleDeselectCharacter}
        />

        {/* Scroll indicator - only show when a character is selected and battle section is not in view */}
        {selectedCharacter && !hasBattleInView && (
          <ScrollIndicator onClick={scrollToBattleSection} />
        )}

        <BattleSection
          selectedCharacter={selectedCharacter}
          hasBattleInView={hasBattleInView}
          battleSectionRef={battleSectionRef}
        />
      </div>

      {/* Magical Portal Button */}
      <MagicalPortalButton
        isVisible={showPortalButton}
        selectedCharacterId={selectedCharacter?.id}
      />
    </>
  );
}

// ======== Shared Components ========

// The ScrollIndicator component - can stay here since it's specific to this view
interface ScrollIndicatorProps {
  onClick: () => void;
}

function ScrollIndicator({ onClick }: ScrollIndicatorProps) {
  return (
    <motion.div
      className="fixed bottom-8 left-0 right-0 z-50 flex justify-center items-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <motion.button
        className="bg-yellow-500/10 backdrop-blur-sm border border-yellow-500/20 text-yellow-500 px-4 py-2 rounded-full flex items-center gap-2 hover:bg-yellow-500/20 transition-all"
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        View Battle Options <ChevronDown className="h-4 w-4" />
      </motion.button>
    </motion.div>
  );
}
