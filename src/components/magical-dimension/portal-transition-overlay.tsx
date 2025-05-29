"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface PortalTransitionOverlayProps {
  isTransitioning: boolean;
  onTransitionComplete?: () => void;
}

export function PortalTransitionOverlay({ 
  isTransitioning, 
  onTransitionComplete 
}: PortalTransitionOverlayProps) {
  const [phase, setPhase] = useState<'expanding' | 'portal' | 'complete'>('expanding');

  useEffect(() => {
    if (isTransitioning) {
      setPhase('expanding');
      
      // Transition to portal phase
      const timer1 = setTimeout(() => {
        setPhase('portal');
      }, 800);

      // Complete transition
      const timer2 = setTimeout(() => {
        setPhase('complete');
        onTransitionComplete?.();
      }, 2000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [isTransitioning, onTransitionComplete]);

  return (
    <AnimatePresence>
      {isTransitioning && (
        <motion.div
          className="fixed inset-0 z-[200] pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Expanding portal circle from button position */}
          <motion.div
            className="absolute rounded-full"
            style={{
              bottom: '6rem', // 24 + 4rem for button position
              right: '2rem', // 8 * 0.25rem
              width: '4rem', // Match button size
              height: '4rem',
              background: "radial-gradient(circle, rgba(255, 215, 0, 0.8) 0%, rgba(255, 165, 0, 0.6) 40%, rgba(139, 69, 19, 0.4) 100%)",
            }}
            animate={{
              scale: phase === 'expanding' ? [1, 50] : 50,
              background: phase === 'portal' 
                ? "radial-gradient(circle, rgba(139, 69, 19, 0.8) 0%, rgba(0, 0, 0, 0.95) 100%)"
                : "radial-gradient(circle, rgba(255, 215, 0, 0.8) 0%, rgba(255, 165, 0, 0.6) 40%, rgba(139, 69, 19, 0.4) 100%)",
            }}
            transition={{
              scale: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
              background: { duration: 0.6, delay: 0.2 }
            }}
          />

          {/* Portal opening energy beams */}
          <AnimatePresence>
            {phase === 'expanding' && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-20 bg-gradient-to-t from-yellow-400 to-orange-500"
                    style={{
                      bottom: '8rem',
                      right: '4rem',
                      transformOrigin: "bottom",
                      transform: `rotate(${i * 60}deg)`,
                    }}
                    animate={{
                      scaleY: [0, 1, 0],
                      opacity: [0, 1, 0],
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

          {/* Portal swirl effect */}
          <AnimatePresence>
            {phase === 'portal' && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="absolute inset-0"
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 1.5,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  style={{
                    background: "conic-gradient(from 0deg, rgba(139, 69, 19, 0.8) 0%, rgba(101, 37, 7, 0.9) 50%, rgba(139, 69, 19, 0.8) 100%)",
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 