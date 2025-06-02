"use client";

import { RetroStanceSelector } from "@/components/character/retro-stance-selector";
import { StanceType } from "@/types/equipment.types";
import type { Fighter } from "@/types/fighter-types";

interface StanceSelectorProps {
  character: Fighter;
  currentStance: StanceType;
  onStanceChange: (newStance: StanceType) => void;
}

export function StanceSelector({
  character,
  currentStance,
  onStanceChange,
}: StanceSelectorProps) {
  return (
    <div className="px-2">
      <RetroStanceSelector
        character={character}
        currentStance={currentStance}
        onStanceChange={onStanceChange}
        size="default"
      />
    </div>
  );
}
