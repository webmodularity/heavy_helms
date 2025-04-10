"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Crown, Award, BadgeCheck } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

interface Fighter {
  id: string;
  fullName: string;
  wins: number;
  losses: number;
  weapon: string;
  armor: string;
}

// Mock data for development
const mockFighters: Fighter[] = [
  {
    id: "1",
    fullName: "Sir Galahad",
    wins: 42,
    losses: 5,
    weapon: "Greatsword",
    armor: "Plate",
  },
  {
    id: "2",
    fullName: "The Mountain",
    wins: 38,
    losses: 2,
    weapon: "Mace and Shield",
    armor: "Plate",
  },
  {
    id: "3",
    fullName: "Lady Brienne",
    wins: 35,
    losses: 7,
    weapon: "Sword and Shield",
    armor: "Chain",
  },
  {
    id: "4",
    fullName: "Ser Arthur",
    wins: 29,
    losses: 8,
    weapon: "Greatsword",
    armor: "Plate",
  },
  {
    id: "5",
    fullName: "Lord Stark",
    wins: 27,
    losses: 11,
    weapon: "Greatsword",
    armor: "Leather",
  },
  {
    id: "6",
    fullName: "The Hound",
    wins: 24,
    losses: 9,
    weapon: "Battleaxe",
    armor: "Chain",
  },
  {
    id: "7",
    fullName: "Dread Knight",
    wins: 22,
    losses: 15,
    weapon: "Mace and Shield",
    armor: "Plate",
  },
  {
    id: "8",
    fullName: "Sir Jaime",
    wins: 18,
    losses: 12,
    weapon: "Sword and Shield",
    armor: "Plate",
  },
  {
    id: "9",
    fullName: "Ragged Warrior",
    wins: 16,
    losses: 20,
    weapon: "Spear",
    armor: "Leather",
  },
  {
    id: "10",
    fullName: "Queen Cersei",
    wins: 12,
    losses: 25,
    weapon: "Rapier and Shield",
    armor: "Cloth",
  },
];

export function WarriorLeaderboard() {
  const [fighters] = useState<Fighter[]>(mockFighters);

  // Render rank badge based on position
  const renderRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="absolute -left-3 -top-3 h-12 w-12">
            <Crown className="h-8 w-8 text-yellow-400 drop-shadow-glow" />
          </div>
        );
      case 2:
        return (
          <div className="absolute -left-3 -top-3 h-10 w-10">
            <Award className="h-7 w-7 text-slate-300 drop-shadow-glow" />
          </div>
        );
      case 3:
        return (
          <div className="absolute -left-3 -top-3 h-10 w-10">
            <Medal className="h-7 w-7 text-amber-700 drop-shadow-glow" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-stone-900 border border-yellow-600/20 rounded-lg overflow-hidden h-full">
      <div className="p-4 bg-gradient-to-r from-amber-900/50 to-stone-900 border-b border-yellow-600/20 flex items-center justify-between">
        <div className="flex items-center">
          <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
          <h2 className="text-xl font-bold text-yellow-400">Warrior Leaderboard</h2>
        </div>
        <span className="text-sm text-stone-400 flex items-center">
          <BadgeCheck className="h-4 w-4 mr-1" /> Top champions by wins
        </span>
      </div>

      <div className="p-4">
        {/* Trophy wall header with gold effect */}
        <div className="mb-6 text-center">
          <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-600">
            Hall of Champions
          </h3>
          <div className="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-yellow-600 to-transparent" />
        </div>
        
        <div className="relative">
          {/* Top 3 fighters showcase */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-6">
            {fighters.slice(0, 3).map((fighter, index) => (
              <motion.div
                key={fighter.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className={`relative p-4 w-full sm:w-1/3 ${
                  index === 0 
                    ? 'bg-gradient-to-b from-amber-900/30 to-stone-900 border-2 border-yellow-600/40 order-2 sm:order-2' 
                    : index === 1 
                      ? 'bg-gradient-to-b from-slate-800/30 to-stone-900 border border-slate-400/30 order-1 sm:order-1' 
                      : 'bg-gradient-to-b from-amber-800/20 to-stone-900 border border-amber-700/30 order-3 sm:order-3'
                } rounded-lg shadow-lg`}
              >
                {renderRankBadge(index + 1)}
                
                <div className="text-center">
                  <div className={`text-xl font-bold mb-1 ${
                    index === 0 ? 'text-yellow-400' : index === 1 ? 'text-slate-300' : 'text-amber-700'
                  }`}>
                    {index === 0 ? 'Champion' : index === 1 ? 'Runner-up' : 'Third Place'}
                  </div>
                  <div className="text-stone-200 font-bold">{fighter.fullName}</div>
                  
                  <div className={`inline-flex items-center gap-1 mt-2 font-bold ${
                    index === 0 ? 'text-yellow-500' : index === 1 ? 'text-slate-400' : 'text-amber-800'
                  }`}>
                    <Trophy className="h-4 w-4" />
                    <span>{fighter.wins} Wins</span>
                  </div>
                  
                  <div className="mt-2 text-xs text-stone-400">
                    <span className="inline-block px-2 bg-stone-800 rounded-full">
                      {fighter.weapon}
                    </span>
                    <span className="mx-1">•</span>
                    <span className="inline-block px-2 bg-stone-800 rounded-full">
                      {fighter.armor}
                    </span>
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className={`absolute top-0 left-0 w-full h-1 ${
                  index === 0 ? 'bg-yellow-500/50' : index === 1 ? 'bg-slate-400/50' : 'bg-amber-700/50'
                }`} />
              </motion.div>
            ))}
          </div>
          
          {/* Rest of the fighters in a table */}
          <Table className="border border-yellow-900/20">
            <TableHeader className="bg-amber-950/30">
              <TableRow>
                <TableHead className="w-12 text-center text-yellow-500">Rank</TableHead>
                <TableHead className="text-yellow-500">Warrior</TableHead>
                <TableHead className="text-center text-yellow-500">Wins</TableHead>
                <TableHead className="text-center text-yellow-500">Losses</TableHead>
                <TableHead className="hidden md:table-cell text-center text-yellow-500">W/L</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fighters.slice(3).map((fighter, index) => (
                <TableRow 
                  key={fighter.id}
                  className="hover:bg-amber-950/20 group"
                >
                  <TableCell className="text-center font-semibold text-stone-500">
                    {index + 4}
                  </TableCell>
                  <TableCell className="font-medium text-stone-300">
                    {fighter.fullName}
                  </TableCell>
                  <TableCell className="text-center text-green-500 font-bold">
                    {fighter.wins}
                  </TableCell>
                  <TableCell className="text-center text-red-500">
                    {fighter.losses}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-center text-stone-400">
                    {(fighter.wins / (fighter.wins + fighter.losses)).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
} 