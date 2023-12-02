import { Depths } from "../const/depths";
import { Petal } from "../entities/Petal";
import { randomIntFromInterval, scaleNumberRange } from "../functions/helper";

const MAX_FREQUENCY = 250;
const MIN_FREQUENCY = 5000;
const MAX_PETALS = 200;

export class PetalEmitter {
  private petals: Petal[] = [];
  private scene: Phaser.Scene;
  private frequency = MIN_FREQUENCY;
  private intensity = 0;
  private emitting = false;
  private emitTimer = this.frequency
  private tint = 0xFFFFFF;

  public constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.setIntesity(0);
  }

  public isEmitting (): boolean {
    return this.emitting;
  }

  public resetTint (): void {
    this.tint = 0xFFFFFF;
  }

  public setTint (tint: number): void {
    this.tint = tint;
  }

  public triggerWind (x: number, y: number, strength: number): void {
    this.petals.forEach(p => {
      const distance = Phaser.Math.Distance.BetweenPoints({ x, y }, { x: p.x, y: p.y });
      const effect = 1000 / Math.max(distance, 1);
      const vector = new Phaser.Math.Vector2(p.x - x, y - p.y).normalize();
      p.addWindForce(vector, effect * strength);
    });
  }

  public setIntesity (intensity: number): void {
    this.intensity = intensity;
    this.frequency = scaleNumberRange(intensity, [1, 0], [MAX_FREQUENCY, MIN_FREQUENCY]);
    this.emitting = intensity > 0;
  }

  public getIntensity (): number {
    return this.intensity;
  }

  private emit (): void {
    if (this.petals.length >= MAX_PETALS) return;
    const spawnY = this.scene.cameras.main.worldView.top - 50;
    const spawnX = [this.scene.cameras.main.worldView.left - 50, this.scene.cameras.main.worldView.right + (this.scene.cameras.main.width / 2)];

    const petal = new Petal(this.scene, randomIntFromInterval(spawnX[0], spawnX[1]), spawnY, this.tint);
    petal.setDepth(Depths.FOREGROUND_LAYER);

    this.petals.push(petal);
    petal.play({ key: 'petal:idle', repeat: -1 });
  }

  public update (time: number, delta: number): void {
    this.petals.forEach(p => {
      p.update(time, delta);

      if (p.x < this.scene.cameras.main.worldView.left - 50 || p.y > this.scene.cameras.main.worldView.bottom + 50) {
        const i = this.petals.findIndex(petal => petal === p);
        if (i > -1) this.petals.splice(i, 1);
        p.destroy();
      }
    });

    if (!this.emitting) return;
    if (this.emitTimer <= 0) {
      this.emitTimer = this.frequency + ((Math.random() - 0.5) * this.frequency / 2);
      this.emit();
    } else {
      this.emitTimer -= delta;
    }
  }
}