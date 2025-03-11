"use client";

import { cn } from "@/lib/utils";
import type { CalculatedStats, Character } from "@/types/player.types";
import Image from "next/image";
import { useState } from "react";

interface PlayerCardProps {
  character: Character;
  stats?: CalculatedStats;
  isSelected?: boolean;
  onSelect?: () => void;
  className?: string;
}

export function PlayerCard({
  character,
  stats,
  isSelected = false,
  onSelect,
  className,
}: PlayerCardProps) {
  const [showStats, setShowStats] = useState(false);

  const toggleStats = () => {
    setShowStats(!showStats);
  };

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-lg border bg-card text-card-foreground shadow-sm transition-all",
        isSelected ? "ring-2 ring-primary" : "hover:shadow-md",
        onSelect ? "cursor-pointer" : "",
        className,
      )}
      onClick={onSelect}
    >
      <div className="relative h-48 overflow-hidden rounded-t-lg">
        <Image
          src={character.imageUrl}
          alt={character.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4">
          <h3 className="text-xl font-bold text-white">{character.name}</h3>
          <p className="text-sm text-white/80">ID: {character.playerId}</p>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Weapon</span>
            <span className="font-medium">{character.weapon}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Armor</span>
            <span className="font-medium">{character.armor}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Stance</span>
            <span className="font-medium capitalize">{character.stance}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <StatDisplay label="STR" value={character.strength} />
          <StatDisplay label="CON" value={character.constitution} />
          <StatDisplay label="SIZE" value={character.size} />
          <StatDisplay label="AGI" value={character.agility} />
          <StatDisplay label="STA" value={character.stamina} />
          <StatDisplay label="LUCK" value={character.luck} />
        </div>

        {stats && (
          <div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleStats();
              }}
              className="text-sm text-primary hover:underline"
            >
              {showStats ? "Hide Calculated Stats" : "Show Calculated Stats"}
            </button>

            {showStats && (
              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Health:</span>
                  <span>{stats.maxHealth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Endurance:</span>
                  <span>{stats.maxEndurance}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Damage:</span>
                  <span>{stats.damageModifier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hit %:</span>
                  <span>{stats.hitChance}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Block %:</span>
                  <span>{stats.blockChance}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dodge %:</span>
                  <span>{stats.dodgeChance}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Crit %:</span>
                  <span>{stats.critChance}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Crit Mult:</span>
                  <span>{stats.critMultiplier}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Counter %:</span>
                  <span>{stats.counterChance}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Parry %:</span>
                  <span>{stats.parryChance}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Initiative:</span>
                  <span>{stats.initiative}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface StatDisplayProps {
  label: string;
  value: number;
}

function StatDisplay({ label, value }: StatDisplayProps) {
  // Determine color based on stat value
  const getStatColor = (value: number) => {
    if (value >= 15) return "text-green-600";
    if (value >= 10) return "text-blue-600";
    return "text-red-600";
  };

  return (
    <div className="flex flex-col items-center justify-center p-1 border rounded">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`font-bold ${getStatColor(value)}`}>{value}</span>
    </div>
  );
}
