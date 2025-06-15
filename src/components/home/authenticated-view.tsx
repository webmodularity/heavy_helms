// src/components/home/authenticated-view.tsx
"use client";
import type { Player } from "@/types/player.types";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import React from "react";
import { useInView } from "react-intersection-observer";
import { BattleSection } from "../battle/battle-section";
import { WarriorSelectionGridAnimated } from "../character/warrior-selection-grid-animated";
import type { StanceType } from "@/types/equipment.types";
import { useOwnPlayers } from "@/hooks/use-own-players";
import { useRouter, useSearchParams } from "next/navigation";
import { MagicalPortalButton } from "../magical-dimension";
import type { Fighter } from "@/types/fighter-types";
import { useFollowingData } from "@/hooks/use-following-data";

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

  const handleSelectCharacter = useCallback(
    (character: Player, stance?: StanceType) => {
      setSelectedCharacter((prev) => {
        if (
          prev?.id === character.id &&
          prev.stance === (stance ?? character.stance)
        )
          return prev;
        return { ...character, stance: stance ?? character.stance };
      });
      router.push(`/?selectedCharacter=${character.id}`, { scroll: false });
    },
    [router],
  );

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
  ]);

  useEffect(() => {
    setHasBattleInView(inView);
  }, [inView]);

  const handleDeselectCharacter = useCallback(() => {
    setSelectedCharacter((prev) => {
      if (prev === null) return null;
      return null;
    });
    router.push("/", { scroll: false });
  }, [router]);

  useEffect(() => {
    if (battleSectionRef.current) {
      inViewRef(battleSectionRef.current);
    }
  }, [inViewRef]);

  const handleChallengePlayer = useCallback((opponent: Fighter) => {
    setChallengeConfirmation({ isOpen: true, opponent });
  }, []);

  const handleCloseChallengeConfirmation = useCallback(() => {
    setChallengeConfirmation({ isOpen: false, opponent: null });
  }, []);

  const handleChallengeSuccess = useCallback(() => {
    setChallengeConfirmation({ isOpen: false, opponent: null });
    setIsDimensionOpen(false);
  }, []);

  const showPortalButton = Boolean(selectedCharacter && currentUserFid);

  return (
    <>
      <div className="max-w-7xl mx-auto px-0 sm:px-2 md:px-4">
        <WarriorSelectionGridAnimated
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

// ScrollIndicator component remains the same
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
