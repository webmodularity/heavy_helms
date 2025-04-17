import type { DecodedCombatResult } from "@/types/game.types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"; // Assuming usage of Shadcn Dialog
import { Trophy, ShieldAlert, RotateCw } from "lucide-react"; // Example icons
import type { Fighter } from "@/types/fighter-types";

interface ResultsSummaryProps {
  isOpen: boolean;
  onClose: () => void;
  onReplay?: () => void;
  txId: string;
  result: DecodedCombatResult | null;
  player1: Fighter | null;
  player2: Fighter | null;
}

export function ResultsSummary({
  isOpen,
  onClose,
  result,
  player1,
  player2,
  txId,
}: ResultsSummaryProps) {
  if (!isOpen || !result) {
    return null; // Don't render if not open or no result data
  }

  const winnerName =
    Number(result.winner) === Number(player1?.id) // Assuming winner ID matches player index (1 or 2)
      ? player1?.name.fullName
      : Number(result.winner) === Number(player2?.id)
        ? player2?.name.fullName
        : "Unknown Victor";

  const victoryCondition = result.condition ?? "Unknown"; // e.g., KNOCKOUT, EXHAUSTION

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-stone-900 to-stone-800 border-yellow-600/30 text-stone-100">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-yellow-400 flex items-center justify-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-400" />
            Duel Concluded!
          </DialogTitle>
          <DialogDescription className="text-center text-stone-300 pt-2">
            The dust settles on the battlefield...
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 px-6 space-y-4 text-center">
          <p className="text-lg">
            <span className="font-semibold text-yellow-500">{winnerName}</span>{" "}
            emerges victorious!
          </p>
          <p className="text-sm text-stone-400 flex items-center justify-center gap-1">
            <ShieldAlert className="h-4 w-4" />
            Victory by:{" "}
            <span className="font-medium text-stone-200">
              {victoryCondition}
            </span>
          </p>
          {/* Add more details if needed, e.g., final health, specific rounds */}
        </div>

        <DialogFooter className="sm:justify-center gap-2">
          {/* <Button
            type="button"
            variant="secondary"
            onClick={onReplay}
            className="bg-stone-700 hover:bg-stone-600 text-stone-100 border-stone-600"
          >
            <RotateCw className="mr-2 h-4 w-4" />
            Replay Duel
          </Button> */}
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="bg-yellow-600 hover:bg-yellow-500 text-black border-none"
          >
            Back to Warrior's Hall
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              window.open(`https://sepolia.basescan.org/tx/${txId}`, "_blank");
            }}
            className="bg-yellow-600 hover:bg-yellow-500 text-black border-none"
          >
            View on Explorer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
