"use client";

interface CardContainerProps {
  index: number;
  isSelected?: boolean;
  children: React.ReactNode;
}

export function CardContainer({ index, isSelected, children }: CardContainerProps) {
  return (
    <div
      className={`min-w-[220px] bg-gradient-to-b from-amber-900/20 to-stone-900/40 rounded-lg ${
        isSelected
          ? "border-2 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)] scale-[1.03]"
          : "border border-yellow-600/30"
      } overflow-hidden snap-start transition-all duration-300 hover:scale-[1.02] hover:border-yellow-600/50 animate-fade-in`}
      style={{ 
        animationDelay: `${index * 100}ms`,
        animationFillMode: 'backwards'
      }}
    >
      {children}
    </div>
  );
} 