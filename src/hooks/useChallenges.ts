import { viemClient } from "@/config";
import { DuelGameABI } from "@/game/abi/DuelGameABI.abi";
import { useWallet } from "@/hooks/use-wallet";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { formatEther } from "viem";

// This is a placeholder - replace with your actual contract address
const DUEL_GAME_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_DUEL_GAME_ADDRESS as `0x${string}`;

export interface Challenge {
  id: bigint;
  challengerId: number;
  defenderId: number;
  wagerAmount: bigint;
  createdBlock: bigint;
  fulfilled: boolean;
  challengerLoadout: {
    playerId: number;
    skin: {
      skinIndex: number;
      skinTokenId: number;
    };
  };
  defenderLoadout: {
    playerId: number;
    skin: {
      skinIndex: number;
      tokenId: number;
    };
  };
}

export function useChallenges() {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const { isWrongNetwork, switchToBaseSepolia } = useWallet();
  
  // Find embedded wallet
  const embeddedWallet = wallets?.find(
    (wallet) => wallet.connectorType === "embedded",
  );
  
  const walletAddress = embeddedWallet?.address as `0x${string}` | undefined;

  // Fetch active challenges
  const { 
    data: challenges, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ["active-challenges", walletAddress],
    queryFn: async () => {
      if (!authenticated || !walletAddress) {
        return [];
      }

      try {
        // First get challenge IDs
        const challengeIds = await viemClient.readContract({
          address: DUEL_GAME_CONTRACT_ADDRESS,
          abi: DuelGameABI,
          functionName: 'getUserActiveChallenges',
          args: [walletAddress],
          account: walletAddress,
        }) as bigint[];

        console.log('challengeIds', challengeIds)
        if (!challengeIds || challengeIds.length === 0) {
          return [];
        }

        // Then fetch details for each challenge
        const challengesData = await Promise.all(
          challengeIds.map(async (id) => {
            const challengeData = await viemClient.readContract({
              address: DUEL_GAME_CONTRACT_ADDRESS,
              abi: DuelGameABI,
              functionName: 'challenges',
              args: [id],
            });
            
            // Format the challenge data
            // Note: This assumes the 'challenges' function returns data in the order
            // defined in the ABI which matches our Challenge interface
            return {
              id,
              // Map the returned array to our object structure
              ...(challengeData as any)
            };
          })
        );

        return challengesData;
      } catch (error) {
        console.error('Error fetching challenges:', error);
        throw error;
      }
    },
    enabled: !!walletAddress,
    staleTime: 5 * 60 * 1000, // 5 minutes stale time as requested
  });

  return {
    challenges: challenges || [],
    isLoading,
    error,
    refetch,
  };
}