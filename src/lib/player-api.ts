import { request } from "graphql-request";
import { SUBGRAPH_URL } from "@/config";
import {
  GET_PLAYERS_BY_IDS,
  GET_OWNED_PLAYERS_QUERY,
  GET_VERIFIED_SKIN_COLLECTIONS,
  GET_FIGHTERS_BY_IDS,
  GET_NAMES_BY_INDICES,
  GET_SKIN_BY_INDICES,
} from "./gql-queries";
import type {
  RawPlayerData,
  // Player,
  PlayerName,
  PlayerAttributes,
  PlayerRecord,
  DefaultPlayer,
  Player,
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
import type { RawDecodedPlayerData } from "@/types/player.types";
import { getFighterTypeFromPlayerId } from "@/game/utils/fighter-utils";

// Define response types for GraphQL queries
interface PlayersResponse {
  players: RawPlayerData[];
}

interface OwnersResponse {
  owners: {
    address: string;
    totalPlayers: number;
    activePlayers: RawFighterData[];
  }[];
}

export interface FightersResponse {
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
export async function fetchFightersByOwner(
  ownerAddress: string,
): Promise<RawFighterData[]> {
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

// export async function fetchAndConvertPlayers(
//   playerIds: string[],
// ): Promise<Player[]> {
//   const rawPlayers = await fetchPlayersByIds(playerIds);

//   const playerPromises = rawPlayers.map(convertRawPlayerToPlayer);
//   return Promise.all(playerPromises);
// }

/**
 * Fetches and creates a Skin object from raw data
 */
export async function createPlayerSkin(rawSkin: {
  collection: {
    id: string;
    contractAddress: string;
    isVerified: boolean;
    skinType: number;
    requiredNFTAddress?: string | null;
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
    collection: {
      id: rawSkin.collection.id,
      contractAddress: rawSkin.collection.contractAddress,
      isVerified: rawSkin.collection.isVerified,
      skinType: rawSkin.collection.skinType,
      requiredNFTAddress: rawSkin.collection.requiredNFTAddress || undefined,
    },
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
// export async function convertRawPlayerToPlayer(
//   rawPlayer: RawPlayerData,
// ): Promise<Player> {
//   // Create player components
//   const name = createPlayerName(rawPlayer.firstName, rawPlayer.surname);
//   const attributes = createPlayerAttributes(rawPlayer);
//   const record = createPlayerRecord(rawPlayer);
//   const currentSkin = await createPlayerSkin(rawPlayer.currentSkin);

//   // Assemble the complete player with fighterType
//   return {
//     id: rawPlayer.id,
//     fighterType: FighterType.Player,
//     name,
//     attributes,
//     currentSkin,
//     record,
//     isRetired: rawPlayer.isRetired || false,
//     isImmortal: rawPlayer.isImmortal || false,
//   };
// }

/**
 * Creates a Player object from custom data sources
 */
// export async function createCustomPlayer(
//   id: string,
//   firstName: string,
//   surname: string,
//   attributes: {
//     strength: number;
//     constitution: number;
//     size: number;
//     agility: number;
//     stamina: number;
//     luck: number;
//   },
//   skinData: {
//     collection: {
//       id: string;
//       contractAddress: string;
//       isVerified: boolean;
//       skinType: number;
//       requiredNFTAddress?: string;
//     };
//     tokenId: number;
//     metadataURI: string;
//     weapon?: number;
//     armor?: number;
//     stance?: number;
//   },
//   record?: {
//     wins: number;
//     losses: number;
//     kills: number;
//   },
//   isRetired = false,
//   isImmortal = false,
// ): Promise<Player> {
//   // Call createCustomFighter with Player type and convert the result
//   return createCustomFighter(
//     id,
//     FighterType.Player,
//     { firstName, surname },
//     attributes,
//     skinData,
//     record,
//     { isRetired, isImmortal },
//   ) as Promise<Player>;
// }

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
 * Converts a raw fighter data object to the appropriate fighter type
 */
export async function convertRawFighterToFighter(
  rawFighter: RawFighterData,
): Promise<Fighter> {
  // Create common fighter components inline
  let name: FighterName;
  if (rawFighter.fighterType === FighterType.Monster) {
    name = {
      fullName: rawFighter.firstName || "Monster",
    };
  } else {
    name = {
      firstName: rawFighter.firstName || "Unknown",
      surname: rawFighter.surname || "Fighter",
      fullName:
        rawFighter.fullName ||
        `${rawFighter.firstName || "Unknown"} ${rawFighter.surname || "Fighter"}`,
    } as PlayerName;
  }

  const attributes: FighterAttributes = {
    strength: rawFighter.strength,
    constitution: rawFighter.constitution,
    size: rawFighter.size,
    agility: rawFighter.agility,
    stamina: rawFighter.stamina,
    luck: rawFighter.luck,
  };

  const record: FighterRecord = {
    wins: rawFighter.wins,
    losses: rawFighter.losses,
    kills: rawFighter.kills,
  };

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
 * Builds a RawFighterData object from RawDecodedPlayerData by fetching
 * necessary data from the subgraph using the indices
 */
export async function buildRawFighterFromDecodedData(
  decodedData: RawDecodedPlayerData,
): Promise<RawFighterData> {
  // 1. Get fighter type based on ID
  const fighterType = getFighterTypeFromPlayerId(decodedData.id.toString());

  // 2. Fetch name data from subgraph using indices
  const nameData = await fetchNamesByIndices(
    decodedData.stats.name.firstNameIndex,
    decodedData.stats.name.surnameIndex,
  );

  // 3. Fetch skin collection and skin data from subgraph using indices
  const skinData = await fetchSkinByIndices(
    decodedData.stats.skin.skinIndex,
    decodedData.stats.skin.skinTokenId,
  );

  // 4. Construct the RawFighterData object
  return {
    id: decodedData.id.toString(),
    fighterId: decodedData.id.toString(),
    fighterType: fighterType,
    isRetired: false, // We don't have this in decoded data, default to false

    // Attributes
    strength: decodedData.stats.attributes.strength,
    constitution: decodedData.stats.attributes.constitution,
    size: decodedData.stats.attributes.size,
    agility: decodedData.stats.attributes.agility,
    stamina: decodedData.stats.attributes.stamina,
    luck: decodedData.stats.attributes.luck,

    // Name fields
    firstName: nameData.firstName,
    surname: nameData.surname,

    // Skin information
    currentSkin: {
      collection: skinData.collection,
      tokenId: skinData.tokenId,
      metadataURI: skinData.metadataURI,
      weapon: skinData.weapon,
      armor: skinData.armor,
      stance: skinData.stance,
    },

    // Record
    wins: decodedData.stats.record.wins,
    losses: decodedData.stats.record.losses,
    kills: decodedData.stats.record.kills,

    // Type-specific fields will be populated based on fighter type
    ...(fighterType === FighterType.Player && {
      isImmortal: false, // Default value, since we don't have this in decoded data
    }),
    ...(fighterType === FighterType.Monster && {
      tier: 1, // Default value, since we don't have this in decoded data
    }),
  };
}

/**
 * Fetches name data from the subgraph using indices
 */
export async function fetchNamesByIndices(
  firstNameIndex: number,
  surnameIndex: number,
): Promise<{ firstName: string; surname: string }> {
  // Define proper response type
  interface NamesResponse {
    firstNameResult: Array<{ id: string; value: string }>;
    surnameResult: Array<{ id: string; value: string }>;
  }

  try {
    const response = await request<NamesResponse>(
      SUBGRAPH_URL,
      GET_NAMES_BY_INDICES,
      {
        firstNameIndex,
        surnameIndex,
      },
    );

    if (!response || !response.firstNameResult || !response.surnameResult) {
      console.error("Unexpected response structure:", response);
      return { firstName: "Unknown", surname: "Fighter" };
    }

    return {
      firstName:
        response.firstNameResult.length > 0
          ? response.firstNameResult[0].value
          : "Unknown",
      surname:
        response.surnameResult.length > 0
          ? response.surnameResult[0].value
          : "Fighter",
    };
  } catch (error) {
    console.error("Error fetching names from subgraph:", error);
    return { firstName: "Unknown", surname: "Fighter" };
  }
}

/**
 * Fetches skin data from the subgraph using indices
 */
async function fetchSkinByIndices(
  skinIndex: number,
  skinTokenId: number,
): Promise<{
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
}> {
  // Define proper response type
  interface SkinResponse {
    skinCollections: Array<{
      id: string;
      contractAddress: string;
      isVerified: boolean;
      skinType: number;
      requiredNFTAddress: string | null;
      skins: Array<{
        id: string;
        tokenId: number;
        metadataURI: string;
        weapon: number;
        armor: number;
        stance: number;
      }>;
    }>;
  }

  try {
    // Pass parameters with the correct names that match the GraphQL query
    const response = await request<SkinResponse>(
      SUBGRAPH_URL,
      GET_SKIN_BY_INDICES,
      {
        registryId: skinIndex, // Changed from skinIndex to registryId
        tokenId: skinTokenId, // This one already matches
      },
    );

    const collection = response.skinCollections[0];
    const skin = collection?.skins[0];

    if (!collection || !skin) {
      throw new Error(
        `Skin not found: registryId ${skinIndex}, token ${skinTokenId}`,
      );
    }

    return {
      collection: {
        id: collection.id,
        contractAddress: collection.contractAddress,
        isVerified: collection.isVerified,
        skinType: collection.skinType,
        requiredNFTAddress: collection.requiredNFTAddress,
      },
      tokenId: skin.tokenId,
      metadataURI: skin.metadataURI,
      weapon: skin.weapon,
      armor: skin.armor,
      stance: skin.stance,
    };
  } catch (error) {
    console.error("Error fetching skin from subgraph:", error);
    // Return default skin data in case of error
    return {
      collection: {
        id: "0",
        contractAddress: "0x0",
        isVerified: false,
        skinType: 0,
        requiredNFTAddress: null,
      },
      tokenId: skinTokenId,
      metadataURI: "",
      weapon: 0,
      armor: 0,
      stance: 1,
    };
  }
}
