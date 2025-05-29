"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Loader2, Sparkles, X, CheckCircle, AlertCircle, Zap, Star } from "lucide-react";
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

type ConfirmationState = "idle" | "confirming" | "success" | "error";

export function EmberChallengeConfirmation({
  isOpen,
  onClose,
  challenger,
  opponent,
  onSuccess,
}: EmberChallengeConfirmationProps) {
  const [confirmationState, setConfirmationState] = useState<ConfirmationState>("idle");
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const { createChallenge, isCreatingChallenge, error } = useCreateChallenge();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setConfirmationState("idle");
      setShowSuccessAnimation(false);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    setConfirmationState("confirming");
    
    try {
      await createChallenge({
        character: challenger,
        defenderId: Number(opponent.id),
        wagerAmount: DEFAULT_WAGER,
      });

      if (!error) {
        setConfirmationState("success");
        setShowSuccessAnimation(true);
        
        // Auto-close after success animation
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2500);
      } else {
        setConfirmationState("error");
      }
    } catch (err) {
      console.error("Error creating magical challenge:", err);
      setConfirmationState("error");
    }
  };

  const handleClose = () => {
    if (confirmationState === "confirming") return; // Prevent closing during challenge creation
    onClose();
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
          {/* Enhanced backdrop with magical effects */}
          <motion.div
            className="absolute inset-0 backdrop-blur-sm"
            style={{
              background: confirmationState === "success" 
                ? "radial-gradient(circle at center, rgba(34, 197, 94, 0.2) 0%, rgba(0, 0, 0, 0.8) 100%)"
                : confirmationState === "error"
                ? "radial-gradient(circle at center, rgba(239, 68, 68, 0.2) 0%, rgba(0, 0, 0, 0.8) 100%)"
                : "radial-gradient(circle at center, rgba(255, 165, 0, 0.1) 0%, rgba(0, 0, 0, 0.8) 100%)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Success celebration effects */}
          <AnimatePresence>
            {showSuccessAnimation && (
              <>
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={`celebration-${i}`}
                    className="absolute w-2 h-2 bg-green-400 rounded-full"
                    style={{
                      left: "50%",
                      top: "50%",
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      x: [0, Math.cos(i * 30 * Math.PI / 180) * 200],
                      y: [0, Math.sin(i * 30 * Math.PI / 180) * 200],
                    }}
                    transition={{
                      duration: 1.5,
                      delay: i * 0.1,
                      ease: "easeOut",
                    }}
                  />
                ))}
                
                {/* Magical success sparkles */}
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={`sparkle-${i}`}
                    className="absolute"
                    style={{
                      left: `${30 + Math.random() * 40}%`,
                      top: `${20 + Math.random() * 60}%`,
                    }}
                    initial={{ opacity: 0, scale: 0, rotate: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 2,
                      delay: Math.random() * 1,
                      ease: "easeOut",
                    }}
                  >
                    <Star className="w-4 h-4 text-green-400" />
                  </motion.div>
                ))}
              </>
            )}
          </AnimatePresence>

          {/* Enhanced confirmation modal */}
          <motion.div
            className="relative max-w-md mx-4 backdrop-blur-sm shadow-2xl"
            style={{
              background: confirmationState === "success"
                ? "linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(21, 128, 61, 0.2) 100%)"
                : confirmationState === "error"
                ? "linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(153, 27, 27, 0.2) 100%)"
                : "linear-gradient(135deg, rgba(255, 165, 0, 0.1) 0%, rgba(120, 53, 15, 0.2) 100%)",
            }}
            initial={{ opacity: 0, scale: 0.8, rotateX: -20, y: 50 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              rotateX: 0, 
              y: 0,
            }}
            exit={{ opacity: 0, scale: 0.8, rotateX: 20, y: -50 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.6
            }}
          >
            <div className="bg-gradient-to-br from-stone-900/95 to-stone-800/95 
                           border rounded-xl p-6"
                 style={{
                   borderColor: confirmationState === "success" 
                     ? "rgba(34, 197, 94, 0.5)"
                     : confirmationState === "error"
                     ? "rgba(239, 68, 68, 0.5)"
                     : "rgba(251, 146, 60, 0.4)",
                 }}>
              
              {/* Enhanced close button */}
              {confirmationState !== "confirming" && (
                <motion.button
                  onClick={handleClose}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full 
                             bg-stone-800/80 border border-yellow-400/20 
                             flex items-center justify-center text-yellow-300
                             hover:bg-stone-700/80 hover:border-yellow-300/40 transition-all"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-4 h-4" />
                </motion.button>
              )}

              {/* Dynamic header based on state */}
              <motion.div
                className="text-center mb-6"
                animate={{
                  scale: confirmationState === "success" ? [1, 1.05, 1] : 1,
                }}
                transition={{
                  duration: 0.5,
                  repeat: confirmationState === "success" ? 3 : 0,
                }}
              >
                <motion.div
                  className="inline-flex items-center gap-2 mb-2"
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                >
                  {confirmationState === "success" ? (
                    <>
                      <CheckCircle className="w-6 h-6 text-green-400" />
                      <h2 className="text-lg font-bold text-green-400">Challenge Sent!</h2>
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    </>
                  ) : confirmationState === "error" ? (
                    <>
                      <AlertCircle className="w-6 h-6 text-red-400" />
                      <h2 className="text-lg font-bold text-red-400">Challenge Failed</h2>
                      <AlertCircle className="w-6 h-6 text-red-400" />
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-yellow-400" />
                      <h2 className="text-lg font-bold text-yellow-400">Magical Challenge</h2>
                      <Sparkles className="w-5 h-5 text-yellow-400" />
                    </>
                  )}
                </motion.div>
                
                <motion.p 
                  className="text-sm"
                  style={{
                    color: confirmationState === "success" 
                      ? "rgb(156, 163, 175)"
                      : confirmationState === "error"
                      ? "rgb(156, 163, 175)"
                      : "rgb(214, 211, 209)",
                  }}
                  animate={{
                    opacity: [0.8, 1, 0.8],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                >
                  {confirmationState === "success" 
                    ? "Your challenge has been sent through the mystical realm!"
                    : confirmationState === "error"
                    ? "The magical energies failed to deliver your challenge"
                    : "Send a challenge through the mystical realm"
                  }
                </motion.p>
              </motion.div>

              {/* Character comparison - hide during success state */}
              <AnimatePresence>
                {confirmationState !== "success" && (
                  <motion.div
                    className="flex items-center justify-center gap-6 mb-6"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Challenger */}
                    <motion.div 
                      className="text-center"
                      animate={{
                        scale: confirmationState === "confirming" ? [1, 1.05, 1] : 1,
                      }}
                      transition={{
                        duration: 1,
                        repeat: confirmationState === "confirming" ? Number.POSITIVE_INFINITY : 0,
                      }}
                    >
                      <div className="relative w-16 h-16 mx-auto mb-2">
                        <div className="w-full h-full rounded-full overflow-hidden border-2 border-blue-400/50 bg-blue-500/10">
                          <Image
                            src={challenger.currentSkin.imageURL}
                            alt={challenger.name.fullName || "Your Character"}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <motion.div 
                          className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full 
                                     flex items-center justify-center"
                          animate={{
                            boxShadow: confirmationState === "confirming" 
                              ? ["0 0 5px rgba(59, 130, 246, 0.5)", "0 0 15px rgba(59, 130, 246, 0.8)", "0 0 5px rgba(59, 130, 246, 0.5)"]
                              : "0 0 5px rgba(59, 130, 246, 0.5)",
                          }}
                          transition={{
                            duration: 1,
                            repeat: confirmationState === "confirming" ? Number.POSITIVE_INFINITY : 0,
                          }}
                        >
                          <span className="text-white text-xs font-bold">Y</span>
                        </motion.div>
                      </div>
                      <p className="text-blue-400 text-xs font-medium">You</p>
                      <p className="text-stone-400 text-[10px]">{challenger.name.fullName}</p>
                    </motion.div>

                    {/* Enhanced VS with magical effects */}
                    <motion.div
                      className="text-yellow-400 font-bold text-xl relative"
                      animate={{
                        scale: confirmationState === "confirming" ? [1, 1.3, 1] : [1, 1.2, 1],
                        rotate: confirmationState === "confirming" ? [0, 10, -10, 0] : [0, 5, -5, 0],
                      }}
                      transition={{
                        duration: confirmationState === "confirming" ? 0.5 : 1,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                      }}
                    >
                      VS
                      
                      {/* Magical energy between characters */}
                      {confirmationState === "confirming" && (
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <motion.div
                            className="w-8 h-8"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                          >
                            <Zap className="w-8 h-8 text-yellow-300" />
                          </motion.div>
                        </motion.div>
                      )}
                    </motion.div>

                    {/* Opponent */}
                    <motion.div 
                      className="text-center"
                      animate={{
                        scale: confirmationState === "confirming" ? [1, 1.05, 1] : 1,
                      }}
                      transition={{
                        duration: 1,
                        repeat: confirmationState === "confirming" ? Number.POSITIVE_INFINITY : 0,
                        delay: 0.5,
                      }}
                    >
                      <div className="relative w-16 h-16 mx-auto mb-2">
                        <div className="w-full h-full rounded-full overflow-hidden border-2 border-orange-400/50 bg-orange-500/10">
                          <Image
                            src={opponent.currentSkin.imageURL}
                            alt={opponent.name.fullName || ""}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <motion.div 
                          className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full 
                                     flex items-center justify-center"
                          animate={{
                            boxShadow: confirmationState === "confirming" 
                              ? ["0 0 5px rgba(249, 115, 22, 0.5)", "0 0 15px rgba(249, 115, 22, 0.8)", "0 0 5px rgba(249, 115, 22, 0.5)"]
                              : "0 0 5px rgba(249, 115, 22, 0.5)",
                          }}
                          transition={{
                            duration: 1,
                            repeat: confirmationState === "confirming" ? Number.POSITIVE_INFINITY : 0,
                            delay: 0.5,
                          }}
                        >
                          <span className="text-white text-xs font-bold">F</span>
                        </motion.div>
                      </div>
                      <p className="text-orange-400 text-xs font-medium">Friend</p>
                      <p className="text-stone-400 text-[10px]">{opponent.name.fullName}</p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Enhanced challenge details */}
              <AnimatePresence>
                {confirmationState === "idle" && (
                  <motion.div
                    className="bg-stone-800/50 rounded-lg p-4 mb-6 border border-yellow-400/10"
                    initial={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-stone-300 text-sm">Wager Amount:</span>
                      <motion.span 
                        className="text-yellow-400 font-medium"
                        animate={{
                          textShadow: [
                            "0 0 5px rgba(252, 211, 77, 0.5)",
                            "0 0 10px rgba(251, 146, 60, 0.8)",
                            "0 0 5px rgba(252, 211, 77, 0.5)",
                          ],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeInOut",
                        }}
                      >
                        {DEFAULT_WAGER} ETH
                      </motion.span>
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
                        {getWeaponDisplayName(opponent.currentSkin.weapon)} • {getArmorDisplayName(opponent.currentSkin.armor)}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Enhanced error display */}
              <AnimatePresence>
                {(error || confirmationState === "error") && (
                  <motion.div
                    className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>
                        {error instanceof Error ? error.message : "The magical energies are unstable. Please try again."}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Success message */}
              <AnimatePresence>
                {confirmationState === "success" && (
                  <motion.div
                    className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div
                      className="flex items-center justify-center gap-2 mb-2"
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 0.6,
                        repeat: 2,
                        ease: "easeInOut",
                      }}
                    >
                      <CheckCircle className="w-6 h-6" />
                      <span className="font-medium">Challenge Successfully Sent!</span>
                      <CheckCircle className="w-6 h-6" />
                    </motion.div>
                    <p className="text-sm text-green-300">
                      Your friend will be notified of your challenge through the mystical realm.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Enhanced action buttons */}
              <AnimatePresence>
                {confirmationState !== "success" && (
                  <motion.div
                    className="flex gap-3"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.button
                      onClick={handleClose}
                      className="flex-1 py-2 px-4 border border-stone-600 rounded-lg 
                                 text-stone-300 hover:bg-stone-800/50 transition-all text-sm
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={confirmationState === "confirming"}
                      whileHover={confirmationState !== "confirming" ? { scale: 1.02 } : {}}
                      whileTap={confirmationState !== "confirming" ? { scale: 0.98 } : {}}
                    >
                      Cancel
                    </motion.button>
                    
                    <motion.button
                      onClick={handleConfirm}
                      disabled={confirmationState === "confirming" || confirmationState === "error"}
                      className="flex-1 py-2 px-4 rounded-lg text-white font-medium 
                                 transition-all text-sm disabled:opacity-50
                                 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      style={{
                        background: confirmationState === "error"
                          ? "linear-gradient(to right, rgb(153, 27, 27), rgb(127, 29, 29))"
                          : "linear-gradient(to right, rgb(217, 119, 6), rgb(194, 65, 12))",
                      }}
                      whileHover={
                        confirmationState === "idle" 
                          ? { 
                              scale: 1.02,
                              background: "linear-gradient(to right, rgb(245, 158, 11), rgb(217, 119, 6))",
                            } 
                          : {}
                      }
                      whileTap={confirmationState === "idle" ? { scale: 0.98 } : {}}
                      animate={{
                        boxShadow: confirmationState === "confirming"
                          ? [
                              "0 0 10px rgba(251, 146, 60, 0.5)",
                              "0 0 20px rgba(251, 146, 60, 0.8)",
                              "0 0 10px rgba(251, 146, 60, 0.5)",
                            ]
                          : "0 0 10px rgba(251, 146, 60, 0.3)",
                      }}
                      transition={{
                        boxShadow: {
                          duration: 1,
                          repeat: confirmationState === "confirming" ? Number.POSITIVE_INFINITY : 0,
                        },
                      }}
                    >
                      {confirmationState === "confirming" ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                          >
                            <Loader2 className="w-4 h-4" />
                          </motion.div>
                          Channeling Magic...
                        </>
                      ) : confirmationState === "error" ? (
                        <>
                          <AlertCircle className="w-4 h-4" />
                          Retry Challenge
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Send Challenge
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
