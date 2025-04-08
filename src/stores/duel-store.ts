import { create } from "zustand";
import { watchContractEvent } from "viem/actions";
import { viemClient } from "@/config";
import { DuelGameABI } from "@/game/abi/DuelGameABI.abi";
import { toast } from "sonner";

interface DuelState {
  // Event tracking
  isListening: boolean;
  challengeId: bigint | null;
  duelTxHash: string | null;

  // UI states
  isTimeout: boolean;
  listenerTimeout: number | null;

  // For event listener management
  unwatchFn: (() => void) | null;

  // Group actions in a separate object
  actions: {
    startListening: (challengeId: bigint) => void;
    stopListening: () => void;
    setDuelTxHash: (txHash: string) => void;
    markAsTimedOut: () => void;
    clearState: () => void;
    setListenerTimeout: (id: number) => void;
  };
}

// The contract address
const DUEL_GAME_CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_DUEL_GAME_CONTRACT_ADDRESS as `0x${string}`;

// Store is NOT exported directly
const useDuelStore = create<DuelState>((set, get) => ({
  // Event tracking
  isListening: false,
  challengeId: null,
  duelTxHash: null,

  // UI states
  isTimeout: false,
  listenerTimeout: null,

  // Event listener management
  unwatchFn: null,

  actions: {
    startListening: (challengeId) => {
      // First clean up any existing unwatcher
      const state = get();
      if (state.unwatchFn) state.unwatchFn();
      if (state.listenerTimeout) clearTimeout(state.listenerTimeout);

      console.log(
        "Starting to listen for DuelComplete event for challengeId:",
        challengeId.toString(),
      );

      // Set up direct viem event watcher (without using the hook)
      const unwatchFn = watchContractEvent(viemClient, {
        address: DUEL_GAME_CONTRACT_ADDRESS,
        abi: DuelGameABI,
        eventName: "DuelComplete",
        // Important: For Wagmi/Viem, args must be passed correctly for indexed parameters
        args: {
          challengeId,
        },
        strict: true,
        onLogs: (logs) => {
          console.log("DuelComplete event logs received:", logs);

          // Check if any logs match our challenge ID
          const matchingLog = logs.find(
            (log) => log.args.challengeId === challengeId,
          );

          if (matchingLog) {
            console.log(
              "Matched DuelComplete event for our challengeId:",
              challengeId.toString(),
            );
            const duelTxHash = matchingLog.transactionHash;

            // Clear any existing timeout
            const currentState = get();
            if (currentState.listenerTimeout) {
              clearTimeout(currentState.listenerTimeout);
            }

            // Update store state with tx hash
            set({
              duelTxHash,
              isListening: false,
              listenerTimeout: null,
            });

            // Show success notification
            toast.success("Duel complete!", {
              description: "Preparing the duel visualization...",
              duration: 4000,
            });
          }
        },
      });

      // Update state
      set({
        challengeId,
        isListening: true,
        isTimeout: false,
        unwatchFn,
      });
    },

    stopListening: () => {
      const state = get();

      // Clean up the event listener
      if (state.unwatchFn) {
        state.unwatchFn();
      }

      // Clean up the timeout
      if (state.listenerTimeout) {
        clearTimeout(state.listenerTimeout);
      }

      set({
        isListening: false,
        unwatchFn: null,
        listenerTimeout: null,
      });
    },

    setDuelTxHash: (txHash) => {
      const state = get();

      // Clean up the unwatcher if it exists
      if (state.unwatchFn) {
        state.unwatchFn();
      }

      // Clear timeout if it exists
      if (state.listenerTimeout) {
        clearTimeout(state.listenerTimeout);
      }

      set({
        duelTxHash: txHash,
        isListening: false,
        unwatchFn: null,
        listenerTimeout: null,
      });
    },

    markAsTimedOut: () => set({ isTimeout: true }),

    clearState: () => {
      const state = get();

      // Clean up the event listener
      if (state.unwatchFn) {
        state.unwatchFn();
      }

      // Clean up the timeout
      if (state.listenerTimeout) {
        clearTimeout(state.listenerTimeout);
      }

      set({
        isListening: false,
        challengeId: null,
        duelTxHash: null,
        isTimeout: false,
        listenerTimeout: null,
        unwatchFn: null,
      });
    },

    setListenerTimeout: (id: number) =>
      set({
        listenerTimeout: id,
      }),
  },
}));

// Export atomic selectors as custom hooks
export const useIsDuelListening = () =>
  useDuelStore((state) => state.isListening);
export const useIsDuelTimeout = () => useDuelStore((state) => state.isTimeout);
export const useDuelTxHash = () => useDuelStore((state) => state.duelTxHash);
export const useDuelChallengeId = () =>
  useDuelStore((state) => state.challengeId);

// Export actions as a single hook
export const useDuelActions = () => useDuelStore((state) => state.actions);

// Add a combined hook for the loading page
export const useDuelLoadingState = () => ({
  isListening: useDuelStore((state) => state.isListening),
  isTimeout: useDuelStore((state) => state.isTimeout),
  duelTxHash: useDuelStore((state) => state.duelTxHash),
});
