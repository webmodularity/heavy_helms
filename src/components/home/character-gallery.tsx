// src/components/home/character-gallery.tsx
"use client";
import type { Character } from "@/types/player.types";
import { usePrivy } from "@privy-io/react-auth";
import { motion } from "framer-motion";
import CharacterCard from "../CharacterCard";
import { CTAButton as CTAButtonComponent } from "../ui/cta-button";
interface CharacterGalleryProps {
  characters: Character[];
}

export function CharacterGallery({ characters }: CharacterGalleryProps) {
  return (
    <section className="relative py-12">
      {/* Decorative borders and background */}
      <BorderDecoration />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600 uppercase tracking-widest mb-1">
              Forge Your Legend
            </h2>
            <div className="flex items-center justify-center mb-3">
              <div className="h-[1px] w-16 bg-yellow-600/40" />
              <div className="mx-4">
                <span className="text-yellow-400/90 text-sm font-medium tracking-widest">
                  WARRIORS AWAIT
                </span>
              </div>
              <div className="h-[1px] w-16 bg-yellow-600/40" />
            </div>
            <p className="text-stone-200 text-base max-w-2xl mx-auto leading-relaxed">
              Ancient warriors, blessed by forgotten gods, stand ready for your
              command. Choose wisely, for your destiny in the Heavy Helms arena
              is bound to theirs.
            </p>
          </motion.div>
        </div>

        {/* Character Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map((character, index) => (
            <motion.div
              key={character.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="transform transition-transform hover:scale-[1.02]"
            >
              <CharacterCard
                name={character.name}
                imageUrl={character.imageUrl}
                stance={character.stance}
                weapon={character.weapon}
                armor={character.armor}
                strength={character.strength}
                constitution={character.constitution}
                size={character.size}
                agility={character.agility}
                stamina={character.stamina}
                luck={character.luck}
                onSelect={() => {}}
              />
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-10 text-center">
          <CTAButton />
          <p className="text-stone-400 text-xs mt-2 italic">
            Connect wallet to enter the arena
          </p>
        </div>
      </div>
    </section>
  );
}

function CTAButton() {
  const { login } = usePrivy();
  return (
    <CTAButtonComponent
      onClick={() => login()}
      title="Claim Your Destiny"
      size="lg"
    />
  );
}

// Component for decorative borders and corner elements
function BorderDecoration() {
  return (
    <>
      {/* Dark overlay with textured base */}
      <div className="absolute inset-0 bg-stone-900/80" />

      {/* Inner glow effect */}
      <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(30,20,10,0.8)]" />

      {/* Decorative top border */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-700/30 via-yellow-500/50 to-amber-700/30" />
      <div className="absolute top-1 left-0 w-full h-3 bg-gradient-to-r from-amber-800/20 via-yellow-600/30 to-amber-800/20" />
      <div className="absolute top-4 left-0 w-full h-0.5 bg-amber-600/10" />

      {/* Decorative bottom border */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-amber-700/30 via-yellow-500/50 to-amber-700/30" />
      <div className="absolute bottom-1 left-0 w-full h-3 bg-gradient-to-r from-amber-800/20 via-yellow-600/30 to-amber-800/20" />
      <div className="absolute bottom-4 left-0 w-full h-0.5 bg-amber-600/10" />

      {/* Decorative corner elements - top left */}
      <div className="absolute top-0 left-0 w-20 h-20 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[2px] h-16 bg-gradient-to-b from-yellow-500/70 to-transparent" />
        <div className="absolute top-0 left-0 h-[2px] w-16 bg-gradient-to-r from-yellow-500/70 to-transparent" />
        <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-yellow-500/30 rounded-tl-sm" />
        <div className="absolute top-3 left-3 w-6 h-6 border-t border-l border-yellow-600/20 rounded-tl-sm" />
      </div>

      {/* Decorative corner elements - top right */}
      <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[2px] h-16 bg-gradient-to-b from-yellow-500/70 to-transparent" />
        <div className="absolute top-0 right-0 h-[2px] w-16 bg-gradient-to-r from-transparent to-yellow-500/70" />
        <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-yellow-500/30 rounded-tr-sm" />
        <div className="absolute top-3 right-3 w-6 h-6 border-t border-r border-yellow-600/20 rounded-tr-sm" />
      </div>

      {/* Decorative corner elements - bottom left */}
      <div className="absolute bottom-0 left-0 w-20 h-20 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-0 w-[2px] h-16 bg-gradient-to-t from-yellow-500/70 to-transparent" />
        <div className="absolute bottom-0 left-0 h-[2px] w-16 bg-gradient-to-r from-yellow-500/70 to-transparent" />
        <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-yellow-500/30 rounded-bl-sm" />
        <div className="absolute bottom-3 left-3 w-6 h-6 border-b border-l border-yellow-600/20 rounded-bl-sm" />
      </div>

      {/* Decorative corner elements - bottom right */}
      <div className="absolute bottom-0 right-0 w-20 h-20 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 right-0 w-[2px] h-16 bg-gradient-to-t from-yellow-500/70 to-transparent" />
        <div className="absolute bottom-0 right-0 h-[2px] w-16 bg-gradient-to-r from-transparent to-yellow-500/70" />
        <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-yellow-500/30 rounded-br-sm" />
        <div className="absolute bottom-3 right-3 w-6 h-6 border-b border-r border-yellow-600/20 rounded-br-sm" />
      </div>
    </>
  );
}
