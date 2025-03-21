import { useWallets } from "@privy-io/react-auth";
import { useQuery } from "@tanstack/react-query";
import {
  fetchPlayersByOwner,
  convertRawPlayerToPlayer,
} from "@/lib/player-api";

export function useOwnPlayers() {
  // Get the connected wallet address
  const { wallets } = useWallets();
  const address = wallets?.find(
    (wallet) => wallet.connectorType === "embedded",
  )?.address;

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
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  return {
    players,
    isLoading: isLoading,
    error,
    refetch,
  };
}
