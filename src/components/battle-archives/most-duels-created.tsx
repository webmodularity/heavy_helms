"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Flag, Map as MapIcon, Swords, Users } from "lucide-react";

interface Fighter {
  id: string;
  fullName: string;
  duelsCreated: number;
  acceptanceRate: number;
  totalWager: number;
  region?: string;
}

// Mock data for development
const mockFighters: Fighter[] = [
  {
    id: "1",
    fullName: "King Arthur",
    duelsCreated: 102,
    acceptanceRate: 0.88,
    totalWager: 254.6,
    region: "Camelot",
  },
  {
    id: "2",
    fullName: "Sir Mordred",
    duelsCreated: 95,
    acceptanceRate: 0.65,
    totalWager: 180.2,
    region: "Cornwall",
  },
  {
    id: "3",
    fullName: "Morgana le Fay",
    duelsCreated: 87,
    acceptanceRate: 0.72,
    totalWager: 210.8,
    region: "Avalon",
  },
  {
    id: "4",
    fullName: "The Green Knight",
    duelsCreated: 81,
    acceptanceRate: 0.91,
    totalWager: 195.7,
    region: "Bertilak Castle",
  },
  {
    id: "5",
    fullName: "Lady Guinevere",
    duelsCreated: 76,
    acceptanceRate: 0.59,
    totalWager: 144.3,
    region: "Camelot",
  },
  {
    id: "6",
    fullName: "Sir Lancelot",
    duelsCreated: 72,
    acceptanceRate: 0.93,
    totalWager: 187.9,
    region: "Joyous Gard",
  },
  {
    id: "7",
    fullName: "Merlin",
    duelsCreated: 68,
    acceptanceRate: 0.70,
    totalWager: 203.1,
    region: "Crystal Cave",
  },
  {
    id: "8",
    fullName: "Sir Galahad",
    duelsCreated: 60,
    acceptanceRate: 0.85,
    totalWager: 152.0,
    region: "Sarras",
  },
];

