"use client";

import type { Player } from "@/types/player.types";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dumbbell,
  Footprints,
  Heart,
  HeartPulse,
  Ruler,
  Dices,
  Check,
  Shield,
  Swords,
  Flame,
  Zap,
  Target,
} from "lucide-react";
import { StanceType } from "@/types/equipment.types";
import { useState } from "react";
import {
  RetroCard,
  RetroCardContent,
  RetroCardHeader,
  RetroCardTitle,
} from "@/components/ui/retro-card";
import { RetroButton } from "@/components/ui/retro-button";
import { cn } from "@/lib/utils";

interface RetroCharacterCardProps {
  character: Player;
  index: number;
  isSelected: boolean;
  onSelect: (newStance?: StanceType) => void;
  onViewDetails: () => void;
}

function RetroAttributeBar({
  label,
  value,
  icon,
  isActive = false,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  isActive?: boolean;
}) {
  const minValue = 3;
  const maxValue = 21;
  const percentage = ((value - minValue) / (maxValue - minValue)) * 100;

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span
          className={cn(
            "flex items-center font-pixel text-pixel-xs",
            isActive ? "text-primary" : "text-primary/60",
          )}
        >
          {icon}
          <span className="ml-1">{label}</span>
        </span>
        <span
          className={cn(
            "font-pixel text-pixel-xs font-bold",
            isActive ? "text-primary" : "text-foreground",
          )}
        >
          {value}
        </span>
      </div>
      <div className="h-1 w-full bg-arcade-bezel rounded-pixel overflow-hidden border border-primary/20">
        <motion.div
          className={cn(
            "h-full rounded-pixel transition-all duration-200",
            isActive
              ? "bg-gradient-to-r from-primary to-primary-glow shadow-retro"
              : "bg-gradient-to-r from-primary/60 to-primary/80",
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
      </div>
    </div>
  );
}

export function RetroCharacterCard({
  character,
  index,
  isSelected,
  onSelect,
  onViewDetails,
}: RetroCharacterCardProps) {
  const characterDetailsUrl = `/character/${character.id}`;

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".stance-selector")) {
      e.preventDefault();
      return;
    }
    onViewDetails();
  };

  return (
    <Link
      href={characterDetailsUrl}
      prefetch={true}
      onClick={handleCardClick}
      passHref
    >
      <div className="cursor-pointer">
        <RetroCard
          variant={isSelected ? "arcade" : "pixel"}
          className={cn(
            "transition-all duration-300 hover:scale-105 relative overflow-hidden",
            isSelected && "shadow-retro border-primary-glow",
          )}
          withScanlines={isSelected}
        >
          {/* Character Image Section */}
          <div className="relative">
            <div className="aspect-square relative bg-gradient-to-b from-arcade-screen to-arcade-bezel overflow-hidden group border-b-2 border-primary/30">
              <motion.div
                className="absolute inset-0 bg-gradient-radial from-primary/20 to-transparent z-10"
                initial={false}
                animate={isSelected ? { opacity: 0.6 } : { opacity: 0 }}
                transition={{ duration: 0.6 }}
              />

              <Image
                src={character.currentSkin.imageURL}
                alt={`Character ${character.name.fullName}`}
                width={210}
                height={210}
                className="object-cover transition-transform duration-500 group-hover:scale-105 pixel-perfect"
                priority
              />

              {/* Character ID Badge */}
              <div className="absolute top-2 left-2 bg-arcade-screen/90 backdrop-blur-sm px-2 py-1 rounded-pixel border border-primary/50 z-20">
                <span className="font-pixel text-pixel-xs text-primary">
                  ID: {character.id}
                </span>
              </div>

              {/* Selected Badge */}
              {isSelected && (
                <motion.div
                  className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-pixel font-pixel text-pixel-xs font-bold flex items-center gap-1 z-20 shadow-retro"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.5, type: "spring" }}
                >
                  <Check size={10} /> ACTIVE
                </motion.div>
              )}

              {/* Status Indicators */}
              <div className="absolute bottom-2 left-2 flex gap-1 z-20">
                <div className="w-2 h-2 bg-success rounded-pixel animate-pulse shadow-retro" />
                <span className="font-pixel text-pixel-xs text-success">
                  READY
                </span>
              </div>
            </div>
          </div>

          <RetroCardContent className="p-3 space-y-3">
            {/* Character Name */}
            <RetroCardTitle
              variant={isSelected ? "arcade" : "pixel"}
              className="text-center"
            >
              {character.name.fullName}
            </RetroCardTitle>

            {/* Attributes */}
            <div className="space-y-2">
              <RetroAttributeBar
                label="STR"
                value={character.attributes.strength}
                icon={<Dumbbell className="h-3 w-3" />}
                isActive={isSelected}
              />
              <RetroAttributeBar
                label="CON"
                value={character.attributes.constitution}
                icon={<HeartPulse className="h-3 w-3" />}
                isActive={isSelected}
              />
              <RetroAttributeBar
                label="SIZE"
                value={character.attributes.size}
                icon={<Ruler className="h-3 w-3" />}
                isActive={isSelected}
              />
              <RetroAttributeBar
                label="AGI"
                value={character.attributes.agility}
                icon={<Footprints className="h-3 w-3" />}
                isActive={isSelected}
              />
              <RetroAttributeBar
                label="STA"
                value={character.attributes.stamina}
                icon={<Heart className="h-3 w-3" />}
                isActive={isSelected}
              />
              <RetroAttributeBar
                label="LUCK"
                value={character.attributes.luck}
                icon={<Dices className="h-3 w-3" />}
                isActive={isSelected}
              />
            </div>

            {/* Stance Selector */}
            <AnimatePresence>
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{
                    duration: 0.3,
                    ease: "easeInOut",
                  }}
                  className="overflow-hidden stance-selector border-t border-primary/30 pt-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                >
                  <RetroCompactStanceSelector
                    character={character}
                    currentStance={character.stance as StanceType}
                    onStanceChange={(newStance) =>
                      onSelect(newStance as unknown as StanceType)
                    }
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </RetroCardContent>
        </RetroCard>
      </div>
    </Link>
  );
}

