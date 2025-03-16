interface AnimationConfig {
  repeat: boolean;
}

interface FpsSettings {
  idle: number;
  walking: number;
  running: number;
  attacking: number;
  blocking: number;
  dying: number;
  hurt: number;
  dodging: number;
  taunting: number;
}

interface AnimationFrameConfig {
  frames: number;
  fps: number;
  repeat: number;
}

interface TextureData {
  textures?: Array<{
    fps?: Partial<FpsSettings>;
  }>;
}

export const VALID_ANIMATIONS: Record<string, AnimationConfig> = {
  idle: { repeat: true },
  walking: { repeat: true },
  running: { repeat: true },
  attacking: { repeat: false },
  blocking: { repeat: false },
  dying: { repeat: false },
  hurt: { repeat: false },
  dodging: { repeat: false },
  taunting: { repeat: false },
};

export const COMBAT_RESULT_TO_ANIMATION: Record<
  keyof typeof CombatResultType,
  string | null
> = {
  DODGE: "dodging",
  HIT: "hurt",
  BLOCK: "blocking",
  PARRY: "blocking",
  COUNTER: "blocking",
  RIPOSTE: "blocking",
  MISS: null,
  ATTACK: "attacking",
  CRIT: "attacking",
  COUNTER_CRIT: "attacking",
  RIPOSTE_CRIT: "attacking",
  EXHAUSTED: null,
};

