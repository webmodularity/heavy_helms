import { viemClient } from "@/config";
import { DuelGameABI } from "@/game/abi/DuelGameABI.abi";
import { useWallet } from "@/hooks/use-wallet";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  type Address,
  decodeEventLog,
  encodeFunctionData,
  formatEther,
  parseEther,
  type TransactionRequest,
} from "viem";
import type { Player } from "@/types/player.types";

// This is a placeholder - replace with your actual contract address
const DUEL_GAME_CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_DUEL_GAME_CONTRACT_ADDRESS as `0x${string}`;

interface CreateChallengeParams {
  character: Player;
  defenderId: number;
  wagerAmount: string;
}

interface CreateChallengeResult {
  txHash: string;
  createdChallenge: ChallengeCreatedEvent["args"];
  challengerId?: string;
}

interface ChallengeCreatedEvent {
  event: string;
  args: {
    challengeId: bigint;
    challengerId: number;
    defenderId: number;
    wagerAmount: bigint;
    createdAtBlock: bigint;
  };
}

export function useCreateChallenge() {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const { isWrongNetwork, switchToBaseSepolia } = useWallet();
  const queryClient = useQueryClient();

  // Find embedded wallet
  const embeddedWallet = wallets?.find(
    (wallet) => wallet.connectorType === "embedded",
  );

  // Create a mutation for challenge creation
  const mutation = useMutation({
    mutationFn: async ({
      character,
      defenderId,
      wagerAmount,
    }: CreateChallengeParams): Promise<CreateChallengeResult> => {
      if (!authenticated) {
        throw new Error("Authentication required");
      }

      if (isWrongNetwork) {
        await switchToBaseSepolia();
      }

      if (!embeddedWallet) {
        throw new Error("No embedded wallet found");
      }

      // Convert wager amount to wei
      const wagerValue = parseEther(wagerAmount);
      console.log("character", character);
      // Create the loadout from the selected character
      const challengerLoadout = {
        playerId: Number(character.id),
        skin: {
          skinIndex: Number(character.currentSkin.collection.id),
          skinTokenId: character.currentSkin.tokenId,
        },
      };
      console.log("challengerLoadout", challengerLoadout);
      console.log("defenderId", defenderId);
      console.log("typeof defenderId", typeof defenderId);
      // Encode function data for the contract call
      const data = encodeFunctionData({
        abi: DuelGameABI,
        functionName: "initiateChallenge",
        args: [challengerLoadout, defenderId, wagerValue],
      });

      // Get provider for the embedded wallet
      const provider = await embeddedWallet.getEthereumProvider();

      // Create transaction request
      const transactionRequest: TransactionRequest = {
        to: DUEL_GAME_CONTRACT_ADDRESS,
        data,
        value: wagerValue + parseEther("0.0002"),
      };

      // Send transaction using the provider
      const hash = await provider.request({
        method: "eth_sendTransaction",
        params: [transactionRequest],
      });

      console.log("hash", hash);

      // Wait for transaction to be mined
      const receipt = await viemClient.waitForTransactionReceipt({
        hash: hash as `0x${string}`,
      });

      // Parse logs to find the event containing the challenge ID
      const challengeCreatedEvent = decodeEventLog({
        abi: DuelGameABI,
        data: receipt.logs[0].data,
        topics: receipt.logs[0].topics,
      }) as unknown as ChallengeCreatedEvent;
      console.log("challengeCreatedEvent", challengeCreatedEvent);

      // Access the relevant argument from the event (adjust index as needed)
      // const challengeId = challengeCreatedEvent.args.challengeId;

      return {
        txHash: hash as string,
        challengerId: character.id,
        createdChallenge: challengeCreatedEvent.args,
      };
    },

    onSuccess: async ({ txHash, challengerId, createdChallenge }) => {
      toast.success("Challenge created successfully", {
        description:
          "Your challenge has been created and is now waiting for acceptance.",
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

        // Note: instead of just invalidating the fighter-challenges query, we should manually insert the new challenge into the cache (as subgraph is slow to index new data)
        // queryClient.invalidateQueries({
        //   queryKey: ["fighter-challenges", challengerId],
        // });

        queryClient.setQueryData(
          ["fighter-challenges", challengerId],
          // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          (oldData: any) => {
            return [
              ...oldData,
              {
                id: createdChallenge.challengeId,
                challengerId: Number(createdChallenge.challengerId),
                defenderId: Number(createdChallenge.defenderId),
                wagerAmount: createdChallenge.wagerAmount,
                createdBlock: createdChallenge.createdAtBlock,
                fulfilled: false,
              },
            ];
          },
        );
      }
    },

    onError: (error) => {
      console.error("Error creating challenge:", error);

      // Show error toast
      toast.error("Error creating challenge", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    },
  });

  const createChallenge = async (params: CreateChallengeParams) => {
    if (!authenticated) {
      toast.error("Authentication required", {
        description: "Please connect your wallet to create a challenge.",
      });
      return;
    }

    mutation.mutate(params);
  };

  return {
    createChallenge,
    isCreatingChallenge: mutation.isPending,
    txHash: mutation.data?.txHash || null,
    error: mutation.error,
  };
}
