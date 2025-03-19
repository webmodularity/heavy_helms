"use client";

import { useState } from "react";
import { parseEther } from "viem";
import { YellowButton } from "@/components/ui/yellow-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import type { Character } from "@/types/player.types";
import { useCreateChallenge } from "@/hooks/use-create-challenge";

// This is a placeholder - replace with your actual contract address
const DUEL_GAME_CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_DUEL_GAME_ADDRESS as `0x${string}`;

interface CreateChallengeFormProps {
  character: Character;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateChallengeForm({
  character,
  onSuccess,
  onCancel,
}: CreateChallengeFormProps) {
  const [defenderId, setDefenderId] = useState<string>("");
  const [wagerAmount, setWagerAmount] = useState<string>("0.01");

  const { createChallenge, isCreatingChallenge, error } = useCreateChallenge();

  // Validate inputs
  const isValidDefenderId =
    defenderId.trim() !== "" && !Number.isNaN(Number(defenderId));
  const isValidWager =
    wagerAmount.trim() !== "" &&
    !Number.isNaN(Number.parseFloat(wagerAmount)) &&
    Number.parseFloat(wagerAmount) > 0;

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isValidDefenderId && isValidWager) {
      await createChallenge({
        character,
        defenderId: Number.parseInt(defenderId, 10),
        wagerAmount,
      });

      // If successfully created, call onSuccess
      if (!error && onSuccess) {
        onSuccess();
      }
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-4 bg-gradient-to-b from-amber-900/10 to-stone-900/40 rounded-lg border border-yellow-600/20 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-xl font-bold text-yellow-400 mb-4">
        Create Challenge
      </h2>

      <div className="space-y-2">
        <Label htmlFor="defenderId" className="text-stone-300">
          Defender ID
        </Label>
        <Input
          id="defenderId"
          type="number"
          value={defenderId}
          onChange={(e) => setDefenderId(e.target.value)}
          className="bg-stone-900/50 border-yellow-600/20 focus:border-yellow-500 text-stone-200"
          placeholder="Enter defender ID"
        />
        {!isValidDefenderId && defenderId !== "" && (
          <p className="text-red-400 text-sm">
            Please enter a valid defender ID
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="wagerAmount" className="text-stone-300">
          Wager Amount (ETH)
        </Label>
        <Input
          id="wagerAmount"
          type="text"
          value={wagerAmount}
          onChange={(e) => setWagerAmount(e.target.value)}
          className="bg-stone-900/50 border-yellow-600/20 focus:border-yellow-500 text-stone-200"
          placeholder="Enter wager amount in ETH"
        />
        {!isValidWager && wagerAmount !== "" && (
          <p className="text-red-400 text-sm">
            Please enter a valid wager amount
          </p>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-400 text-sm">
          {(error instanceof Error ? error.message : "An error occurred").slice(
            0,
            100,
          )}
          ...
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <YellowButton
          type="submit"
          disabled={!isValidDefenderId || !isValidWager || isCreatingChallenge}
          className="w-full"
        >
          {isCreatingChallenge ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
            </>
          ) : (
            "Create Challenge"
          )}
        </YellowButton>

        {onCancel && (
          <YellowButton
            type="button"
            variant="outline"
            onClick={onCancel}
            className="w-full"
          >
            Cancel
          </YellowButton>
        )}
      </div>
    </motion.form>
  );
}
