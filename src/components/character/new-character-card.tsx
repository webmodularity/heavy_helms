"use client";

import { motion } from "framer-motion";
import { PlusIcon } from "lucide-react";

interface NewCharacterCardProps {
  delay: number;
  onClick: () => void;
  isCreating: boolean;
  txHash: string | null;
}

export function NewCharacterCard({
  delay,
  onClick,
  isCreating,
  txHash,
}: NewCharacterCardProps) {
  return (
    <motion.div
      className={`relative rounded-lg overflow-hidden border-2 border-dashed border-yellow-700/40 bg-gradient-to-b from-black/30 to-black/10 flex flex-col justify-center items-center p-5 h-[320px] cursor-pointer transition-colors hover:bg-black/20 hover:border-yellow-700/60 ${
        isCreating ? "pointer-events-none" : ""
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      onClick={isCreating ? undefined : onClick}
    >
      {isCreating ? (
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-t-2 border-yellow-500 animate-spin" />
            <div className="absolute inset-2 rounded-full border-t-2 border-yellow-300 animate-spin-slow" />
          </div>
          <p className="text-yellow-400 font-medium mt-2 text-center">
            {txHash ? "Creating character..." : "Confirming transaction..."}
          </p>
          {txHash && (
            <a
              href={`https://sepolia.basescan.org/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 underline mt-1"
              onClick={(e) => e.stopPropagation()}
            >
              View in explorer
            </a>
          )}
        </div>
      ) : (
        <>
          <div className="rounded-full bg-yellow-800/20 p-3">
            <PlusIcon className="h-10 w-10 text-yellow-600" strokeWidth={1.5} />
          </div>
          <h3 className="mt-4 text-lg font-medium text-yellow-500">
            Create New Character
          </h3>
          <p className="mt-1 text-sm text-center text-zinc-400">
            Create a new character to join the battle.
          </p>
          <div className="mt-4 text-xs text-zinc-500">0.001 ETH</div>
        </>
      )}
    </motion.div>
  );
}
