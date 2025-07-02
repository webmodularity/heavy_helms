"use client";

import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { request } from "graphql-request";
import { SUBGRAPH_URL } from "@/config";
import { gql } from "graphql-request";
import { Crown, Trophy, Sword, Shield, Activity } from "lucide-react";
import { useRouter } from "next/navigation";

// GraphQL query for Top Warriors using PlayerSkinCombatStat
const GET_TOP_WARRIORS = gql`
  query getTopWarriors($skinCollectionId: BigInt!, $skinTokenId: Int!, $stance: Int!) {
    # Most Wins (minimum 5 fights)
    mostWins: playerSkinCombatStats(
      where: { 
        skinCollectionId: $skinCollectionId, 
        skinTokenId: $skinTokenId, 
        stance: $stance,
        totalCombats_gte: 5
      }
      orderBy: wins
      orderDirection: desc
      first: 1
    ) {
      playerId
      wins
      losses
      totalCombats
      winRate
      player {
        fullName
        fighterId
      }
    }
    
    # Best Win Rate (minimum 5 fights)
    bestWinRate: playerSkinCombatStats(
      where: { 
        skinCollectionId: $skinCollectionId, 
        skinTokenId: $skinTokenId, 
        stance: $stance,
        totalCombats_gte: 5
      }
      orderBy: winRate
      orderDirection: desc
      first: 1
    ) {
      playerId
      winRate
      totalCombats
      wins
      losses
      player {
        fullName
        fighterId
      }
    }
    
    # Highest Average Damage (minimum 5 fights)
    highestAvgDamage: playerSkinCombatStats(
      where: { 
        skinCollectionId: $skinCollectionId, 
        skinTokenId: $skinTokenId, 
        stance: $stance,
        totalCombats_gte: 5
      }
      orderBy: averageDamageDealt
      orderDirection: desc
      first: 1
    ) {
      playerId
      averageDamageDealt
      totalCombats
      player {
        fullName
        fighterId
      }
    }
    
    # Best Damage Mitigation (minimum 5 fights, lowest damage taken = best)
    bestMitigation: playerSkinCombatStats(
      where: { 
        skinCollectionId: $skinCollectionId, 
        skinTokenId: $skinTokenId, 
        stance: $stance,
        totalCombats_gte: 5
      }
      orderBy: averageDamageTaken
      orderDirection: asc
      first: 1
    ) {
      playerId
      averageDamageTaken
      totalCombats
      player {
        fullName
        fighterId
      }
    }
    
    # Total Fights (minimum 5 fights)
    totalFights: playerSkinCombatStats(
      where: { 
        skinCollectionId: $skinCollectionId, 
        skinTokenId: $skinTokenId, 
        stance: $stance,
        totalCombats_gte: 5
      }
      orderBy: totalCombats
      orderDirection: desc
      first: 1
    ) {
      playerId
      totalCombats
      wins
      losses
      kills
      player {
        fullName
        fighterId
      }
    }
  }
`;

interface TopWarriorsProps {
  skinCollectionId: string;
  skinTokenId: number;
  stance: number;
}

interface WarriorStat {
  playerId: string;
  player: {
    fullName: string;
    fighterId: number;
  };
  wins?: number;
  losses?: number;
  kills?: number;
  totalCombats: number;
  winRate?: string;
  averageDamageDealt?: string;
  averageDamageTaken?: string;
}

interface TopWarriorsData {
  mostWins: WarriorStat[];
  bestWinRate: WarriorStat[];
  highestAvgDamage: WarriorStat[];
  bestMitigation: WarriorStat[];
  totalFights: WarriorStat[];
}

