// src/components/home/authenticated-view.tsx
"use client";
import type { Player } from "@/types/player.types";
import { motion } from "framer-motion";
import { ChevronDown, ChartBar } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import React from "react";
import { useInView } from "react-intersection-observer";
import { BattleSection } from "../battle/battle-section";
import { WarriorSelection } from "../character/warrior-selection";
import { ActivitySection } from "./activity-section";
import type { StanceType } from "@/types/equipment.types";
import { useOwnPlayers } from "@/hooks/use-own-players";
import { useRouter } from "next/navigation";
import { useIdentityToken, usePrivy } from "@privy-io/react-auth";

interface AuthenticatedViewProps {
  initialSelectedCharacterId: string | null;
}

export function AuthenticatedView({
  initialSelectedCharacterId,
}: AuthenticatedViewProps) {
  const { identityToken } = useIdentityToken();
  const { getAccessToken } = usePrivy();

  const [selectedCharacter, setSelectedCharacter] = useState<Player | null>(
    null,
  );
  const { players, isLoading: isLoadingPlayers } = useOwnPlayers();
  const router = useRouter();

  const battleSectionRef = useRef<HTMLElement>(null);
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.1,
  });
  const [hasBattleInView, setHasBattleInView] = useState(false);

  const scrollToBattleSection = useCallback(() => {
    battleSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const accessToken = await getAccessToken();
      console.log("accessToken", accessToken);
      // const response = await fetch("/api/test", {
      //   method: "GET",
      //   headers: {
      //     "privy-id-token": identityToken,
      //   },
      // });
      // const data = await response.json();
      // console.log("data", data);
      // For HTTP-only cookies approach
      const response = await fetch("/api/test", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      console.log("data", data);
    };
    fetchData();
  }, []);

  // Function to select a character - memoized
  // This is defined before the useEffect that might call it for initial selection
  const handleSelectCharacter = useCallback(
    (character: Player, stance?: StanceType) => {
      setSelectedCharacter({
        ...character,
        stance: stance ?? character.stance,
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
    setSelectedCharacter(null);
    router.push("/", { scroll: false }); // Corrected template literal
  }, [router]); // router is stable

  // Set up the ref for the battle section
  useEffect(() => {
    if (battleSectionRef.current) {
      inViewRef(battleSectionRef.current);
    }
  }, [inViewRef]);

  // Automatically scroll to battle section if a character is selected and it's not in view
  // useEffect(() => {
  //   if (selectedCharacter && !hasBattleInView) {
  //     const timer = setTimeout(() => {
  //       scrollToBattleSection();
  //     }, 300);
  //     return () => clearTimeout(timer);
  //   }
  // }, [selectedCharacter, hasBattleInView, scrollToBattleSection]);

  return (
    <>
      <div className="max-w-7xl mx-auto px-0 sm:px-2 md:px-4">
        <WarriorSelection
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <ActivitySection selectedCharacter={selectedCharacter} />
      </div>
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
