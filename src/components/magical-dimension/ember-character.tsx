"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
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
}

export function EmberCharacter({
  player,
  index,
  total,
  onSelect,
  delay,
}: EmberCharacterProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Calculate position in a spiral pattern
  const angle = (index / total) * Math.PI * 4; // Multiple spirals
  const radius = 150 + index * 20; // Expanding spiral
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;

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
        rotate: -180,
        filter: "brightness(0) blur(10px)",
      }}
      animate={{
        opacity: 1,
        scale: 1,
        rotate: 0,
        filter: "brightness(1) blur(0px)",
      }}
      transition={{
        delay: delay / 1000,
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{
        scale: 1.2,
        transition: { duration: 0.2 },
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Ember glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255, 165, 0, 0.4) 0%, rgba(255, 69, 0, 0.2) 50%, transparent 70%)",
          filter: "blur(8px)",
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Character ember */}
      <motion.button
        onClick={onSelect}
        className="relative w-20 h-20 rounded-full overflow-hidden 
                   border-2 border-orange-400/50 bg-gradient-to-br 
                   from-amber-500/20 to-orange-600/20 backdrop-blur-sm
                   hover:border-yellow-300 transition-all duration-300
                   shadow-lg hover:shadow-orange-400/30"
      >
        {/* Character image */}
        <div className="relative w-full h-full">
          <Image
            src={player.currentSkin.imageURL}
            alt={player.name.fullName || ""}
            fill
            className="object-cover"
          />
        </div>

        {/* Magical overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-orange-400/30 to-transparent"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        {/* Floating sparks */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400 rounded-full"
            style={{
              left: "50%",
              top: "50%",
            }}
            animate={{
              x: [0, (Math.random() - 0.5) * 40],
              y: [0, -30 - Math.random() * 20],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.5,
              ease: "easeOut",
            }}
          />
        ))}
      </motion.button>

      {/* Character info tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute -top-20 left-1/2 transform -translate-x-1/2 z-10
                       bg-stone-900/95 border border-yellow-400/30 rounded-lg p-3
                       text-xs text-stone-200 backdrop-blur-sm min-w-48"
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-yellow-300 font-medium mb-1">
              {player.name.fullName}
            </div>
            <div className="flex justify-between text-[10px] text-stone-300 mb-1">
              <span>W: {player.record.wins}</span>
              <span>L: {player.record.losses}</span>
            </div>
            <div className="text-[10px] text-stone-400">
              {getWeaponDisplayName(player.currentSkin.weapon)} •{" "}
              {getArmorDisplayName(player.currentSkin.armor)}
            </div>
            <div
              className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 
                            w-2 h-2 bg-stone-900 border-r border-b border-yellow-400/30 
                            rotate-45"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
