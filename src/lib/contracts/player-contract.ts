import { viemClient } from "@/config";
import { DefaultPlayerSkinNFTABI } from "@/game/abi/DefaultPlayerSkinNFT.abi";
import { PlayerABI } from "@/game/abi/PlayerABI.abi";
import { PlayerNameRegistryABI } from "@/game/abi/PlayerNameRegistryABI.abi";
// src/lib/contracts/player-contract.ts
import type { Address } from "viem";
// Contract addresses
const playerContractAddress = process.env
  .NEXT_PUBLIC_PLAYER_CONTRACT_ADDRESS as Address;
const playerNameRegistryAddress = process.env
  .NEXT_PUBLIC_PLAYER_NAME_REGISTRY_CONTRACT_ADDRESS as Address;

// Types
export interface RawPlayerData {
  attributes: {
    strength: number;
    constitution: number;
    size: number;
    agility: number;
    stamina: number;
    luck: number;
  };
  skin: {
    skinIndex: number;
    skinTokenId: number;
  };
  firstNameIndex: number;
  surnameIndex: number;
  wins: number;
  losses: number;
  kills: number;
}

export interface PlayerName {
  firstName: string;
  surname: string;
  fullName: string;
}

export interface SkinData {
  contractAddress: Address;
  tokenId: number;
  weapon?: number;
  armor?: number;
  stance?: number;
  imageUrl?: string;
  attributes?: any[];
}

// Player ID functions
export async function getPlayerIds(walletAddress: Address): Promise<number[]> {
  if (!walletAddress) return [];

  try {
    const ids = await viemClient.readContract({
      address: playerContractAddress,
      abi: PlayerABI,
      functionName: "getPlayerIds",
      args: [walletAddress],
    });
    console.log("ids", ids);
    return ids.map((id) => Number(id));
  } catch (error) {
    console.error("Error fetching player IDs:", error);
    return [];
  }
}

// Player data functions
export async function getPlayerData(
  playerId: number,
): Promise<RawPlayerData | null> {
  try {
    const playerData = await viemClient.readContract({
      address: playerContractAddress,
      abi: PlayerABI,
      functionName: "getPlayer",
      args: [playerId],
    });

    return playerData as RawPlayerData;
  } catch (error) {
    console.error(`Error fetching player ${playerId}:`, error);
    return null;
  }
}

// Name functions - enhanced based on Preloader.ts
export async function getPlayerName(
  firstNameIndex: number,
  surnameIndex: number,
): Promise<PlayerName> {
  try {
    // This matches how Preloader.ts fetches names
    const nameData = await viemClient.readContract({
      address: playerNameRegistryAddress,
      abi: PlayerNameRegistryABI,
      functionName: "getFullName",
      args: [firstNameIndex, surnameIndex],
    });
    console.log("nameData", nameData);
    // The API returns [firstName, surname]
    const [firstName, surname] = nameData as [string, string];

    return {
      firstName,
      surname,
      fullName: `${firstName} ${surname}`,
    };
  } catch (error) {
    console.error("Error fetching player name:", error);
    return {
      firstName: "Unknown",
      surname: "Warrior",
      fullName: "Unknown Warrior",
    };
  }
}

// Skin functions
export async function getSkinData(playerId: number): Promise<SkinData | null> {
  try {
    // First get the player's skin info
    const skinInfo = await viemClient.readContract({
      address: playerContractAddress,
      abi: PlayerABI,
      functionName: "getCurrentSkin",
      args: [playerId],
    });

    if (!skinInfo || !skinInfo.contractAddress) {
      return null;
    }

    // Now get the skin attributes from the skin contract
    const skinAttributes = await viemClient.readContract({
      address: skinInfo.contractAddress as Address,
      abi: DefaultPlayerSkinNFTABI,
      functionName: "getSkinAttributes",
      args: [BigInt(skinInfo.skinTokenId)],
    });

    // Use attributes to determine equipment, following the pattern in Preloader.ts
    return {
      contractAddress: skinInfo.contractAddress as Address,
      tokenId: Number(skinInfo.tokenId),
      weapon: skinAttributes?.weapon || skinAttributes?.[0] || 0,
      armor: skinAttributes?.armor || skinAttributes?.[1] || 0,
      stance: skinAttributes?.stance || skinAttributes?.[2] || 0,
      // imageUrl would come from metadata
      attributes: skinAttributes?.attributes || [],
    };
  } catch (error) {
    console.error(`Error fetching skin data for player ${playerId}:`, error);
    return null;
  }
}

// Load IPFS metadata for a skin
export async function loadSkinMetadata(ipfsUri: string): Promise<any> {
  try {
    // Convert IPFS URI to HTTPS
    const url = ipfsUri.replace("ipfs://", "https://ipfs.io/ipfs/");
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error("Error loading skin metadata:", error);
    return null;
  }
}
