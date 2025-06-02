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
import {
  RetroCard,
  RetroCardContent,
  RetroCardHeader,
  RetroCardTitle,
} from "@/components/ui/retro-card";
import { RetroButton } from "@/components/ui/retro-button";
import { RetroAttributeBar } from "@/components/ui/retro-attribute-bar";
import { cn } from "@/lib/utils";

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
          title: "STRENGTH",
          description:
            "AFFECTS PHYSICAL POWER, WEAPON DAMAGE, PARRY CHANCE, COUNTERATTACK EFFECTIVENESS, AND ENDURANCE",
          details: [
            "INCREASES PHYSICAL DAMAGE WITH ALL WEAPONS",
            "IMPROVES PARRY CHANCE AGAINST ENEMY ATTACKS",
            "ENHANCES COUNTERATTACK DAMAGE AND EFFECTIVENESS",
            "CONTRIBUTES TO CRITICAL HIT DAMAGE MULTIPLIER",
            "SLIGHTLY IMPROVES MAXIMUM ENDURANCE",
          ],
        };
      case "Constitution":
        return {
          title: "CONSTITUTION",
          description:
            "AFFECTS MAXIMUM HEALTH, BLOCK CHANCE, RIPOSTE ABILITY, AND SURVIVAL IN LETHAL SITUATIONS",
          details: [
            "MAJOR CONTRIBUTOR TO MAXIMUM HEALTH",
            "IMPROVES CHANCE TO BLOCK ATTACKS WITH SHIELDS",
            "CONTRIBUTES TO RIPOSTE CHANCE AFTER SUCCESSFUL PARRY",
            "SIGNIFICANTLY INCREASES SURVIVAL CHANCE IN LETHAL SITUATIONS",
          ],
        };
      case "Size":
        return {
          title: "SIZE",
          description:
            "AFFECTS MAXIMUM HEALTH, PHYSICAL POWER, BLOCK CHANCE, AND INVERSELY AFFECTS DODGE CAPABILITY",
          details: [
            "CONTRIBUTES TO MAXIMUM HEALTH",
            "INCREASES PHYSICAL POWER AND DAMAGE MODIFIER",
            "IMPROVES BLOCK CHANCE WITH SHIELDS",
            "HIGHER SIZE REDUCES DODGE CHANCE",
            "AFFECTS YOUR COMBAT PRESENCE AND ABILITY TO WITHSTAND DAMAGE",
          ],
        };
      case "Agility":
        return {
          title: "AGILITY",
          description:
            "AFFECTS INITIATIVE, HIT ACCURACY, DODGE CHANCE, PARRY ABILITY, CRITICAL STRIKES, COUNTERATTACKS, AND RIPOSTES",
          details: [
            "MAJOR FACTOR IN INITIATIVE CALCULATION AND COMBAT SPEED",
            "INCREASES HIT CHANCE AND ACCURACY IN COMBAT",
            "PRIMARY CONTRIBUTOR TO DODGE CHANCE",
            "IMPROVES PARRY SUCCESS RATE",
            "CONTRIBUTES TO CRITICAL HIT CHANCE",
            "ENHANCES COUNTERATTACK AND RIPOSTE ABILITIES",
          ],
        };
      case "Stamina":
        return {
          title: "STAMINA",
          description:
            "AFFECTS MAXIMUM ENDURANCE, ENERGY RESERVES, DODGE CAPABILITY, PARRY EFFECTIVENESS, AND CONTRIBUTES TO HEALTH",
          details: [
            "PRIMARY CONTRIBUTOR TO MAXIMUM ENDURANCE",
            "DETERMINES HOW QUICKLY YOU FATIGUE IN COMBAT",
            "ADDS TO TOTAL HEALTH",
            "IMPROVES DODGE CAPABILITY",
            "CONTRIBUTES TO PARRY EFFECTIVENESS",
            "CRITICAL FOR SUSTAINED COMBAT PERFORMANCE",
          ],
        };
      case "Luck":
        return {
          title: "LUCK",
          description:
            "AFFECTS INITIATIVE, ACCURACY, CRITICAL HIT CHANCE, RIPOSTE ABILITY, AND SURVIVAL CHANCE IN LETHAL SITUATIONS",
          details: [
            "CONTRIBUTES TO INITIATIVE AND COMBAT ORDER",
            "SIGNIFICANTLY INCREASES HIT CHANCE",
            "IMPROVES CRITICAL HIT CHANCES",
            "ENHANCES RIPOSTE SUCCESS RATE",
            "INCREASES SURVIVAL CHANCES IN LETHAL COMBAT SITUATIONS",
            "AFFECTS FAVORABLE OUTCOMES IN VARIOUS COMBAT SCENARIOS",
          ],
        };
      default:
        return null;
    }
  };

  return (
    <RetroCard variant="arcade" withScanlines>
      <RetroCardHeader variant="arcade">
        <RetroCardTitle variant="arcade" className="font-pixel text-pixel-lg flex items-center gap-2">
          <Dumbbell className="h-4 w-4 text-primary" />
          COMBAT ATTRIBUTES
        </RetroCardTitle>
      </RetroCardHeader>
      
      <RetroCardContent className="p-4">
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <RetroAttributeCard
            label="STR"
            fullLabel="Strength"
            value={character.attributes.strength}
            description="PHYSICAL POWER"
            icon={<Dumbbell className="h-3 w-3" />}
            onInfoClick={() => setSelectedAttribute("Strength")}
          />
          <RetroAttributeCard
            label="CON"
            fullLabel="Constitution"
            value={character.attributes.constitution}
            description="HEALTH"
            icon={<HeartPulse className="h-3 w-3" />}
            onInfoClick={() => setSelectedAttribute("Constitution")}
          />
          <RetroAttributeCard
            label="SIZE"
            fullLabel="Size"
            value={character.attributes.size}
            description="DEFENSE"
            icon={<Ruler className="h-3 w-3" />}
            onInfoClick={() => setSelectedAttribute("Size")}
          />
          <RetroAttributeCard
            label="AGI"
            fullLabel="Agility"
            value={character.attributes.agility}
            description="SPEED"
            icon={<ArrowLeft className="h-3 w-3 transform -rotate-45" />}
            onInfoClick={() => setSelectedAttribute("Agility")}
          />
          <RetroAttributeCard
            label="STA"
            fullLabel="Stamina"
            value={character.attributes.stamina}
            description="ENDURANCE"
            icon={<Zap className="h-3 w-3" />}
            onInfoClick={() => setSelectedAttribute("Stamina")}
          />
          <RetroAttributeCard
            label="LUCK"
            fullLabel="Luck"
            value={character.attributes.luck}
            description="CRITICAL"
            icon={<Dices className="h-3 w-3" />}
            onInfoClick={() => setSelectedAttribute("Luck")}
          />
        </motion.div>
      </RetroCardContent>

      <AnimatePresence>
        {selectedAttribute && (
          <RetroAttributeModal
            details={getAttributeDetails(selectedAttribute)}
            onClose={() => setSelectedAttribute(null)}
          />
        )}
      </AnimatePresence>
    </RetroCard>
  );
}

