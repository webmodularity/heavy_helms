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
      <DialogContent className="bg-stone-900 border border-red-500/20 p-6 max-w-md">
        {txHash ? (
          <div className="text-center">
            <DialogHeader>
              <div className="flex items-center justify-center mb-4 text-yellow-500">
                <Trophy className="h-6 w-6 mr-2" />
                <DialogTitle className="text-xl font-bold">
                  Transaction Submitted
                </DialogTitle>
              </div>
            </DialogHeader>

            <p className="text-stone-300 mb-4">
              Your request to retire {characterName} has been submitted to the
              blockchain.
            </p>

            <a
              href={`${process.env.NEXT_PUBLIC_EXPLORER_URL}/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline mb-6 inline-block"
            >
              View transaction on ShapeScan
            </a>

            <p className="text-stone-400 text-sm mt-4">
              Please wait while the transaction is being processed. This dialog
              will close automatically upon completion.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center mb-4 text-red-500">
                <AlertOctagon className="h-6 w-6 mr-2" />
                <DialogTitle className="text-xl font-bold">
                  Confirm Retirement
                </DialogTitle>
              </div>
            </DialogHeader>

            <p className="text-stone-300 mb-6">
              Are you sure you want to retire{" "}
              <span className="text-yellow-400 font-semibold">
                {characterName}
              </span>
              ? This action cannot be undone, and your warrior will no longer be
              available for battles.
            </p>

            <DialogFooter>
              <div className="flex justify-end space-x-4 w-full">
                <Button
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  disabled={isRetiring}
                  className="font-bokor text-lg"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={onConfirm}
                  disabled={isRetiring}
                  className="bg-red-700 hover:bg-red-800 text-white font-bokor text-lg"
                >
                  {isRetiring ? "Retiring..." : "Confirm Retirement"}
                </Button>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
