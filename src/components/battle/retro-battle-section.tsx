"use client";

import type { Player } from "@/types/player.types";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { RetroButton } from "@/components/ui/retro-button";
import { RetroCard, RetroCardContent, RetroCardDescription, RetroCardHeader, RetroCardTitle } from "@/components/ui/retro-card";
import { useState, useEffect } from "react";
import { CreateChallengeForm } from "@/components/duel/create-challenge-form";
import { AnimatePresence } from "framer-motion";
import { GauntletRegistrationForm } from "@/components/gauntlet/gauntlet-registration-form";
import { Sword, Trophy, Target, Shield, Zap, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface RetroBattleSectionProps {
  selectedCharacter: Player | null;
  hasBattleInView: boolean;
  battleSectionRef: React.RefObject<HTMLElement>;
}

export function RetroBattleSection({
  selectedCharacter,
  hasBattleInView,
  battleSectionRef,
}: RetroBattleSectionProps) {
  const battleTypes = [
    {
      id: "practice",
      icon: Target,
      title: "TRAINING PROTOCOL",
      description: "Risk-free combat simulation. Perfect your techniques without consequence.",
      actionLabel: "TRAIN",
      route: "/practice",
      available: true,
      variant: "medieval" as const,
      glowColor: "var(--color-medieval-gold)",
      statusText: "SAFE MODE",
    },
    {
      id: "gauntlet",
      icon: Crown,
      title: "TOURNAMENT MODE",
      description: "Enter the arena. On-demand tournaments with glory and rewards.",
      actionLabel: "REGISTER",
      route: "/gauntlet",
      available: true,
      variant: "arcade" as const,
      glowColor: "var(--color-primary)",
      statusText: "QUEUE SYSTEM",
    },
    {
      id: "duel",
      icon: Sword,
      title: "COMBAT CHALLENGE",
      description: "Direct warrior-to-warrior combat. Challenge rivals across the realm.",
      actionLabel: "CHALLENGE",
      route: "/duel",
      available: true,
      variant: "arcade" as const,
      glowColor: "var(--color-destructive)",
      statusText: "PVP ACTIVE",
    },
  ];

  return (
    <section ref={battleSectionRef} className="mb-6 scroll-mt-4 mt-8">
      {/* Section Header */}
      <RetroCard variant="crt" className="mb-6" withScanlines>
        <RetroCardHeader variant="crt">
          <RetroCardTitle variant="crt" className="text-center flex items-center justify-center gap-3">
            <Shield className="h-6 w-6 text-primary animate-pulse" />
            BATTLE SELECTION MATRIX
            <Zap className="h-6 w-6 text-primary animate-pulse" />
          </RetroCardTitle>
        </RetroCardHeader>
        <RetroCardContent>
          <div className="text-center font-pixeloid text-sm text-primary/80">
            CHOOSE ENGAGEMENT TYPE • CONFIGURE PARAMETERS • INITIATE COMBAT
          </div>
        </RetroCardContent>
      </RetroCard>

      {/* Battle Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {battleTypes.map((battleType, index) => (
          <RetroBattleCard
            key={battleType.id}
            battleType={battleType}
            selectedCharacter={selectedCharacter}
            hasBattleInView={hasBattleInView}
            animationDelay={index * 0.1}
            contentDelay={index * 0.1 + 0.2}
          />
        ))}
      </div>

      {/* Combat Readiness Status */}
      {selectedCharacter && (
        <RetroCard variant="pixel" className="mt-6 border-success/30">
          <RetroCardContent>
            <div className="flex items-center justify-between font-pixeloid text-sm">
              <span className="text-success">WARRIOR STATUS: COMBAT READY</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                <span className="text-success/80">SYSTEMS ONLINE</span>
              </div>
            </div>
          </RetroCardContent>
        </RetroCard>
      )}
    </section>
  );
}

interface RetroBattleCardProps {
  battleType: {
    id: string;
    icon: React.ElementType;
    title: string;
    description: string;
    actionLabel: string;
    route: string;
    available: boolean;
    variant: "arcade" | "medieval";
    glowColor: string;
    statusText: string;
  };
  selectedCharacter: Player | null;
  hasBattleInView: boolean;
  animationDelay: number;
  contentDelay: number;
}

function RetroBattleCard({
  battleType,
  selectedCharacter,
  hasBattleInView,
  animationDelay,
  contentDelay,
}: RetroBattleCardProps) {
  const router = useRouter();
  const [showChallengeForm, setShowChallengeForm] = useState(false);
  const [showGauntletRegister, setShowGauntletRegister] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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

  const handleSuccess = () => {
    setShowChallengeForm(false);
    setShowGauntletRegister(false);
  };

  const handleCancel = () => {
    setShowChallengeForm(false);
    setShowGauntletRegister(false);
  };

  // Render forms if active
  if (showChallengeForm && selectedCharacter && battleType.id === "duel") {
    return (
      <motion.div
        className="h-full"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
      >
        <RetroCard variant="arcade" className="h-full">
          <CreateChallengeForm
            character={selectedCharacter}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </RetroCard>
      </motion.div>
    );
  }

  if (showGauntletRegister && selectedCharacter && battleType.id === "gauntlet") {
    return (
      <motion.div
        className="h-full"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
      >
        <RetroCard variant="arcade" className="h-full">
          <GauntletRegistrationForm
            character={selectedCharacter}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </RetroCard>
      </motion.div>
    );
  }

  const IconComponent = battleType.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: hasBattleInView ? 1 : 0.7,
        y: 0,
        transition: { duration: 0.5, delay: animationDelay },
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="h-full"
    >
      <RetroCard 
        variant={battleType.variant}
        className={cn(
          "h-full transition-all duration-300 hover:scale-105",
          isHovered && "shadow-retro",
          !selectedCharacter && "opacity-50",
        )}
        withScanlines={battleType.variant === "arcade"}
      >
        <RetroCardHeader variant={battleType.variant}>
          <div className="flex items-center justify-between mb-2">
            <div 
              className={cn(
                "p-2 rounded-pixel-lg border-2 transition-all duration-200",
                battleType.variant === "arcade" ? "border-primary bg-primary/10" : "border-medieval-gold bg-medieval-gold/10"
              )}
            >
              <IconComponent 
                className={cn(
                  "h-6 w-6",
                  battleType.variant === "arcade" ? "text-primary" : "text-medieval-gold",
                  isHovered && "animate-pulse"
                )} 
              />
            </div>
            <div className={cn(
              "px-2 py-1 rounded-pixel text-xs font-pixeloid",
              battleType.variant === "arcade" ? "bg-primary/20 text-primary" : "bg-medieval-gold/20 text-medieval-gold"
            )}>
              {battleType.statusText}
            </div>
          </div>
          <RetroCardTitle variant={battleType.variant}>
            {battleType.title}
          </RetroCardTitle>
        </RetroCardHeader>
        
        <RetroCardContent>
          <RetroCardDescription variant={battleType.variant} className="mb-4">
            {battleType.description}
          </RetroCardDescription>
          
          <RetroButton
            variant={battleType.variant === "arcade" ? "arcade" : "medieval"}
            size="lg"
            onClick={handleAction}
            disabled={!selectedCharacter || !battleType.available || isNavigating}
            glow={isHovered ? "medium" : "subtle"}
            className="w-full"
          >
            {isNavigating ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>LOADING...</span>
              </div>
            ) : (
              battleType.actionLabel
            )}
          </RetroButton>
        </RetroCardContent>
      </RetroCard>
    </motion.div>
  );
} 