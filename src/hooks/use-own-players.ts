import { useQuery } from "@tanstack/react-query";
import {
  fetchFightersByOwner,
  convertRawFighterToFighter,
} from "@/lib/player-api";
import { useAccount } from "wagmi";
import type { Fighter } from "@/types/fighter-types";

// --- Query Keys ---
const playerKeys = {
  all: ["players"] as const,
  lists: () => [...playerKeys.all, "list"] as const,
  own: (address?: string) => [...playerKeys.lists(), "owned", address] as const,
};

export function useOwnPlayers() {
  const { address } = useAccount();

  const {
    data: players,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: playerKeys.own(address),
    queryFn: async (): Promise<Fighter[]> => {
      if (!address) return [];

      try {
        const rawPlayers = await fetchFightersByOwner(address);
        return await Promise.all(rawPlayers.map(convertRawFighterToFighter));
      } catch (error) {
        console.error("Error fetching owned players:", error);
        throw error;
      }
    },
    enabled: !!address,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  return {
    players,
    isLoading,
    error,
    refetch,
  };
}
