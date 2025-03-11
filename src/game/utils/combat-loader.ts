import { viemClient } from "@/config";
import { Alchemy } from "alchemy-sdk";
import { type Address, parseEventLogs } from "viem";
import { toHex, keccak256 as viemKeccak256 } from "viem";
import { mainnet } from "viem/chains";
import {
  DefaultPlayerABI,
  DuelGameABI,
  GameEngineABI,
  MonsterABI,
  PlayerABI,
  PracticeGameABI,
} from "../abi";
import { type AbiType, getAbiForType } from "./abi-utils";
import {
  CombatResultType,
  WinCondition,
  getEnumKeyByValue,
} from "./combat-decoder";
import { getContractInfo, getFighterType } from "./fighter-types";

interface CombatAction {
  p1Result: number;
  p1Damage: number;
  p1StaminaLost: number;
  p2Result: number;
  p2Damage: number;
  p2StaminaLost: number;
}

interface MappedCombatAction {
  p1Result: keyof typeof CombatResultType | undefined;
  p1Damage: number;
  p1StaminaLost: number;
  p2Result: keyof typeof CombatResultType | undefined;
  p2Damage: number;
  p2StaminaLost: number;
}

interface DecodedCombatResult {
  winner: number;
  condition: keyof typeof WinCondition | undefined;
  actions: MappedCombatAction[];
  gameEngineVersion?: number;
}

interface PlayerSkin {
  skinIndex: bigint;
  skinTokenId: bigint;
}

interface PlayerLoadout {
  playerId: bigint;
  skin: PlayerSkin;
}

// Helper function to decode combat bytes into actions
async function decodeCombatBytes(
  bytes: `0x${string}`,
  network: string,
): Promise<DecodedCombatResult> {
  const gameContractAddress = process.env
    .NEXT_PUBLIC_PRACTICE_GAME_CONTRACT_ADDRESS as Address;

  const gameEngineAddress = await viemClient.readContract({
    address: gameContractAddress,
    abi: PracticeGameABI,
    functionName: "gameEngine",
  });

  // Decode combat log using game engine
  const decodedCombat = await viemClient.readContract({
    address: gameEngineAddress,
    abi: GameEngineABI,
    functionName: "decodeCombatLog",
    args: [bytes],
  });

  // Extract actions array - skip gameEngineVersion which is at index 1
  const actions = decodedCombat[3] as CombatAction[];

  // Map the actions with proper enum conversion
  const mappedActions = actions.map((action) => {
    return {
      p1Result: getEnumKeyByValue(
        CombatResultType as unknown as Record<string, number>,
        Number(action.p1Result),
      ),
      p1Damage: Number(action.p1Damage),
      p1StaminaLost: Number(action.p1StaminaLost),
      p2Result: getEnumKeyByValue(
        CombatResultType as unknown as Record<string, number>,
        Number(action.p2Result),
      ),
      p2Damage: Number(action.p2Damage),
      p2StaminaLost: Number(action.p2StaminaLost),
    };
  });

  return {
    winner: Number(decodedCombat[0]),
    condition: getEnumKeyByValue(
      WinCondition as unknown as Record<string, number>,
      Number(decodedCombat[2]),
    ) as keyof typeof WinCondition,
    actions: mappedActions as MappedCombatAction[],
  };
}

export async function loadCombatBytes(
  player1Id: string,
  player2Id: string,
): Promise<DecodedCombatResult> {
  try {
    const networkName = process.env.NEXT_PUBLIC_ALCHEMY_NETWORK?.toLowerCase();
    if (!networkName) throw new Error("Network name not configured");

    const gameContractAddress = process.env
      .NEXT_PUBLIC_PRACTICE_GAME_CONTRACT_ADDRESS as Address;

    // Get fighter types and contract info
    const fighter1Type = getFighterType(player1Id.toString());
    const fighter2Type = getFighterType(player2Id.toString());
    const contract1Info = getContractInfo(fighter1Type);
    const contract2Info = getContractInfo(fighter2Type);

    // Get contract addresses for both fighters
    const [contract1Address, contract2Address] = await Promise.all([
      viemClient.readContract({
        address: gameContractAddress,
        abi: PracticeGameABI,
        functionName: contract1Info.contractFunction,
      }),
      viemClient.readContract({
        address: gameContractAddress,
        abi: PracticeGameABI,
        functionName: contract2Info.contractFunction,
      }),
    ]);

    // Get fighter data for both fighters
    const [player1Data, player2Data] = await Promise.all([
      viemClient.readContract({
        address: contract1Address as Address,
        abi: getAbiForType(contract1Info.abi as AbiType),
        functionName: contract1Info.method,
        args: [BigInt(player1Id)],
      }),
      viemClient.readContract({
        address: contract2Address as Address,
        abi: getAbiForType(contract2Info.abi as AbiType),
        functionName: contract2Info.method,
        args: [BigInt(player2Id)],
      }),
    ]);

    const player1Loadout: PlayerLoadout = {
      playerId: BigInt(player1Id),
      skin: {
        skinIndex: BigInt(player1Data.skin.skinIndex),
        skinTokenId: BigInt(player1Data.skin.skinTokenId),
      },
    };

    const player2Loadout: PlayerLoadout = {
      playerId: BigInt(player2Id),
      skin: {
        skinIndex: BigInt(player2Data.skin.skinIndex),
        skinTokenId: BigInt(player2Data.skin.skinTokenId),
      },
    };

    // Get combat bytes
    const combatBytes = await viemClient.readContract({
      address: gameContractAddress,
      abi: PracticeGameABI,
      functionName: "play",
      args: [player1Loadout, player2Loadout],
    });

    // Get game engine address
    const gameEngineAddress = await viemClient.readContract({
      address: gameContractAddress,
      abi: PracticeGameABI,
      functionName: "gameEngine",
    });

    // Decode using GameEngine
    const decodedCombat = await viemClient.readContract({
      address: gameEngineAddress,
      abi: GameEngineABI,
      functionName: "decodeCombatLog",
      args: [combatBytes],
    });

    // Extract actions array - skip gameEngineVersion which is at index 1
    const actions = decodedCombat[3] as CombatAction[];

    // Map the actions with proper enum conversion
    const mappedActions = actions.map((action) => {
      return {
        p1Result: getEnumKeyByValue(
          CombatResultType as unknown as Record<string, number>,
          Number(action.p1Result),
        ),
        p1Damage: Number(action.p1Damage),
        p1StaminaLost: Number(action.p1StaminaLost),
        p2Result: getEnumKeyByValue(
          CombatResultType as unknown as Record<string, number>,
          Number(action.p2Result),
        ),
        p2Damage: Number(action.p2Damage),
        p2StaminaLost: Number(action.p2StaminaLost),
      };
    });

    const result: DecodedCombatResult = {
      winner: decodedCombat[0] ? Number(player1Id) : Number(player2Id),
      condition: getEnumKeyByValue(
        WinCondition as unknown as Record<string, number>,
        Number(decodedCombat[2]),
      ) as keyof typeof WinCondition,
      actions: mappedActions as MappedCombatAction[],
      gameEngineVersion: Number(decodedCombat[1]),
    };

    // Verify the result has the expected structure
    if (!result.actions || result.actions.length === 0) {
      throw new Error("No actions in processed result");
    }

    return result;
  } catch (error) {
    console.error("Error loading combat bytes:", error);
    throw error;
  }
}

