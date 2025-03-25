"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useActivePlayers } from "@/hooks/use-active-players";
import type { Player } from "@/types/player.types";
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
import { YellowButton } from "@/components/ui/yellow-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, ArrowUpDown, Filter } from "lucide-react";
import { useOwnPlayers } from "@/hooks/use-own-players";

// Define enums to string mappings for display
const WeaponTypeMap: Record<WeaponType, string> = {
  [WeaponType.SwordAndShield]: "Sword & Shield",
  [WeaponType.MaceAndShield]: "Mace & Shield",
  [WeaponType.RapierAndShield]: "Rapier & Shield",
  [WeaponType.Greatsword]: "Greatsword",
  [WeaponType.Battleaxe]: "Battleaxe",
  [WeaponType.Quarterstaff]: "Quarterstaff",
  [WeaponType.Spear]: "Spear",
};

const ArmorTypeMap: Record<ArmorType, string> = {
  [ArmorType.Cloth]: "Cloth",
  [ArmorType.Leather]: "Leather",
  [ArmorType.Chain]: "Chain",
  [ArmorType.Plate]: "Plate",
};

const StanceTypeMap: Record<StanceType, string> = {
  [StanceType.Defensive]: "Defensive",
  [StanceType.Balanced]: "Balanced",
  [StanceType.Offensive]: "Offensive",
};

interface PlayerSelectionTableProps {
  onSelectPlayer: (player: Player) => void;
  currentPlayerId?: string;
}

export function PlayerSelectionTable({
  onSelectPlayer,
  currentPlayerId,
}: PlayerSelectionTableProps) {
  const { players: allPlayers, isLoading, error } = useActivePlayers();
  const { players: ownPlayers, isLoading: isOwnPlayersLoading } =
    useOwnPlayers();

  const [sorting, setSorting] = useState<SortingState>([
    { id: "name", desc: false },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");

  // Filter out current player
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);

  // Update filtered players only when players or currentPlayerId changes
  useEffect(() => {
    if (isOwnPlayersLoading || isLoading) {
      setFilteredPlayers([]);
      return;
    }

    if (!allPlayers) {
      setFilteredPlayers([]);
      return;
    }
    // Filter out own players
    const ownPlayerIds = ownPlayers?.map((player) => player.id);

    if (currentPlayerId) {
      setFilteredPlayers(
        allPlayers.filter((player) => !ownPlayerIds?.includes(player.id)),
      );
    } else {
      setFilteredPlayers(allPlayers);
    }
  }, [allPlayers, currentPlayerId, isLoading, isOwnPlayersLoading, ownPlayers]);

  // Define columns for the table
  const columns: ColumnDef<Player>[] = [
    {
      id: "avatar",
      header: "",
      cell: ({ row }) => (
        <div className="h-10 w-10 rounded-full overflow-hidden bg-stone-800 relative">
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
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:text-yellow-400 transition-colors"
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium text-stone-200">
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
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:text-yellow-400 transition-colors"
        >
          STR
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center">{row.original.attributes.strength}</div>
      ),
    },
    {
      accessorFn: (row) => row.attributes.agility,
      id: "agility",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:text-yellow-400 transition-colors"
        >
          AGI
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center">{row.original.attributes.agility}</div>
      ),
    },
    {
      accessorFn: (row) => row.attributes.stamina,
      id: "stamina",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:text-yellow-400 transition-colors"
        >
          STA
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center">{row.original.attributes.stamina}</div>
      ),
    },
    {
      accessorFn: (row) => row.currentSkin.weapon,
      id: "weapon",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:text-yellow-400 transition-colors"
        >
          Weapon
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          {WeaponTypeMap[row.original.currentSkin.weapon]}
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
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:text-yellow-400 transition-colors"
        >
          Armor
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          {ArmorTypeMap[row.original.currentSkin.armor]}
        </div>
      ),
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      accessorFn: (row) => row.currentSkin.stance,
      id: "stance",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:text-yellow-400 transition-colors"
        >
          Stance
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          {StanceTypeMap[row.original.currentSkin.stance]}
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
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:text-yellow-400 transition-colors"
        >
          W
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center text-green-400">
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
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:text-yellow-400 transition-colors"
        >
          L
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center text-red-400">
          {row.original.record.losses}
        </div>
      ),
    },
    // {
    //   id: "actions",
    //   header: "",
    //   cell: ({ row }) => (
    //     <div className="text-right">
    //       <YellowButton
    //         size="sm"
    //         onClick={() => onSelectPlayer(row.original)}
    //         className="opacity-100 group-hover:opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100"
    //       >
    //         Challenge
    //       </YellowButton>
    //     </div>
    //   ),
    //   enableSorting: false,
    //   enableHiding: false,
    // },
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

  if (filteredPlayers.length === 0) {
    return (
      <div className="text-center text-stone-300 h-64 flex flex-col justify-center">
        <h3 className="text-lg font-medium text-yellow-500 mb-2">
          No challengers found
        </h3>
        <p className="text-sm max-w-md mx-auto">
          There are no active players available to challenge at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 md:items-center">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
          <Input
            placeholder="Search by name or ID..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-10 bg-stone-900/50 border-yellow-600/20 focus:border-yellow-500 text-stone-200"
          />
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap gap-2">
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
            <SelectTrigger className="w-[130px] border-yellow-600/20 focus:border-yellow-500 bg-stone-900/50 text-stone-200">
              <SelectValue placeholder="Weapon" />
            </SelectTrigger>
            <SelectContent className="bg-stone-900 border-yellow-600/20 text-stone-200">
              <SelectItem value="all">All Weapons</SelectItem>
              {Object.entries(WeaponTypeMap).map(([value, label]) => (
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
            <SelectTrigger className="w-[120px] border-yellow-600/20 focus:border-yellow-500 bg-stone-900/50 text-stone-200">
              <SelectValue placeholder="Armor" />
            </SelectTrigger>
            <SelectContent className="bg-stone-900 border-yellow-600/20 text-stone-200">
              <SelectItem value="all">All Armor</SelectItem>
              {Object.entries(ArmorTypeMap).map(([value, label]) => (
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
            <SelectTrigger className="w-[120px] border-yellow-600/20 focus:border-yellow-500 bg-stone-900/50 text-stone-200">
              <SelectValue placeholder="Stance" />
            </SelectTrigger>
            <SelectContent className="bg-stone-900 border-yellow-600/20 text-stone-200">
              <SelectItem value="all">All Stances</SelectItem>
              {Object.entries(StanceTypeMap).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Players table */}
      <div className="rounded-md flex-1 border border-yellow-600/20 overflow-hidden">
        <Table className="border-collapse">
          <TableHeader className="bg-stone-100/50">
            <TableRow>
              {table.getHeaderGroups()[0].headers.map((header) => (
                <TableHead key={header.id} className="text-center">
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
                    <TableCell key={cell.id}>
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
                  className="h-24 text-center"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-sm text-stone-400">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <Button
          // variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="border-yellow-600/20 hover:bg-yellow-500/10 hover:text-yellow-400 text-stone-200"
        >
          Previous
        </Button>
        <Button
          // variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="border-yellow-600/20 hover:bg-yellow-500/10 hover:text-yellow-400 text-stone-200"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