interface AttributeCardProps {
  label: string;
  fullLabel: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  onInfoClick: () => void;
}

function RetroAttributeCard({
  label,
  fullLabel,
  value,
  description,
  icon,
  onInfoClick,
}: AttributeCardProps) {
  return (
    <RetroCard 
      variant="pixel" 
      size="sm"
      className="hover:scale-[1.02] transition-all duration-300 cursor-pointer"
    >
      <RetroCardContent className="p-3 space-y-2">
        {/* Header with Info Button */}
        <div className="flex justify-between items-center">
          <h4 className="font-pixel text-pixel-sm text-primary font-bold">
            {label}
          </h4>
          <RetroButton
            variant="pixel"
            size="xs"
            onClick={onInfoClick}
            className="flex-shrink-0"
          >
            <Info className="h-2.5 w-2.5" />
          </RetroButton>
        </div>

        {/* Description */}
        <p className="font-pixel text-pixel-xs text-foreground/70 uppercase">
          {description}
        </p>

        {/* Attribute Bar using the reusable component */}
        <RetroAttributeBar
          label=""
          value={value}
          icon={icon}
          showValue={true}
          size="sm"
          valueFormatter={(v) => v.toString()}
          className="mt-2"
        />
      </RetroCardContent>
    </RetroCard>
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

function RetroAttributeModal({ details, onClose }: AttributeModalProps) {
  if (!details) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="max-w-md w-full"
      >
        <RetroCard variant="arcade" withScanlines>
          <RetroCardHeader variant="arcade">
            <div className="flex justify-between items-center">
              <RetroCardTitle variant="arcade" className="font-pixel text-pixel-lg">
                {details.title}
              </RetroCardTitle>
              <RetroButton
                variant="pixel"
                size="sm"
                onClick={onClose}
              >
                <X className="h-3 w-3" />
              </RetroButton>
            </div>
          </RetroCardHeader>

          <RetroCardContent className="p-4 space-y-3">
            <p className="font-pixel text-pixel-xs text-foreground/80 uppercase">
              {details.description}
            </p>

            <div>
              <h4 className="font-pixel text-pixel-xs text-primary font-bold mb-2">
                COMBAT EFFECTS:
              </h4>
              <ul className="space-y-1">
                {details.details.map((detail, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span className="font-pixel text-pixel-xs text-foreground/70 uppercase">
                      {detail}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </RetroCardContent>
        </RetroCard>
      </motion.div>
    </motion.div>
  );
}
