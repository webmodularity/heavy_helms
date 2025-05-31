"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import { AlternateDimension } from "./alternate-dimension";
import { EmberChallengeConfirmation } from "./ember-challenge-confirmation";
import { useOwnPlayers } from "@/hooks/use-own-players";
import type { Player } from "@/types/player.types";
import type { Fighter } from "@/types/fighter-types";

export function FriendsChallengePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCharacterId = searchParams.get("characterId");
  
  const { players } = useOwnPlayers();
  const [selectedCharacter, setSelectedCharacter] = useState<Player | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [challengeConfirmation, setChallengeConfirmation] = useState<{
    isOpen: boolean;
    opponent: Fighter | null;
  }>({ isOpen: false, opponent: null });

  // Find selected character
  useEffect(() => {
    if (selectedCharacterId && players) {
      const character = players.find(p => p.id === selectedCharacterId);
      if (character) {
        setSelectedCharacter(character);
        setTimeout(() => setIsReady(true), 50);
      } else {
        router.push('/');
      }
    } else {
      router.push('/');
    }
  }, [selectedCharacterId, players, router]);

  const handleBack = () => {
    router.push(`/?selectedCharacter=${selectedCharacterId}`);
  };

  const handleChallengePlayer = (opponent: Fighter) => {
    setChallengeConfirmation({ isOpen: true, opponent });
  };

  const handleCloseChallengeConfirmation = () => {
    setChallengeConfirmation({ isOpen: false, opponent: null });
  };

  const handleChallengeSuccess = () => {
    setChallengeConfirmation({ isOpen: false, opponent: null });
    router.push(`/?selectedCharacter=${selectedCharacterId}&challengeSent=true`);
  };

  // Clean loading states without background interference
  if (!selectedCharacter) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-yellow-400/40 bg-yellow-400/5"
            animate={{
              rotate: 360,
              borderColor: ["rgba(255, 215, 0, 0.4)", "rgba(245, 158, 11, 0.6)", "rgba(255, 215, 0, 0.4)"],
            }}
            transition={{
              rotate: { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
              borderColor: { duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
            }}
          >
            <motion.div
              className="w-full h-full flex items-center justify-center"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              <Sparkles className="w-6 h-6 text-yellow-400/80" />
            </motion.div>
          </motion.div>
          <p className="text-stone-300 text-sm">Preparing the Inner Circle...</p>
        </motion.div>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="w-20 h-20 mx-auto mb-4 rounded-full border border-yellow-400/30 bg-yellow-400/5"
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
          <p className="text-yellow-300/80 text-sm">Portal stabilizing...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Only the back arrow button - no competing backgrounds */}
      <motion.button
        onClick={handleBack}
        className="fixed top-6 left-6 z-[60] w-12 h-12 rounded-full 
                   bg-gradient-to-br from-stone-900/90 to-stone-800/90 
                   border border-yellow-400/40 backdrop-blur-sm
                   flex items-center justify-center text-yellow-300
                   hover:bg-gradient-to-br hover:from-stone-800/90 hover:to-stone-700/90 
                   hover:border-yellow-300/60 transition-all duration-300
                   shadow-lg hover:shadow-yellow-400/20"
        initial={{ opacity: 0, scale: 0, x: -20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <ArrowLeft className="w-5 h-5" />
      </motion.button>

      {/* Pure Inner Circle dimension - no background interference */}
      <AlternateDimension
        isOpen={true}
        onClose={handleBack}
        selectedCharacter={selectedCharacter}
        onChallengePlayer={handleChallengePlayer}
        skipPortalAnimation={true}
      />

      {/* Challenge Confirmation Modal */}
      {challengeConfirmation.opponent && (
        <EmberChallengeConfirmation
          isOpen={challengeConfirmation.isOpen}
          onClose={handleCloseChallengeConfirmation}
          challenger={selectedCharacter}
          opponent={challengeConfirmation.opponent}
          onSuccess={handleChallengeSuccess}
        />
      )}
    </div>
  );
} 