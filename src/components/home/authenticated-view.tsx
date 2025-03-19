// src/components/home/authenticated-view.tsx
"use client";
import { Button } from "@/components/ui/button";
import type { Character } from "@/types/player.types";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import React from "react";
import { useInView } from "react-intersection-observer";
import { BattleSection } from "../battle/battle-section";
import { WarriorSelection } from "../character/warrior-selection";
import { SectionHeader } from "../ui/section-header";
import { ActiveChallenges, ActivitySection } from "./activity-section";

export function AuthenticatedView() {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null,
  );

  const battleSectionRef = useRef<HTMLElement>(null);
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.1,
  });
  const [hasBattleInView, setHasBattleInView] = useState(false);

  // Update hasBattleInView state when inView changes
  useEffect(() => {
    setHasBattleInView(inView);
  }, [inView]);

  // Function to select a character
  const handleSelectCharacter = (character: Character) => {
    setSelectedCharacter(character);

    // Add a small delay to allow the UI to update before scrolling
    setTimeout(() => {
      scrollToBattleSection();
    }, 300);
  };

  // Function to deselect a character
  const handleDeselectCharacter = () => {
    setSelectedCharacter(null);
  };

  // Function to scroll to battle section
  const scrollToBattleSection = () => {
    battleSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Set up the ref for the battle section
  useEffect(() => {
    if (battleSectionRef.current) {
      inViewRef(battleSectionRef.current);
    }
  }, [inViewRef]);

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
