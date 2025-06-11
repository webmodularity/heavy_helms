"use client";

import { useState } from "react";
import { parseEther } from "viem";
import { YellowButton } from "@/components/ui/yellow-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Loader2, Search, User } from "lucide-react";
import type { Player } from "@/types/player.types";
import { useCreateChallenge } from "@/hooks/use-create-challenge";
import { SelectChallengerModal } from "@/components/dialogs/select-challenger-modal";
import Image from "next/image";
import type { Fighter } from "@/types/fighter-types";
import { useSkinMetadata } from "@/hooks/use-skin-metadata";

interface CreateChallengeFormProps {
  character: Player;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateChallengeForm({
  character,
  onSuccess,
  onCancel,
}: CreateChallengeFormProps) {
  const [defenderId, setDefenderId] = useState<string>("");
  const [selectedChallenger, setSelectedChallenger] = useState<Fighter | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { createChallenge, isCreatingChallenge, error } = useCreateChallenge();

  // Load challenger image from metadata
  const { data: skinMetadata } = useSkinMetadata(
    selectedChallenger?.currentSkin?.metadataURI,
  );
  const challengerImageUrl = skinMetadata?.imageUrl || "/placeholder-skin.jpg";

  // Validate inputs
  const isValidDefenderId =
    defenderId.trim() !== "" && !Number.isNaN(Number(defenderId));

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isValidDefenderId || selectedChallenger) {
      await createChallenge({
        character,
        defenderId: selectedChallenger
          ? Number(selectedChallenger.id)
          : Number.parseInt(defenderId, 10),
        wagerAmount: "0",
      });

      // If successfully created, call onSuccess
      if (!error && onSuccess) {
        onSuccess();
      }
    }
  };

  // Handle selecting a challenger from the modal
  const handleSelectChallenger = (player: Fighter) => {
    setSelectedChallenger(player);
    setDefenderId(player.id);
  };

  return (
    <>
      <motion.form
        onSubmit={handleSubmit}
        className="space-y-4 bg-gradient-to-b from-amber-900/10 to-stone-900/40 rounded-lg border border-yellow-600/20 p-6 h-full flex flex-col justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-yellow-400 mb-4">
            Create Challenge
          </h2>

          {/* Defender Selection */}
          <div className="space-y-2">
            <Label htmlFor="defenderId" className="text-stone-300">
              Challenger
            </Label>

            {selectedChallenger ? (
              <div className="flex items-center space-x-3 p-2 border border-yellow-600/20 rounded-md bg-stone-900/50">
                <div className="h-10 w-10 rounded-full overflow-hidden bg-stone-800 relative">
                  <Image
                    src={challengerImageUrl}
                    alt={selectedChallenger.fullName || ""}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-stone-200">
                    {selectedChallenger.fullName}
                  </h4>
                  <p className="text-xs text-stone-400">
                    ID: {selectedChallenger.id} • W: {selectedChallenger.wins} /
                    L: {selectedChallenger.losses}
                  </p>
                </div>
                <YellowButton
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setIsModalOpen(true)}
                >
                  Change
                </YellowButton>
              </div>
            ) : (
              <div className="grid grid-cols-5 gap-2">
                <div className="relative col-span-4">
                  <Input
                    id="defenderId"
                    type="number"
                    value={defenderId}
                    onChange={(e) => setDefenderId(e.target.value)}
                    className="bg-stone-900/50 border-yellow-600/20 focus:border-yellow-500 text-stone-200 pl-10"
                    placeholder="Enter defender ID"
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
                </div>
                <YellowButton
                  type="button"
                  // className="col-span-1"
                  onClick={() => setIsModalOpen(true)}
                >
                  <div className="flex items-center gap-1">
                    <Search className="h-4 w-4" />
                    {/* Find */}
                  </div>
                </YellowButton>
              </div>
            )}

            {!isValidDefenderId && defenderId !== "" && !selectedChallenger && (
              <p className="text-red-400 text-sm">
                Please enter a valid defender ID or select a challenger
              </p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-400 text-sm">
              {(error instanceof Error
                ? error.message
                : "An error occurred"
              ).slice(0, 100)}
              ...
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <YellowButton
            type="submit"
            disabled={
              (!isValidDefenderId && !selectedChallenger) || isCreatingChallenge
            }
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

      {/* Challenger Selection Modal */}
      <SelectChallengerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectPlayer={handleSelectChallenger}
        currentPlayerId={character.id}
      />
    </>
  );
}
