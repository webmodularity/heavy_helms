import { viemClient } from "@/config";
import { Alchemy, type AlchemySettings, type Network } from "alchemy-sdk";
import { type Address, toHex, keccak256 as viemKeccak256 } from "viem";
import {
  DefaultPlayerABI,
  ERC721ABI,
  GameEngineABI,
  MonsterABI,
  PlayerABI,
  PlayerNameRegistryABI,
  PracticeGameABI,
  SkinRegistryABI,
} from "../abi";
import { type AbiType, getAbiForType } from "./abi-utils";
import { FighterType, getContractInfo, getFighterType } from "./fighter-types";

interface PlayerAttributes {
  strength: number;
  constitution: number;
  size: number;
  agility: number;
  stamina: number;
  luck: number;
}

interface PlayerSkin {
  skinIndex: number;
  skinTokenId: number;
  weapon?: number;
  armor?: number;
  stance?: number;
}

interface PlayerStats {
  attributes: PlayerAttributes;
  skin: PlayerSkin;
  firstNameIndex?: number;
  surnameIndex?: number;
  wins?: number;
  losses?: number;
  kills?: number;
  tier?: number;
}

interface FighterStats {
  weapon: number;
  armor: number;
  stance: number;
  attributes: PlayerAttributes;
}

interface CalculatedStats {
  maxHealth: bigint;
  maxEndurance: bigint;
  damageModifier: bigint;
  hitChance: bigint;
  blockChance: bigint;
  dodgeChance: bigint;
  critChance: bigint;
  initiative: bigint;
  counterChance: bigint;
  critMultiplier: bigint;
  parryChance: bigint;
  baseSurvivalRate: bigint;
}

interface NFTMetadata {
  image_spritesheet?: string;
  [key: string]: unknown;
}

interface CharacterData {
  stats: {
    strength: number;
    constitution: number;
    size: number;
    agility: number;
    stamina: number;
    luck: number;
    skinIndex: number;
    skinTokenId: number;
    firstNameIndex: number;
    surnameIndex: number;
    wins: number;
    losses: number;
    kills: number;
    tier: number;
    maxHealth: number;
    maxEndurance: number;
    damageModifier: number;
    hitChance: number;
    blockChance: number;
    dodgeChance: number;
    critChance: number;
    initiative: number;
    counterChance: number;
    critMultiplier: number;
    parryChance: number;
    baseSurvivalRate: number;
  };
  nftContractAddress: Address;
  spritesheetUrl: string;
  jsonData: NFTMetadata;
  name: {
    firstName: string;
    surname: string;
    fullName: string;
  };
}

const settings: AlchemySettings = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY ?? "",
  network: (process.env.NEXT_PUBLIC_ALCHEMY_NETWORK ?? "") as Network,
};

const alchemy = new Alchemy(settings);