export function MostDuelsCreated() {
  const [fighters] = useState<Fighter[]>(mockFighters);
  
  return (
    <div className="bg-stone-900 border border-yellow-600/20 rounded-lg overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-amber-900/50 to-stone-900 border-b border-yellow-600/20 flex items-center justify-between">
        <div className="flex items-center">
          <Swords className="h-5 w-5 text-yellow-500 mr-2" />
          <h2 className="text-xl font-bold text-yellow-400">Most Duels Created</h2>
        </div>
        <span className="text-sm text-stone-400 flex items-center">
          <Users className="h-4 w-4 mr-1" /> The most ambitious warriors
        </span>
      </div>
      
      <div className="p-6 relative">
        {/* War table header */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-amber-500">
            The Commander's War Table
          </h3>
          <div className="text-sm text-amber-600/70 italic mt-1">
            Those who instigate the most combat
          </div>
        </div>
        
        {/* War table map background */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <svg 
            width="100%" 
            height="100%" 
            viewBox="0 0 1000 600" 
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {/* Stylized map grid */}
            <g stroke="#a87c4f" strokeWidth="1">
              <path d="M0,100 L1000,100" />
              <path d="M0,200 L1000,200" />
              <path d="M0,300 L1000,300" />
              <path d="M0,400 L1000,400" />
              <path d="M0,500 L1000,500" />
              <path d="M100,0 L100,600" />
              <path d="M200,0 L200,600" />
              <path d="M300,0 L300,600" />
              <path d="M400,0 L400,600" />
              <path d="M500,0 L500,600" />
              <path d="M600,0 L600,600" />
              <path d="M700,0 L700,600" />
              <path d="M800,0 L800,600" />
              <path d="M900,0 L900,600" />
            </g>
            {/* Stylized continents */}
            <path d="M200,100 C300,50 400,150 350,250 C300,350 200,300 150,200 Z" fill="#a87c4f" opacity="0.3" />
            <path d="M600,200 C650,150 700,160 750,300 C800,400 700,450 650,350 Z" fill="#a87c4f" opacity="0.3" />
            <path d="M400,400 C450,380 500,420 480,500 C420,550 370,520 400,400 Z" fill="#a87c4f" opacity="0.3" />
          </svg>
        </div>
        
        {/* Main war table with regions and flags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          {fighters.map((fighter, index) => (
            <motion.div
              key={fighter.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="relative border border-amber-700/30 rounded-md overflow-hidden"
            >
              {/* Header with kingdom/region */}
              <div className="bg-gradient-to-r from-amber-900/30 to-amber-800/10 p-3 flex justify-between items-center border-b border-amber-700/30">
                <div className="flex items-center">
                  <Flag className="h-4 w-4 text-amber-500 mr-2" />
                  <span className="text-amber-200 font-medium text-sm">
                    {fighter.region || "Unknown Lands"}
                  </span>
                </div>
                <div className="flex items-center text-xs text-stone-400">
                  <MapIcon className="h-3 w-3 mr-1" />
                  <span>Territory</span>
                </div>
              </div>
              
              {/* Main content with battle map */}
              <div className="p-4 flex items-center">
                {/* Commander name and rank */}
                <div className="flex-1">
                  <div className="text-stone-200 font-bold">
                    {fighter.fullName}
                  </div>
                  <div className="text-xs text-amber-600">
                    Rank #{index + 1} Challenger
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
                    <div>
                      <div className="text-stone-400">Duels Created</div>
                      <div className="text-yellow-500 font-bold">{fighter.duelsCreated}</div>
                    </div>
                    <div>
                      <div className="text-stone-400">Acceptance</div>
                      <div className="text-green-400 font-medium">{(fighter.acceptanceRate * 100).toFixed(0)}%</div>
                    </div>
                    <div>
                      <div className="text-stone-400">Total Wager</div>
                      <div className="text-amber-500 font-bold">{fighter.totalWager.toFixed(1)} ETH</div>
                    </div>
                  </div>
                </div>
                
                {/* Battle map with battle flag pins */}
                <div className="ml-4 relative">
                  {/* Circular battle map */}
                  <div className="w-16 h-16 rounded-full bg-amber-900/20 border border-amber-700/30 relative">
                    {/* Battle pins - dynamically positioned based on duel count */}
                    {Array.from({ length: 5 }).map((_, i) => {
                      // Create unique positions for pins
                      const angle = (i / 5) * Math.PI * 2;
                      const radius = 6;
                      const x = 8 + radius * Math.cos(angle);
                      const y = 8 + radius * Math.sin(angle);
                      
                      return (
                        <div
                          key={`${fighter.id}-pin-${i}`}
                          className="absolute w-1.5 h-1.5 rounded-full bg-red-500"
                          style={{
                            left: `${50 + x}%`,
                            top: `${50 + y}%`,
                            transform: 'translate(-50%, -50%)',
                          }}
                        />
                      );
                    })}
                    
                    {/* Custom battle indicators based on fighter stats */}
                    <div 
                      className="absolute w-2 h-2 rounded-full bg-yellow-500"
                      style={{
                        left: '30%',
                        top: '60%',
                      }}
                    />
                    
                    <div 
                      className="absolute w-2 h-2 rounded-full bg-green-500"
                      style={{
                        left: '70%',
                        top: '40%',
                      }}
                    />
                    
                    {/* Battle line connections */}
                    <svg 
                      className="absolute inset-0 w-full h-full" 
                      viewBox="0 0 100 100"
                      aria-hidden="true"
                    >
                      <path 
                        d="M30,60 L50,50 L70,40" 
                        stroke="#a87c4f" 
                        strokeWidth="1"
                        fill="none"
                      />
                      <path 
                        d="M50,50 L50,85" 
                        stroke="#a87c4f" 
                        strokeWidth="1"
                        fill="none" 
                        strokeDasharray="2,2"
                      />
                    </svg>
                    
                    {/* Emblematic symbol in center */}
                    <div className="absolute inset-0 flex items-center justify-center text-amber-500 font-bold">
                      {fighter.fullName.charAt(0)}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Highlight marker for top 3 */}
              {index < 3 && (
                <div className={`absolute top-0 left-0 w-1 h-full ${
                  index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-slate-300' : 'bg-amber-700'
                }`} />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
} 