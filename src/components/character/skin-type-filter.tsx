"use client";

import { SkinType } from "@/types/skin.types";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface SkinTypeFilterProps {
  selectedType: SkinType | null;
  onChange: (type: SkinType | null) => void;
}

export function SkinTypeFilter({
  selectedType,
  onChange,
}: SkinTypeFilterProps) {
  // Filter options
  const filterOptions = [
    { label: "All Skins", value: null },
    { label: "Default Skins", value: SkinType.DefaultPlayer },
    { label: "Verified Skins", value: SkinType.Player },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {filterOptions.map((option, index) => (
        <motion.div
          key={`filter-${option.label}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Button
            variant={selectedType === option.value ? "default" : "outline"}
            size="sm"
            onClick={() => onChange(option.value)}
            className={
              selectedType === option.value
                ? "bg-yellow-600 hover:bg-yellow-700 text-stone-900 font-bokor text-lg"
                : "border-yellow-600/20 hover:border-yellow-600/40 text-yellow-500 hover:text-yellow-400 hover:bg-yellow-900/20 font-bokor text-lg"
            }
          >
            {option.label}
          </Button>
        </motion.div>
      ))}
    </div>
  );
}
