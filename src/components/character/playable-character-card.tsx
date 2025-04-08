"use client";

import { CardContainer } from "@/components/character/card-container";
import type { Player } from "@/types/player.types";
import Image from "next/image";
import { YellowButton } from "@/components/ui/yellow-button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dumbbell,
  Footprints,
  Heart,
  HeartPulse,
  Ruler,
  Dices,
} from "lucide-react";
import { Check } from "lucide-react";
import { StanceSelector } from "./stance-selector";
import type { StanceType } from "@/types/equipment.types";

interface CharacterCardProps {
  character: Player;
  index: number;
  isSelected: boolean;
  onSelect: (newStance?: StanceType) => void;
  onDeselect: () => void;
  onViewDetails: () => void;
}

function AttributeBar({
  label,
  value,
  icon,
}: { label: string; value: number; icon: React.ReactNode }) {
  const minValue = 3;
  const maxValue = 21;
  const percentage = ((value - minValue) / (maxValue - minValue)) * 100;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-xs">
        <span className="flex items-center text-zinc-400">
          {icon}
          <span className="ml-1.5">{label}</span>
        </span>
        <span className="font-medium text-white">{value}</span>
      </div>
      <div className="h-1.5 w-full bg-stone-800/80 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-700 to-yellow-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, delay: 0.2 }}
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
  onDeselect,
  onViewDetails,
}: CharacterCardProps) {
  return (
    <CardContainer index={index} isSelected={isSelected}>
      <div className="relative">
        {/* Character Image */}
        <div className="aspect-square relative bg-gradient-to-b from-stone-800/30 to-stone-900/30 overflow-hidden group">
          <motion.div
            className="absolute inset-0 bg-gradient-radial from-yellow-500/10 to-transparent opacity-0 z-10"
            initial={false}
            animate={isSelected ? { opacity: 0.4 } : { opacity: 0 }}
            transition={{ duration: 0.6 }}
          />

          <Image
            src={character.currentSkin.imageURL}
            alt={`Character ${character.name.fullName}`}
            width={300}
            height={300}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority
          />

          {/* Character ID Badge */}
          <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-xs font-mono text-yellow-500 border border-yellow-500/30 z-20">
            ID: {character.id}
          </div>

          {/* Selected Badge */}
          {isSelected && (
            <div className="absolute top-3 right-3 bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 z-20">
              <Check size={12} /> Selected
            </div>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Character Name */}
        <h3 className="font-bold text-lg text-yellow-500 truncate">
          {character.name.fullName}
        </h3>

        {/* Attributes */}
        <div className="space-y-2.5">
          <AttributeBar
            label="Strength"
            value={character.attributes.strength}
            icon={<Dumbbell className="h-3.5 w-3.5 text-yellow-600" />}
          />
          <AttributeBar
            label="Constitution"
            value={character.attributes.constitution}
            icon={<HeartPulse className="h-3.5 w-3.5 text-yellow-600" />}
          />
          <AttributeBar
            label="Size"
            value={character.attributes.size}
            icon={<Ruler className="h-3.5 w-3.5 text-yellow-600" />}
          />
          <AttributeBar
            label="Agility"
            value={character.attributes.agility}
            icon={<Footprints className="h-3.5 w-3.5 text-yellow-600" />}
          />
          <AttributeBar
            label="Stamina"
            value={character.attributes.stamina}
            icon={<Heart className="h-3.5 w-3.5 text-yellow-600" />}
          />
          <AttributeBar
            label="Luck"
            value={character.attributes.luck}
            icon={<Dices className="h-3.5 w-3.5 text-yellow-600" />}
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <YellowButton
            onClick={isSelected ? onDeselect : () => onSelect()}
            className="w-full"
            variant={isSelected ? "outline" : "default"}
          >
            {isSelected ? "Deselect" : "Select"}
          </YellowButton>

          <YellowButton
            onClick={onViewDetails}
            className="w-full"
            variant="outline"
          >
            Details
          </YellowButton>
        </div>

        {/* Add AnimatePresence for the stance selector */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 16 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className="overflow-hidden"
            >
              <StanceSelector
                character={character}
                currentStance={character.stance as StanceType}
                onStanceChange={(newStance) =>
                  onSelect(newStance as unknown as StanceType)
                }
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </CardContainer>
  );
}
