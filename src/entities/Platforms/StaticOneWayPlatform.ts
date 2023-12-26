// import { CATEGORY_EMPTY, CATEGORY_ONEWAY_PLATFORM } from "../../const/collisions";
import { CATEGORY_BUCKET, CATEGORY_ONEWAY_PLATFORM } from "../../const/collisions";
import BaseScene from "../../scenes/BaseScene";
import GameScene from "../../scenes/GameScene";
import Character from "../Character";

/**
 * This a pretty hacky way to implement one way platforms.
 * It works in a way that each platform instance will receive a character in it's update loop.
 * This also means that this system only works for a single character. I haven't found a good way to
 * make this work for all characters independently since the collision changes are happening globally to
 * the body when the character tries to drop down or go up the platform.
 * 
 * In the update loop, the y position of the character and the platform are compared and depending
 * on if the feet of the character are below the top side of the platform or not, a collision filter
 * category is applied to the body to either disable collisions or enable them. In case a character wants
 * to drop down, the `disableCollision` method can be invoked which will disable collisions for 1 frame, which
 * seems to work well enough.
 */
export class StaticOneWayPlatform {
  private scene: BaseScene;
  private x: number;
  private y: number;
  private w: number;
  private h: number;
  public body: MatterJS.BodyType;
  private isAbove = false;

  public constructor (scene: GameScene, x: number, y: number, w: number, h: number) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.body = this.scene.matter.add.rectangle(
      this.x + (this.w / 2),
      this.y + (this.h / 2),
      this.w,
      this.h,
      {
        isStatic: true,
        label: 'oneway-platform',
        collisionFilter: {
          group: 0,
          category: CATEGORY_BUCKET,
        }
      }
    )
  }

  public destroy (): void {
    if (this.scene) this.scene.matter.world.remove(this.body);
  }

  public disableCollision (): void {
    this.isAbove = false;
    this.body.collisionFilter.category = CATEGORY_BUCKET;
  }

  public update (player: Character): void {
    const platformThreshold = this.isAbove ? (this.y + this.h ?? 0) : this.y;
    const charactorBottom = player.getBounds().bottom;

    const wasAbove = this.isAbove;

    if (platformThreshold >= charactorBottom) {
      this.isAbove = true;
    } else {
      this.isAbove = false;
    }

    if (wasAbove !== this.isAbove) {
      if (!this.isAbove && this.body) {
        this.body.collisionFilter.category = CATEGORY_BUCKET;
      } else if (this.isAbove) {
        this.body.collisionFilter.category = CATEGORY_ONEWAY_PLATFORM;
      }
    }
  }
}