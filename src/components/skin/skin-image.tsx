"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface SkinImageProps {
  skinData: {
    collection: {
      id: string;
      contractAddress: string;
      isVerified: boolean;
      skinType: number;
      requiredNFTAddress: string | null;
    };
    tokenId: number;
    metadataURI: string;
    weapon: number;
    armor: number;
    imageURL?: string;
    spritesheet?: unknown;
  };
  collectionName: string;
  className?: string;
}

export function SkinImage({
  skinData,
  collectionName,
  className = "",
}: SkinImageProps) {
  const imageUrl = skinData.imageURL;

  return (
    <motion.div
      className="rounded-lg overflow-hidden border border-yellow-600/40 bg-gradient-to-b from-amber-900/20 to-stone-900/40 relative group aspect-[3/4] w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div
        className="absolute inset-0 bg-gradient-to-tr from-yellow-600/0 via-yellow-500/10 to-yellow-600/0 z-0 animate-pulse group-hover:opacity-50 transition-opacity"
        style={{ animationDuration: "4s" }}
      />
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={`${collectionName} #${skinData.tokenId}`}
          width={600}
          height={800}
          className="object-contain w-full h-full relative z-10"
          priority
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-4xl text-stone-500 bg-stone-800/50 relative z-10">
          🎭
        </div>
      )}
      <div className="absolute inset-0 border-4 border-transparent group-hover:border-b-yellow-500/30 group-hover:border-r-yellow-500/30 transition-all duration-300 z-20" />
    </motion.div>
  );
}
