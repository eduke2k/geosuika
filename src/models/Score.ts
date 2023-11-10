const BASE_SCORE = 2;
const REGISTRY_KEY = 'score';

export class Score {
  public static init (scene: Phaser.Scene): void {
    scene.game.registry.set(REGISTRY_KEY, 0);
  }
  
  public static incremenScoreBy (scene: Phaser.Scene, amount: number): number {
    const score = parseInt(scene.registry.get(REGISTRY_KEY));
    scene.registry.set(REGISTRY_KEY, score + amount);
    return parseInt(scene.registry.get(REGISTRY_KEY));
  }

  public static addMergedScore (scene: Phaser.Scene, tier: number, multiplier: number): number {
    const increment = Score.calculateMergeScore(tier, multiplier);
    return Score.incremenScoreBy(scene, increment);
  }

  public static calculateMergeScore (tier: number, multiplier: number): number {
    return BASE_SCORE * (tier + 1) * multiplier;
  }

  public static getTotalScore (scene: Phaser.Scene): number {
    return parseInt(scene.registry.get(REGISTRY_KEY));
  }
}