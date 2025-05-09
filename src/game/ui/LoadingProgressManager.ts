export class LoadingProgressManager {
  private stages: Map<string, StageConfig> = new Map();
  private currentStage = "";
  private stageProgress: Map<string, number> = new Map();
  private totalProgress = 0;
  private onProgressCallback: (progress: number) => void;

  constructor(onProgressCallback: (progress: number) => void) {
    this.onProgressCallback = onProgressCallback;
  }

  /**
   * Configure loading stages with their relative weights
   * @param stages An object mapping stage names to their relative weight in overall progress
   */
  configureStages(stages: Record<string, StageConfig>): void {
    // Reset existing stages
    this.stages.clear();
    this.stageProgress.clear();

    // Initialize stages
    let totalWeight = 0;

    for (const [name, config] of Object.entries(stages)) {
      this.stages.set(name, config);
      this.stageProgress.set(name, 0);
      totalWeight += config.weight;
    }

    // Normalize weights to ensure they sum to 1
    for (const [name, config] of this.stages.entries()) {
      this.stages.set(name, {
        ...config,
        weight: config.weight / totalWeight,
      });
    }

    // Reset progress
    this.totalProgress = 0;
    this.onProgressCallback(0);
  }

  /**
   * Start a specific loading stage
   * @param stageName The name of the stage to start
   */
  startStage(stageName: string): void {
    if (!this.stages.has(stageName)) {
      console.warn(`Unknown loading stage: ${stageName}`);
      return;
    }

    this.currentStage = stageName;
    this.updateProgress(0); // Initialize this stage at 0%
  }

  /**
   * Update progress for the current stage
   * @param progress Progress value between 0 and 1
   */
  updateProgress(progress: number): void {
    if (!this.currentStage || !this.stages.has(this.currentStage)) {
      return;
    }

    // Clamp progress between 0 and 1
    const clampedProgress = Math.max(0, Math.min(1, progress));

    // Update stage progress
    this.stageProgress.set(this.currentStage, clampedProgress);

    // Calculate total progress based on weighted stages
    let newTotalProgress = 0;

    for (const [name, stageProgress] of this.stageProgress.entries()) {
      const stageConfig = this.stages.get(name);
      if (stageConfig) {
        newTotalProgress += stageProgress * stageConfig.weight;
      }
    }

    // Update total progress
    this.totalProgress = newTotalProgress;

    // Call progress callback
    this.onProgressCallback(this.totalProgress);
  }

  /**
   * Complete the current stage (sets it to 100%)
   */
  completeStage(): void {
    this.updateProgress(1);
  }

  /**
   * Get the current total progress (0-1)
   */
  getCurrentProgress(): number {
    return this.totalProgress;
  }
}

interface StageConfig {
  weight: number;
  // message: string;
}
