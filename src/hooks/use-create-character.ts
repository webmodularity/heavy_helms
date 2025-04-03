import { viemClient } from "@/config";
import { PlayerABI } from "@/game/abi/PlayerABI.abi";
import { useWallet } from "@/hooks/use-wallet";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { parseEther, parseAbiItem } from "viem";
import { useRouter } from "next/navigation";
import { useCharacterCreationActions } from "@/stores/character-creation-store";
import { FighterType, type Fighter } from "@/types/fighter-types";
import { SkinType } from "@/types/skin.types";
import { ArmorType, StanceType, WeaponType } from "@/types/equipment.types";
import {
  convertRawFighterToFighter,
  fetchNamesByIndices,
} from "@/lib/player-api";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import { useEffect, useState } from "react";

interface CreateCharacterResult {
  txHash: string;
  requestId?: bigint;
}

export function useCreateCharacter() {
  const { authenticated } = usePrivy();
  const { isWrongNetwork, switchToBaseSepolia } = useWallet();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { address } = useAccount();
  const [pendingCharacter, setPendingCharacter] =
    useState<CreateCharacterResult | null>(null);

  // Get character creation store actions
  const { startListening, markAsTimedOut, setListenerTimeout } =
    useCharacterCreationActions();

  // Get player contract address
  const playerContractAddress = process.env
    .NEXT_PUBLIC_PLAYER_CONTRACT_ADDRESS as `0x${string}`;

  // Use nameSetB flag - determines which name set to use
  const useNameSetB = false;

  // Using wagmi's useWriteContract hook
  const {
    writeContractAsync,
    data: writeData,
    isError: isWriteError,
    error: writeError,
    isPending: isWritePending,
  } = useWriteContract();

  // Use useWaitForTransactionReceipt to track when the transaction is mined
  const {
    data: txReceipt,
    isLoading: isWaitingForTx,
    isSuccess: isReceiptReady,
  } = useWaitForTransactionReceipt({
    hash: writeData,
  });

  // Define the event
  const playerCreationRequestedEvent = parseAbiItem(
    "event PlayerCreationRequested(uint256 indexed requestId, address indexed requester)",
  );

  // Effect to process the logs once we have the receipt
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    async function processTransactionReceipt() {
      // Only proceed if we have a pending character and a receipt
      if (!pendingCharacter || !txReceipt || !address) return;

      try {
        // Find our event in the transaction logs using viemClient
        const logs = await viemClient.getLogs({
          address: playerContractAddress,
          event: playerCreationRequestedEvent,
          fromBlock: txReceipt.blockNumber,
          toBlock: txReceipt.blockNumber,
        });

        // Find our specific event in the logs
        const requestEvent = logs.find((log) => log.args.requester === address);

        if (!requestEvent || !requestEvent.args.requestId) {
          console.error("Could not find request ID in transaction logs");
          return;
        }

        const requestId = requestEvent.args.requestId;

        // Complete the pending character data
        const completeCharacter = {
          ...pendingCharacter,
          requestId,
        };

        // Clear the pending state
        setPendingCharacter(null);

        // Process the successful creation
        handleCharacterCreationSuccess(completeCharacter);
      } catch (error) {
        console.error("Error processing transaction receipt:", error);
        toast.error("Error processing character creation", {
          description: "Failed to extract character details from transaction.",
        });
      }
    }

    processTransactionReceipt();
  }, [txReceipt, pendingCharacter, address]);

  // Create a mutation for character creation
  const mutation = useMutation({
    mutationFn: async (): Promise<CreateCharacterResult> => {
      if (!authenticated) {
        throw new Error("Authentication required");
      }

      if (isWrongNetwork) {
        await switchToBaseSepolia();
      }

      if (!address) {
        throw new Error("No wallet found");
      }

      if (!playerContractAddress) {
        throw new Error("Player contract address not configured");
      }

      // Execute the contract write and wait for the result
      const txHash = await writeContractAsync({
        account: address,
        address: playerContractAddress,
        abi: PlayerABI,
        functionName: "requestCreatePlayer",
        args: [useNameSetB],
        value: parseEther("0.001"),
      });

      // Return just the txHash - we'll get the requestId later when the receipt is available
      return {
        txHash,
      };
    },

    onSuccess: (result) => {
      // Set the pending character - we'll complete it when the receipt is available
      setPendingCharacter(result);

      // Show the initial success toast
      toast.success("Transaction submitted", {
        description:
          "Your character creation transaction has been sent to the blockchain.",
        action: {
          label: "View on BaseScan",
          onClick: () =>
            window.open(
              `https://sepolia.basescan.org/tx/${result.txHash}`,
              "_blank",
            ),
        },
        duration: 5000,
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

  // Function to handle successful character creation after we have the requestId
  const handleCharacterCreationSuccess = ({
    txHash,
    requestId,
  }: CreateCharacterResult) => {
    if (!requestId) {
      console.error("Missing requestId for character creation");
      return;
    }

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

    // Start listening for PlayerCreationComplete event
    startListening(requestId, async (playerId, eventData) => {
      // Use the event data to create a player object directly
      if (eventData && address) {
        // Extract player data from event
        const {
          firstNameIndex,
          surnameIndex,
          strength,
          constitution,
          size,
          agility,
          stamina,
          luck,
        } = eventData;
        const names = await fetchNamesByIndices(firstNameIndex, surnameIndex);
        const newPlayer = await convertRawFighterToFighter({
          agility,
          constitution,
          stamina,
          firstName: names.firstName,
          surname: names.surname,
          size,
          strength,
          luck,
          wins: 0,
          losses: 0,
          kills: 0,
          fighterId: playerId,
          fighterType: FighterType.Player,
          isRetired: false,
          id: playerId,
          owner: {
            address,
          },
          currentSkin: {
            collection: {
              id: "0",
              contractAddress: process.env
                .NEXT_PUBLIC_DEFAULT_SKIN_CONTRACT_ADDRESS as `0x${string}`,
              isVerified: true,
              skinType: SkinType.DefaultPlayer,
              requiredNFTAddress: null,
            },
            tokenId: 0,
            metadataURI: "",
            weapon: WeaponType.Quarterstaff,
            armor: ArmorType.Cloth,
          },
          stance: StanceType.Balanced,
        });

        // Update the React Query cache for owned players
        queryClient.setQueryData(
          ["owned-players", address],
          (oldData: Fighter[] | undefined) => {
            if (!oldData) return [newPlayer];
            return [...oldData, newPlayer];
          },
        );

        // Also set the individual player in cache
        queryClient.setQueryData(["player", playerId], newPlayer);

        // Show success toast
        toast.success("Character created successfully!", {
          description: "Your new character is ready for battle.",
          duration: 4000,
        });

        // Navigate to the character details page
        router.push(`/character/${playerId}`);
      } else {
        // Fallback if we don't have event data - shouldn't happen
        console.warn("Missing event data for player creation");

        // Still navigate, but without cache update
        router.push(`/character/${playerId}`);
      }
    });

    // Start a 60-second timeout
    const timeoutId = window.setTimeout(() => {
      markAsTimedOut();
      toast.error("Character creation timeout", {
        description:
          "The character creation is taking longer than expected. You can check back later.",
      });
    }, 60000); // 1 minute timeout

    setListenerTimeout(timeoutId);

    // Navigate to the loading screen
    router.push("/characters/creating");
  };

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
    isCreatingCharacter:
      mutation.isPending ||
      isWritePending ||
      isWaitingForTx ||
      !!pendingCharacter,
    txHash: writeData || pendingCharacter?.txHash || null,
    error: mutation.error || writeError,
  };
}
