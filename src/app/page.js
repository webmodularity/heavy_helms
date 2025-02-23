'use client'

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from 'react'
import CharacterCard from '../components/CharacterCard'

const characters = [
  // Default Warrior
  {
    playerId: "1",
    name: "Ivan the Resolute",
    imageUrl: "https://ipfs.io/ipfs/bafkreiccuy7nxgoo453f22rf4hiflue24geyaaq7lf3ylvjl34cj2sv6ja",
    stance: "defensive",
    weapon: "Mace + Shield",
    armor: "Plate",
    strength: 14,
    dexterity: 10,
    constitution: 16,
    intelligence: 8,
    wisdom: 12,
    charisma: 10
  },
  // Agile Rogue
  {
    playerId: "2",
    name: "Leo of the Light",
    imageUrl: "https://ipfs.io/ipfs/bafkreic6chur5etni3aeuno5zwghxusxaapd54agk5nkswoh4tlr67rsci",
    stance: "balanced",
    weapon: "Daggers",
    armor: "Leather",
    strength: 10,
    dexterity: 16,
    constitution: 12,
    intelligence: 12,
    wisdom: 10,
    charisma: 14
  },
  // Battle Cleric
  {
    playerId: "3",
    name: "Gwen Dragonheart",
    imageUrl: "https://ipfs.io/ipfs/QmVDwPFpLd1yvJpQSyazFHfe9Q4U1i872caUX2uQvt4zWd",
    stance: "offensive",
    weapon: "Mace + Shield",
    armor: "Chain",
    strength: 12,
    dexterity: 10,
    constitution: 14,
    intelligence: 10,
    wisdom: 16,
    charisma: 12
  }
];

export default function Home() {
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

  return (
    <div className="min-h-screen w-full overflow-y-auto">
      {/* Background with reduced opacity */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/parchment_bkg6.jpg"
          alt="Background"
          fill
          className="object-cover opacity-25 object-top"
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
            <Link 
              href={selectedPlayerId !== null ? `/game?player1Id=${selectedPlayerId}&player2Id=7` : '#'}
              className={`play-game-button px-6 py-3 rounded-full text-center text-lg transition-all ${
                selectedPlayerId !== null 
                  ? 'bg-foreground text-background hover:bg-[#383838] cursor-pointer' 
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
              onClick={(e) => {
                if (selectedPlayerId === null) {
                  e.preventDefault();
                }
              }}
            >
              {selectedPlayerId !== null ? 'Play Game' : 'Select a Character'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}