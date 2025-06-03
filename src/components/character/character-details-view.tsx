"use client";

import { usePlayerById } from "@/hooks/use-player-by-id";
import { useRetirePlayer } from "@/hooks/use-retire-player";
import { RetroButton } from "@/components/ui/retro-button";
import {
  RetroCard,
  RetroCardContent,
  RetroCardHeader,
  RetroCardTitle,
} from "@/components/ui/retro-card";
import {
  Trash2,
  X,
  Shirt,
  ChevronRight,
  Swords,
  Shield,
  Flame,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { RetirementConfirmationDialog } from "../dialogs/retirement-confirmation-dialog";
import { AttributesSection } from "./attributes-section";
import {
  CharacterDetailsSkeleton,
  CharacterError,
  CharacterNotFound,
} from "./loading-states";
import { SkinsBrowser } from "./skins-browser";
import type { Player } from "@/types/player.types";
import { useAccount, useConfig } from "wagmi";
import { watchAccount } from "@wagmi/core";
import { CharacterImage } from "./character-image";
import { BattleLegacy } from "./battle-legacy";
import { ActivitySection } from "@/components/home/activity-section";
import {
  getWeaponDisplayName,
  getArmorDisplayName,
  getStanceDisplayName,
} from "@/lib/equipment-utils";
import { HeroSection } from "./hero-section";
import { cn } from "@/lib/utils";

interface CharacterDetailsViewProps {
  characterId: string;
}

// Retro Modal Component
interface RetroModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const RetroModal: React.FC<RetroModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, type: "spring" }}
          className="w-full max-w-4xl max-h-[90vh] flex flex-col"
        >
          <RetroCard
            variant="arcade"
            className="flex flex-col h-full retro-glow"
            withScanlines
          >
            <RetroCardHeader variant="arcade" className="flex-shrink-0">
              <div className="flex justify-between items-center">
                <RetroCardTitle
                  variant="arcade"
                  className="font-pixel text-pixel-lg"
                >
                  {title}
                </RetroCardTitle>
                <RetroButton
                  variant="pixel"
                  size="sm"
                  onClick={onClose}
                  className="retro-glow"
                  glow="subtle"
                >
                  <X className="h-3 w-3" />
                </RetroButton>
              </div>
            </RetroCardHeader>
            <RetroCardContent className="overflow-y-auto flex-grow p-4">
              {children}
            </RetroCardContent>
          </RetroCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export function CharacterDetailsView({
  characterId,
}: CharacterDetailsViewProps) {
  const initialAccountState = useAccount();
  // Force initial status to 'disconnected', let watchAccount provide the true status
  const [internalStatus, setInternalStatus] =
    useState<typeof initialAccountState.status>("disconnected");
  const [internalAddress, setInternalAddress] = useState(
    initialAccountState.address,
  );

  const { data: character, isLoading, error } = usePlayerById(characterId);
  const router = useRouter();
  const { retirePlayer, isRetiring, txHash } = useRetirePlayer(characterId);

  const [showConfirmRetirement, setShowConfirmRetirement] = useState(false);
  const wagmiConfig = useConfig();
  const [isSkinsModalOpen, setIsSkinsModalOpen] = useState(false);

  useEffect(() => {
    const unwatch = watchAccount(wagmiConfig, {
      onChange: (account) => {
        setInternalStatus(account.status);
        setInternalAddress(account.address);
      },
    });
    // Update status on mount/hydration from useAccount() as a fallback/initial sync
    setInternalStatus(initialAccountState.status);
    setInternalAddress(initialAccountState.address);
    return () => unwatch();
  }, [initialAccountState.status, initialAccountState.address, wagmiConfig]);

  const status = internalStatus;
  const address = internalAddress;

  const isOwner =
    status === "connected" &&
    !!address &&
    character?.owner?.address?.toLowerCase() === address.toLowerCase();

  const canShowOwnerModals =
    status === "connected" && isOwner && !character?.isRetired;

  useEffect(() => {
    if (!canShowOwnerModals) {
      setShowConfirmRetirement(false);
      setIsSkinsModalOpen(false);
    }
  }, [canShowOwnerModals]);

  const handleRetirement = async () => {
    const result = await retirePlayer();
    if (result.success) {
      setTimeout(() => {
        router.push("/");
      }, 2000);
    }
  };

  if (isLoading) {
    return <CharacterDetailsSkeleton />;
  }

  if (error) {
    return <CharacterError error={error} />;
  }

  if (!character) {
    return <CharacterNotFound />;
  }

  return (
    <div className="space-y-6">
      {/* Hero Section for Mobile - visible only on small screens */}
      <div className="md:hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <HeroSection character={character as Player} />
        </motion.div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:items-start">
        {/* Left Column: Image, Loadout Display Button, Retire Button */}
        <motion.div
          className="col-span-1 flex flex-col space-y-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <CharacterImage
            character={character as Player}
            isOwner={isOwner}
            isRetiring={isRetiring}
            onRetireClick={() => setShowConfirmRetirement(true)}
            showRetireButton={isOwner && !character.isRetired}
          />

          {/* Current Loadout Card - Retro Style */}
          <RetroCard
            variant={isOwner && !character.isRetired ? "arcade" : "pixel"}
            className={cn(
              "cursor-pointer transition-all duration-300",
              isOwner && !character.isRetired
                ? "hover:scale-[1.02] retro-glow"
                : "opacity-80",
            )}
            onClick={() =>
              isOwner && !character.isRetired && setIsSkinsModalOpen(true)
            }
            withScanlines={isOwner && !character.isRetired}
          >
            <RetroCardContent className="p-4">
              <div className="flex items-center mb-2 w-full">
                <Shirt className="h-4 w-4 text-primary flex-shrink-0 mr-2 retro-box-glow" />
                <div className="flex-grow">
                  <span className="block font-pixel text-pixel-sm text-primary font-bold">
                    CURRENT LOADOUT
                  </span>
                  <span className="block font-pixel text-pixel-xs text-primary/60">
                    {isOwner && !character.isRetired
                      ? "CLICK TO MODIFY EQUIPMENT"
                      : "EQUIPMENT CONFIGURATION"}
                  </span>
                </div>
                {isOwner && !character.isRetired && (
                  <ChevronRight className="h-4 w-4 text-primary/70 flex-shrink-0 ml-auto animate-pulse" />
                )}
              </div>

              <div className="space-y-1.5 pt-2 border-t border-primary/30 w-full">
                <div className="flex items-center font-pixel text-pixel-xs">
                  <Swords className="h-2.5 w-2.5 text-primary mr-2 flex-shrink-0" />
                  <span className="text-primary/70 mr-1">WEAPON:</span>
                  <span className="text-foreground font-bold truncate">
                    {getWeaponDisplayName(character.currentSkin.weapon)}
                  </span>
                </div>
                <div className="flex items-center font-pixel text-pixel-xs">
                  <Shield className="h-2.5 w-2.5 text-primary mr-2 flex-shrink-0" />
                  <span className="text-primary/70 mr-1">ARMOR:</span>
                  <span className="text-foreground font-bold truncate">
                    {getArmorDisplayName(character.currentSkin.armor)}
                  </span>
                </div>
                <div className="flex items-center font-pixel text-pixel-xs">
                  <Flame className="h-2.5 w-2.5 text-primary mr-2 flex-shrink-0" />
                  <span className="text-primary/70 mr-1">STANCE:</span>
                  <span className="text-foreground font-bold truncate">
                    {getStanceDisplayName(character.stance)}
                  </span>
                </div>
              </div>
            </RetroCardContent>
          </RetroCard>
        </motion.div>

        {/* Right Column: Hero Info (desktop), Attributes, Battle Legacy */}
        <motion.div
          className="col-span-1 md:col-span-2 space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="hidden md:block">
            <HeroSection character={character as Player} />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <AttributesSection character={character as Player} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <BattleLegacy character={character as Player} isOwner={isOwner} />
          </motion.div>
        </motion.div>
      </div>

      {/* Battle Chronicles Section */}
      {character && (
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          {/* <RetroCard variant="arcade" className="retro-glow" withScanlines>
            <RetroCardHeader variant="arcade">
              <RetroCardTitle
                variant="arcade"
                className="font-pixel text-pixel-lg"
              >
                BATTLE CHRONICLES
              </RetroCardTitle>
            </RetroCardHeader>
            <RetroCardContent> */}
          <ActivitySection selectedCharacter={character as Player} />
          {/* </RetroCardContent>
          </RetroCard> */}
        </motion.div>
      )}

      {/* Skins Browser Modal Wrapper - Keyed by connection status */}
      <div
        key={
          status === "connected"
            ? "skins-modal-connected"
            : "skins-modal-disconnected"
        }
      >
        {canShowOwnerModals && (
          <RetroModal
            isOpen={isSkinsModalOpen}
            onClose={() => setIsSkinsModalOpen(false)}
            title="CHARACTER CUSTOMIZATION"
          >
            <SkinsBrowser character={character as Player} />
          </RetroModal>
        )}
      </div>

      {/* Retirement Confirmation Dialog Wrapper - Keyed by connection status */}
      <div
        key={
          status === "connected"
            ? "retirement-dialog-connected"
            : "retirement-dialog-disconnected"
        }
      >
        {canShowOwnerModals && (
          <RetirementConfirmationDialog
            open={showConfirmRetirement}
            onOpenChange={setShowConfirmRetirement}
            characterName={character.name.fullName || ""}
            onConfirm={handleRetirement}
            isRetiring={isRetiring}
            txHash={txHash || null}
          />
        )}
      </div>
    </div>
  );
}
