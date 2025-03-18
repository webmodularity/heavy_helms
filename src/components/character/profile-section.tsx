"use client";

import type { Character } from "@/types/player.types";
import Image from "next/image";
import { motion } from "framer-motion";
import { Flag, Trophy } from "lucide-react";

interface ProfileSectionProps {
  character: Character;
}

export function ProfileSection({ character }: ProfileSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
      {/* Character Image with animated glow effect */}
      <motion.div
        className="col-span-1 aspect-square rounded-lg overflow-hidden border border-yellow-600/40 bg-gradient-to-b from-amber-900/20 to-stone-900/40 relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div
          className="absolute inset-0 bg-gradient-to-tr from-yellow-600/0 via-yellow-500/10 to-yellow-600/0 z-0 animate-pulse"
          style={{ animationDuration: "4s" }}
        />
        <Image
          src={character.currentSkin.imageURL}
          alt={character.name.fullName || "Character"}
          width={600}
          height={600}
          className="object-cover w-full h-full relative z-10"
          priority
        />
        <div className="absolute inset-0 border-4 border-transparent border-b-yellow-600/20 border-r-yellow-600/20 z-20" />
      </motion.div>

      {/* Character Details */}
      <motion.div
        className="col-span-1 md:col-span-2 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* Warrior Info with decorative elements */}
        <div className="bg-gradient-to-b from-amber-900/10 to-stone-900/40 rounded-lg border border-yellow-600/20 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-600/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <h3 className="text-xl font-semibold text-yellow-500 mb-4 flex items-center relative z-10">
            <Flag className="mr-2 h-5 w-5" />
            Warrior Identity
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            <InfoItem
              label="First Name"
              value={character.name.firstName}
              icon={null}
            />
            <InfoItem
              label="Surname"
              value={character.name.surname}
              icon={null}
            />
            <InfoItem
              label="Status"
              value={character.isRetired ? "Retired" : "Active"}
              className={
                character.isRetired ? "text-red-400" : "text-green-400"
              }
              icon={null}
            />
            <InfoItem
              label="Immortal"
              value={character.isImmortal ? "Yes" : "No"}
              className={
                character.isImmortal ? "text-yellow-400" : "text-stone-400"
              }
              icon={null}
            />
          </div>
        </div>

        {/* Battle Record with animated stats */}
        <div className="bg-gradient-to-b from-amber-900/10 to-stone-900/40 rounded-lg border border-yellow-600/20 p-6 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-700/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
          <h3 className="text-xl font-semibold text-yellow-500 mb-4 flex items-center relative z-10">
            <Trophy className="mr-2 h-5 w-5" />
            Battle Legacy
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
            <StatBox
              label="Wins"
              value={character.record.wins.toString()}
              className="text-green-400"
            />
            <StatBox
              label="Losses"
              value={character.record.losses.toString()}
              className="text-red-400"
            />
            <StatBox
              label="Kills"
              value={character.record.kills.toString()}
              className="text-yellow-400"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Helper Components
interface InfoItemProps {
  label: string;
  value: string;
  icon?: React.ReactNode | null;
  className?: string;
}

function InfoItem({ label, value, icon, className = "" }: InfoItemProps) {
  return (
    <div className="flex justify-between group">
      <span className="text-stone-400 group-hover:text-stone-300 transition-colors duration-300">
        {label}
      </span>
      <span
        className={`font-medium ${className || "text-stone-200"} group-hover:text-white transition-colors duration-300`}
      >
        {icon && <span className="mr-1">{icon}</span>}
        {value}
      </span>
    </div>
  );
}

interface StatBoxProps {
  label: string;
  value: string;
  className?: string;
}

function StatBox({ label, value, className = "" }: StatBoxProps) {
  return (
    <motion.div
      className="text-center p-4 bg-stone-800/30 rounded-lg border border-yellow-600/10 relative overflow-hidden group hover:border-yellow-600/20 transition-all duration-300"
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-yellow-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <motion.div
        className={`text-2xl font-bold ${className} relative z-10`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {value}
      </motion.div>
      <div className="text-stone-400 text-sm mt-1 relative z-10 group-hover:text-stone-300 transition-colors duration-300">
        {label}
      </div>
    </motion.div>
  );
} 