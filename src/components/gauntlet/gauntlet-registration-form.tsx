"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { formatEther } from "viem";
import type { Player } from "@/types/player.types";
import { YellowButton } from "@/components/ui/yellow-button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { request } from "graphql-request";
import { GET_GAME_STATS } from "@/lib/gql-queries";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  Clock,
  Info,
  Swords,
  Loader2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PlayerGauntletStatus } from "@/types/player.types";
import { useGauntletQueue } from "@/hooks/use-gauntlet-queue";
import { useAccount } from "wagmi";
import { useQueuedGauntletPlayers } from "@/hooks/use-queued-gauntlet-players";
import { GauntletQueueTable } from "@/components/gauntlet/gauntlet-queue-table";

interface GameStats {
  stats: {
    currentGauntletQueueSize: number;
    currentGauntletSize: number;
    currentGauntletEntryFee: string;
    currentGauntletFeePercentage: string;
    currentMinTimeBetweenGauntlets: string;
    lastUpdated: string;
  } | null;
}

const SUBGRAPH_ENDPOINT = process.env.NEXT_PUBLIC_SUBGRAPH_URL || "";

interface GauntletRegistrationFormProps {
  character: Player;
  onCancel: () => void;
  onRegister: () => void;
  animationDelay?: number;
}

function formatSeconds(secondsStr: string): string {
  const seconds = Number.parseInt(secondsStr, 10);
  if (Number.isNaN(seconds) || seconds <= 0) return "";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }
  return `${hours} hr ${remainingMinutes} min`;
}

