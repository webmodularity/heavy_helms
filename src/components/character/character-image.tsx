"use client";

import type { Player } from "@/types/player.types";
import Image from "next/image";
import { motion } from "framer-motion";

interface CharacterImageProps {
  character: Player;
}

export function CharacterImage({ character }: CharacterImageProps) {
  return (
    <motion.div
      // Removed aspect-square, Added h-full
      className="h-full rounded-lg overflow-hidden border border-yellow-600/40 bg-gradient-to-b from-amber-900/20 to-stone-900/40 relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div
        className="absolute inset-0 bg-gradient-to-tr from-yellow-600/0 via-yellow-500/10 to-yellow-600/0 z-0 animate-pulse"
        style={{ animationDuration: "4s" }}
      />
      <Image
        src={character.currentSkin.imageURL}
        alt={character.name.fullName || "Character"}
        width={600} // Width might need adjustment based on container
        height={600} // Height might need adjustment based on container
        className="object-cover w-full h-full relative z-10" // w-full h-full should make it fill the container
        priority
      />
      <div className="absolute inset-0 border-4 border-transparent border-b-yellow-600/20 border-r-yellow-600/20 z-20" />
    </motion.div>
  );
}
