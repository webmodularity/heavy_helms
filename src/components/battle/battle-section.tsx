"use client";

import type { Player } from "@/types/player.types";
import { motion } from "framer-motion";
import { ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { CTAButton } from "../ui/cta-button";
import { SectionHeader } from "../ui/section-header";
import { useState } from "react";
import { CreateChallengeForm } from "@/components/duel/create-challenge-form";
import { formatEther } from "viem";
import { AnimatePresence } from "framer-motion";
import { Label } from "@/components/ui/label";
import { YellowButton } from "@/components/ui/yellow-button";
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
        "Hone your skills in risk-free battles. Test strategies and fighting styles without consequence.",
      actionLabel: "Train",
      route: "/practice",
      available: true,
    },
    {
      id: "gauntlet",
      icon: "🏆",
      title: "Gauntlet Mode",
      description:
        "On-demand elimination tournaments await. Queue up, defeat all challengers, and prove your might.",
      actionLabel: "Register",
      route: "/duel",
      available: true,
    },
    {
      id: "duel",
      icon: "⚔️",
      title: "Duel Mode",
      description:
        "Challenge warriors across the realm. Victory brings glory and rewards - defeat leaves scars.",
      actionLabel: "Challenge",
      route: "/duel",
      available: true,
    },
  ];

  return (
    <section ref={battleSectionRef} className="mb-12 scroll-mt-4 mt-8">
      <SectionHeader title="Choose Your Battle" subtitle="GLORY AWAITS" />
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {battleTypes.map((battleType, index) => (
          <BattleCard
            key={battleType.id}
            battleType={battleType}
            selectedCharacter={selectedCharacter}
            hasBattleInView={hasBattleInView}
            animationDelay={index * 0.1}
            contentDelay={index * 0.1 + 0.3}
            glowDelay={index * 0.1 + 0.6}
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

  const handleAction = () => {
    if (!selectedCharacter || !battleType.available) return;

    if (battleType.id === "duel") {
      setShowChallengeForm(true);
      setShowGauntletRegister(false);
    } else if (battleType.id === "gauntlet") {
      setShowGauntletRegister(true);
      setShowChallengeForm(false);
    } else {
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
    // TODO: Implement gauntlet registration logic
    console.log("Registering for Gauntlet:", selectedCharacter?.id);
    // handleCancel(); // Close on success?
  };

  // Conditionally render the forms OR the default card view
  const renderContent = () => {
    // Render Duel Challenge Form
    if (showChallengeForm && selectedCharacter && battleType.id === "duel") {
      return (
        <motion.div
          key="duel-form"
          className="h-full" // Let inner form control padding/style
          initial={{ opacity: 0, y: 40 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: { duration: 0.7, delay: animationDelay },
          }}
          exit={{ opacity: 0, y: 40, transition: { duration: 0.3 } }}
        >
          {/* Form now applies the border/bg/padding */}
          <CreateChallengeForm
            character={selectedCharacter}
            onSuccess={handleChallengeSuccess}
            onCancel={handleCancel}
          />
        </motion.div>
      );
    }

    // Render Gauntlet Registration Form (New Component)
    if (
      showGauntletRegister &&
      selectedCharacter &&
      battleType.id === "gauntlet"
    ) {
      return (
        <motion.div // Keep a motion div wrapper for consistent key/animation handling if needed, or potentially integrate animation into GauntletRegistrationForm itself
          key="gauntlet-form"
          className="h-full" // Ensure wrapper takes full height
          // Animations might be better handled *inside* GauntletRegistrationForm now
          // initial={{ opacity: 0, y: 40 }}
          // animate={{ opacity: 1, y: 0, transition: { duration: 0.7, delay: animationDelay } }}
          // exit={{ opacity: 0, y: 40, transition: { duration: 0.3 } }}
        >
          <GauntletRegistrationForm
            character={selectedCharacter}
            onRegister={handleGauntletRegister} // Pass register handler
            onCancel={handleCancel} // Pass cancel handler
            animationDelay={animationDelay} // Pass delay for internal animation
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
        }`}
        initial={{ opacity: 0, y: 40 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: { duration: 0.7, delay: animationDelay },
        }}
        whileHover={
          battleType.available && selectedCharacter
            ? {
                scale: 1.02,
                borderColor: "rgba(202, 138, 4, 0.5)",
                transition: { duration: 0.2 },
              }
            : {}
        }
        onClick={battleType.available ? handleAction : undefined}
      >
        {/* Battle card content */}
        <div className="p-6 h-full flex flex-col">
          <motion.div
            className="mb-4 text-3xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: 1,
              transition: { duration: 0.5, delay: contentDelay },
            }}
          >
            {battleType.icon}
          </motion.div>

          <motion.h3
            className="text-xl font-bold text-yellow-400 mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: { duration: 0.5, delay: contentDelay + 0.1 },
            }}
          >
            {battleType.title}
          </motion.h3>

          <motion.p
            className="text-sm text-stone-300 mb-6 flex-grow"
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: { duration: 0.5, delay: contentDelay + 0.2 },
            }}
          >
            {battleType.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: { duration: 0.5, delay: contentDelay + 0.3 },
            }}
          >
            {battleType.available ? (
              <CTAButton
                onClick={selectedCharacter ? handleAction : () => {}}
                title={battleType.actionLabel}
                size="default"
              />
            ) : (
              <span className="block text-center py-2 text-sm text-yellow-500/70 border border-yellow-600/20 rounded-md bg-yellow-900/10">
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
            opacity: hasBattleInView ? 0.3 : 0,
            transition: { duration: 0.5, delay: glowDelay },
          }}
        />

        {/* Coming Soon Overlay - only shown for unavailable battle types */}
        {!battleType.available && (
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: contentDelay + 0.4 }}
          >
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 to-amber-500 rounded-md blur-sm opacity-70 animate-pulse" />
              <div className="relative px-6 py-3 bg-black rounded-md border border-yellow-500/30">
                <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">
                  COMING SOON
                </span>
              </div>
            </div>
            <p className="text-yellow-400/60 text-sm mt-4 max-w-[80%] text-center">
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
            transition={{ duration: 0.5, delay: contentDelay + 0.4 }}
          >
            <div className="relative mb-2">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-md blur opacity-70 animate-pulse" />
              <div className="relative px-5 py-2 bg-black rounded-md border border-blue-400/30">
                <span className="text-md font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                  SELECT WARRIOR
                </span>
              </div>
            </div>
            <p className="text-blue-300/70 text-sm mt-2 max-w-[80%] text-center">
              Choose your champion above to enter this battle
            </p>
            <ChevronUp className="h-6 w-6 text-blue-400/60 mt-4 animate-bounce" />
          </motion.div>
        )}
      </motion.div>
    );
  };

  // Use AnimatePresence
  return <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>;
}
