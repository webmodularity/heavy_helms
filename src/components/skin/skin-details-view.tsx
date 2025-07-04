"use client";

import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { request } from "graphql-request";
import { SUBGRAPH_URL } from "@/config";
import { SkinHeroSection } from "./skin-hero-section";
import { SkinImage } from "./skin-image";
import { SkinStatsSection } from "./skin-stats-section";
import { SkinEquipmentInfo } from "./skin-equipment-info";

import { TopWarriorsSection } from "./skin-top-warriors";
import {
  SkinDetailsSkeleton,
  SkinError,
  SkinNotFound,
} from "./skin-loading-states";
import { useSkinMetadata } from "@/hooks/use-skin-metadata";
import { gql } from "graphql-request";

// GraphQL query to get skin analytics by collection and token ID
const GET_SKIN_ANALYTICS_BY_ID = gql`
  query getSkinAnalytics($skinCollectionId: BigInt!, $skinTokenId: Int!) {
    # Get the skin metadata
    skins(where: {
      collection: $skinCollectionId,
      tokenId: $skinTokenId
    }) {
      id
      tokenId
      metadataURI
      weapon
      armor
      collection {
        id
        contractAddress
        isVerified
        skinType
        requiredNFTAddress
      }
    }
    
    # Get all stance analytics for this skin
    skinCombatStats(where: {
      skinCollectionId: $skinCollectionId,
      skinTokenId: $skinTokenId
    }) {
      id
      stance
      
      # Combat counts
      totalCombats
      wins
      losses
      
      # Win conditions breakdown
      kills
      deaths
      knockouts
      knockedOut
      exhaustions
      exhausted
      maxRoundWins
      maxRoundLosses
      
      # Calculated rates (BigDecimal)
      killRate
      deathRate
      killDeathRatio
      winRate
      survivalRate
      
      # Offensive metrics
      totalDamageDealt
      averageDamageDealt
      maxDamageDealt
      
      # Defensive metrics
      totalDamageTaken
      averageDamageTaken
      totalHealthLost
      averageHealthLost
      minDamageTaken
      
      # Efficiency metrics
      damageEfficiency
      
      # Timestamps
      firstCombat
      lastCombat
      lastUpdated
    }
  }
`;

// GraphQL query for Top Warriors using PlayerSkinCombatStat
const GET_TOP_WARRIORS = gql`
  query getTopWarriors($skinCollectionId: BigInt!, $skinTokenId: Int!, $stance: Int!) {
    # Most Wins
    mostWins: playerSkinCombatStats(
      where: { skinCollectionId: $skinCollectionId, skinTokenId: $skinTokenId, stance: $stance }
      orderBy: wins
      orderDirection: desc
      first: 5
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
      first: 5
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
    
    # Most Damage
    mostDamage: playerSkinCombatStats(
      where: { skinCollectionId: $skinCollectionId, skinTokenId: $skinTokenId, stance: $stance }
      orderBy: totalDamageDealt
      orderDirection: desc
      first: 5
    ) {
      playerId
      totalDamageDealt
      averageDamageDealt
      totalCombats
      player {
        fullName
        fighterId
      }
    }
    
    # Best Survival Rate
    bestSurvival: playerSkinCombatStats(
      where: { 
        skinCollectionId: $skinCollectionId, 
        skinTokenId: $skinTokenId, 
        stance: $stance,
        totalCombats_gte: 5
      }
      orderBy: survivalRate
      orderDirection: desc
      first: 5
    ) {
      playerId
      survivalRate
      deaths
      totalCombats
      player {
        fullName
        fighterId
      }
    }
  }
`;

interface SkinDetailsViewProps {
  collectionId: string;
  tokenId: string;
}

interface SkinData {
  id: string;
  tokenId: number;
  metadataURI: string;
  weapon: number;
  armor: number;
  collection: {
    id: string;
    contractAddress: string;
    isVerified: boolean;
    skinType: number;
    requiredNFTAddress: string | null;
  };
  imageURL?: string;
  spritesheet?: unknown;
}

