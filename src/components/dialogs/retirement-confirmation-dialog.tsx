"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertOctagon, Trophy } from "lucide-react";
import { useEffect } from "react";

interface RetirementConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  characterName: string;
  onConfirm: () => Promise<void>;
  isRetiring: boolean;
  txHash: string | null;
}

export function RetirementConfirmationDialog({
  open,
  onOpenChange,
  characterName,
  onConfirm,
  isRetiring,
  txHash,
}: RetirementConfirmationDialogProps) {
  // Auto-close dialog when retirement is successful (txHash exists and isRetiring is false)
  useEffect(() => {
    if (txHash && !isRetiring) {
      const timer = setTimeout(() => {
        onOpenChange(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [txHash, isRetiring, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-stone-900 border border-red-500/20 p-3 sm:p-4 max-w-xs sm:max-w-sm">
        {txHash ? (
          <div className="text-center">
            <DialogHeader className="space-y-1">
              <div className="flex items-center justify-center text-yellow-500">
                <Trophy className="h-4 w-4 mr-1.5" />
                <DialogTitle className="text-base font-bold">
                  Transaction Submitted
                </DialogTitle>
              </div>
            </DialogHeader>

            <p className="text-stone-300 text-sm my-2">
              Your request to retire {characterName} has been submitted to the
              blockchain.
            </p>

            <a
              href={`${process.env.NEXT_PUBLIC_EXPLORER_URL}/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline text-xs inline-block"
            >
              View transaction on{" "}
              {process.env.NEXT_PUBLIC_ALCHEMY_NETWORK === "base-sepolia"
                ? "BaseSepoliaScan"
                : "ShapeScan"}
            </a>

            <p className="text-stone-400 text-xs mt-2">
              Please wait while the transaction is being processed.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader className="space-y-1">
              <div className="flex items-center text-red-500">
                <AlertOctagon className="h-4 w-4 mr-1.5" />
                <DialogTitle className="text-base font-bold">
                  Confirm Retirement
                </DialogTitle>
              </div>
            </DialogHeader>

            <p className="text-stone-300 text-sm my-2">
              Are you sure you want to retire{" "}
              <span className="text-yellow-400 font-semibold">
                {characterName}
              </span>
              ? This action cannot be undone.
            </p>

            <DialogFooter className="mt-2">
              <div className="flex justify-end space-x-2 w-full">
                <Button
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  disabled={isRetiring}
                  className="font-bokor text-sm h-8 px-3"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={onConfirm}
                  disabled={isRetiring}
                  className="bg-red-700 hover:bg-red-800 text-white font-bokor text-sm h-8 px-3"
                >
                  {isRetiring ? "Retiring..." : "Confirm"}
                </Button>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
