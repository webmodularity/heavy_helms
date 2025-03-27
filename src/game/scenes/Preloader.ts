import { SUBGRAPH_URL, viemClient } from "@/config";
import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import {
  fetchAndConvertFighters,
  buildRawFighterFromDecodedData,
  convertRawFighterToFighter,
} from "../../lib/player-api";
import type { PlayerLoadout } from "@/types/player.types";
import { GameEngineABI, PracticeGameABI } from "../abi";
import type { Address } from "viem";
import { getEnumKeyByValue } from "../utils/enum-utils";
import { CombatResultType, WinCondition } from "@/types/game.types";
import type {
  DecodedCombatResult,
  CombatAction,
  RawCombatAction,
  SceneData,
} from "@/types/game.types";
import type { Fighter } from "@/types/fighter-types";
import request from "graphql-request";
import { GET_ALL_ACTIVE_PLAYER_IDS_QUERY } from "@/lib/gql-queries";
import { fetchRawCombatResultByTx } from "@/lib/combat-api";
import type { RawCombatResult } from "@/types/game.types";
import { PlayerABI } from "../abi";
import type { RawDecodedPlayerData } from "@/types/player.types";

export class Preloader extends Scene {
  // URL parameters
  private txId?: string;
  private network: string;
  private blockNumber: string;
  private player1Id?: string;
  private player2Id?: string;

  // Player data
  private player1: Fighter;
  private player2: Fighter;
  // Game data
  private decodedCombatBytes: DecodedCombatResult;
  private gameEngineAddress: Address;

  // Loading state
  private loadingBar?: Phaser.GameObjects.Graphics;

  constructor() {
    super("Preloader");
  }

  init() {
    // Parse URL parameters
    const params = new URLSearchParams(window.location.search);

    const txIdParam = params.get("txId");
    this.txId = txIdParam || undefined;

    this.network =
      params.get("network") ||
      process.env.NEXT_PUBLIC_ALCHEMY_NETWORK ||
      "mainnet";

    this.blockNumber = params.get("blockNumber") || "123456";
    

    // Only set player IDs if no txId (practice mode) and if provided in URL
    if (!this.txId) {
      const p1Id = params.get("player1Id");
      // const p2Id = params.get("player2Id");

      // Only set player IDs if both are valid numbers
      if (
        p1Id &&
        // p2Id &&
        !Number.isNaN(Number(p1Id))
        // !Number.isNaN(Number(p2Id))
      ) {
        this.player1Id = p1Id;
        // this.player2Id = p2Id;
      }

      // Listen for player IDs from EventBus (from React)
      // EventBus.once(
      //   "set-player-ids",
      //   (data: { player1Id: string; player2Id: string }) => {
      //     if (data.player1Id && data.player2Id) {
      //       this.player1Id = data.player1Id;
      //       this.player2Id = data.player2Id;
      //     }
      //   },
      // );
    }
    // console.log("this.game", this.game);
    // this.player1Id = this.game.registry.get("player1Id");
    // Set up the loading UI
    this.createLoadingUI();
  }

