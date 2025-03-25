import { request } from "graphql-request";
import { SUBGRAPH_URL } from "@/config";
import {
  GET_PLAYERS_BY_IDS,
  GET_OWNED_PLAYERS_QUERY,
  GET_VERIFIED_SKIN_COLLECTIONS,
  GET_FIGHTERS_BY_IDS,
} from "./gql-queries";
import type {
  RawPlayerData,
  Player,
  PlayerName,
  PlayerAttributes,
  PlayerRecord,
  DefaultPlayer,
} from "@/types/player.types";
import type {
  WeaponType,
  ArmorType,
  StanceType,
} from "@/types/equipment.types";
import { fetchNFTMetadata } from "@/lib/nft-utils";
import { ipfsToHttps } from "@/lib/utils";
import {
  DEFAULT_IMAGE_URL,
  DEFAULT_SPRITESHEET_URL,
  DEFAULT_SPRITESHEET_DATA,
} from "@/lib/default-skin-data";
import type {
  Skin,
  Spritesheet,
  SkinCollection,
  VerifiedSkinCollectionResponse,
} from "@/types/skin.types";
import { FighterType } from "@/types/fighter-types";
import type {
  Fighter,
  FighterName,
  FighterAttributes,
  FighterRecord,
  RawFighterData,
} from "@/types/fighter-types";
import type { Monster } from "@/types/monster.types";

// Define response types for GraphQL queries
interface PlayersResponse {
  players: RawPlayerData[];
}

interface OwnersResponse {
  owners: {
    address: string;
    totalPlayers: number;
    activePlayers: RawPlayerData[];
  }[];
}

interface FightersResponse {
  fighters: RawFighterData[];
}

/**
 * Fetches players by their IDs from the subgraph
 */
export async function fetchPlayersByIds(
  playerIds: string[],
): Promise<RawPlayerData[]> {
  try {
    const response = await request<PlayersResponse>(
      SUBGRAPH_URL,
      GET_PLAYERS_BY_IDS,
      { playerIds },
    );

    return response.players;
  } catch (error) {
    console.error("Error fetching players from subgraph:", error);
    throw error;
  }
}

export async function fetchVerifiedSkinCollections(): Promise<
  VerifiedSkinCollectionResponse[]
> {
  const response = await request<{
    skinCollections: VerifiedSkinCollectionResponse[];
  }>(SUBGRAPH_URL, GET_VERIFIED_SKIN_COLLECTIONS);
  return response.skinCollections;
}

/**
 * Fetches players owned by a specific address
 */
export async function fetchPlayersByOwner(
  ownerAddress: string,
): Promise<RawPlayerData[]> {
  try {
    const response = await request<OwnersResponse>(
      SUBGRAPH_URL,
      GET_OWNED_PLAYERS_QUERY,
      { owner: ownerAddress },
    );

    if (!response.owners || response.owners.length === 0) {
      return [];
    }

    return response.owners[0].activePlayers;
  } catch (error) {
    console.error("Error fetching owned players from subgraph:", error);
    throw error;
  }
}

export async function fetchAndConvertPlayers(
  playerIds: string[],
): Promise<Player[]> {
  const rawPlayers = await fetchPlayersByIds(playerIds);

  const playerPromises = rawPlayers.map(convertRawPlayerToPlayer);
  return Promise.all(playerPromises);
}

/**
 * Creates a PlayerName object from raw data
 */
export function createPlayerName(
  firstName: string,
  surname: string,
): PlayerName {
  return {
    firstName,
    surname,
    fullName: `${firstName} ${surname}`,
  };
}

/**
 * Creates a PlayerAttributes object from raw data
 */
export function createPlayerAttributes(rawData: {
  strength: number;
  constitution: number;
  size: number;
  agility: number;
  stamina: number;
  luck: number;
}): PlayerAttributes {
  return {
    strength: rawData.strength,
    constitution: rawData.constitution,
    size: rawData.size,
    agility: rawData.agility,
    stamina: rawData.stamina,
    luck: rawData.luck,
  };
}

