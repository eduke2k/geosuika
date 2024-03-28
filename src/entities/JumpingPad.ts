import { CATEGORY_PLAYER, CATEGORY_TERRAIN, CATEGORY_TERRAIN_OBJECT } from "../const/collisions";
import GameScene from "../scenes/GameScene";
import GameObject from "./GameObject";

export class JumpingPad extends GameObject {
  public strength = 1;

  public constructor (scene: GameScene, id: number, x: number, y: number, strength: number) {
    super(scene, id, x, y, 'jumpingPad', 'jumpingPad');
    this.strength = strength;
    this.setScale(4);


    const Bodies = new Phaser.Physics.Matter.MatterPhysics(scene).bodies;
    const body = Bodies.rectangle(x, y, 32 * this.scale, 24 * this.scale, {
      label: 'terrainObject',
      mass: 1,
      chamfer: {
        radius: 5,
      },
      collisionFilter: {
        group: 0,
        category: CATEGORY_TERRAIN_OBJECT,
        mask: CATEGORY_PLAYER | CATEGORY_TERRAIN | CATEGORY_TERRAIN_OBJECT
      }
    });

    this.setExistingBody(body);
    this.play({ key: 'shroom:idle', repeat: -1 });

    this.setPipeline('Light2D');

    this.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
    this.setFixedRotation();

    // Add to scene render list
    scene.add.existing(this);
  }

  public destroy (): void {
    super.destroy();
  }
}