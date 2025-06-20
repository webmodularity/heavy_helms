import type { Fighter } from "@/types/fighter-types";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

interface GauntletQueueTableProps {
  players: Fighter[];
}

export function GauntletQueueTable({ players }: GauntletQueueTableProps) {
  if (!players || players.length === 0) {
    return (
      <p className="text-xs text-stone-400">The queue is currently empty.</p>
    );
  }

  // Compact padding and text style for headers & cells
  const headerBaseStyle = "px-2 py-1 text-[10px] text-stone-300 align-middle font-medium";
  const cellBaseStyle = "px-2 py-1 align-middle text-xs";

  return (
    <div className="rounded-md border border-stone-700/50 overflow-hidden max-h-[400px] overflow-y-auto">
      <Table className="min-w-full">
        <TableHeader className="sticky top-0 bg-stone-800/80 backdrop-blur-sm z-10">
          <TableRow className="border-b border-stone-700/50 hover:bg-stone-700/30">
            {/* Avatar Column Header: Blank, reduced width for smaller image */}
            <TableHead className={`${headerBaseStyle} w-[40px] text-left`} />
            {/* ID Field Header: reduced width */}
            <TableHead className={`${headerBaseStyle} w-[50px] text-left`}>
              ID
            </TableHead>
            {/* Name Field Header: takes remaining space */}
            <TableHead className={`${headerBaseStyle} text-left`}>
              NAME
            </TableHead>
            {/* W-L-K Field Header: reduced width, centered */}
            <TableHead className={`${headerBaseStyle} w-[70px] text-center`}>
              W-L-K
            </TableHead>
            {/* Rating Field Header: reduced width, right-aligned */}
            <TableHead className={`${headerBaseStyle} w-[65px] text-right`}>
              RATING
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-stone-700/30">
          {players.map((player) => {
            const displayName =
              player.name?.fullName?.trim() ||
              player.fullName?.trim() ||
              `Fighter ${player.fighterId?.toString() || player.id.split(":").pop() || "N/A"}`;

            const fighterDisplayId =
              player.fighterId?.toString() ||
              player.id.split(":").pop() ||
              "N/A";

            return (
              <TableRow key={player.id} className="hover:bg-stone-700/20">
                <TableCell className={"p-1 align-middle w-[40px]"}>
                  <Link href={`/character/${player.id}`} legacyBehavior={false}>
                    <div className="block h-8 w-8 rounded-full overflow-hidden bg-stone-700 relative hover:ring-1 hover:ring-yellow-500 transition-all cursor-pointer">
                      {player.currentSkin?.imageURL ? (
                        <Image
                          src={player.currentSkin.imageURL}
                          alt={displayName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-stone-400">
                          ?
                        </div>
                      )}
                    </div>
                  </Link>
                </TableCell>
                <TableCell
                  className={`${cellBaseStyle} w-[50px] text-stone-300 text-left`}
                >
                  {fighterDisplayId}
                </TableCell>
                <TableCell
                  className={`${cellBaseStyle} text-stone-200 text-left`}
                >
                  <Link
                    href={`/character/${player.id}`}
                    legacyBehavior={false}
                    className="font-medium hover:text-yellow-400 transition-colors"
                  >
                    {displayName}
                  </Link>
                </TableCell>
                <TableCell
                  className={`${cellBaseStyle} w-[70px] text-stone-300 text-center`}
                >
                  {player.record?.wins ?? 0}-{player.record?.losses ?? 0}-
                  {player.record?.kills ?? 0}
                </TableCell>
                <TableCell
                  className={`${cellBaseStyle} w-[65px] text-stone-300 text-right`}
                >
                  {player.battleRating ?? "N/A"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