/**
 * Creates a PlayerRecord object from raw data
 */
export function createPlayerRecord(rawData: {
  wins: number;
  losses: number;
  kills: number;
}): PlayerRecord {
  return {
    wins: rawData.wins,
    losses: rawData.losses,
    kills: rawData.kills,
  };
}

/**
 * Creates a SkinCollection object from raw data
 */
export function createSkinCollection(rawCollection: {
  id: string;
  contractAddress: string;
  isVerified: boolean;
  skinType: number;
  requiredNFTAddress: string | null;
}): SkinCollection {
  return {
    id: rawCollection.id,
    contractAddress: rawCollection.contractAddress,
    isVerified: rawCollection.isVerified,
    skinType: rawCollection.skinType,
    requiredNFTAddress: rawCollection.requiredNFTAddress || undefined,
  };
}

/**
 * Fetches and creates a Skin object from raw data
 */
export async function createPlayerSkin(rawSkin: {
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
}): Promise<Skin> {
  // Convert metadataURI to HTTPS URL
  const metadataHttpsUrl = ipfsToHttps(rawSkin.metadataURI);

  // Fetch the NFT metadata
  let imageUrl: string = DEFAULT_IMAGE_URL;
  let spritesheetData: Spritesheet = DEFAULT_SPRITESHEET_DATA;
  let spritesheetURL: string = DEFAULT_SPRITESHEET_URL;

  try {
    const metadata = await fetchNFTMetadata(metadataHttpsUrl);
    if (metadata.image) {
      imageUrl = ipfsToHttps(metadata.image);
    }
    if (metadata.image_spritesheet) {
      spritesheetURL = ipfsToHttps(metadata.image_spritesheet);
    }
    if (metadata.textures[0]) {
      spritesheetData = metadata.textures[0];
    }
  } catch (error) {
    console.error("Error fetching metadata:", error);
  }

  return {
    collection: createSkinCollection(rawSkin.collection),
    tokenId: rawSkin.tokenId,
    metadataURL: metadataHttpsUrl,
    imageURL: imageUrl,
    spritesheet: {
      image: spritesheetURL,
      fps: {
        idle: spritesheetData.fps.idle,
        walking: spritesheetData.fps.walking,
        running: spritesheetData.fps.running,
        attacking: spritesheetData.fps.attacking,
        blocking: spritesheetData.fps.blocking,
        dying: spritesheetData.fps.dying,
        hurt: spritesheetData.fps.hurt,
        dodging: spritesheetData.fps.dodging,
        taunting: spritesheetData.fps.taunting,
      },
      format: spritesheetData.format,
      size: spritesheetData.size,
      scale: spritesheetData.scale,
      frames: spritesheetData.frames,
    },
    weapon: (rawSkin.weapon || 0) as WeaponType,
    armor: (rawSkin.armor || 0) as ArmorType,
    stance: (rawSkin.stance || 1) as StanceType,
  };
}

/**
 * Converts a RawPlayerData object to a Player object
 */
export async function convertRawPlayerToPlayer(
  rawPlayer: RawPlayerData,
): Promise<Player> {
  // Create player components
  const name = createPlayerName(rawPlayer.firstName, rawPlayer.surname);
  const attributes = createPlayerAttributes(rawPlayer);
  const record = createPlayerRecord(rawPlayer);
  const currentSkin = await createPlayerSkin(rawPlayer.currentSkin);

  // Assemble the complete player with fighterType
  return {
    id: rawPlayer.id,
    fighterType: FighterType.Player,
    name,
    attributes,
    currentSkin,
    record,
    isRetired: rawPlayer.isRetired || false,
    isImmortal: rawPlayer.isImmortal || false,
  };
}

/**
 * Creates a Player object from custom data sources
 */
