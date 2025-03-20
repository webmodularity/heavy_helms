"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useActivePlayers } from "@/hooks/use-active-players";
import type { Player } from "@/types/player.types";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { YellowButton } from "@/components/ui/yellow-button";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface PlayerSelectionTableProps {
  onSelectPlayer: (player: Player) => void;
  currentPlayerId?: string;
}

export function PlayerSelectionTable({
  onSelectPlayer,
  currentPlayerId,
}: PlayerSelectionTableProps) {
  const {
    players,
    isLoading,
    error,
    sortField,
    sortDirection,
    handleSort,
    searchTerm,
    setSearchTerm,
  } = useActivePlayers();
  
  // Track the hovering player for highlighting
  const [hoveringPlayerId, setHoveringPlayerId] = useState<string | null>(null);

  // Define sort indicator component
  const SortIndicator = ({ field }: { field: string }) => {
    if (sortField !== field) return null;
    
    return sortDirection === "asc" ? (
      <ChevronUp className="inline h-4 w-4 ml-1" />
    ) : (
      <ChevronDown className="inline h-4 w-4 ml-1" />
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 text-yellow-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-400 h-64 flex flex-col justify-center">
        <h3 className="text-lg font-medium mb-2">Error loading players</h3>
        <p className="text-sm text-red-300">
          {error instanceof Error ? error.message : "An unknown error occurred"}
        </p>
      </div>
    );
  }

  if (!players || players.length === 0) {
    return (
      <div className="text-center text-stone-300 h-64 flex flex-col justify-center">
        <h3 className="text-lg font-medium text-yellow-500 mb-2">No challengers found</h3>
        <p className="text-sm max-w-md mx-auto">
          There are no active players available to challenge at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
        <Input
          placeholder="Search challengers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-stone-900/50 border-yellow-600/20 focus:border-yellow-500 text-stone-200"
        />
      </div>

      {/* Players table */}
      <div className="rounded-md border border-yellow-600/20 overflow-hidden">
        <Table className="border-collapse">
          <TableHeader className="bg-stone-800/50">
            <TableRow>
              <TableHead className="w-[50px]" />
              <TableHead
                className="cursor-pointer hover:text-yellow-400 transition-colors"
                onClick={() => handleSort("name")}
              >
                Name <SortIndicator field="name" />
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-yellow-400 transition-colors text-center"
                onClick={() => handleSort("strength")}
              >
                STR <SortIndicator field="strength" />
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-yellow-400 transition-colors text-center"
                onClick={() => handleSort("agility")}
              >
                AGI <SortIndicator field="agility" />
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-yellow-400 transition-colors text-center"
                onClick={() => handleSort("stamina")}
              >
                STA <SortIndicator field="stamina" />
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-yellow-400 transition-colors text-center"
                onClick={() => handleSort("wins")}
              >
                W <SortIndicator field="wins" />
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-yellow-400 transition-colors text-center"
                onClick={() => handleSort("losses")}
              >
                L <SortIndicator field="losses" />
              </TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map((player) => {
              // Skip the current player (can't challenge yourself)
              if (player.id === currentPlayerId) return null;

              const isHovering = hoveringPlayerId === player.id;
              
              return (
                <TableRow
                  key={player.id}
                  className={`
                    group hover:bg-amber-900/10
                    ${isHovering ? "bg-amber-900/10 border-yellow-600/30" : ""}
                  `}
                  onMouseEnter={() => setHoveringPlayerId(player.id)}
                  onMouseLeave={() => setHoveringPlayerId(null)}
                >
                  <TableCell className="p-2">
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-stone-800 relative">
                      <Image
                        src={player.currentSkin.imageURL}
                        alt={player.name.fullName || ""}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-stone-200">
                    {player.name.fullName}
                  </TableCell>
                  <TableCell className="text-center">{player.attributes.strength}</TableCell>
                  <TableCell className="text-center">{player.attributes.agility}</TableCell>
                  <TableCell className="text-center">{player.attributes.stamina}</TableCell>
                  <TableCell className="text-center text-green-400">{player.record.wins}</TableCell>
                  <TableCell className="text-center text-red-400">{player.record.losses}</TableCell>
                  <TableCell className="text-right">
                    <YellowButton
                      size="sm"
                      onClick={() => onSelectPlayer(player)}
                      className="opacity-100 group-hover:opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100"
                    >
                      Challenge
                    </YellowButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 