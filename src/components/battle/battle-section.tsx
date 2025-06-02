"use client";

import type { Player } from "@/types/player.types";
import type { BattleType, BattleCardState } from "@/types/battle.types";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { CreateChallengeForm } from "@/components/duel/create-challenge-form";
import { GauntletRegistrationForm } from "@/components/gauntlet/gauntlet-registration-form";
import { RetroSectionHeader } from "@/components/ui/retro-section-header";
import { RetroBattleCard } from "./retro-battle-card";
import { RetroFormCard } from "./retro-form-card";
import { RetroActionButton } from "@/components/ui/retro-action-button";
import { RetroOverlay } from "@/components/ui/retro-overlay";

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
  const router = useRouter();
  
  // Battle card states
  const [cardStates, setCardStates] = useState<Record<string, BattleCardState>>({
    practice: { showChallengeForm: false, showGauntletRegister: false, isNavigating: false },
    gauntlet: { showChallengeForm: false, showGauntletRegister: false, isNavigating: false },
    duel: { showChallengeForm: false, showGauntletRegister: false, isNavigating: false },
  });

  // Battle types configuration
  const battleTypes: BattleType[] = [
    {
      id: "practice",
      icon: "🏹",
      title: "Practice Mode",
      description: "Hone your skills in risk-free battles. Test strategies without consequence.",
      actionLabel: "Train",
      route: "/practice",
      available: true,
      variant: "pixel",
    },
    {
      id: "duel",
      icon: "⚔️", 
      title: "Duel Mode",
      description: "Challenge warriors across the realm. Victory brings glory and rewards.",
      actionLabel: "Challenge",
      route: "/duel",
      available: true,
      variant: "arcade",
    },
    {
      id: "gauntlet",
      icon: "🏆",
      title: "Gauntlet Mode", 
      description: "On-demand tournaments await. Queue up and prove your might.",
      actionLabel: "Register",
      route: "/duel",
      available: true,
      variant: "crt",
    },
  ];

  // Prefetch practice route
  useEffect(() => {
    router.prefetch("/practice");
  }, [router]);

  // Update card state helper
  const updateCardState = useCallback((battleId: string, updates: Partial<BattleCardState>) => {
    setCardStates(prev => ({
      ...prev,
      [battleId]: { ...prev[battleId], ...updates }
    }));
  }, []);

  // Handle battle action
  const handleBattleAction = useCallback(async (battleType: BattleType) => {
    if (!selectedCharacter || !battleType.available) return;

    const currentState = cardStates[battleType.id];
    if (currentState.isNavigating) return;

    if (battleType.id === "duel") {
      updateCardState(battleType.id, { showChallengeForm: true, showGauntletRegister: false });
    } else if (battleType.id === "gauntlet") {
      updateCardState(battleType.id, { showGauntletRegister: true, showChallengeForm: false });
    } else {
      updateCardState(battleType.id, { isNavigating: true });
      router.push(`${battleType.route}?player1Id=${selectedCharacter.id}`);
    }
  }, [selectedCharacter, cardStates, updateCardState, router]);

  // Handle form success
  const handleFormSuccess = useCallback((battleId: string) => {
    updateCardState(battleId, { 
      showChallengeForm: false, 
      showGauntletRegister: false 
    });

    // Scroll to the challenges tab in the Activity Section
    const activitySection = document.getElementById("activity-section");
    if (activitySection) {
      activitySection.scrollIntoView({ behavior: "smooth" });
      const event = new CustomEvent("activateChallengesTab");
      document.dispatchEvent(event);
    }
  }, [updateCardState]);

  // Handle form cancel
  const handleFormCancel = useCallback((battleId: string) => {
    updateCardState(battleId, { 
      showChallengeForm: false, 
      showGauntletRegister: false 
    });
  }, [updateCardState]);

  // Handle gauntlet registration
  const handleGauntletRegister = useCallback(() => {
    console.log("Registering for Gauntlet:", selectedCharacter?.id);
    handleFormSuccess("gauntlet");
  }, [selectedCharacter?.id, handleFormSuccess]);

  return (
    <section ref={battleSectionRef} className="mb-6 scroll-mt-4 mt-4">
      <RetroSectionHeader
        variant="battle"
        title="Choose Your Battle"
        subtitle="GLORY AWAITS"
        animationDelay={0.1}
      />

      {/* Mobile-first responsive grid */}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
        {battleTypes.map((battleType, index) => (
          <BattleCardRenderer
            key={battleType.id}
            battleType={battleType}
            selectedCharacter={selectedCharacter}
            hasBattleInView={hasBattleInView}
            cardState={cardStates[battleType.id]}
            animationDelay={index * 0.1}
            onAction={() => handleBattleAction(battleType)}
            onFormSuccess={() => handleFormSuccess(battleType.id)}
            onFormCancel={() => handleFormCancel(battleType.id)}
            onGauntletRegister={handleGauntletRegister}
          />
        ))}
      </div>
    </section>
  );
}

