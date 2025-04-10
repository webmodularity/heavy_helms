"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Scroll, Coins, Hourglass } from "lucide-react";
import { useChallenges } from "@/hooks/use-challenges";
import { formatEther } from "viem";

export function OpenChallenges() {
  //   const [challenges] = useState<Challenge[]>(mockChallenges);
  const { challenges, isLoading, error } = useChallenges();
  console.log(challenges);
  // Format timestamp to a readable date
  const formatDate = (timestamp: string) => {
    const date = new Date(Number.parseInt(timestamp, 10) * 1000);
    return `${date.toLocaleDateString()}`;
  };
  console.log("challenges", challenges);
  return (
    <div className="bg-stone-900 border border-yellow-600/20 rounded-lg overflow-hidden h-full">
      <div className="p-4 bg-gradient-to-r from-amber-900/50 to-stone-900 border-b border-yellow-600/20 flex items-center justify-between">
        <div className="flex items-center">
          <Scroll className="h-5 w-5 text-yellow-500 mr-2" />
          <h2 className="text-xl font-bold text-yellow-400">Open Challenges</h2>
        </div>
        <span className="text-sm text-stone-400 flex items-center">
          <Hourglass className="h-4 w-4 mr-1" /> Awaiting acceptance
        </span>
      </div>

      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {challenges.map((challenge, index) => (
          <motion.div
            key={challenge.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative border border-amber-900/50 rounded bg-amber-950/10 overflow-hidden"
          >
            {/* Torn edges effect with SVG */}
            <svg
              className="absolute top-0 left-0 w-full h-8 text-amber-900/30"
              viewBox="0 0 100 10"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M0,0 L10,5 L20,2 L30,7 L40,3 L50,8 L60,2 L70,8 L80,5 L90,8 L100,3 L100,0 Z"
                fill="currentColor"
              />
            </svg>

            {/* "WANTED" stamp */}
            <div className="absolute -right-8 top-6 rotate-45 bg-red-900/80 text-amber-200 text-sm px-10 font-bold tracking-widest shadow-md">
              OPEN
            </div>

            <div className="pt-10 px-4 pb-4">
              {/* Title with old paper effect */}
              <div className="text-center mb-4">
                <h3 className="text-amber-800 font-medievalsharp text-xl uppercase tracking-wider">
                  Bounty Notice
                </h3>
                <div className="text-amber-900/60 text-xs">
                  Posted on {formatDate(challenge.createdBlock.toString())}
                </div>
              </div>

              {/* Challenge details */}
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-amber-700 text-sm font-semibold">
                    Challenger:
                  </div>
                  <div className="text-amber-950 font-bold">
                    {challenge.challengerName}
                  </div>
                </div>

                <div className="text-center border-y border-amber-900/30 py-2 my-2">
                  <div className="text-amber-700 text-sm font-semibold">
                    Seeks combat with:
                  </div>
                  <div className="text-amber-950 font-bold">
                    {challenge.defenderName}
                  </div>
                </div>

                {/* Wager amount with coin icon */}
                {/* <div className="flex justify-center items-center mt-4">
                  <div className="bg-amber-200 border-2 border-amber-600 rounded-full p-3 shadow-lg">
                    <Coins className="h-8 w-8 text-amber-700" />
                  </div>
                </div> */}

                <div className="text-center">
                  <div className="text-amber-700 text-sm font-semibold">
                    Wager Amount:
                  </div>
                  <div className="text-amber-950 font-bold text-lg">
                    {formatEther(challenge.wagerAmount)} ETH
                  </div>
                </div>
              </div>

              {/* Decorative corner elements */}
              <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-amber-800/40" />
              <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-amber-800/40" />
              <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-amber-800/40" />
              <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-amber-800/40" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
