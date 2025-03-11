import type { Scene } from "phaser";
import type { CombatResultType } from "../utils/combat-decoder";

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

export function createPlayerAnimations(
  scene: Scene,
  spriteKey: string,
  isPlayer2 = false,
): void {
  const texture = scene.textures.get(spriteKey);
  if (!texture) return;

  const jsonData = texture.get("__BASE").customData as TextureData;

  const defaultFpsValues: FpsSettings = {
    idle: 24,
    walking: 24,
    running: 24,
    attacking: 24,
    blocking: 24,
    dying: 24,
    hurt: 24,
    dodging: 24,
    taunting: 24,
  };

  let fpsSettings = defaultFpsValues;

  const textureFps = jsonData?.textures?.[0]?.fps;
  if (textureFps) {
    fpsSettings = {
      idle: textureFps.idle ?? 24,
      walking: textureFps.walking ?? 24,
      running: textureFps.running ?? 24,
      attacking: textureFps.attacking ?? 24,
      blocking: textureFps.blocking ?? 24,
      dying: textureFps.dying ?? 24,
      hurt: textureFps.hurt ?? 24,
      dodging: textureFps.dodging ?? 24,
      taunting: textureFps.taunting ?? 24,
    };
  }

  const animations: Record<string, AnimationFrameConfig> = {
    idle: { frames: 17, fps: fpsSettings.idle, repeat: -1 },
    walking: { frames: 11, fps: fpsSettings.walking, repeat: -1 },
    running: { frames: 11, fps: fpsSettings.running, repeat: -1 },
    dying: { frames: 14, fps: fpsSettings.dying, repeat: 0 },
    hurt: { frames: 11, fps: fpsSettings.hurt, repeat: 0 },
    attacking: { frames: 11, fps: fpsSettings.attacking, repeat: 0 },
    blocking: { frames: 11, fps: fpsSettings.blocking, repeat: 0 },
    dodging: { frames: 5, fps: fpsSettings.dodging, repeat: 0 },
    taunting: { frames: 11, fps: fpsSettings.taunting, repeat: 0 },
  };

  for (const [key, config] of Object.entries(animations)) {
    const animKey = isPlayer2 ? `${key}2` : key;

    if (scene.anims.exists(animKey)) {
      scene.anims.remove(animKey);
    }

    scene.anims.create({
      key: animKey,
      frames: scene.anims.generateFrameNames(spriteKey, {
        prefix: `${key}_`,
        start: 0,
        end: config.frames,
        zeroPad: 3,
        suffix: ".png",
      }),
      frameRate: config.fps,
      repeat: config.repeat,
    });
  }
}
