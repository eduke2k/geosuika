import { randomFloatFromInterval, randomIntFromInterval } from "../functions/helper";
import md5 from 'md5';

const CHANGE_FORCE_TIME = 1000;
const BASE_VELOCITY_X = 20;
const BASE_VELOCITY_Y = 20;
const WINDFORCE_MULTIPLIER = 40;

export class Petal extends Phaser.GameObjects.Sprite {
  public id = md5(Date.now().toString());
  private addForceX = 0;
  private addForceY = 0;
  private targetAddForceX = 0;
  private targetAddForceY = 0;
  private windForce = new Phaser.Math.Vector2(0, 0);
  private changeForceTime = CHANGE_FORCE_TIME;

  public constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'petal');
    this.scene = scene;

    this.setScale(randomFloatFromInterval(0.5, 1.5));

    scene.add.existing(this);
    this.play({ key: 'petal:idle', repeat: -1 });
  }

  public addWindForce (vector: Phaser.Math.Vector2, strength: number): void {
    this.windForce = vector.scale(strength);
  }

  public update (_time: number, delta: number): void {
    const xIncrement = ((BASE_VELOCITY_X + this.addForceX - (this.windForce.x * WINDFORCE_MULTIPLIER)) * this.scale / delta);
    const yIncrement = ((BASE_VELOCITY_Y + this.addForceY - (this.windForce.y * WINDFORCE_MULTIPLIER)) * this.scale / delta);

    this.setPosition(
      this.x - xIncrement,
      this.y + yIncrement
    );

    const diffX = (this.targetAddForceX - this.addForceX) / delta;
    this.addForceX += diffX;

    const diffY = (this.targetAddForceY - this.addForceY) / delta;
    this.addForceY += diffY;

    // Reduce wind force
    const incrementX = ((0 - this.windForce.x) / 500 * delta);
    const incrementY = ((0 - this.windForce.y) / 500 * delta);

    this.windForce.set(
      this.windForce.x + incrementX,
      this.windForce.y + incrementY
    );

    // Add turbulence
    if (this.changeForceTime <= 0) {
      this.targetAddForceX = randomIntFromInterval(-BASE_VELOCITY_X, BASE_VELOCITY_X);
      this.targetAddForceY = randomIntFromInterval(-BASE_VELOCITY_Y, BASE_VELOCITY_Y);
      this.changeForceTime = CHANGE_FORCE_TIME + ((Math.random() - 0.5) * CHANGE_FORCE_TIME);
    } else {
      this.changeForceTime -= delta;
    }
  }
}