  createLoadingUI() {
    try {
      // Get the camera dimensions
      const width = this.cameras.main.width;
      const height = this.cameras.main.height;

      // Add the background image and properly scale it to fit the screen
      const background = this.add.image(
        width / 2,
        height / 2,
        "loading-background",
      );

      // Set the origin to center
      background.setOrigin(0.5, 0.5);

      // Scale the image to cover the entire screen while maintaining aspect ratio
      const scaleX = width / background.width;
      const scaleY = height / background.height;
      const scale = Math.max(scaleX, scaleY);
      background.setScale(scale);

      // Create a semi-transparent dark rectangle for the loading bar background
      const barY = height * 0.75;
      const barWidth = width * 0.6;
      const barHeight = 30;

      // Add a white border around the loading bar
      this.add
        .rectangle(width / 2, barY, barWidth + 4, barHeight + 4, 0xffffff)
        .setOrigin(0.5);

      // Add the dark background for the loading bar
      this.add
        .rectangle(width / 2, barY, barWidth, barHeight, 0x000000, 0.7)
        .setOrigin(0.5);

      // Create a progress bar
      const progressBar = this.add.graphics();
      this.loadingBar = progressBar;

      // Update loading bar based on progress
      this.load.on("progress", (progress: number) => {
        if (this.loadingBar) {
          this.loadingBar.clear();

          // Draw the blue progress bar
          this.loadingBar.fillStyle(0x0099ff);

          // Calculate the filled portion of the bar
          const fillWidth = (barWidth - 4) * progress;
          const x = width / 2 - barWidth / 2 + 2;
          const y = barY - barHeight / 2 + 2;

          this.loadingBar.fillRect(x, y, fillWidth, barHeight - 4);
        }
      });

      // Add a status text
      const statusText = this.add
        .text(width / 2, barY + barHeight + 20, "Loading game assets...", {
          fontSize: "18px",
          fontFamily: "Arial",
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 3,
        })
        .setOrigin(0.5);

      // Update status text for different loading phases
      this.events.on("status-update", (message: string) => {
        statusText.setText(message);
      });
    } catch (error) {
      console.error("Error creating loading UI:", error);
    }
  }

  preload() {
    // Set up loading events
    this.load.on("complete", this.onLoadComplete, this);

    // Emit status update
    this.events.emit("status-update", "Loading game assets...");

    // Queue all initial assets
    this.loadBackgroundAssets();
    this.loadUIAssets();
    this.load.audio("fight-music", "/audio/bkg/bg.ogg");

    // Start loading the queued assets
    this.load.start();
  }

  private async onLoadComplete() {
    try {
      // Use cached version for now
      this.gameEngineAddress = process.env
        .NEXT_PUBLIC_GAME_ENGINE_CONTRACT_ADDRESS as Address;

      if (this.txId) {
        // Combat Results Mode
        this.events.emit("status-update", "Loading combat results...");
        console.log("tx id", this.txId);
        await this.loadFromCombatResults(this.txId);
      } else {
        // Practice Mode
        if (!this.player1Id) {
          console.error("FATAL ERROR: Missing player IDs");
          throw new Error("FATAL: Both player IDs are required");
        }

        // Practice Mode - load players
        this.events.emit("status-update", "Loading fighter data...");
        await this.loadOpponentById(this.player1Id);
        // Get block number
        await this.fetchBlockNumber();

        const player1Loadout: PlayerLoadout = {
          playerId: Number(this.player1.id),
          skin: {
            skinIndex: Number(this.player1.currentSkin.collection.id),
            skinTokenId: Number(this.player1.currentSkin.tokenId),
          },
        };
        const player2Loadout: PlayerLoadout = {
          playerId: Number(this.player2.id),
          skin: {
            skinIndex: Number(this.player2.currentSkin.collection.id),
            skinTokenId: Number(this.player2.currentSkin.tokenId),
          },
        };

        // Get combat bytes
        this.decodedCombatBytes = await this.loadCombatBytesPracticeMode(
          player1Loadout,
          player2Loadout,
        );
      }
      console.log("this.decodedCombatBytes", this.decodedCombatBytes);
      // Enforce that we have both player IDs
      if (!this.player1Id) {
        console.error("FATAL ERROR: Missing player ID");
        throw new Error("FATAL: Player ID is required");
      }

      this.gameEngineAddress = await viemClient.readContract({
        address: process.env
          .NEXT_PUBLIC_PRACTICE_GAME_CONTRACT_ADDRESS as Address,
        abi: PracticeGameABI,
        functionName: "gameEngine",
      });

      // Practice Mode - load oppponent
      if (!this.txId) {
        this.events.emit("status-update", "Loading fighter data...");
        const randomOpponentId = await this.getRandomOpponentId();
        await this.loadOpponentById(randomOpponentId);
      }

      // Enforce that both players were loaded successfully
      if (!this.player1 || !this.player2) {
        console.error("FATAL ERROR: Failed to load player data");
        throw new Error("FATAL: Player data could not be loaded");
      }

      // Load player spritesheets
      this.loadFighterSpritesheet(this.player1);
      this.loadFighterSpritesheet(this.player2);

      // Load CalculatedStats + Initial PlayerState
      await this.loadPlayerStates();

      // Remove the complete listener to avoid duplicate calls
      this.load.off("complete", this.onLoadComplete, this);
      // Start loading the queued player assets
      this.load.start();
      // Add a new one-time listener for the player assets
      this.load.once("complete", () => {
        // Start the next scene
        this.startFightScene();
      });
    } catch (error) {
      console.error("FATAL ERROR: Failed to load player data:", error);
      throw new Error("FATAL: Cannot load players");
    }
  }

