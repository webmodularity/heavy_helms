"use client";

import type { Player } from "@/types/player.types";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShieldAlert, Trash2, Loader2 } from "lucide-react";
import { useFarcaster } from "@/store/farcaster-context";
import { useSupabaseSingleAddressToUserMap } from "@/hooks/use-supabase-players";
import { RetroCard, RetroCardContent } from "@/components/ui/retro-card";
import { RetroButton } from "@/components/ui/retro-button";
import { cn } from "@/lib/utils";

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
  const status = character.isRetired ? "RETIRED" : "ACTIVE";
  const isImmortal = character.isImmortal;
  const { data: userWithAddresses } = useSupabaseSingleAddressToUserMap(
    character.owner?.address!,
  );
  const { viewProfile } = useFarcaster();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <RetroCard
        variant="arcade"
        className={cn(
          "relative overflow-hidden retro-box-glow group hover:scale-[1.02] transition-all duration-300",
          character.isRetired ? "opacity-75" : "",
        )}
        withScanlines={!character.isRetired}
      >
        <RetroCardContent className="p-0 relative justify-center flex">
          {/* Character Image - PROPERLY CENTERED */}
          <div className="aspect-square max-h-[180px] relative flex items-center justify-center">
            <div className="h-full w-full relative overflow-hidden flex items-center justify-center">
              <Image
                src={character.currentSkin.imageURL}
                alt={character.name.fullName || "Character"}
                width={400}
                height={400}
                className="object-contain w-full h-full pixel-perfect transition-transform duration-500 group-hover:scale-105"
                style={{
                  objectPosition: "center center",
                }}
              />

              {/* Retro glow overlay when active */}
              {!character.isRetired && (
                <motion.div
                  className="absolute inset-0 bg-gradient-radial from-primary/20 to-transparent z-10"
                  initial={false}
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
                />
              )}
            </div>
          </div>

          {/* Overlays - SMALLER BADGES */}
          {/* ID Badge - Top Left */}
          <div className="absolute top-1.5 left-1.5 z-30">
            <div className="bg-arcade-screen/95 backdrop-blur-sm border border-primary/60 px-1.5 py-0.5 rounded-pixel">
              <span className="font-pixel text-pixel-xs text-primary font-bold retro-text-glow">
                ID: {warriorIdDisplay}
              </span>
            </div>
          </div>

          {/* Farcaster Profile - Top Right */}
          {userWithAddresses?.username && (
            <div className="absolute top-1.5 right-1.5 z-30">
              <RetroButton
                variant="pixel"
                size="xs"
                onClick={async () =>
                  await viewProfile(userWithAddresses.farcaster_fid)
                }
                className="p-1 retro-box-glow"
                glow="subtle"
              >
                <Image
                  src="/logos/farcaster-logo.svg"
                  alt={`${userWithAddresses.username} on Farcaster`}
                  width={14}
                  height={14}
                  className="rounded-pixel"
                />
              </RetroButton>
            </div>
          )}

          {/* Status & Retire - Bottom Right */}
          <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 z-30">
            <div className="bg-arcade-screen/95 backdrop-blur-sm border border-primary/60 px-1.5 py-0.5 rounded-pixel">
              <span
                className={cn(
                  "font-pixel text-pixel-xs font-bold",
                  character.isRetired
                    ? "text-destructive retro-text-glow"
                    : "text-success retro-text-glow",
                )}
              >
                {status}
              </span>
            </div>

            {showRetireButton && !character.isRetired && (
              <RetroButton
                variant="pixel"
                size="xs"
                onClick={onRetireClick}
                disabled={isRetiring}
                className="p-1 retro-box-glow hover:border-destructive"
                glow="subtle"
              >
                {isRetiring ? (
                  <Loader2 className="h-2.5 w-2.5 animate-spin text-foreground" />
                ) : (
                  <Trash2 className="h-2.5 w-2.5 text-destructive" />
                )}
              </RetroButton>
            )}
          </div>

          {/* Immortal Badge - Bottom Left */}
          {isImmortal && (
            <div className="absolute bottom-1.5 left-1.5 z-30">
              <div className="bg-arcade-screen/95 backdrop-blur-sm border border-warning/60 px-1.5 py-0.5 rounded-pixel">
                <span className="font-pixel text-pixel-xs text-warning font-bold flex items-center gap-0.5 retro-glow">
                  <ShieldAlert className="h-2.5 w-2.5" />
                  IMMORTAL
                </span>
              </div>
            </div>
          )}
        </RetroCardContent>
      </RetroCard>
    </motion.div>
  );
}
