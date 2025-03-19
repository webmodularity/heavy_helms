import { viemClient } from "@/config";
import { DuelGameABI } from "@/game/abi/DuelGameABI.abi";
import { useWallet } from "@/hooks/use-wallet";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { encodeFunctionData } from "viem";

// This is a placeholder - replace with your actual contract address
const DUEL_GAME_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_DUEL_GAME_CONTRACT_ADDRESS as `0x${string}`;

interface CancelChallengeResult {
  txHash: string;
}

export function useCancelChallenge() {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const { isWrongNetwork, switchToBaseSepolia } = useWallet();
  const queryClient = useQueryClient();
  
  // Find embedded wallet
  const embeddedWallet = wallets?.find(
    (wallet) => wallet.connectorType === "embedded",
  );

  // Create a mutation for cancelling a challenge
  const mutation = useMutation({
    mutationFn: async (challengeId: bigint): Promise<CancelChallengeResult> => {
      if (!authenticated) {
        throw new Error("Authentication required");
      }

      if (isWrongNetwork) {
        await switchToBaseSepolia();
      }

      if (!embeddedWallet) {
        throw new Error("No embedded wallet found");
      }

      // Encode function data for the contract call
      const data = encodeFunctionData({
        abi: DuelGameABI,
        functionName: "cancelChallenge",
        args: [challengeId],
      });

      // Get provider for the embedded wallet
      const provider = await embeddedWallet.getEthereumProvider();

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

      return { txHash: hash as string };
    },

    onSuccess: async ({ txHash }) => {
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

      // Invalidate active challenges query to refresh the list
      if (embeddedWallet?.address) {
        queryClient.invalidateQueries({
          queryKey: ["active-challenges", embeddedWallet.address],
        });
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

  const cancelChallenge = async (challengeId: bigint) => {
    if (!authenticated) {
      toast.error("Authentication required", {
        description: "Please connect your wallet to cancel a challenge.",
      });
      return;
    }

    mutation.mutate(challengeId);
  };

  return {
    cancelChallenge,
    isCancellingChallenge: mutation.isPending,
    txHash: mutation.data?.txHash || null,
    error: mutation.error,
  };
} 