export async function loadCharacterData(
  playerId: number,
): Promise<CharacterData> {
  try {
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    const networkName = getAlchemyNetwork(settings.network!);

    // Get fighter type and contract info
    const fighterType = getFighterType(playerId.toString());
    const contractInfo = getContractInfo(fighterType);

    console.log("Contract info:", contractInfo);

    // Get contract address
    const contractAddress = (await viemClient.readContract({
      address: process.env
        .NEXT_PUBLIC_PRACTICE_GAME_CONTRACT_ADDRESS as Address,
      abi: PracticeGameABI,
      functionName: contractInfo.contractFunction,
    })) as Address;

    console.log("Contract address:", contractAddress);

    console.log("Player data being loaded for: ", playerId, typeof playerId);
    // Get fighter stats
    try {
      const playerStats = (await viemClient.readContract({
        address: contractAddress,
        abi: getAbiForType(contractInfo.abi as AbiType),
        functionName: contractInfo.method,
        args: [BigInt(playerId)],
      })) as PlayerStats;

      console.log("Player stats:", playerStats);

      if (!playerStats) {
        throw new Error(`No fighter data found for ID ${playerId}`);
      }

      // Get name registry address and fighter name - only for Players
      const playerName: [string, string] = ["Unknown", "Unknown"];
      if (
        fighterType === FighterType.Player ||
        fighterType === FighterType.DefaultPlayer
      ) {
        const nameRegistryAddress = (await viemClient.readContract({
          address: contractAddress,
          abi: PlayerABI,
          functionName: "nameRegistry",
        })) as Address;

        console.log("Name registry address:", nameRegistryAddress);

        const names = (await viemClient.readContract({
          address: nameRegistryAddress,
          abi: PlayerNameRegistryABI,
          functionName: "getFullName",
          args: [
            playerStats.firstNameIndex ?? 0,
            playerStats.surnameIndex ?? 0,
          ],
        })) as [string, string];

        playerName[0] = names[0];
        playerName[1] = names[1];
        console.log("names:", names);
      }

      console.log("Player name:", playerName);

      // Get GameEngine address from PracticeGame contract
      const gameEngineAddress = (await viemClient.readContract({
        address: process.env
          .NEXT_PUBLIC_PRACTICE_GAME_CONTRACT_ADDRESS as Address,
        abi: PracticeGameABI,
        functionName: "gameEngine",
      })) as Address;

      console.log("Game engine address:", gameEngineAddress);

      // Create FighterStats structure for GameEngine calculation
      const fighterStats: FighterStats = {
        weapon: Number(playerStats.skin.weapon ?? 0),
        armor: Number(playerStats.skin.armor ?? 0),
        stance: Number(playerStats.skin.stance ?? 0),
        attributes: {
          strength: Number(playerStats.attributes.strength),
          constitution: Number(playerStats.attributes.constitution),
          size: Number(playerStats.attributes.size),
          agility: Number(playerStats.attributes.agility),
          stamina: Number(playerStats.attributes.stamina),
          luck: Number(playerStats.attributes.luck),
        },
      };

      // Calculate derived stats using GameEngine contract
      const calculatedStats = (await viemClient.readContract({
        address: gameEngineAddress,
        abi: GameEngineABI,
        functionName: "calculateStats",
        args: [fighterStats],
      })) as CalculatedStats;

      const stats = {
        // Base attributes
        strength: Number(playerStats.attributes.strength),
        constitution: Number(playerStats.attributes.constitution),
        size: Number(playerStats.attributes.size),
        agility: Number(playerStats.attributes.agility),
        stamina: Number(playerStats.attributes.stamina),
        luck: Number(playerStats.attributes.luck),
        // Skin info
        skinIndex: Number(playerStats.skin.skinIndex),
        skinTokenId: Number(playerStats.skin.skinTokenId),
        // Optional stats with defaults
        firstNameIndex: Number(playerStats.firstNameIndex ?? 0),
        surnameIndex: Number(playerStats.surnameIndex ?? 0),
        wins: Number(playerStats.wins ?? 0),
        losses: Number(playerStats.losses ?? 0),
        kills: Number(playerStats.kills ?? 0),
        // Monster-specific stat
        tier:
          fighterType === FighterType.Monster ? Number(playerStats.tier) : 0,
        // Calculated stats
        maxHealth: Number(calculatedStats.maxHealth),
        maxEndurance: Number(calculatedStats.maxEndurance),
        damageModifier: Number(calculatedStats.damageModifier),
        hitChance: Number(calculatedStats.hitChance),
        blockChance: Number(calculatedStats.blockChance),
        dodgeChance: Number(calculatedStats.dodgeChance),
        critChance: Number(calculatedStats.critChance),
        initiative: Number(calculatedStats.initiative),
        counterChance: Number(calculatedStats.counterChance),
        critMultiplier: Number(calculatedStats.critMultiplier),
        parryChance: Number(calculatedStats.parryChance),
        baseSurvivalRate: Number(calculatedStats.baseSurvivalRate),
      };

      // Update skin registry call with new address
      const skinRegistryAddress = (await viemClient.readContract({
        address: contractAddress,
        abi: PlayerABI,
        functionName: "skinRegistry",
      })) as Address;

      console.log("Skin registry address:", skinRegistryAddress);

      // Get skin info
      const skinInfo = await viemClient.readContract({
        address: skinRegistryAddress,
        abi: SkinRegistryABI,
        functionName: "getSkin",
        args: [stats.skinIndex],
      });

      // Get NFT metadata
      const tokenURI = await viemClient.readContract({
        address: skinInfo.contractAddress as Address,
        abi: ERC721ABI,
        functionName: "tokenURI",
        args: [BigInt(stats.skinTokenId)],
      });

      let metadata: NFTMetadata;
      if (tokenURI.startsWith("ipfs://")) {
        const ipfsHash = tokenURI.replace("ipfs://", "");
        const ipfsUrl = `https://ipfs.io/ipfs/${ipfsHash}`;
        const response = await fetch(ipfsUrl);
        const rawText = await response.text();
        metadata = JSON.parse(rawText);

        const spritesheetUrl = metadata.image_spritesheet?.replace(
          "ipfs://",
          "https://ipfs.io/ipfs/",
        );

        return {
          stats,
          nftContractAddress: skinInfo.contractAddress as Address,
          spritesheetUrl: spritesheetUrl ?? "",
          jsonData: metadata,
          name: {
            firstName: playerName[0],
            surname: playerName[1],
            fullName: `${playerName[0]} ${playerName[1]}`,
          },
        };
      }

      const response = await fetch(tokenURI);
      const rawText = await response.text();
      metadata = JSON.parse(rawText);

      // Convert IPFS spritesheet URL to HTTP URL if needed
      const spritesheetUrl = metadata.image_spritesheet?.replace(
        "ipfs://",
        "https://ipfs.io/ipfs/",
      );

      return {
        stats,
        nftContractAddress: skinInfo.contractAddress as Address,
        spritesheetUrl: spritesheetUrl ?? "",
        jsonData: metadata,
        name: {
          firstName: playerName[0],
          surname: playerName[1],
          fullName: `${playerName[0]} ${playerName[1]}`,
        },
      };
    } catch (error) {
      console.error("Error calculating stats:", {
        error: error instanceof Error ? error.message : "Unknown error",
        cause: error instanceof Error ? error.cause : undefined,
        data:
          error instanceof Error && "data" in error ? error.data : undefined,
      });
      throw new Error(
        `Failed to calculate player stats: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  } catch (error) {
    console.error("Error loading character data:", {
      playerId,
      error: error instanceof Error ? error.message : "Unknown error",
      networkName: settings.network,
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw new Error(
      `Failed to load character data for player ${playerId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
}

function getAlchemyNetwork(networkName: Network): string {
  return networkName;
}
