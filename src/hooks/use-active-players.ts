import { SUBGRAPH_URL } from "@/config";
import { GET_ACTIVE_PLAYERS_QUERY } from "@/lib/gql-queries";
import { convertRawPlayerToPlayer } from "@/lib/player-api";
import type { Player, RawPlayerData } from "@/types/player.types";
import { useQuery } from "@tanstack/react-query";
import request from "graphql-request";
import { usePrivy } from "@privy-io/react-auth";
import { useState, useMemo } from "react";

export type SortField = "name" | "strength" | "agility" | "stamina" | "wins" | "losses";
export type SortDirection = "asc" | "desc";

export function useActivePlayers() {
  const { authenticated } = usePrivy();
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all active players
  const {
    data: players,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["active-players"],
    queryFn: async () => {
      try {
        // Fetch the active players from the GraphQL API
        const { players } = await request<{ players: RawPlayerData[] }>(
          SUBGRAPH_URL,
          GET_ACTIVE_PLAYERS_QUERY
        );

        // If no players found, return empty array
        if (!players || players.length === 0) {
          return [];
        }

        // Convert the raw player data to Player objects
        const convertedPlayers = await Promise.all(
          players.map((player) => convertRawPlayerToPlayer(player))
        );

        return convertedPlayers;
      } catch (error) {
        console.error("Error fetching active players:", error);
        throw error;
      }
    },
    enabled: !!authenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Sort and filter players
  const sortedAndFilteredPlayers = useMemo(() => {
    if (!players) return [];

    let filteredPlayers = players;

    // Apply search filter if there is a search term
    if (searchTerm) {
      const lowercaseSearchTerm = searchTerm.toLowerCase();
      filteredPlayers = players.filter((player) =>
        player.name.fullName?.toLowerCase().includes(lowercaseSearchTerm)
      );
    }

    // Sort the players
    return [...filteredPlayers].sort((a, b) => {
      let valueA: string | number;
      let valueB: string | number;

      // Extract values based on sort field
      switch (sortField) {
        case "name":
          valueA = a.name.fullName || "";
          valueB = b.name.fullName || "";
          break;
        case "strength":
          valueA = a.attributes.strength;
          valueB = b.attributes.strength;
          break;
        case "agility":
          valueA = a.attributes.agility;
          valueB = b.attributes.agility;
          break;
        case "stamina":
          valueA = a.attributes.stamina;
          valueB = b.attributes.stamina;
          break;
        case "wins":
          valueA = a.record.wins;
          valueB = b.record.wins;
          break;
        case "losses":
          valueA = a.record.losses;
          valueB = b.record.losses;
          break;
        default:
          valueA = a.name.fullName || "";
          valueB = b.name.fullName || "";
      }

      // Compare values based on sort direction
      if (sortDirection === "asc") {
        if (typeof valueA === "string") {
          return valueA.localeCompare(valueB as string);
        }
        return valueA - (valueB as number);
      }
      
      // Handle descending sort
      if (typeof valueA === "string") {
        return (valueB as string).localeCompare(valueA);
      }
      return (valueB as number) - valueA;
    });
  }, [players, sortField, sortDirection, searchTerm]);

  // Handle sorting
  const handleSort = (field: SortField) => {
    // If clicking the same field, toggle direction
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // If clicking a new field, set it and default to ascending
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return {
    players: sortedAndFilteredPlayers,
    isLoading,
    error,
    refetch,
    sortField,
    sortDirection,
    handleSort,
    searchTerm,
    setSearchTerm,
  };
} 