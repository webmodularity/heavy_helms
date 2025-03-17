"use client";

import { Button } from "@/components/ui/button";
import { CardContainer } from "@/components/character/card-container";
import type { Character } from "@/types/player.types";
import Image from "next/image";
import { YellowButton } from "@/components/ui/yellow-button";

interface CharacterCardProps {
  character: Character;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onDeselect: () => void;
  onViewDetails: () => void;
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
      <div className="aspect-square relative bg-gradient-to-b from-stone-800/30 to-stone-900/30 overflow-hidden">
        <Image
          src={
            character.currentSkin.imageURL
          }
          alt={`Character ${character.name}`}
          width={300}
          height={300}
          className="object-cover"
          priority
        />
        <div className="absolute top-3 left-3 bg-black/50 px-2 py-1 rounded text-xs font-semibold backdrop-blur-sm text-yellow-500">
          ID: {character.id}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-medium text-lg text-yellow-500">
          {character.name.fullName}
        </h3>
        <div className="mt-1 text-xs space-y-1 text-zinc-400">
          <div className="flex justify-between">
            <span>Strength</span>
            <span className="text-white">{character.attributes.strength}</span>
          </div>
          <div className="flex justify-between">
            <span>Agility</span>
            <span className="text-white">{character.attributes.agility}</span>
          </div>
          <div className="flex justify-between">
            <span>Stamina</span>
            <span className="text-white">{character.attributes.stamina}</span>
          </div>
        </div>

        <div className="mt-4 flex space-x-2">
          {isSelected ? (
            <YellowButton onClick={onDeselect}>
              Deselect
            </YellowButton>
          ) : (
            <YellowButton onClick={onSelect}>
              Select
            </YellowButton>
          )}
          <YellowButton onClick={onViewDetails}>
            Details
          </YellowButton>
        </div>
      </div>
    </CardContainer>
  );
}
