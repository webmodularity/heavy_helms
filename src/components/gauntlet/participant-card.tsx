import type { Fighter } from "@/types/fighter-types"; // Changed from ProcessedFighter
// Skin type is part of Fighter.currentSkin
import Image from "next/image";
import Link from "next/link";
import { DEFAULT_CHARACTER_IMAGE } from "@/config";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ParticipantCardProps {
  fighter: Pick<
    Fighter, // Changed from ProcessedFighter
    "id" | "fullName" | "currentSkin" | "fighterId"
  >;
  isChampion?: boolean;
  isSelectedCharacter?: boolean;
}

export function ParticipantCard({
  fighter,
  isChampion,
  isSelectedCharacter,
}: ParticipantCardProps) {
  // fighter.fighterId is now potentially undefined or bigint | string from Fighter type
  // The mapRawFighterToDomainFighter ensures it's bigint | undefined
  const fighterIdString = fighter.fighterId
    ? fighter.fighterId.toString()
    : "N/A";
  const displayName = fighter.fullName || `Fighter #${fighterIdString}`;

  // fighter.currentSkin is now guaranteed to be a Skin object (non-null)
  const imageAvailable = fighter.currentSkin.imageURL; // No more optional chaining needed here

  // Base classes for the main card div
  const cardBaseClasses =
    "flex flex-col items-center p-1.5 rounded-md hover:bg-stone-700/50 transition-colors w-20 text-center cursor-pointer";

  let borderStyle = "border-transparent"; // Default: no visible border

  if (isChampion) {
    borderStyle = "border-yellow-400 ring-2 ring-yellow-500/60"; // Champion: Gold
  } else if (isSelectedCharacter) {
    borderStyle = "border-stone-200 ring-2 ring-stone-200/60";
  }

  const imageContainerClasses = [
    "w-14 h-14 rounded-full bg-stone-600 overflow-hidden relative mb-1 border-2",
    borderStyle,
  ]
    .join(" ")
    .trim();

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={`/character/${fighter.id}`} legacyBehavior={false}>
            <div className={cardBaseClasses}>
              <div className={imageContainerClasses}>
                {imageAvailable ? ( // imageURL from Skin object
                  <Image
                    src={imageAvailable}
                    alt={displayName}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="(max-width: 768px) 10vw, (max-width: 1200px) 5vw, 3vw"
                  />
                ) : (
                  // This branch might be less likely if DEFAULT_CHARACTER_IMAGE is always set on imageURL
                  <div className="w-full h-full flex items-center justify-center text-xl text-stone-400">
                    {displayName.charAt(0)?.toUpperCase() || "?"}
                  </div>
                )}
              </div>
              <span className="text-xs text-stone-300 truncate w-full">
                {displayName}
              </span>
            </div>
          </Link>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="bg-stone-800 border-stone-700 text-stone-200"
        >
          <p className="font-semibold">
            {fighter.fullName || "Unnamed Fighter"}
          </p>
          <p className="text-xs text-stone-400">ID: {fighter.id}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
