import { CATEGORY_PLAYER, CATEGORY_TERRAIN_OBJECT } from "../const/collisions";

export default class RecyclingCan extends Phaser.Physics.Matter.Sprite {
  public constructor(scene: Phaser.Scene, x: number, y: number, frame: string) {
    super(scene.matter.world, x, y, 'recyclingCan');

    // Setup physics
    const Bodies = new Phaser.Physics.Matter.MatterPhysics(scene).bodies;

    const body = Bodies.rectangle(x, y, 32, 64, {
      label: 'terrainObject',
      collisionFilter: {
        group: 0,
        category: CATEGORY_TERRAIN_OBJECT,
        mask: CATEGORY_PLAYER
      },
      isStatic: true
    });

    this.setExistingBody(body);
		this.anims.createFromAseprite('recyclingCan');

    this.play({ key: frame, repeat: -1 });
    this.setActive(false);

    this.setScale(2);
    this.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);

    // Align bottom
    if (this.body) this.scene.matter.alignBody(this.body as MatterJS.BodyType, x, y, Phaser.Display.Align.BOTTOM_CENTER);

    // Add to scene render list
    scene.add.existing(this);
  }
}