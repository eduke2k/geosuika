import { CATEGORY_PLAYER, CATEGORY_TERRAIN, CATEGORY_TERRAIN_OBJECT } from "../const/collisions";
import { randomFloatFromInterval, randomIntFromInterval } from "../functions/helper";
import GameScene from "../scenes/GameScene";
import GameObject from "./GameObject";

export type SmallLampFrame = 'white_red';

export type SmallLampOptions = {
  frame?: SmallLampFrame,
  ropeLength?: number,
  constrained?: boolean
}

export class SmallLamp extends GameObject {
  private light: Phaser.GameObjects.Light | undefined;
  private constraint: MatterJS.ConstraintType | undefined;
  private ropeLength: number;

  private baseLightIntensity = 2;
  private lightIntensityMultiplier = 1;
  private lightIntensityChangeDeviation = 0.5;
  private lightIntensityChangeInterval: [number, number] = [250, 500];
  private lightIntesityChangeTime = 0;

  private baseLightRadius = 150;

  public constructor (scene: GameScene, id: number, x: number, y: number, options?: SmallLampOptions) {
    super(scene, id, x, y, 'smallLamp', 'smallLamp');
    this.ropeLength = options?.ropeLength ?? 10;
    const Bodies = new Phaser.Physics.Matter.MatterPhysics(scene).bodies;
    const body = Bodies.rectangle(x, y + (61 / 2) + this.ropeLength, 64, 61, {
      label: 'terrainObject',
      chamfer: {
        radius: 22
      },
      collisionFilter: {
        group: 0,
        category: CATEGORY_TERRAIN_OBJECT,
        mask: CATEGORY_PLAYER | CATEGORY_TERRAIN | CATEGORY_TERRAIN_OBJECT
      }
    });

    this.setExistingBody(body);

    if (options?.constrained) {
      this.constraint = this.scene.matter.add.worldConstraint(body, this.ropeLength, 0.05, { pointA: { x, y }, pointB: { x: 0.5, y: -30 }});
    }

    this.anims.createFromAseprite('smallLamp');
    this.play({ key: options?.frame ?? 'white_red', repeat: -1 });

    this.setPipeline('Light2D');

    this.light = this.scene.lights.addLight(0, 0, this.baseLightRadius, 0xFF3300, this.baseLightIntensity);

    // Add to scene render list
    scene.add.existing(this);
  }

  public destroy (): void {
    if (this.constraint && this.scene) this.scene.matter.world.remove(this.constraint);
    if (this.light && this.scene) this.scene.lights.removeLight(this.light);
    super.destroy();
  }

  public update (_time: number, delta: number): void {
    if (this.light) {
      this.light.setPosition(this.body?.position.x ?? 0, this.body?.position.y ?? 0);

      if (this.lightIntesityChangeTime <= 0) {
        this.lightIntesityChangeTime = randomIntFromInterval(this.lightIntensityChangeInterval[0], this.lightIntensityChangeInterval[1]);
        this.lightIntensityMultiplier = randomFloatFromInterval(this.baseLightIntensity - (this.baseLightIntensity * (this.lightIntensityChangeDeviation / 2)), this.baseLightIntensity + (this.baseLightIntensity * (this.lightIntensityChangeDeviation / 2))) / this.baseLightIntensity;
      } else {
        this.lightIntesityChangeTime -= delta;
      }
  
      // Update Light intensity
      this.light.setIntensity((((this.baseLightIntensity * this.lightIntensityMultiplier) - this.light.intensity) / 2 / delta) + this.light.intensity)
      this.light.setRadius((((this.baseLightRadius * this.lightIntensityMultiplier) - this.light.radius) / 2 / delta) + this.light.radius)
    }
  }
}