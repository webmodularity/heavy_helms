import { useQuery, useQueryClient } from '@tanstack/react-query';
import { GET_PLAYERS_BY_IDS } from '@/lib/gql-queries';
import { convertRawPlayerToPlayer } from '@/lib/player-api';
import { GraphQLClient } from 'graphql-request';
import type { Character, RawPlayerData } from '@/types/player.types';
import { usePlayer } from '@/store/player-context';

// Initialize GraphQL client
const endpoint = process.env.NEXT_PUBLIC_SUBGRAPH_URL || '';
const graphQLClient = new GraphQLClient(endpoint);

/**
 * Custom hook to fetch a player by ID, first checking the cache
 * and only making an API call if the player isn't found
 */
export function usePlayerById(playerId: string) {
  const { characters, isLoading: isLoadingCharacters } = usePlayer();

  return useQuery({
    queryKey: ['player', playerId],
    queryFn: async () => {
      // First check if the player is in the context
      if (characters && characters.length > 0) {
        const foundCharacter = characters.find(char => char.id === playerId);
        if (foundCharacter) {
          return foundCharacter;
        }
      }

      // Player not found in context, fetch from API
      try {
        // Fetch the player data from the GraphQL API
        const { players } = await graphQLClient.request<{ players: RawPlayerData[] }>(
          GET_PLAYERS_BY_IDS, 
          { playerIds: [playerId] }
        );

        // If no player found, return null
        if (!players || players.length === 0) {
          return null;
        }

        // Convert the raw player data to a Player object
        const player = await convertRawPlayerToPlayer(players[0]);
        return player;
      } catch (error) {
        console.error('Error fetching player:', error);
        throw error;
      }
    },
    // Only run the query when the player context is done loading
    enabled: !isLoadingCharacters,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  });
} 