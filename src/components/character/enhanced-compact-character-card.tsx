"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Info, Check, Sparkles } from "lucide-react";
import Image from "next/image";
import type { Player } from "@/types/player.types";
import type { StanceType } from "@/types/equipment.types";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
// import { AttributesPopover } from "./attributes-popover";
import { StanceSelectionModal } from "./stance-selection-modal";
import { cn } from "@/lib/utils";

interface EnhancedCompactCharacterCardProps {
  character: Player;
  index: number;
  isSelected: boolean;
  wasJustSelected: boolean;
  isCurrentlyHovered: boolean;
  onSelect: (character: Player, stance?: StanceType) => void;
  onViewDetails: () => void;
  onHover: (characterId: string | number | null) => void;
}

export function EnhancedCompactCharacterCard({
  character,
  index,
  isSelected,
  wasJustSelected,
  isCurrentlyHovered,
  onSelect,
  onViewDetails,
  onHover,
}: EnhancedCompactCharacterCardProps) {
  const [showStanceModal, setShowStanceModal] = useState(false);
  const [showSelectEffect, setShowSelectEffect] = useState(false);

  useEffect(() => {
    if (wasJustSelected) {
      setShowSelectEffect(true);
      const timer = setTimeout(() => setShowSelectEffect(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [wasJustSelected]);

  const handleCardClick = (e: React.MouseEvent) => {
    if (
      (e.target as HTMLElement).closest("[data-radix-popover-trigger]") ||
      (e.target as HTMLElement).closest("button")
    ) {
      e.preventDefault();
      return;
    }

    if (!isSelected) {
      e.preventDefault();
      onSelect(character);
    } else {
      onViewDetails();
    }
  };

  const handleSelectClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isSelected) {
      onSelect(character);
    } else {
      setShowStanceModal(true);
    }
  };

  const handleStanceChange = (newStance: StanceType) => {
    onSelect(character, newStance);
    setShowStanceModal(false);
  };

  const handleMouseEnter = () => {
    if (!isSelected) {
      onHover(character.id);
    }
  };

  const handleMouseLeave = () => {
    onHover(null);
  };

  // Only show animations when this specific card is hovered or selected
  const showAnimations = isCurrentlyHovered || isSelected;

  return (
    <>
      <motion.div
        data-character-id={character.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: 1,
          y: 0,
          //   scale: isSelected ? 1.02 : 1,
        }}
        transition={{
          duration: 0.5,
          delay: index * 0.05,
          scale: { duration: 0.3, ease: "easeInOut" },
        }}
        className={cn(
          "rounded-lg overflow-hidden bg-stone-900/80 border border-stone-800/60",
          "shadow-lg transform transition-all duration-300 relative",
          "group isolate flex flex-col cursor-pointer",
          isSelected
            ? "ring-2 ring-yellow-500 border-yellow-500/50 shadow-yellow-500/20"
            : "",
          // Enhanced hover effect for non-selected cards - only when THIS card is hovered
          !isSelected && isCurrentlyHovered
            ? "border-yellow-400/60 shadow-yellow-400/10 ring-1 ring-yellow-400/30 hover:shadow-xl"
            : "hover:border-yellow-500/30 hover:shadow-xl",
        )}
        onClick={handleCardClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        whileHover={showAnimations ? { y: -2 } : undefined}
        // whileTap={{ scale: 0.98 }}
      >
        {/* Selection Pulse Effect - Only on actual selection */}
        <AnimatePresence>
          {showSelectEffect && (
            <motion.div
              key={`selection-pulse-${character.id}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: [0, 0.8, 0],
                scale: [0.8, 1.2, 1.4],
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-yellow-500/30 to-yellow-400/20 rounded-lg z-10"
            />
          )}
        </AnimatePresence>

        {/* Hover Preview Glow - Only when THIS card is hovered and not selected */}
        <AnimatePresence>
          {!isSelected && isCurrentlyHovered && (
            <motion.div
              key={`hover-glow-${character.id}`}
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0.2, 0.4, 0.2],
              }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-yellow-500/15 to-yellow-400/10 rounded-lg z-5"
            />
          )}
        </AnimatePresence>

        {/* Magical Sparkles - Only when selected AND currently hovered */}
        <AnimatePresence>
          {isSelected && isCurrentlyHovered && (
            <div
              key={`sparkles-container-${character.id}`}
              className="absolute inset-0 pointer-events-none z-20"
            >
              {Array.from({ length: 3 }).map((_, i) => (
                <motion.div
                  key={`sparkle-${character.id}-${i}`}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    x: [
                      `${Math.random() * 100}%`,
                      `${Math.random() * 100}%`,
                      `${Math.random() * 100}%`,
                    ],
                    y: [
                      `${Math.random() * 100}%`,
                      `${Math.random() * 100}%`,
                      `${Math.random() * 100}%`,
                    ],
                  }}
                  exit={{ opacity: 0, transition: { duration: 0.1 } }}
                  transition={{
                    duration: 2,
                    delay: i * 0.5,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatDelay: 1,
                  }}
                  className="absolute text-yellow-400"
                >
                  <Sparkles className="h-3 w-3" />
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Character Image */}
        <div className="aspect-square relative bg-gradient-to-b from-stone-800/30 to-stone-900/30 overflow-hidden">
          {/* Selected character glow */}
          <motion.div
            className="absolute inset-0 bg-gradient-radial from-yellow-500/10 to-transparent opacity-0 z-10"
            initial={false}
            animate={isSelected ? { opacity: 0.4 } : { opacity: 0 }}
            transition={{ duration: 0.6 }}
          />

          {/* Hover connection preview glow - Only when THIS card is hovering and not selected */}
          <motion.div
            className="absolute inset-0 bg-gradient-radial from-yellow-400/5 to-transparent opacity-0 z-5"
            initial={false}
            animate={
              !isSelected && isCurrentlyHovered
                ? { opacity: 0.3 }
                : { opacity: 0 }
            }
            transition={{ duration: 0.3 }}
          />

          <Image
            src={character.currentSkin.imageURL}
            alt={`Character ${character.name.fullName}`}
            width={200}
            height={200}
            className={cn(
              "object-cover w-full h-full transition-transform duration-500",
              //   showAnimations ? "group-hover:scale-105" : ""
            )}
            priority={index < 4}
          />

          {/* Character ID Badge */}
          <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-mono text-yellow-500 border border-yellow-500/30 z-20">
            ID: {character.id}
          </div>

          {/* Info Button */}
          {/* <div className="absolute top-2 right-2 z-20">
            <AttributesPopover character={character}>
              <Button
                variant="ghost"
                size="xs"
                className="bg-black/70 backdrop-blur-sm text-yellow-500 hover:bg-black/80 hover:text-yellow-400 p-1 h-6 w-6"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <Info className="h-3 w-3" />
              </Button>
            </AttributesPopover>
          </div> */}

          {/* Selected Badge - Always visible when selected */}
          <AnimatePresence>
            {isSelected && (
              <motion.div
                key={`selected-badge-${character.id}`}
                initial={{ opacity: 0, scale: 0.5, y: 10 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                exit={{ opacity: 0, scale: 0.5, y: 10 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                className="absolute bottom-2 right-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 z-20 shadow-lg"
              >
                {/* Only animate the check icon when currently hovered */}
                {isCurrentlyHovered ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                  >
                    <Check size={10} />
                  </motion.div>
                ) : (
                  <Check size={10} />
                )}
                Selected
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Character Info */}
        <div className="p-3 space-y-2">
          <h3 className="font-bold text-sm text-yellow-500 truncate">
            {character.name.fullName}
          </h3>

          <div className="flex justify-between text-xs text-stone-400">
            <span>W: {character.record.wins}</span>
            <span>L: {character.record.losses}</span>
            <span>K: {character.record.kills}</span>
            <span>R: {character.battleRating}</span>
          </div>

          {/* Button animations only when card has focus */}
          <motion.div
          // whileHover={showAnimations ? { scale: 1.02 } : undefined}
          // whileTap={{ scale: 0.98 }}
          >
            <Button
              variant={isSelected ? "default" : "outline"}
              size="sm"
              className={cn(
                "w-full text-xs h-7 transition-all duration-300 z-10",
                isSelected
                  ? "bg-gradient-to-r from-yellow-500 to-yellow-400 text-black hover:from-yellow-400 hover:to-yellow-300 shadow-lg shadow-yellow-500/25"
                  : "border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10 hover:border-yellow-500/70",
                // Enhanced hover state for non-selected - only when THIS card is hovered
                !isSelected && isCurrentlyHovered
                  ? "border-yellow-400/70 text-yellow-400 bg-yellow-400/5"
                  : "",
              )}
              onClick={handleSelectClick}
            >
              {isSelected ? "Change Stance" : "Select"}
            </Button>
          </motion.div>
        </div>
      </motion.div>

      <StanceSelectionModal
        isOpen={showStanceModal}
        onClose={() => setShowStanceModal(false)}
        character={character}
        currentStance={character.stance as StanceType}
        onStanceChange={handleStanceChange}
      />
    </>
  );
}
