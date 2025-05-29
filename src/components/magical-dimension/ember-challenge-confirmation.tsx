"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import { Loader2, Sparkles, X } from "lucide-react";
import type { Fighter } from "@/types/fighter-types";
import type { Player } from "@/types/player.types";
import { useCreateChallenge } from "@/hooks/use-create-challenge";
import {
  getWeaponDisplayName,
  getArmorDisplayName,
} from "@/lib/equipment-utils";

interface EmberChallengeConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  challenger: Player;
  opponent: Fighter;
  onSuccess: () => void;
}

const DEFAULT_WAGER = "0.001";

export function EmberChallengeConfirmation({
  isOpen,
  onClose,
  challenger,
  opponent,
  onSuccess,
}: EmberChallengeConfirmationProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const { createChallenge, isCreatingChallenge, error } = useCreateChallenge();

  const handleConfirm = async () => {
    setIsConfirming(true);

    try {
      await createChallenge({
        character: challenger,
        defenderId: Number(opponent.id),
        wagerAmount: DEFAULT_WAGER,
      });

      if (!error) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error("Error creating magical challenge:", err);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-60 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Confirmation modal */}
          <motion.div
            className="relative bg-gradient-to-br from-stone-900/95 to-stone-800/95 
                       border border-yellow-400/30 rounded-xl p-6 max-w-md mx-4
                       backdrop-blur-sm shadow-2xl"
            initial={{ opacity: 0, scale: 0.9, rotateX: -15 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.9, rotateX: 15 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full 
                         bg-stone-800/80 border border-yellow-400/20 
                         flex items-center justify-center text-yellow-300
                         hover:bg-stone-700/80 hover:border-yellow-300/40 transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Magical header */}
            <div className="text-center mb-6">
              <motion.div
                className="inline-flex items-center gap-2 text-yellow-400 mb-2"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                <Sparkles className="w-5 h-5" />
                <h2 className="text-lg font-bold">Magical Challenge</h2>
                <Sparkles className="w-5 h-5" />
              </motion.div>
              <p className="text-stone-300 text-sm">
                Send a challenge through the mystical realm
              </p>
            </div>

            {/* Character comparison */}
            <div className="flex items-center justify-center gap-6 mb-6">
              {/* Challenger */}
              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-2">
                  <div className="w-full h-full rounded-full overflow-hidden border-2 border-blue-400/50 bg-blue-500/10">
                    <Image
                      src={challenger.currentSkin.imageURL}
                      alt={challenger.name.fullName || "Your Character"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div
                    className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full 
                                  flex items-center justify-center"
                  >
                    <span className="text-white text-xs font-bold">Y</span>
                  </div>
                </div>
                <p className="text-blue-400 text-xs font-medium">You</p>
                <p className="text-stone-400 text-[10px]">
                  {challenger.name.fullName}
                </p>
              </div>

              {/* VS */}
              <motion.div
                className="text-yellow-400 font-bold text-xl"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 1,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                VS
              </motion.div>

              {/* Opponent */}
              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-2">
                  <div className="w-full h-full rounded-full overflow-hidden border-2 border-orange-400/50 bg-orange-500/10">
                    <Image
                      src={opponent.currentSkin.imageURL}
                      alt={opponent.name.fullName || ""}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div
                    className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full 
                                  flex items-center justify-center"
                  >
                    <span className="text-white text-xs font-bold">F</span>
                  </div>
                </div>
                <p className="text-orange-400 text-xs font-medium">Friend</p>
                <p className="text-stone-400 text-[10px]">
                  {opponent.name.fullName}
                </p>
              </div>
            </div>

            {/* Challenge details */}
            <div className="bg-stone-800/50 rounded-lg p-4 mb-6 border border-yellow-400/10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-stone-300 text-sm">Wager Amount:</span>
                <span className="text-yellow-400 font-medium">
                  {DEFAULT_WAGER} ETH
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-stone-300 text-sm">Opponent Record:</span>
                <span className="text-stone-400 text-sm">
                  {opponent.record.wins}W / {opponent.record.losses}L
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-300 text-sm">Equipment:</span>
                <span className="text-stone-400 text-sm">
                  {getWeaponDisplayName(opponent.currentSkin.weapon)} •{" "}
                  {getArmorDisplayName(opponent.currentSkin.armor)}
                </span>
              </div>
            </div>

            {/* Error display */}
            {error && (
              <motion.div
                className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error instanceof Error ? error.message : "An error occurred"}
              </motion.div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2 px-4 border border-stone-600 rounded-lg 
                           text-stone-300 hover:bg-stone-800/50 transition-all text-sm"
                disabled={isCreatingChallenge || isConfirming}
              >
                Cancel
              </button>
              <motion.button
                onClick={handleConfirm}
                disabled={isCreatingChallenge || isConfirming}
                className="flex-1 py-2 px-4 bg-gradient-to-r from-yellow-600 to-orange-600 
                           rounded-lg text-white font-medium hover:from-yellow-500 
                           hover:to-orange-500 transition-all text-sm disabled:opacity-50
                           disabled:cursor-not-allowed flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isCreatingChallenge || isConfirming ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Send Challenge
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