export function GauntletRegistrationForm({
  character,
  onCancel,
  onRegister,
  animationDelay = 0,
}: GauntletRegistrationFormProps) {
  const queryClient = useQueryClient();
  const { address } = useAccount();

  const {
    data: statsData,
    isLoading: isLoadingStats,
    error: errorStats,
    isSuccess: isStatsSuccess,
  } = useQuery<GameStats, Error>({
    queryKey: ["gameStats"],
    queryFn: async (): Promise<GameStats> => {
      if (!SUBGRAPH_ENDPOINT) {
        throw new Error("Subgraph URL is not configured.");
      }
      const data = await request<GameStats>(SUBGRAPH_ENDPOINT, GET_GAME_STATS);
      return data;
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: 60000,
    refetchIntervalInBackground: true,
  });

  // Queue data hook
  const {
    data: queuedPlayers,
    isLoading: isLoadingQueue,
    error: queueError,
    isSuccess: isQueueSuccess,
    refetch: refetchQueue,
  } = useQueuedGauntletPlayers();

  const {
    queuePlayer,
    withdrawPlayer,
    isLoading: isProcessing,
    isQueuing,
    isWithdrawing,
  } = useGauntletQueue();

  const [localQueueSize, setLocalQueueSize] = useState<number | null>(null);
  const [localIsInQueue, setLocalIsInQueue] = useState<boolean>(
    character.gauntletStatus !== PlayerGauntletStatus.NONE,
  );
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);
  const justUpdatedOptimistically = useRef(false);

  // Refs to track previous stats values for targeted invalidation
  const prevQueueSizeRef = useRef<number | null>(null);
  const prevLastUpdatedRef = useRef<string | null>(null);

  // Auto-fetch queue on component mount
  useEffect(() => {
    refetchQueue();
  }, [refetchQueue]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (justUpdatedOptimistically.current) {
      return;
    }

    const propIsInQueue =
      character.gauntletStatus !== PlayerGauntletStatus.NONE;
    if (propIsInQueue !== localIsInQueue) {
      setLocalIsInQueue(propIsInQueue);
    }
  }, [character.id, character.gauntletStatus, localIsInQueue]);

  useEffect(() => {
    if (justUpdatedOptimistically.current) {
      return;
    }

    if (isStatsSuccess && statsData?.stats) {
      const newQueueSize = statsData.stats.currentGauntletQueueSize;
      if (localQueueSize === null || localQueueSize !== newQueueSize) {
        setLocalQueueSize(newQueueSize);
      }
      if (!hasLoadedInitialData) {
        setHasLoadedInitialData(true);
      }
    }
  }, [statsData, isStatsSuccess, localQueueSize, hasLoadedInitialData]);

  // Effect for invalidating owned-players query if global gauntlet stats change
  useEffect(() => {
    if (!address || !isStatsSuccess || !statsData?.stats) {
      return;
    }

    const currentQueueSize = statsData.stats.currentGauntletQueueSize;
    const currentLastUpdated = statsData.stats.lastUpdated;

    // Ensure refs have been initialized before comparing
    const refsInitialized =
      prevQueueSizeRef.current !== null || prevLastUpdatedRef.current !== null;

    if (localIsInQueue && refsInitialized) {
      const queueSizeChanged = prevQueueSizeRef.current !== currentQueueSize;
      const lastUpdatedChanged =
        prevLastUpdatedRef.current !== currentLastUpdated;

      if (localIsInQueue && (queueSizeChanged || lastUpdatedChanged)) {
        queryClient.invalidateQueries({
          queryKey: ["owned-players", address],
        });
      }
    }

    // Update refs for the next render
    prevQueueSizeRef.current = currentQueueSize;
    prevLastUpdatedRef.current = currentLastUpdated;
  }, [
    statsData,
    isStatsSuccess,
    localIsInQueue,
    queryClient,
    address,
    character.id,
  ]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (justUpdatedOptimistically.current) {
      const timerId = setTimeout(() => {
        justUpdatedOptimistically.current = false;
      }, 0);
      return () => clearTimeout(timerId);
    }
  }, [justUpdatedOptimistically.current]);

  const requiredSize = statsData?.stats?.currentGauntletSize ?? 0;
  const currentEntryFeeWei = BigInt(
    statsData?.stats?.currentGauntletEntryFee ?? "0",
  );
  const feePercentageBasisPoints = BigInt(
    statsData?.stats?.currentGauntletFeePercentage ?? "500",
  );
  const minIntervalSeconds =
    statsData?.stats?.currentMinTimeBetweenGauntlets ?? "0";

  const formattedEntryFee = formatEther(currentEntryFeeWei);
  const formattedMinInterval = formatSeconds(minIntervalSeconds);

  const totalPotWei =
    requiredSize > 0 ? currentEntryFeeWei * BigInt(requiredSize) : 0n;
  const feeAmountWei = (totalPotWei * feePercentageBasisPoints) / 10000n;
  const precisePayoutWei = totalPotWei - feeAmountWei;
  const formattedPrecisePayout = formatEther(precisePayoutWei);

  let numberOfRounds: number | null = null;
  if (requiredSize > 1 && (requiredSize & (requiredSize - 1)) === 0) {
    numberOfRounds = Math.log2(requiredSize);
  }

  const isReady = hasLoadedInitialData && localQueueSize !== null;
  const isInQueue = localIsInQueue;

  const handleRegisterClick = () => {
    if (isInQueue || isProcessing || !isReady) return;

    queuePlayer({
      character,
      entryFeeWei: currentEntryFeeWei,
      onSuccess: () => {
        justUpdatedOptimistically.current = true;
        setLocalQueueSize((prev) => {
          const nextSize = prev !== null ? prev + 1 : 1;
          return nextSize;
        });
        setLocalIsInQueue(true);
        queryClient.invalidateQueries({ queryKey: ["gameStats"] });
        refetchQueue(); // Refresh queue display
        onRegister();
      },
      onError: (err) => {
        console.error("Register TX Error:", (err as Error).message);
      },
    });
  };

  const handleWithdrawClick = () => {
    if (!isInQueue || isProcessing || !isReady) return;

    withdrawPlayer({
      playerId: Number.parseInt(character.id, 10),
      onSuccess: () => {
        justUpdatedOptimistically.current = true;
        setLocalQueueSize((prev) => {
          const nextSize = prev !== null ? Math.max(0, prev - 1) : 0;
          return nextSize;
        });
        setLocalIsInQueue(false);
        queryClient.invalidateQueries({ queryKey: ["gameStats"] });
        refetchQueue(); // Refresh queue display
      },
      onError: (err) => {
        console.error("Withdraw TX Error:", err.message);
      },
    });
  };

  return (
    <motion.div
      className="h-full flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, delay: animationDelay },
      }}
      exit={{ opacity: 0, y: 20, transition: { duration: 0.3 } }}
    >
      {/* Compact Header */}
      <div className="flex items-center mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-md font-bold text-yellow-400">
            Current Queue
          </h2>
          {!isLoadingStats &&
            !isProcessing &&
            (formattedMinInterval || numberOfRounds) &&
            requiredSize > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="cursor-help">
                      <Info size={14} className="text-stone-400 hover:text-stone-300" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="max-w-xs text-center space-y-1 bg-stone-800 text-stone-100 border border-stone-700"
                  >
                    {numberOfRounds && (
                      <p className="flex items-center justify-center gap-1 text-xs">
                        <Swords size={10} /> {numberOfRounds} Rounds
                      </p>
                    )}
                    {formattedMinInterval && (
                      <p className="flex items-center justify-center gap-1 text-xs">
                        <Clock size={10} /> Max {formattedMinInterval}{" "}
                        cooldown after full queue.
                      </p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
        </div>
        
        {/* Registration Status */}
        {!isReady ? (
          <Skeleton className="h-6 w-24" />
        ) : (
          <div className="text-sm font-medium text-stone-200 px-3 py-1">
            {localQueueSize ?? "??"} / {requiredSize} REGISTERED
          </div>
        )}
      </div>

      {/* Main Queue Table - No extra borders */}
      <div className="flex-1 overflow-hidden">
        {isLoadingQueue && (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 text-yellow-500 animate-spin" />
            <span className="ml-2 text-sm text-stone-300">Loading queue...</span>
          </div>
        )}

        {queueError && (
          <div className="flex items-center gap-2 p-3 text-sm text-red-400 bg-red-900/20 border border-red-500/30 rounded-lg">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>Error loading queue: {queueError.message}</span>
          </div>
        )}

        {isQueueSuccess && (!queuedPlayers || queuedPlayers.length === 0) && (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <p className="text-stone-400 mb-1">Queue is empty</p>
              <p className="text-xs text-stone-500">Be the first to register!</p>
            </div>
          </div>
        )}

        {isQueueSuccess && queuedPlayers && queuedPlayers.length > 0 && (
          <div className="h-full overflow-y-auto">
            <GauntletQueueTable players={queuedPlayers} />
          </div>
        )}
      </div>

      {/* Error Messages */}
      {errorStats && !isProcessing && (
        <div className="flex items-center gap-2 p-2 text-xs text-red-400 bg-red-900/20 border border-red-500/30 rounded-lg mt-3">
          <AlertTriangle className="h-3 w-3 flex-shrink-0" />
          <span>
            Error fetching gauntlet data. {(errorStats as Error)?.message}
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 mt-4 pt-3 border-t border-stone-700/50">
        <YellowButton
          onClick={isInQueue ? handleWithdrawClick : handleRegisterClick}
          className={`flex-1 ${
            isInQueue
              ? "bg-red-700 hover:bg-red-800 border-red-700 hover:border-red-800 text-white"
              : ""
          }`}
          disabled={
            !isReady || isProcessing || !!errorStats || requiredSize === 0
          }
        >
          {(isQueuing || isWithdrawing) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {isInQueue
            ? isWithdrawing
              ? "Withdrawing..."
              : "Withdraw"
            : isQueuing
              ? "Registering..."
              : "Register"}
        </YellowButton>
        <YellowButton
          onClick={onCancel}
          variant="outline"
          className="flex-1"
          disabled={isProcessing}
        >
          Cancel
        </YellowButton>
      </div>
    </motion.div>
  );
}
