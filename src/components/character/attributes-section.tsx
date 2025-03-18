"use client";

import type { Character } from "@/types/player.types";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Dices,
  Dumbbell,
  HeartPulse,
  Ruler,
  Zap,
} from "lucide-react";

interface AttributesSectionProps {
  character: Character;
}

export function AttributesSection({ character }: AttributesSectionProps) {
  return (
    <motion.div
      className="mb-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h3 className="text-2xl font-semibold text-yellow-500 mb-6 flex items-center">
        <Dumbbell className="mr-2 h-5 w-5" />
        Attributes
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <AttributeCard
          label="Strength"
          value={character.attributes.strength}
          description="Determines attack power"
          icon={<Dumbbell className="h-5 w-5" />}
        />
        <AttributeCard
          label="Constitution"
          value={character.attributes.constitution}
          description="Affects health and resilience"
          icon={<HeartPulse className="h-5 w-5" />}
        />
        <AttributeCard
          label="Size"
          value={character.attributes.size}
          description="Affects damage and defense"
          icon={<Ruler className="h-5 w-5" />}
        />
        <AttributeCard
          label="Agility"
          value={character.attributes.agility}
          description="Affects dodge and speed"
          icon={<ArrowLeft className="h-5 w-5 transform -rotate-45" />}
        />
        <AttributeCard
          label="Stamina"
          value={character.attributes.stamina}
          description="Determines endurance in battle"
          icon={<Zap className="h-5 w-5" />}
        />
        <AttributeCard
          label="Luck"
          value={character.attributes.luck}
          description="Affects critical hits and special events"
          icon={<Dices className="h-5 w-5" />}
        />
      </div>
    </motion.div>
  );
}

interface AttributeCardProps {
  label: string;
  value: number;
  description: string;
  icon: React.ReactNode;
}

function AttributeCard({
  label,
  value,
  description,
  icon,
}: AttributeCardProps) {
  // Generate a dynamic color based on the attribute value
  const getValueColor = (val: number) => {
    if (val >= 8) return "text-yellow-400";
    if (val >= 6) return "text-green-400";
    if (val >= 4) return "text-blue-400";
    return "text-stone-400";
  };

  return (
    <motion.div
      className="bg-gradient-to-b from-amber-900/10 to-stone-900/40 rounded-lg border border-yellow-600/20 p-6 relative overflow-hidden group hover:border-yellow-600/30 transition-all duration-300"
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-yellow-600/0 via-yellow-500/5 to-yellow-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="flex justify-between items-center mb-2 relative z-10">
        <h4 className="font-medium text-yellow-400 flex items-center group-hover:text-yellow-300 transition-colors duration-300">
          <span className="mr-2 text-yellow-500 group-hover:text-yellow-400 transition-colors duration-300">
            {icon}
          </span>
          {label}
        </h4>
        <span className={`text-2xl font-bold ${getValueColor(value)}`}>
          {value}
        </span>
      </div>
      <p className="text-stone-400 text-sm relative z-10 group-hover:text-stone-300 transition-colors duration-300">
        {description}
      </p>

      {/* Progress bar visualization */}
      <div className="mt-3 h-1 w-full bg-stone-700/50 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-700 to-yellow-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(value / 10) * 100}%` }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      </div>
    </motion.div>
  );
} 