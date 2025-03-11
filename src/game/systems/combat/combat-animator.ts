import type { GameObjects, Scene } from "phaser";
import { VALID_ANIMATIONS } from "../animation-system";

type AnimationType = keyof typeof VALID_ANIMATIONS;

interface AnimationEvent {
  key: string;
}

export class CombatAnimator {
  private scene: Scene;
  private animationTypes: AnimationType[];
  private isPlayingOneShot: boolean;

  constructor(scene: Scene) {
    this.scene = scene;

    // Use the valid animations from playerAnimations
    this.animationTypes = Object.keys(VALID_ANIMATIONS) as AnimationType[];

    // Flag to prevent animation interruption
    this.isPlayingOneShot = false;
  }

  public playAnimation(
    sprite: GameObjects.Sprite,
    animationType: AnimationType,
    isPlayer2 = false,
  ): void {
    const suffix = isPlayer2 ? "2" : "";
    const animKey = `${animationType}${suffix}`;

    // Check if animation exists and is valid
    if (this.scene.anims.exists(animKey)) {
      // For one-shot animations, always play
      if (VALID_ANIMATIONS[animationType]?.repeat === false) {
        sprite.play(animKey);
      }
      // For repeating animations, only play if not already playing
      else if (
        !sprite.anims.isPlaying ||
        sprite.anims.currentAnim?.key !== animKey
      ) {
        sprite.play(animKey);
      }
    } else {
      console.warn(`Animation ${animKey} not found!`);
    }
  }

  // One-shot animations that shouldn't be interrupted
  public playOneShotAnimation(
    sprite: GameObjects.Sprite,
    animationType: AnimationType,
    isPlayer2 = false,
  ): void {
    if (VALID_ANIMATIONS[animationType]?.repeat === false) {
      this.isPlayingOneShot = true;
      this.playAnimation(sprite, animationType, isPlayer2);
    }
  }

  // Setup animation completion handler
  public setupAnimationComplete(
    sprite: GameObjects.Sprite,
    isPlayer2 = false,
  ): void {
    sprite.on("animationcomplete", (animation: AnimationEvent) => {
      const baseKey = isPlayer2
        ? animation.key.replace("2", "")
        : animation.key;

      // Only switch to idle if it's a one-shot animation
      if (VALID_ANIMATIONS[baseKey as AnimationType]?.repeat === false) {
        // this.playAnimation(sprite, 'idle', isPlayer2);
        this.isPlayingOneShot = false;
      }
    });
  }

  public canPlayAnimation(): boolean {
    return !this.isPlayingOneShot;
  }
}
