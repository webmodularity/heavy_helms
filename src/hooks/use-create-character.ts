import { viemClient } from "@/config";
import { PlayerABI } from "@/game/abi/PlayerABI.abi";
import { useWallet } from "@/hooks/use-wallet";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { encodeFunctionData, parseEther, parseAbiItem } from "viem";
import { useRouter } from "next/navigation";
import { useCharacterCreationActions } from "@/stores/character-creation-store";
import { FighterType, type Fighter } from "@/types/fighter-types";
import { SkinType } from "@/types/skin.types";
import { ArmorType, StanceType, WeaponType } from "@/types/equipment.types";
import { convertRawFighterToFighter, fetchNamesByIndices } from "@/lib/player-api";

interface CreateCharacterResult {
  txHash: string;
  requestId: bigint;
}

export function useCreateCharacter() {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const { isWrongNetwork, switchToBaseSepolia } = useWallet();
  const queryClient = useQueryClient();
  const router = useRouter();
  
  // Get character creation store actions
  const { startListening, markAsTimedOut, setListenerTimeout } = useCharacterCreationActions();
  
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
      const receipt = await viemClient.waitForTransactionReceipt({
        hash: hash as `0x${string}`,
      });
      
      // Find the PlayerCreationRequested event to get the requestId
      const playerCreationRequestedEvent = parseAbiItem(
        'event PlayerCreationRequested(uint256 indexed requestId, address indexed requester)'
      );
      
      const logs = await viemClient.getLogs({
        address: playerContractAddress,
        event: playerCreationRequestedEvent,
        fromBlock: receipt.blockNumber,
        toBlock: receipt.blockNumber
      });
      
      // Find our event in the logs
      const requestEvent = logs.find(
        (log) => log.args.requester === embeddedWallet.address
      );
      
      if (!requestEvent || !requestEvent.args.requestId) {
        throw new Error("Could not find request ID in transaction logs");
      }
      
      const requestId = requestEvent.args.requestId;

      return { 
        txHash: hash as string,
        requestId
      };
    },

    onSuccess: async ({ txHash, requestId }) => {
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
        if (eventData && embeddedWallet?.address) {
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
              address: embeddedWallet.address,
            },
            currentSkin: {
              collection: {
                id: "0",
                contractAddress: '0xf2577e75861cc4e960a8f192cbb5a22d549d7487',
                isVerified: true,
                skinType: SkinType.DefaultPlayer,
                requiredNFTAddress: null,
              },
              tokenId: 0,
              metadataURI: "",
              weapon: WeaponType.Quarterstaff,
              armor: ArmorType.Cloth,
              stance: StanceType.Balanced,
            },
          });
          
          // // Create a base player object from event data
          // const newPlayer: Fighter = {
          //   id: playerId,
          //   owner: {
          //     id: embeddedWallet.address.toLowerCase(),
          //   },
          //   attributes: {
          //     strength,
          //     constitution,
          //     size,
          //     agility,
          //     stamina,
          //     luck,
          //   },
          //   name: {
          //     firstName: `Name-${firstNameIndex}`, // Placeholder - will be replaced with actual name
          //     surname: `Surname-${surnameIndex}`, // Placeholder - will be replaced with actual surname
          //     firstNameIndex,
          //     surnameIndex,
          //   },
          //   record: {
          //     wins: 0,
          //     losses: 0,
          //     kills: 0,
          //   },
          //   status: {
          //     isRetired: false,
          //     isImmortal: false,
          //   },
          //   currentSkin: {
          //     armor: ArmorType.Cloth,
              
          //     metadataURL: 
          //     collection: {
          //       id: "0", // Default skin ID
          //       skinType: SkinType.Player,
          //       contractAddress: process.env.NEXT_PUBLIC_PLAYER_CONTRACT_ADDRESS as `0x${string}`,
          //       isVerified: true,
          //     },
          //     tokenId: 0,
          //     imageURL: "/images/default-fighter.png", // Placeholder
          //   },
          //   createdAt: Math.floor(Date.now() / 1000).toString(),
          // };
          
          // Update the React Query cache for owned players
          queryClient.setQueryData(
            ["owned-players", embeddedWallet.address],
            (oldData: Fighter[] | undefined) => {
              if (!oldData) return [newPlayer];
              return [...oldData, newPlayer];
            }
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
          description: "The character creation is taking longer than expected. You can check back later.",
        });
      }, 60000); // 1 minute timeout
      
      setListenerTimeout(timeoutId);
      
      // Navigate to the loading screen
      router.push("/characters/creating");
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
