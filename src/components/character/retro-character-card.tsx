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
} from "lucide-react";
import type { StanceType } from "@/types/equipment.types";
import {
  RetroCard,
  RetroCardContent,
  RetroCardHeader,
  RetroCardTitle,
} from "@/components/ui/retro-card";
import { RetroStanceSelector } from "@/components/character/retro-stance-selector";
import { RetroAttributeBar } from "@/components/ui/retro-attribute-bar";
import { cn } from "@/lib/utils";

interface RetroCharacterCardProps {
  character: Player;
  index: number;
  isSelected: boolean;
  onSelect: (newStance?: StanceType) => void;
  onViewDetails: () => void;
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
    <Link href={characterDetailsUrl} prefetch={true} passHref>
      <div className="cursor-pointer" onClick={handleCardClick}>
        <RetroCard
          variant={isSelected ? "arcade" : "pixel"}
          size="sm"
          className={cn(
            "transition-all duration-300 hover:scale-[1.02] relative overflow-hidden",
            isSelected && "retro-glow border-primary",
          )}
          withScanlines={isSelected}
          glow={isSelected ? "medium" : "none"}
        >
          {/* Character Image Section */}
          <div className="relative">
            <div className="aspect-[4/3] relative bg-gradient-to-b from-arcade-screen to-arcade-bezel overflow-hidden group border-b border-primary/40">
              <motion.div
                className="absolute inset-0 bg-gradient-radial from-primary/30 to-transparent z-10"
                initial={false}
                animate={isSelected ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.6 }}
              />

              <Image
                src={character.currentSkin.imageURL}
                alt={`Character ${character.name.fullName}`}
                width={120}
                height={90}
                className="object-contain w-full h-full pixel-perfect transition-transform duration-500 group-hover:scale-105"
                style={{ objectPosition: "center center" }}
                priority
              />

              {/* Character ID Badge */}
              <div className="absolute top-0.5 left-0.5 bg-arcade-screen/95 backdrop-blur-sm px-1 py-0.5 rounded-pixel border border-primary/60 z-20">
                <span className="font-pixel text-pixel-xs text-primary">
                  #{character.id}
                </span>
              </div>

              {/* Selected Badge */}
              {isSelected && (
                <motion.div
                  className="absolute top-0.5 right-0.5 bg-primary text-primary-foreground px-1 py-0.5 rounded-pixel font-pixel text-pixel-xs font-bold flex items-center gap-0.5 z-20"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.5, type: "spring" }}
                >
                  <Check size={7} />
                  ACTIVE
                </motion.div>
              )}

              {/* Status Indicators */}
              <div className="absolute bottom-0.5 left-0.5 flex items-center gap-0.5 z-20">
                <div className="w-1 h-1 bg-success rounded-pixel animate-pulse" />
                <span className="font-pixel text-pixel-xs text-success">
                  READY
                </span>
              </div>
            </div>
          </div>

          <RetroCardContent className="p-1.5 space-y-1.5">
            {/* Character Name */}
            <div className="text-center">
              <RetroCardTitle
                variant={isSelected ? "arcade" : "pixel"}
                className="text-pixel-xs font-pixel"
              >
                {character.name.fullName}
              </RetroCardTitle>
            </div>

            {/* Attributes - Using Reusable RetroAttributeBar */}
            <div className="space-y-0.5">
              <RetroAttributeBar
                label="STR"
                value={character.attributes.strength}
                icon={<Dumbbell className="h-2 w-2" />}
                isActive={isSelected}
                size="xs"
              />
              <RetroAttributeBar
                label="CON"
                value={character.attributes.constitution}
                icon={<HeartPulse className="h-2 w-2" />}
                isActive={isSelected}
                size="xs"
              />
              <RetroAttributeBar
                label="SIZE"
                value={character.attributes.size}
                icon={<Ruler className="h-2 w-2" />}
                isActive={isSelected}
                size="xs"
              />
              <RetroAttributeBar
                label="AGI"
                value={character.attributes.agility}
                icon={<Footprints className="h-2 w-2" />}
                isActive={isSelected}
                size="xs"
              />
              <RetroAttributeBar
                label="STA"
                value={character.attributes.stamina}
                icon={<Heart className="h-2 w-2" />}
                isActive={isSelected}
                size="xs"
              />
              <RetroAttributeBar
                label="LUCK"
                value={character.attributes.luck}
                icon={<Dices className="h-2 w-2" />}
                isActive={isSelected}
                size="xs"
              />
            </div>

            {/* Stance Selector */}
            <AnimatePresence>
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 6 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{
                    duration: 0.3,
                    ease: "easeInOut",
                  }}
                  className="overflow-hidden stance-selector border-t border-primary/40 pt-1.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                >
                  <RetroStanceSelector
                    character={character as any}
                    currentStance={character.stance as StanceType}
                    onStanceChange={(newStance) => {
                      console.log(
                        "Stance changing from",
                        character.stance,
                        "to",
                        newStance,
                      );
                      onSelect(newStance);
                    }}
                    size="sm"
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
