"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { SkinType } from "@/types/skin.types";
import { Check, Loader, Sparkles, Info } from "lucide-react";
import {
  getArmorDisplayName,
  getWeaponDisplayName,
} from "@/lib/equipment-utils";
import { useSkinMetadata } from "@/hooks/use-skin-metadata";

// Define a more specific type for the skin from the GraphQL query
interface SkinWithMetadataURI {
  id: string;
  tokenId: number;
  metadataURI: string; // This is from the GraphQL query
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
}

interface SkinCardProps {
  skin: SkinWithMetadataURI;
  isCurrentSkin: boolean;
  onViewDetails: (skin: SkinWithMetadataURI & { imageURL?: string }) => void; // New prop for viewing details
  delay?: number;
}

export function SkinCard({
  skin,
  isCurrentSkin,
  onViewDetails,
  delay = 0,
}: SkinCardProps) {
  const [isInfoVisible, setIsInfoVisible] = useState(false);
  const { data, isLoading: isLoadingMetadata } = useSkinMetadata(
    skin.metadataURI,
  );

  // Get the image URL from the query result
  const imageUrl = data?.imageUrl;

  // Determine if this is a default or verified skin
  const isDefaultSkin = skin.collection.skinType === SkinType.DefaultPlayer;
  const isVerifiedSkin = skin.collection.skinType === SkinType.Player;

  const handleInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking info button
    setIsInfoVisible(!isInfoVisible);
  };

  return (
    <motion.div
      className={`relative aspect-square rounded-lg overflow-hidden border ${
        isCurrentSkin ? "border-green-500" : "border-yellow-600/20"
      } group cursor-pointer`}
      whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      onClick={() =>
        onViewDetails({ ...skin, imageURL: imageUrl || undefined })
      }
    >
      {/* Info Button (visible on mobile) */}
      <button
        type="button"
        className="absolute top-2 left-2 z-30 md:hidden bg-stone-900/70 text-yellow-300 rounded-full p-2 backdrop-blur-sm"
        onClick={handleInfoClick}
      >
        <Info className="h-4 w-4" />
      </button>

      {/* Skin Image */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-900/10 to-stone-900/40 z-0" />

      {isLoadingMetadata ? (
        <div className="w-full h-full flex items-center justify-center bg-stone-800/50">
          <Loader className="h-8 w-8 text-yellow-500 animate-spin" />
        </div>
      ) : (
        <Image
          src={imageUrl || "/placeholder-skin.jpg"}
          alt={`Skin ${skin.tokenId}`}
          width={300}
          height={300}
          className="object-cover w-full h-full z-10"
        />
      )}

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

      {/* Skin Info Overlay (appears on hover on desktop and touch on mobile) */}
      <div 
        className={`absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/50 to-transparent 
          md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 z-20
          ${isInfoVisible ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <h3 className="text-white font-medium">
              {getWeaponDisplayName(skin.weapon)}
            </h3>
          </div>
          <p className="text-stone-300 text-sm">
            {getArmorDisplayName(skin.armor)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
