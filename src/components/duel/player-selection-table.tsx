"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useActivePlayers } from "@/hooks/use-active-players";
import { ArmorType, StanceType, WeaponType } from "@/types/equipment.types";
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, ArrowUpDown } from "lucide-react";
import { useOwnPlayers } from "@/hooks/use-own-players";
import type { Fighter } from "@/types/fighter-types";
import {
  getWeaponDisplayName,
  getArmorDisplayName,
} from "@/lib/equipment-utils";

interface PlayerSelectionTableProps {
  onSelectPlayer: (player: Fighter) => void;
  currentPlayerId?: string;
}

export function PlayerSelectionTable({
  onSelectPlayer,
  currentPlayerId,
}: PlayerSelectionTableProps) {
  const { players: allPlayers, isLoading, error } = useActivePlayers();
  const { players: ownPlayers, isLoading: isOwnPlayersLoading } =
    useOwnPlayers();
  console.log("allPlayers", allPlayers);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "name", desc: false },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");

  // Replace useState and useEffect for filteredPlayers with useMemo
  const filteredPlayers = useMemo(() => {
    if (isLoading || isOwnPlayersLoading || !allPlayers) {
      return [];
    }

    // Filter out own players if currentPlayerId is provided
    if (currentPlayerId) {
      const ownPlayerIdsSet = new Set(
        ownPlayers?.map((player) => player.id) ?? [],
      );
      return allPlayers.filter((player) => !ownPlayerIdsSet.has(player.id));
    }
    // If no currentPlayerId, return all active players (original logic)
    return allPlayers;
  }, [allPlayers, currentPlayerId, isLoading, isOwnPlayersLoading, ownPlayers]);

  // Define columns for the table
  const columns: ColumnDef<Fighter>[] = [
    {
      id: "avatar",
      header: "",
      cell: ({ row }) => (
        <div className="h-8 w-8 rounded-full overflow-hidden bg-stone-800 relative">
          <Image
            src={row.original.currentSkin.imageURL}
            alt={row.original.name.fullName || ""}
            fill
            className="object-cover"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorFn: (row) => row.name.fullName,
      id: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:text-yellow-400 transition-colors h-7 px-2 text-xs"
        >
          Name
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium text-stone-200 text-xs sm:text-sm">
          {row.original.name.fullName}
        </div>
      ),
      enableHiding: false,
    },
    {
      accessorFn: (row) => row.attributes.strength,
      id: "strength",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:text-yellow-400 transition-colors h-7 px-2 text-xs"
        >
          STR
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center text-xs">
          {row.original.attributes.strength}
        </div>
      ),
    },
    {
      accessorFn: (row) => row.attributes.agility,
      id: "agility",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:text-yellow-400 transition-colors h-7 px-2 text-xs"
        >
          AGI
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center text-xs">
          {row.original.attributes.agility}
        </div>
      ),
    },
    {
      accessorFn: (row) => row.attributes.stamina,
      id: "stamina",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:text-yellow-400 transition-colors h-7 px-2 text-xs"
        >
          STA
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center text-xs">
          {row.original.attributes.stamina}
        </div>
      ),
    },
    {
      accessorFn: (row) => row.currentSkin.weapon,
      id: "weapon",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:text-yellow-400 transition-colors h-7 px-2 text-xs"
        >
          Weapon
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center text-xs">
          {getWeaponDisplayName(row.original.currentSkin.weapon)}
        </div>
      ),
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      accessorFn: (row) => row.currentSkin.armor,
      id: "armor",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:text-yellow-400 transition-colors h-7 px-2 text-xs"
        >
          Armor
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center text-xs">
          {getArmorDisplayName(row.original.currentSkin.armor)}
        </div>
      ),
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      accessorFn: (row) => row.record.wins,
      id: "wins",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:text-yellow-400 transition-colors h-7 px-2 text-xs"
        >
          W
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center text-green-400 text-xs">
          {row.original.record.wins}
        </div>
      ),
    },
    {
      accessorFn: (row) => row.record.losses,
      id: "losses",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:text-yellow-400 transition-colors h-7 px-2 text-xs"
        >
          L
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center text-red-400 text-xs">
          {row.original.record.losses}
        </div>
      ),
    },
  ];

  // Create table instance with proper filtering
  const table = useReactTable({
    data: filteredPlayers,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, columnId, value) => {
      const searchValue = value.toLowerCase();
      // Search by name or ID
      if (columnId === "name" && row.original.name.fullName) {
        return (
          row.original.name.fullName.toLowerCase().includes(searchValue) ||
          row.original.id.toLowerCase().includes(searchValue)
        );
      }
      return false;
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-6 w-6 text-yellow-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-400 h-40 flex flex-col justify-center">
        <h3 className="text-base font-medium mb-1.5">Error loading players</h3>
        <p className="text-xs text-red-300">
          {error instanceof Error ? error.message : "An unknown error occurred"}
        </p>
      </div>
    );
  }

  if (filteredPlayers.length === 0) {
    return (
      <div className="text-center text-stone-300 h-40 flex flex-col justify-center">
        <h3 className="text-base font-medium text-yellow-500 mb-1.5">
          No challengers found
        </h3>
        <p className="text-xs max-w-md mx-auto">
          There are no active players available to challenge at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-2.5">
      <div className="flex-none flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2 md:items-center">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
          <Input
            placeholder="Search by name or ID..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-8 py-1 h-8 text-xs bg-stone-900/50 border-yellow-600/20 focus:border-yellow-500 text-stone-200"
          />
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap gap-1.5">
          {/* Weapon filter */}
          <Select
            onValueChange={(value) => {
              if (value === "all") {
                table.getColumn("weapon")?.setFilterValue(undefined);
              } else {
                table.getColumn("weapon")?.setFilterValue([Number(value)]);
              }
            }}
            defaultValue="all"
          >
            <SelectTrigger className="w-[110px] h-8 text-xs border-yellow-600/20 focus:border-yellow-500 bg-stone-900/50 text-stone-200">
              <SelectValue placeholder="Weapon" />
            </SelectTrigger>
            <SelectContent className="bg-stone-900 border-yellow-600/20 text-stone-200 text-xs">
              <SelectItem value="all">All Weapons</SelectItem>
              {Object.entries(WeaponType).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Armor filter */}
          <Select
            onValueChange={(value) => {
              if (value === "all") {
                table.getColumn("armor")?.setFilterValue(undefined);
              } else {
                table.getColumn("armor")?.setFilterValue([Number(value)]);
              }
            }}
            defaultValue="all"
          >
            <SelectTrigger className="w-[100px] h-8 text-xs border-yellow-600/20 focus:border-yellow-500 bg-stone-900/50 text-stone-200">
              <SelectValue placeholder="Armor" />
            </SelectTrigger>
            <SelectContent className="bg-stone-900 border-yellow-600/20 text-stone-200 text-xs">
              <SelectItem value="all">All Armor</SelectItem>
              {Object.entries(ArmorType).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Stance filter */}
          <Select
            onValueChange={(value) => {
              if (value === "all") {
                table.getColumn("stance")?.setFilterValue(undefined);
              } else {
                table.getColumn("stance")?.setFilterValue([Number(value)]);
              }
            }}
            defaultValue="all"
          >
            <SelectTrigger className="w-[100px] h-8 text-xs border-yellow-600/20 focus:border-yellow-500 bg-stone-900/50 text-stone-200">
              <SelectValue placeholder="Stance" />
            </SelectTrigger>
            <SelectContent className="bg-stone-900 border-yellow-600/20 text-stone-200 text-xs">
              <SelectItem value="all">All Stances</SelectItem>
              {Object.entries(StanceType).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Players table with scrolling container */}
      <div className="flex-grow min-h-0 rounded-md border border-yellow-600/20 overflow-hidden">
        <div className="h-full overflow-auto">
          <Table className="border-collapse text-xs">
            <TableHeader className="bg-stone-100/50 sticky top-0 z-10">
              <TableRow>
                {table.getHeaderGroups()[0].headers.map((header) => (
                  <TableHead key={header.id} className="text-center py-2 px-2">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    onClick={() => onSelectPlayer(row.original)}
                    className="group hover:bg-amber-900/10 hover:border-yellow-600/30 cursor-pointer"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-1.5 px-2">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={table.getAllColumns().length}
                    className="h-20 text-center text-xs"
                  >
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination controls */}
      <div className="flex-none flex items-center justify-end space-x-1.5 py-2">
        <div className="text-xs text-stone-400">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <Button
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="h-7 px-2 text-xs border-yellow-600/20 hover:bg-yellow-500/10 hover:text-yellow-400 text-stone-200"
        >
          Previous
        </Button>
        <Button
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="h-7 px-2 text-xs border-yellow-600/20 hover:bg-yellow-500/10 hover:text-yellow-400 text-stone-200"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
