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
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-yellow-500">
          Heavy Helms Statistics
        </h1>
        <p className="text-xs text-stone-400 mt-0.5">
          Last updated: {formattedDate}
        </p>
      </div>
      <Button
        onClick={handleRefresh}
        variant="default"
        size="sm"
        className="h-7 px-2.5 border-yellow-600/20 hover:bg-yellow-500/10 hover:text-yellow-400 text-yellow-500 text-xs"
      >
        <RefreshCw className="h-3 w-3 mr-1.5" />
        Refresh
      </Button>
    </div>
  );
}
