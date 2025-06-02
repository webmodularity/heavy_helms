export interface BattleType {
  id: string;
  icon: string;
  title: string;
  description: string;
  actionLabel: string;
  route: string;
  available: boolean;
  variant?: "arcade" | "pixel" | "crt";
}

export interface BattleCardState {
  showChallengeForm: boolean;
  showGauntletRegister: boolean;
  isNavigating: boolean;
} 