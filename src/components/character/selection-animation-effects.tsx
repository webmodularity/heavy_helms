"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface SelectionAnimationEffectsProps {
  selectedCharacterId: string | number | null;
  previousSelectedId: string | number | null;
  hoveredCharacterId: string | number | null;
  containerRef: React.RefObject<HTMLDivElement>;
}

export function SelectionAnimationEffects({
  selectedCharacterId,
  previousSelectedId,
  hoveredCharacterId,
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
  const hoveredPos = hoveredCharacterId ? getCardPosition(hoveredCharacterId) : null;

  // Show hover connector only if hovering a different character than selected
  const showHoverConnector = hoveredCharacterId && 
                            selectedCharacterId && 
                            hoveredCharacterId !== selectedCharacterId &&
                            currentPos && 
                            hoveredPos &&
                            !showTransition; // Don't show during actual selection animation

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {/* HOVER PREVIEW CONNECTOR */}
        {showHoverConnector && currentPos && hoveredPos && (
          <motion.div
            key={`hover-connector-${hoveredCharacterId}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <svg className="w-full h-full">
              <defs>
                <linearGradient id="hoverBeamGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#facc15" stopOpacity="0" />
                  <stop offset="30%" stopColor="#facc15" stopOpacity="0.3" />
                  <stop offset="70%" stopColor="#facc15" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#facc15" stopOpacity="0" />
                </linearGradient>
                <pattern id="hoverDash" patternUnits="userSpaceOnUse" width="8" height="2">
                  <rect width="4" height="2" fill="#facc15" opacity="0.4"/>
                  <rect x="4" width="4" height="2" fill="transparent"/>
                </pattern>
              </defs>
              
              {/* Subtle pulsing background line */}
              <motion.line
                x1={currentPos.x}
                y1={currentPos.y}
                x2={hoveredPos.x}
                y2={hoveredPos.y}
                stroke="url(#hoverBeamGradient)"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
              
              {/* Animated dashed line overlay */}
              <motion.line
                x1={currentPos.x}
                y1={currentPos.y}
                x2={hoveredPos.x}
                y2={hoveredPos.y}
                stroke="url(#hoverDash)"
                strokeWidth="1"
                strokeLinecap="round"
                strokeDasharray="6 6"
                initial={{ strokeDashoffset: 12 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ 
                  duration: 0.8, 
                  ease: "linear", 
                  repeat: Infinity 
                }}
              />
            </svg>
          </motion.div>
        )}

        {/* HOVER DESTINATION HINT */}
        {showHoverConnector && hoveredPos && (
          <motion.div
            key={`hover-hint-${hoveredCharacterId}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
              opacity: [0.3, 0.6, 0.3],
              scale: [0.8, 1.1, 0.8],
            }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute w-8 h-8 border border-yellow-400/50 rounded-full -translate-x-4 -translate-y-4"
            style={{
              left: hoveredPos.x,
              top: hoveredPos.y,
            }}
          />
        )}

        {/* ACTUAL SELECTION ANIMATIONS (Enhanced) */}
        
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
            className="absolute w-6 h-6 bg-yellow-400 rounded-full blur-sm -translate-x-3 -translate-y-3"
          />
        )}

        {/* Enhanced Energy Beam Effect */}
        {showTransition && previousPos && currentPos && (
          <motion.div
            key={`beam-${rippleKey}`}
            initial={{ 
              opacity: 0,
              pathLength: 0,
            }}
            animate={{ 
              opacity: [0, 1, 0.8, 0],
              pathLength: [0, 1, 1, 1],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <svg className="w-full h-full">
              <defs>
                <linearGradient id="selectionBeamGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#facc15" stopOpacity="0" />
                  <stop offset="20%" stopColor="#facc15" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#fbbf24" stopOpacity="1" />
                  <stop offset="80%" stopColor="#facc15" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#facc15" stopOpacity="0" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <line
                x1={previousPos.x}
                y1={previousPos.y}
                x2={currentPos.x}
                y2={currentPos.y}
                stroke="url(#selectionBeamGradient)"
                strokeWidth="3"
                strokeLinecap="round"
                filter="url(#glow)"
              />
            </svg>
          </motion.div>
        )}

        {/* Enhanced Ripple Effect */}
        {showTransition && currentPos && (
          <>
            <motion.div
              key={`ripple-1-${rippleKey}`}
              initial={{ 
                opacity: 0,
                scale: 0,
                x: currentPos.x,
                y: currentPos.y,
              }}
              animate={{ 
                opacity: [0, 0.8, 0],
                scale: [0, 1.5, 2.5],
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute w-20 h-20 border-2 border-yellow-400 rounded-full -translate-x-10 -translate-y-10"
            />
            <motion.div
              key={`ripple-2-${rippleKey}`}
              initial={{ 
                opacity: 0,
                scale: 0,
                x: currentPos.x,
                y: currentPos.y,
              }}
              animate={{ 
                opacity: [0, 0.6, 0],
                scale: [0, 2, 3],
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              className="absolute w-20 h-20 border border-yellow-300 rounded-full -translate-x-10 -translate-y-10"
            />
          </>
        )}

        {/* Enhanced Particle Burst Effect */}
        {showTransition && currentPos && (
          <div key={`particles-${rippleKey}`}>
            {Array.from({ length: 12 }).map((_, i) => (
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
                  scale: [0, 1.2, 0],
                  x: currentPos.x + Math.cos((i * 30) * Math.PI / 180) * (60 + Math.random() * 20),
                  y: currentPos.y + Math.sin((i * 30) * Math.PI / 180) * (60 + Math.random() * 20),
                }}
                exit={{ opacity: 0 }}
                transition={{ 
                  duration: 0.8,
                  delay: i * 0.05,
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