export async function createCustomPlayer(
  id: string,
  firstName: string,
  surname: string,
  attributes: {
    strength: number;
    constitution: number;
    size: number;
    agility: number;
    stamina: number;
    luck: number;
  },
  skinData: {
    collection: {
      id: string;
      contractAddress: string;
      isVerified: boolean;
      skinType: number;
      requiredNFTAddress?: string;
    };
    tokenId: number;
    metadataURI: string;
    weapon?: number;
    armor?: number;
    stance?: number;
  },
  record?: {
    wins: number;
    losses: number;
    kills: number;
  },
  isRetired = false,
  isImmortal = false,
): Promise<Player> {
  // Call createCustomFighter with Player type and convert the result
  return createCustomFighter(
    id,
    FighterType.Player,
    { firstName, surname },
    attributes,
    skinData,
    record,
    { isRetired, isImmortal },
  ) as Promise<Player>;
}

/**
 * Fetches fighters by their IDs from the subgraph
 */
export async function fetchFightersByIds(
  fighterIds: string[],
): Promise<RawFighterData[]> {
  try {
    const response = await request<FightersResponse>(
      SUBGRAPH_URL,
      GET_FIGHTERS_BY_IDS,
      { fighterIds },
    );

    return response.fighters;
  } catch (error) {
    console.error("Error fetching fighters from subgraph:", error);
    throw error;
  }
}

/**
 * Fetches and converts fighters by their IDs
 */
export async function fetchAndConvertFighters(
  fighterIds: string[],
): Promise<Fighter[]> {
  const rawFighters = await fetchFightersByIds(fighterIds);
  const fighterPromises = rawFighters.map(convertRawFighterToFighter);
  return Promise.all(fighterPromises);
}

/**
 * Creates a FighterName object based on the fighter type
 */
export function createFighterName(rawFighter: RawFighterData): FighterName {
  if (rawFighter.fighterType === FighterType.Monster) {
    // Create MonsterName
    const monsterName: FighterName = {
      fullName: rawFighter.firstName || "Monster",
    };
    return monsterName;
  }

  // Create PlayerName for Player and DefaultPlayer
  const playerName: PlayerName = {
    firstName: rawFighter.firstName || "Unknown",
    surname: rawFighter.surname || "Fighter",
    fullName:
      rawFighter.fullName ||
      `${rawFighter.firstName || "Unknown"} ${rawFighter.surname || "Fighter"}`,
  };
  return playerName;
}

/**
 * Creates a FighterAttributes object from raw data
 */
export function createFighterAttributes(rawData: {
  strength: number;
  constitution: number;
  size: number;
  agility: number;
  stamina: number;
  luck: number;
}): FighterAttributes {
  return {
    strength: rawData.strength,
    constitution: rawData.constitution,
    size: rawData.size,
    agility: rawData.agility,
    stamina: rawData.stamina,
    luck: rawData.luck,
  };
}

/**
 * Creates a FighterRecord object from raw data
 */
export function createFighterRecord(rawData: {
  wins: number;
  losses: number;
  kills: number;
}): FighterRecord {
  return {
    wins: rawData.wins,
    losses: rawData.losses,
    kills: rawData.kills,
  };
}

/**
 * Converts a raw fighter data object to the appropriate fighter type
 */
export async function convertRawFighterToFighter(
  rawFighter: RawFighterData,
): Promise<Fighter> {
  // Create common fighter components
  const name = createFighterName(rawFighter);
  const attributes = createFighterAttributes(rawFighter);
  const record = createFighterRecord(rawFighter);
  const currentSkin = await createPlayerSkin(rawFighter.currentSkin);

  // Base fighter properties
  const baseFighter: Fighter = {
    id: rawFighter.id,
    fighterId: rawFighter.fighterId,
    fighterType: rawFighter.fighterType as FighterType,
    name,
    attributes,
    currentSkin,
    record,
    isRetired: rawFighter.isRetired || false,
    isImmortal: false,
  };

  // Add type-specific properties based on fighterType
  switch (rawFighter.fighterType) {
    case FighterType.Player:
      return {
        ...baseFighter,
        fighterType: FighterType.Player,
        name: name as PlayerName,
        isImmortal: rawFighter.isImmortal || false,
        owner: rawFighter.owner,
      } as Player;

    case FighterType.DefaultPlayer:
      return {
        ...baseFighter,
        fighterType: FighterType.DefaultPlayer,
        name: name as PlayerName,
      } as DefaultPlayer;

    case FighterType.Monster:
      return {
        ...baseFighter,
        fighterType: FighterType.Monster,
        name: name as FighterName,
        tier: rawFighter.tier || 1,
      } as Monster;

    default:
      console.warn(
        `Unknown fighter type: ${rawFighter.fighterType}, treating as generic Fighter`,
      );
      return baseFighter;
  }
}

