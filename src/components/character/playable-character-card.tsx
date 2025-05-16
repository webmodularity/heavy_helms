"use client";

import { CardContainer } from "@/components/character/card-container";
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
} from "lucide-react";
import { StanceType } from "@/types/equipment.types";
import { useState } from "react";

interface CharacterCardProps {
  character: Player;
  index: number;
  isSelected: boolean;
  onSelect: (newStance?: StanceType) => void;
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
    <div className="space-y-1">
      <div className="flex justify-between items-center text-[10px]">
        <span className="flex items-center text-zinc-400">
          {icon}
          <span className="ml-1">{label}</span>
        </span>
        <span className="font-medium text-white">{value}</span>
      </div>
      <div className="h-1 w-full bg-stone-800/80 rounded-full overflow-hidden">
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
      legacyBehavior
      passHref
    >
      <div className="cursor-pointer">
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
                width={210}
                height={210}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                priority
              />

              {/* Character ID Badge */}
              <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-mono text-yellow-500 border border-yellow-500/30 z-20">
                ID: {character.id}
              </div>

              {/* Selected Badge */}
              {isSelected && (
                <div className="absolute top-2 right-2 bg-yellow-500 text-black px-1.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-0.5 z-20">
                  <Check size={8} /> Selected
                </div>
              )}
            </div>
          </div>

          <div className="p-2 space-y-2">
            {/* Character Name */}
            <h3 className="font-bold text-sm text-yellow-500 truncate">
              {character.name.fullName}
            </h3>

            {/* Attributes */}
            <div className="space-y-1.5">
              <AttributeBar
                label="Strength"
                value={character.attributes.strength}
                icon={<Dumbbell className="h-2.5 w-2.5 text-yellow-600" />}
              />
              <AttributeBar
                label="Constitution"
                value={character.attributes.constitution}
                icon={<HeartPulse className="h-2.5 w-2.5 text-yellow-600" />}
              />
              <AttributeBar
                label="Size"
                value={character.attributes.size}
                icon={<Ruler className="h-2.5 w-2.5 text-yellow-600" />}
              />
              <AttributeBar
                label="Agility"
                value={character.attributes.agility}
                icon={<Footprints className="h-2.5 w-2.5 text-yellow-600" />}
              />
              <AttributeBar
                label="Stamina"
                value={character.attributes.stamina}
                icon={<Heart className="h-2.5 w-2.5 text-yellow-600" />}
              />
              <AttributeBar
                label="Luck"
                value={character.attributes.luck}
                icon={<Dices className="h-2.5 w-2.5 text-yellow-600" />}
              />
            </div>

            {/* Add AnimatePresence for the stance selector */}
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
                  <CompactStanceSelector
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
      </div>
    </Link>
  );
}

// Compact version of the stance selector
function CompactStanceSelector({
  character,
  currentStance,
  onStanceChange,
}: {
  character: Player;
  currentStance: StanceType;
  onStanceChange: (newStance: StanceType) => void;
}) {
  const [stance, setStance] = useState<StanceType>(currentStance);

  // Icons and descriptions for different stances
  const stanceInfo = {
    [StanceType.Defensive]: {
      icon: <Shield className="h-3 w-3" />,
      label: "Defensive",
      color: "bg-gradient-to-r from-emerald-700 to-emerald-500",
    },
    [StanceType.Balanced]: {
      icon: <Swords className="h-3 w-3" />,
      label: "Balanced",
      color: "bg-gradient-to-r from-blue-700 to-blue-500",
    },
    [StanceType.Offensive]: {
      icon: <Flame className="h-3 w-3" />,
      label: "Offensive",
      color: "bg-gradient-to-r from-orange-700 to-orange-500",
    },
  };

  const handleStanceChange = (newStance: StanceType) => {
    setStance(newStance);
    onStanceChange(newStance);
  };

  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-medium text-zinc-400">Combat Stance</p>
      <div className="flex justify-between p-1 bg-stone-800/60 rounded-md border border-yellow-500/20">
        {Object.entries(stanceInfo).map(([value, info]) => {
          const stanceValue = Number(value) as StanceType;
          const isSelected = stance === stanceValue;
          return (
            <button
              type="button"
              key={value}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault(); // Prevent link navigation
                handleStanceChange(stanceValue);
              }}
              className={`flex-1 relative py-1 rounded-sm ${isSelected ? "text-white" : "text-zinc-400"}`}
            >
              <div className="flex flex-col items-center gap-0.5 relative z-10">
                <span className="text-yellow-400">{info.icon}</span>
                <span className="text-[10px] font-medium">{info.label}</span>
              </div>
              {isSelected && (
                <div
                  className={`absolute inset-0 ${info.color} rounded-sm opacity-20`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
