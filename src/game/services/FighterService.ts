import { viemClient } from "@/config";
import type { Address } from "viem";
import { GameEngineABI } from "../abi";
import type { Fighter } from "@/types/fighter-types";
import { fetchAndConvertFighters } from "@/lib/player-api";
import { SUBGRAPH_URL } from "@/config";
import request from "graphql-request";
import { GET_ALL_ACTIVE_PLAYER_IDS_QUERY } from "@/lib/gql-queries";

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class FighterService {
  /**
   * Load a fighter by ID
   */
  static async loadFighterById(fighterId: string): Promise<Fighter> {
    try {
      const fighters = await fetchAndConvertFighters([fighterId]);

      if (!fighters || fighters.length === 0) {
        throw new Error(`Failed to load fighter with ID: ${fighterId}`);
      }

      return fighters[0];
    } catch (error) {
      console.error(`Error loading fighter with ID ${fighterId}:`, error);
      throw error;
    }
  }

  /**
   * Get a random fighter ID from the available fighters
   */
  static async getRandomFighterId(): Promise<string> {
    try {
      const allActivePlayerIds = await request<{
        players: { id: string }[];
        defaultPlayers: { id: string }[];
        monsters: { id: string }[];
      }>(SUBGRAPH_URL, GET_ALL_ACTIVE_PLAYER_IDS_QUERY);

      const allPlayerIds = [
        ...allActivePlayerIds.players.map((player) => player.id),
        ...allActivePlayerIds.defaultPlayers.map((player) => player.id),
        // ...allActivePlayerIds.monsters.map((player) => player.id),
      ];

      if (allPlayerIds.length === 0) {
        throw new Error("No fighters found in the subgraph");
      }

      const randomIndex = Math.floor(Math.random() * allPlayerIds.length);
      return allPlayerIds[randomIndex];
    } catch (error) {
      console.error("Error getting random fighter ID:", error);
      throw error;
    }
  }

  /**
   * Calculate stats for a fighter
   */
  static async calculateFighterStats(fighters: Fighter[]): Promise<void> {
    try {
      if (!fighters || fighters.length === 0) {
        return;
      }

      // Get game engine address
      const gameEngineAddress = process.env
        .NEXT_PUBLIC_GAME_ENGINE_CONTRACT_ADDRESS as Address;

      // Prepare contracts array for multicall
      const contracts = fighters.map((fighter) => ({
        address: gameEngineAddress,
        abi: GameEngineABI,
        functionName: "calculateStats",
        args: [
          {
            weapon: fighter.currentSkin.weapon,
            armor: fighter.currentSkin.armor,
            stance: fighter.stance,
            attributes: {
              strength: fighter.attributes.strength,
              constitution: fighter.attributes.constitution,
              size: fighter.attributes.size,
              agility: fighter.attributes.agility,
              stamina: fighter.attributes.stamina,
              luck: fighter.attributes.luck,
            },
          },
        ],
      }));

      // @ts-ignore - Complex type instantiation that cannot be resolved
      const results = await viemClient.multicall({ contracts });

      // Process results
      fighters.forEach((fighter, index) => {
        const result = results[index];

        if (result.status === "failure") {
          console.error(
            `Failed to calculate stats for fighter ${fighter.id}:`,
            result.error,
          );
          return;
        }

        try {
          // Use type assertion with validation
          const stats = result.result as unknown as FighterStats;

          // Update fighter with calculated stats
          fighter.calculatedStats = {
            maxHealth: Number(stats.maxHealth),
            maxEndurance: Number(stats.maxEndurance),
            damageModifier: Number(stats.damageModifier),
            hitChance: Number(stats.hitChance),
            blockChance: Number(stats.blockChance),
            dodgeChance: Number(stats.dodgeChance),
            critChance: Number(stats.critChance),
            initiative: Number(stats.initiative),
            counterChance: Number(stats.counterChance),
            riposteChance: Number(stats.riposteChance),
            critMultiplier: Number(stats.critMultiplier),
            parryChance: Number(stats.parryChance),
            baseSurvivalRate: Number(stats.baseSurvivalRate),
          };

          // Initialize fighter state
          fighter.currentState = {
            currentHealth: fighter.calculatedStats.maxHealth,
            currentEndurance: fighter.calculatedStats.maxEndurance,
          };
        } catch (error) {
          console.error(
            `Error processing stats for fighter ${fighter.id}:`,
            error,
          );
        }
      });
    } catch (error) {
      console.error("Error calculating fighter stats:", error);
      throw error;
    }
  }

  /**
   * Get abbreviated weapon name for display
   */
  static getAbbreviatedWeaponName(weapon: string): string {
    const abbreviations: Record<string, string> = {
      Quarterstaff: "Quarterstaff",
      Greatsword: "Greatsword",
      ShortSword: "S.Sword",
      BattleAxe: "B.Axe",
      Warhammer: "W.Hammer",
      SwordAndShield: "Sword",
      MaceAndShield: "Mace",
      RapierAndShield: "Rapier",
    };
    return abbreviations[weapon] || weapon;
  }
}

// Add this interface at the top of the file
interface FighterStats {
  maxHealth: bigint;
  maxEndurance: bigint;
  damageModifier: bigint;
  hitChance: bigint;
  blockChance: bigint;
  dodgeChance: bigint;
  critChance: bigint;
  initiative: bigint;
  counterChance: bigint;
  riposteChance: bigint;
  critMultiplier: bigint;
  parryChance: bigint;
  baseSurvivalRate: bigint;
}