interface StanceData {
  id: string;
  stance: number;
  totalCombats: number;
  wins: number;
  losses: number;
  winRate: string;
  kills: number;
  deaths: number;
  killRate: string;
  deathRate: string;
  killDeathRatio: string;
  survivalRate: string;
  totalDamageDealt: string;
  averageDamageDealt: string;
  maxDamageDealt: string;
  totalDamageTaken: string;
  averageDamageTaken: string;
  damageEfficiency: string;
  knockouts: number;
  knockedOut: number;
  exhaustions: number;
  exhausted: number;
  maxRoundWins: number;
  maxRoundLosses: number;
}

export function SkinDetailsView({
  collectionId,
  tokenId,
}: SkinDetailsViewProps) {
  // Fetch skin analytics data
  const { data, isLoading, error } = useQuery({
    queryKey: ["skin-analytics", collectionId, tokenId],
    queryFn: async () => {
      const response = await request<{
        skins: SkinData[];
        skinCombatStats: StanceData[];
      }>(SUBGRAPH_URL, GET_SKIN_ANALYTICS_BY_ID, {
        skinCollectionId: collectionId,
        skinTokenId: Number.parseInt(tokenId),
      });
      return response;
    },
    enabled: !!(collectionId && tokenId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch skin metadata for image
  const skinMetadataURI = data?.skins?.[0]?.metadataURI;
  const { data: skinMetadata, isLoading: isLoadingMetadata } =
    useSkinMetadata(skinMetadataURI);

  // Generate collection name
  const getCollectionName = (collectionId: string): string => {
    if (collectionId === "0") return "Default";
    return `Collection ${collectionId}`;
  };

  const collectionName = getCollectionName(collectionId);

  // Loading state
  if (isLoading) {
    return <SkinDetailsSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <SkinError
        error={error instanceof Error ? error.message : "Unknown error"}
      />
    );
  }

  // No data found
  if (!data?.skins?.length) {
    return <SkinNotFound />;
  }

  const skinData = data.skins[0];
  const stanceData = data.skinCombatStats || [];

  // Add the real image URL from metadata
  const enhancedSkinData = {
    ...skinData,
    imageURL: skinMetadata?.imageUrl || undefined,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
            {/* Mobile Hero Section - Title at top on mobile */}
      <div className="lg:hidden">
        <SkinHeroSection
          skinData={enhancedSkinData}
          collectionName={collectionName}
          combatResults={[]} // We can add this later if needed
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Skin Image + Equipment Info */}
        <div className="lg:col-span-1 space-y-6">
          <SkinImage
            skinData={enhancedSkinData}
            collectionName={collectionName}
          />

          {/* Equipment Information */}
          <SkinEquipmentInfo skinData={enhancedSkinData} />
        </div>

        {/* Right Column - Hero Section + Stance Performance */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Section - Title to the right of image - Desktop only */}
          <div className="hidden lg:block">
            <SkinHeroSection
              skinData={enhancedSkinData}
              collectionName={collectionName}
              combatResults={[]} // We can add this later if needed
            />
          </div>

          {/* Stance Performance Section */}
          {stanceData.length > 0 ? (
            <SkinStatsSection stanceData={stanceData} />
          ) : (
            <div className="bg-stone-800/40 rounded-lg border border-yellow-600/20 p-6 text-center">
              <h3 className="text-xl font-semibold text-yellow-500 mb-2">
                No Combat Data
              </h3>
              <p className="text-stone-400">
                This skin hasn't been used in combat yet. Performance analytics
                will appear after the first battle.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Full Width Sections Below */}
      {/* Top Warriors Sections - One for each stance with data */}
      {stanceData.map((stance) => (
        <TopWarriorsSection
          key={stance.stance}
          skinCollectionId={collectionId}
          skinTokenId={Number.parseInt(tokenId)}
          stance={stance.stance}
        />
      ))}

      {/* Future sections can be added here */}
      {/* - Advanced Analytics */}
      {/* - Meta Insights */}
    </motion.div>
  );
}
