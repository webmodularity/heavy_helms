import { fetchGameStats } from "@/lib/stats-api";
import { useQuery } from "@tanstack/react-query";

export function useGameStats() {
  const {
    data: stats,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["game-stats"],
    queryFn: async () => {
      const gameStats = await fetchGameStats();
      return gameStats;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    stats,
    isLoading,
    error,
    refetch,
  };
}
