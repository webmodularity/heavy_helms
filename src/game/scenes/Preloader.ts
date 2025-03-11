import { viemClient } from "@/config";
import { Scene } from "phaser";
import { http } from "viem";
import { EventBus } from "../EventBus";
import {
  DefaultPlayerSkinNFTABI,
  PlayerABI,
  PracticeGameABI,
  SkinRegistryABI,
} from "../abi";
import { loadDuelDataFromTx } from "../utils/combat-loader";
import { loadCharacterData } from "../utils/nft-loader";

// Define types for combat data
interface CombatBytes {
  player1Id: bigint | number;
  player2Id: bigint | number;
  winningPlayerId: bigint | number;
  blockNumber: string;
  // Other combat data properties
  [key: string]: any;
}

interface PlayerStats {
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
  weapon?: string;
  armor?: string;
  stance?: string;
}

interface PlayerData {
  id: string;
  name: string;
  stats: PlayerStats;
  spritesheetUrl: string;
  jsonData: Record<string, any>;
}

export class Preloader extends Scene {
  // URL parameters
  private txId?: string;
  private network: string;
  private blockNumber: string;
  private player1Id?: string;
  private player2Id?: string;

  // Player data
  private player1Data?: PlayerData;
  private player2Data?: PlayerData;
  private combatBytesFromTx?: CombatBytes;

  // Loading state
  private preloadComplete = false;
  private loadingBar?: Phaser.GameObjects.Rectangle;
  private debugText?: Phaser.GameObjects.Text;

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

