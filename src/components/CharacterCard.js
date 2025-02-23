import React from 'react';
import Image from 'next/image';
import { Bokor } from 'next/font/google';

const bokor = Bokor({ 
  weight: '400',
  subsets: ['latin'] 
});

const CharacterCard = ({ 
  playerId = "1",
  name = "Ivan the Resolute",
  imageUrl = "https://ipfs.io/ipfs/bafkreiccuy7nxgoo453f22rf4hiflue24geyaaq7lf3ylvjl34cj2sv6ja",
  stance = "defensive",
  weapon = "Mace + Shield",
  armor = "Plate",
  strength = 10,
  constitution = 10,
  size = 10,
  agility = 10,
  stamina = 10,
  luck = 10,
  isSelected = false,
  onSelect = () => {}
}) => {
  // Define stance styles
  const stanceStyles = {
    offensive: "text-red-400",
    defensive: "text-green-400",
    balanced: "text-blue-400"
  };

  // Define weapon icons (using unicode symbols)
  const getWeaponIcon = (weapon) => {
    if (weapon.toLowerCase().includes('shield')) return '🛡️';
    if (weapon.toLowerCase().includes('dagger')) return '🗡️';
    if (weapon.toLowerCase().includes('mace')) return '🔨';
    return '⚔️';
  };

  // Define armor icons
  const getArmorIcon = (armor) => {
    if (armor.toLowerCase().includes('plate')) return '🛡️';
    if (armor.toLowerCase().includes('chain')) return '⛓️';
    if (armor.toLowerCase().includes('leather')) return '🦊';
    return '👕';
  };

  const handleClick = () => {
    onSelect(!isSelected);
  };

  return (
    <div className="w-80 mx-auto">
      {/* Card Container */}
      <div 
        className={`
          relative rounded-lg overflow-hidden
          bg-gradient-to-b from-slate-900 to-slate-800
          shadow-[0_0_15px_rgba(0,0,0,0.3)] cursor-pointer
          transition-all duration-300 ease-out
          transform-gpu border-8 border-slate-700/50
          ${isSelected ? 'ring-4 ring-yellow-400/50 scale-[1.02] shadow-[0_0_25px_rgba(250,204,21,0.3)]' : ''}
          hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(0,0,0,0.4)]
        `}
        onClick={handleClick}
      >
        {/* Name Banner */}
        <div className="relative z-10 w-full bg-gradient-to-r from-slate-950/95 via-slate-900/95 to-slate-950/95 text-white py-4 px-4 border-b border-slate-700/50 shadow-[inset_0_-10px_20px_-5px_rgba(0,0,0,0.3)]">
          <h3 className={`text-center font-normal text-2xl tracking-wide ${bokor.className} whitespace-nowrap overflow-hidden text-ellipsis drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-yellow-50/95`}>{name}</h3>
        </div>

        {/* Character Image Container */}
        <div className="relative w-full h-[340px] bg-gradient-to-b from-slate-800 to-slate-900 shadow-[inset_0_0_40px_rgba(0,0,0,0.2)]">
          <div className="absolute inset-x-0 top-2 bottom-[-5px]">
            <Image 
              src={imageUrl}
              alt={name}
              fill
              sizes="320px"
              priority
              className="object-contain object-bottom drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] scale-105 z-0"
              onError={(e) => {
                console.error('Image failed to load:', imageUrl);
                e.target.style.display = 'none';
              }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="relative z-10 flex justify-center items-center px-2 py-2.5 bg-gradient-to-b from-slate-900 to-slate-950 text-white border-t border-slate-700/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
          <div className="flex items-center justify-center gap-0">
            <div className="text-center w-[46px]">
              <span className="font-medium text-slate-400 text-xs tracking-wider block">STR</span>
              <p className="text-sm font-semibold text-yellow-50/90">{strength}</p>
            </div>
            <div className="w-[1px] h-8 bg-slate-700/20 mx-[1px]"></div>
            <div className="text-center w-[46px]">
              <span className="font-medium text-slate-400 text-xs tracking-wider block">CON</span>
              <p className="text-sm font-semibold text-yellow-50/90">{constitution}</p>
            </div>
            <div className="w-[1px] h-8 bg-slate-700/20 mx-[1px]"></div>
            <div className="text-center w-[46px]">
              <span className="font-medium text-slate-400 text-xs tracking-wider block">SIZ</span>
              <p className="text-sm font-semibold text-yellow-50/90">{size}</p>
            </div>
            <div className="w-[1px] h-8 bg-slate-700/20 mx-[1px]"></div>
            <div className="text-center w-[46px]">
              <span className="font-medium text-slate-400 text-xs tracking-wider block">AGI</span>
              <p className="text-sm font-semibold text-yellow-50/90">{agility}</p>
            </div>
            <div className="w-[1px] h-8 bg-slate-700/20 mx-[1px]"></div>
            <div className="text-center w-[46px]">
              <span className="font-medium text-slate-400 text-xs tracking-wider block">STA</span>
              <p className="text-sm font-semibold text-yellow-50/90">{stamina}</p>
            </div>
            <div className="w-[1px] h-8 bg-slate-700/20 mx-[1px]"></div>
            <div className="text-center w-[46px]">
              <span className="font-medium text-slate-400 text-xs tracking-wider block">LCK</span>
              <p className="text-sm font-semibold text-yellow-50/90">{luck}</p>
            </div>
          </div>
        </div>

        {/* Equipment Section */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white py-3 px-4 border-t border-slate-700/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
          <div className="grid grid-cols-2 divide-x divide-slate-600/50">
            <div className="text-center px-2">
              <span className="text-slate-400 text-xs uppercase tracking-wider block mb-1">Weapon</span>
              <p className="text-sm font-semibold tracking-wide text-yellow-50/95 truncate">{weapon}</p>
            </div>
            <div className="text-center px-2">
              <span className="text-slate-400 text-xs uppercase tracking-wider block mb-1">Armor</span>
              <p className="text-sm font-semibold tracking-wide text-yellow-50/95 truncate">{armor}</p>
            </div>
          </div>
        </div>

        {/* Stance Footer */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white py-2.5 px-4 border-t border-slate-700/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
          <p className={`text-center text-sm font-bold tracking-[0.2em] uppercase ${stanceStyles[stance]} drop-shadow-[0_0_3px_rgba(255,255,255,0.2)]`}>
            {stance} Stance
          </p>
        </div>

        {/* Selection Indicator */}
        {isSelected && (
          <div className="absolute inset-0 bg-slate-700/40 pointer-events-none" />
        )}
      </div>
    </div>
  );
};

export default CharacterCard;