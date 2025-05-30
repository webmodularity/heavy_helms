"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { X, Loader2, Sparkles, Star, Zap, RefreshCw } from "lucide-react";
import { EmberCharacter } from "./ember-character";
import { useFollowingData } from "@/hooks/use-following-data";
import { useActivePlayers } from "@/hooks/use-active-players";
import { useSupabaseAddressToUserMap } from "@/hooks/use-supabase-players";
import { getAddress } from "viem";
import type { Fighter } from "@/types/fighter-types";
import type { Player } from "@/types/player.types";

interface AlternateDimensionProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCharacter: Player;
  onChallengePlayer: (player: Fighter) => void;
  skipPortalAnimation?: boolean;
}

export function AlternateDimension({
  isOpen,
  onClose,
  selectedCharacter,
  onChallengePlayer,
  skipPortalAnimation = false,
}: AlternateDimensionProps) {
  const [showEmbers, setShowEmbers] = useState(false);
  const [emberIndex, setEmberIndex] = useState(0);
  const [portalPhase, setPortalPhase] = useState(0); // 0: closed, 1: opening, 2: open
  const [embersComplete, setEmbersComplete] = useState(false);
  const [emberPositions, setEmberPositions] = useState<Array<{x: number, y: number}>>([]);

  // NEW: Refresh functionality
  const [refreshSeed, setRefreshSeed] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { currentUserFid, isLoadingFollowing, isFollowing } =
    useFollowingData();
  const { players: allPlayers, isLoading: isLoadingPlayers } =
    useActivePlayers();
  const { data: addressToUserMap, isLoading: isAddressMapLoading } =
    useSupabaseAddressToUserMap();

  // Get all challengeable following players
  const allChallengeableFriends = useMemo(() => {
    if (
      isLoadingPlayers ||
      isLoadingFollowing ||
      isAddressMapLoading ||
      !allPlayers ||
      !addressToUserMap
    ) {
      return [];
    }

    return allPlayers;
    // return allPlayers.filter((player) => {
    //   // Don't include own character
    //   if (player.id === selectedCharacter.id) return false;

    //   // Check if this player is followed
    //   const playerAddress = player.owner?.address;
    //   if (!playerAddress) return false;

    //   const user = addressToUserMap[getAddress(playerAddress)];
    //   if (!user?.farcaster_fid) return false;

    //   return isFollowing(user.farcaster_fid);
    // });
  }, [
    allPlayers,
    selectedCharacter.id,
    isLoadingPlayers,
    isLoadingFollowing,
    isAddressMapLoading,
    addressToUserMap,
    isFollowing,
  ]);

  // Updated: Include refresh seed in random selection with better randomness
  const challengeableFriends = useMemo(() => {
    if (allChallengeableFriends.length === 0) return [];

    // Create a better seeded random function with more variation
    const createSeededRandom = (seed: number) => {
      let seedValue = seed;
      return () => {
        seedValue = (seedValue * 9301 + 49297) % 233280;
        return seedValue / 233280;
      };
    };

    // Use both character ID and refresh seed for variety
    const baseSeed = Number(selectedCharacter.id) * 12345 + refreshSeed * 67890;
    const seededRandom = createSeededRandom(baseSeed);
    
    // Shuffle with better randomness
    const shuffled = [...allChallengeableFriends]
      .map(player => ({ player, sort: seededRandom() }))
      .sort((a, b) => a.sort - b.sort)
      .map(item => item.player);

    return shuffled.slice(0, 10); // Limit to 10 friends max
  }, [allChallengeableFriends, selectedCharacter.id, refreshSeed]);

  // Enhanced positioning system with collision detection - NOW INCLUDES REFRESH SEED
  const generateNonOverlappingPositions = useMemo(() => {
    if (challengeableFriends.length === 0) return [];

    const positions: Array<{x: number, y: number}> = [];
    const emberSize = 80;
    const minDistance = emberSize * 1.2;
    
    // Define safe boundaries
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    const centerBuffer = 120;
    const edgeBuffer = 100;
    
    const maxX = Math.min(viewportWidth * 0.4, 400);
    const maxY = Math.min(viewportHeight * 0.35, 300);

    // Better seeded random function
    const createSeededRandom = (seed: number) => {
      let seedValue = seed;
      return () => {
        seedValue = (seedValue * 16807) % 2147483647;
        return (seedValue - 1) / 2147483646;
      };
    };
    
    for (let i = 0; i < challengeableFriends.length; i++) {
      const player = challengeableFriends[i];
      let position = { x: 0, y: 0 };
      let attempts = 0;
      const maxAttempts = 50;
      
      // Include refresh seed in position calculation for variety
      const seed1 = Number(player.id) * 1234 + i * 5678 + refreshSeed * 9999;
      const seed2 = Number(player.id) * 9876 + i * 4321 + refreshSeed * 7777;
      
      const seededRandom1 = createSeededRandom(seed1);
      const seededRandom2 = createSeededRandom(seed2);
      
      do {
        // Generate random angle and radius with more variation
        const angle = seededRandom1() * Math.PI * 2;
        const radiusMultiplier = 0.4 + seededRandom2() * 0.6;
        const radius = centerBuffer + radiusMultiplier * (maxX - centerBuffer);
        
        // Add some randomness to break patterns
        const angleOffset = (seededRandom1() - 0.5) * 0.5; // ±0.25 radians
        const radiusOffset = (seededRandom2() - 0.5) * 50; // ±25px
        
        position.x = Math.cos(angle + angleOffset) * (radius + radiusOffset);
        position.y = Math.sin(angle + angleOffset) * (radius + radiusOffset);
        
        // Ensure within bounds
        position.x = Math.max(-maxX + edgeBuffer, Math.min(maxX - edgeBuffer, position.x));
        position.y = Math.max(-maxY + edgeBuffer, Math.min(maxY - edgeBuffer, position.y));
        
        // Check for overlaps with existing positions
        const hasOverlap = positions.some(existingPos => {
          const distance = Math.sqrt(
            Math.pow(position.x - existingPos.x, 2) + 
            Math.pow(position.y - existingPos.y, 2)
          );
          return distance < minDistance;
        });
        
        if (!hasOverlap) {
          break;
        }
        
        attempts++;
      } while (attempts < maxAttempts);
      
      // If we couldn't find a non-overlapping position, use a spiral with refresh variation
      if (attempts >= maxAttempts) {
        const spiralAngle = (i * 137.5 + refreshSeed * 45) * (Math.PI / 180); // Add refresh variation
        const spiralRadius = centerBuffer + ((i + refreshSeed) * 25) % (maxX - centerBuffer);
        position.x = Math.cos(spiralAngle) * spiralRadius;
        position.y = Math.sin(spiralAngle) * spiralRadius;
      }
      
      positions.push(position);
    }
    
    return positions;
  }, [challengeableFriends, refreshSeed]); // Add refreshSeed as dependency

  // Update ember positions when they change
  useEffect(() => {
    setEmberPositions(generateNonOverlappingPositions);
  }, [generateNonOverlappingPositions]);

  // Simplified portal opening sequence
  useEffect(() => {
    if (isOpen) {
      if (skipPortalAnimation) {
        // Immediate open state for page navigation
        setPortalPhase(2);
        setShowEmbers(true);
        setEmbersComplete(false);
      } else {
        // Natural center-opening animation for overlay mode
        setPortalPhase(1);
        setEmbersComplete(false);
        const timer1 = setTimeout(() => {
          setPortalPhase(2);
          setShowEmbers(true);
        }, 800); // Faster opening
        return () => clearTimeout(timer1);
      }
    } else {
      setShowEmbers(false);
      setEmberIndex(0);
      setPortalPhase(0);
      setEmbersComplete(false);
    }
  }, [isOpen, skipPortalAnimation]);

  // Stagger ember appearances with enhanced timing
  useEffect(() => {
    if (showEmbers && emberIndex < challengeableFriends.length) {
      const timer = setTimeout(() => {
        setEmberIndex((prev) => prev + 1);
      }, 250); // Slightly faster for better flow
      return () => clearTimeout(timer);
    } else if (showEmbers && emberIndex >= challengeableFriends.length) {
      // All embers have appeared, enable full background effects
      const timer = setTimeout(() => {
        setEmbersComplete(true);
      }, 500); // Small delay after last ember
      return () => clearTimeout(timer);
    }
  }, [showEmbers, emberIndex, challengeableFriends.length]);

  const isLoading =
    isLoadingFollowing || isLoadingPlayers || isAddressMapLoading;

  // Performance-aware background particle count
  const particleCount = embersComplete ? 20 : showEmbers ? 5 : 15; // Fewer during ember appearance
  const symbolCount = embersComplete ? 3 : showEmbers ? 1 : 2; // Minimal symbols during ember appearance

  // NEW: Refresh functionality
  const handleRefresh = async () => {
    if (isRefreshing || challengeableFriends.length === 0) return;
    
    setIsRefreshing(true);
    
    // Reset ember states
    setShowEmbers(false);
    setEmberIndex(0);
    setEmbersComplete(false);
    
    // Wait for fade out
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Update refresh seed to get new random selection
    setRefreshSeed(prev => prev + 1);
    
    // Wait a bit more for positions to update
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Start showing new embers
    setShowEmbers(true);
    setIsRefreshing(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 overflow-hidden bg-black"
          initial={{ opacity: skipPortalAnimation ? 1 : 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: skipPortalAnimation ? 0 : 0.5 }}
        >
          {/* Clean dimensional background - no competing elements */}
          <motion.div
            className="absolute inset-0"
            initial={{ 
              scale: skipPortalAnimation ? 1 : 0,
            }}
            animate={{
              scale: portalPhase >= 1 ? 1 : 0,
            }}
            exit={{ scale: 0 }}
            transition={{
              duration: skipPortalAnimation ? 0 : 0.8,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            style={{
              background: "radial-gradient(circle at center, rgba(245, 158, 11, 0.15) 0%, rgba(139, 69, 19, 0.3) 40%, rgba(0, 0, 0, 0.95) 100%)",
            }}
          />

          {/* Natural portal opening effect from center */}
          <AnimatePresence>
            {portalPhase === 1 && !skipPortalAnimation && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Centered energy rings */}
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full border border-yellow-400/40"
                    style={{
                      left: "50%",
                      top: "50%",
                      width: `${(i + 1) * 100}px`,
                      height: `${(i + 1) * 100}px`,
                      marginLeft: `${-(i + 1) * 50}px`,
                      marginTop: `${-(i + 1) * 50}px`,
                    }}
                    animate={{
                      scale: [0, 1.5],
                      opacity: [0.8, 0],
                    }}
                    transition={{
                      duration: 0.8,
                      delay: i * 0.1,
                      ease: "easeOut",
                    }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dynamic background particles */}
          <div className="absolute inset-0">
            {[...Array(particleCount)].map((_, i) => (
              <motion.div
                key={`particle-${i}-${particleCount}`}
                className="absolute rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: Math.random() * 3 + 1,
                  height: Math.random() * 3 + 1,
                  background:
                    i % 3 === 0
                      ? "#FCD34D"
                      : i % 3 === 1
                        ? "#F59E0B"
                        : "#FBBF24",
                  willChange: "transform, opacity",
                }}
                animate={{
                  opacity: [0, 0.8, 0],
                  scale: [0, 1, 0],
                  y: showEmbers
                    ? [0, -30]
                    : [0, -50 - Math.random() * 30],
                  x: showEmbers
                    ? [(Math.random() - 0.5) * 10]
                    : [(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 30],
                }}
                transition={{
                  duration: showEmbers ? 4 : 3 + Math.random() * 2,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: Math.random() * 3,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>

          {/* Floating magical symbols */}
          <AnimatePresence>
            {symbolCount > 0 && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(symbolCount)].map((_, i) => (
                  <motion.div
                    key={`symbol-${i}-${symbolCount}`}
                    className="absolute text-yellow-400/15"
                    style={{
                      left: `${30 + Math.random() * 40}%`,
                      top: `${30 + Math.random() * 40}%`,
                      willChange: "transform, opacity",
                    }}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{
                      opacity: showEmbers
                        ? [0.05, 0.15, 0.05]
                        : [0.1, 0.2, 0.1],
                      rotate: [0, 360],
                      scale: showEmbers ? [0.8, 1, 0.8] : [0.8, 1.2, 0.8],
                    }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{
                      duration: showEmbers ? 12 : 8 + Math.random() * 4,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: i * 3,
                      ease: "easeInOut",
                    }}
                  >
                    {i % 3 === 0 ? (
                      <Star className="w-6 h-6" />
                    ) : i % 3 === 1 ? (
                      <Sparkles className="w-6 h-6" />
                    ) : (
                      <Zap className="w-6 h-6" />
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>

          {/* Enhanced title - without refresh button */}
          <motion.div
            className="absolute top-12 left-1/2 transform -translate-x-1/2 text-center"
            initial={{ opacity: 0, y: -50, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: skipPortalAnimation ? 0.1 : 1.2, type: "spring", stiffness: 150 }}
          >
            <motion.h1
              className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text 
                         bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 mb-3"
              animate={{
                backgroundPosition: embersComplete
                  ? ["0% 50%", "100% 50%", "0% 50%"]
                  : "0% 50%",
              }}
              transition={{
                duration: 3,
                repeat: embersComplete ? Number.POSITIVE_INFINITY : 0,
                ease: "easeInOut",
              }}
              style={{
                backgroundSize: "200% 200%",
              }}
            >
              Inner Circle
            </motion.h1>

            <motion.p
              className="text-stone-300 text-sm"
              animate={{
                opacity: embersComplete ? [0.7, 1, 0.7] : 0.8,
              }}
              transition={{
                duration: 2,
                repeat: embersComplete ? Number.POSITIVE_INFINITY : 0,
                ease: "easeInOut",
              }}
            >
              Challenge your Farcaster friends to epic duels
              {challengeableFriends.length > 0 && (
                <span className="block text-xs text-yellow-400/80 mt-1">
                  Showing {challengeableFriends.length} of{" "}
                  {allChallengeableFriends.length} friends
                  {allChallengeableFriends.length > 10 && (
                    <span className="text-yellow-300/60"> • Refresh for more</span>
                  )}
                </span>
              )}
            </motion.p>
          </motion.div>

          {/* Fixed position magical refresh button - TOP RIGHT */}
          <AnimatePresence>
            {challengeableFriends.length > 0 && allChallengeableFriends.length > 10 && (
              <motion.button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="fixed top-6 right-6 z-[60] w-12 h-12 rounded-full border-2 border-yellow-400/30 
                           bg-gradient-to-br from-amber-500/20 to-orange-600/20 
                           backdrop-blur-sm hover:border-yellow-300/50 
                           transition-all duration-300 group
                           disabled:opacity-50 disabled:cursor-not-allowed
                           shadow-lg hover:shadow-yellow-400/20
                           touch-manipulation"
                whileHover={{ 
                  scale: isRefreshing ? 1 : 1.15,
                  boxShadow: "0 0 25px rgba(251, 146, 60, 0.5)",
                }}
                whileTap={{ scale: isRefreshing ? 1 : 0.9 }}
                initial={{ opacity: 0, scale: 0, rotate: -180 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  rotate: 0,
                }}
                exit={{ 
                  opacity: 0, 
                  scale: 0, 
                  rotate: 180,
                  transition: { duration: 0.3 }
                }}
                transition={{ 
                  delay: skipPortalAnimation ? 0.3 : 1.8,
                  type: "spring",
                  stiffness: 200,
                  damping: 15
                }}
              >
                {/* Enhanced magical aura */}
                <motion.div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    background: "radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, rgba(255, 165, 0, 0.2) 50%, transparent 80%)",
                    filter: "blur(8px)",
                  }}
                  animate={{
                    scale: isRefreshing ? [1, 1.4, 1] : [1, 1.3, 1],
                    opacity: isRefreshing ? [0.4, 0.8, 0.4] : [0.3, 0.6, 0.3],
                    rotate: [0, 360],
                  }}
                  transition={{
                    scale: {
                      duration: isRefreshing ? 0.8 : 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    },
                    opacity: {
                      duration: isRefreshing ? 0.8 : 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    },
                    rotate: {
                      duration: 8,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    },
                  }}
                />

                {/* Outer ring */}
                <motion.div
                  className="absolute inset-1 rounded-full border border-yellow-400/20 pointer-events-none"
                  animate={{
                    borderColor: isRefreshing 
                      ? ["rgba(255, 215, 0, 0.6)", "rgba(255, 165, 0, 0.8)", "rgba(255, 215, 0, 0.6)"]
                      : ["rgba(255, 215, 0, 0.2)", "rgba(255, 165, 0, 0.4)", "rgba(255, 215, 0, 0.2)"],
                    rotate: [0, -360],
                  }}
                  transition={{
                    borderColor: {
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    },
                    rotate: {
                      duration: isRefreshing ? 2 : 6,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    },
                  }}
                />

                {/* Refresh icon */}
                <motion.div
                  className="relative z-10 flex items-center justify-center w-full h-full"
                  animate={{
                    rotate: isRefreshing ? 360 : 0,
                  }}
                  transition={{
                    duration: isRefreshing ? 0.8 : 0.3,
                    repeat: isRefreshing ? Number.POSITIVE_INFINITY : 0,
                    ease: isRefreshing ? "linear" : "easeOut",
                  }}
                >
                  <RefreshCw className="w-6 h-6 text-yellow-300 group-hover:text-yellow-200 drop-shadow-sm" />
                </motion.div>

                {/* Floating sparkles around the button */}
                <AnimatePresence>
                  {embersComplete && !isRefreshing && (
                    <>
                      {[...Array(4)].map((_, i) => (
                        <motion.div
                          key={`refresh-sparkle-${i}`}
                          className="absolute w-1.5 h-1.5 bg-yellow-300 rounded-full pointer-events-none"
                          style={{
                            left: "50%",
                            top: "50%",
                          }}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{
                            opacity: [0, 1, 0.7, 0],
                            scale: [0, 1.2, 1, 0],
                            x: [0, Math.cos((i * 90 * Math.PI) / 180) * 28],
                            y: [0, Math.sin((i * 90 * Math.PI) / 180) * 28],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Number.POSITIVE_INFINITY,
                            delay: i * 0.3,
                            ease: "easeOut",
                          }}
                        />
                      ))}
                    </>
                  )}
                </AnimatePresence>

                {/* Tooltip */}
                <motion.div
                  className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 
                             bg-stone-900/95 border border-yellow-400/40 rounded-lg px-3 py-1
                             text-yellow-300 text-xs whitespace-nowrap backdrop-blur-sm
                             shadow-lg pointer-events-none"
                  initial={{ opacity: 0, y: -5, scale: 0.8 }}
                  animate={{
                    opacity: isRefreshing ? 0 : 1,
                    y: isRefreshing ? -5 : 0,
                    scale: isRefreshing ? 0.8 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {isRefreshing ? "Refreshing..." : "Refresh Friends"}
                  
                  {/* Tooltip arrow */}
                  <div
                    className="absolute top-[-6px] left-1/2 transform -translate-x-1/2 w-0 h-0"
                    style={{
                      borderLeft: "6px solid transparent",
                      borderRight: "6px solid transparent",
                      borderBottom: "6px solid rgba(28, 25, 23, 0.95)",
                    }}
                  />
                </motion.div>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Enhanced content area with refresh state handling */}
          <div className="absolute inset-0 flex items-center justify-center pt-32 pb-16">
            {isLoading ? (
              <motion.div
                className="flex flex-col items-center gap-6"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: skipPortalAnimation ? 0.1 : 1.5 }}
              >
                {/* Loading spinner */}
                <div className="relative">
                  <motion.div
                    className="w-16 h-16 border-4 border-yellow-400/20 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                    style={{ willChange: "transform" }}
                  />
                  <motion.div
                    className="absolute inset-2 border-4 border-transparent border-t-yellow-400 rounded-full"
                    animate={{ rotate: -360 }}
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                    style={{ willChange: "transform" }}
                  />
                  <motion.div
                    className="absolute inset-6 bg-yellow-400/30 rounded-full"
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  />
                </div>

                <motion.p
                  className="text-stone-300 text-sm"
                  animate={{
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                >
                  Summoning your friends from the mystical realm...
                </motion.p>
              </motion.div>
            ) : challengeableFriends.length === 0 ? (
              <motion.div
                className="text-center max-w-md"
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: skipPortalAnimation ? 0.1 : 1.5, type: "spring" }}
              >
                <motion.div
                  className="mb-4"
                  animate={{
                    rotate: embersComplete ? [0, 10, -10, 0] : 0,
                  }}
                  transition={{
                    duration: 4,
                    repeat: embersComplete ? Number.POSITIVE_INFINITY : 0,
                    ease: "easeInOut",
                  }}
                >
                  <Sparkles className="w-16 h-16 text-yellow-400/60 mx-auto" />
                </motion.div>
                <h3 className="text-lg font-medium text-yellow-400 mb-3">
                  No Friends Found in this Realm
                </h3>
                <p className="text-stone-300 text-sm leading-relaxed">
                  {currentUserFid
                    ? allChallengeableFriends.length > 0
                      ? "Your friends are busy in other dimensions. Try again later!"
                      : "None of your Farcaster friends have manifested active characters in this dimension. Encourage them to join the battle!"
                    : "Connect your Farcaster essence to bridge the gap between realms and challenge your friends!"}
                </p>
              </motion.div>
            ) : (
              <div className="relative w-full h-full max-w-6xl mx-auto">
                <AnimatePresence mode="wait">
                  {!isRefreshing && (
                    <motion.div
                      key={`embers-${refreshSeed}`}
                      className="relative w-full h-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ 
                        opacity: 0,
                        scale: 0.9,
                        transition: { duration: 0.3 }
                      }}
                    >
                      {challengeableFriends
                        .slice(0, emberIndex)
                        .map((player, index) => (
                          <EmberCharacter
                            key={`${player.id}-${refreshSeed}-${index}-${emberPositions[index]?.x}-${emberPositions[index]?.y}`} // Ultra-unique key
                            player={player}
                            index={index}
                            total={challengeableFriends.length}
                            onSelect={() => onChallengePlayer(player)}
                            delay={index * 250}
                            position={emberPositions[index]}
                            allPlayers={challengeableFriends}
                          />
                        ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Refresh loading overlay */}
                <AnimatePresence>
                  {isRefreshing && (
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <motion.div
                        className="text-center"
                        initial={{ scale: 0.8, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.8, y: -20 }}
                      >
                        <motion.div
                          className="w-12 h-12 border-3 border-yellow-400/30 border-t-yellow-400 rounded-full mx-auto mb-3"
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                          }}
                        />
                        <motion.p
                          className="text-yellow-300 text-sm"
                          animate={{
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                          }}
                        >
                          Summoning new friends...
                        </motion.p>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Ambient magical energy field - only when embers are complete */}
          <AnimatePresence>
            {embersComplete && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  background: [
                    "radial-gradient(circle at 20% 80%, rgba(255, 215, 0, 0.02) 0%, transparent 50%)",
                    "radial-gradient(circle at 80% 20%, rgba(255, 165, 0, 0.02) 0%, transparent 50%)",
                    "radial-gradient(circle at 20% 80%, rgba(255, 215, 0, 0.02) 0%, transparent 50%)",
                  ],
                }}
                exit={{ opacity: 0 }}
                transition={{
                  opacity: { duration: 1 },
                  background: {
                    duration: 8,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  },
                }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