  private async loadPlayerStates() {
    try {
      // Create FighterStats objects for both fighters
      const fighter1Stats = {
        weapon: this.player1.currentSkin.weapon,
        armor: this.player1.currentSkin.armor,
        stance: this.player1.currentSkin.stance,
        attributes: {
          strength: this.player1.attributes.strength,
          constitution: this.player1.attributes.constitution,
          size: this.player1.attributes.size,
          agility: this.player1.attributes.agility,
          stamina: this.player1.attributes.stamina,
          luck: this.player1.attributes.luck,
        },
      };

      const fighter2Stats = {
        weapon: this.player2.currentSkin.weapon,
        armor: this.player2.currentSkin.armor,
        stance: this.player2.currentSkin.stance,
        attributes: {
          strength: this.player2.attributes.strength,
          constitution: this.player2.attributes.constitution,
          size: this.player2.attributes.size,
          agility: this.player2.attributes.agility,
          stamina: this.player2.attributes.stamina,
          luck: this.player2.attributes.luck,
        },
      };

      // Make multicall to get calculated stats for both fighters
      const results = await viemClient.multicall({
        contracts: [
          {
            address: this.gameEngineAddress,
            abi: GameEngineABI,
            functionName: "calculateStats",
            args: [fighter1Stats],
          },
          {
            address: this.gameEngineAddress,
            abi: GameEngineABI,
            functionName: "calculateStats",
            args: [fighter2Stats],
          },
        ],
      });

      // Check for errors and extract results
      if (results[0].status === "failure") {
        throw results[0].error;
      }
      if (results[1].status === "failure") {
        throw results[1].error;
      }

      const player1Stats = results[0].result;
      const player2Stats = results[1].result;

      // Assign calculated stats to player objects
      this.player1.calculatedStats = {
        maxHealth: Number(player1Stats.maxHealth),
        maxEndurance: Number(player1Stats.maxEndurance),
        damageModifier: Number(player1Stats.damageModifier),
        hitChance: Number(player1Stats.hitChance),
        blockChance: Number(player1Stats.blockChance),
        dodgeChance: Number(player1Stats.dodgeChance),
        critChance: Number(player1Stats.critChance),
        initiative: Number(player1Stats.initiative),
        counterChance: Number(player1Stats.counterChance),
        critMultiplier: Number(player1Stats.critMultiplier),
        parryChance: Number(player1Stats.parryChance),
        baseSurvivalRate: Number(player1Stats.baseSurvivalRate),
      };

      this.player2.calculatedStats = {
        maxHealth: Number(player2Stats.maxHealth),
        maxEndurance: Number(player2Stats.maxEndurance),
        damageModifier: Number(player2Stats.damageModifier),
        hitChance: Number(player2Stats.hitChance),
        blockChance: Number(player2Stats.blockChance),
        dodgeChance: Number(player2Stats.dodgeChance),
        critChance: Number(player2Stats.critChance),
        initiative: Number(player2Stats.initiative),
        counterChance: Number(player2Stats.counterChance),
        critMultiplier: Number(player2Stats.critMultiplier),
        parryChance: Number(player2Stats.parryChance),
        baseSurvivalRate: Number(player2Stats.baseSurvivalRate),
      };

      // Initialize player states with full health and endurance
      this.player1.currentState = {
        currentHealth: this.player1.calculatedStats.maxHealth,
        currentEndurance: this.player1.calculatedStats.maxEndurance,
      };

      this.player2.currentState = {
        currentHealth: this.player2.calculatedStats.maxHealth,
        currentEndurance: this.player2.calculatedStats.maxEndurance,
      };
    } catch (error) {
      console.error("Error loading fighter states:", error);
      throw error;
    }
  }

