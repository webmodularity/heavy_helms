"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState, useMemo } from "react";
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

  // Calculate dynamic size based on wins
  const sizeData = useMemo(() => {
    const wins = player.record.wins;
    const allWins = allPlayers.map(p => p.record.wins);
    const minWins = Math.min(...allWins);
    const maxWins = Math.max(...allWins);
    
    // Avoid division by zero if all players have same wins
    const winsRange = maxWins - minWins || 1;
    
    // Scale from 50% to 100% based on wins
    const sizePercent = 50 + ((wins - minWins) / winsRange) * 50;
    const scaleFactor = sizePercent / 100;
    
    // Base size is 80px (w-20 h-20), scale accordingly
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
  const { scaleFactor, actualSize, isLargest, isSmallest } = sizeData;

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
        scale: 1.3,
        transition: { duration: 0.3, ease: "easeOut" },
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onTapStart={() => setIsPressed(true)}
      onTap={() => setIsPressed(false)}
      onTapCancel={() => setIsPressed(false)}
    >
      {/* Enhanced multi-layered ember glow effect - scaled */}
      <motion.div
        className="absolute rounded-full"
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
          scale: isHovered ? [1, 1.5, 1.2] : [1, 1.4, 1],
          opacity: isHovered ? [0.6, 1, 0.8] : isLargest ? [0.6, 1, 0.6] : [0.4, 0.8, 0.4],
        }}
        transition={{
          duration: isLargest ? 1.5 : 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Secondary glow layer - scaled */}
      <motion.div
        className="absolute rounded-full"
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

      {/* Enhanced character ember with magical border - dynamically sized */}
      <motion.button
        onClick={onSelect}
        className="relative rounded-full overflow-hidden 
                   border-2 bg-gradient-to-br 
                   from-amber-500/30 to-orange-600/30 backdrop-blur-sm
                   transition-all duration-300
                   shadow-xl"
        style={{
          width: `${actualSize}px`,
          height: `${actualSize}px`,
          borderColor: isHovered ? "#FCD34D" : isLargest ? "#FCD34D80" : "#FB923C80",
          borderWidth: isLargest ? "3px" : "2px",
          boxShadow: isHovered
            ? `0 0 ${30 * scaleFactor}px rgba(255, 165, 0, 0.6), 0 0 ${60 * scaleFactor}px rgba(255, 69, 0, 0.3)`
            : isLargest 
            ? `0 0 ${25 * scaleFactor}px rgba(255, 215, 0, 0.5), 0 0 ${50 * scaleFactor}px rgba(255, 165, 0, 0.3)`
            : `0 0 ${20 * scaleFactor}px rgba(255, 165, 0, 0.4)`,
        }}
        animate={{
          rotate: isPressed ? [0, 15, -15, 0] : 0,
        }}
        transition={{
          rotate: { duration: 0.3 },
        }}
      >
        {/* Enhanced character image with magical overlay */}
        <div className="relative w-full h-full">
          <Image
            src={player.currentSkin.imageURL}
            alt={player.name.fullName || ""}
            fill
            className="object-cover"
          />

          {/* Animated magical overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-orange-400/40 via-transparent to-yellow-400/40"
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
        </div>

        {/* Enhanced floating sparks with varied patterns - scaled */}
        {[...Array(isLargest ? 6 : 5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
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
                Math.cos((i * (360 / (isLargest ? 6 : 5)) * Math.PI) / 180) * (30 + i * 5) * scaleFactor,
                Math.cos((i * (360 / (isLargest ? 6 : 5)) * Math.PI) / 180) * (40 + i * 5) * scaleFactor,
              ],
              y: [
                0,
                Math.sin((i * (360 / (isLargest ? 6 : 5)) * Math.PI) / 180) * (30 + i * 5) * scaleFactor,
                Math.sin((i * (360 / (isLargest ? 6 : 5)) * Math.PI) / 180) * (40 + i * 5) * scaleFactor - 20 * scaleFactor,
              ],
              opacity: [0, 1, 0.7, 0],
              scale: [0, 1.5 * scaleFactor, 1 * scaleFactor, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: isLargest ? 1.5 : 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.4,
              ease: "easeOut",
            }}
          />
        ))}

        {/* Magical trail effect on hover - scaled */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="absolute rounded-full border-2 border-yellow-300/60"
              style={{
                inset: 0,
                borderWidth: isLargest ? "3px" : "2px",
              }}
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{
                scale: [1, 1.8],
                opacity: [0.8, 0],
              }}
              exit={{ scale: 1.8, opacity: 0 }}
              transition={{
                duration: 0.8,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeOut",
              }}
            />
          )}
        </AnimatePresence>

        {/* Power level indicator - scaled and enhanced for champions */}
        <motion.div
          className="absolute rounded-full border-2 border-stone-900 flex items-center justify-center font-bold"
          style={{
            top: `${-8 * scaleFactor}px`,
            right: `${-8 * scaleFactor}px`,
            width: `${24 * scaleFactor}px`,
            height: `${24 * scaleFactor}px`,
            background: isLargest 
              ? "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)"
              : "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)",
            fontSize: `${10 * scaleFactor}px`,
            color: isLargest ? "#000" : "#1C1917",
          }}
          animate={{
            scale: [1, 1.1, 1],
            boxShadow: isLargest 
              ? [
                  "0 0 8px rgba(255, 215, 0, 0.7)",
                  "0 0 20px rgba(255, 215, 0, 1)",
                  "0 0 8px rgba(255, 215, 0, 0.7)",
                ]
              : [
                  "0 0 5px rgba(252, 211, 77, 0.5)",
                  "0 0 15px rgba(251, 146, 60, 0.8)",
                  "0 0 5px rgba(252, 211, 77, 0.5)",
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
              className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-300 rounded-full"
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
      </motion.button>

      {/* Enhanced character info tooltip with magical styling - scaled positioning */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute left-1/2 transform -translate-x-1/2 z-20
                       bg-gradient-to-br from-stone-900/98 to-stone-800/98 
                       border border-yellow-400/40 rounded-xl p-4
                       text-xs text-stone-200 backdrop-blur-sm min-w-52
                       shadow-2xl"
            style={{
              top: `${-96 * scaleFactor}px`,
              borderWidth: isLargest ? "2px" : "1px",
            }}
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Magical border glow */}
            <motion.div
              className="absolute inset-0 rounded-xl border border-yellow-400/20"
              animate={{
                boxShadow: isLargest 
                  ? [
                      "0 0 15px rgba(255, 215, 0, 0.3)",
                      "0 0 25px rgba(255, 215, 0, 0.5)",
                      "0 0 15px rgba(255, 215, 0, 0.3)",
                    ]
                  : [
                      "0 0 10px rgba(252, 211, 77, 0.2)",
                      "0 0 20px rgba(251, 146, 60, 0.4)",
                      "0 0 10px rgba(252, 211, 77, 0.2)",
                    ],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{
                    duration: 4,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                >
                  <Sparkles className={`${isLargest ? 'w-4 h-4' : 'w-3 h-3'} text-yellow-400`} />
                </motion.div>
                <div className={`text-yellow-300 font-medium ${isLargest ? 'text-sm' : ''}`}>
                  {player.name.fullName}
                  {isLargest && <span className="ml-2 text-yellow-400">👑</span>}
                </div>
              </div>

              <div className="flex justify-between text-[10px] text-stone-300 mb-2">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  {player.record.wins}W
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  {player.record.losses}L
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="w-2 h-2 text-yellow-400" />
                  {player.record.kills}K
                </span>
              </div>

              <div className="text-[10px] text-stone-400 border-t border-yellow-400/20 pt-2">
                {getWeaponDisplayName(player.currentSkin.weapon)} •{" "}
                {getArmorDisplayName(player.currentSkin.armor)}
              </div>

              {/* Click hint */}
              <motion.div
                className={`text-[9px] text-yellow-400/80 text-center mt-2 font-medium ${isLargest ? 'text-yellow-300' : ''}`}
                animate={{
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                ✨ {isLargest ? 'Challenge the Champion' : 'Click to Challenge'} ✨
              </motion.div>
            </div>

            {/* Enhanced tooltip arrow */}
            <motion.div
              className="absolute left-1/2 transform -translate-x-1/2 
                         w-4 h-4 bg-stone-900 border-r border-b border-yellow-400/40 
                         rotate-45"
              style={{
                bottom: `${-8}px`,
              }}
              animate={{
                boxShadow: [
                  "0 0 5px rgba(252, 211, 77, 0.3)",
                  "0 0 10px rgba(251, 146, 60, 0.6)",
                  "0 0 5px rgba(252, 211, 77, 0.3)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
