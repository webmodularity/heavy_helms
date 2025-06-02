"use client";

import { CardContainer } from "@/components/character/card-container";
import { RetroStanceSelector } from "@/components/character/retro-stance-selector";
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
} from "lucide-react";
import { StanceType } from "@/types/equipment.types";
import { cn } from "@/lib/utils";

interface CharacterCardProps {
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
}: { label: string; value: number; icon: React.ReactNode }) {
  const minValue = 3;
  const maxValue = 21;
  const percentage = ((value - minValue) / (maxValue - minValue)) * 100;

  return (
    <div className="space-y-0.5">
      <div className="flex justify-between items-center">
        <span className="flex items-center font-pixeloid text-pixel-xs text-primary/60">
          {icon}
          <span className="ml-0.5 uppercase tracking-wide">{label}</span>
        </span>
        <span className="font-pixeloid text-pixel-xs font-bold text-primary">
          {value}
        </span>
      </div>
      <div className="h-0.5 w-full bg-arcade-bezel rounded-pixel border border-primary/20 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary/60 to-primary/80 pixel-perfect"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ imageRendering: 'pixelated' }}
        />
      </div>
    </div>
  );
}

export function CharacterCard({
  character,
  index,
  isSelected,
  onSelect,
  onViewDetails,
}: CharacterCardProps) {
  const characterDetailsUrl = `/character/${character.id}`;

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on the stance selector
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
        <CardContainer index={index} isSelected={isSelected}>
          <div className="relative">
            {/* Character Image with Retro Frame */}
            <div className="aspect-square relative bg-gradient-to-b from-arcade-screen/30 to-card/60 overflow-hidden border-2 border-primary/20 rounded-pixel-md pixel-perfect">
              {/* CRT Effect Background */}
              <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,255,255,0.02)_50%)] bg-[length:100%_2px] pointer-events-none opacity-60" />
              
              {/* Selection Glow */}
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
                className="object-cover transition-transform duration-500 hover:scale-105 pixel-perfect"
                style={{ imageRendering: 'pixelated' }}
                priority
              />

              {/* Character ID Badge - Retro Style */}
              <div className="absolute top-2 left-2 bg-card/90 backdrop-blur-sm px-1.5 py-0.5 rounded-pixel border border-primary/30 z-20 retro-glow">
                <span className="font-pixeloid text-pixel-xs font-bold text-primary uppercase tracking-wider">
                  ID: {character.id}
                </span>
              </div>

              {/* Selected Badge - Enhanced */}
              {isSelected && (
                <motion.div
                  className="absolute top-2 right-2 bg-gradient-to-r from-primary to-primary/80 text-background px-1.5 py-0.5 rounded-pixel text-pixel-xs font-pixeloid font-bold flex items-center gap-0.5 z-20 retro-glow border border-primary/50"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Check className="h-2.5 w-2.5" />
                  <span className="uppercase tracking-wide">ACTIVE</span>
                </motion.div>
              )}

              {/* Retro Border Glow */}
              {isSelected && (
                <motion.div
                  className="absolute inset-0 border-2 border-primary/50 rounded-pixel-md pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                />
              )}
            </div>
          </div>

          <div className="p-2 space-y-2">
            {/* Character Name - Retro Style */}
            <div className="text-center">
              <h3 className="font-pixeloid font-bold text-pixel-sm text-primary truncate uppercase tracking-wider retro-glow">
                {character.name.fullName}
              </h3>
              <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent mt-1" />
            </div>

            {/* Attributes - Retro Grid */}
            <div className="space-y-1">
              <RetroAttributeBar
                label="STR"
                value={character.attributes.strength}
                icon={<Dumbbell className="h-2.5 w-2.5 text-primary" />}
              />
              <RetroAttributeBar
                label="CON"
                value={character.attributes.constitution}
                icon={<HeartPulse className="h-2.5 w-2.5 text-primary" />}
              />
              <RetroAttributeBar
                label="SIZE"
                value={character.attributes.size}
                icon={<Ruler className="h-2.5 w-2.5 text-primary" />}
              />
              <RetroAttributeBar
                label="AGI"
                value={character.attributes.agility}
                icon={<Footprints className="h-2.5 w-2.5 text-primary" />}
              />
              <RetroAttributeBar
                label="STA"
                value={character.attributes.stamina}
                icon={<Heart className="h-2.5 w-2.5 text-primary" />}
              />
              <RetroAttributeBar
                label="LUCK"
                value={character.attributes.luck}
                icon={<Dices className="h-2.5 w-2.5 text-primary" />}
              />
            </div>

            {/* Retro Stance Selector */}
            <AnimatePresence>
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{
                    duration: 0.3,
                    ease: "easeInOut",
                  }}
                  className="overflow-hidden stance-selector"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                >
                  {/* Retro Divider */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/40 to-primary/40" />
                    <div className="w-1 h-1 bg-primary rounded-pixel animate-pulse" />
                    <div className="flex-1 h-px bg-gradient-to-r from-primary/40 via-primary/40 to-transparent" />
                  </div>

                  <RetroStanceSelector
                    character={character}
                    currentStance={character.stance as StanceType}
                    onStanceChange={(newStance) =>
                      onSelect(newStance as unknown as StanceType)
                    }
                    size="compact"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContainer>
      </div>
    </Link>
  );
}
