"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SkinType } from "@/types/skin.types";
import type { Player, PlayerAttributes } from "@/types/player.types";
import { Check, Loader, Sparkles } from "lucide-react";
import Image from "next/image";
import {
  getArmorDisplayName,
  getStanceDisplayName,
  getWeaponDisplayName,
} from "@/lib/equipment-utils";
import { useValidateSkin } from "@/hooks/use-validate-skin";
import { usePlayerById } from "@/hooks/use-player-by-id";
import { StanceSelector } from "../character/stance-selector";
import type { StanceType } from "@/types/equipment.types";
import { useState } from "react";
import { CompactDialogHeader } from "../ui/compact/CompactDialogHeader";

// Define a more specific type for the skin from the GraphQL query
interface SkinWithMetadataURI {
  id: string;
  tokenId: number;
  metadataURI: string;
  weapon: number;
  armor: number;
  collection: {
    id: string;
    registryId: string;
    contractAddress: string;
    skinType: SkinType;
    requiredNFTAddress?: string | null;
    isVerified: boolean;
  };
  imageURL?: string; // Optional property added by the component
}

interface SkinDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skin: SkinWithMetadataURI;
  character: Player;
  isCurrentSkin: boolean;
  onEquip: (stance: StanceType) => void;
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
  const { isValid, isValidating, error } = useValidateSkin(
    Number(skin.collection.id),
    skin.tokenId,
    skin.collection.skinType,
    player?.attributes as PlayerAttributes,
    skin.weapon,
    skin.armor,
  );
  const [stance, setStance] = useState<StanceType>(character.stance);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm bg-stone-900 border-yellow-600/30 text-stone-200 p-3">
        <CompactDialogHeader title="Skin Details" className="pb-2" />

        <div className="space-y-2">
          {/* Skin Image - More compact */}
          <div className="relative aspect-square rounded-lg overflow-hidden border border-yellow-600/30 max-h-[200px]">
            <div className="absolute inset-0 bg-gradient-to-b from-amber-900/10 to-stone-900/40 z-0" />
            <Image
              src={skin.imageURL || "/placeholder-skin.jpg"}
              alt={`Skin ${skin.tokenId}`}
              width={200}
              height={200}
              className="object-cover w-full h-full z-10"
            />

            {/* Skin Type Badge - Smaller */}
            <div className="absolute top-1 right-1 z-20">
              {isDefaultSkin && (
                <span className="bg-blue-900/70 text-blue-300 text-[10px] px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                  Default
                </span>
              )}
              {isVerifiedSkin && (
                <span className="bg-yellow-900/70 text-yellow-300 text-[10px] px-1.5 py-0.5 rounded-full backdrop-blur-sm flex items-center">
                  <Sparkles className="h-2 w-2 mr-0.5" />
                  Verified
                </span>
              )}
            </div>

            {/* Current Skin Badge - Smaller */}
            {isCurrentSkin && (
              <div className="absolute top-1 left-1 z-20">
                <span className="bg-green-900/70 text-green-300 text-[10px] px-1.5 py-0.5 rounded-full backdrop-blur-sm flex items-center">
                  <Check className="h-2 w-2 mr-0.5" />
                  Equipped
                </span>
              </div>
            )}
          </div>

          {/* Skin Details - More compact grid */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-1">
              <div className="bg-stone-800 p-2 rounded-lg">
                <p className="text-[10px] text-stone-400">Weapon</p>
                <p
                  className="text-xs font-medium text-stone-200 truncate"
                  title={getWeaponDisplayName(skin.weapon)}
                >
                  {getWeaponDisplayName(skin.weapon)}
                </p>
              </div>
              <div className="bg-stone-800 p-2 rounded-lg">
                <p className="text-[10px] text-stone-400">Armor</p>
                <p
                  className="text-xs font-medium text-stone-200 truncate"
                  title={getArmorDisplayName(skin.armor)}
                >
                  {getArmorDisplayName(skin.armor)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1">
              <div className="bg-stone-800 p-2 rounded-lg">
                <p className="text-[10px] text-stone-400">Collection</p>
                <p
                  className="text-xs font-medium text-stone-200 truncate"
                  title={skin.collection.contractAddress}
                >
                  {skin.collection.contractAddress.substring(0, 8)}...
                </p>
              </div>
              <div className="bg-stone-800 p-2 rounded-lg">
                <p className="text-[10px] text-stone-400">Token ID</p>
                <p className="text-xs font-medium text-stone-200">
                  {skin.tokenId}
                </p>
              </div>
            </div>
          </div>

          {/* Compact Stance Selector */}
          <div className="py-1">
            <StanceSelector
              character={character}
              currentStance={character.stance}
              onStanceChange={(newStance) => setStance(newStance)}
            />
          </div>

          {/* Action Button - Smaller */}
          {!isCurrentSkin && (
            <Button
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-stone-100 text-sm h-8"
              onClick={() => onEquip(stance)}
              disabled={isEquipping || !isValid || isValidating}
            >
              {isEquipping ? (
                <>
                  <Loader className="mr-1 h-3 w-3 animate-spin" />
                  Equipping...
                </>
              ) : (
                "Equip Skin"
              )}
            </Button>
          )}
          {error && <p className="text-[10px] text-red-500">{error}</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
