"use client";

import { useState } from "react";
import { MostDuelsAccepted } from "@/components/battle-archives/most-duels-accepted";
import { MostDuelsCreated } from "@/components/battle-archives/most-duels-created";
import { OpenChallenges } from "@/components/battle-archives/open-challenges";
import { RecentBattles } from "@/components/battle-archives/recent-battles";
import { TopDuelsByWager } from "@/components/battle-archives/top-duels-by-wager";
import { WarriorLeaderboard } from "@/components/battle-archives/warrior-leaderboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Swords, CircleDollarSign, Trophy, Clock, Users } from "lucide-react";

export default function BattleArchivesPage() {
  const [activeTab, setActiveTab] = useState("recent");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-yellow-500 mb-2">
          Battle Archives
        </h1>
        <p className="text-stone-400">
          Chronicles of combat and glory in the Heavy Helms arena
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="bg-stone-800/50 border border-yellow-600/20 w-full flex justify-between mb-6 overflow-x-auto">
          <TabsTrigger
            value="recent"
            className="data-[state=active]:bg-yellow-600/20 data-[state=active]:text-yellow-400 flex items-center gap-2"
          >
            <Clock className="h-4 w-4" />
            Recent Battles
          </TabsTrigger>
          <TabsTrigger
            value="challenges"
            className="data-[state=active]:bg-yellow-600/20 data-[state=active]:text-yellow-400 flex items-center gap-2"
          >
            <Swords className="h-4 w-4" />
            Open Challenges
          </TabsTrigger>
          <TabsTrigger
            value="leaderboard"
            className="data-[state=active]:bg-yellow-600/20 data-[state=active]:text-yellow-400 flex items-center gap-2"
          >
            <Trophy className="h-4 w-4" />
            Warrior Leaderboard
          </TabsTrigger>
          <TabsTrigger
            value="wagers"
            className="data-[state=active]:bg-yellow-600/20 data-[state=active]:text-yellow-400 flex items-center gap-2"
          >
            <CircleDollarSign className="h-4 w-4" />
            Top Wagers
          </TabsTrigger>
          <TabsTrigger
            value="accepted"
            className="data-[state=active]:bg-yellow-600/20 data-[state=active]:text-yellow-400 flex items-center gap-2"
          >
            <Shield className="h-4 w-4" />
            Most Accepted
          </TabsTrigger>
          <TabsTrigger
            value="created"
            className="data-[state=active]:bg-yellow-600/20 data-[state=active]:text-yellow-400 flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Most Created
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <RecentBattles />
        </TabsContent>

        <TabsContent value="challenges">
          <OpenChallenges />
        </TabsContent>

        <TabsContent value="leaderboard">
          <WarriorLeaderboard />
        </TabsContent>

        <TabsContent value="wagers">
          <TopDuelsByWager />
        </TabsContent>

        <TabsContent value="accepted">
          <MostDuelsAccepted />
        </TabsContent>

        <TabsContent value="created">
          <MostDuelsCreated />
        </TabsContent>
      </Tabs>
    </div>
  );
}
