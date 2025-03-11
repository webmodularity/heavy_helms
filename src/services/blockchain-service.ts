import type {
  ContractAddresses,
  DuelChallenge,
  PlayerSkin,
} from "@/types/blockchain.types";
import type { CalculatedStats, Character } from "@/types/player.types";

// Contract addresses for Shape Mainnet
const contractAddresses: ContractAddresses = {
  player: "0xA909501cEe754bfE0F00DF7c21653957caaAdF03",
  gameEngine: "0xEF804F79014F937973f37Bb80D5dc9Bf16543e1e",
  practiceGame: "0x84c0b41D8792afB4E333E8E849cC9B4ce8CCA1cF",
  duelGame: "0xF2b9189e0Aa4C495220F201459e97D33D637f700",
  playerSkinRegistry: "0x229675571F5F268Df593990dB6fbd2bc29FA9131",
};

// Mock function to get player data - will be replaced with actual contract calls
export async function getPlayerById(
  playerId: string,
): Promise<Character | null> {
  // This is a mock implementation - will be replaced with actual contract calls
  const mockPlayers: Record<string, Character> = {
    "10014": {
      playerId: "10014",
      name: "Ross of the Glade",
      imageUrl:
        "https://ipfs.io/ipfs/bafkreici37rg5rtnr4vsnjeprl5e7khjy2dse7y3ahwivxbsnde6o2x3sy",
      stance: "defensive",
      weapon: "Sword + Shield",
      armor: "Plate",
      strength: 13,
      constitution: 16,
      size: 16,
      agility: 13,
      stamina: 7,
      luck: 7,
    },
    "10009": {
      playerId: "10009",
      name: "Kate of the Ember",
      imageUrl:
        "https://ipfs.io/ipfs/QmaALMyYXwHuwu2EvDrLjkqFK9YigUb6RD9FX7MqVGoDkW",
      stance: "balanced",
      weapon: "Mace + Shield",
      armor: "Chain",
      strength: 14,
      constitution: 12,
      size: 10,
      agility: 14,
      stamina: 14,
      luck: 8,
    },
  };

  return mockPlayers[playerId] || null;
}

// Mock function to get player calculated stats - will be replaced with actual contract calls
export async function getPlayerCalculatedStats(
  playerId: string,
): Promise<CalculatedStats | null> {
  // This is a mock implementation - will be replaced with actual contract calls
  const mockStats: Record<string, CalculatedStats> = {
    "10014": {
      maxHealth: 160,
      damageModifier: 13,
      hitChance: 65,
      blockChance: 40,
      dodgeChance: 20,
      maxEndurance: 70,
      critChance: 7,
      initiative: 13,
      counterChance: 25,
      critMultiplier: 150,
      parryChance: 15,
    },
    "10009": {
      maxHealth: 120,
      damageModifier: 14,
      hitChance: 70,
      blockChance: 30,
      dodgeChance: 35,
      maxEndurance: 140,
      critChance: 8,
      initiative: 14,
      counterChance: 20,
      critMultiplier: 160,
      parryChance: 10,
    },
  };

  return mockStats[playerId] || null;
}

// Mock function to get available skins - will be replaced with actual contract calls
export async function getAvailableSkins(): Promise<PlayerSkin[]> {
  // This is a mock implementation - will be replaced with actual contract calls
  return [
    {
      skinIndex: 1,
      tokenId: 0,
      name: "Knight",
      imageUrl:
        "https://ipfs.io/ipfs/QmXyNMhV8bQFp6wzoVpkz3NUowVwKMBjQBP2cAQKfpBKTV",
      weaponType: "SwordAndShield",
      armorType: "Plate",
      fightingStance: "Defensive",
      isDefault: true,
      isUnlockable: false,
    },
    {
      skinIndex: 2,
      tokenId: 0,
      name: "Berserker",
      imageUrl:
        "https://ipfs.io/ipfs/QmZcH4YvBVVRJtC7ui5vFnmqVtcwbLMfwJweDX7KbDcwww",
      weaponType: "Battleaxe",
      armorType: "Leather",
      fightingStance: "Offensive",
      isDefault: true,
      isUnlockable: false,
    },
  ];
}

// Mock function to simulate a practice fight - will be replaced with actual contract calls
export async function simulatePracticeFight(
  player1Id: string,
  player2Id: string,
): Promise<Uint8Array> {
  // This is a mock implementation - will be replaced with actual contract calls
  // In the real implementation, this would call the PracticeGame contract's play() method
  // and return the combat bytes

  // For now, return a mock byte array
  return new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
}

// Mock function to create a duel challenge - will be replaced with actual contract calls
export async function createDuelChallenge(
  challengerId: string,
  defenderId: string,
  wagerAmount: bigint,
): Promise<DuelChallenge> {
  // This is a mock implementation - will be replaced with actual contract calls
  return {
    challengerId: Number.parseInt(challengerId),
    defenderId: Number.parseInt(defenderId),
    wagerAmount,
    status: "pending",
    timestamp: Date.now(),
  };
}

// Export contract addresses for use in other services
export { contractAddresses };
