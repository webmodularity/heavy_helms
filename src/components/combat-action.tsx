"use client";

import { CombatActionType } from "@/types/blockchain.types";
import { useState } from "react";

interface CombatAction {
  type: CombatActionType;
  name: string;
  staminaCost: number;
}

interface CombatActionProps {
  action: CombatAction;
  isSelected: boolean;
  isDisabled?: boolean;
  onSelect: (action: CombatAction) => void;
}

function CombatActionButton({
  action,
  isSelected,
  isDisabled = false,
  onSelect,
}: CombatActionProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Get appropriate background image based on state
  const getBackgroundImage = () => {
    if (isDisabled) return "url('/ui/Button_Disabled.svg')";
    if (isSelected) return "url('/ui/Button_Selected.svg')";
    if (isHovered) return "url('/ui/Button_Hover.svg')";
    return "url('/ui/Button_Normal.svg')";
  };

  // Get appropriate text color based on state
  const getTextColor = () => {
    if (isDisabled) return "text-gray-500";
    if (isSelected) return "text-white";
    return "text-stone-800";
  };

  // Get action icon based on action type
  const getActionIcon = () => {
    switch (action.type) {
      case CombatActionType.ATTACK:
        return "⚔️";
      case CombatActionType.BLOCK:
        return "🛡️";
      case CombatActionType.DODGE:
        return "✨";
      case CombatActionType.COUNTER:
        return "🔄";
      case CombatActionType.PARRY:
        return "🛡️";
      case CombatActionType.REST:
        return "💤";
      default:
        return "❓";
    }
  };

  return (
    <button
      type="button"
      className={`
        relative w-full py-3 px-4 mb-2
        bg-[length:100%_100%] bg-no-repeat bg-center
        ${getTextColor()}
        transition-all duration-200
        flex items-center justify-between
        ${isDisabled ? "cursor-not-allowed opacity-70" : "cursor-pointer hover:scale-[1.02]"}
      `}
      style={{ backgroundImage: getBackgroundImage() }}
      onClick={() => !isDisabled && onSelect(action)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={isDisabled}
    >
      <div className="flex items-center">
        <span className="text-xl mr-2">{getActionIcon()}</span>
        <span className="font-bold">{action.name}</span>
      </div>

      {action.staminaCost > 0 && (
        <div className="text-sm bg-amber-900/20 px-2 py-1 rounded">
          <span className="font-medium">Stamina: {action.staminaCost}</span>
        </div>
      )}
    </button>
  );
}

export default CombatActionButton;
