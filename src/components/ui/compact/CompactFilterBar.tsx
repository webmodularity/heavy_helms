import { Search } from "lucide-react";
import { Input } from "../input";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@radix-ui/react-select";

interface FilterOption {
  value: string;
  label: string;
}

interface CompactFilterBarProps {
  onSearch: (value: string) => void;
  searchValue: string;
  filterOptions?: {
    name: string;
    options: FilterOption[];
    onSelect: (value: string) => void;
    placeholder?: string;
    width?: string;
  }[];
}

export function CompactFilterBar({
  onSearch,
  searchValue,
  filterOptions = [],
}: CompactFilterBarProps) {
  return (
    <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2 md:items-center">
      {/* Search input */}
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
        <Input
          placeholder="Search..."
          value={searchValue}
          onChange={(e) => onSearch(e.target.value)}
          className="pl-8 py-1 h-8 text-xs bg-stone-900/50 border-yellow-600/20 focus:border-yellow-500 text-stone-200"
        />
      </div>

      {/* Filter dropdowns */}
      <div className="flex flex-wrap gap-1.5">
        {filterOptions.map((filter, index) => (
          <Select
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            key={index}
            onValueChange={(value) => filter.onSelect(value)}
            defaultValue="all"
          >
            <SelectTrigger
              className={`${filter.width || "w-[100px]"} h-8 text-xs border-yellow-600/20 focus:border-yellow-500 bg-stone-900/50 text-stone-200`}
            >
              <SelectValue placeholder={filter.placeholder || filter.name} />
            </SelectTrigger>
            <SelectContent className="bg-stone-900 border-yellow-600/20 text-stone-200 text-xs">
              <SelectItem value="all">All {filter.name}</SelectItem>
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
      </div>
    </div>
  );
}
