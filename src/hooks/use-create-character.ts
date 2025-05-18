import { viemClient } from "@/config";
import { PlayerABI } from "@/game/abi/PlayerABI.abi";
import { useWallet } from "@/hooks/use-wallet";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { parseEther, parseAbiItem } from "viem";
import { useRouter } from "next/navigation";
import {
  useCharacterCreationActions,
  type CharacterCreationEventData,
} from "@/stores/character-creation-store";
import {
  FighterType,
  type Fighter,
  type RawFighterData,
} from "@/types/fighter-types";
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
import { baseSepolia } from "wagmi/chains";
import { ownPlayerKeys } from "./use-own-players";

// --- Constants ---
const PLAYER_CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_PLAYER_CONTRACT_ADDRESS as `0x${string}`;

// --- Type Definitions ---
interface CreateCharacterResult {
  txHash: string;
  requestId?: bigint;
}

type NamePreference = "male" | "female";

interface CreateCharacterStatus {
  createCharacter: (namePreference: NamePreference) => Promise<void>;
  isCreatingCharacter: boolean;
  txHash: `0x${string}` | string | null;
  error: Error | null;
}

// --- Mutation Keys ---
const characterKeys = {
  all: ["characters"] as const,
  mutations: () => [...characterKeys.all, "mutations"] as const,
  create: () => [...characterKeys.mutations(), "create"] as const,
};

// --- Helper Functions ---
function showTransactionToast(
  title: string,
  description: string,
  txHash?: string,
) {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const toastOptions: any = {
    description,
    duration: 5000,
  };

  if (txHash) {
    const isTestnet =
      process.env.NEXT_PUBLIC_ALCHEMY_NETWORK === "base-sepolia";
    const explorerLabel = isTestnet
      ? "View on BaseSepoliaScan"
      : "View on ShapeScan";

    toastOptions.action = {
      label: explorerLabel,
      onClick: () =>
        window.open(
          `${process.env.NEXT_PUBLIC_EXPLORER_URL}/tx/${txHash}`,
          "_blank",
        ),
    };
  }

  toast.success(title, toastOptions);
}

