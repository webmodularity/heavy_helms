"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { X, Loader2 } from "lucide-react";
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
}

export function AlternateDimension({
  isOpen,
  onClose,
  selectedCharacter,
  onChallengePlayer,
}: AlternateDimensionProps) {
  const [showEmbers, setShowEmbers] = useState(false);
  const [emberIndex, setEmberIndex] = useState(0);

  const { currentUserFid, isLoadingFollowing, isFollowing } =
    useFollowingData();
  const { players: allPlayers, isLoading: isLoadingPlayers } =
    useActivePlayers();
  const { data: addressToUserMap, isLoading: isAddressMapLoading } =
    useSupabaseAddressToUserMap();

  // Get challengeable following players
  const challengeableFriends = useMemo(() => {
    if (
      isLoadingPlayers ||
      isLoadingFollowing ||
      isAddressMapLoading ||
      !allPlayers ||
      !addressToUserMap
    ) {
      return [];
    }

    return allPlayers.filter((player) => {
      // Don't include own character
      if (player.id === selectedCharacter.id) return false;

      // Check if this player is followed
      const playerAddress = player.owner?.address;
      if (!playerAddress) return false;

      const user = addressToUserMap[getAddress(playerAddress)];
      if (!user?.farcaster_fid) return false;

      return isFollowing(user.farcaster_fid);
    });
  }, [
    allPlayers,
    selectedCharacter.id,
    isLoadingPlayers,
    isLoadingFollowing,
    isAddressMapLoading,
    addressToUserMap,
    isFollowing,
  ]);

  // Portal opening animation sequence
  useEffect(() => {
    if (isOpen) {
      const timer1 = setTimeout(() => setShowEmbers(true), 1000);
      return () => clearTimeout(timer1);
    } else {
      setShowEmbers(false);
      setEmberIndex(0);
    }
  }, [isOpen]);

  // Stagger ember appearances
  useEffect(() => {
    if (showEmbers && emberIndex < allPlayers.length) {
      const timer = setTimeout(() => {
        setEmberIndex((prev) => prev + 1);
      }, 300); // Stagger every 300ms
      return () => clearTimeout(timer);
    }
  }, [showEmbers, emberIndex, allPlayers.length]);

  const isLoading =
    isLoadingFollowing || isLoadingPlayers || isAddressMapLoading;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Portal entry effect */}
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            exit={{ scale: 0, rotate: -360 }}
            transition={{
              duration: 1.2,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            style={{
              background:
                "radial-gradient(circle at center, rgba(0, 0, 0, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)",
            }}
          />

          {/* Mystical background particles */}
          <div className="absolute inset-0">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-yellow-400/30 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  y: [0, -50],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: Math.random() * 3,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>

          {/* Close button */}
          <motion.button
            onClick={onClose}
            className="absolute top-8 right-8 z-60 w-12 h-12 rounded-full 
                       bg-stone-900/80 border border-yellow-400/30 
                       flex items-center justify-center text-yellow-300
                       hover:bg-stone-800/80 hover:border-yellow-300/50 transition-all"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <X className="w-6 h-6" />
          </motion.button>

          {/* Title */}
          <motion.div
            className="absolute top-12 left-1/2 transform -translate-x-1/2 text-center"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <h1 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-2">
              Dimension of Following
            </h1>
            <p className="text-stone-300 text-sm">
              Challenge your Farcaster friends to epic duels
            </p>
          </motion.div>

          {/* Content area */}
          <div className="absolute inset-0 flex items-center justify-center pt-32 pb-16">
            {isLoading ? (
              <motion.div
                className="flex flex-col items-center gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
                <p className="text-stone-300 text-sm">
                  Summoning your friends...
                </p>
              </motion.div>
            ) : allPlayers.length === 0 ? (
              <motion.div
                className="text-center max-w-md"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 }}
              >
                <h3 className="text-lg font-medium text-yellow-400 mb-2">
                  No Friends Found
                </h3>
                <p className="text-stone-300 text-sm">
                  {currentUserFid
                    ? "None of your Farcaster friends have active characters ready for battle."
                    : "Connect your Farcaster account to challenge your friends!"}
                </p>
              </motion.div>
            ) : (
              <div className="relative w-full h-full max-w-6xl mx-auto">
                {allPlayers
                  .slice(0, emberIndex)
                  .map((player, index) => (
                    <EmberCharacter
                      key={player.id}
                      player={player}
                      index={index}
                      total={challengeableFriends.length}
                      onSelect={() => onChallengePlayer(player)}
                      delay={index * 300}
                    />
                  ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
