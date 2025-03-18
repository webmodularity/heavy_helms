import { useWallets } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import type { Player, RawPlayerData } from "@/types/player.types";
import { useQuery } from "@tanstack/react-query";
import {
  fetchPlayersByOwner,
  convertRawPlayerToPlayer,
} from "@/lib/player-api";

// Define the GraphQL response type
interface OwnedPlayersResponse {
  owners: {
    address: string;
    totalPlayers: number;
    activePlayers: RawPlayerData[];
  }[];
}

export function useSubgraphPlayers() {
  // Get the connected wallet address
  const { wallets } = useWallets();
  const address = wallets
    ?.find((wallet) => wallet.connectorType === "embedded")
    ?.address?.toLowerCase();

  // Query the subgraph
  const {
    data: players,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["owned-players", address],
    queryFn: async () => {
      if (!address) return [];
      const rawPlayers = await fetchPlayersByOwner(address);
      const playersWithMetadata = await Promise.all(
        rawPlayers.map((rawPlayer) => convertRawPlayerToPlayer(rawPlayer)),
      );
      console.log("Players:", playersWithMetadata);
      return playersWithMetadata;
    },
    enabled: !!address,
  });

  // Process the data and fetch metadata for each player
  // useEffect(() => {
  //   async function processPlayerData() {
  //     if (!rawPlayers || rawPlayers.length === 0) {
  //       setPlayers([]);
  //       return;
  //     }

  //     setIsProcessing(true);

  //     try {
  //       const playersWithMetadata = await Promise.all(
  //         rawPlayers.map(rawPlayer => convertRawPlayerToPlayer(rawPlayer))
  //       );

  //       // Filter out any null values (in case some promises rejected)
  //       setPlayers(playersWithMetadata.filter(Boolean));
  //     } catch (err) {
  //       console.error('Error processing player data:', err);
  //     } finally {
  //       setIsProcessing(false);
  //     }
  //   }

  //   if (rawPlayers && !isLoading) {
  //     processPlayerData();
  //   }
  // }, [rawPlayers, isLoading]);

  return {
    players,
    isLoading: isLoading,
    error,
    refetch,
  };
}
