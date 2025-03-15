import { viemClient } from "@/config";
import type { Address } from "viem";
import { GameEngineABI, PracticeGameABI } from "../abi";
import { getEnumKeyByValue } from "./enum-utils";
import { CombatResultType, WinCondition } from "@/types/game.types";
import type { DecodedCombatResult, CombatAction } from "@/types/game.types";
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