/**
 * Creates a custom fighter object from provided data
 * This can be used for optimistic updates or creating fighters from blockchain data
 */
export async function createCustomFighter(
  id: string,
  fighterType: FighterType,
  nameData: {
    firstName?: string;
    surname?: string;
    creatureName?: string;
    fullName?: string;
  },
  attributes: {
    strength: number;
    constitution: number;
    size: number;
    agility: number;
    stamina: number;
    luck: number;
  },
  skinData: {
    collection: {
      id: string;
      contractAddress: string;
      isVerified: boolean;
      skinType: number;
      requiredNFTAddress?: string;
    };
    tokenId: number;
    metadataURI: string;
    weapon?: number;
    armor?: number;
    stance?: number;
  },
  record?: {
    wins: number;
    losses: number;
    kills: number;
  },
  additionalProps?: {
    isRetired?: boolean;
    isImmortal?: boolean; // Player only
    owner?: { address: string }; // Player only
    tier?: number; // Monster only
    fighterId?: string | bigint;
  },
): Promise<Fighter> {
  // Create name based on fighter type
  let name: FighterName;
  if (fighterType === FighterType.Monster) {
    name = {
      fullName: nameData.firstName || "Monster",
    } as FighterName;
  } else {
    name = {
      firstName: nameData.firstName || "Unknown",
      surname: nameData.surname || "Fighter",
      fullName:
        nameData.fullName ||
        `${nameData.firstName || "Unknown"} ${nameData.surname || "Fighter"}`,
    } as PlayerName;
  }

  // Create other common components
  const fighterAttributes = createFighterAttributes(attributes);
  const fighterRecord = record
    ? createFighterRecord(record)
    : { wins: 0, losses: 0, kills: 0 };

  // Convert the skin data to match the expected format for createPlayerSkin
  const rawSkin = {
    collection: {
      id: skinData.collection.id,
      contractAddress: skinData.collection.contractAddress,
      isVerified: skinData.collection.isVerified,
      skinType: skinData.collection.skinType,
      requiredNFTAddress: skinData.collection.requiredNFTAddress || null,
    },
    tokenId: skinData.tokenId,
    metadataURI: skinData.metadataURI,
    weapon: skinData.weapon || 0,
    armor: skinData.armor || 0,
    stance: skinData.stance || 1,
  };

  const currentSkin = await createPlayerSkin(rawSkin);

  // Base fighter object
  const baseFighter: Fighter = {
    id,
    fighterId: additionalProps?.fighterId || id,
    fighterType,
    name,
    attributes: fighterAttributes,
    currentSkin,
    record: fighterRecord,
    isRetired: additionalProps?.isRetired || false,
    isImmortal: false,
  };

  // Add type-specific properties based on fighterType
  switch (fighterType) {
    case FighterType.Player:
      return {
        ...baseFighter,
        fighterType: FighterType.Player,
        name: name as PlayerName,
        isImmortal: additionalProps?.isImmortal || false,
        owner: additionalProps?.owner,
      } as Player;

    case FighterType.DefaultPlayer:
      return {
        ...baseFighter,
        fighterType: FighterType.DefaultPlayer,
        name: name as PlayerName,
      } as DefaultPlayer;

    case FighterType.Monster:
      return {
        ...baseFighter,
        fighterType: FighterType.Monster,
        name: name as FighterName,
        tier: additionalProps?.tier || 1,
      } as Monster;

    default:
      return baseFighter;
  }
}
