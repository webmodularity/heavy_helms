"use client";

import { motion } from "framer-motion";
import { Swords, ArrowLeft, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDuelActions } from "@/stores/duel-store";
import { useGlobalFightModal } from "@/hooks/use-global-fight-modal";

interface FightLoadingScreenProps {
  text?: string;
  onCancel?: () => void;
}

// Battle-themed animated icon
function BattleAnimatedIcon() {
  return (
    <div className="relative">
      {/* Central shield */}
      <motion.div
        className="flex items-center justify-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: 0.6,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
      >
        <Shield className="h-16 w-16 text-yellow-500" />
      </motion.div>

      {/* Crossed swords behind shield */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      >
        <div className="relative">
          <Swords className="h-20 w-20 text-yellow-600/70" />
        </div>
      </motion.div>

      {/* Energy sparks */}
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) rotate(${i * 90}deg) translateY(-40px)`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 0.5,
            ease: "easeInOut",
          }}
        >
          <Zap className="h-4 w-4 text-yellow-400" />
        </motion.div>
      ))}
    </div>
  );
}

export function FightLoadingScreen({
  text = "Preparing for Battle...",
  onCancel,
}: FightLoadingScreenProps) {
  const { clearState } = useDuelActions();
  const { closeFightModal } = useGlobalFightModal();

  const handleCancel = () => {
    clearState(); // Clear duel state
    closeFightModal(); // Close the modal
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[600px] bg-gradient-to-b from-stone-900 via-stone-950 to-black text-center p-8">
      {/* Animated battle icon */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8 flex justify-center"
      >
        <BattleAnimatedIcon />
      </motion.div>

      {/* Main heading */}
      <motion.h1
        className="text-3xl md:text-4xl font-bold text-white mb-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {text}
      </motion.h1>

      {/* Description */}
      <motion.p
        className="text-gray-300 mb-4 text-lg max-w-lg"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Your challenge has been accepted! We're waiting for the blockchain to
        process the duel.
      </motion.p>

      {/* Sub-description */}
      <motion.p
        className="text-gray-400 mb-8 max-w-md"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        This usually takes less than a minute, but may take longer during
        periods of network congestion.
      </motion.p>

      {/* Cancel button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.0 }}
      >
        <Button
          onClick={handleCancel}
          variant="outline"
          className="bg-transparent hover:bg-yellow-500/20 text-yellow-500 border-yellow-500/30 hover:border-yellow-500/50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancel
        </Button>
      </motion.div>

      {/* Pulsing progress indicator */}
      <motion.div
        className="mt-8 flex space-x-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-yellow-500 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}
