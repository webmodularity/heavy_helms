// src/components/home/authenticated-view.tsx
"use client";
import { Button } from "@/components/ui/button";
import { usePlayer } from "@/store/player-context";
import type { Character } from "@/types/player.types";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import React from "react";
import { useInView } from "react-intersection-observer";
import { BattleSection } from "../battle/battle-section";
import { WarriorSelection } from "../character/warrior-selection";
import { SectionHeader } from "../ui/section-header";

export function AuthenticatedView() {
  // const { players } = useOwnedPlayers();
;
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
      <div className="max-w-7xl mx-auto">
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
      <RecentActivity />
    </>
  );
}

// ======== Recent Activity Component ========
function RecentActivity() {
  return (
    <section className="mb-8">
      <SectionHeader title="Battle Chronicles" subtitle="YOUR SAGA" />
      {/* Activity Feed - Placeholder for now */}
      <motion.div
        className="bg-gradient-to-b from-amber-900/5 to-stone-900/30 rounded-lg border border-yellow-600/10 p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.7 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-stone-200">
            Recent Battles
          </h3>
          <Button
            variant="ghost"
            className="text-yellow-500 hover:text-yellow-400"
          >
            View All
          </Button>
        </div>

        <div className="space-y-4">
          {/* Placeholder activities - would be dynamically generated */}
          <div className="p-4 border-b border-stone-700/50">
            <div className="flex justify-between mb-1">
              <span className="text-yellow-400 font-medium">
                Victory in Duel
              </span>
              <span className="text-stone-400 text-sm">2 hours ago</span>
            </div>
            <p className="text-stone-300 text-sm">
              Your warrior Ross of the Glade defeated Diego Frostcaller
            </p>
          </div>

          <div className="p-4 border-b border-stone-700/50">
            <div className="flex justify-between mb-1">
              <span className="text-red-400 font-medium">Defeat in Duel</span>
              <span className="text-stone-400 text-sm">Yesterday</span>
            </div>
            <p className="text-stone-300 text-sm">
              Your warrior Ross of the Glade was defeated by Kate of the Ember
            </p>
          </div>

          <div className="p-4">
            <div className="flex justify-between mb-1">
              <span className="text-yellow-400 font-medium">
                Practice Complete
              </span>
              <span className="text-stone-400 text-sm">2 days ago</span>
            </div>
            <p className="text-stone-300 text-sm">
              Completed 5 practice matches with Ross of the Glade
            </p>
          </div>
        </div>
      </motion.div>
    </section>
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
