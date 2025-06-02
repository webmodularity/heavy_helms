"use client";

import type { Player } from "@/types/player.types";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { RetroCard, RetroCardContent } from "@/components/ui/retro-card";
import { RetroSectionHeader } from "@/components/ui/retro-section-header";
import { RetroBattleCard } from "./retro-battle-card";
import { RetroFormCard } from "./retro-form-card";
import { RetroActionButton } from "@/components/ui/retro-action-button";
import { RetroOverlay } from "@/components/ui/retro-overlay";
import { RetroCarousel } from "@/components/ui/retro-carousel";
import { useState, useEffect, useCallback } from "react";
import { CreateChallengeForm } from "@/components/duel/create-challenge-form";
import { GauntletRegistrationForm } from "@/components/gauntlet/gauntlet-registration-form";
import { Sword, Target, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface RetroBattleSectionProps {
  selectedCharacter: Player | null;
  hasBattleInView: boolean;
  battleSectionRef: React.RefObject<HTMLElement>;
}

interface BattleType {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  actionLabel: string;
  route: string;
  available: boolean;
  variant: "arcade" | "pixel" | "crt";
  glowColor: string;
  statusText: string;
}

interface BattleCardState {
  showChallengeForm: boolean;
  showGauntletRegister: boolean;
  isNavigating: boolean;
}

export function RetroBattleSection({
  selectedCharacter,
  hasBattleInView,
  battleSectionRef,
}: RetroBattleSectionProps) {
  const router = useRouter();
  
  // Battle card states
  const [cardStates, setCardStates] = useState<Record<string, BattleCardState>>({
    practice: { showChallengeForm: false, showGauntletRegister: false, isNavigating: false },
    duel: { showChallengeForm: false, showGauntletRegister: false, isNavigating: false },
    gauntlet: { showChallengeForm: false, showGauntletRegister: false, isNavigating: false },
  });

  const battleTypes: BattleType[] = [
    {
      id: "practice",
      icon: Target,
      title: "TRAINING PROTOCOL",
      description: "Risk-free combat simulation. Perfect your techniques without consequence.",
      actionLabel: "TRAIN",
      route: "/practice",
      available: true,
      variant: "pixel",
      glowColor: "var(--color-primary)",
      statusText: "SAFE MODE",
    },
    {
      id: "duel",
      icon: Sword,
      title: "COMBAT CHALLENGE",
      description: "Direct warrior-to-warrior combat. Challenge rivals across the realm.",
      actionLabel: "CHALLENGE",
      route: "/duel",
      available: true,
      variant: "arcade",
      glowColor: "var(--color-destructive)",
      statusText: "PVP ACTIVE",
    },
    {
      id: "gauntlet",
      icon: Crown,
      title: "TOURNAMENT MODE",
      description: "Enter the arena. On-demand tournaments with glory and rewards.",
      actionLabel: "REGISTER",
      route: "/gauntlet",
      available: true,
      variant: "crt",
      glowColor: "var(--color-primary)",
      statusText: "QUEUE SYSTEM",
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

  // Create carousel items
  const carouselItems = battleTypes.map((battleType, index) => (
    <BattleCarouselItem
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
  ));

  return (
    <section ref={battleSectionRef} className="mb-4 scroll-mt-4 mt-6">
      {/* Section Header */}
      <RetroSectionHeader
        variant="battle"
        title="BATTLE SELECTION MATRIX"
        subtitle="CHOOSE ENGAGEMENT TYPE • CONFIGURE PARAMETERS • INITIATE COMBAT"
        animationDelay={0.1}
      />

      {/* Battle Carousel */}
      <RetroCarousel
        variant="battle"
        itemWidth="wide"
        showNavigation={true}
        showDots={true}
        items={carouselItems}
        animationDelay={0.3}
      />

      {/* Combat Readiness Status */}
      {selectedCharacter && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <RetroCard variant="pixel" className="mt-4 border-success/30" size="sm">
            <RetroCardContent>
              <div className="flex items-center justify-between font-pixeloid text-pixel-xs">
                <span className="text-success">WARRIOR STATUS: COMBAT READY</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-success rounded-pixel animate-pulse retro-glow" />
                  <span className="text-success/80">SYSTEMS ONLINE</span>
                </div>
              </div>
            </RetroCardContent>
          </RetroCard>
        </motion.div>
      )}
    </section>
  );
}

// Battle Carousel Item Component
interface BattleCarouselItemProps {
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

function BattleCarouselItem({
  battleType,
  selectedCharacter,
  hasBattleInView,
  cardState,
  animationDelay,
  onAction,
  onFormSuccess,
  onFormCancel,
  onGauntletRegister,
}: BattleCarouselItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const IconComponent = battleType.icon;

  // Render form states using RetroFormCard
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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="p-1.5 rounded-pixel border border-primary bg-primary/10 transition-all duration-200">
          <IconComponent 
            className={cn(
              "h-4 w-4 text-primary",
              isHovered && "animate-pulse"
            )} 
          />
        </div>
        <div className="px-1.5 py-0.5 rounded-pixel text-pixel-xs font-pixeloid bg-primary/20 text-primary">
          {battleType.statusText}
        </div>
      </div>

      {/* Card Title */}
      <motion.h3
        className="text-pixel-sm font-bold text-primary mb-1.5 font-pixeloid"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: animationDelay + 0.25 }}
      >
        {battleType.title}
      </motion.h3>

      {/* Card Description */}
      <motion.p
        className="text-pixel-xs text-foreground/70 mb-3 flex-grow font-pixeloid"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: animationDelay + 0.3 }}
      >
        {battleType.description}
      </motion.p>

      {/* Action Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: animationDelay + 0.35 }}
      >
        {battleType.available ? (
          <RetroActionButton
            variant={
              battleType.id === "practice" ? "pixel" :
              battleType.id === "duel" ? "primary" :
              battleType.id === "gauntlet" ? "arcade" : "primary"
            }
            size="sm"
            withPulse={battleType.id === "duel" && selectedCharacter && !cardState.isNavigating}
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