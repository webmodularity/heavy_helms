import { create } from "zustand";
import type { Fighter } from "@/types/fighter-types";

interface FightData {
  player1?: Fighter;
  txId?: string;
  logIndex?: string;
  title?: string;
  player1Name?: string;
  player2Name?: string;
  gauntletName?: string;
  isLoading?: boolean;
  loadingText?: string;
  challengeId?: bigint;
}

interface GlobalFightModalState {
  isOpen: boolean;
  fightData: FightData | null;
  onCloseCallback: (() => void) | null;
  openFightModal: (data: FightData, onClose?: () => void) => void;
  closeFightModal: () => void;
  setLoading: (
    isLoading: boolean,
    loadingText?: string,
    challengeId?: bigint,
  ) => void;
  updateFightData: (data: Partial<FightData>) => void;
}

export const useGlobalFightModal = create<GlobalFightModalState>((set) => ({
  isOpen: false,
  fightData: null,
  onCloseCallback: null,
  openFightModal: (data: FightData, onClose?: () => void) => {
    console.log("Opening global fight modal:", data);
    set({ isOpen: true, fightData: data, onCloseCallback: onClose });
  },
  closeFightModal: () => {
    console.log("Closing global fight modal");

    // Call the onClose callback if provided
    const currentState = useGlobalFightModal.getState();
    if (currentState.onCloseCallback) {
      console.log("Calling onClose callback");
      currentState.onCloseCallback();
    }

    set({ isOpen: false });
    // Keep fightData for a moment to allow for smooth closing animation
    setTimeout(() => {
      set({ fightData: null, onCloseCallback: null });
    }, 300);
  },
  setLoading: (
    isLoading: boolean,
    loadingText?: string,
    challengeId?: bigint,
  ) => {
    set((state) => ({
      fightData: state.fightData
        ? {
            ...state.fightData,
            isLoading,
            loadingText,
            challengeId,
          }
        : null,
    }));
  },
  updateFightData: (data: Partial<FightData>) => {
    set((state) => ({
      fightData: state.fightData
        ? {
            ...state.fightData,
            ...data,
          }
        : null,
    }));
  },
}));

// Utility function to open fight modal from URL parameters
export function createFightDataFromUrl(
  searchParams: URLSearchParams,
): FightData | null {
  const txId = searchParams.get("txId");
  const logIndex = searchParams.get("logIndex");

  if (!txId) {
    return null;
  }

  return {
    txId,
    logIndex: logIndex || undefined,
    title: logIndex ? "Gauntlet Battle" : "Duel Battle",
  };
}

// Utility function to generate shareable URLs for fights
export function generateFightUrl(fightData: FightData): string {
  const baseUrl = "https://www.heavyhelms.xyz";
  const params = new URLSearchParams();

  if (fightData.txId) {
    params.set("txId", fightData.txId);
  }

  if (fightData.logIndex) {
    params.set("logIndex", fightData.logIndex);
  }

  // Determine the appropriate path based on fight type
  const path = fightData.logIndex ? "/gauntlet" : "/duel";

  return `${baseUrl}${path}?${params.toString()}`;
}

// Utility function to copy fight URL to clipboard
export async function copyFightUrlToClipboard(
  fightData: FightData,
): Promise<boolean> {
  try {
    const url = generateFightUrl(fightData);
    await navigator.clipboard.writeText(url);
    return true;
  } catch (error) {
    console.error("Failed to copy URL to clipboard:", error);
    return false;
  }
}

// Utility function to share fight on social media
export function shareFightOnTwitter(
  fightData: FightData,
  customText?: string,
): void {
  const url = generateFightUrl(fightData);

  let text = customText;

  if (!text) {
    const { player1Name, player2Name, logIndex, gauntletName } = fightData;

    if (logIndex) {
      // Gauntlet fight - always try to show player names if available
      if (
        player1Name &&
        player2Name &&
        player1Name !== "Fighter" &&
        player2Name !== "Fighter"
      ) {
        text = `⚔️ Epic Gauntlet Battle!\n\n${player1Name} ⚡ vs ⚡ ${player2Name}\n\n🏆 Who will emerge victorious?`;
      } else {
        text = "⚔️ Epic Gauntlet Battle!\n\n🏆 Witness the clash of champions!";
      }
    } else {
      // Duel fight - always try to show player names if available
      if (
        player1Name &&
        player2Name &&
        player1Name !== "Fighter" &&
        player2Name !== "Fighter"
      ) {
        text = `⚔️ DUEL ARENA ⚔️\n\n${player1Name} 🆚 ${player2Name}\n\n🏆 Epic 1v1 battle!`;
      } else {
        text = "⚔️ DUEL ARENA ⚔️\n\n🏆 Epic 1v1 battle!";
      }
    }
  }

  // Add URL and @HeavyHelms at the bottom with proper spacing
  const fullText = `${text}\n\n${url}\n\n@HeavyHelms @Shape_L2`;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullText)}`;
  window.open(twitterUrl, "_blank");
}

// Utility function to share fight on Farcaster
export function shareFightOnFarcaster(
  fightData: FightData,
  customText?: string,
): void {
  const url = generateFightUrl(fightData);

  let text = customText;

  if (!text) {
    const { player1Name, player2Name, logIndex, gauntletName } = fightData;

    if (logIndex) {
      // Gauntlet fight - always try to show player names if available
      if (
        player1Name &&
        player2Name &&
        player1Name !== "Fighter" &&
        player2Name !== "Fighter"
      ) {
        text = `⚔️ Epic Gauntlet Battle!\n\n${player1Name} ⚡ vs ⚡ ${player2Name}\n\n🏆 Who will emerge victorious?`;
      } else {
        text = "⚔️ Epic Gauntlet Battle!\n\n🏆 Witness the clash of champions!";
      }
    } else {
      // Duel fight - always try to show player names if available
      if (
        player1Name &&
        player2Name &&
        player1Name !== "Fighter" &&
        player2Name !== "Fighter"
      ) {
        text = `⚔️ DUEL ARENA ⚔️\n\n${player1Name} 🆚 ${player2Name}\n\n🏆 Epic 1v1 battle!`;
      } else {
        text = "⚔️ DUEL ARENA ⚔️\n\n🏆 Epic 1v1 battle!";
      }
    }
  }

  // Add URL and mentions at the bottom with proper spacing
  const fullText = `${text}\n\n${url}\n\n@heavyhelms @shape-l2`;

  const farcasterUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(fullText)}`;
  window.open(farcasterUrl, "_blank");
}
