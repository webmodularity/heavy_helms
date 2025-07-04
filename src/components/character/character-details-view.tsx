"use client";

import { usePlayerById } from "@/hooks/use-player-by-id";
import { useRetirePlayer } from "@/hooks/use-retire-player";
import { Button } from "@/components/ui/button";
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
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { RetirementConfirmationDialog } from "../dialogs/retirement-confirmation-dialog";
import { HeroSection } from "./hero-section";
import { AttributesSection } from "./attributes-section";
import {
  CharacterDetailsSkeleton,
  CharacterError,
  CharacterNotFound,
} from "./loading-states";
import { SkinsBrowser } from "./skins-browser";
import type { Player } from "@/types/player.types";
import { useAccount, useConfig } from "wagmi";
import { CharacterImage } from "./character-image";
import { BattleLegacy } from "./battle-legacy";
import { SkinPerformance } from "./skin-performance";
import { ActivitySection } from "@/components/home/activity-section";
import {
  getWeaponDisplayName,
  getArmorDisplayName,
  getStanceDisplayName,
} from "@/lib/equipment-utils";
import { useFightModal } from "@/hooks/use-fight-modal";
import { FightModal } from "@/components/modals/fight-modal";

interface CharacterDetailsViewProps {
  characterId: string;
}

// Basic Modal Component (can be moved to a separate file later)
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-stone-800 p-6 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-yellow-400">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6 text-stone-400" />
          </Button>
        </div>
        <div className="overflow-y-auto flex-grow">{children}</div>
      </div>
    </div>
  );
};

export function CharacterDetailsView({
  characterId,
}: CharacterDetailsViewProps) {
  const { address, status } = useAccount();

  const { data: character, isLoading, error } = usePlayerById(characterId);
  const router = useRouter();
  const { retirePlayer, isRetiring, txHash } = useRetirePlayer(characterId);
  const [showConfirmRetirement, setShowConfirmRetirement] = useState(false);
  const wagmiConfig = useConfig();
  const [isSkinsModalOpen, setIsSkinsModalOpen] = useState(false);

  // Fight modal hook
  const {
    isOpen: isFightModalOpen,
    fightData,
    openFightModal,
    closeFightModal,
  } = useFightModal();

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
    <>
      {/* Hero Section for Mobile - visible only on small screens */}
      <div className="mb-6 md:hidden">
        <HeroSection character={character as Player} />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 md:items-start">
        {/* Left Column: Image, Loadout Display Button, Retire Button */}
        <div className="col-span-1 flex flex-col space-y-6">
          <CharacterImage
            character={character as Player}
            isOwner={isOwner}
            isRetiring={isRetiring}
            onRetireClick={() => setShowConfirmRetirement(true)}
            showRetireButton={isOwner && !character.isRetired}
          />

          {/* Current Loadout Button - Always visible, disabled if not owner or retired */}
          <Button
            onClick={() =>
              isOwner && !character.isRetired && setIsSkinsModalOpen(true)
            }
            variant="outline"
            className="w-full text-left p-3 border border-yellow-600/20 rounded-lg bg-stone-900/40 hover:bg-stone-800/60 transition-all duration-200 shadow-md flex flex-col items-start h-auto disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={!isOwner || character.isRetired}
          >
            <div className="flex items-center mb-2 w-full">
              <Shirt className="h-5 w-5 text-yellow-400 flex-shrink-0 mr-2" />
              <div className="flex-grow">
                <span className="block font-semibold text-md text-yellow-300">
                  Current Loadout
                </span>
                <span className="block text-xs text-stone-400">
                  {isOwner && !character.isRetired
                    ? "Click to change skin & gear"
                    : "Skin & gear information"}
                </span>
              </div>
              {isOwner && !character.isRetired && (
                <ChevronRight className="h-5 w-5 text-stone-400 flex-shrink-0 ml-auto" />
              )}
            </div>
            <div className="space-y-1 pt-2 border-t border-yellow-600/10 w-full">
              <div className="flex items-center text-xs">
                <Swords className="h-3 w-3 text-yellow-500 mr-2 flex-shrink-0" />
                <span className="text-stone-300 mr-1">Weapon:</span>
                <span className="text-stone-100 font-medium truncate">
                  {getWeaponDisplayName(character.currentSkin.weapon)}
                </span>
              </div>
              <div className="flex items-center text-xs">
                <Shield className="h-3 w-3 text-yellow-500 mr-2 flex-shrink-0" />
                <span className="text-stone-300 mr-1">Armor:</span>
                <span className="text-stone-100 font-medium truncate">
                  {getArmorDisplayName(character.currentSkin.armor)}
                </span>
              </div>
              <div className="flex items-center text-xs">
                <Flame className="h-3 w-3 text-yellow-500 mr-2 flex-shrink-0" />
                <span className="text-stone-300 mr-1">Style:</span>
                <span className="text-stone-100 font-medium truncate">
                  {getStanceDisplayName(character.stance)}
                </span>
              </div>
            </div>
          </Button>
        </div>

        {/* Right Column: Hero Info (desktop), Attributes, Battle Legacy */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="hidden md:block">
            <HeroSection character={character as Player} />
          </div>
          <AttributesSection character={character as Player} />
          <BattleLegacy character={character as Player} />
          <SkinPerformance playerId={character.id} />
        </div>
      </div>

      {/* Battle Chronicles Section */}
      {character && (
        <div className="mt-8">
          <ActivitySection
            selectedCharacter={character as Player}
            isOwner={isOwner}
          />
        </div>
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
          <Modal
            isOpen={isSkinsModalOpen}
            onClose={() => setIsSkinsModalOpen(false)}
            title="Select Character Skin"
          >
            <SkinsBrowser character={character as Player} />
          </Modal>
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

      {/* Fight Modal */}
      <FightModal
        isOpen={isFightModalOpen}
        onClose={closeFightModal}
        player1={fightData?.player1}
        txId={fightData?.txId}
        logIndex={fightData?.logIndex}
        title={fightData?.title}
      />
    </>
  );
}
