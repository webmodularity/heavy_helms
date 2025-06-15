"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface SelectionAnimationEffectsProps {
  selectedCharacterId: string | number | null;
  previousSelectedId: string | number | null;
  containerRef: React.RefObject<HTMLDivElement>;
}

export function SelectionAnimationEffects({
  selectedCharacterId,
  previousSelectedId,
  containerRef,
}: SelectionAnimationEffectsProps) {
  const [showTransition, setShowTransition] = useState(false);
  const [rippleKey, setRippleKey] = useState(0);

  useEffect(() => {
    if (selectedCharacterId && previousSelectedId && selectedCharacterId !== previousSelectedId) {
      setShowTransition(true);
      setRippleKey(prev => prev + 1);
      
      const timer = setTimeout(() => {
        setShowTransition(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [selectedCharacterId, previousSelectedId]);

  const getCardPosition = (characterId: string | number) => {
    if (!containerRef.current) return null;
    
    const cardElement = containerRef.current.querySelector(`[data-character-id="${characterId}"]`);
    if (!cardElement) return null;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const cardRect = cardElement.getBoundingClientRect();
    
    return {
      x: cardRect.left - containerRect.left + cardRect.width / 2,
      y: cardRect.top - containerRect.top + cardRect.height / 2,
    };
  };

  const previousPos = previousSelectedId ? getCardPosition(previousSelectedId) : null;
  const currentPos = selectedCharacterId ? getCardPosition(selectedCharacterId) : null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {/* Glow Trail Effect */}
        {showTransition && previousPos && currentPos && (
          <motion.div
            key={`glow-trail-${rippleKey}`}
            initial={{ 
              opacity: 0,
              scale: 0.5,
              x: previousPos.x,
              y: previousPos.y,
            }}
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0.5, 1.5, 2],
              x: currentPos.x,
              y: currentPos.y,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute w-4 h-4 bg-yellow-400 rounded-full blur-sm -translate-x-2 -translate-y-2"
          />
        )}

        {/* Energy Beam Effect */}
        {showTransition && previousPos && currentPos && (
          <motion.div
            key={`beam-${rippleKey}`}
            initial={{ 
              opacity: 0,
              pathLength: 0,
            }}
            animate={{ 
              opacity: [0, 0.8, 0],
              pathLength: [0, 1, 1],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <svg className="w-full h-full">
              <defs>
                <linearGradient id="beamGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#facc15" stopOpacity="0" />
                  <stop offset="50%" stopColor="#facc15" stopOpacity="1" />
                  <stop offset="100%" stopColor="#facc15" stopOpacity="0" />
                </linearGradient>
              </defs>
              <line
                x1={previousPos.x}
                y1={previousPos.y}
                x2={currentPos.x}
                y2={currentPos.y}
                stroke="url(#beamGradient)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </motion.div>
        )}

        {/* Ripple Effect on New Selection */}
        {showTransition && currentPos && (
          <motion.div
            key={`ripple-${rippleKey}`}
            initial={{ 
              opacity: 0,
              scale: 0,
              x: currentPos.x,
              y: currentPos.y,
            }}
            animate={{ 
              opacity: [0, 0.6, 0],
              scale: [0, 3, 4],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute w-20 h-20 border-2 border-yellow-400 rounded-full -translate-x-10 -translate-y-10"
          />
        )}

        {/* Particle Burst Effect */}
        {showTransition && currentPos && (
          <div key={`particles-${rippleKey}`}>
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={`particle-${rippleKey}-${i}`}
                initial={{ 
                  opacity: 0,
                  scale: 0,
                  x: currentPos.x,
                  y: currentPos.y,
                }}
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: currentPos.x + Math.cos((i * 45) * Math.PI / 180) * 60,
                  y: currentPos.y + Math.sin((i * 45) * Math.PI / 180) * 60,
                }}
                exit={{ opacity: 0 }}
                transition={{ 
                  duration: 0.6,
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full blur-sm -translate-x-1 -translate-y-1"
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
} 