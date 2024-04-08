import { CATEGORY_TERRAIN } from "../const/collisions";
import { getOtherGameObjectFromSensorEvent } from "../functions/helper";
import GameScene from "../scenes/GameScene";

export type SensorOptions = {
  teleportTargetId?: number;
  whitelist?: string[];
  action?: string;
}

export class Sensor {
  public body: MatterJS.BodyType;
  public scene: GameScene;
  public id: number;
  public x: number;
  public y: number;
  public w: number;
  public h: number;
  private action?: string;
  private teleportTargetId?: number;
  private whitelist?: string[];

  public constructor (scene: GameScene, id: number, x: number, y: number, w: number, h: number, options: SensorOptions) {
    this.scene = scene;
    this.id = id;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.teleportTargetId = options?.teleportTargetId;
    this.whitelist = options?.whitelist;
    this.action = options?.action;

    this.body = this.scene.matter.add.rectangle(x + (w / 2), y + (h / 2), w, h,
      {
        isSensor: true,
        isStatic: true,
        label: 'sensor',
        onCollideCallback: this.onCollide.bind(this),
        collisionFilter: {
          group: 0,
          category: CATEGORY_TERRAIN,
        }
      }
    )
  }

  public onCollide (pair: Phaser.Types.Physics.Matter.MatterCollisionData): void {
    const other = getOtherGameObjectFromSensorEvent(pair);
    if (other) {
      // TELEPORT LOGIC
      if (this.teleportTargetId) {
        if (this.whitelist && this.whitelist.length > 0) {
          // Whitelist check
          if (!this.whitelist.includes(other.name)) return;
        }
  
        // Teleport other object
        const target = this.scene.positions.find(p => p.id === this.teleportTargetId);
        if (target) {
          other.setPosition(target.x, target.y - ((other.height * other.scale) / 2));
          other.setVelocity(0, 0);
        }
      } else if (this.action) {
        if (this.action === 'credits') {
          this.scene.cameras.main.fadeOut(2000);
          this.scene.time.delayedCall(2000, () => {
            this.scene.exit(true);
            this.scene.scene.start('main-menu-scene').stop('game-scene').stop('pause-scene').stop('hud-scene');
          });
        }
      }
    }
  }

  public destroy (): void {
    if (this.scene) this.scene.matter.world.remove(this.body);
  }
}