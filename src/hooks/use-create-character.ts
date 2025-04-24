import { viemClient } from "@/config";
import { PlayerABI } from "@/game/abi/PlayerABI.abi";
import { useWallet } from "@/hooks/use-wallet";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { parseEther, parseAbiItem } from "viem";
import { useRouter } from "next/navigation";
import {
  useCharacterCreationActions,
  type CharacterCreationEventData,
} from "@/stores/character-creation-store";
import { FighterType, type Fighter, type RawFighterData } from "@/types/fighter-types";
import { SkinType } from "@/types/skin.types";
import { ArmorType, StanceType, WeaponType } from "@/types/equipment.types";
import {
  convertRawFighterToFighter,
  fetchNamesByIndices,
} from "@/lib/player-api";
import { delay } from "@/lib/utils";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import { useEffect, useState } from "react";
import { useGameOwnedSkinCollection } from "./use-game-owned-skin-collection";

// Reverted Interface - No namePreference needed here
interface CreateCharacterResult {
  txHash: string;
  requestId?: bigint;
}

// Define type for name preference (needed for mutation input)
type NamePreference = 'male' | 'female';

export function useCreateCharacter() {
  const { authenticated } = usePrivy();
  const { isWrongNetwork, switchToPrimaryNetwork } = useWallet();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { address } = useAccount();
  // Reverted pending state - no namePreference needed
  const [pendingCharacter, setPendingCharacter] =
    useState<CreateCharacterResult | null>(null);

  // Get character creation store actions
  const { startListening, markAsTimedOut, setListenerTimeout } =
    useCharacterCreationActions();

  // Get player contract address
  const playerContractAddress = process.env
    .NEXT_PUBLIC_PLAYER_CONTRACT_ADDRESS as `0x${string}`;

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
  useEffect(() => {
    async function processTransactionReceipt() {
      if (!pendingCharacter || !txReceipt || !address) return;
      try {
        const logs = await viemClient.getLogs({
          address: playerContractAddress,
          event: playerCreationRequestedEvent,
          fromBlock: txReceipt.blockNumber,
          toBlock: txReceipt.blockNumber,
        });
        const requestEvent = logs.find((log) => log.args.requester === address);
        if (!requestEvent || !requestEvent.args.requestId) {
          console.error("Could not find request ID in transaction logs");
          return;
        }
        const requestId = requestEvent.args.requestId;

        // Complete character data - no namePreference needed
        const completeCharacter: CreateCharacterResult = {
          txHash: pendingCharacter.txHash,
          requestId,
        };
        setPendingCharacter(null); // Clear pending state
        handleCharacterCreationSuccess(completeCharacter); // Pass simplified data
      } catch (error) {
        console.error("Error processing transaction receipt:", error);
        toast.error("Error processing character creation", {
          description: "Failed to extract character details from transaction.",
        });
      }
    }
    processTransactionReceipt();
  }, [
      txReceipt, 
      pendingCharacter, 
      address, 
      playerContractAddress,
      playerCreationRequestedEvent
    ]);

  // Create a mutation for character creation
  const mutation = useMutation<CreateCharacterResult, Error, NamePreference>({
    mutationFn: async (namePreference: NamePreference): Promise<CreateCharacterResult> => {
      if (!authenticated) {
        throw new Error("Authentication required");
      }
      if (isWrongNetwork) {
        await switchToPrimaryNetwork();
      }
      if (!address) {
        throw new Error("No wallet found");
      }
      if (!playerContractAddress) {
        throw new Error("Player contract address not configured");
      }

      // Determine useNameSetB for the contract call
      const useNameSetB = namePreference === 'female';

      const txHash = await writeContractAsync({
        account: address,
        address: playerContractAddress,
        abi: PlayerABI,
        functionName: "requestCreatePlayer",
        args: [useNameSetB],
        value: parseEther("0.002"),
      });

      // Return only txHash
      return { txHash };
    },
    onSuccess: (result) => {
      // Reverted onSuccess - only set txHash/requestId
      setPendingCharacter(result);
      // ... toast ...
       toast.success("Transaction submitted", {
        description:
          "Your character creation transaction has been sent to the blockchain.",
        action: {
          label:
            process.env.NEXT_PUBLIC_ALCHEMY_NETWORK === "base-sepolia"
              ? "View on BaseSepoliaScan"
              : "View on ShapeScan",
          onClick: () =>
            window.open(
              `${process.env.NEXT_PUBLIC_EXPLORER_URL}/tx/${result.txHash}`,
              "_blank",
            ),
        },
        duration: 5000,
      });
    },
    onError: (error) => {
      console.error("Error creating character:", error);
      toast.error("Error creating character", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    },
  });

  // Function to handle successful character creation
  // Reverted signature - no namePreference needed
  const handleCharacterCreationSuccess = ({
    txHash,
    requestId,
  }: CreateCharacterResult) => {
    if (!requestId) {
      console.error("Missing requestId for character creation");
      return;
    }

    // ... toast ...
    toast.success("Character creation submitted", {
        description:
          "Your character creation request has been submitted to the blockchain.",
        action: {
          label:
            process.env.NEXT_PUBLIC_ALCHEMY_NETWORK === "base-sepolia"
              ? "View on BaseSepoliaScan"
              : "View on ShapeScan",
          onClick: () =>
            window.open(
              `${process.env.NEXT_PUBLIC_EXPLORER_URL}/tx/${txHash}`,
              "_blank",
            ),
        },
        duration: 5000,
      });

    // Corrected startListening call
    startListening(requestId, async (playerId: string, eventData: CharacterCreationEventData | null) => {
      if (eventData && address) {
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

        // Fetch names - Corrected call without useNameSetB
        let names = { firstName: "Unknown", surname: "Fighter" };
        let retries = 3;
        while (retries > 0 && names.firstName === "Unknown") {
          // Call fetchNamesByIndices with only indices
          names = await fetchNamesByIndices(firstNameIndex, surnameIndex);
          if (names.firstName === "Unknown") {
            retries--;
            if (retries > 0) {
              console.log(`Name fetch returned Unknown, retrying... (${retries} left)`);
              await delay(500); // Keep delay
            } else {
              console.warn("Failed to fetch character name after multiple retries.");
            }
          }
        }

        // Construct raw data for conversion
        const rawFighterDataForConversion: RawFighterData = {
          id: playerId,
          fighterId: playerId,
          fighterType: FighterType.Player,
          isRetired: false,
          strength,
          constitution,
          size,
          agility,
          stamina,
          luck,
          firstName: names.firstName, // Use fetched name
          surname: names.surname,
          currentSkin: {
            collection: {
              id: defaultPlayerSkinCollection?.registryId || "0",
              contractAddress: defaultPlayerSkinCollection?.contractAddress || "0x0000000000000000000000000000000000000000",
              isVerified: true,
              skinType: defaultPlayerSkinCollection?.skinType || SkinType.DefaultPlayer,
              requiredNFTAddress: defaultPlayerSkinCollection?.requiredNFTAddress || null,
            },
            tokenId: defaultPlayerSkinCollection?.skins?.[0]?.tokenId || 0,
            metadataURI: defaultPlayerSkinCollection?.skins?.[0]?.metadataURI || "",
            weapon: defaultPlayerSkinCollection?.skins?.[0]?.weapon || WeaponType.Quarterstaff,
            armor: defaultPlayerSkinCollection?.skins?.[0]?.armor || ArmorType.Cloth,
          },
          stance: StanceType.Balanced,
          wins: 0,
          losses: 0,
          kills: 0,
          owner: { address },
          isImmortal: false,
          fullName: `${names.firstName} ${names.surname}`,
          battleRating: 0,
        };

        const newPlayer = await convertRawFighterToFighter(rawFighterDataForConversion);

        // ... update cache ...
        queryClient.setQueryData(
            ["owned-players", address],
            (oldData: Fighter[] | undefined) => {
              if (!oldData) return [newPlayer];
              return [...oldData, newPlayer];
            },
          );
        queryClient.setQueryData(["player", playerId], newPlayer);

        // ... toast ...
        toast.success("Character created successfully!", {
          description: "Your new character is ready for battle.",
          duration: 4000,
        });
        // ... navigate ...
        router.push(`/character/${playerId}`);
      } else {
        console.warn("Missing event data for player creation");
        if (playerId) router.push(`/character/${playerId}`); // Navigate even if data missing
      }
    });

    // ... timeout logic ...
    const timeoutId = window.setTimeout(() => {
        markAsTimedOut();
        toast.error("Character creation timeout", {
          description:
            "The character creation is taking longer than expected. You can check back later.",
        });
      }, 60000);
    setListenerTimeout(timeoutId);

    router.push("/characters/creating");
  };

  // createCharacter accepts preference for the mutation call
  const createCharacter = async (namePreference: NamePreference) => {
    if (!authenticated) {
      toast.error("Authentication required", {
        description: "Please connect your wallet to create a character.",
      });
      return;
    }
    mutation.mutate(namePreference);
  };

  const { collection: defaultPlayerSkinCollection } =
    useGameOwnedSkinCollection(SkinType.DefaultPlayer);

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
