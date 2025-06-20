"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Target, Trophy, Swords, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Player } from "@/types/player.types";
import { GauntletRegistrationForm } from "@/components/gauntlet/gauntlet-registration-form";
import * as Dialog from "@radix-ui/react-dialog";
import { BATTLE_THEMES, BattleTheme } from "../shared/battle-modal";
import { DuelModal } from "./duel-modal";

interface MagicalBattlePortalsProps {
  isVisible: boolean;
  selectedCharacter: Player | null;
}

interface BattleType {
  id: "practice" | "gauntlet" | "duel";
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  route?: string;
  theme: {
    primary: string;
    secondary: string;
    gradient: string;
    shadow: string;
    border: string;
    particles: string[];
  };
}

const battleTypes: BattleType[] = [
  {
    id: "practice",
    icon: Target,
    title: "Practice Mode",
    description: "Hone your skills in risk-free battles",
    route: "/practice",
    theme: {
      primary: "rgba(34, 197, 94, 0.4)",
      secondary: "rgba(22, 163, 74, 0.3)",
      gradient:
        "radial-gradient(circle, rgba(34, 197, 94, 0.4) 0%, rgba(22, 163, 74, 0.3) 30%, rgba(21, 128, 61, 0.2) 60%, transparent 80%)",
      shadow: "0 0 20px rgba(34, 197, 94, 0.3)",
      border: "rgb(34, 197, 94)",
      particles: ["#22C55E", "#16A34A"],
    },
  },
  {
    id: "gauntlet",
    icon: Trophy,
    title: "Gauntlet Mode",
    description: "On-demand tournaments await",
    theme: {
      primary: "rgba(147, 51, 234, 0.4)",
      secondary: "rgba(124, 58, 237, 0.3)",
      gradient:
        "radial-gradient(circle, rgba(147, 51, 234, 0.4) 0%, rgba(124, 58, 237, 0.3) 30%, rgba(109, 40, 217, 0.2) 60%, transparent 80%)",
      shadow: "0 0 20px rgba(147, 51, 234, 0.3)",
      border: "rgb(147, 51, 234)",
      particles: ["#9333EA", "#7C3AED"],
    },
  },
  {
    id: "duel",
    icon: Swords,
    title: "Duel Mode",
    description: "Challenge warriors across the realm",
    theme: {
      primary: "rgba(239, 68, 68, 0.4)",
      secondary: "rgba(220, 38, 38, 0.3)",
      gradient:
        "radial-gradient(circle, rgba(239, 68, 68, 0.4) 0%, rgba(220, 38, 38, 0.3) 30%, rgba(185, 28, 28, 0.2) 60%, transparent 80%)",
      shadow: "0 0 20px rgba(239, 68, 68, 0.3)",
      border: "rgb(239, 68, 68)",
      particles: ["#EF4444", "#DC2626"],
    },
  },
];

export function MagicalBattlePortals({
  isVisible,
  selectedCharacter,
}: MagicalBattlePortalsProps) {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  // Prefetch practice route
  useEffect(() => {
    if (selectedCharacter) {
      router.prefetch(`/practice?player1Id=${selectedCharacter.id}`);
    }
  }, [selectedCharacter, router]);

  const handleButtonClick = (battleType: BattleType) => {
    if (!selectedCharacter || isNavigating) return;

    if (battleType.id === "practice" && battleType.route) {
      setIsNavigating(true);
      router.push(`${battleType.route}?player1Id=${selectedCharacter.id}`);
    } else {
      setOpenModal(battleType.id);
    }
  };

  const handleModalClose = () => {
    setOpenModal(null);
  };

  const handleChallengeSuccess = () => {
    setOpenModal(null);

    // Scroll to the challenges tab in the Activity Section
    const activitySection = document.getElementById("activity-section");
    if (activitySection) {
      activitySection.scrollIntoView({ behavior: "smooth" });

      // Set the active tab to "challenges"
      const event = new CustomEvent("activateChallengesTab");
      document.dispatchEvent(event);
    }
  };

  const handleGauntletRegister = () => {
    console.log("Registering for Gauntlet:", selectedCharacter?.id);
    setOpenModal(null);
  };

  if (!isVisible) return null;

  return (
    <>
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[100] flex flex-row gap-6">
        {battleTypes.map((battleType, index) => (
          <MagicalPortalButton
            key={battleType.id}
            battleType={battleType}
            isHovered={hoveredButton === battleType.id}
            onHover={() => setHoveredButton(battleType.id)}
            onLeave={() => setHoveredButton(null)}
            onClick={() => handleButtonClick(battleType)}
            disabled={!selectedCharacter || isNavigating}
            animationDelay={index * 0.1}
            isNavigating={isNavigating && battleType.id === "practice"}
          />
        ))}
      </div>

      {/* Integrated Duel Modal - replaces old BattleModal + CreateChallengeForm */}
      <DuelModal
        isOpen={openModal === "duel"}
        onClose={handleModalClose}
        selectedCharacter={selectedCharacter}
        onSuccess={handleChallengeSuccess}
      />

      {/* Gauntlet Modal - keeps using BattleModal for now */}
      <BattleModal
        isOpen={openModal === "gauntlet"}
        onClose={handleModalClose}
        title="Register for Gauntlet"
        theme={battleTypes.find((bt) => bt.id === "gauntlet")!.theme}
      >
        {selectedCharacter && (
          <GauntletRegistrationForm
            character={selectedCharacter}
            onRegister={handleGauntletRegister}
            onCancel={handleModalClose}
            animationDelay={0}
          />
        )}
      </BattleModal>
    </>
  );
}

