"use client";

import type { Player } from "@/types/player.types";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShieldAlert, Trash2, Loader2 } from "lucide-react";
import { useFarcaster } from "@/store/farcaster-context";
import { useSupabaseSingleAddressToUserMap } from "@/hooks/use-supabase-players";

interface CharacterImageProps {
  character: Player;
  isOwner?: boolean;
  isRetiring?: boolean;
  onRetireClick?: () => void;
  showRetireButton?: boolean;
}

export function CharacterImage({
  character,
  isOwner,
  isRetiring,
  onRetireClick,
  showRetireButton,
}: CharacterImageProps) {
  const warriorIdDisplay = character.id.toString().padStart(5, "0");
  const status = character.isRetired ? "Retired" : "Active";
  const isImmortal = character.isImmortal;
  const { data: userWithAddresses } = useSupabaseSingleAddressToUserMap(
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    character.owner?.address!,
  );
  const { viewProfile } = useFarcaster();

  return (
    <motion.div
      className="rounded-lg overflow-hidden border border-yellow-600/40 bg-gradient-to-b from-amber-900/20 to-stone-900/40 relative "
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div
        className="absolute inset-0 bg-gradient-to-tr from-yellow-600/0 via-yellow-500/10 to-yellow-600/0 z-0 animate-pulse group-hover:opacity-50 transition-opacity"
        style={{ animationDuration: "4s" }}
      />
      {/* Character Image - preserve aspect ratio */}
      <div className="col-span-1 md:col-span-1 aspect-square max-h-[200px] md:max-h-[250px] justify-self-center">
        <div className="h-full rounded-lg overflow-hidden relative">
          <Image
            src={character.currentSkin.imageURL}
            alt={character.name.fullName || "Character"}
            width={600}
            height={800}
            className="object-contain w-full h-full"
          />
        </div>
      </div>
      <div className="absolute inset-0 border-4 border-transparent group-hover:border-b-yellow-500/30 group-hover:border-r-yellow-500/30 transition-all duration-300 z-20" />

      {/* Overlays */}
      {/* ID - Top Left */}
      <div className="absolute top-3 left-3 bg-black/50 text-yellow-400 px-2 py-1 text-sm font-semibold rounded shadow-md z-30 group-hover:bg-black/70 transition-colors">
        ID: {warriorIdDisplay}
      </div>

      {/* Name - Top Right */}
      {userWithAddresses?.username && (
        // <div className="absolute top-3 right-3">
        <button
          onClick={async () => await viewProfile(userWithAddresses.farcaster_fid)}
          type="button"
          className="ml-2 absolute top-3 right-3 z-30"
        >
          <Image
            src="/logos/farcaster-logo.svg"
            alt={`${userWithAddresses.username} on Farcaster`}
            width={20}
            height={20}
            className="rounded-sm"
          />
        </button>
        // </div>
      )}
      {/* Status & Retire - Bottom Right */}
      <div className="absolute bottom-3 right-3 flex items-center space-x-1 bg-black/50 px-2 py-1 text-sm rounded shadow-md z-30 group-hover:bg-black/70 transition-colors">
        <span
          className={`font-semibold ${character.isRetired ? "text-red-500" : "text-green-400"}`}
        >
          {status}
        </span>
        {showRetireButton && !character.isRetired && (
          <button
            type="button"
            onClick={onRetireClick}
            disabled={isRetiring}
            className="text-stone-300 hover:text-white disabled:text-stone-500 p-0.5 rounded transition-colors focus:outline-none focus:ring-1 focus:ring-yellow-500 ml-1"
            aria-label="Retire Warrior"
          >
            {isRetiring ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 text-stone-400 group-hover:text-stone-200 transition-colors" />
            )}
          </button>
        )}
      </div>

      {/* Immortal - Bottom Left */}
      {isImmortal && (
        <div className="absolute bottom-3 left-3 flex items-center space-x-1 bg-black/50 text-yellow-400 px-2 py-1 text-sm font-semibold rounded shadow-md z-30 group-hover:bg-black/70 transition-colors">
          <ShieldAlert className="h-4 w-4" />
          <span>IMMORTAL</span>
        </div>
      )}
    </motion.div>
  );
}
