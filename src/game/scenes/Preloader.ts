import { viemClient } from "@/config";
import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import { fetchAndConvertPlayers } from "../../lib/player-api";
import type { Player, PlayerLoadout } from "@/types/player.types";
import { DuelGameABI, GameEngineABI, PracticeGameABI } from "../abi";
import type { Address } from "viem";
import { getEnumKeyByValue } from "../utils/enum-utils";
import { CombatResultType, WinCondition } from "@/types/game.types";
import type {
  DecodedCombatResult,
  CombatAction,
  RawCombatAction,
  SceneData,
} from "@/types/game.types";

export class Preloader extends Scene {
  // URL parameters
  private txId?: string;
  private network: string;
  private blockNumber: string;
  private player1Id?: string;
  private player2Id?: string;

  // Player data
  private player1: Player;
  private player2: Player;
  // Game data
  private decodedCombatBytes: DecodedCombatResult;

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
      const p2Id = params.get("player2Id");

      // Only set player IDs if both are valid numbers
      if (
        p1Id &&
        p2Id &&
        !Number.isNaN(Number(p1Id)) &&
        !Number.isNaN(Number(p2Id))
      ) {
        this.player1Id = p1Id;
        this.player2Id = p2Id;
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
      // Disable duel mode for now
      if (this.txId) {
        console.error("Duel mode is currently disabled");
        throw new Error("Duel mode is currently disabled");
      }

      // Enforce that we have both player IDs
      if (!this.player1Id || !this.player2Id) {
        console.error("FATAL ERROR: Missing player IDs");
        throw new Error("FATAL: Both player IDs are required");
      }

      // Practice Mode - load players
      this.events.emit("status-update", "Loading player data...");
      await this.loadPlayersByPlayerIds(this.player1Id, this.player2Id);

      // Enforce that both players were loaded successfully
      if (!this.player1 || !this.player2) {
        console.error("FATAL ERROR: Failed to load player data");
        throw new Error("FATAL: Player data could not be loaded");
      }

      // Load player spritesheets
      this.loadPlayerSpritesheet(this.player1);
      this.loadPlayerSpritesheet(this.player2);

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

  private loadPlayerSpritesheet(player: Player) {
    this.load.atlas(
      `player${player.id}-spritesheet`,
      player.currentSkin.spritesheet.image,
      {
        frames: player.currentSkin.spritesheet.frames,
      },
    );
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

  async loadPlayersByPlayerIds(player1Id: string, player2Id: string) {
    try {
      console.log("Loading players with IDs:", player1Id, player2Id);
      const playerIds = [player1Id, player2Id];
      const players = await fetchAndConvertPlayers(playerIds);
      console.log("Fetched players:", players);

      // Check if we got valid player data
      if (!players || players.length < 2 || !players[0] || !players[1]) {
        console.error("Invalid player data returned:", players);
        throw new Error("Invalid player data returned from API");
      }

      [this.player1, this.player2] = players;
      console.log("Assigned players:", this.player1, this.player2);
      return players;
    } catch (error) {
      console.error("FATAL ERROR: Failed to load player data:", error);
      throw new Error("FATAL: Cannot load players");
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
      const gameContractAddress = process.env
        .NEXT_PUBLIC_PRACTICE_GAME_CONTRACT_ADDRESS as Address;

      const multicallResults = await viemClient.multicall({
        contracts: [
          {
            address: gameContractAddress,
            abi: PracticeGameABI,
            functionName: "play",
            args: [player1Loadout, player2Loadout],
          },
          {
            address: gameContractAddress,
            abi: PracticeGameABI,
            functionName: "gameEngine",
          },
        ],
      });

      // Extract the results and handle potential errors
      if (multicallResults[0].status === "failure") {
        throw multicallResults[0].error;
      }
      if (multicallResults[1].status === "failure") {
        throw multicallResults[1].error;
      }

      const combatBytes = multicallResults[0].result;
      const gameEngineAddress = multicallResults[1].result;
      return await this.decodeCombatBytes(
        combatBytes,
        gameEngineAddress,
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

  // async loadCombatBytesDuelMode(
  //   txId: string,
  //   network: string,
  // ): Promise<DecodedCombatResult> {
  //   try {
  //     // Get transaction receipt
  //     const receipt = await viemClient.getTransactionReceipt({
  //       hash: txId as `0x${string}`,
  //     });

  //     // Parse the combat result event logs using DuelGameABI
  //     const parsedLogs = parseEventLogs({
  //       abi: DuelGameABI,
  //       eventName: "CombatResult",
  //       logs: receipt.logs,
  //     });

  //     if (!parsedLogs || parsedLogs.length === 0) {
  //       throw new Error("Combat result log not found");
  //     }

  //     const combatLog = parsedLogs[0];

  //     const player1Data = combatLog.args.player1Data;
  //     const player2Data = combatLog.args.player2Data;
  //     const winningPlayerId = combatLog.args.winningPlayerId;
  //     const packedResults = combatLog.args.packedResults;

  //     // Get player contract to decode player data
  //     const gameContractAddress = process.env
  //       .NEXT_PUBLIC_DUEL_GAME_CONTRACT_ADDRESS as Address;
  //     const playerContractAddress = await viemClient.readContract({
  //       address: gameContractAddress,
  //       abi: DuelGameABI,
  //       functionName: "playerContract",
  //     });

  //     // Decode player data from indexed parameters
  //     const [player1Id, player1Stats] = await viemClient.readContract({
  //       address: playerContractAddress,
  //       abi: PlayerABI,
  //       functionName: "decodePlayerData",
  //       args: [player1Data],
  //     });
  //     const [player2Id, player2Stats] = await viemClient.readContract({
  //       address: playerContractAddress,
  //       abi: PlayerABI,
  //       functionName: "decodePlayerData",
  //       args: [player2Data],
  //     });

  //     // Get game engine address
  //     const gameEngineAddress = await viemClient.readContract({
  //       address: gameContractAddress,
  //       abi: DuelGameABI,
  //       functionName: "gameEngine",
  //     });

  //     // Decode combat bytes
  //     const decodedCombat = await viemClient.readContract({
  //       address: gameEngineAddress,
  //       abi: GameEngineABI,
  //       functionName: "decodeCombatLog",
  //       args: [packedResults],
  //     });

  //     // Extract actions array - skip gameEngineVersion which is at index 1
  //     const actions = decodedCombat[3] as CombatAction[];

  //     // Map the actions with proper enum conversion
  //     const mappedActions = actions.map((action) => {
  //       return {
  //         p1Result: getEnumKeyByValue(
  //           CombatResultType as unknown as Record<string, number>,
  //           Number(action.p1Result),
  //         ),
  //         p1Damage: Number(action.p1Damage),
  //         p1StaminaLost: Number(action.p1StaminaLost),
  //         p2Result: getEnumKeyByValue(
  //           CombatResultType as unknown as Record<string, number>,
  //           Number(action.p2Result),
  //         ),
  //         p2Damage: Number(action.p2Damage),
  //         p2StaminaLost: Number(action.p2StaminaLost),
  //       };
  //     });

  //     const result: DuelResult = {
  //       winner: winningPlayerId,
  //       condition: getEnumKeyByValue(
  //         WinCondition as unknown as Record<string, number>,
  //         Number(decodedCombat[2]),
  //       ) as keyof typeof WinCondition,
  //       actions: mappedActions as MappedCombatAction[],
  //       player1Id: Number(player1Id),
  //       player2Id: Number(player2Id),
  //       player1Stats,
  //       player2Stats,
  //       winningPlayerId,
  //       blockNumber: receipt.blockNumber.toString(),
  //       gameEngineVersion: Number(decodedCombat[1]),
  //     };

  //     // Verify the result has the expected structure
  //     if (!result.actions || result.actions.length === 0) {
  //       throw new Error("No actions in processed result");
  //     }

  //     return result;
  //   } catch (error) {
  //     console.error("Error loading duel data:", error);
  //     throw error;
  //   }
  // }
}
