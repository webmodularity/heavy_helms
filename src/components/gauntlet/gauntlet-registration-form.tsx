"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { formatEther } from "viem";
import type { Player } from "@/types/player.types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { YellowButton } from "@/components/ui/yellow-button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { request } from "graphql-request";
import { GET_GAME_STATS } from "@/lib/gql-queries";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  Clock,
  Info,
  Users,
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
      },
      onError: (err) => {
        console.error("Withdraw TX Error:", err.message);
      },
    });
  };

  return (
    <TooltipProvider delayDuration={100}>
      <motion.div
        className="space-y-3 bg-gradient-to-b from-amber-900/10 to-stone-900/40 rounded-lg border border-yellow-600/20 p-3 h-full flex flex-col justify-between"
        initial={{ opacity: 0, y: 40 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: { duration: 0.7, delay: animationDelay },
        }}
        exit={{ opacity: 0, y: 40, transition: { duration: 0.3 } }}
      >
        <div className="space-y-3">
          <h2 className="text-base font-bold text-yellow-400 mb-2">
            Gauntlet Registration
          </h2>

          <div className="space-y-1.5">
            <div className="flex items-center gap-1">
              <Label
                htmlFor="gauntletStatus"
                className="text-xs text-stone-300"
              >
                Status
              </Label>
              {!isLoadingStats &&
                !isProcessing &&
                (formattedMinInterval || numberOfRounds) &&
                requiredSize > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info size={12} className="text-stone-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="max-w-xs text-center space-y-1"
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
                )}
            </div>

            {!isReady ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <div className="grid grid-cols-5 gap-1.5">
                <div className="relative col-span-4">
                  <Input
                    id="gauntletStatus"
                    readOnly
                    value={`${localQueueSize ?? "??"} / ${requiredSize} REGISTERED`}
                    className="bg-stone-900/50 border-yellow-600/20 text-stone-200 text-center font-medium tracking-wider h-8 text-xs"
                  />
                </div>
                <YellowButton
                  type="button"
                  onClick={() =>
                    alert("Feature coming soon: View queue details!")
                  }
                  title="View Current Queue (Coming Soon)"
                  disabled={
                    !isReady ||
                    isProcessing ||
                    !!errorStats ||
                    requiredSize === 0
                  }
                  className="h-8 p-0"
                >
                  <Users className="h-3.5 w-3.5" />
                </YellowButton>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-0">
            <div className="space-y-1.5">
              <Label
                htmlFor="gauntletEntryFee"
                className="text-xs text-stone-300"
              >
                Entry Fee
              </Label>
              {!isReady ? (
                <Skeleton className="h-8 w-full" />
              ) : (
                <Input
                  id="gauntletEntryFee"
                  readOnly
                  value={`${formattedEntryFee} ETH`}
                  className="bg-stone-900/50 border-yellow-600/20 text-stone-200 text-center font-medium h-8 text-xs"
                  aria-label="Gauntlet entry fee"
                />
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="gauntletPayout"
                className="text-xs text-stone-300"
              >
                Gauntlet Prize
              </Label>
              {!isReady || requiredSize === 0 ? (
                <Skeleton className="h-8 w-full" />
              ) : (
                <Input
                  id="gauntletPayout"
                  readOnly
                  value={`${formattedPrecisePayout} ETH`}
                  className="bg-stone-900/50 border-yellow-600/20 text-stone-200 text-center font-medium h-8 text-xs"
                  aria-label="Calculated gauntlet prize"
                />
              )}
            </div>
          </div>

          {errorStats && !isProcessing && (
            <div className="flex items-center gap-1.5 p-1.5 text-xs text-red-400 bg-red-900/20 border border-red-500/30 rounded-md">
              <AlertTriangle className="h-3 w-3 flex-shrink-0" />
              <span>
                Error fetching gauntlet data. {(errorStats as Error)?.message}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-1.5">
          <YellowButton
            onClick={isInQueue ? handleWithdrawClick : handleRegisterClick}
            className={`w-full text-xs py-1.5 h-auto ${
              isInQueue
                ? "bg-red-700 hover:bg-red-800 border-red-700 hover:border-red-800 text-white"
                : ""
            }`}
            disabled={
              !isReady || isProcessing || !!errorStats || requiredSize === 0
            }
          >
            {(isQueuing || isWithdrawing) && (
              <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
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
            className="w-full text-xs py-1.5 h-auto"
            disabled={isProcessing}
          >
            Cancel
          </YellowButton>
        </div>
      </motion.div>
    </TooltipProvider>
  );
}
