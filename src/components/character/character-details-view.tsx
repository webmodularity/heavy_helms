"use client";

import { usePlayerById } from "@/hooks/use-player-by-id";
import { useRetirePlayer } from "@/hooks/use-retire-player";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RetirementConfirmationDialog } from "../dialogs/retirement-confirmation-dialog";
import { HeroSection } from "./hero-section";
import { AttributesSection } from "./attributes-section";
import { EquipmentSection } from "./equipment-section";
import {
  CharacterDetailsSkeleton,
  CharacterError,
  CharacterNotFound,
} from "./loading-states";
import { SkinsBrowser } from "./skins-browser";
import type { Player } from "@/types/player.types";
import { useAccount } from "wagmi";
import { CharacterImage } from "./character-image";
import { WarriorIdentity } from "./warrior-identity";
import { BattleLegacy } from "./battle-legacy";

interface CharacterDetailsViewProps {
  characterId: string;
}

export function CharacterDetailsView({
  characterId,
}: CharacterDetailsViewProps) {
  const { data: character, isLoading, error } = usePlayerById(characterId);
  const router = useRouter();
  const { retirePlayer, isRetiring, txHash } = useRetirePlayer(characterId);
  const [showConfirm, setShowConfirm] = useState(false);
  const { address } = useAccount();

  // Handle the retirement process
  const handleRetirement = async () => {
    const result = await retirePlayer();

    if (result.success) {
      // Redirect to home after successful retirement
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

  // Check if the current user is the owner
  const isOwner =
    !!address &&
    !!character.owner &&
    address.toLowerCase() === character.owner.address.toLowerCase();

  return (
    <>
      {/* New Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {/* Left Column: Character Image */}
        {/* Use col-span-1 for consistency */}
        <div className="col-span-1">
          <CharacterImage character={character as Player} />
        </div>

        {/* Right Column: Stacked Info */}
        {/* Use col-span-1 md:col-span-2 for consistency */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          {/* Section 1: Name/Address (Modified HeroSection) */}
          {/* Removed margin-bottom from HeroSection internally, rely on space-y-6 */}
          <HeroSection character={character as Player} />
          {/* Section 2: Warrior Identity */}
          <WarriorIdentity character={character as Player} />
          {/* Section 3: Battle Legacy */}
          <BattleLegacy character={character as Player} />
        </div>
      </div>

      {/* Attributes Section remains below the new grid */}
      <AttributesSection character={character as Player} />

      {/* Equipment Section remains below the new grid */}
      <EquipmentSection character={character as Player} />

      {/* Skins Browser Section - only shown for non-retired characters that the user owns */}
      {isOwner && !character.isRetired && (
        <SkinsBrowser character={character as Player} />
      )}

      {/* Action Buttons - only shown for non-retired characters that the user owns */}
      {isOwner && !character.isRetired && (
        <>
          <motion.div
            className="flex flex-wrap gap-4 justify-center md:justify-start mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Button
              variant="destructive"
              onClick={() => setShowConfirm(true)}
              disabled={isRetiring}
              className="font-bokor text-lg"
            >
              <Trash2 className="mr-1 h-4 w-4" />
              {isRetiring ? "Retiring..." : "Retire Warrior"}
            </Button>
          </motion.div>

          {/* Retirement Confirmation Dialog */}
          <RetirementConfirmationDialog
            open={showConfirm}
            onOpenChange={setShowConfirm}
            characterName={character.name.fullName || ""}
            onConfirm={handleRetirement}
            isRetiring={isRetiring}
            txHash={txHash || null}
          />
        </>
      )}
    </>
  );
}
