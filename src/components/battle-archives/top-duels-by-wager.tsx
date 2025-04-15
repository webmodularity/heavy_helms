"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Coins, Flame, TrendingUp, DollarSign } from "lucide-react";

interface Fighter {
  id: string;
  fullName: string;
}

interface Duel {
  id: string;
  blockTimestamp: string;
  winnerId: string;
  wagerAmount: string;
  challenger: Fighter;
  defender: Fighter;
}

// Mock data for development
const mockDuels: Duel[] = [
  {
    id: "0xabc123def456ghi789jkl012mno345pqr678stu901vwx234yz",
    blockTimestamp: "1629123456",
    winnerId: "2",
    wagerAmount: "12.5",
    challenger: {
      id: "1",
      fullName: "Uther Pendragon",
    },
    defender: {
      id: "2",
      fullName: "Sir Mordred",
    },
  },
  {
    id: "0xbcd234efg567hij890klm123nop456qrs789tuv012wxy345z",
    blockTimestamp: "1629122456",
    winnerId: "4",
    wagerAmount: "10.2",
    challenger: {
      id: "3",
      fullName: "King Arthur",
    },
    defender: {
      id: "4",
      fullName: "Merlin the Wise",
    },
  },
  {
    id: "0xcde345fgh678ijk901lmn234opq567rst890uvw123xyz456",
    blockTimestamp: "1629121456",
    winnerId: "5",
    wagerAmount: "8.75",
    challenger: {
      id: "5",
      fullName: "Sir Percival",
    },
    defender: {
      id: "6",
      fullName: "Queen Guinevere",
    },
  },
  {
    id: "0xdef456ghi789jkl012mno345pqr678stu901vwx234yza123",
    blockTimestamp: "1629120456",
    winnerId: "7",
    wagerAmount: "7.3",
    challenger: {
      id: "7",
      fullName: "Sir Lancelot",
    },
    defender: {
      id: "8",
      fullName: "Sir Gawain",
    },
  },
  {
    id: "0xefg567hij890klm123nop456qrs789tuv012wxy345zab234",
    blockTimestamp: "1629119456",
    winnerId: "10",
    wagerAmount: "5.6",
    challenger: {
      id: "9",
      fullName: "Sir Galahad",
    },
    defender: {
      id: "10",
      fullName: "The Green Knight",
    },
  },
  {
    id: "0xfgh678ijk901lmn234opq567rst890uvw123xyz456abc345",
    blockTimestamp: "1629118456",
    winnerId: "12",
    wagerAmount: "4.9",
    challenger: {
      id: "11",
      fullName: "Morgana le Fay",
    },
    defender: {
      id: "12",
      fullName: "Nimue",
    },
  },
  {
    id: "0xghi789jkl012mno345pqr678stu901vwx234yzab123cde456",
    blockTimestamp: "1629117456",
    winnerId: "13",
    wagerAmount: "4.2",
    challenger: {
      id: "13",
      fullName: "Sir Tristan",
    },
    defender: {
      id: "14",
      fullName: "Lady Isolde",
    },
  },
  {
    id: "0xhij890klm123nop456qrs789tuv012wxy345zab234cde567",
    blockTimestamp: "1629116456",
    winnerId: "16",
    wagerAmount: "3.8",
    challenger: {
      id: "15",
      fullName: "Sir Kay",
    },
    defender: {
      id: "16",
      fullName: "King Mark",
    },
  },
  {
    id: "0xijk901lmn234opq567rst890uvw123xyz456abc345def678",
    blockTimestamp: "1629115456",
    winnerId: "18",
    wagerAmount: "3.5",
    challenger: {
      id: "17",
      fullName: "Sir Bors",
    },
    defender: {
      id: "18",
      fullName: "Sir Gareth",
    },
  },
  {
    id: "0xjkl012mno345pqr678stu901vwx234yza123bcd456efg789",
    blockTimestamp: "1629114456",
    winnerId: "19",
    wagerAmount: "3.1",
    challenger: {
      id: "19",
      fullName: "Lady Elaine",
    },
    defender: {
      id: "20",
      fullName: "Sir Bedivere",
    },
  },
];

