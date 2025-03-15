import { request } from "graphql-request";
import { SUBGRAPH_URL } from "@/config";
import { GET_PLAYERS_BY_IDS, GET_OWNED_PLAYERS_QUERY } from "./gql-queries";
import type { RawPlayerData, Player } from "@/types/player.types";
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
import type { Spritesheet } from "@/types/skin.types";

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

export async function convertRawPlayerToPlayer(
  rawPlayer: RawPlayerData,
): Promise<Player> {
  // Convert metadataURI to HTTPS URL
  const metadataHttpsUrl = ipfsToHttps(rawPlayer.currentSkin.metadataURI);

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
    id: rawPlayer.id,
    name: {
      firstName: rawPlayer.firstName,
      surname: rawPlayer.surname,
      fullName: `${rawPlayer.firstName} ${rawPlayer.surname}`,
    },
    attributes: {
      strength: rawPlayer.strength,
      constitution: rawPlayer.constitution,
      size: rawPlayer.size,
      agility: rawPlayer.agility,
      stamina: rawPlayer.stamina,
      luck: rawPlayer.luck,
    },
    currentSkin: {
      collection: {
        id: rawPlayer.currentSkin.collection.id,
        contractAddress: rawPlayer.currentSkin.collection.contractAddress,
        isVerified: rawPlayer.currentSkin.collection.isVerified,
        skinType: rawPlayer.currentSkin.collection.skinType,
        requiredNFTAddress:
          rawPlayer.currentSkin.collection.requiredNFTAddress || undefined,
      },
      tokenId: rawPlayer.currentSkin.tokenId,
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
      weapon: (rawPlayer.currentSkin?.weapon || 0) as WeaponType,
      armor: (rawPlayer.currentSkin?.armor || 0) as ArmorType,
      stance: (rawPlayer.currentSkin?.stance || 1) as StanceType,
    },
    record: {
      wins: rawPlayer.wins,
      losses: rawPlayer.losses,
      kills: rawPlayer.kills,
    },
    isRetired: rawPlayer.isRetired || false,
    isImmortal: rawPlayer.isImmortal || false,
  };
}
