"use client";

import { usePlayerById } from "@/hooks/use-player-by-id";
import { useRetirePlayer } from "@/hooks/use-retire-player";
import { Button } from "@/components/ui/button";
import { ChevronDown, Dumbbell, Shield, Swords, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RetirementConfirmationDialog } from "../dialogs/retirement-confirmation-dialog";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useCharacterSubtitle } from "@/hooks/use-character-subtitle";

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
  const { subtitle } = useCharacterSubtitle(
    character?.owner?.address,
    character?.id,
  );

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
    <div className="max-w-full overflow-hidden">
      {/* Top Compact Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Key Info - stacked in compact format */}
        <div className="col-span-1 md:col-span-3 space-y-3">
          {/* Character Name - more compact */}
          <div className="p-2 bg-gradient-to-b from-amber-900/10 to-stone-900/40 rounded-lg  border-yellow-600/20 relative overflow-hidden">
            <div className="flex flex-col items-center">
              <h2 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600 uppercase tracking-wider">
                {character.name.fullName || "Warrior Details"}
              </h2>
              <div className="text-yellow-400/90 text-xs md:text-sm font-medium">
                {subtitle}
              </div>
            </div>
          </div>

          {/* Character Image - preserve aspect ratio */}
          <div className="col-span-1 md:col-span-1 aspect-square max-h-[200px] md:max-h-[250px] justify-self-center">
            <div className="h-full rounded-lg overflow-hidden border border-yellow-600/40 bg-gradient-to-b from-amber-900/20 to-stone-900/40 relative">
              <img
                src={character.currentSkin.imageURL}
                alt={character.name.fullName || "Character"}
                className="object-contain w-full h-full"
              />
              <div className="absolute inset-0 border-4 border-transparent border-b-yellow-600/20 border-r-yellow-600/20 z-20" />
            </div>
          </div>

          {/* Identity & Legacy in the same row on larger screens */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Warrior Identity - more compact */}
            <div className="p-2 bg-gradient-to-b from-amber-900/10 to-stone-900/40 rounded-lg border border-yellow-600/20 relative overflow-hidden">
              <WarriorIdentity character={character as Player} />
            </div>

            {/* Battle Legacy - more compact */}
            <div className="p-2 bg-gradient-to-b from-amber-900/10 to-stone-900/40 rounded-lg border border-yellow-600/20 relative overflow-hidden">
              <BattleLegacy character={character as Player} />
            </div>
          </div>
        </div>
      </div>

      {/* Details Sections - Use Accordion for more compact display */}
      <Accordion type="single" collapsible className="w-full space-y-3">
        {/* Attributes Section */}
        <AccordionItem
          value="attributes"
          className="rounded-lg overflow-hidden bg-gradient-to-b from-amber-900/10 to-stone-900/40 border border-yellow-600/20"
        >
          <AccordionTrigger className="px-3 py-2 hover:no-underline text-yellow-500 font-semibold">
            <span className="flex items-center">
              <Dumbbell className="mr-2 h-3 w-3" />
              Attributes
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-3">
            <AttributesSection character={character as Player} />
          </AccordionContent>
        </AccordionItem>

        {/* Equipment Section */}
        <AccordionItem
          value="equipment"
          className="rounded-lg overflow-hidden bg-gradient-to-b from-amber-900/10 to-stone-900/40 border border-yellow-600/20"
        >
          <AccordionTrigger className="px-3 py-2 hover:no-underline text-yellow-500 font-semibold">
            <span className="flex items-center">
              <Shield className="mr-1 h-3 w-3" /> Equipment
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-3">
            <EquipmentSection character={character as Player} />
          </AccordionContent>
        </AccordionItem>

        {/* Skins Browser Section - only shown for non-retired characters that the user owns */}
        {isOwner && !character.isRetired && (
          <AccordionItem
            value="skins"
            className="rounded-lg overflow-hidden bg-gradient-to-b from-amber-900/10 to-stone-900/40 border border-yellow-600/20"
          >
            <AccordionTrigger className="px-3 py-2 hover:no-underline text-yellow-500 font-semibold">
              <div className="flex items-center">
                <Swords className="h-4 w-4 mr-2" />
                Character Skins
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3">
              <SkinsBrowser character={character as Player} />
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>

      {/* Action Buttons - only shown for non-retired characters that the user owns */}
      {isOwner && !character.isRetired && (
        <>
          <motion.div
            className="flex flex-wrap gap-3 justify-center md:justify-start mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Button
              variant="destructive"
              onClick={() => setShowConfirm(true)}
              disabled={isRetiring}
              className="font-bokor text-base"
              size="sm"
            >
              <Trash2 className="mr-1 h-3 w-3" />
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
    </div>
  );
}
