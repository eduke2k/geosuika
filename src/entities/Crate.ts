import { CATEGORY_PLAYER, CATEGORY_TERRAIN, CATEGORY_TERRAIN_OBJECT } from "../const/collisions";
import GameScene from "../scenes/GameScene";
import GameObject from "./GameObject";

export class Crate extends GameObject {
  public constructor (scene: GameScene, id: number, x: number, y: number, scale: number) {
    super(scene, id, x, y, 'crate', 'crate', 0);
    this.setScale(scale);

    const Bodies = new Phaser.Physics.Matter.MatterPhysics(scene).bodies;
    const body = Bodies.rectangle(x, y, 32 * this.scale, 32 * this.scale, {
      label: 'terrainObject',
      mass: scale,
      collisionFilter: {
        group: 0,
        category: CATEGORY_TERRAIN_OBJECT,
        mask: CATEGORY_PLAYER | CATEGORY_TERRAIN | CATEGORY_TERRAIN_OBJECT
      }
    });

    this.setExistingBody(body);
    this.setPipeline('Light2D');

    this.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);

    // Add to scene render list
    scene.add.existing(this);
  }

  public destroy (): void {
    super.destroy();
  }
}