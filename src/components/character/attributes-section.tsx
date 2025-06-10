"use client";

import { useState } from "react";
import type { Player } from "@/types/player.types";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Dices,
  Dumbbell,
  HeartPulse,
  Ruler,
  Zap,
  Info,
  X,
} from "lucide-react";

interface AttributesSectionProps {
  character: Player;
}

export function AttributesSection({ character }: AttributesSectionProps) {
  const [selectedAttribute, setSelectedAttribute] = useState<string | null>(
    null,
  );

  const getAttributeDetails = (attr: string) => {
    switch (attr) {
      case "Strength":
        return {
          title: "Strength",
          description:
            "Affects physical power, weapon damage, parry chance, counterattack effectiveness, and endurance",
          details: [
            "Increases physical damage with all weapons",
            "Improves parry chance against enemy attacks",
            "Enhances counterattack damage and effectiveness",
            "Contributes to critical hit damage multiplier",
            "Slightly improves maximum endurance",
          ],
        };
      case "Constitution":
        return {
          title: "Constitution",
          description:
            "Affects maximum health, block chance, riposte ability, and survival in lethal situations",
          details: [
            "Major contributor to maximum health",
            "Improves chance to block attacks with shields",
            "Contributes to riposte chance after successful parry",
            "Significantly increases survival chance in lethal situations",
          ],
        };
      case "Size":
        return {
          title: "Size",
          description:
            "Affects maximum health, physical power, block chance, and inversely affects dodge capability",
          details: [
            "Contributes to maximum health",
            "Increases physical power and damage modifier",
            "Improves block chance with shields",
            "Higher size reduces dodge chance",
            "Affects your combat presence and ability to withstand damage",
          ],
        };
      case "Agility":
        return {
          title: "Agility",
          description:
            "Affects initiative, hit accuracy, dodge chance, parry ability, critical strikes, counterattacks, and ripostes",
          details: [
            "Major factor in initiative calculation and combat speed",
            "Increases hit chance and accuracy in combat",
            "Primary contributor to dodge chance",
            "Improves parry success rate",
            "Contributes to critical hit chance",
            "Enhances counterattack and riposte abilities",
          ],
        };
      case "Stamina":
        return {
          title: "Stamina",
          description:
            "Affects maximum endurance, energy reserves, dodge capability, parry effectiveness, and contributes to health",
          details: [
            "Primary contributor to maximum endurance",
            "Determines how quickly you fatigue in combat",
            "Adds to total health",
            "Improves dodge capability",
            "Contributes to parry effectiveness",
            "Critical for sustained combat performance",
          ],
        };
      case "Luck":
        return {
          title: "Luck",
          description:
            "Affects initiative, accuracy, critical hit chance, riposte ability, and survival chance in lethal situations",
          details: [
            "Contributes to initiative and combat order",
            "Significantly increases hit chance",
            "Improves critical hit chances",
            "Enhances riposte success rate",
            "Increases survival chances in lethal combat situations",
            "Affects favorable outcomes in various combat scenarios",
          ],
        };
      default:
        return null;
    }
  };

  return (
    <motion.div
      className="mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <AttributeCard
          label="Strength"
          value={character.attributes.strength}
          description="Physical power & combat"
          icon={<Dumbbell className="h-5 w-5" />}
          onInfoClick={() => setSelectedAttribute("Strength")}
        />
        <AttributeCard
          label="Constitution"
          value={character.attributes.constitution}
          description="Health & resilience"
          icon={<HeartPulse className="h-5 w-5" />}
          onInfoClick={() => setSelectedAttribute("Constitution")}
        />
        <AttributeCard
          label="Size"
          value={character.attributes.size}
          description="Power & defense"
          icon={<Ruler className="h-5 w-5" />}
          onInfoClick={() => setSelectedAttribute("Size")}
        />
        <AttributeCard
          label="Agility"
          value={character.attributes.agility}
          description="Speed & finesse"
          icon={<ArrowLeft className="h-5 w-5 transform -rotate-45" />}
          onInfoClick={() => setSelectedAttribute("Agility")}
        />
        <AttributeCard
          label="Stamina"
          value={character.attributes.stamina}
          description="Endurance & energy"
          icon={<Zap className="h-5 w-5" />}
          onInfoClick={() => setSelectedAttribute("Stamina")}
        />
        <AttributeCard
          label="Luck"
          value={character.attributes.luck}
          description="Critical moments"
          icon={<Dices className="h-5 w-5" />}
          onInfoClick={() => setSelectedAttribute("Luck")}
        />
      </div>

      <AnimatePresence>
        {selectedAttribute && (
          <AttributeModal
            details={getAttributeDetails(selectedAttribute)}
            onClose={() => setSelectedAttribute(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface AttributeCardProps {
  label: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  onInfoClick: () => void;
}

function AttributeCard({
  label,
  value,
  description,
  icon,
  onInfoClick,
}: AttributeCardProps) {
  // Generate a dynamic color based on the attribute value
  const getValueColor = (val: number) => {
    if (val >= 15) return "text-yellow-400";
    if (val >= 10) return "text-green-400";
    if (val >= 5) return "text-blue-400";
    return "text-stone-400";
  };

  // Fix: Use proper attribute scale (3-21)
  const minValue = 3;
  const maxValue = 21;
  const percentage = ((value - minValue) / (maxValue - minValue)) * 100;

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

      <div className="flex justify-between items-center text-stone-400 text-sm relative z-10 group-hover:text-stone-300 transition-colors duration-300">
        <p>{description}</p>
        <button
          type="button"
          onClick={onInfoClick}
          className="ml-2 text-yellow-500/70 hover:text-yellow-400 transition-colors duration-200 focus:outline-none"
          aria-label="More information"
        >
          <Info className="h-4 w-4" />
        </button>
      </div>

      {/* Progress bar visualization */}
      <div className="mt-3 h-1 w-full bg-stone-700/50 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-700 to-yellow-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      </div>
    </motion.div>
  );
}

interface AttributeModalProps {
  details: {
    title: string;
    description: string;
    details: string[];
  } | null;
  onClose: () => void;
}

function AttributeModal({ details, onClose }: AttributeModalProps) {
  if (!details) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-stone-900 border border-yellow-600/30 rounded-lg max-w-md w-full p-6"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-yellow-500">
            {details.title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-yellow-400 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-stone-300 mb-4">{details.description}</p>

        <h4 className="text-yellow-400 text-sm font-medium mb-2">Effects:</h4>
        <ul className="text-stone-300 space-y-2">
          {details.details.map((detail, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <li key={index} className="flex items-start">
              <span className="text-yellow-500 mr-2">•</span>
              <span className="text-sm">{detail}</span>
            </li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  );
}
