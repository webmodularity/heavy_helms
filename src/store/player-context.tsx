"use client";

import type { Character } from "@/types/player.types";
import { useWallets } from "@privy-io/react-auth";
import { useQueryClient } from "@tanstack/react-query";
import { type ReactNode, createContext, useCallback, useContext } from "react";
import { useSubgraphPlayers } from "@/hooks/use-subgraph-players";

interface PlayerContextType {
  characters: Character[];
  refreshCharacters: () => Promise<void>;
  isLoading: boolean;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

interface PlayerProviderProps {
  children: ReactNode;
}

export function PlayerProvider({ children }: PlayerProviderProps) {
  const { wallets } = useWallets();
  const queryClient = useQueryClient();

  // Use the subgraph hook instead of contract calls
  const { players, isLoading, error, refetch } = useSubgraphPlayers();

  // Function to refresh characters
  const refreshCharacters = useCallback(async () => {
    const walletAddress = wallets?.find(
      (wallet) => wallet.connectorType === "embedded",
    )?.address;

    // First invalidate the player IDs query
    await queryClient.invalidateQueries({
      queryKey: ["playerIds"],
    });

    // Then invalidate all player data queries
    await queryClient.invalidateQueries({
      queryKey: ["players"],
    });

    // Explicitly refetch the data to ensure refresh
    await refetch();

    return;
  }, [queryClient, wallets, refetch]);

  const value = {
    characters: players,
    isLoading,
    refreshCharacters,
  };

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
