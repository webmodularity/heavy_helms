import { viemClient } from "@/config";
import { PlayerABI } from "@/game/abi/PlayerABI.abi";
import { useWallet } from "@/hooks/use-wallet";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { encodeFunctionData, parseEther } from "viem";

interface CreateCharacterResult {
  txHash: string;
}

export function useCreateCharacter() {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const { isWrongNetwork, switchToBaseSepolia } = useWallet();
  const queryClient = useQueryClient();
  // Find embedded wallet
  const embeddedWallet = wallets?.find(
    (wallet) => wallet.connectorType === "embedded",
  );

  // Create a mutation for character creation
  const mutation = useMutation({
    mutationFn: async (): Promise<CreateCharacterResult> => {
      if (!authenticated) {
        throw new Error("Authentication required");
      }

      if (isWrongNetwork) {
        await switchToBaseSepolia();
      }

      if (!embeddedWallet) {
        throw new Error("No embedded wallet found");
      }

      // Get the creation fee
      const creationFee = parseEther("0.001");

      // Get player contract address
      const playerContractAddress = process.env
        .NEXT_PUBLIC_PLAYER_CONTRACT_ADDRESS as `0x${string}`;

      if (!playerContractAddress) {
        throw new Error("Player contract address not configured");
      }

      // Use nameSetB flag - determines which name set to use
      const useNameSetB = false;

      // Get provider for the embedded wallet
      const provider = await embeddedWallet.getEthereumProvider();

      // Encode function data for the contract call
      const data = encodeFunctionData({
        abi: PlayerABI,
        functionName: "requestCreatePlayer",
        args: [useNameSetB],
      });

      // Create transaction request
      const transactionRequest = {
        to: playerContractAddress,
        data,
        value: creationFee,
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
      toast.success("Character creation submitted", {
        description:
          "Your character creation request has been submitted to the blockchain.",
        action: {
          label: "View on BaseScan",
          onClick: () =>
            window.open(`https://sepolia.basescan.org/tx/${txHash}`, "_blank"),
        },
        duration: 5000,
      });

      queryClient.invalidateQueries({
        queryKey: ["owned-players", embeddedWallet?.address],
      });

      // Show final success toast
      toast.success("Character created successfully!", {
        description: "Your new character is now ready for battle.",
        duration: 3000,
      });
    },

    onError: (error) => {
      console.error("Error creating character:", error);

      // Show error toast
      toast.error("Error creating character", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    },
  });

  const createCharacter = async () => {
    if (!authenticated) {
      toast.error("Authentication required", {
        description: "Please connect your wallet to create a character.",
      });
      return;
    }

    mutation.mutate();
  };

  return {
    createCharacter,
    isCreatingCharacter: mutation.isPending,
    txHash: mutation.data?.txHash || null,
    error: mutation.error,
  };
}
