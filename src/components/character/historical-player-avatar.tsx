"use client";

import { useSkinMetadata } from "@/hooks/use-skin-metadata";
import { getStanceDisplayName } from "@/lib/equipment-utils";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Shield, Swords, Flame } from "lucide-react";

interface HistoricalPlayerAvatarProps {
  // Historical combat data
  skinCollectionId: string;
  skinTokenId: number;
  stance: number;
  skin?: {
    id: string;
    metadataURI?: string;
    weapon?: number;
    armor?: number;
  };
  // Standard props
  size?: "sm" | "md" | "lg";
  showStance?: boolean;
  className?: string;
}

const STANCE_ICONS = {
  0: <Shield className="h-3 w-3" />, // Defensive
  1: <Swords className="h-3 w-3" />, // Balanced
  2: <Flame className="h-3 w-3" />, // Offensive
} as const;

const SIZE_CLASSES = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-16 w-16",
} as const;

export function HistoricalPlayerAvatar({
  skinCollectionId,
  skinTokenId,
  stance,
  skin,
  size = "md",
  showStance = true,
  className,
}: HistoricalPlayerAvatarProps) {
  // Fetch skin metadata if available
  const { data: skinMetadata, isLoading } = useSkinMetadata(
    skin?.metadataURI || "",
  );

  const sizeClass = SIZE_CLASSES[size];
  const stanceIcon = STANCE_ICONS[stance as keyof typeof STANCE_ICONS] || (
    <Shield className="h-3 w-3" />
  );
  const stanceName = getStanceDisplayName(stance);

  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      {/* Avatar Image */}
      <div
        className={cn(
          "relative rounded-full overflow-hidden border-2",
          sizeClass,
        )}
      >
        {isLoading ? (
          <div className="w-full h-full bg-stone-700 animate-pulse" />
        ) : skinMetadata?.imageUrl ? (
          <Image
            src={skinMetadata.imageUrl}
            alt={`Skin ${skinCollectionId}-${skinTokenId}`}
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-stone-600 flex items-center justify-center text-stone-400 text-xs">
            🎨
          </div>
        )}

        {/* Stance indicator overlay */}
        {showStance && (
          <div
            className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-stone-800 border border-stone-600 flex items-center justify-center text-xs"
            title={`${stanceName} Stance`}
          >
            {stanceIcon}
          </div>
        )}
      </div>

      {/* Optional stance label for larger sizes */}
      {showStance && size === "lg" && (
        <div className="mt-1 text-xs text-stone-400 text-center">
          {stanceName}
        </div>
      )}

      {/* Skin ID for debugging/development */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-1 text-xs text-stone-500 text-center font-mono">
          {skinCollectionId}-{skinTokenId}
        </div>
      )}
    </div>
  );
}