  private loadFighterSpritesheet(fighter: Fighter) {
    // Keep using player prefix for backward compatibility
    const spritesheetKey = `fighter${fighter.id}-spritesheet`;

    this.load.atlas(spritesheetKey, fighter.currentSkin.spritesheet.image, {
      frames: fighter.currentSkin.spritesheet.frames,
    });
  }

  private startFightScene() {
    try {
      const sceneData: SceneData = {
        player1: this.player1,
        player2: this.player2,
        network: this.network,
        blockNumber: this.blockNumber,
        txId: this.txId || "Practice",
        decodedCombatBytes: this.decodedCombatBytes,
      };

      this.scene.start("FightScene", sceneData);
      // Let React know that the scene is ready
      EventBus.emit("current-scene-ready", this);
    } catch (error) {
      console.error("Error starting fight:", error);
      const errorText = this.add
        .text(512, 450, "Error starting game. Please try again.", {
          fontSize: "18px",
          color: "#ff0000",
        })
        .setOrigin(0.5);
    }
  }

  loadBackgroundAssets() {
    const paths = {
      sky: "/backgrounds/forest2/Sky.png",
      "bg-decor": "/backgrounds/forest2/BG.png",
      "middle-decor": "/backgrounds/forest2/Middle.png",
      "ground-02": "/backgrounds/forest2/Ground_02.png",
      "ground-01": "/backgrounds/forest2/Ground_01.png",
      foreground: "/backgrounds/forest2/Foreground.png",
    };

    for (const [key, path] of Object.entries(paths)) {
      this.load.image(key, path);
    }
  }

  loadUIAssets() {
    const uiElements = [
      { key: "bar-bg", path: "/ui/load_bar_bg.png" },
      { key: "bar-fill-1", path: "/ui/load_bar_1.png" },
      { key: "bar-fill-2", path: "/ui/load_bar_2.png" },
      { key: "bar-fill-1-right", path: "/ui/load_bar_1_right.png" },
      { key: "bar-fill-2-right", path: "/ui/load_bar_2_right.png" },
      { key: "bar-dark", path: "/ui/dark.png" },
    ];

    for (const asset of uiElements) {
      this.load.image(asset.key, asset.path);
    }
  }

  // async loadDuelData() {
  //   try {
  //     if (!this.txId) {
  //       return null;
  //     }

  //     const duelData = await loadDuelDataFromTx(this.txId, this.network);

  //     if (!duelData) {
  //       return null;
  //     }

  //     this.player1Id = String(duelData.player1Id);
  //     this.player2Id = String(duelData.player2Id);

  //     this.combatBytesFromTx = {
  //       ...duelData,
  //       player1Id:
  //         typeof duelData.player1Id === "bigint"
  //           ? duelData.player1Id
  //           : BigInt(duelData.player1Id),
  //       player2Id:
  //         typeof duelData.player2Id === "bigint"
  //           ? duelData.player2Id
  //           : BigInt(duelData.player2Id),
  //       winningPlayerId:
  //         typeof duelData.winningPlayerId === "bigint"
  //           ? duelData.winningPlayerId
  //           : BigInt(duelData.winningPlayerId || 0),
  //     };

  //     this.blockNumber = duelData.blockNumber;

  //     return duelData;
  //   } catch (error) {
  //     console.error("Error loading duel data:", error);
  //     throw error;
  //   }
  // }