export function TopDuelsByWager() {
  const [duels] = useState<Duel[]>(mockDuels);

  // Format timestamp to a readable date
  const formatDate = (timestamp: string) => {
    const date = new Date(Number.parseInt(timestamp, 10) * 1000);
    return date.toLocaleDateString();
  };

  // Function to calculate coin pile height based on wager amount
  const getCoinHeight = (wagerAmount: string) => {
    const amount = Number.parseFloat(wagerAmount);
    const maxValue = Math.max(...duels.map(d => Number.parseFloat(d.wagerAmount)));
    const minHeight = 15; // Minimum height in pixels
    const maxHeight = 60; // Maximum height in pixels
    
    return minHeight + (amount / maxValue) * (maxHeight - minHeight);
  };

  return (
    <div className="bg-stone-900 border border-yellow-600/20 rounded-lg overflow-hidden h-full">
      <div className="p-4 bg-gradient-to-r from-amber-900/50 to-stone-900 border-b border-yellow-600/20 flex items-center justify-between">
        <div className="flex items-center">
          <Coins className="h-5 w-5 text-yellow-500 mr-2" />
          <h2 className="text-xl font-bold text-yellow-400">Top Duels By Wager</h2>
        </div>
        <span className="text-sm text-stone-400 flex items-center">
          <Flame className="h-4 w-4 mr-1" /> Highest stakes battles
        </span>
      </div>
      
      <div className="p-4">
        {/* Treasure chest header */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-500 to-yellow-300">
            Treasure Vault
          </h3>
          <div className="text-sm text-amber-600/70 italic mt-1">
            The most valuable contests in the realm
          </div>
        </div>
        
        {/* Duels grid */}
        <div className="grid grid-cols-1 gap-4">
          {duels.map((duel, index) => {
            const winner = duel.winnerId === duel.challenger.id ? duel.challenger : duel.defender;
            const loser = duel.winnerId === duel.challenger.id ? duel.defender : duel.challenger;
            const coinHeight = getCoinHeight(duel.wagerAmount);
            
            return (
              <motion.div
                key={duel.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center p-3 rounded-lg ${
                  index === 0 
                    ? 'bg-gradient-to-r from-amber-900/30 to-amber-800/20 border border-yellow-600/40' 
                    : 'bg-stone-800/30 hover:bg-amber-900/10 border border-yellow-700/10'
                }`}
              >
                {/* Rank */}
                <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                  index < 3 
                    ? 'bg-gradient-to-br from-amber-400 to-amber-700 text-stone-900' 
                    : 'bg-stone-700 text-stone-300'
                } font-bold text-sm mr-3`}>
                  {index + 1}
                </div>
                
                {/* Coin stack visualization */}
                <div className="relative h-16 flex items-end mr-4">
                  {/* Coin pile 1 */}
                  <div 
                    className="w-8 absolute bottom-0 left-0 z-10 rounded-full bg-gradient-to-b from-yellow-300 to-yellow-600"
                    style={{ height: `${coinHeight}px` }}
                  >
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-yellow-900 font-bold text-xs">
                      {index === 0 && <DollarSign className="h-3 w-3" />}
                    </div>
                  </div>
                  
                  {/* Coin pile 2 (slightly offset) */}
                  <div 
                    className="w-8 absolute bottom-0 left-2 rounded-full bg-gradient-to-b from-amber-400 to-amber-700"
                    style={{ height: `${coinHeight * 0.8}px` }}
                  />
                  
                  {/* Coin pile 3 (slightly offset) */}
                  <div 
                    className="w-8 absolute bottom-0 left-4 rounded-full bg-gradient-to-b from-yellow-400 to-amber-600"
                    style={{ height: `${coinHeight * 0.6}px` }}
                  />
                </div>
                
                {/* Duel info */}
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-amber-200 font-semibold">
                        {winner.fullName} <span className="text-stone-500">vs</span> {loser.fullName}
                      </div>
                      <div className="text-xs text-stone-500">
                        {formatDate(duel.blockTimestamp)}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-green-500 font-bold flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {duel.wagerAmount} ETH
                      </div>
                      <div className="text-xs text-stone-500">
                        Winner: {winner.fullName}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 