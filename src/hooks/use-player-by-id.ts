import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GET_PLAYERS_BY_IDS } from "@/lib/gql-queries";
import { convertRawPlayerToPlayer } from "@/lib/player-api";
import request from "graphql-request";
import type { Player, RawPlayerData } from "@/types/player.types";
import { SUBGRAPH_URL } from "@/config";
import { useWallets } from "@privy-io/react-auth";

// Initialize GraphQL client

/**
 * Custom hook to fetch a player by ID, first checking the cache
 * and only making an API call if the player isn't found
 */
export function usePlayerById(playerId: string) {
  const queryClient = useQueryClient();
  // Get the connected wallet address
  const { wallets } = useWallets();
  const address = wallets?.find(
    (wallet) => wallet.connectorType === "embedded",
  )?.address;

  return useQuery({
    queryKey: ["player", playerId],
    queryFn: async () => {
      // First check if the player is in the context
      const characters = queryClient.getQueryData<Player[]>([
        "owned-players",
        address,
      ]);

      if (characters && characters.length > 0) {
        const foundCharacter = characters.find((char) => char.id === playerId);
        if (foundCharacter) {
          console.log("Found character in context:", foundCharacter);
          return foundCharacter;
        }
      }

      // Player not found in context, fetch from API
      try {
        // Fetch the player data from the GraphQL API
        const { players } = await request<{ players: RawPlayerData[] }>(
          SUBGRAPH_URL,
          GET_PLAYERS_BY_IDS,
          { playerIds: [playerId] },
        );

        // If no player found, return null
        if (!players || players.length === 0) {
          return null;
        }

        // Convert the raw player data to a Player object
        const player = await convertRawPlayerToPlayer(players[0]);
        console.log("Fetched player:", player);
        return player;
      } catch (error) {
        console.error("Error fetching player:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}
