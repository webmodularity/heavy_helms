import { motion } from "framer-motion";
import { Button } from "./button";

export function CTAButton({
  onClick,
  title,
  size = "default",
}: {
  onClick: () => void;
  title: string;
  size?: "default" | "sm" | "lg" | "icon" | null;
}) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
      <Button
        type="button"
        onClick={onClick}
        size={size}
        className="bg-gradient-to-b from-amber-700/40 to-stone-900/80 backdrop-blur-sm rounded border border-yellow-600/30 shadow-lg group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/0 via-yellow-400/20 to-yellow-600/0 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        <span className="text-yellow-400/90 text-lg font-bold uppercase tracking-widest group-hover:text-yellow-300 relative z-10">
          {title}
        </span>
      </Button>
    </motion.div>
  );
}
