"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGameStats } from "@/hooks/use-game-stats";

interface StatsHeaderProps {
  lastUpdated: string;
}

export function StatsHeader({ lastUpdated }: StatsHeaderProps) {
  const { refetch } = useGameStats();
  const formattedDate = new Date(
    Number.parseInt(lastUpdated) * 1000,
  ).toISOString();

  // This would be hooked up to a refetch function in a real implementation
  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-yellow-500">
          Heavy Helms Statistics
        </h1>
        <p className="text-sm text-stone-400 mt-1">
          Last updated: {formattedDate}
        </p>
      </div>
      <Button
        onClick={handleRefresh}
        variant="default"
        className="border-yellow-600/20 hover:bg-yellow-500/10 hover:text-yellow-400 text-stone-200 text-yellow-500"
      >
        <RefreshCw className="h-4 w-4 mr-2 text-yellow-500" />
        Refresh Stats
      </Button>
    </div>
  );
}
