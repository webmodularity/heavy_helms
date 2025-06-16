"use client";

import type { Player } from "@/types/player.types";
import { motion } from "framer-motion";
import { ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { CTAButton } from "../ui/cta-button";
import { useState, useEffect } from "react";
import { CreateChallengeForm } from "@/components/duel/create-challenge-form";
import { AnimatePresence } from "framer-motion";
import { GauntletRegistrationForm } from "@/components/gauntlet/gauntlet-registration-form";

interface BattleSectionProps {
  selectedCharacter: Player | null;
  hasBattleInView: boolean;
  battleSectionRef: React.RefObject<HTMLElement>;
}

export function BattleSection({
  selectedCharacter,
  hasBattleInView,
  battleSectionRef,
}: BattleSectionProps) {
  // Battle types with their properties
  const battleTypes = [
    {
      id: "practice",
      icon: "🏹",
      title: "Practice Mode",
      description:
        "Hone your skills in risk-free battles. Test strategies without consequence.",
      actionLabel: "Train",
      route: "/practice",
      available: true,
    },
    {
      id: "gauntlet",
      icon: "🏆",
      title: "Gauntlet Mode",
      description:
        "On-demand tournaments await. Queue up and prove your might.",
      actionLabel: "Register",
      route: "/duel",
      available: true,
    },
    {
      id: "duel",
      icon: "⚔️",
      title: "Duel Mode",
      description:
        "Challenge warriors across the realm. Victory brings glory and rewards.",
      actionLabel: "Challenge",
      route: "/duel",
      available: true,
    },
  ];

  return (
    <section ref={battleSectionRef} className="mb-6 scroll-mt-4 mt-4">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600 uppercase tracking-wider">
          Choose Your Battle
        </h2>
        <div className="text-yellow-400/90 text-xs font-medium">
          GLORY AWAITS
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 md:grid-cols-3 gap-3">
        {battleTypes.map((battleType, index) => (
          <BattleCard
            key={battleType.id}
            battleType={battleType}
            selectedCharacter={selectedCharacter}
            hasBattleInView={hasBattleInView}
            animationDelay={index * 0.1}
            contentDelay={index * 0.1 + 0.2}
            glowDelay={index * 0.1 + 0.3}
          />
        ))}
      </div>
    </section>
  );
}

interface BattleCardProps {
  battleType: {
    id: string;
    icon: string;
    title: string;
    description: string;
    actionLabel: string;
    route: string;
    available: boolean;
  };
  selectedCharacter: Player | null;
  hasBattleInView: boolean;
  animationDelay: number;
  contentDelay: number;
  glowDelay: number;
}

function BattleCard({
  battleType,
  selectedCharacter,
  hasBattleInView,
  animationDelay,
  contentDelay,
  glowDelay,
}: BattleCardProps) {
  const router = useRouter();
  const [showChallengeForm, setShowChallengeForm] = useState(false);
  const [showGauntletRegister, setShowGauntletRegister] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (battleType.id === "practice" && battleType.route) {
      router.prefetch(battleType.route);
    }
  }, [router, battleType.id, battleType.route]);

  const handleAction = async () => {
    if (!selectedCharacter || !battleType.available || isNavigating) return;

    if (battleType.id === "duel") {
      setShowChallengeForm(true);
      setShowGauntletRegister(false);
    } else if (battleType.id === "gauntlet") {
      setShowGauntletRegister(true);
      setShowChallengeForm(false);
    } else {
      setIsNavigating(true);
      router.push(`${battleType.route}?player1Id=${selectedCharacter.id}`);
    }
  };

  const handleChallengeSuccess = () => {
    setShowChallengeForm(false);
    setShowGauntletRegister(false);

    // Scroll to the challenges tab in the Activity Section
    const activitySection = document.getElementById("activity-section");
    if (activitySection) {
      activitySection.scrollIntoView({ behavior: "smooth" });

      // Set the active tab to "challenges"
      const event = new CustomEvent("activateChallengesTab");
      document.dispatchEvent(event);
    }
  };

  const handleCancel = () => {
    setShowChallengeForm(false);
    setShowGauntletRegister(false);
  };

  const handleGauntletRegister = () => {
    // Implementation would go here
    console.log("Registering for Gauntlet:", selectedCharacter?.id);
  };

  // Conditionally render the forms OR the default card view
  const renderContent = () => {
    // Render Duel Challenge Form
    if (showChallengeForm && selectedCharacter && battleType.id === "duel") {
      return (
        <motion.div
          key="duel-form"
          className="h-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, delay: animationDelay },
          }}
          exit={{ opacity: 0, y: 20, transition: { duration: 0.2 } }}
        >
          <CreateChallengeForm
            character={selectedCharacter}
            onSuccess={handleChallengeSuccess}
            onCancel={handleCancel}
          />
        </motion.div>
      );
    }

    // Render Gauntlet Registration Form
    if (
      showGauntletRegister &&
      selectedCharacter &&
      battleType.id === "gauntlet"
    ) {
      return (
        <motion.div
          key="gauntlet-form"
          className="h-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, delay: animationDelay },
          }}
          exit={{ opacity: 0, y: 20, transition: { duration: 0.2 } }}
        >
          <GauntletRegistrationForm
            character={selectedCharacter}
            onRegister={handleGauntletRegister}
            onCancel={handleCancel}
            animationDelay={animationDelay}
          />
        </motion.div>
      );
    }

    // Render Default Battle Card View
    return (
      <motion.div
        className={`relative bg-gradient-to-b from-amber-900/10 to-stone-900/40 rounded-lg border border-yellow-600/20 overflow-hidden ${
          !battleType.available
            ? "cursor-default"
            : selectedCharacter
              ? "cursor-pointer hover:border-yellow-600/50"
              : "cursor-default"
        } ${isNavigating ? "opacity-70 pointer-events-none" : ""}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, delay: animationDelay },
        }}
        whileHover={
          battleType.available && selectedCharacter && !isNavigating
            ? {
                scale: 1.01,
                borderColor: "rgba(202, 138, 4, 0.5)",
                transition: { duration: 0.2 },
              }
            : {}
        }
        onClick={
          battleType.available && !isNavigating ? handleAction : undefined
        }
      >
        {/* Battle card content - more compact */}
        <div className="p-3 h-full flex flex-col">
          <motion.div
            className="mb-2 text-xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: 1,
              transition: { duration: 0.4, delay: contentDelay },
            }}
          >
            {battleType.icon}
          </motion.div>

          <motion.h3
            className="text-sm font-bold text-yellow-400 mb-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: { duration: 0.4, delay: contentDelay + 0.1 },
            }}
          >
            {battleType.title}
          </motion.h3>

          <motion.p
            className="text-xs text-stone-300 mb-3 flex-grow"
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: { duration: 0.4, delay: contentDelay + 0.1 },
            }}
          >
            {battleType.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: { duration: 0.4, delay: contentDelay + 0.2 },
            }}
          >
            {battleType.available ? (
              <CompactCTAButton
                onClick={
                  selectedCharacter && !isNavigating ? handleAction : () => {}
                }
                title={
                  isNavigating && battleType.id === "practice"
                    ? "Loading..."
                    : battleType.actionLabel
                }
                disabled={isNavigating}
              />
            ) : (
              <span className="block text-center py-1 text-xs text-yellow-500/70 border border-yellow-600/20 rounded-md bg-yellow-900/10">
                Coming Soon
              </span>
            )}
          </motion.div>
        </div>

        {/* Background glow effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-amber-600/10 to-yellow-600/5"
          initial={{ opacity: 0 }}
          animate={{
            opacity: hasBattleInView ? 0.2 : 0,
            transition: { duration: 0.4, delay: glowDelay },
          }}
        />

        {/* Coming Soon Overlay - only shown for unavailable battle types */}
        {!battleType.available && (
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: contentDelay + 0.2 }}
          >
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 to-amber-500 rounded-md blur-sm opacity-50 animate-pulse" />
              <div className="relative px-3 py-1 bg-black rounded-md border border-yellow-500/30">
                <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">
                  COMING SOON
                </span>
              </div>
            </div>
            <p className="text-yellow-400/60 text-xs mt-2 max-w-[80%] text-center">
              Our warriors are training for this challenge
            </p>
          </motion.div>
        )}

        {/* Select Character Overlay - only shown when no character is selected */}
        {!selectedCharacter && battleType.available && (
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: contentDelay + 0.2 }}
          >
            <div className="relative mb-1">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-md blur opacity-50 animate-pulse" />
              <div className="relative px-3 py-1 bg-black rounded-md border border-blue-400/30">
                <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                  SELECT WARRIOR
                </span>
              </div>
            </div>
            <p className="text-blue-300/70 text-xs mt-1 max-w-[80%] text-center">
              Choose your champion above
            </p>
            <ChevronUp className="h-4 w-4 text-blue-400/60 mt-2 animate-bounce" />
          </motion.div>
        )}
      </motion.div>
    );
  };

  return <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>;
}

// Compact version of the CTA Button
function CompactCTAButton({
  onClick,
  title,
  disabled = false,
}: {
  onClick: () => void;
  title: string;
  disabled?: boolean;
}) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <button
        type="button"
        onClick={onClick}
        className={`w-full py-1 px-2 bg-gradient-to-b from-amber-700/40 to-stone-900/80 rounded border border-yellow-600/30 ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={disabled}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/0 via-yellow-400/20 to-yellow-600/0 transform translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-1000" />
        <span className="text-yellow-400/90 text-xs font-medium uppercase tracking-wider relative z-10">
          {title}
        </span>
      </button>
    </motion.div>
  );
}
