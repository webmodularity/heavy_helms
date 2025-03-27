import type { Skin, SkinInfo } from "./skin.types";
import type {
  Fighter,
  FighterType,
  FighterName,
  FighterAttributes,
  FighterRecord,
  FighterCalculatedStats,
  FighterState,
} from "./fighter-types";

// Player-specific name type
export interface PlayerName extends FighterName {
  firstName: string;
  surname: string;
}

// Player extends Fighter with player-specific fields
export interface Player extends Fighter {
  fighterType: FighterType.Player;
  name: PlayerName;
  isImmortal: boolean;
  owner?: { address: string };
}

// DefaultPlayer extends Fighter with no additional fields
export interface DefaultPlayer extends Fighter {
  fighterType: FighterType.DefaultPlayer;
  name: PlayerName;
}

// For backward compatibility - providing aliases to fighter types
export type PlayerAttributes = FighterAttributes;
export type PlayerRecord = FighterRecord;
export type CalculatedStats = FighterCalculatedStats;
export type PlayerState = FighterState;

// Raw player data from GraphQL
export interface RawPlayerData {
  id: string;
  firstName: string;
  surname: string;
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
  strength: number;
  constitution: number;
  size: number;
  agility: number;
  stamina: number;
  luck: number;
  wins: number;
  losses: number;
  kills: number;
  isRetired: boolean;
  isImmortal: boolean;
}

export interface PlayerLoadout {
  playerId: number;
  skin: SkinInfo;
}

// Raw data structure returned from decodePlayerData on the Player contract
export interface RawDecodedPlayerData {
  id: number;
  stats: {
    attributes: {
      strength: number;
      constitution: number;
      size: number;
      agility: number;
      stamina: number;
      luck: number;
    };
    name: {
      firstNameIndex: number;
      surnameIndex: number;
    };
    skin: {
      skinIndex: number;
      skinTokenId: number;
    };
    record: {
      wins: number;
      losses: number;
      kills: number;
    };
  };
}