  async getRandomOpponentId() {
    const allActivePlayerIds = await request<{
      players: { id: string }[];
      defaultPlayers: { id: string }[];
      monsters: { id: string }[];
    }>(SUBGRAPH_URL, GET_ALL_ACTIVE_PLAYER_IDS_QUERY);

    const allPlayerIds = [
      ...allActivePlayerIds.players.map((player) => player.id),
      ...allActivePlayerIds.defaultPlayers.map((player) => player.id),
      ...allActivePlayerIds.monsters.map((player) => player.id),
    ];

    const randomIndex = Math.floor(Math.random() * allPlayerIds.length);
    const randomId = allPlayerIds[randomIndex];
    console.log("Random ID:", randomId);
    return randomId;
  }

  async loadOpponentById(opponentId: string) {
    try {
      // Note: We already have player1 from the registry
      const fighters: Fighter[] = await fetchAndConvertFighters([opponentId]);

      // Check if we got valid fighter data
      if (!fighters) {
        console.error("Invalid fighter data returned:", fighters);
        throw new Error("Invalid fighter data returned from API");
      }

      // Ensure fighters are assigned correctly based on their IDs
      // instead of the order they come back from the API
      this.player1 = this.game.registry.get("player1");
      this.player2 = fighters[0];

      return fighters;
    } catch (error) {
      console.error("FATAL ERROR: Failed to load fighter data:", error);
      throw new Error("FATAL: Cannot load fighters");
    }
  }

  async fetchBlockNumber() {
    try {
      const block = await viemClient.getBlockNumber();
      this.blockNumber = block.toString();
    } catch (error) {
      this.blockNumber = "Unknown";
    }
  }

