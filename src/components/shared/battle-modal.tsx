"use client";

import { motion, AnimatePresence } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";

export interface BattleTheme {
  primary: string;
  secondary: string;
  gradient: string;
  shadow: string;
  border: string;
  particles: string[];
}

interface BattleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  theme: BattleTheme;
}

interface ParticleProps {
  color: string;
  delay: number;
  duration: number;
  startX: number;
  startY: number;
}

function AnimatedParticle({ color, delay, duration, startX, startY }: ParticleProps) {
  return (
    <motion.div
      className="absolute w-1 h-1 rounded-full pointer-events-none"
      style={{ backgroundColor: color }}
      initial={{
        opacity: 0,
        scale: 0,
        x: startX,
        y: startY,
      }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0, 1, 0],
        x: startX + (Math.random() - 0.5) * 100,
        y: startY + (Math.random() - 0.5) * 100,
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeOut",
      }}
    />
  );
}

export function BattleModal({
  isOpen,
  onClose,
  title,
  children,
  theme,
}: BattleModalProps) {
  const [particles, setParticles] = useState<ParticleProps[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Generate particles for animation
      const newParticles: ParticleProps[] = [];
      for (let i = 0; i < 12; i++) {
        newParticles.push({
          color: theme.particles[i % theme.particles.length],
          delay: Math.random() * 2,
          duration: 3 + Math.random() * 2,
          startX: Math.random() * 400 - 200,
          startY: Math.random() * 300 - 150,
        });
      }
      setParticles(newParticles);
    }
  }, [isOpen, theme.particles]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[201] w-[90vw] max-w-md max-h-[85vh] overflow-auto">
          <Dialog.Title className="sr-only">{title}</Dialog.Title>
          <Dialog.Description className="sr-only">
            {title} battle modal
          </Dialog.Description>

          <motion.div
            className="relative bg-gradient-to-b from-stone-900/95 to-stone-950/95 
                       border-2 rounded-lg backdrop-blur-sm p-2 overflow-hidden"
            style={{
              borderColor: theme.border + "60",
              boxShadow: theme.shadow,
            }}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Animated Background Gradient Overlay */}
            <motion.div
              className="absolute inset-0 rounded-lg pointer-events-none"
              style={{
                background: theme.gradient,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 0.5, 0.3] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Border Glow Effect */}
            <motion.div
              className="absolute inset-0 rounded-lg pointer-events-none"
              style={{
                background: `linear-gradient(45deg, ${theme.primary}, ${theme.secondary}, ${theme.primary})`,
                mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                maskComposite: "xor",
                padding: "2px",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Floating Particles */}
            <AnimatePresence>
              {isOpen && particles.map((particle, index) => (
                <AnimatedParticle
                  key={`particle-${index}`}
                  {...particle}
                />
              ))}
            </AnimatePresence>

            {/* Content Container */}
            <div className="relative z-10">
              <div className="mb-4">
                <motion.h2
                  className="text-lg font-bold text-center"
                  style={{ color: theme.border }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                >
                  {title}
                </motion.h2>
                
                {/* Decorative underline */}
                <motion.div
                  className="h-0.5 mx-auto mt-2 rounded-full"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${theme.border}, transparent)`,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: "60%" }}
                  transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
                />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                {children}
              </motion.div>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// Export the theme constants for reuse
export const BATTLE_THEMES = {
  practice: {
    primary: "rgba(34, 197, 94, 0.4)",
    secondary: "rgba(22, 163, 74, 0.3)",
    gradient:
      "radial-gradient(circle, rgba(34, 197, 94, 0.4) 0%, rgba(22, 163, 74, 0.3) 30%, rgba(21, 128, 61, 0.2) 60%, transparent 80%)",
    shadow: "0 0 20px rgba(34, 197, 94, 0.3)",
    border: "rgb(34, 197, 94)",
    particles: ["#22C55E", "#16A34A"],
  },
  gauntlet: {
    primary: "rgba(147, 51, 234, 0.4)",
    secondary: "rgba(124, 58, 237, 0.3)",
    gradient:
      "radial-gradient(circle, rgba(147, 51, 234, 0.4) 0%, rgba(124, 58, 237, 0.3) 30%, rgba(109, 40, 217, 0.2) 60%, transparent 80%)",
    shadow: "0 0 20px rgba(147, 51, 234, 0.3)",
    border: "rgb(147, 51, 234)",
    particles: ["#9333EA", "#7C3AED"],
  },
  duel: {
    primary: "rgba(239, 68, 68, 0.4)",
    secondary: "rgba(220, 38, 38, 0.3)",
    gradient:
      "radial-gradient(circle, rgba(239, 68, 68, 0.4) 0%, rgba(220, 38, 38, 0.3) 30%, rgba(185, 28, 28, 0.2) 60%, transparent 80%)",
    shadow: "0 0 20px rgba(239, 68, 68, 0.3)",
    border: "rgb(239, 68, 68)",
    particles: ["#EF4444", "#DC2626"],
  },
} as const; 