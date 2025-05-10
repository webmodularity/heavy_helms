import type { Fighter } from "@/types/fighter-types"; // Changed from ProcessedFighter
// Skin type is part of Fighter.currentSkin
import Image from "next/image";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ParticipantCardProps {
  fighter: Pick<
    Fighter,
    "id" | "fullName" | "currentSkin" | "fighterId" | "name" // Ensure 'name' is picked
  >;
  isChampion?: boolean;
  isSelectedCharacter?: boolean;
}

export function ParticipantCard({
  fighter,
  isChampion,
  isSelectedCharacter,
}: ParticipantCardProps) {
  // Attempt to get a clean numeric-like ID string for display if fighterId is complex
  const fighterIdForDisplay =
    fighter.fighterId?.toString() ||
    fighter.id?.split(":").pop() || // Fallback to extracting from "Player:123"
    "N/A";

  // Try to get the best available name, allowing it to be undefined initially.
  let bestAttemptName: string | undefined;

  if (fighter.name?.fullName && fighter.name.fullName.trim() !== "") {
    bestAttemptName = fighter.name.fullName.trim();
  } else if (fighter.fullName && fighter.fullName.trim() !== "") {
    // Fallback to top-level fullName if name.fullName was not satisfactory
    bestAttemptName = fighter.fullName.trim();
  }
  // At this point, bestAttemptName is either a non-empty string or undefined.

  // displayName is guaranteed to be a string for card text and image alt.
  const displayName: string =
    bestAttemptName || `Fighter #${fighterIdForDisplay}`;

  // nameForTooltip is also guaranteed to be a string for the tooltip.
  const nameForTooltip: string = bestAttemptName || "Unnamed Fighter";

  // Assuming currentSkin is always present after convertRawFighterToFighter
  const imageAvailable = fighter.currentSkin?.imageURL;

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
          <p className="font-semibold">{nameForTooltip}</p>
          <p className="text-xs text-stone-400">ID: {fighter.id}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
