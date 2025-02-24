'use client'

import Link from "next/link"
import { useRouter } from 'next/navigation'
import Image from "next/image"
import { useState, useEffect } from 'react'
import CharacterCard from '../components/CharacterCard'

const characters = [
  // Default Warrior
  {
    playerId: "10001",
    name: "Cole the Majestic",
    imageUrl: "https://ipfs.io/ipfs/bafkreici37rg5rtnr4vsnjeprl5e7khjy2dse7y3ahwivxbsnde6o2x3sy",
    stance: "defensive",
    weapon: "Sword + Shield",
    armor: "Plate",
    strength: 14,
    constitution: 16,
    size: 10,
    agility: 10,
    stamina: 10,
    luck: 10
  },
  // Agile Rogue
  {
    playerId: "10002",
    name: "Oliver Skullcrusher",
    imageUrl: "https://ipfs.io/ipfs/QmZqrNGPB2ck2ECdhKZEFaJyVM1YtNDLrhmWN5CxvZTqr5",
    stance: "offensive",
    weapon: "Battleaxe",
    armor: "Leather",
    strength: 10,
    constitution: 12,
    size: 10,
    agility: 16,
    stamina: 12,
    luck: 10
  },
  // Battle Cleric
  {
    playerId: "10006",
    name: "Lyra of the Ancients",
    imageUrl: "https://ipfs.io/ipfs/QmaALMyYXwHuwu2EvDrLjkqFK9YigUb6RD9FX7MqVGoDkW",
    stance: "balanced",
    weapon: "Quarterstaff",
    armor: "Cloth",
    strength: 12,
    constitution: 14,
    size: 10,
    agility: 10,
    stamina: 14,
    luck: 10
  }
];

export default function Home() {
  const router = useRouter();
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside any character card AND not on the Play Game button
      const isOutsideClick = !event.target.closest('.character-card') && !event.target.closest('.play-game-button');
      if (isOutsideClick) {
        setSelectedPlayerId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (isSelected, character) => {
    setSelectedPlayerId(isSelected ? character.playerId : null);
  };

  const handlePlayClick = (e) => {
    e.preventDefault();
    if (selectedPlayerId === null) {
      return;
    }
    
    // Generate random opponent ID between 1 and 7
    let randomOpponentId = Math.floor(Math.random() * 7) + 1;
    // Reroll if we get the same ID as player 1
    while (randomOpponentId.toString() === selectedPlayerId) {
      randomOpponentId = Math.floor(Math.random() * 7) + 1;
    }
    
    // Navigate programmatically
    router.push(`/game?player1Id=${selectedPlayerId}&player2Id=${randomOpponentId}`);
  };

  return (
    <div className="min-h-screen w-full overflow-y-auto">
      {/* Background with reduced opacity */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/parchment_bkg6.jpg"
          alt="Background"
          fill
          className="object-cover opacity-30 object-top"
          priority
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="w-full flex justify-center p-4">
          <div className="w-full max-w-[960px]">
            <Image
              src="/hh_header5_no_bkg_small.png"
              alt="Heavy Helms Header"
              width={960}
              height={320}
              className="w-full opacity-75"
              priority
            />
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-4 pb-8">
          {/* Character Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
            {characters.map((character, index) => (
              <div key={index} className="character-card flex justify-center">
                <CharacterCard 
                  {...character}
                  isSelected={selectedPlayerId === character.playerId}
                  onSelect={(isSelected) => handleSelect(isSelected, character)}
                />
              </div>
            ))}
          </div>

          {/* Play Game Button */}
          <div className="flex justify-center">
            <button 
              className={`play-game-button px-6 py-3 rounded-full text-center text-lg transition-all ${
                selectedPlayerId !== null 
                  ? 'bg-foreground text-background hover:bg-[#383838] cursor-pointer' 
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
              onClick={handlePlayClick}
              disabled={selectedPlayerId === null}
            >
              {selectedPlayerId !== null ? 'Play Game' : 'Select a Character'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}