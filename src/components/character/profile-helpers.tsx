import { motion } from "framer-motion";
import type React from "react"; // Import React explicitly for React.ReactNode

// Helper Components
interface InfoItemProps {
  label: string;
  value: string | number; // Allow number for ID
  icon?: React.ReactNode | null;
  className?: string;
}

export function InfoItem({
  label,
  value,
  icon,
  className = "",
}: InfoItemProps) {
  return (
    <div className="flex justify-between group">
      <span className="text-stone-400 group-hover:text-stone-300 transition-colors duration-300">
        {label}
      </span>
      <span
        className={`font-medium ${className || "text-stone-200"} group-hover:text-white transition-colors duration-300`}
      >
        {icon && <span className="mr-1">{icon}</span>}
        {value}
      </span>
    </div>
  );
}

interface StatBoxProps {
  label: string;
  value: string;
  className?: string;
  icon?: React.ReactNode;
  actionIcon?: React.ReactNode;
  onActionClick?: () => void;
  isActionDisabled?: boolean;
}

export function formatBattleRating(rating?: number): string {
  if (rating === undefined || rating === null) return "0";
  return Math.round(rating).toString();
}

export function StatBox({
  label,
  value,
  className = "",
  icon = null,
  actionIcon,
  onActionClick,
  isActionDisabled,
}: StatBoxProps) {
  return (
    <motion.div
      className="text-center p-4 bg-stone-800/30 rounded-lg border border-yellow-600/10 relative overflow-hidden group hover:border-yellow-600/20 transition-all duration-300"
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-yellow-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="w-full">
        <motion.div
          className={`text-2xl font-bold ${className} relative z-10 flex items-center justify-center`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {icon}
          <span className="flex-grow text-center">{value}</span>
          {actionIcon && (
            <button
              type="button"
              onClick={onActionClick}
              disabled={isActionDisabled}
              className="ml-2 p-1 rounded-md hover:bg-stone-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              aria-label="Perform action"
            >
              {actionIcon}
            </button>
          )}
        </motion.div>
        <div className="text-stone-400 text-sm mt-1 relative z-10 group-hover:text-stone-300 transition-colors duration-300">
          {label}
        </div>
      </div>
    </motion.div>
  );
}
