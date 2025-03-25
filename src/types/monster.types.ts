import type { Fighter, FighterType, FighterName } from "./fighter-types";

// Monster extends Fighter with monster-specific fields
export interface Monster extends Fighter {
  fighterType: FighterType.Monster;
  name: FighterName;
  tier: number;
}

// Raw monster data from GraphQL (if needed)
export interface RawMonsterData {
  id: string;
  fighterId: string;
  fighterType: string;
  isRetired: boolean;

  // Common attributes
  strength: number;
  constitution: number;
  size: number;
  agility: number;
  stamina: number;
  luck: number;

  // Monster uses a different name structure
  creatureName: string;
  fullName: string;

  // Skin information
  currentSkin: {
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
    stance: number;
  };

  // Record fields
  wins: number;
  losses: number;
  kills: number;

  // Monster-specific fields
  tier: number;
}
