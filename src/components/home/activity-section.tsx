"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { motion } from "framer-motion";
import { useCancelChallenge } from "@/hooks/useCancelChallenge";
import { useAcceptChallenge } from "@/hooks/useAcceptChallenge";
import { usePrivy } from "@privy-io/react-auth";
import { Loader2, Shield, Swords } from "lucide-react";
import { useState } from "react";
import { formatEther } from "viem";
import { YellowButton } from "@/components/ui/yellow-button";
import { ChevronRight } from "lucide-react";
import { toast } from "sonner";
import type { Character } from "@/types/player.types";
import { type Challenge, useChallenges } from "@/hooks/useChallenges";

interface ActivitySectionProps {
  selectedCharacter: Character | null;
}

export function ActivitySection({ selectedCharacter }: ActivitySectionProps) {
  const { authenticated, login } = usePrivy();

  return (
    <section className="mb-8" id="activity-section">
      <SectionHeader title="Battle Chronicles" subtitle="YOUR SAGA" />

      <motion.div
        className="bg-gradient-to-b from-amber-900/5 to-stone-900/30 rounded-lg border border-yellow-600/10 p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.7 }}
      >
        {authenticated ? (
          <BattleTabs selectedCharacter={selectedCharacter} />
        ) : (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <p className="text-stone-300 text-center">
              Connect your wallet to view your battle chronicles
            </p>
            <YellowButton onClick={login}>Connect Wallet</YellowButton>
          </div>
        )}
      </motion.div>
    </section>
  );
}

function BattleTabs({
  selectedCharacter,
}: { selectedCharacter: Character | null }) {
  const [activeTab, setActiveTab] = useState("recent");

  return (
    <Tabs
      defaultValue="recent"
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full"
    >
      <div className="flex items-center justify-between mb-6">
        <TabsList className="bg-stone-800/50 border border-yellow-600/20">
          <TabsTrigger
            value="recent"
            className="data-[state=active]:bg-yellow-600/20 data-[state=active]:text-yellow-400"
          >
            Recent Battles
          </TabsTrigger>
          <TabsTrigger
            value="challenges"
            className="data-[state=active]:bg-yellow-600/20 data-[state=active]:text-yellow-400"
          >
            Active Challenges
          </TabsTrigger>
        </TabsList>

        <Button
          variant="ghost"
          className="text-yellow-500 hover:text-yellow-400"
        >
          View All
        </Button>
      </div>

      <TabsContent value="recent" className="space-y-4">
        <RecentBattles />
      </TabsContent>

      <TabsContent value="challenges">
        <ActiveChallenges selectedCharacter={selectedCharacter} />
      </TabsContent>
    </Tabs>
  );
}

function RecentBattles() {
  // Placeholder data - would be fetched from API/blockchain
  const recentBattles = [
    {
      id: 1,
      result: "Victory in Duel",
      opponent: "Diego Frostcaller",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      warriorName: "Ross of the Glade",
    },
    {
      id: 2,
      result: "Defeat in Duel",
      opponent: "Kate of the Ember",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      warriorName: "Ross of the Glade",
    },
    {
      id: 3,
      result: "Practice Complete",
      details: "Completed 5 practice matches",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      warriorName: "Ross of the Glade",
    },
  ];

  return (
    <div className="space-y-4">
      {recentBattles.map((battle) => (
        <div key={battle.id} className="p-4 border-b border-stone-700/50">
          <div className="flex justify-between mb-1">
            <span
              className={`font-medium ${battle.result.includes("Victory") ? "text-yellow-400" : battle.result.includes("Defeat") ? "text-red-400" : "text-blue-400"}`}
            >
              {battle.result}
            </span>
            <span className="text-stone-400 text-sm">
              {/* {formatDistanceToNow(battle.timestamp, { addSuffix: true })} */}
              asddsa
            </span>
          </div>
          <p className="text-stone-300 text-sm">
            {battle.opponent
              ? `Your warrior ${battle.warriorName} ${battle.result.includes("Victory") ? "defeated" : "was defeated by"} ${battle.opponent}`
              : battle.details}
          </p>
        </div>
      ))}
    </div>
  );
}

