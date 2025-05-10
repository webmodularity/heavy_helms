import { useState, useEffect, useCallback } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import type { Abi, Address } from "viem";
import { toast } from "sonner";
import { GauntletGameABI } from "@/game/abi"; // Adjust path as needed
import type { Player, PlayerLoadout } from "@/types/player.types";
import type { SkinInfo } from "@/types/skin.types";
import { useQueryClient } from "@tanstack/react-query";

// Define arguments structure with REQUIRED callbacks
interface QueueArgs {
  character: Player;
  entryFeeWei: bigint;
  onSuccess: () => void; // Required
  onError: (error: Error) => void; // Required
}

// Define arguments structure for withdrawing
interface WithdrawArgs {
  playerId: number;
  onSuccess: () => void; // Required
  onError: (error: Error) => void; // Required
}

// Type guard for errors
function isError(error: unknown): error is Error {
  return error instanceof Error;
}

export function useGauntletQueue() {
  const { address: account } = useAccount();
  const queryClient = useQueryClient();
  const {
    writeContractAsync,
    data: hash,
    reset: resetWriteContract, // Add reset function
    error: writeError,
    isPending: isWritePending,
  } = useWriteContract();

  const [actionType, setActionType] = useState<"queue" | "withdraw" | null>(
    null,
  );
  const [currentCallbacks, setCurrentCallbacks] = useState<{
    onSuccess: () => void; // Required
    onError: (error: Error) => void; // Required
  } | null>(null); // Initialize as null
  const [characterIdForTx, setCharacterIdForTx] = useState<string | null>(null);

  const gauntletContractAddress = process.env
    .NEXT_PUBLIC_GAUNTLET_GAME_CONTRACT_ADDRESS as Address | undefined;

  // --- Reset function ---
  const resetHookState = useCallback(() => {
    setActionType(null);
    setCurrentCallbacks(null);
    setCharacterIdForTx(null);
    resetWriteContract();
    console.log("useGauntletQueue: State reset.");
  }, [resetWriteContract]);

  // --- Queue Logic ---
  const queuePlayer = useCallback(
    async ({ character, entryFeeWei, onSuccess, onError }: QueueArgs) => {
      if (!account) {
        toast.error("Please connect your wallet.");
        return;
      }
      if (!gauntletContractAddress) {
        toast.error("Gauntlet contract address not configured.");
        return;
      }
      if (!character) {
        toast.error("No character selected.");
        return;
      }

      resetHookState(); // Reset state before starting new action
      setActionType("queue");
      setCurrentCallbacks({ onSuccess, onError });
      setCharacterIdForTx(character.id);

      // Construct the SkinInfo object first
      const skinInfo: SkinInfo = {
        // Use the 'id' field from the collection and cast to number for skinIndex
        skinIndex: Number(character.currentSkin.collection.id),
        // Cast tokenId to number for skinTokenId
        skinTokenId: Number(character.currentSkin.tokenId),
      };

      // Construct the PlayerLoadout object using SkinInfo
      const loadout: PlayerLoadout = {
        playerId: Number.parseInt(character.id, 10),
        skin: skinInfo, // Use the correctly typed SkinInfo object
        stance: character.stance,
      };

      console.log("Queueing player ID:", loadout.playerId);
      try {
        await writeContractAsync({
          address: gauntletContractAddress,
          abi: GauntletGameABI as Abi,
          functionName: "queueForGauntlet",
          args: [loadout],
          value: entryFeeWei,
        });
        // Don't reset state here, wait for receipt
      } catch (err) {
        console.error("Gauntlet Queue Write Error:", err);
        const error = isError(err)
          ? err
          : new Error("An unknown error occurred during queue write.");
        toast.error("Queue Transaction Failed", {
          description: error.message.slice(0, 100),
        });
        onError(error);
        resetHookState(); // Reset state fully on write error
      }
    },
    [account, gauntletContractAddress, writeContractAsync, resetHookState],
  );

  // --- Withdraw Logic ---
  const withdrawPlayer = useCallback(
    async ({ playerId, onSuccess, onError }: WithdrawArgs) => {
      if (!account) {
        toast.error("Please connect your wallet.");
        return;
      }
      if (!gauntletContractAddress) {
        toast.error("Gauntlet contract address not configured.");
        return;
      }

      resetHookState(); // Reset state before starting new action
      setActionType("withdraw");
      setCurrentCallbacks({ onSuccess, onError });
      setCharacterIdForTx(playerId.toString());
      console.log("Withdrawing player ID:", playerId);
      try {
        await writeContractAsync({
          address: gauntletContractAddress,
          abi: GauntletGameABI as Abi,
          functionName: "withdrawFromQueue",
          args: [playerId],
        });
        // Don't reset state here, wait for receipt
      } catch (err) {
        console.error("Gauntlet Withdraw Write Error:", err);
        const error = isError(err)
          ? err
          : new Error("An unknown error occurred during withdraw write.");
        toast.error("Withdraw Transaction Failed", {
          description: error.message.slice(0, 100),
        });
        onError(error);
        resetHookState(); // Reset state fully on write error
      }
    },
    [account, gauntletContractAddress, writeContractAsync, resetHookState],
  );

  // --- Transaction Receipt Handling ---
  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError,
    status: receiptStatus, // Track status to know when receipt processing is done
  } = useWaitForTransactionReceipt({ hash });

  // Effect for handling receipt results
  useEffect(() => {
    // Only proceed if we have an action, callbacks, and the receipt process is settled (success or error)
    if (
      !actionType ||
      !characterIdForTx ||
      !currentCallbacks ||
      receiptStatus === "pending" ||
      !hash
    )
      return;

    if (isSuccess) {
      const isQueueAction = actionType === "queue";
      const successMsg = isQueueAction
        ? "Successfully joined the Gauntlet queue!"
        : "Successfully withdrawn from queue.";
      toast.success("Transaction Confirmed", { description: successMsg });

      currentCallbacks.onSuccess();

      // Invalidate queries with delay
      setTimeout(() => {
        console.log("useGauntletQueue: Invalidating queries after delay...");
        queryClient.invalidateQueries({ queryKey: ["gameStats"] });
        queryClient.invalidateQueries({ queryKey: ["ownedPlayers", account] });
        queryClient.invalidateQueries({
          queryKey: ["fighter", characterIdForTx],
        });
      }, 100);

      // Minimal reset here: just actionType and callbacks. Keep hash/status/confirmedStatus until next action.
      setActionType(null);
      setCurrentCallbacks(null);
      setCharacterIdForTx(null);
    } else if (receiptError) {
      console.error("Gauntlet Transaction Receipt Error:", receiptError);
      const description = `Failed to confirm ${actionType} transaction. ${receiptError.message.slice(0, 100)}`;
      toast.error("Transaction Receipt Failed", { description });
      currentCallbacks.onError(receiptError);
      resetHookState(); // Reset everything on receipt error
    }
  }, [
    isSuccess,
    receiptError,
    receiptStatus, // React to status changes
    hash, // Only run if hash is present
    actionType,
    currentCallbacks,
    queryClient,
    account,
    characterIdForTx,
    resetHookState, // resetHookState is called explicitly now
  ]);

  // Consolidate loading states
  const isLoading = isWritePending || isConfirming;
  const error = writeError || receiptError;

  return {
    queuePlayer,
    withdrawPlayer,
    isLoading,
    isQueuing: actionType === "queue" && isLoading,
    isWithdrawing: actionType === "withdraw" && isLoading,
    error,
    hash,
  };
}

// Note: Ensure PlayerLoadout structure in types matches the contract precisely.
// Note: Adjust query invalidation keys based on your actual TanStack Query setup.
// Note: You might need to add/adjust error handling based on specific contract reverts.
