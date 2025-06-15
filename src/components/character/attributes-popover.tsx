"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { motion } from "framer-motion";
import {
  Dumbbell,
  Footprints,
  Heart,
  HeartPulse,
  Ruler,
  Dices,
} from "lucide-react";
import type { Player } from "@/types/player.types";

interface AttributesPopoverProps {
  character: Player;
  children: React.ReactNode;
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
      <div className="flex justify-between items-center text-xs">
        <span className="flex items-center text-stone-400">
          {icon}
          <span className="ml-1">{label}</span>
        </span>
        <span className="font-medium text-white">{value}</span>
      </div>
      <div className="h-1.5 w-full bg-stone-800/80 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-700 to-yellow-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, delay: 0.1 }}
        />
      </div>
    </div>
  );
}

export function AttributesPopover({ character, children }: AttributesPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-64 bg-stone-900/95 border-yellow-500/30" side="left">
        <div className="space-y-3">
          <div className="text-center">
            <h4 className="font-bold text-yellow-500 text-sm">
              {character.name.fullName}
            </h4>
            <p className="text-xs text-stone-400">Attributes</p>
          </div>
          
          <div className="space-y-2">
            <AttributeBar
              label="Strength"
              value={character.attributes.strength}
              icon={<Dumbbell className="h-3 w-3 text-yellow-600" />}
            />
            <AttributeBar
              label="Constitution"
              value={character.attributes.constitution}
              icon={<HeartPulse className="h-3 w-3 text-yellow-600" />}
            />
            <AttributeBar
              label="Size"
              value={character.attributes.size}
              icon={<Ruler className="h-3 w-3 text-yellow-600" />}
            />
            <AttributeBar
              label="Agility"
              value={character.attributes.agility}
              icon={<Footprints className="h-3 w-3 text-yellow-600" />}
            />
            <AttributeBar
              label="Stamina"
              value={character.attributes.stamina}
              icon={<Heart className="h-3 w-3 text-yellow-600" />}
            />
            <AttributeBar
              label="Luck"
              value={character.attributes.luck}
              icon={<Dices className="h-3 w-3 text-yellow-600" />}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
} 