interface MagicalPortalButtonProps {
  battleType: BattleType;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
  disabled: boolean;
  animationDelay: number;
  isNavigating: boolean;
}

function MagicalPortalButton({
  battleType,
  isHovered,
  onHover,
  onLeave,
  onClick,
  disabled,
  animationDelay,
  isNavigating,
}: MagicalPortalButtonProps) {
  const IconComponent = battleType.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, rotate: -180, x: 100 }}
      animate={{
        opacity: isNavigating ? 0.7 : 1,
        scale: isNavigating ? 0.9 : 1,
        rotate: 0,
        x: 0,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 20,
        duration: 0.8,
        delay: animationDelay,
      }}
      className="relative"
    >
      {/* Magical aura */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: battleType.theme.gradient,
          filter: "blur(12px)",
        }}
        animate={{
          scale: isHovered ? [1, 1.4, 1.2] : [1, 1.2, 1],
          opacity: isNavigating
            ? 0.3
            : isHovered
              ? [0.4, 0.8, 0.6]
              : [0.3, 0.6, 0.3],
          rotate: [0, 360],
        }}
        transition={{
          scale: {
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          },
          opacity: {
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          },
          rotate: {
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          },
        }}
      />

      {/* Main button */}
      <motion.button
        onClick={onClick}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
        disabled={disabled}
        className={`relative w-14 h-14 rounded-full backdrop-blur-sm
                   flex items-center justify-center overflow-hidden
                   transition-all duration-300 cursor-pointer
                   touch-manipulation border-2 ${
                     disabled
                       ? "opacity-50 cursor-not-allowed"
                       : "hover:scale-110 active:scale-95"
                   }`}
        style={{
          background: `linear-gradient(135deg, ${battleType.theme.primary}, ${battleType.theme.secondary})`,
          borderColor: disabled
            ? "rgba(156, 163, 175, 0.3)"
            : battleType.theme.border,
          boxShadow: disabled ? "none" : battleType.theme.shadow,
        }}
      >
        {/* Icon */}
        <motion.div
          className="relative z-10 pointer-events-none"
          animate={{
            rotate: isNavigating
              ? [0, 180]
              : isHovered
                ? [0, 15, -15, 0]
                : [0, 5, -5, 0],
            scale: isNavigating ? [1, 0.8] : isHovered ? [1, 1.1, 1] : 1,
          }}
          transition={{
            duration: isNavigating ? 0.3 : isHovered ? 0.4 : 2,
            repeat: isNavigating ? 0 : Number.POSITIVE_INFINITY,
          }}
        >
          <IconComponent className="w-6 h-6 text-white" />
        </motion.div>

        {/* Floating particles */}
        {!isNavigating &&
          !disabled &&
          [...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full pointer-events-none"
              style={{
                left: "50%",
                top: "50%",
                background: battleType.theme.particles[i % 2],
              }}
              animate={{
                x: [0, Math.cos((i * 90 * Math.PI) / 180) * (20 + i * 1.5)],
                y: [0, Math.sin((i * 90 * Math.PI) / 180) * (20 + i * 1.5)],
                opacity: [0, 1, 0.7, 0],
                scale: [0, 1, 0.8, 0],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.2,
                ease: "easeOut",
              }}
            />
          ))}

        {/* Hover stars */}
        <AnimatePresence>
          {isHovered &&
            !disabled &&
            !isNavigating &&
            [...Array(3)].map((_, i) => (
              <motion.div
                key={`star-${i}`}
                className="absolute pointer-events-none"
                style={{ left: "50%", top: "50%" }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: [0, Math.cos((i * 120 * Math.PI) / 180) * 30],
                  y: [0, Math.sin((i * 120 * Math.PI) / 180) * 30],
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{
                  duration: 1,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.2,
                }}
              >
                <Star className="w-2 h-2 text-white" />
              </motion.div>
            ))}
        </AnimatePresence>
      </motion.button>

      {/* Tooltip */}
      <motion.div
        className="absolute -left-40 top-1/2 transform -translate-y-1/2 
                   bg-gradient-to-r from-stone-900/95 to-stone-800/95 
                   border border-stone-600/40 rounded-lg px-3 py-2
                   text-stone-200 text-xs whitespace-nowrap backdrop-blur-sm
                   shadow-lg pointer-events-none min-w-36"
        initial={{ opacity: 0, x: 10, scale: 0.8 }}
        animate={{
          opacity: isHovered && !disabled ? 1 : 0,
          x: isHovered && !disabled ? 0 : 10,
          scale: isHovered && !disabled ? 1 : 0.8,
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        style={{ borderColor: battleType.theme.border + "40" }}
      >
        <div className="font-medium" style={{ color: battleType.theme.border }}>
          {isNavigating ? "Loading..." : battleType.title}
        </div>
        <div className="text-stone-400 text-[10px] mt-1">
          {battleType.description}
        </div>
      </motion.div>
    </motion.div>
  );
}

interface BattleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  theme: BattleTheme;
}

function BattleModal({
  isOpen,
  onClose,
  title,
  children,
  theme,
}: BattleModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[201] w-[90vw] max-w-md max-h-[85vh] overflow-auto">
          <Dialog.Title className="sr-only">{title}</Dialog.Title>
          <Dialog.Description className="sr-only">
            {title} battle modal
          </Dialog.Description>

          <motion.div
            className="bg-gradient-to-b from-stone-900/95 to-stone-950/95 
                       border-2 rounded-lg shadow-2xl backdrop-blur-sm p-6"
            style={{ borderColor: theme.border + "60" }}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="mb-4">
              <h2
                className="text-lg font-bold text-center"
                style={{ color: theme.border }}
              >
                {title}
              </h2>
            </div>
            {children}
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