    this.blockNumber = params.get("blockNumber") || "123456"; // Default block number

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
      EventBus.once(
        "set-player-ids",
        (data: { player1Id: string; player2Id: string }) => {
          if (data.player1Id && data.player2Id) {
            this.player1Id = data.player1Id;
            this.player2Id = data.player2Id;
          }
        },
      );
    }

    // Set up the loading UI
    this.createLoadingUI();
  }

  createLoadingUI() {
    try {
      // Background image loaded in Boot scene
      this.add.image(512, 384, "background");

      // Loading bar outline
      this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

      // Loading bar fill
      this.loadingBar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

      // Update loading bar based on progress
      this.load.on("progress", (progress: number) => {
        if (this.loadingBar) {
          this.loadingBar.width = 4 + 460 * progress;
        }
      });

      // Add a status text
      const statusText = this.add
        .text(512, 420, "Loading game assets...", {
          fontSize: "18px",
          color: "#ffffff",
        })
        .setOrigin(0.5);

      // Update status text for different loading phases
      this.events.on("status-update", (message: string) => {
        statusText.setText(message);
      });
    } catch (error) {
      const errorText = this.add
        .text(512, 450, "Error loading game data. Please try again.", {
          fontSize: "18px",
          color: "#ff0000",
        })
        .setOrigin(0.5);
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
      // Load blockchain data
      if (this.txId) {
        this.events.emit(
          "status-update",
          "Loading combat data from blockchain...",
        );
        await this.loadDuelData();
      } else if (!this.player1Id || !this.player2Id) {
        this.events.emit("status-update", "Selecting random players...");
        await this.selectRandomPlayers();
      }

      // Load player data
      this.events.emit("status-update", "Loading player data...");
      await this.loadPlayerData();

      // Load loadouts
      this.events.emit("status-update", "Loading equipment data...");
      await this.loadPlayerLoadouts();

      // Queue player spritesheets for loading
      if (this.player1Data?.spritesheetUrl && this.player1Data?.jsonData) {
        this.load.atlas(
          `player${this.player1Id}`,
          this.player1Data.spritesheetUrl,
          this.player1Data.jsonData,
        );
      }

      if (this.player2Data?.spritesheetUrl && this.player2Data?.jsonData) {
        this.load.atlas(
          `player${this.player2Id}`,
          this.player2Data.spritesheetUrl,
          this.player2Data.jsonData,
        );
      }

      // Get block number if needed
      if (!this.txId) {
        await this.fetchBlockNumber();
      }

      // Remove the complete listener to avoid duplicate calls
      this.load.off("complete", this.onLoadComplete, this);

      // Add a new one-time listener for the player assets
      this.load.once("complete", () => {
        console.log("All assets loaded successfully");
        this.preloadComplete = true;
        // Start the next scene
        this.startFightScene();
      });

      // Start loading the queued player assets
      this.load.start();
    } catch (error) {
      console.error("Error in load complete:", error);
      const errorText = this.add
        .text(512, 450, "Error loading game data. Please try again.", {
          fontSize: "18px",
          color: "#ff0000",
        })
        .setOrigin(0.5);
    }
  }

  private startFightScene() {
    try {
      if (
        this.player1Id &&
        this.player2Id &&
        this.player1Data &&
        this.player2Data
      ) {
        const sceneData = {
          player1Id: this.player1Id,
          player2Id: this.player2Id,
          player1Data: this.player1Data,
          player2Data: this.player2Data,
          player1Name: this.player1Data.name,
          player2Name: this.player2Data.name,
          network: this.network,
          blockNumber: this.blockNumber,
          txId: this.txId || "Practice",
          combatBytes: this.combatBytesFromTx,
        };

        this.scene.start("FightScene", sceneData);
      } else {
        // Fallback to default players if something went wrong
        const fallbackData = this.createFallbackPlayerData();

        this.scene.start("FightScene", {
          player1Id: "1",
          player2Id: "2",
          player1Data: fallbackData,
          player2Data: fallbackData,
          player1Name: fallbackData.name,
          player2Name: fallbackData.name,
          network: this.network,
          blockNumber: this.blockNumber,
          txId: "Practice",
          combatBytes: null,
        });
      }

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

  async loadDuelData() {
    try {
      if (!this.txId) {
        return null;
      }

      const duelData = await loadDuelDataFromTx(this.txId, this.network);

      if (!duelData) {
        return null;
      }

      this.player1Id = String(duelData.player1Id);
      this.player2Id = String(duelData.player2Id);

      this.combatBytesFromTx = {
        ...duelData,
        player1Id:
          typeof duelData.player1Id === "bigint"
            ? duelData.player1Id
            : BigInt(duelData.player1Id),
        player2Id:
          typeof duelData.player2Id === "bigint"
            ? duelData.player2Id
            : BigInt(duelData.player2Id),
        winningPlayerId:
          typeof duelData.winningPlayerId === "bigint"
            ? duelData.winningPlayerId
            : BigInt(duelData.winningPlayerId || 0),
      };

      this.blockNumber = duelData.blockNumber;

      return duelData;
    } catch (error) {
      console.error("Error loading duel data:", error);
      throw error;
    }
  }

  async selectRandomPlayers() {
    try {
      const networkName =
        process.env.NEXT_PUBLIC_ALCHEMY_NETWORK?.toLowerCase() || "mainnet";
      const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

      if (!apiKey) {
        this.player1Id = "1";
        this.player2Id = "2";
        return;
      }

      const transport = http(
        `https://${networkName}.g.alchemy.com/v2/${apiKey}`,
      );

      // const client = createPublicClient({
      //   transport,
      // });

      const gameContractAddress = process.env
        .NEXT_PUBLIC_PRACTICE_GAME_CONTRACT_ADDRESS as `0x${string}`;

      if (!gameContractAddress) {
        this.player1Id = "1";
        this.player2Id = "2";
        return;
      }

      const playerContractAddress = await viemClient.readContract({
        address: gameContractAddress,
        abi: PracticeGameABI,
        functionName: "playerContract",
      });

      const skinRegistryAddress = await viemClient.readContract({
        address: playerContractAddress as `0x${string}`,
        abi: PlayerABI,
        functionName: "skinRegistry",
      });

      const defaultSkinInfo = await viemClient.readContract({
        address: skinRegistryAddress as `0x${string}`,
        abi: SkinRegistryABI,
        functionName: "getSkin",
        args: [0], // Index 0 is DefaultPlayerSkinNFT
      });

      const currentTokenId = await viemClient.readContract({
        address: defaultSkinInfo.contractAddress as `0x${string}`,
        abi: DefaultPlayerSkinNFTABI,
        functionName: "CURRENT_TOKEN_ID",
      });

      const maxId = Number(currentTokenId) - 1;
      const id1 = Math.floor(Math.random() * maxId) + 1;
      let id2 = 0;
      do {
        id2 = Math.floor(Math.random() * maxId) + 1;
      } while (id2 === id1);

      this.player1Id = id1.toString();
      this.player2Id = id2.toString();
    } catch (error) {
      console.error("Error selecting random players:", error);
      this.player1Id = "1";
      this.player2Id = "2";
    }
  }

  async loadPlayerData() {
    try {
      if (!this.player1Id) {
        return null;
      }

      // Convert string IDs to numbers for the loadCharacterData function
      const p1Id = Number(this.player1Id);
      const p2Id = this.player2Id ? Number(this.player2Id) : null;

      // Load player data using the real character loader
      const playerData = await Promise.all([
        loadCharacterData(p1Id),
        p2Id !== null ? loadCharacterData(p2Id) : null,
      ]);

      // Convert the loaded data to our PlayerData format
      const [p1Data, p2Data] = playerData;

      if (p1Data) {
        this.player1Data = {
          id: this.player1Id,
          name: p1Data.name || `Player ${this.player1Id}`,
          stats: {
            ...p1Data.stats,
            weapon: undefined,
            armor: undefined,
            stance: undefined,
          },
          spritesheetUrl: p1Data.spritesheetUrl,
          jsonData: p1Data.jsonData,
        };
      } else {
        this.player1Data = this.createFallbackPlayerData();
        this.player1Data.id = this.player1Id;
        this.player1Data.name = `Player ${this.player1Id}`;
      }

      if (p2Data) {
        this.player2Data = {
          id: this.player2Id!,
          name: p2Data.name || `Player ${this.player2Id}`,
          stats: {
            ...p2Data.stats,
            weapon: undefined,
            armor: undefined,
            stance: undefined,
          },
          spritesheetUrl: p2Data.spritesheetUrl,
          jsonData: p2Data.jsonData,
        };
      } else if (this.player2Id) {
        // this.player2Data = this.createFallbackPlayerData();
      }

      return [this.player1Data, this.player2Data];
    } catch (error) {
      // Create fallback data
      this.player1Data = this.createFallbackPlayerData();
      if (this.player1Id) {
        this.player1Data.id = this.player1Id;
        this.player1Data.name = `Player ${this.player1Id}`;
      }

      if (this.player2Id) {
        this.player2Data = this.createFallbackPlayerData();
        this.player2Data.id = this.player2Id;
        this.player2Data.name = `Player ${this.player2Id}`;
      }

      return [this.player1Data, this.player2Data];
    }
  }

  async loadPlayerLoadouts() {
    try {
      if (
        !this.player1Id ||
        !this.player2Id ||
        !this.player1Data ||
        !this.player2Data
      ) {
        return;
      }

      const networkName =
        process.env.NEXT_PUBLIC_ALCHEMY_NETWORK?.toLowerCase() || "mainnet";
      const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

      if (!apiKey) {
        this.setDefaultLoadouts();
        return;
      }

      const transport = http(
        `https://${networkName}.g.alchemy.com/v2/${apiKey}`,
      );

      // Get skin registry from player contract
      const playerContractAddress = process.env
        .NEXT_PUBLIC_PLAYER_CONTRACT_ADDRESS as `0x${string}`;

      if (!playerContractAddress) {
        this.setDefaultLoadouts();
        return;
      }

      // Get skin info for both players
      let skinInfo1, skinInfo2;
      try {
        skinInfo1 = await viemClient.readContract({
          address: playerContractAddress as `0x${string}`,
          abi: SkinRegistryABI,
          functionName: "getSkin",
          args: [this.player1Data.stats.skinIndex],
        });
      } catch (error) {
        skinInfo1 = null;
      }

      try {
        skinInfo2 = await viemClient.readContract({
          address: playerContractAddress as `0x${string}`,
          abi: SkinRegistryABI,
          functionName: "getSkin",
          args: [this.player2Data.stats.skinIndex],
        });
      } catch (error) {
        skinInfo2 = null;
      }

      // Get attributes from the skin contracts
      let loadout1, loadout2;
      try {
        if (skinInfo1 && skinInfo1.contractAddress) {
          loadout1 = await viemClient.readContract({
            address: skinInfo1.contractAddress as `0x${string}`,
            abi: DefaultPlayerSkinNFTABI,
            functionName: "getSkinAttributes",
            args: [BigInt(this.player1Data.stats.skinTokenId)],
          });
        } else {
          loadout1 = null;
        }
      } catch (error) {
        loadout1 = null;
      }

      try {
        if (skinInfo2 && skinInfo2.contractAddress) {
          loadout2 = await viemClient.readContract({
            address: skinInfo2.contractAddress as `0x${string}`,
            abi: DefaultPlayerSkinNFTABI,
            functionName: "getSkinAttributes",
            args: [BigInt(this.player2Data.stats.skinTokenId)],
          });
        } else {
          loadout2 = null;
        }
      } catch (error) {
        loadout2 = null;
      }

      // Map the loadout enum values to strings
      const weaponTypes = [
        "SwordAndShield", // 0
        "MaceAndShield", // 1
        "RapierAndShield", // 2
        "Greatsword", // 3
        "Battleaxe", // 4
        "Quarterstaff", // 5
        "Spear", // 6
      ];
      const armorTypes = [
        "Cloth", // 0
        "Leather", // 1
        "Chain", // 2
        "Plate", // 3
      ];
      const stanceTypes = [
        "Defensive", // 0
        "Balanced", // 1
        "Offensive", // 2
      ];

      // Add loadout info to player data
      if (this.player1Data && loadout1) {
        const weapon = Number(loadout1.weapon ?? loadout1[0] ?? 0);
        const armor = Number(loadout1.armor ?? loadout1[1] ?? 0);
        const stance = Number(loadout1.stance ?? loadout1[2] ?? 0);

        this.player1Data.stats.weapon = this.abbreviateWeaponName(
          weaponTypes[weapon] ?? "None",
        );
        this.player1Data.stats.armor = armorTypes[armor] ?? "None";
        this.player1Data.stats.stance = stanceTypes[stance] ?? "None";
      }

      if (this.player2Data && loadout2) {
        const weapon = Number(loadout2.weapon ?? loadout2[0] ?? 0);
        const armor = Number(loadout2.armor ?? loadout2[1] ?? 0);
        const stance = Number(loadout2.stance ?? loadout2[2] ?? 0);

        this.player2Data.stats.weapon = this.abbreviateWeaponName(
          weaponTypes[weapon] ?? "None",
        );
        this.player2Data.stats.armor = armorTypes[armor] ?? "None";
        this.player2Data.stats.stance = stanceTypes[stance] ?? "None";
      }
    } catch (error) {
      // Continue without loadout data
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

  createFallbackPlayerData(): PlayerData {
    return {
      id: "1",
      name: "Default Player",
      stats: {
        strength: 10,
        constitution: 10,
        size: 10,
        agility: 10,
        stamina: 10,
        luck: 10,
        skinIndex: 0,
        skinTokenId: 1,
        firstNameIndex: 0,
        surnameIndex: 0,
        wins: 0,
        losses: 0,
        kills: 0,
        weapon: "Sword",
        armor: "Plate",
        stance: "Balanced",
      },
      spritesheetUrl: "/path/to/default/spritesheet.png",
      jsonData: { frames: {} }, // Minimal valid atlas JSON
    };
  }
}
