"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SkinType } from "@/types/skin.types";
import type { Character, PlayerAttributes } from "@/types/player.types";
import { Check, Loader, Sparkles } from "lucide-react";
import Image from "next/image";
import {
  getArmorDisplayName,
  getStanceDisplayName,
  getWeaponDisplayName,
} from "@/lib/equipment-utils";
import { usePlayer } from "@/store/player-context";
import { useEffect, useState } from "react";
import { useValidateSkin } from "@/hooks/use-validate-skin";
import { usePlayerById } from "@/hooks/use-player-by-id";

// Define a more specific type for the skin from the GraphQL query
interface SkinWithMetadataURI {
  id: string;
  tokenId: number;
  metadataURI: string;
  weapon: number;
  armor: number;
  stance: number;
  skinIndex: number;
  collection: {
    id: string;
    registryId: string;
    contractAddress: string;
    skinType: SkinType;
    requiredNFTAddress?: string;
    isVerified: boolean;
  };
  imageURL?: string; // Optional property added by the component
}

interface SkinDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skin: SkinWithMetadataURI;
  character: Character;
  isCurrentSkin: boolean;
  onEquip: () => void;
  isEquipping: boolean;
}

export function SkinDetailsDialog({
  open,
  onOpenChange,
  skin,
  character,
  isCurrentSkin,
  onEquip,
  isEquipping,
}: SkinDetailsDialogProps) {
  // Determine if this is a default or verified skin
  const isDefaultSkin = skin.collection.skinType === SkinType.DefaultPlayer;
  const isVerifiedSkin = skin.collection.skinType === SkinType.Player;
  const { data: player } = usePlayerById(character.id);
  const { isValid, isValidating, error, refetch } = useValidateSkin(
    skin.skinIndex,
    skin.tokenId,
    skin.collection.skinType,
    player?.attributes as PlayerAttributes,
    skin.weapon,
    skin.armor,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-stone-900 border-yellow-600/30 text-stone-200">
        <DialogHeader>
          <DialogTitle className="text-yellow-500">Skin Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Skin Image */}
          <div className="relative aspect-square rounded-lg overflow-hidden border border-yellow-600/30">
            <div className="absolute inset-0 bg-gradient-to-b from-amber-900/10 to-stone-900/40 z-0" />
            <Image
              src={skin.imageURL || "/placeholder-skin.jpg"}
              alt={`Skin ${skin.tokenId}`}
              width={400}
              height={400}
              className="object-cover w-full h-full z-10"
            />

            {/* Skin Type Badge */}
            <div className="absolute top-2 right-2 z-20">
              {isDefaultSkin && (
                <span className="bg-blue-900/70 text-blue-300 text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                  Default
                </span>
              )}
              {isVerifiedSkin && (
                <span className="bg-yellow-900/70 text-yellow-300 text-xs px-2 py-1 rounded-full backdrop-blur-sm flex items-center">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Verified
                </span>
              )}
            </div>

            {/* Current Skin Badge */}
            {isCurrentSkin && (
              <div className="absolute top-2 left-2 z-20">
                <span className="bg-green-900/70 text-green-300 text-xs px-2 py-1 rounded-full backdrop-blur-sm flex items-center">
                  <Check className="h-3 w-3 mr-1" />
                  Equipped
                </span>
              </div>
            )}
          </div>

          {/* Skin Details */}
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-stone-800 p-3 rounded-lg">
                <p className="text-xs text-stone-400">Weapon</p>
                <p className="text-sm font-medium text-stone-200">
                  {getWeaponDisplayName(skin.weapon)}
                </p>
              </div>
              <div className="bg-stone-800 p-3 rounded-lg">
                <p className="text-xs text-stone-400">Armor</p>
                <p className="text-sm font-medium text-stone-200">
                  {getArmorDisplayName(skin.armor)}
                </p>
              </div>
              <div className="bg-stone-800 p-3 rounded-lg">
                <p className="text-xs text-stone-400">Stance</p>
                <p className="text-sm font-medium text-stone-200">
                  {getStanceDisplayName(skin.stance)}
                </p>
              </div>
            </div>

            <div className="bg-stone-800 p-3 rounded-lg">
              <p className="text-xs text-stone-400">Collection</p>
              <p className="text-sm font-medium text-stone-200 truncate">
                {skin.collection.contractAddress}
              </p>
            </div>

            <div className="bg-stone-800 p-3 rounded-lg">
              <p className="text-xs text-stone-400">Token ID</p>
              <p className="text-sm font-medium text-stone-200">
                {skin.tokenId}
              </p>
            </div>
          </div>

          {/* Action Button */}
          {!isCurrentSkin && (
            <Button
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-stone-100"
              onClick={onEquip}
              disabled={isEquipping || !isValid || isValidating}
            >
              {isEquipping ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Equipping...
                </>
              ) : (
                "Equip Skin"
              )}
            </Button>
          )}
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
