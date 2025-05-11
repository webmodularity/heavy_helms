"use client";

import { motion } from "framer-motion";
import { PlusIcon } from "lucide-react";
import { useState } from "react";

type NamePreference = 'male' | 'female';

interface NewCharacterCardProps {
  delay: number;
  onClick: (namePreference: NamePreference) => void;
  isCreating: boolean;
  txHash: string | null;
}

export function NewCharacterCard({
  delay,
  onClick,
  isCreating,
  txHash,
}: NewCharacterCardProps) {
  const [selectedNamePreference, setSelectedNamePreference] = useState<NamePreference>('male');

  const handleCardClick = () => {
    if (!isCreating) {
      onClick(selectedNamePreference);
    }
  };

  return (
    <motion.div
      className={`min-w-[210px] relative rounded-lg overflow-hidden border-2 border-dashed border-yellow-700/40 bg-gradient-to-b from-black/30 to-black/10 flex flex-col justify-center items-center p-3 h-auto aspect-[1/1.5] cursor-pointer transition-colors hover:bg-black/20 hover:border-yellow-700/60 snap-start ${
        isCreating ? "pointer-events-none opacity-70" : ""
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      onClick={handleCardClick}
    >
      {isCreating ? (
        <div className="flex flex-col items-center justify-center space-y-3 text-center">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-t-2 border-yellow-500 animate-spin" />
            <div className="absolute inset-2 rounded-full border-t-2 border-yellow-300 animate-spin-slow" />
          </div>
          <p className="text-yellow-400 font-medium text-xs text-center">
            {txHash ? "Creating character..." : "Confirming transaction..."}
          </p>
          {txHash && (
            <a
              href={`${process.env.NEXT_PUBLIC_EXPLORER_URL}/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-blue-400 hover:text-blue-300 underline"
              onClick={(e) => e.stopPropagation()}
            >
              View in explorer
            </a>
          )}
        </div>
      ) : (
        <>
          <div className="rounded-full bg-yellow-800/20 p-2 mb-2">
            <PlusIcon className="h-6 w-6 text-yellow-600" strokeWidth={1.5} />
          </div>
          <h3 className="text-sm font-medium text-yellow-500 text-center">
            Create New Character
          </h3>
          <p className="mt-1 text-xs text-center text-zinc-400">
            Create a new warrior to join the battle.
          </p>

          <fieldset
            className="mt-3 flex flex-col items-center space-y-1 border-none p-0 m-0 w-full"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              e.stopPropagation();
            }}
          >
            <legend className="text-[10px] text-zinc-500 mb-1 text-center">Name Preference</legend>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setSelectedNamePreference('male')}
                className={`px-2 py-0.5 text-[10px] rounded ${
                  selectedNamePreference === 'male' 
                    ? 'bg-yellow-600/80 hover:bg-yellow-600 text-black border border-yellow-600' 
                    : 'bg-transparent text-zinc-400 border border-zinc-600 hover:bg-zinc-800/50 hover:border-zinc-500'
                }`}
                aria-pressed={selectedNamePreference === 'male'}
              >
                Male
              </button>
              <button
                type="button"
                onClick={() => setSelectedNamePreference('female')}
                className={`px-2 py-0.5 text-[10px] rounded ${
                  selectedNamePreference === 'female' 
                    ? 'bg-yellow-600/80 hover:bg-yellow-600 text-black border border-yellow-600' 
                    : 'bg-transparent text-zinc-400 border border-zinc-600 hover:bg-zinc-800/50 hover:border-zinc-500'
                }`}
                aria-pressed={selectedNamePreference === 'female'}
              >
                Female
              </button>
            </div>
          </fieldset>

          <div className="mt-3 text-[10px] text-zinc-500">Cost: 0.002 ETH</div>
        </>
      )}
    </motion.div>
  );
}
