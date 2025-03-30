import { viemClient } from "@/config";
import { DuelGameABI } from "@/game/abi/DuelGameABI.abi";
import { useWallet } from "@/hooks/use-wallet";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { encodeFunctionData } from "viem";
import type { Player } from "@/types/player.types";
import type { Challenge } from "./use-challenges";
import { useRouter } from "next/navigation";
import { useDuelActions } from "@/stores/duel-store";

// This is a placeholder - replace with your actual contract address
const DUEL_GAME_CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_DUEL_GAME_CONTRACT_ADDRESS as `0x${string}`;

interface AcceptChallengeParams {
  character: Player;
  challengeId: bigint;
  wagerAmount: bigint;
}

interface AcceptChallengeResult {
  txHash: string;
  challengeId: bigint;
  characterId: string;
}

export function useAcceptChallenge() {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const { isWrongNetwork, switchToBaseSepolia } = useWallet();
  const queryClient = useQueryClient();
  const router = useRouter();
  
  // Get only the actions we need - we no longer need selectors here
  const { startListening, markAsTimedOut, setListenerTimeout } = useDuelActions();
  
  // Find embedded wallet
  const embeddedWallet = wallets?.find(
    (wallet) => wallet.connectorType === "embedded",
  );

  // Create a mutation for accepting a challenge
  const mutation = useMutation({
    mutationFn: async ({
      character,
      challengeId,
      wagerAmount,
    }: AcceptChallengeParams): Promise<AcceptChallengeResult> => {
      if (!authenticated) {
        throw new Error("Authentication required");
      }

      if (isWrongNetwork) {
        await switchToBaseSepolia();
      }

      if (!embeddedWallet) {
        throw new Error("No embedded wallet found");
      }

      // Create the defender loadout from the selected character
      const defenderLoadout = {
        playerId: Number(character.id),
        skin: {
          skinIndex: Number(character.currentSkin.collection.id),
          skinTokenId: character.currentSkin.tokenId,
        },
      };

      // Encode function data for the contract call
      const data = encodeFunctionData({
        abi: DuelGameABI,
        functionName: "acceptChallenge",
        args: [challengeId, defenderLoadout],
      });

      // Get provider for the embedded wallet
      const provider = await embeddedWallet.getEthereumProvider();

      // Create transaction request
      const transactionRequest = {
        to: DUEL_GAME_CONTRACT_ADDRESS,
        data,
        value: wagerAmount,
      };

      // Send transaction using the provider
      const hash = await provider.request({
        method: "eth_sendTransaction",
        params: [transactionRequest],
      });

      // Wait for transaction to be mined
      await viemClient.waitForTransactionReceipt({
        hash: hash as `0x${string}`,
      });

      return { txHash: hash as string, challengeId, characterId: character.id };
    },

    onSuccess: async ({ txHash, challengeId, characterId }) => {
      toast.success("Challenge accepted", {
        description:
          "You've accepted the challenge! Preparing for battle as the duel begins.",
        action: {
          label: "View on BaseScan",
          onClick: () =>
            window.open(`https://sepolia.basescan.org/tx/${txHash}`, "_blank"),
        },
        duration: 5000,
      });

      // Start listening for DuelComplete event
      // We pass a callback with a 5-second delay before navigation
      startListening(challengeId, (duelTxHash) => {
        toast.success("Duel complete!", {
          description: "Preparing the duel visualization...",
          duration: 4000,
        });
        
          router.push(`/duel?txId=${duelTxHash}`);
      });
      
      // Start a 60-second timeout
      const timeoutId = window.setTimeout(() => {
        markAsTimedOut();
        toast.error("Duel processing timeout", {
          description: "The duel is taking longer than expected to process. You can check back later.",
        });
      }, 60000); // 1 minute timeout
      
      setListenerTimeout(timeoutId);

      // Invalidate active challenges query to refresh the list
      if (embeddedWallet?.address) {
        queryClient.invalidateQueries({
          queryKey: ["active-challenges", embeddedWallet.address],
        });

        queryClient.setQueryData(
          ["fighter-challenges", characterId],
          (oldData: Challenge[]) => [
            ...oldData.filter((challenge) => challenge.id !== challengeId),
          ],
        );
      }
      
      // Navigate to the loading screen
      router.push("/duel/loading");
    },

    onError: (error) => {
      console.error("Error accepting challenge:", error);

      // Show error toast
      toast.error("Error accepting challenge", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    },
  });

  const acceptChallenge = async (params: AcceptChallengeParams) => {
    if (!authenticated) {
      toast.error("Authentication required", {
        description: "Please connect your wallet to accept a challenge.",
      });
      return;
    }

    mutation.mutate(params);
  };

  return {
    acceptChallenge,
    isAcceptingChallenge: mutation.isPending,
    txHash: mutation.data?.txHash || null,
    error: mutation.error,
  };
}
