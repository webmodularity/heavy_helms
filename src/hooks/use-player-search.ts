import { useInfiniteQuery } from "@tanstack/react-query";
import { request } from "graphql-request";
import { SUBGRAPH_URL } from "@/config";
import { SEARCH_ACTIVE_PLAYERS } from "@/lib/gql-queries";
import type { Fighter } from "@/types/fighter-types";
import { useMemo, useCallback } from "react";
import { useDebounce } from "@/hooks/use-debounce";

interface SearchFilters {
  searchTerm?: string;
  weapon?: number;
  armor?: number;
  stance?: number;
  minStrength?: number;
  maxStrength?: number;
  minConstitution?: number;
  maxConstitution?: number;
  minSize?: number;
  maxSize?: number;
  minAgility?: number;
  maxAgility?: number;
  minStamina?: number;
  maxStamina?: number;
  minLuck?: number;
  maxLuck?: number;
}

interface UsePlayerSearchParams extends SearchFilters {
  enabled?: boolean;
  pageSize?: number;
}

interface SearchResponse {
  players: Fighter[];
}

interface WhereClause {
  isRetired: boolean;
  fullName_contains_nocase?: string;
  id?: string;
  currentSkin_?: {
    weapon?: number;
    armor?: number;
  };
  stance?: number;
  strength_gte?: number;
  strength_lte?: number;
  constitution_gte?: number;
  constitution_lte?: number;
  size_gte?: number;
  size_lte?: number;
  agility_gte?: number;
  agility_lte?: number;
  stamina_gte?: number;
  stamina_lte?: number;
  luck_gte?: number;
  luck_lte?: number;
}

export function usePlayerSearch({
  searchTerm = "",
  weapon,
  armor,
  stance,
  minStrength,
  maxStrength,
  minConstitution,
  maxConstitution,
  minSize,
  maxSize,
  minAgility,
  maxAgility,
  minStamina,
  maxStamina,
  minLuck,
  maxLuck,
  enabled = true,
  pageSize = 50,
}: UsePlayerSearchParams = {}) {
  // Debounce the search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: [
      "player-search",
      debouncedSearchTerm,
      weapon,
      armor,
      stance,
      minStrength,
      maxStrength,
      minConstitution,
      maxConstitution,
      minSize,
      maxSize,
      minAgility,
      maxAgility,
      minStamina,
      maxStamina,
      minLuck,
      maxLuck,
      pageSize,
    ],
    queryFn: async ({ pageParam = 0 }) => {
      // Build the where clause dynamically to avoid null values
      const where: WhereClause = {
        isRetired: false,
      };

      // Add search term if provided
      if (debouncedSearchTerm?.trim()) {
        const searchTerm = debouncedSearchTerm.trim();
        // Check if search term is numeric (for ID search)
        if (/^\d+$/.test(searchTerm)) {
          // Search by ID if the term is purely numeric
          where.id = searchTerm;
        } else {
          // Search by name if the term contains non-numeric characters
          where.fullName_contains_nocase = searchTerm;
        }
      }

      // Add equipment filters if provided
      const currentSkin_: Record<string, number> = {};
      if (weapon !== undefined) currentSkin_.weapon = weapon;
      if (armor !== undefined) currentSkin_.armor = armor;
      if (Object.keys(currentSkin_).length > 0) {
        where.currentSkin_ = currentSkin_;
      }

      // Add stance filter if provided
      if (stance !== undefined) {
        where.stance = stance;
      }

      // Add attribute filters if provided
      if (minStrength !== undefined) where.strength_gte = minStrength;
      if (maxStrength !== undefined) where.strength_lte = maxStrength;
      if (minConstitution !== undefined)
        where.constitution_gte = minConstitution;
      if (maxConstitution !== undefined)
        where.constitution_lte = maxConstitution;
      if (minSize !== undefined) where.size_gte = minSize;
      if (maxSize !== undefined) where.size_lte = maxSize;
      if (minAgility !== undefined) where.agility_gte = minAgility;
      if (maxAgility !== undefined) where.agility_lte = maxAgility;
      if (minStamina !== undefined) where.stamina_gte = minStamina;
      if (maxStamina !== undefined) where.stamina_lte = maxStamina;
      if (minLuck !== undefined) where.luck_gte = minLuck;
      if (maxLuck !== undefined) where.luck_lte = maxLuck;

      const variables = {
        first: pageSize,
        skip: pageParam,
        where,
      };

      const response = await request<SearchResponse>(
        SUBGRAPH_URL,
        SEARCH_ACTIVE_PLAYERS,
        variables,
      );

      return response.players;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      // If the last page has fewer items than pageSize, we've reached the end
      if (lastPage.length < pageSize) return undefined;
      // Otherwise, return the next skip value
      return allPages.length * pageSize;
    },
    enabled,
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 300000, // Keep in cache for 5 minutes
  });

  // Flatten the paginated results
  const players = useMemo((): Fighter[] => {
    return data?.pages?.flat() ?? [];
  }, [data]);

  // Reset search function
  const resetSearch = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    players,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    resetSearch,
    totalLoaded: players.length,
  };
}