function ActiveChallenges({
  selectedCharacter,
}: { selectedCharacter: Character | null }) {
  const { challenges, isLoading, error } = useChallenges();
  const { cancelChallenge, isCancellingChallenge } = useCancelChallenge();
  const { acceptChallenge, isAcceptingChallenge } = useAcceptChallenge();
  const [expandedChallenge, setExpandedChallenge] = useState<bigint | null>(
    null,
  );
  const [processingChallengeId, setProcessingChallengeId] = useState<
    bigint | null
  >(null);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 text-yellow-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-400">
        <p>Failed to load challenges</p>
        <p className="text-sm text-red-300 mt-2">Please try again later</p>
      </div>
    );
  }

  if (!challenges || challenges.length === 0) {
    return (
      <div className="text-center py-8 text-stone-300">
        <Swords className="h-12 w-12 mx-auto mb-4 text-yellow-600/50" />
        <h3 className="text-lg font-medium text-yellow-500 mb-2">
          No Active Challenges
        </h3>
        <p className="text-sm max-w-md mx-auto">
          You don't have any active challenges at the moment. Start a duel by
          selecting a warrior and choosing "Duel Mode" from the battle options.
        </p>
      </div>
    );
  }

  const handleAcceptChallenge = async (challenge: Challenge) => {
    if (!selectedCharacter) {
      toast.error("No character selected", {
        description: "Please select a character to accept this challenge.",
      });
      return;
    }

    setProcessingChallengeId(challenge.id);
    try {
      await acceptChallenge({
        character: selectedCharacter,
        challengeId: challenge.id,
        wagerAmount: challenge.wagerAmount,
      });
    } finally {
      setProcessingChallengeId(null);
    }
  };

  const handleCancelChallenge = async (challenge: Challenge) => {
    setProcessingChallengeId(challenge.id);
    try {
      await cancelChallenge(challenge.id);
    } finally {
      setProcessingChallengeId(null);
    }
  };

  return (
    <div className="space-y-4">
      {challenges.map((challenge) => {
        const isExpanded = expandedChallenge === challenge.id;
        const isChallenger =
          challenge.challengerId ===
          (selectedCharacter?.id ? Number(selectedCharacter.id) : -1);
        const canAccept = !isChallenger && selectedCharacter !== null;
        const canCancel = isChallenger;
        const isProcessing = processingChallengeId === challenge.id;

        return (
          <motion.div
            key={challenge.id.toString()}
            className="border border-yellow-600/20 rounded-lg overflow-hidden bg-gradient-to-r from-amber-900/10 to-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Challenge Summary - Always Visible */}
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
            <div
              className="p-4 flex justify-between items-center cursor-pointer"
              onClick={() =>
                setExpandedChallenge(isExpanded ? null : challenge.id)
              }
            >
              <div className="flex items-center space-x-3">
                <div className="bg-yellow-600/20 p-2 rounded-full">
                  <Shield className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <h4 className="font-medium text-yellow-400">
                    {isChallenger ? "Your Challenge" : "Challenge to Defend"}
                  </h4>
                  <p className="text-sm text-stone-300">
                    {isChallenger
                      ? `You challenged Player ${challenge.defenderId}`
                      : `Player ${challenge.challengerId} challenged you`}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <span className="text-yellow-500 font-medium mr-3">
                  {formatEther(challenge.wagerAmount)} ETH
                </span>
                <ChevronRight
                  className={`h-5 w-5 text-yellow-500 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                />
              </div>
            </div>

            {/* Expanded Challenge Details */}
            {isExpanded && (
              <div className="border-t border-yellow-600/10 p-4 bg-stone-900/30">
                <div className="grid grid-cols-2 gap-y-2 text-sm mb-4">
                  <span className="text-stone-400">Challenge ID:</span>
                  <span className="text-stone-200 font-mono">
                    {challenge.id.toString()}
                  </span>

                  <span className="text-stone-400">Created At:</span>
                  <span className="text-stone-200">
                    Block #{challenge.createdBlock.toString()}
                  </span>

                  <span className="text-stone-400">Status:</span>
                  <span className="text-stone-200">
                    {challenge.fulfilled ? (
                      <span className="text-yellow-500">Completed</span>
                    ) : (
                      <span className="text-green-500">Active</span>
                    )}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                  {canAccept && (
                    <YellowButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAcceptChallenge(challenge);
                      }}
                      className="w-full sm:w-auto"
                      disabled={isProcessing || isAcceptingChallenge}
                    >
                      {isProcessing && isAcceptingChallenge ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                          Accepting...
                        </>
                      ) : (
                        "Accept Challenge"
                      )}
                    </YellowButton>
                  )}

                  {canCancel && (
                    <YellowButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelChallenge(challenge);
                      }}
                      className="w-full sm:w-auto"
                      variant="outline"
                      disabled={isProcessing || isCancellingChallenge}
                    >
                      {isProcessing && isCancellingChallenge ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                          Cancelling...
                        </>
                      ) : (
                        "Cancel Challenge"
                      )}
                    </YellowButton>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
