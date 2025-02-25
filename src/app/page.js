'use client'

import Link from "next/link"
import { useRouter } from 'next/navigation'
import Image from "next/image"
import { useState, useEffect } from 'react'
import CharacterCard from '../components/CharacterCard'
import InfoBanner from '../components/InfoBanner'

const characters = [
  {
    playerId: "10014",
    name: "Ross of the Glade",
    imageUrl: "https://ipfs.io/ipfs/bafkreici37rg5rtnr4vsnjeprl5e7khjy2dse7y3ahwivxbsnde6o2x3sy",
    stance: "defensive",
    weapon: "Sword + Shield",
    armor: "Plate",
    strength: 13,
    constitution: 16,
    size: 16,
    agility: 13,
    stamina: 7,
    luck: 7
  },
  {
    playerId: "10009",
    name: "Kate of the Ember",
    imageUrl: "https://ipfs.io/ipfs/QmaALMyYXwHuwu2EvDrLjkqFK9YigUb6RD9FX7MqVGoDkW",
    stance: "balanced",
    weapon: "Quarterstaff",
    armor: "Cloth",
    strength: 16,
    constitution: 12,
    size: 9,
    agility: 10,
    stamina: 16,
    luck: 9
  },
  {
    playerId: "10031",
    name: "Diego Frostcaller",
    imageUrl: "https://ipfs.io/ipfs/QmZqrNGPB2ck2ECdhKZEFaJyVM1YtNDLrhmWN5CxvZTqr5",
    stance: "offensive",
    weapon: "Battleaxe",
    armor: "Leather",
    strength: 16,
    constitution: 11,
    size: 13,
    agility: 9,
    stamina: 10,
    luck: 13
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
        <header className="w-full flex justify-center p-4 pb-0">
          <div className="w-full max-w-[960px]">
            <Image
              src="/heavy_helms_header_drop_shadow.png"
              alt="Heavy Helms Header"
              width={960}
              height={320}
              className="w-full opacity-75"
              priority
            />
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-4">
          {/* Welcome Message */}
          <InfoBanner className="mb-8">
          Choose your warrior from these three champions to enter battle. Each has unique stats and equipment that determine their fighting style. All combat actions execute directly on the blockchain. Select a character to begin.
          </InfoBanner>

          {/* Character Grid */}
          <div className="w-full max-w-[960px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
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
            <button 
              className={`play-game-button relative px-12 py-4 text-center text-xl font-bokor transition-all
                bg-[url('/ui/Button_RL_Background.png')] hover:bg-[url('/ui/Button_RL_Hover.png')] 
                bg-[length:100%_100%] bg-no-repeat bg-center w-full
                ${selectedPlayerId !== null 
                  ? 'cursor-pointer hover:scale-[1.02]' 
                  : 'opacity-50 cursor-not-allowed'
                }`}
              onClick={handlePlayClick}
              disabled={selectedPlayerId === null}
            >
              <span className="relative text-stone-100 group-hover:text-white drop-shadow-[0_2px_1px_rgba(0,0,0,0.5)]">
                {selectedPlayerId !== null ? 'Play Game' : 'Select a Character'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}