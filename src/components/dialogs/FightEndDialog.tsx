"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CompactDialogHeader } from "../ui/compact/CompactDialogHeader";
import { useFarcaster } from "@/store/farcaster-context";
import { toast } from "sonner";

interface FightEndDialogProps {
  isOpen: boolean;
  onClose: () => void;
  winnerName?: string;
  loserName?: string;
  fightId?: string;
  onReturnToMenu: () => void;
}

export function FightEndDialog({
  isOpen,
  onClose,
  winnerName,
  loserName,
  fightId,
  onReturnToMenu,
}: FightEndDialogProps) {
  const { composeCast } = useFarcaster();

  const handleReturnToMenu = () => {
    onClose();
    onReturnToMenu();
  };

  const handleShareToFarcaster = async () => {
    if (!winnerName || !loserName) {
      toast.error("Cannot share: Missing winner, loser, or fight ID.");
      console.error("Share error: Missing winnerName, loserName, or fightId", {
        winnerName,
        loserName,
      });
      return;
    }

    const appDomain = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    if (!appDomain) {
      toast.error("Application URL is not configured. Cannot share.");
      console.error("Share error: NEXT_PUBLIC_APP_URL is not defined.");
      return;
    }

    const fightResultUrl = new URL(`${appDomain}/fight-results/${fightId}`);
    fightResultUrl.searchParams.set("winnerName", winnerName);
    fightResultUrl.searchParams.set("loserName", loserName);

    // const castText = `Check out this epic duel in Heavy Helms: ${winnerName} defeated ${loserName}!`;

    try {
      await composeCast({ url: fightResultUrl.toString() });
      toast.success("Cast shared successfully! Check your Farcaster client.");
      onClose();
    } catch (error) {
      console.error("Failed to initiate cast from dialog:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[375px] bg-stone-800 border-yellow-600 p-4 font-pixeloid">
        <CompactDialogHeader
          title="Fight Over!"
          description={
            winnerName && loserName
              ? `Winner: ${winnerName} (Defeated: ${loserName})`
              : winnerName
                ? `Winner: ${winnerName}`
                : "No winner declared"
          }
          className="pb-2 font-pixeloid"
        />
        <DialogFooter className="gap-1.5 sm:flex-row sm:justify-end pt-2">
          {/* <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="h-8 px-3 text-xs border-stone-600 font-pixeloid"
          >
            Close
          </Button> */}
          <Button
            type="button"
            onClick={handleShareToFarcaster}
            className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-500 text-stone-100 font-pixeloid"
          >
            Share
          </Button>
          <Button
            type="button"
            onClick={handleReturnToMenu}
            className="h-8 px-3 text-xs bg-gradient-to-r from-amber-700 to-yellow-600 hover:from-amber-600 hover:to-yellow-500 text-stone-100 font-pixeloid"
          >
            Return to Menu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
