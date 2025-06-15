"use client";

import { motion } from "framer-motion";
import { Info, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Player } from "@/types/player.types";
import type { StanceType } from "@/types/equipment.types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AttributesPopover } from "./attributes-popover";
import { StanceSelectionModal } from "./stance-selection-modal";
import { cn } from "@/lib/utils";

interface CompactCharacterCardProps {
  character: Player;
  index: number;
  isSelected: boolean;
  onSelect: (character: Player, stance?: StanceType) => void;
  onViewDetails: () => void;
}

export function CompactCharacterCard({
  character,
  index,
  isSelected,
  onSelect,
  onViewDetails,
}: CompactCharacterCardProps) {
  const [showStanceModal, setShowStanceModal] = useState(false);
  const characterDetailsUrl = `/character/${character.id}`;

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on popover trigger or buttons
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

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.05 }}
        className={cn(
          "rounded-lg overflow-hidden bg-stone-900/80 border border-stone-800/60",
          "shadow-lg transform transition-all duration-300",
          "group isolate flex flex-col cursor-pointer",
          "hover:border-yellow-500/30 hover:shadow-xl",
          isSelected 
            ? "ring-2 ring-yellow-500 border-yellow-500/50" 
            : ""
        )}
        onClick={handleCardClick}
      >
        {/* Character Image */}
        <div className="aspect-square relative bg-gradient-to-b from-stone-800/30 to-stone-900/30 overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-radial from-yellow-500/10 to-transparent opacity-0 z-10"
            initial={false}
            animate={isSelected ? { opacity: 0.4 } : { opacity: 0 }}
            transition={{ duration: 0.6 }}
          />

          <Image
            src={character.currentSkin.imageURL}
            alt={`Character ${character.name.fullName}`}
            width={200}
            height={200}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
            priority={index < 4}
          />

          {/* Character ID Badge */}
          <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-mono text-yellow-500 border border-yellow-500/30 z-20">
            ID: {character.id}
          </div>

          {/* Info Button */}
          <div className="absolute top-2 right-2 z-20">
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
          </div>

          {/* Selected Badge */}
          {isSelected && (
            <div className="absolute bottom-2 right-2 bg-yellow-500 text-black px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 z-20">
              <Check size={10} /> Selected
            </div>
          )}
        </div>

        {/* Character Info */}
        <div className="p-3 space-y-2">
          {/* Character Name */}
          <h3 className="font-bold text-sm text-yellow-500 truncate">
            {character.name.fullName}
          </h3>

          {/* Quick Stats */}
          <div className="flex justify-between text-xs text-stone-400">
            <span>W: {character.record.wins}</span>
            <span>L: {character.record.losses}</span>
            <span>K: {character.record.kills}</span>
            <span>R: {character.battleRating}</span>
          </div>

          {/* Action Button */}
          <Button
            variant={isSelected ? "default" : "outline"}
            size="sm"
            className={cn(
              "w-full text-xs h-7",
              isSelected
                ? "bg-yellow-500 text-black hover:bg-yellow-400"
                : "border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10"
            )}
            onClick={handleSelectClick}
          >
            {isSelected ? "Change Stance" : "Select"}
          </Button>
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