export function TopWarriorsSection({
  skinCollectionId,
  skinTokenId,
  stance,
}: TopWarriorsProps) {
  const router = useRouter();

  const { data, isLoading, error } = useQuery<TopWarriorsData>({
    queryKey: ["top-warriors", skinCollectionId, skinTokenId, stance],
    queryFn: async () => {
      const response = await request<TopWarriorsData>(
        SUBGRAPH_URL,
        GET_TOP_WARRIORS,
        {
          skinCollectionId,
          skinTokenId,
          stance,
        },
      );
      return response;
    },
    enabled: !!(
      skinCollectionId &&
      skinTokenId !== undefined &&
      stance !== undefined
    ),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const getStanceName = (stance: number): string => {
    const names = ["DEFENSIVE", "BALANCED", "OFFENSIVE"];
    return names[stance] || "UNKNOWN";
  };

  const formatPercentage = (value: string): string => {
    return `${(Number.parseFloat(value) * 100).toFixed(1)}%`;
  };

  const formatNumber = (value: string): string => {
    return Math.round(Number.parseFloat(value)).toLocaleString();
  };

  const handleWarriorClick = (playerId: string) => {
    router.push(`/character/${playerId}`);
  };

  if (isLoading) {
    return (
      <motion.div
        className="mb-8 animate-pulse"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <h3 className="text-xl font-semibold mb-6 flex items-center text-yellow-500">
          <span>🏆 Top {getStanceName(stance)} Warriors</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-stone-800/40 rounded-lg border border-yellow-600/20 p-4"
            >
              <div className="h-4 bg-stone-700 rounded mb-3" />
              <div className="space-y-2">
                <div className="h-3 bg-stone-700 rounded" />
                <div className="h-3 bg-stone-700 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (error || !data) {
    return null; // Don't show anything if there's an error or no data
  }

  // Check if any warrior has 5+ fights and qualifies for any category
  const hasQualifiedWarriors =
    data.mostWins.length > 0 ||
    data.bestWinRate.length > 0 ||
    data.highestAvgDamage.length > 0 ||
    data.bestMitigation.length > 0 ||
    data.totalFights.length > 0;

  if (!hasQualifiedWarriors) {
    return null; // Don't show the section if no one has 5+ fights
  }

  const categories = [
    {
      title: "Most Wins",
      icon: <Crown className="h-4 w-4" />,
      data: data.mostWins,
      getValue: (warrior: WarriorStat) => warrior.wins?.toString() || "0",
      getSubValue: (warrior: WarriorStat) => `${warrior.totalCombats} fights`,
    },
    {
      title: "Best Win Rate",
      icon: <Trophy className="h-4 w-4" />,
      data: data.bestWinRate,
      getValue: (warrior: WarriorStat) =>
        warrior.winRate ? formatPercentage(warrior.winRate) : "0%",
      getSubValue: (warrior: WarriorStat) => `${warrior.totalCombats} fights`,
    },
    {
      title: "Avg Damage",
      icon: <Sword className="h-4 w-4" />,
      data: data.highestAvgDamage,
      getValue: (warrior: WarriorStat) =>
        warrior.averageDamageDealt
          ? formatNumber(warrior.averageDamageDealt)
          : "0",
      getSubValue: (warrior: WarriorStat) => `${warrior.totalCombats} fights`,
    },
    {
      title: "Damage Mitigation",
      icon: <Shield className="h-4 w-4" />,
      data: data.bestMitigation,
      getValue: (warrior: WarriorStat) =>
        warrior.averageDamageTaken
          ? formatNumber(warrior.averageDamageTaken)
          : "0",
      getSubValue: (warrior: WarriorStat) => `${warrior.totalCombats} fights`,
    },
    {
      title: "Total Fights",
      icon: <Activity className="h-4 w-4" />,
      data: data.totalFights,
      getValue: (warrior: WarriorStat) => warrior.totalCombats.toString(),
      getSubValue: (warrior: WarriorStat) =>
        `${warrior.wins || 0}-${warrior.losses || 0}-${warrior.kills || 0}`,
    },
  ];

  return (
    <motion.div
      className="mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      <h3 className="text-xl font-semibold mb-6 flex items-center text-yellow-500">
        <span>🏆 Top {getStanceName(stance)} Warriors</span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {categories.map((category, categoryIndex) => (
          <div
            key={category.title}
            className="bg-stone-800/40 rounded-lg border border-yellow-600/20 p-4"
          >
            <div className="flex items-center text-yellow-500 font-semibold mb-3">
              {category.icon}
              <span className="ml-2 text-sm">{category.title}</span>
            </div>

            <div>
              {category.data.length > 0 ? (
                <motion.div
                  className="flex items-center justify-between p-2 rounded bg-stone-700/30 hover:bg-stone-700/50 cursor-pointer transition-colors"
                  whileHover={{ x: 2 }}
                  onClick={() => handleWarriorClick(category.data[0].playerId)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: categoryIndex * 0.1 }}
                >
                  <div className="flex items-center space-x-2">
                    <div>
                      <div className="text-sm text-stone-200 font-medium hover:text-yellow-400 transition-colors">
                        {category.data[0].player.fullName}
                      </div>
                      <div className="text-xs text-stone-500">
                        #{category.data[0].player.fighterId}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-yellow-400">
                      {category.getValue(category.data[0])}
                    </div>
                    <div className="text-xs text-stone-500 whitespace-nowrap">
                      {category.getSubValue(category.data[0])}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center text-stone-500 text-sm py-2">
                  No data yet
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
