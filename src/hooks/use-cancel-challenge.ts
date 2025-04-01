import { viemClient } from "@/config";
import { DuelGameABI } from "@/game/abi/DuelGameABI.abi";
import { useWallet } from "@/hooks/use-wallet";
import { usePrivy } from "@privy-io/react-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { encodeFunctionData } from "viem";
import type { Challenge } from "./use-challenges";

// This is a placeholder - replace with your actual contract address
const DUEL_GAME_CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_DUEL_GAME_CONTRACT_ADDRESS as `0x${string}`;

interface CancelChallengeResult {
  txHash: string;
  challengeId: bigint;
  characterId: string;
}

interface CancelChallengeParams {
  challengeId: bigint;
  characterId: string;
}

export function useCancelChallenge() {
  const { authenticated } = usePrivy();
  const { isWrongNetwork, switchToBaseSepolia } = useWallet();
  const queryClient = useQueryClient();
  const { primaryWallet } = useWallet();

  // Create a mutation for cancelling a challenge
  const mutation = useMutation({
    mutationFn: async ({
      challengeId,
      characterId,
    }: CancelChallengeParams): Promise<CancelChallengeResult> => {
      if (!authenticated) {
        throw new Error("Authentication required");
      }

      if (isWrongNetwork) {
        await switchToBaseSepolia();
      }

      if (!primaryWallet) {
        throw new Error("No wallet found");
      }

      // Encode function data for the contract call
      const data = encodeFunctionData({
        abi: DuelGameABI,
        functionName: "cancelChallenge",
        args: [challengeId],
      });

      // Get provider for the embedded wallet
      const provider = await primaryWallet.getEthereumProvider();

      // Create transaction request
      const transactionRequest = {
        to: DUEL_GAME_CONTRACT_ADDRESS,
        data,
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

      return { txHash: hash as string, challengeId, characterId };
    },

    onSuccess: async ({ txHash, challengeId, characterId }) => {
      toast.success("Challenge cancelled", {
        description:
          "Your challenge has been successfully cancelled. Any wager amount will be returned to your wallet.",
        action: {
          label: "View on BaseScan",
          onClick: () =>
            window.open(`https://sepolia.basescan.org/tx/${txHash}`, "_blank"),
        },
        duration: 5000,
      });

      if (primaryWallet?.address) {
        queryClient.setQueryData(
          ["fighter-challenges", characterId],
          (oldData: Challenge[]) =>
            oldData.filter((challenge) => challenge.id !== challengeId),
        );
      }
    },

    onError: (error) => {
      console.error("Error cancelling challenge:", error);

      // Show error toast
      toast.error("Error cancelling challenge", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    },
  });

  const cancelChallenge = async (params: CancelChallengeParams) => {
    if (!authenticated) {
      toast.error("Authentication required", {
        description: "Please connect your wallet to cancel a challenge.",
      });
      return;
    }

    mutation.mutate(params);
  };

  return {
    cancelChallenge,
    isCancellingChallenge: mutation.isPending,
    txHash: mutation.data?.txHash || null,
    error: mutation.error,
  };
}
