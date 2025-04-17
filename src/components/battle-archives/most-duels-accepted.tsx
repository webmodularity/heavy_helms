"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Target, Award, Check, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Fighter {
  id: string;
  fullName: string;
  duelsAccepted: number;
  winRate: number;
  imageColor?: string;
}

// Mock data for development
const mockFighters: Fighter[] = [
  {
    id: "1",
    fullName: "Sir Lancelot",
    duelsAccepted: 87,
    winRate: 0.85,
    imageColor: "#9c2a2a",
  },
  {
    id: "2",
    fullName: "King Arthur",
    duelsAccepted: 72,
    winRate: 0.92,
    imageColor: "#2f516b",
  },
  {
    id: "3",
    fullName: "Sir Gawain",
    duelsAccepted: 65,
    winRate: 0.79,
    imageColor: "#447249",
  },
  {
    id: "4",
    fullName: "The Green Knight",
    duelsAccepted: 58,
    winRate: 0.82,
    imageColor: "#217026",
  },
  {
    id: "5",
    fullName: "Sir Tristan",
    duelsAccepted: 52,
    winRate: 0.72,
    imageColor: "#5e4185",
  },
  {
    id: "6",
    fullName: "Sir Percival",
    duelsAccepted: 48,
    winRate: 0.68,
    imageColor: "#8b5d1e",
  },
  {
    id: "7",
    fullName: "Sir Bors",
    duelsAccepted: 44,
    winRate: 0.65,
    imageColor: "#6d482d",
  },
  {
    id: "8",
    fullName: "Sir Kay",
    duelsAccepted: 41,
    winRate: 0.59,
    imageColor: "#575757",
  },
  {
    id: "9",
    fullName: "Sir Bedivere",
    duelsAccepted: 39,
    winRate: 0.62,
    imageColor: "#1e5060",
  },
  {
    id: "10",
    fullName: "Sir Gareth",
    duelsAccepted: 35,
    winRate: 0.57,
    imageColor: "#802d58",
  },
];

export function MostDuelsAccepted() {
  const [fighters] = useState<Fighter[]>(mockFighters);
  
  return (
    <div className="bg-stone-900 border border-yellow-600/20 rounded-lg overflow-hidden h-full">
      <div className="p-4 bg-gradient-to-r from-amber-900/50 to-stone-900 border-b border-yellow-600/20 flex items-center justify-between">
        <div className="flex items-center">
          <Shield className="h-5 w-5 text-yellow-500 mr-2" />
          <h2 className="text-xl font-bold text-yellow-400">Most Duels Accepted</h2>
        </div>
        <span className="text-sm text-stone-400 flex items-center">
          <Target className="h-4 w-4 mr-1" /> Challenge seekers
        </span>
      </div>
      
      <div className="p-4">
        {/* Hall of honor header */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-stone-300">
            Hall of Honor
          </h3>
          <div className="text-sm text-amber-600/70 italic mt-1">
            Warriors who never refuse a challenge
          </div>
        </div>
        
        {/* Shield display */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {fighters.map((fighter, index) => {
            // Calculate shield size based on number of duels accepted
            const maxDuels = Math.max(...fighters.map(f => f.duelsAccepted));
            const minShieldSize = 80; // in percentage
            const maxShieldSize = 100; // in percentage
            const shieldSize = minShieldSize + (fighter.duelsAccepted / maxDuels) * (maxShieldSize - minShieldSize);
            
            return (
              <motion.div
                key={fighter.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center"
              >
                {/* Shield with size based on duels accepted */}
                <div className="relative">
                  {/* Knight's shield with custom color */}
                  <div 
                    className="relative shield-container"
                    style={{ 
                      width: `${shieldSize}%`,
                      height: `${shieldSize}%`,
                    }}
                  >
                    <svg 
                      viewBox="0 0 100 120" 
                      className="drop-shadow-lg" 
                      aria-hidden="true"
                    >
                      {/* Shield shape */}
                      <path 
                        d="M50,0 L95,15 C95,15 100,75 50,120 C0,75 5,15 5,15 L50,0 Z" 
                        fill={fighter.imageColor || "#6d432f"}
                        stroke="#a87c4f"
                        strokeWidth="2"
                      />
                      
                      {/* Shield inner border */}
                      <path 
                        d="M50,10 L85,22 C85,22 88,72 50,105 C12,72 15,22 15,22 L50,10 Z" 
                        fill="none" 
                        stroke="#cfab76" 
                        strokeWidth="1" 
                        opacity="0.7"
                      />
                      
                      {/* Shield emblem */}
                      <text 
                        x="50" 
                        y="50" 
                        fontSize="40" 
                        textAnchor="middle" 
                        dominantBaseline="middle" 
                        fill="#e2c18d"
                        fontWeight="bold"
                      >
                        {fighter.fullName.charAt(0)}
                      </text>
                      
                      {/* Duel count */}
                      <text 
                        x="50" 
                        y="80" 
                        fontSize="14" 
                        textAnchor="middle" 
                        fill="#fff" 
                        fontWeight="bold"
                      >
                        {fighter.duelsAccepted}
                      </text>
                    </svg>
                    
                    {/* Rank badge for top 3 */}
                    {index < 3 && (
                      <div className={`absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center ${
                        index === 0 
                          ? 'bg-yellow-500' 
                          : index === 1 
                            ? 'bg-slate-300' 
                            : 'bg-amber-700'
                      } text-stone-900 font-bold text-xs border-2 border-stone-200 shadow-md z-10`}>
                        {index + 1}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Warrior name */}
                <div className="mt-2 text-center">
                  <div className="text-sm font-medium text-stone-300 truncate max-w-full">
                    {fighter.fullName}
                  </div>
                  <div className="text-xs text-stone-500 flex items-center justify-center">
                    <Check className="h-3 w-3 mr-1 text-green-500" />
                    <span>{fighter.duelsAccepted} accepted</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {/* Show more button */}
        <div className="mt-4 text-center">
          <Button 
            variant="ghost"
            size="sm"
            className="text-amber-600 hover:text-amber-500 hover:bg-stone-800"
          >
            <MoreHorizontal className="h-4 w-4 mr-1" />
            View All Warriors
          </Button>
        </div>
      </div>
    </div>
  );
} 