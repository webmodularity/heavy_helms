"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState, useMemo, useEffect } from "react";
import { Sparkles, Zap } from "lucide-react";
import type { Fighter } from "@/types/fighter-types";
import {
  getWeaponDisplayName,
  getArmorDisplayName,
} from "@/lib/equipment-utils";

interface EmberCharacterProps {
  player: Fighter;
  index: number;
  total: number;
  onSelect: () => void;
  delay: number;
  position: { x: number; y: number };
  allPlayers: Fighter[];
}

export function EmberCharacter({
  player,
  index,
  total,
  onSelect,
  delay,
  position,
  allPlayers,
}: EmberCharacterProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('top');

  // Calculate dynamic size based on wins
  const sizeData = useMemo(() => {
    const wins = player.record.wins;
    const allWins = allPlayers.map(p => p.record.wins);
    const minWins = Math.min(...allWins);
    const maxWins = Math.max(...allWins);
    
    const winsRange = maxWins - minWins || 1;
    const sizePercent = 50 + ((wins - minWins) / winsRange) * 50;
    const scaleFactor = sizePercent / 100;
    const baseSize = 80;
    const actualSize = Math.round(baseSize * scaleFactor);
    
    return {
      scaleFactor,
      actualSize,
      wins,
      isLargest: wins === maxWins,
      isSmallest: wins === minWins,
    };
  }, [player.record.wins, allPlayers]);

  const { x, y } = position;
  const { scaleFactor, actualSize, isLargest } = sizeData;

  // Smart tooltip positioning based on ember location
  useEffect(() => {
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    const centerX = viewportWidth / 2;
    const centerY = viewportHeight / 2;
    
    // Calculate absolute position of ember
    const emberX = centerX + x;
    const emberY = centerY + y;
    
    // Choose position that keeps tooltip in viewport and away from center
    if (emberY < centerY - 100) {
      setTooltipPosition('bottom'); // Ember is high, tooltip below
    } else if (emberY > centerY + 100) {
      setTooltipPosition('top'); // Ember is low, tooltip above
    } else if (emberX < centerX) {
      setTooltipPosition('right'); // Ember is left, tooltip right
    } else {
      setTooltipPosition('left'); // Ember is right, tooltip left
    }
  }, [x, y]);

  // Improved hover timing - delay show, immediate hide
  useEffect(() => {
    let showTimer: NodeJS.Timeout;
    let hideTimer: NodeJS.Timeout;

    if (isHovered) {
      // Show tooltip after delay
      showTimer = setTimeout(() => {
        setShowTooltip(true);
      }, 500); // 500ms delay before showing
    } else {
      // Hide tooltip after a short delay to prevent flickering
      hideTimer = setTimeout(() => {
        setShowTooltip(false);
      }, 150); // Quick hide but not instant
    }

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [isHovered]);

  const handleEmberClick = () => {
    // Always close tooltip when clicking
    setShowTooltip(false);
    onSelect();
  };

  const handleHoverStart = () => {
    setIsHovered(true);
  };

  const handleHoverEnd = () => {
    setIsHovered(false);
  };

  // Tooltip positioning styles
  const getTooltipPositionStyles = () => {
    const baseDistance = 20 + actualSize / 2; // Distance from ember edge
    
    switch (tooltipPosition) {
      case 'top':
        return {
          bottom: `${baseDistance}px`,
          left: '50%',
          transform: 'translateX(-50%)',
        };
      case 'bottom':
        return {
          top: `${baseDistance}px`,
          left: '50%',
          transform: 'translateX(-50%)',
        };
      case 'left':
        return {
          right: `${baseDistance}px`,
          top: '50%',
          transform: 'translateY(-50%)',
        };
      case 'right':
        return {
          left: `${baseDistance}px`,
          top: '50%',
          transform: 'translateY(-50%)',
        };
      default:
        return {
          top: `${-baseDistance}px`,
          left: '50%',
          transform: 'translateX(-50%)',
        };
    }
  };

  // Tooltip arrow styles
  const getTooltipArrowStyles = () => {
    switch (tooltipPosition) {
      case 'top':
        return {
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          borderTop: '8px solid rgba(28, 25, 23, 0.98)',
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderBottom: 'none',
        };
      case 'bottom':
        return {
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          borderBottom: '8px solid rgba(28, 25, 23, 0.98)',
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: 'none',
        };
      case 'left':
        return {
          left: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          borderLeft: '8px solid rgba(28, 25, 23, 0.98)',
          borderTop: '8px solid transparent',
          borderBottom: '8px solid transparent',
          borderRight: 'none',
        };
      case 'right':
        return {
          right: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          borderRight: '8px solid rgba(28, 25, 23, 0.98)',
          borderTop: '8px solid transparent',
          borderBottom: '8px solid transparent',
          borderLeft: 'none',
        };
      default:
        return {};
    }
  };

  return (
    <motion.div
      className="absolute"
      style={{
        left: "50%",
        top: "50%",
        transform: `translate(${x}px, ${y}px)`,
      }}
      initial={{
        opacity: 0,
        scale: 0,
        rotate: -360,
        filter: "brightness(0) blur(20px)",
        y: y + 100,
        x: x + (Math.random() - 0.5) * 50,
      }}
      animate={{
        opacity: 1,
        scale: 1,
        rotate: 0,
        filter: "brightness(1) blur(0px)",
        y: y,
        x: x,
      }}
      transition={{
        delay: delay / 1000,
        duration: 1.2,
        ease: [0.23, 1, 0.32, 1],
        filter: { duration: 0.8 },
      }}
      whileHover={{
        scale: 1.1, // Reduced from 1.3 to prevent layout shift
        transition: { duration: 0.2, ease: "easeOut" },
      }}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      onTapStart={() => setIsPressed(true)}
      onTap={() => setIsPressed(false)}
      onTapCancel={() => setIsPressed(false)}
    >
      {/* Enhanced multi-layered ember glow effect - scaled */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: `${actualSize + 40}px`,
          height: `${actualSize + 40}px`,
          left: `${-20}px`,
          top: `${-20}px`,
          background: isLargest 
            ? "radial-gradient(circle, rgba(255, 215, 0, 0.8) 0%, rgba(255, 165, 0, 0.6) 40%, rgba(255, 140, 0, 0.3) 70%, transparent 100%)"
            : "radial-gradient(circle, rgba(255, 165, 0, 0.6) 0%, rgba(255, 69, 0, 0.4) 40%, rgba(255, 140, 0, 0.2) 70%, transparent 100%)",
          filter: `blur(${12 * scaleFactor}px)`,
        }}
        animate={{
          scale: isHovered ? [1, 1.3, 1.1] : [1, 1.2, 1], // Reduced scaling
          opacity: isHovered ? [0.6, 0.9, 0.7] : isLargest ? [0.6, 1, 0.6] : [0.4, 0.8, 0.4],
        }}
        transition={{
          duration: isLargest ? 1.5 : 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Secondary glow layer - scaled */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: `${actualSize + 20}px`,
          height: `${actualSize + 20}px`,
          left: `${-10}px`,
          top: `${-10}px`,
          background: isLargest
            ? "radial-gradient(circle, rgba(255, 215, 0, 0.6) 0%, rgba(255, 165, 0, 0.3) 60%, transparent 80%)"
            : "radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, rgba(255, 165, 0, 0.2) 60%, transparent 80%)",
          filter: `blur(${8 * scaleFactor}px)`,
        }}
        animate={{
          scale: [1.2, 0.8, 1.2],
          opacity: [0.3, 0.6, 0.3],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: isLargest ? 2.5 : 3,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Enhanced character ember with magical border - FIXED CLICK AREA */}
      <motion.button
        onClick={handleEmberClick}
        className="relative rounded-full overflow-hidden 
                   border-2 bg-gradient-to-br 
                   from-amber-500/30 to-orange-600/30 backdrop-blur-sm
                   transition-all duration-300
                   shadow-xl cursor-pointer
                   touch-manipulation"
        style={{
          width: `${actualSize}px`,
          height: `${actualSize}px`,
          borderColor: isHovered ? "#FCD34D" : isLargest ? "#FCD34D80" : "#FB923C80",
          borderWidth: isLargest ? "3px" : "2px",
          boxShadow: isHovered
            ? `0 0 ${25 * scaleFactor}px rgba(255, 165, 0, 0.6), 0 0 ${50 * scaleFactor}px rgba(255, 69, 0, 0.3)`
            : isLargest 
            ? `0 0 ${20 * scaleFactor}px rgba(255, 215, 0, 0.5), 0 0 ${40 * scaleFactor}px rgba(255, 165, 0, 0.3)`
            : `0 0 ${15 * scaleFactor}px rgba(255, 165, 0, 0.4)`,
        }}
        animate={{
          rotate: isPressed ? [0, 15, -15, 0] : 0,
        }}
        transition={{
          rotate: { duration: 0.3 },
        }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Character image - now properly sized and positioned */}
        <Image
          src={player.currentSkin.imageURL}
          alt={player.name.fullName || ""}
          fill
          className="object-cover rounded-full"
        />

        {/* Animated magical overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-orange-400/40 via-transparent to-yellow-400/40 rounded-full"
          animate={{
            opacity: isLargest ? [0.4, 0.8, 0.4] : [0.3, 0.7, 0.3],
            background: [
              "linear-gradient(45deg, rgba(251, 146, 60, 0.4) 0%, transparent 50%, rgba(252, 211, 77, 0.4) 100%)",
              "linear-gradient(135deg, rgba(252, 211, 77, 0.4) 0%, transparent 50%, rgba(251, 146, 60, 0.4) 100%)",
              "linear-gradient(45deg, rgba(251, 146, 60, 0.4) 0%, transparent 50%, rgba(252, 211, 77, 0.4) 100%)",
            ],
          }}
          transition={{
            duration: isLargest ? 2 : 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        {/* Magical energy ring - scaled */}
        <motion.div
          className="absolute rounded-full border border-yellow-400/50"
          style={{
            inset: `${2 * scaleFactor}px`,
            borderWidth: isLargest ? "2px" : "1px",
          }}
          animate={{
            rotate: [0, 360],
            borderColor: [
              "rgba(251, 146, 60, 0.5)",
              isLargest ? "rgba(255, 215, 0, 0.9)" : "rgba(252, 211, 77, 0.8)",
              "rgba(251, 146, 60, 0.5)",
            ],
          }}
          transition={{
            rotate: {
              duration: isLargest ? 3 : 4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            },
            borderColor: {
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            },
          }}
        />
      </motion.button>

      {/* Floating sparks - reduced quantity for better performance */}
      {[...Array(isLargest ? 4 : 3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: "50%",
            top: "50%",
            width: (i % 2 === 0 ? 3 : 2) * scaleFactor,
            height: (i % 2 === 0 ? 3 : 2) * scaleFactor,
            background: isLargest 
              ? (i % 2 === 0 ? "#FFD700" : "#FCD34D")
              : (i % 2 === 0 ? "#FCD34D" : "#FB923C"),
          }}
          animate={{
            x: [
              0,
              Math.cos((i * (360 / (isLargest ? 4 : 3)) * Math.PI) / 180) * (25 + i * 4) * scaleFactor,
              Math.cos((i * (360 / (isLargest ? 4 : 3)) * Math.PI) / 180) * (35 + i * 4) * scaleFactor,
            ],
            y: [
              0,
              Math.sin((i * (360 / (isLargest ? 4 : 3)) * Math.PI) / 180) * (25 + i * 4) * scaleFactor,
              Math.sin((i * (360 / (isLargest ? 4 : 3)) * Math.PI) / 180) * (35 + i * 4) * scaleFactor - 15 * scaleFactor,
            ],
            opacity: [0, 1, 0.7, 0],
            scale: [0, 1.2 * scaleFactor, 0.8 * scaleFactor, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: isLargest ? 1.8 : 2.2,
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 0.5,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Power level indicator - enhanced positioning to avoid tooltip interference */}
      <motion.div
        className="absolute rounded-full border-2 border-stone-900 flex items-center justify-center font-bold pointer-events-none"
        style={{
          top: `${-6 * scaleFactor}px`,
          right: `${-6 * scaleFactor}px`,
          width: `${20 * scaleFactor}px`,
          height: `${20 * scaleFactor}px`,
          background: isLargest 
            ? "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)"
            : "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)",
          fontSize: `${8 * scaleFactor}px`,
          color: isLargest ? "#000" : "#1C1917",
          zIndex: 10,
        }}
        animate={{
          scale: [1, 1.08, 1],
          boxShadow: isLargest 
            ? [
                "0 0 6px rgba(255, 215, 0, 0.7)",
                "0 0 15px rgba(255, 215, 0, 1)",
                "0 0 6px rgba(255, 215, 0, 0.7)",
              ]
            : [
                "0 0 4px rgba(252, 211, 77, 0.5)",
                "0 0 12px rgba(251, 146, 60, 0.8)",
                "0 0 4px rgba(252, 211, 77, 0.5)",
              ],
        }}
        transition={{
          duration: isLargest ? 1.5 : 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        {Math.min(player.record.wins + 1, 99)}
        {isLargest && (
          <motion.div
            className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-yellow-300 rounded-full"
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        )}
      </motion.div>

      {/* Improved tooltip with smart positioning and click-through protection */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            className="absolute z-30 pointer-events-none" // pointer-events-none prevents interference
            style={getTooltipPositionStyles()}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="bg-gradient-to-br from-stone-900/95 to-stone-800/95 
                           border border-yellow-400/40 rounded-lg p-3
                           text-xs text-stone-200 backdrop-blur-sm
                           shadow-2xl max-w-48"
                 style={{
                   borderWidth: isLargest ? "2px" : "1px",
                 }}>
              
              {/* Compact character info */}
              <div className="flex items-center gap-2 mb-2">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{
                    duration: 4,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                >
                  <Sparkles className={`${isLargest ? 'w-3.5 h-3.5' : 'w-3 h-3'} text-yellow-400`} />
                </motion.div>
                <div className={`text-yellow-300 font-medium ${isLargest ? 'text-sm' : 'text-xs'} truncate`}>
                  {player.name.fullName}
                  {isLargest && <span className="ml-1 text-yellow-400">👑</span>}
                </div>
              </div>

              {/* Compact stats */}
              <div className="flex justify-between text-[9px] text-stone-300 mb-1.5">
                <span className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                  {player.record.wins}W
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                  {player.record.losses}L
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="w-1.5 h-1.5 text-yellow-400" />
                  {player.record.kills}K
                </span>
              </div>

              {/* Equipment info */}
              <div className="text-[9px] text-stone-400 border-t border-yellow-400/20 pt-1.5 truncate">
                {getWeaponDisplayName(player.currentSkin.weapon)} • {getArmorDisplayName(player.currentSkin.armor)}
              </div>

              {/* Tooltip arrow */}
              <div
                className="absolute w-0 h-0"
                style={getTooltipArrowStyles()}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Simple click hint that appears briefly on hover */}
      <AnimatePresence>
        {isHovered && !showTooltip && (
          <motion.div
            className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 
                       text-[10px] text-yellow-400/90 font-medium
                       bg-stone-900/80 px-2 py-1 rounded backdrop-blur-sm
                       pointer-events-none whitespace-nowrap"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {isLargest ? '👑 Challenge Champion' : 'Click to Challenge'}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
