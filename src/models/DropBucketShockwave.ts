import ShockwavePostFxPipeline from "phaser3-rex-plugins/plugins/shockwavepipeline.js";
import { getRelativePositionToCanvas } from "../functions/helper";

export class DropBucketShockwave {
  private scene: Phaser.Scene;
  private pipelineInstance: ShockwavePostFxPipeline | undefined;
  private tween: Phaser.Tweens.Tween | undefined;

  public constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public triggerOnMainCamera (worldCenter: { x: number, y: number }, strength: number): void {
    if (this.tween && this.pipelineInstance) {
      this.tween.stop();
      this.tween = undefined;
    } else {
      this.scene.cameras.main.setPostPipeline(ShockwavePostFxPipeline);
      this.pipelineInstance = this.scene.cameras.main.getPostPipeline(ShockwavePostFxPipeline) as ShockwavePostFxPipeline;
    }

    const spawnPositionRelativeToCam = getRelativePositionToCanvas(worldCenter, this.scene.cameras.main)
    this.pipelineInstance.setCenter(spawnPositionRelativeToCam.x, spawnPositionRelativeToCam.y);
    this.pipelineInstance.setWaveRadius(0);
    this.pipelineInstance.setWaveWidth(60);
    this.tween = this.scene.tweens.add({
      targets: this.pipelineInstance,
      waveRadius: 512 * strength,
      waveWidth: 1,
      duration: 1000 + (2000 * strength),
      ease: Phaser.Math.Easing.Expo.Out,
      onComplete: () => {
        this.tween = undefined;
        if (this.pipelineInstance) this.scene.cameras.main.removePostPipeline(this.pipelineInstance);
      }
    })
  }
}