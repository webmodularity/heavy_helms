import { useQuery } from "@tanstack/react-query";
import { request } from "graphql-request";
import { GET_QUEUED_GAUNTLET_PLAYERS } from "@/lib/gql-queries";
import { SUBGRAPH_URL } from "@/config";
import type { Fighter, RawFighterData } from "@/types/fighter-types";
import { convertRawFighterToFighter } from "@/lib/player-api";

interface QueuedGauntletPlayersQueryResponse {
  fighters: RawFighterData[]; // GQL query is for 'players', but let's see what the response object calls it
  players?: RawFighterData[]; // Add this if the response key is 'players'
}

export function useQueuedGauntletPlayers() {
  return useQuery<Fighter[], Error>({
    queryKey: ["queuedGauntletPlayers"],
    queryFn: async (): Promise<Fighter[]> => {
      if (!SUBGRAPH_URL) {
        // This will put the query into an error state, which can be handled by the component.
        throw new Error("Subgraph URL is not configured.");
      }
      try {
        const response = await request<QueuedGauntletPlayersQueryResponse>(
          SUBGRAPH_URL,
          GET_QUEUED_GAUNTLET_PLAYERS,
        );

        // Determine the correct key for the player list
        const rawPlayersList = response.players || response.fighters;

        if (!rawPlayersList || rawPlayersList.length === 0) {
          return [];
        }


        const mappedFighters = await Promise.all(
          rawPlayersList.map(async (rawPlayer, index) => {
            try {
              const fighter = await convertRawFighterToFighter(rawPlayer);
              return fighter;
            } catch (mappingError) {
              console.error(
                `Error mapping player at index ${index} (ID: ${rawPlayer.id}):`,
                mappingError,
              );
              // Decide how to handle individual mapping errors:
              // Option 1: Skip this player and return null (filter out later)
              // return null;
              // Option 2: Throw to fail the whole Promise.all (current behavior if not caught here)
              throw mappingError;
            }
          }),
        );
        return mappedFighters;
      } catch (error) {
        console.error("Error in useQueuedGauntletPlayers queryFn:", error);
        throw error;
      }
    },
    staleTime: 30000, // Data considered fresh for 30 seconds
    refetchInterval: 30000, // Refetch data every 30 seconds
    refetchOnWindowFocus: true, // Refetch on window focus for up-to-date data
  });
}