interface DuelResult extends DecodedCombatResult {
  player1Id: number;
  player2Id: number;
  player1Stats: unknown;
  player2Stats: unknown;
  winningPlayerId: bigint;
  blockNumber: string;
}

export async function loadDuelDataFromTx(
  txId: string,
  network: string,
): Promise<DuelResult> {
  try {
    // Get transaction receipt
    const receipt = await viemClient.getTransactionReceipt({
      hash: txId as `0x${string}`,
    });

    // Parse the combat result event logs using DuelGameABI
    const parsedLogs = parseEventLogs({
      abi: DuelGameABI,
      eventName: "CombatResult",
      logs: receipt.logs,
    });

    if (!parsedLogs || parsedLogs.length === 0) {
      throw new Error("Combat result log not found");
    }

    const combatLog = parsedLogs[0];

    const player1Data = combatLog.args.player1Data;
    const player2Data = combatLog.args.player2Data;
    const winningPlayerId = combatLog.args.winningPlayerId;
    const packedResults = combatLog.args.packedResults;

    // Get player contract to decode player data
    const gameContractAddress = process.env
      .NEXT_PUBLIC_DUEL_GAME_CONTRACT_ADDRESS as Address;
    const playerContractAddress = await viemClient.readContract({
      address: gameContractAddress,
      abi: DuelGameABI,
      functionName: "playerContract",
    });

    // Decode player data from indexed parameters
    const [player1Id, player1Stats] = await viemClient.readContract({
      address: playerContractAddress,
      abi: PlayerABI,
      functionName: "decodePlayerData",
      args: [player1Data],
    });
    const [player2Id, player2Stats] = await viemClient.readContract({
      address: playerContractAddress,
      abi: PlayerABI,
      functionName: "decodePlayerData",
      args: [player2Data],
    });

    // Get game engine address
    const gameEngineAddress = await viemClient.readContract({
      address: gameContractAddress,
      abi: DuelGameABI,
      functionName: "gameEngine",
    });

    // Decode combat bytes
    const decodedCombat = await viemClient.readContract({
      address: gameEngineAddress,
      abi: GameEngineABI,
      functionName: "decodeCombatLog",
      args: [packedResults],
    });

    // Extract actions array - skip gameEngineVersion which is at index 1
    const actions = decodedCombat[3] as CombatAction[];

    // Map the actions with proper enum conversion
    const mappedActions = actions.map((action) => {
      return {
        p1Result: getEnumKeyByValue(
          CombatResultType as unknown as Record<string, number>,
          Number(action.p1Result),
        ),
        p1Damage: Number(action.p1Damage),
        p1StaminaLost: Number(action.p1StaminaLost),
        p2Result: getEnumKeyByValue(
          CombatResultType as unknown as Record<string, number>,
          Number(action.p2Result),
        ),
        p2Damage: Number(action.p2Damage),
        p2StaminaLost: Number(action.p2StaminaLost),
      };
    });

    const result: DuelResult = {
      winner: winningPlayerId,
      condition: getEnumKeyByValue(
        WinCondition as unknown as Record<string, number>,
        Number(decodedCombat[2]),
      ) as keyof typeof WinCondition,
      actions: mappedActions as MappedCombatAction[],
      player1Id: Number(player1Id),
      player2Id: Number(player2Id),
      player1Stats,
      player2Stats,
      winningPlayerId,
      blockNumber: receipt.blockNumber.toString(),
      gameEngineVersion: Number(decodedCombat[1]),
    };

    // Verify the result has the expected structure
    if (!result.actions || result.actions.length === 0) {
      throw new Error("No actions in processed result");
    }

    return result;
  } catch (error) {
    console.error("Error loading duel data:", error);
    throw error;
  }
}
