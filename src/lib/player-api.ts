import { request } from "graphql-request";
import { SUBGRAPH_URL } from "@/config";
import { GET_PLAYERS_BY_IDS, GET_OWNED_PLAYERS_QUERY } from "./gql-queries";
import type {
  RawPlayerData,
  Player,
  PlayerName,
  PlayerAttributes,
  PlayerRecord,
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
import type { Skin, Spritesheet, SkinCollection } from "@/types/skin.types";

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

  // Assemble the complete player
  return {
    id: rawPlayer.id,
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
  // Create player components
  const name = createPlayerName(firstName, surname);
  const playerAttributes = createPlayerAttributes(attributes);
  const playerRecord = record
    ? createPlayerRecord(record)
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

  // Assemble the complete player
  return {
    id,
    name,
    attributes: playerAttributes,
    currentSkin,
    record: playerRecord,
    isRetired,
    isImmortal,
  };
}