// Separate component for rendering individual battle cards
interface BattleCardRendererProps {
  battleType: BattleType;
  selectedCharacter: Player | null;
  hasBattleInView: boolean;
  cardState: BattleCardState;
  animationDelay: number;
  onAction: () => void;
  onFormSuccess: () => void;
  onFormCancel: () => void;
  onGauntletRegister: () => void;
}

function BattleCardRenderer({
  battleType,
  selectedCharacter,
  hasBattleInView,
  cardState,
  animationDelay,
  onAction,
  onFormSuccess,
  onFormCancel,
  onGauntletRegister,
}: BattleCardRendererProps) {
  // Render form states
  if (cardState.showChallengeForm && selectedCharacter && battleType.id === "duel") {
    return (
      <RetroFormCard
        formType="challenge"
        size="default"
        animationDelay={animationDelay}
      >
        <CreateChallengeForm
          character={selectedCharacter}
          onSuccess={onFormSuccess}
          onCancel={onFormCancel}
        />
      </RetroFormCard>
    );
  }

  if (cardState.showGauntletRegister && selectedCharacter && battleType.id === "gauntlet") {
    return (
      <RetroFormCard
        formType="gauntlet"
        size="default"
        animationDelay={animationDelay}
      >
        <GauntletRegistrationForm
          character={selectedCharacter}
          onRegister={onGauntletRegister}
          onCancel={onFormCancel}
          animationDelay={animationDelay}
        />
      </RetroFormCard>
    );
  }

  // Render default battle card
  return (
    <RetroBattleCard
      variant={battleType.variant}
      size="default"
      interactive={battleType.available && !!selectedCharacter}
      isHighlighted={hasBattleInView}
      animationDelay={animationDelay}
      glowDelay={animationDelay + 0.3}
      loading={cardState.isNavigating}
      onClick={battleType.available && selectedCharacter ? onAction : undefined}
    >
      {/* Battle card icon */}
      <motion.div
        className="mb-2 text-xl"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: animationDelay + 0.2 }}
      >
        {battleType.icon}
      </motion.div>

      {/* Battle card title */}
      <motion.h3
        className="text-pixel-sm font-bold text-primary mb-1 font-pixeloid"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: animationDelay + 0.25 }}
      >
        {battleType.title}
      </motion.h3>

      {/* Battle card description */}
      <motion.p
        className="text-pixel-xs text-foreground/70 mb-3 flex-grow font-pixeloid"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: animationDelay + 0.3 }}
      >
        {battleType.description}
      </motion.p>

      {/* Action button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: animationDelay + 0.35 }}
      >
        {battleType.available ? (
          <RetroActionButton
            variant="primary"
            size="sm"
            onClick={selectedCharacter && !cardState.isNavigating ? onAction : () => {}}
            loading={cardState.isNavigating && battleType.id === "practice"}
            disabled={cardState.isNavigating}
          >
            {cardState.isNavigating && battleType.id === "practice"
              ? "Loading..."
              : battleType.actionLabel
            }
          </RetroActionButton>
        ) : (
          <RetroActionButton variant="coming" size="sm">
            Coming Soon
          </RetroActionButton>
        )}
      </motion.div>

      {/* Overlays */}
      {!battleType.available && (
        <RetroOverlay
          type="coming-soon"
          title="COMING SOON"
          description="Our warriors are training for this challenge"
          showIcon={false}
          animationDelay={animationDelay + 0.4}
        />
      )}

      {!selectedCharacter && battleType.available && (
        <RetroOverlay
          type="select-character"
          title="SELECT WARRIOR"
          description="Choose your champion above"
          showIcon={true}
          animationDelay={animationDelay + 0.4}
        />
      )}
    </RetroBattleCard>
  );
}
