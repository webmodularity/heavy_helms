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
  animationDelay = 0,
}: GauntletRegistrationFormProps) {
  const queryClient = useQueryClient();
  const { address } = useAccount();

  const {
    data: statsData,
    isLoading: isLoadingStats,
    error: errorStats,
    isSuccess: isStatsSuccess,
  } = useQuery<GameStats>({
    queryKey: ["gameStats"],
    queryFn: async () => {
      if (!SUBGRAPH_ENDPOINT) {
        throw new Error("Subgraph URL is not configured.");
      }
      const data = await request(SUBGRAPH_ENDPOINT, GET_GAME_STATS);
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
    console.log(
      `Effect 1 Check: justUpdatedOptimistically=${justUpdatedOptimistically.current}, charId=${character.id}, charStatus=${character.gauntletStatus}, localStatus=${localIsInQueue}`,
    );
    if (justUpdatedOptimistically.current) {
      console.log(
        "Effect 1: Skipping sync for localIsInQueue due to optimistic update flag.",
      );
      return;
    }

    const propIsInQueue =
      character.gauntletStatus !== PlayerGauntletStatus.NONE;
    if (propIsInQueue !== localIsInQueue) {
      console.log(
        `GauntletForm (Effect 1 - Prop Sync): Syncing localIsInQueue (${propIsInQueue}) from prop for character ${character.id}. Was: ${localIsInQueue}`,
      );
      setLocalIsInQueue(propIsInQueue);
    }
  }, [character.id, character.gauntletStatus, localIsInQueue]);

  useEffect(() => {
    console.log(
      `Effect 2 Check: justUpdatedOptimistically=${justUpdatedOptimistically.current}, statsSuccess=${isStatsSuccess}, localQueueSize=${localQueueSize}`,
    );
    if (justUpdatedOptimistically.current) {
      console.log(
        "Effect 2: Skipping sync for localQueueSize due to optimistic update flag.",
      );
      return;
    }

    if (isStatsSuccess && statsData?.stats) {
      const newQueueSize = statsData.stats.currentGauntletQueueSize;
      console.log(
        `Effect 2 Stats: newQueueSize=${newQueueSize}, localQueueSize=${localQueueSize}`,
      );
      if (localQueueSize === null || localQueueSize !== newQueueSize) {
        console.log(
          `GauntletForm (Effect 2 - Query Sync): ${localQueueSize === null ? "Initial" : "Updating"} queue size (${newQueueSize}) from stats. Was: ${localQueueSize}`,
        );
        setLocalQueueSize(newQueueSize);
      }
      if (!hasLoadedInitialData) {
        setHasLoadedInitialData(true);
      }
    }
  }, [statsData, isStatsSuccess, localQueueSize, hasLoadedInitialData]);

  // Effect 3: Invalidate owned-players query if global gauntlet stats change
  // significantly while the current player is thought to be in the queue.
  useEffect(() => {
    if (!address || !isStatsSuccess || !statsData?.stats) {
      // console.log("Effect 3: Skipping invalidation (no address or stats not ready).");
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
        console.log(
          `GauntletForm (Effect 3 - Invalidation Trigger): Player ${character.id} (localIsInQueue=${localIsInQueue}). Global Gauntlet stats changed. Invalidating owned-players. PrevQ: ${prevQueueSizeRef.current}, NewQ: ${currentQueueSize}. PrevLU: ${prevLastUpdatedRef.current}, NewLU: ${currentLastUpdated}`,
        );
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
    character.id, // Re-evaluate if the character context changes
  ]);

  useEffect(() => {
    // This effect runs after every render.
    if (justUpdatedOptimistically.current) {
      console.log(
        "End-of-render cycle Effect: Scheduling reset of justUpdatedOptimistically flag.",
      );
      const timerId = setTimeout(() => {
        console.log(
          "setTimeout: Resetting justUpdatedOptimistically flag now.",
        );
        justUpdatedOptimistically.current = false;
      }, 0);
      return () => clearTimeout(timerId); // Cleanup timer if component unmounts
    }
  }, [justUpdatedOptimistically.current]); // Add dependency to re-run if flag changes

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
        console.log(
          "Register Success: Setting optimistic state & flag. Invalidating gameStats.",
        );
        justUpdatedOptimistically.current = true;
        setLocalQueueSize((prev) => {
          const nextSize = prev !== null ? prev + 1 : 1;
          console.log(
            `Register Optimistic: prevSize=${prev}, nextSize=${nextSize}`,
          );
          return nextSize;
        });
        setLocalIsInQueue(true);
        console.log("Register Optimistic: localIsInQueue set to true");
        queryClient.invalidateQueries({ queryKey: ["gameStats"] });
      },
      onError: (err) => {
        console.error("Register TX Error:", err.message);
        // Potentially reset optimistic state here if needed, or allow subgraph to correct
        // justUpdatedOptimistically.current = false; // Not strictly needed if error leads to no UI change based on optimism
      },
    });
  };

  const handleWithdrawClick = () => {
    if (!isInQueue || isProcessing || !isReady) return;

    withdrawPlayer({
      playerId: Number.parseInt(character.id, 10),
      onSuccess: () => {
        console.log(
          "Withdraw Success: Setting optimistic state & flag. Invalidating gameStats.",
        );
        justUpdatedOptimistically.current = true;
        setLocalQueueSize((prev) => {
          const nextSize = prev !== null ? Math.max(0, prev - 1) : 0;
          console.log(
            `Withdraw Optimistic: prevSize=${prev}, nextSize=${nextSize}`,
          );
          return nextSize;
        });
        setLocalIsInQueue(false);
        console.log("Withdraw Optimistic: localIsInQueue set to false");
        queryClient.invalidateQueries({ queryKey: ["gameStats"] });
      },
      onError: (err) => {
        console.error("Withdraw TX Error:", err.message);
        // Potentially reset optimistic state here
        // justUpdatedOptimistically.current = false;
      },
    });
  };

  // Add a log before returning the JSX to see the state values for the render
  console.log(
    `RENDER: charId=${character.id}, localIsInQueue=${localIsInQueue}, localQueueSize=${localQueueSize}, isProcessing=${isProcessing}, isReady=${isReady}, propGauntletStatus=${character.gauntletStatus}`,
  );

  return (
    <TooltipProvider delayDuration={100}>
      <motion.div
        className="space-y-4 bg-gradient-to-b from-amber-900/10 to-stone-900/40 rounded-lg border border-yellow-600/20 p-6 h-full flex flex-col justify-between"
        initial={{ opacity: 0, y: 40 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: { duration: 0.7, delay: animationDelay },
        }}
        exit={{ opacity: 0, y: 40, transition: { duration: 0.3 } }}
      >
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-yellow-400 mb-4">
            Gauntlet Registration
          </h2>

          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <Label htmlFor="gauntletStatus" className="text-stone-300">
                Status
              </Label>
              {!isLoadingStats &&
                !isProcessing &&
                (formattedMinInterval || numberOfRounds) &&
                requiredSize > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info size={14} className="text-stone-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="max-w-xs text-center space-y-1"
                    >
                      {numberOfRounds && (
                        <p className="flex items-center justify-center gap-1">
                          <Swords size={12} /> {numberOfRounds} Rounds
                        </p>
                      )}
                      {formattedMinInterval && (
                        <p className="flex items-center justify-center gap-1">
                          <Clock size={12} /> Max {formattedMinInterval}{" "}
                          cooldown after full queue.
                        </p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                )}
            </div>

            {!isReady ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <div className="grid grid-cols-5 gap-2">
                <div className="relative col-span-4">
                  <Input
                    id="gauntletStatus"
                    readOnly
                    value={`${localQueueSize ?? "??"} / ${requiredSize} REGISTERED`}
                    className="bg-stone-900/50 border-yellow-600/20 text-stone-200 text-center font-medium tracking-wider"
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
                >
                  <Users className="h-4 w-4" />
                </YellowButton>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-0">
            <div className="space-y-2">
              <Label htmlFor="gauntletEntryFee" className="text-stone-300">
                Entry Fee
              </Label>
              {!isReady ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Input
                  id="gauntletEntryFee"
                  readOnly
                  value={`${formattedEntryFee} ETH`}
                  className="bg-stone-900/50 border-yellow-600/20 text-stone-200 text-center font-medium"
                  aria-label="Gauntlet entry fee"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gauntletPayout" className="text-stone-300">
                Gauntlet Prize
              </Label>
              {!isReady || requiredSize === 0 ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Input
                  id="gauntletPayout"
                  readOnly
                  value={`${formattedPrecisePayout} ETH`}
                  className="bg-stone-900/50 border-yellow-600/20 text-stone-200 text-center font-medium"
                  aria-label="Calculated gauntlet prize"
                />
              )}
            </div>
          </div>

          {errorStats && !isProcessing && (
            <div className="flex items-center gap-2 p-2 text-sm text-red-400 bg-red-900/20 border border-red-500/30 rounded-md">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>
                Error fetching gauntlet data. {(errorStats as Error)?.message}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <YellowButton
            onClick={isInQueue ? handleWithdrawClick : handleRegisterClick}
            className={`w-full ${
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
            className="w-full"
            disabled={isProcessing}
          >
            Cancel
          </YellowButton>
        </div>
      </motion.div>
    </TooltipProvider>
  );
}