// Retro Compact Stance Selector
function RetroCompactStanceSelector({
  character,
  currentStance,
  onStanceChange,
}: {
  character: Player;
  currentStance: StanceType;
  onStanceChange: (newStance: StanceType) => void;
}) {
  const stanceOptions = [
    {
      value: "Aggressive" as StanceType,
      label: "AGG",
      icon: <Flame className="h-3 w-3" />,
      description: "High damage, low defense",
    },
    {
      value: "Balanced" as StanceType,
      label: "BAL",
      icon: <Target className="h-3 w-3" />,
      description: "Equal offense and defense",
    },
    {
      value: "Defensive" as StanceType,
      label: "DEF",
      icon: <Shield className="h-3 w-3" />,
      description: "High defense, low damage",
    },
  ];

  const handleStanceChange = (newStance: StanceType) => {
    if (newStance !== currentStance) {
      onStanceChange(newStance);
    }
  };

  return (
    <div className="space-y-2">
      <div className="text-center font-pixel text-pixel-xs text-primary/80">
        COMBAT STANCE
      </div>
      <div className="grid grid-cols-3 gap-1">
        {stanceOptions.map((stance) => (
          <RetroButton
            key={stance.value}
            variant={currentStance === stance.value ? "primary" : "ghost"}
            size="xs"
            onClick={() => handleStanceChange(stance.value)}
            className="flex flex-col items-center gap-1 h-auto py-2"
            glow={currentStance === stance.value ? "subtle" : "none"}
          >
            {stance.icon}
            <span className="font-pixel text-pixel-xs">{stance.label}</span>
          </RetroButton>
        ))}
      </div>
      <div className="text-center font-pixel text-pixel-xs text-primary/60">
        {stanceOptions.find((s) => s.value === currentStance)?.description}
      </div>
    </div>
  );
}
