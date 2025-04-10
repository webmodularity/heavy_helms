"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Sword, Shield, Trophy, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRecentDuels } from "@/hooks/use-recent-duels";
import { useRouter } from "next/navigation";
import { formatEther, parseEther } from "viem";

export function RecentBattles() {
  //   const [duels] = useState<Duel[]>(mockDuels);
  const { duels, isLoading, error } = useRecentDuels();
  const router = useRouter();
  // Format timestamp to a readable date
  const formatDate = (timestamp: string) => {
    const date = new Date(Number.parseInt(timestamp, 10) * 1000);
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
  };

  return (
    <div className="bg-stone-900 border border-yellow-600/20 rounded-lg overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-amber-900/50 to-stone-900 border-b border-yellow-600/20 flex items-center justify-between">
        <div className="flex items-center">
          <Sword className="h-5 w-5 text-yellow-500 mr-2" />
          <h2 className="text-xl font-bold text-yellow-400">Recent Battles</h2>
        </div>
        <span className="text-sm text-stone-400 flex items-center">
          <Clock className="h-4 w-4 mr-1" /> Latest combat logs
        </span>
      </div>

      <div className="divide-y divide-stone-800">
        {duels.map((duel, index) => {
          const isChallenger = duel.winnerId === duel.challenge.challengerId;
          const winner = isChallenger
            ? duel.challenge.challengerSnapshot
            : duel.challenge.defenderSnapshot;
          const loser = isChallenger
            ? duel.challenge.defenderSnapshot
            : duel.challenge.challengerSnapshot;

          return (
            <motion.div
              key={duel.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="cursor-pointer p-4 hover:bg-amber-900/10 transition-colors"
              onClick={() => {
                router.push(`/duel?txId=${duel.id}`);
              }}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center">
                <div className="flex-1 flex items-center mb-2 md:mb-0">
                  {/* Challenger */}
                  <div className="flex flex-col items-center mr-4">
                    <div
                      className={`h-10 w-10 rounded-full overflow-hidden bg-stone-800 relative ${isChallenger ? "ring-2 ring-green-500" : ""}`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-stone-900/60" />
                      {/* Placeholder for actual images */}
                      <div className="h-full w-full bg-amber-800 flex items-center justify-center text-white font-bold">
                        {duel.challenge.challengerSnapshot.fullName.charAt(0)}
                      </div>
                    </div>
                    <span className="text-xs text-stone-400 mt-1 truncate w-20 text-center">
                      {duel.challenge.challengerSnapshot.fullName}
                    </span>
                  </div>

                  {/* VS Indicator */}
                  <div className="flex flex-col items-center mx-2">
                    <div className="text-yellow-600 text-sm">VS</div>
                    <div className="text-xs text-stone-500">⚔️</div>
                  </div>

                  {/* Defender */}
                  <div className="flex flex-col items-center ml-4">
                    <div
                      className={`h-10 w-10 rounded-full overflow-hidden bg-stone-800 relative ${!isChallenger ? "ring-2 ring-green-500" : ""}`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-stone-900/60" />
                      {/* Placeholder for actual images */}
                      <div className="h-full w-full bg-red-900 flex items-center justify-center text-white font-bold">
                        {duel.challenge.defenderSnapshot.fullName.charAt(0)}
                      </div>
                    </div>
                    <span className="text-xs text-stone-400 mt-1 truncate w-20 text-center">
                      {duel.challenge.defenderSnapshot.fullName}
                    </span>
                  </div>
                </div>

                {/* Outcome */}
                <div className="flex-1 md:text-center">
                  <div className="flex items-center text-sm font-medium">
                    <Trophy className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-yellow-400">{winner.fullName}</span>
                    <span className="text-stone-500 mx-1">defeated</span>
                    <span className="text-red-400">{loser.fullName}</span>
                  </div>
                  {duel.challenge.wagerAmount &&
                    Number.parseFloat(duel.challenge.wagerAmount) > 0 && (
                      <div className="text-xs text-green-400 mt-1">
                        Wager: {formatEther(BigInt(duel.challenge.wagerAmount))}{" "}
                        ETH
                      </div>
                    )}
                </div>

                {/* Timestamp */}
                <div className="text-xs text-stone-500 mt-2 md:mt-0">
                  {formatDate(duel.blockTimestamp)}
                </div>
              </div>

              {/* Battle details - can expand in future */}
              <div className="mt-3 text-xs text-stone-600 flex justify-between">
                <span>Block #: {duel.blockNumber}</span>
                <span>
                  TX: {duel.id.substring(0, 10)}...
                  {duel.id.substring(duel.id.length - 4)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="p-3 border-t border-yellow-600/20 bg-stone-900 flex justify-center">
        <Button
          variant="outline"
          size="sm"
          className="border-yellow-600/20 hover:bg-yellow-500/10 hover:text-yellow-400 text-stone-400"
        >
          Load More Battles
        </Button>
      </div>
    </div>
  );
}