  abbreviateWeaponName(weapon: string): string {
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

  async loadCombatBytesPracticeMode(
    player1Loadout: PlayerLoadout,
    player2Loadout: PlayerLoadout,
  ): Promise<DecodedCombatResult> {
    try {
      const combatBytes = await viemClient.readContract({
        address: process.env
          .NEXT_PUBLIC_PRACTICE_GAME_CONTRACT_ADDRESS as Address,
        abi: PracticeGameABI,
        functionName: "play",
        // @ts-ignore - Using the exact same structure as before, but TypeScript is having issues
        args: [player1Loadout, player2Loadout],
      });

      return await this.decodeCombatBytes(
        combatBytes,
        this.gameEngineAddress,
        player1Loadout.playerId,
        player2Loadout.playerId,
      );
    } catch (error) {
      console.error("Error loading combat bytes:", error);
      throw error;
    }
  }

  async decodeCombatBytes(
    combatBytes: `0x${string}`,
    gameEngineAddress: Address,
    player1Id: number,
    player2Id: number,
  ): Promise<DecodedCombatResult> {
    console.log({ combatBytes, gameEngineAddress, player1Id, player2Id });
    // TODO: The decoding should be done locally in the future
    const decodedCombat = await viemClient.readContract({
      address: gameEngineAddress,
      abi: GameEngineABI,
      functionName: "decodeCombatLog",
      args: [combatBytes],
    });

    // Extract actions array from decodedCombat
    const rawActions = decodedCombat[3] as RawCombatAction[];

    // Map the actions with proper enum conversion
    const actions = rawActions.map((action) => ({
      p1Result: getEnumKeyByValue(CombatResultType, Number(action.p1Result)),
      p1Damage: Number(action.p1Damage),
      p1StaminaLost: Number(action.p1StaminaLost),
      p2Result: getEnumKeyByValue(CombatResultType, Number(action.p2Result)),
      p2Damage: Number(action.p2Damage),
      p2StaminaLost: Number(action.p2StaminaLost),
    })) as CombatAction[];

    const result: DecodedCombatResult = {
      winner: decodedCombat[0] ? player1Id : player2Id,
      condition: getEnumKeyByValue(
        WinCondition,
        Number(decodedCombat[2]),
      ) as keyof typeof WinCondition,
      actions: actions,
      gameEngineVersion: Number(decodedCombat[1]),
    };

    // Verify the result has the expected structure
    if (!result.actions || result.actions.length === 0) {
      throw new Error("No actions in processed result");
    }

    return result;
  }

  async loadFromCombatResults(txId: string) {
    try {
      // Fetch combat results from dedicated API layer with new method name
      const combatResult = await fetchRawCombatResultByTx(txId);
      console.log("combat result", combatResult);
      // Decode the player data
      const decodedPlayerData = await this.decodeCombatPlayerData(
        combatResult.player1Data,
        combatResult.player2Data,
      );
      console.log("decoded player data", decodedPlayerData);
      // Decode the combat bytes
      this.decodedCombatBytes = await this.decodeCombatBytes(
        combatResult.packedResults as `0x${string}`,
        this.gameEngineAddress,
        Number(decodedPlayerData.player1.id),
        Number(decodedPlayerData.player2.id),
      );
      this.player1Id = String(decodedPlayerData.player1.id);
      this.player2Id = String(decodedPlayerData.player2.id);
      console.log("decoded combat bytes", this.decodedCombatBytes);
      // Store block timestamp
      this.blockNumber = combatResult.blockTimestamp;
      console.log("block number", this.blockNumber);
      // Build players from decoded player data
      const rawFighter1Data = await buildRawFighterFromDecodedData(
        decodedPlayerData.player1,
      );
      console.log("raw fighter 1 data", rawFighter1Data);
      const rawFighter2Data = await buildRawFighterFromDecodedData(
        decodedPlayerData.player2,
      );
      console.log("raw fighter 2 data", rawFighter2Data);
      this.player1 = await convertRawFighterToFighter(rawFighter1Data);
      console.log("player 1", this.player1);
      this.player2 = await convertRawFighterToFighter(rawFighter2Data);
    } catch (error) {
      console.error("Error loading combat results:", error);
      throw error;
    }
  }

  async decodeCombatPlayerData(
    player1Data: string,
    player2Data: string,
  ): Promise<{
    player1: RawDecodedPlayerData;
    player2: RawDecodedPlayerData;
  }> {
    try {
      // Check if we have valid data
      if (!player1Data || !player2Data) {
        throw new Error("Missing player data");
      }

      // Ensure data is in the correct bytes32 format
      const formatHexData = (data: string): `0x${string}` => {
        // If it doesn't start with 0x, add it
        const hexData = data.startsWith("0x") ? data : `0x${data}`;
        // Ensure it's the correct length for bytes32 (0x + 64 hex chars)
        if (hexData.length !== 66) {
          console.warn(
            `Data length is ${hexData.length}, expected 66 chars for bytes32`,
          );
        }
        return hexData as `0x${string}`;
      };

      // Get player contract address
      const playerContractAddress = process.env
        .NEXT_PUBLIC_PLAYER_CONTRACT_ADDRESS as Address;

      // Make multicall to decode both players' data
      const results = await viemClient.multicall({
        contracts: [
          {
            address: playerContractAddress,
            abi: PlayerABI,
            functionName: "decodePlayerData",
            args: [formatHexData(player1Data)],
          },
          {
            address: playerContractAddress,
            abi: PlayerABI,
            functionName: "decodePlayerData",
            args: [formatHexData(player2Data)],
          },
        ],
      });

      // Check for errors
      if (results[0].status === "failure") {
        throw results[0].error;
      }
      if (results[1].status === "failure") {
        throw results[1].error;
      }

      // Extract results and properly type them
      const [player1Id, player1Stats] = results[0].result;
      const [player2Id, player2Stats] = results[1].result;

      // Create typed objects that exactly match the RawDecodedPlayerData interface
      const rawPlayer1Data: RawDecodedPlayerData = {
        id: Number(player1Id),
        stats: player1Stats,
      };

      const rawPlayer2Data: RawDecodedPlayerData = {
        id: Number(player2Id),
        stats: player2Stats,
      };
      return {
        player1: rawPlayer1Data,
        player2: rawPlayer2Data,
      };
    } catch (error) {
      console.error("Error decoding player data:", error);
      throw error;
    }
  }
}
