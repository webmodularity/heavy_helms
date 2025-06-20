"use client";

import { motion } from "framer-motion";
import { Swords } from "lucide-react";
import { useState } from "react";
import type { Player } from "@/types/player.types";
import { BATTLE_THEMES } from "@/components/shared/battle-modal";
import { DuelModal } from "./duel-modal";

interface ContextualDuelButtonProps {
  selectedCharacter: Player | null;
  isVisible?: boolean;
  position?: "fixed" | "inline";
  className?: string;
}

export function ContextualDuelButton({
  selectedCharacter,
  isVisible = true,
  position = "fixed",
  className = "",
}: ContextualDuelButtonProps) {
  const [showDuelModal, setShowDuelModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleDuelClick = () => {
    if (!selectedCharacter) return;
    setShowDuelModal(true);
  };

  const handleChallengeSuccess = () => {
    setShowDuelModal(false);

    // Scroll to the challenges tab in the Activity Section
    const activitySection = document.getElementById("activity-section");
    if (activitySection) {
      activitySection.scrollIntoView({ behavior: "smooth" });

      // Set the active tab to "challenges"
      const event = new CustomEvent("activateChallengesTab");
      document.dispatchEvent(event);
    }
  };

  if (!isVisible || !selectedCharacter) return null;

  const buttonContent = (
    <motion.button
      onClick={handleDuelClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={selectedCharacter.isRetired}
      className={`relative w-14 h-14 rounded-full backdrop-blur-sm
                 flex items-center justify-center overflow-hidden
                 transition-all duration-300 cursor-pointer
                 touch-manipulation border-2 ${
                   selectedCharacter.isRetired
                     ? "opacity-50 cursor-not-allowed"
                     : "hover:scale-110 active:scale-95"
                 }`}
      style={{
        background: `linear-gradient(135deg, ${BATTLE_THEMES.duel.primary}, ${BATTLE_THEMES.duel.secondary})`,
        borderColor: selectedCharacter.isRetired
          ? "rgba(156, 163, 175, 0.3)"
          : BATTLE_THEMES.duel.border,
        boxShadow: selectedCharacter.isRetired ? "none" : BATTLE_THEMES.duel.shadow,
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Magical aura */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: BATTLE_THEMES.duel.gradient,
          filter: "blur(12px)",
        }}
        animate={{
          scale: isHovered ? [1, 1.4, 1.2] : [1, 1.2, 1],
          opacity: isHovered ? [0.4, 0.8, 0.6] : [0.3, 0.6, 0.3],
          rotate: [0, 360],
        }}
        transition={{
          scale: {
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          },
          opacity: {
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          },
          rotate: {
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          },
        }}
      />

      {/* Icon */}
      <motion.div
        className="relative z-10 pointer-events-none"
        animate={{
          rotate: isHovered ? [0, 15, -15, 0] : [0, 5, -5, 0],
          scale: isHovered ? [1, 1.1, 1] : 1,
        }}
        transition={{
          duration: isHovered ? 0.4 : 2,
          repeat: Number.POSITIVE_INFINITY,
        }}
      >
        <Swords className="w-6 h-6 text-white" />
      </motion.div>

      {/* Floating particles */}
      {!selectedCharacter.isRetired &&
        [...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full pointer-events-none"
            style={{
              left: "50%",
              top: "50%",
              background: BATTLE_THEMES.duel.particles[i % 2],
            }}
            animate={{
              x: [0, Math.cos((i * 90 * Math.PI) / 180) * (20 + i * 1.5)],
              y: [0, Math.sin((i * 90 * Math.PI) / 180) * (20 + i * 1.5)],
              opacity: [0, 1, 0.7, 0],
              scale: [0, 1, 0.8, 0],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.2,
              ease: "easeOut",
            }}
          />
        ))}
    </motion.button>
  );

  const tooltipContent = (
    <motion.div
      className="absolute -left-40 top-1/2 transform -translate-y-1/2 
                 bg-gradient-to-r from-stone-900/95 to-stone-800/95 
                 border border-stone-600/40 rounded-lg px-3 py-2
                 text-stone-200 text-xs whitespace-nowrap backdrop-blur-sm
                 shadow-lg pointer-events-none min-w-36"
      initial={{ opacity: 0, x: 10, scale: 0.8 }}
      animate={{
        opacity: isHovered && !selectedCharacter.isRetired ? 1 : 0,
        x: isHovered && !selectedCharacter.isRetired ? 0 : 10,
        scale: isHovered && !selectedCharacter.isRetired ? 1 : 0.8,
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{ borderColor: BATTLE_THEMES.duel.border + "40" }}
    >
      <div className="font-medium" style={{ color: BATTLE_THEMES.duel.border }}>
        Challenge Warriors
      </div>
      <div className="text-stone-400 text-[10px] mt-1">
        Issue duels across the realm
      </div>
    </motion.div>
  );

  return (
    <>
      {position === "fixed" ? (
        <div className={`fixed bottom-8 right-8 z-[100] ${className}`}>
          <div className="relative">
            {buttonContent}
            {tooltipContent}
          </div>
        </div>
      ) : (
        <div className={`relative ${className}`}>
          {buttonContent}
          {tooltipContent}
        </div>
      )}

      {/* Integrated Duel Modal */}
      <DuelModal
        isOpen={showDuelModal}
        onClose={() => setShowDuelModal(false)}
        selectedCharacter={selectedCharacter}
        onSuccess={handleChallengeSuccess}
      />
    </>
  );
} 