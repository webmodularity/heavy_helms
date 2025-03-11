"use client";

import { AuthenticatedView } from "@/components/home/authenticated-view";
import { CharacterGallery } from "@/components/home/character-gallery";
import { CommunityStats } from "@/components/home/community-stats";
import { GameIntroduction } from "@/components/home/game-introduction";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
// Import types
import type { Character } from "@/types/player.types";
import { usePrivy } from "@privy-io/react-auth";

// Sample character data - will be moved to a service later
const characters: Character[] = [
  {
    playerId: "10009",
    name: "Ross of the Glade",
    imageUrl:
      "https://ipfs.io/ipfs/bafkreici37rg5rtnr4vsnjeprl5e7khjy2dse7y3ahwivxbsnde6o2x3sy",
    stance: "defensive",
    weapon: "Sword + Shield",
    armor: "Plate",
    strength: 13,
    constitution: 16,
    size: 16,
    agility: 13,
    stamina: 7,
    luck: 7,
  },
  {
    playerId: "10008",
    name: "Kate of the Ember",
    imageUrl:
      "https://ipfs.io/ipfs/QmaALMyYXwHuwu2EvDrLjkqFK9YigUb6RD9FX7MqVGoDkW",
    stance: "balanced",
    weapon: "Quarterstaff",
    armor: "Cloth",
    strength: 16,
    constitution: 12,
    size: 9,
    agility: 10,
    stamina: 16,
    luck: 9,
  },
  {
    playerId: "10007",
    name: "Diego Frostcaller",
    imageUrl:
      "https://ipfs.io/ipfs/QmZqrNGPB2ck2ECdhKZEFaJyVM1YtNDLrhmWN5CxvZTqr5",
    stance: "offensive",
    weapon: "Battleaxe",
    armor: "Leather",
    strength: 16,
    constitution: 11,
    size: 13,
    agility: 9,
    stamina: 10,
    luck: 13,
  },
];
export default function Home() {
  const { authenticated, ready } = usePrivy();
  
  return (
    <div className="min-h-screen w-full overflow-y-auto">
      {!ready ? (
        <div className="flex items-center justify-center h-screen">
          <LoadingSpinner size="lg" text="Loading game..." />
        </div>
      ) : authenticated ? (
        <AuthenticatedView />
      ) : (
        // Non-authenticated view
        <>
          <CharacterGallery characters={characters} />
          <GameIntroduction />
          <CommunityStats />
        </>
      )}
    </div>
  );
}