export function useCreateCharacter(): CreateCharacterStatus {
  const { isConnected, address } = useAccount();
  const { isWrongNetwork, switchToPrimaryNetwork } = useWallet();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [pendingCharacter, setPendingCharacter] =
    useState<CreateCharacterResult | null>(null);

  // Character creation store actions
  const { startListening, markAsTimedOut, setListenerTimeout } =
    useCharacterCreationActions();

  // Define the blockchain event to listen for
  const playerCreationRequestedEvent = parseAbiItem(
    "event PlayerCreationRequested(uint256 indexed requestId, address indexed requester)",
  );

  // Contract interaction hooks
  const {
    writeContractAsync,
    data: writeData,
    isError: isWriteError,
    error: writeError,
    isPending: isWritePending,
  } = useWriteContract();

  const {
    data: txReceipt,
    isLoading: isWaitingForTx,
    isSuccess: isReceiptReady,
  } = useWaitForTransactionReceipt({
    hash: writeData,
  });

  // Get default skin collection for new characters
  const { collection: defaultPlayerSkinCollection } =
    useGameOwnedSkinCollection(SkinType.DefaultPlayer);

  // Process transaction receipt to extract requestId
  useEffect(() => {
    async function processTransactionReceipt() {
      if (!pendingCharacter || !txReceipt || !address) return;

      try {
        const logs = await viemClient.getLogs({
          address: PLAYER_CONTRACT_ADDRESS,
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
        const completeCharacter: CreateCharacterResult = {
          txHash: pendingCharacter.txHash,
          requestId,
        };

        setPendingCharacter(null);
        handleCharacterCreationSuccess(completeCharacter);
      } catch (error) {
        console.error("Error processing transaction receipt:", error);
        toast.error("Error processing character creation", {
          description: "Failed to extract character details from transaction.",
        });
      }
    }

    processTransactionReceipt();
  }, [txReceipt, pendingCharacter, address, playerCreationRequestedEvent]);

  // Function to handle successful character creation
  const handleCharacterCreationSuccess = ({
    txHash,
    requestId,
  }: CreateCharacterResult) => {
    if (!requestId) {
      console.error("Missing requestId for character creation");
      return;
    }

    // // Show toast for successful transaction
    // showTransactionToast(
    //   "Character creation submitted",
    //   "Your character creation request has been submitted to the blockchain.",
    //   txHash,
    // );

    // Navigate to the loading screen FIRST - before starting to listen
    router.push("/characters/creating");

    // Start listening for character creation event
    startListening(
      requestId,
      async (
        playerId: string,
        eventData: CharacterCreationEventData | null,
      ) => {
        if (eventData && address) {
          // Extract character attributes from event data
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

          // Fetch character names
          let names = { firstName: "Unknown", surname: "Fighter" };
          let retries = 3;

          while (retries > 0 && names.firstName === "Unknown") {
            names = await fetchNamesByIndices(firstNameIndex, surnameIndex);
            if (names.firstName === "Unknown") {
              retries--;
              if (retries > 0) {
                await delay(500);
              } else {
                console.warn(
                  "Failed to fetch character name after multiple retries.",
                );
              }
            }
          }

          // Construct fighter data
          const rawFighterData: RawFighterData = {
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
            firstName: names.firstName,
            surname: names.surname,
            currentSkin: {
              collection: {
                id: defaultPlayerSkinCollection?.registryId || "0",
                contractAddress:
                  defaultPlayerSkinCollection?.contractAddress ||
                  "0x0000000000000000000000000000000000000000",
                isVerified: true,
                skinType:
                  defaultPlayerSkinCollection?.skinType ||
                  SkinType.DefaultPlayer,
                requiredNFTAddress:
                  defaultPlayerSkinCollection?.requiredNFTAddress || null,
              },
              tokenId: defaultPlayerSkinCollection?.skins?.[0]?.tokenId || 0,
              metadataURI:
                defaultPlayerSkinCollection?.skins?.[0]?.metadataURI || "",
              weapon:
                defaultPlayerSkinCollection?.skins?.[0]?.weapon ||
                WeaponType.Quarterstaff,
              armor:
                defaultPlayerSkinCollection?.skins?.[0]?.armor ||
                ArmorType.Cloth,
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

          // Convert to Fighter and update cache
          const newPlayer = await convertRawFighterToFighter(rawFighterData);
          updatePlayerCache(address, playerId, newPlayer);

          // Show success notification
          toast.success("Character created successfully!", {
            description: "Your new character is ready for battle.",
            duration: 4000,
          });

          // Navigate to character page
          router.push(`/character/${playerId}`);
        } else {
          console.warn("Missing event data for player creation");
          if (playerId) router.push(`/character/${playerId}`);
        }
      },
    );

    // Set timeout for character creation
    const timeoutId = window.setTimeout(() => {
      markAsTimedOut();
      toast.error("Character creation timeout", {
        description:
          "The character creation is taking longer than expected. You can check back later.",
      });
    }, 60000);

    setListenerTimeout(timeoutId);
  };

  // Helper function to update the player cache
  function updatePlayerCache(
    address: string,
    playerId: string,
    newPlayer: Fighter,
  ) {
    // Update owned players list
    queryClient.setQueryData(
      ownPlayerKeys.own(address),
      (oldData: Fighter[] | undefined) => {
        if (!oldData) return [newPlayer];
        return [...oldData, newPlayer];
      },
    );

    // Store individual player
    queryClient.setQueryData(["player", playerId], newPlayer);
  }

  // Create mutation for character creation
  const mutation = useMutation<CreateCharacterResult, Error, NamePreference>({
    mutationKey: characterKeys.create(),
    mutationFn: async (
      namePreference: NamePreference,
    ): Promise<CreateCharacterResult> => {
      if (!isConnected) {
        throw new Error("Authentication required");
      }

      if (isWrongNetwork) {
        await switchToPrimaryNetwork();
      }

      if (!address) {
        throw new Error("No wallet found");
      }

      if (!PLAYER_CONTRACT_ADDRESS) {
        throw new Error("Player contract address not configured");
      }

      // Determine if female names should be used
      const useNameSetB = namePreference === "female";

      try {
        // Submit transaction to create character
        const txHash = await writeContractAsync({
          account: address,
          chain: baseSepolia,
          address: PLAYER_CONTRACT_ADDRESS,
          abi: PlayerABI,
          functionName: "requestCreatePlayer",
          args: [useNameSetB],
          value: parseEther("0.002"),
        });

        return { txHash };
      } catch (error) {
        console.error("Contract error:", error);
        throw error;
      }
    },

    onSuccess: (result) => {
      // Store pending character to process after transaction confirmation
      setPendingCharacter(result);

      // Show transaction submitted toast
      // showTransactionToast(
      //   "Transaction submitted",
      //   "Your character creation transaction has been sent to the blockchain.",
      //   result.txHash,
      // );
    },

    onError: (error) => {
      console.error("Error creating character:", error);
      toast.error("Error creating character", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    },
  });

  const createCharacter = async (namePreference: NamePreference) => {
    if (!isConnected) {
      toast.error("Authentication required", {
        description: "Please connect your wallet to create a character.",
      });
      return;
    }

    mutation.mutate(namePreference);
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
