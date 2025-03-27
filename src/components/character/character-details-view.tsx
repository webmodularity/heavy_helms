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
import { ProfileSection } from "./profile-section";
import { AttributesSection } from "./attributes-section";
import { EquipmentSection } from "./equipment-section";
import {
  CharacterDetailsSkeleton,
  CharacterError,
  CharacterNotFound,
} from "./loading-states";
import { SkinsBrowser } from "./skins-browser";
import type { Player } from "@/types/player.types";

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

  return (
    <>
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        className="mb-6 text-yellow-500 hover:text-yellow-400 hover:bg-yellow-900/20 relative z-10"
        onClick={() => router.back()}
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to Warriors
      </Button>

      {/* Hero Section */}
      <HeroSection character={character as Player} />

      {/* Profile Section (Character Image + Info) */}
      <ProfileSection character={character as Player} />

      {/* Attributes Section */}
      <AttributesSection character={character as Player} />

      {/* Equipment Section */}
      <EquipmentSection character={character as Player} />

      {/* Skins Browser Section */}
      {!character.isRetired && <SkinsBrowser character={character as Player} />}

      {/* Action Buttons */}
      <motion.div
        className="flex flex-wrap gap-4 justify-center md:justify-start"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Button variant="destructive" onClick={() => setShowConfirm(true)}>
          <Trash2 className="mr-1 h-4 w-4" />
          Retire Warrior
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
  );
}
