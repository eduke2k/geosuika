export default class Droppable extends Phaser.Physics.Matter.Sprite {
  private tier: number;

  constructor(
    scene: Phaser.Scene,
    tier: number,
    x: number,
    y: number,
    texture: string | Phaser.Textures.Texture,
    frame?: string | number | undefined,
    options?: Phaser.Types.Physics.Matter.MatterBodyConfig | undefined
  ) {
    super(scene.matter.world, x, y, texture, frame, options);
    this.tier = tier;

    // Setup physics
    this.setBody({ type: 'circle', radius: 24	});
		// this.play({ key: 'idle', repeat: -1 });
		this.setAngle(Math.random() * 180);
		this.setBounce(0);
    this.setFriction(0.1);

    // Setup size depending on tier (just for testing)
    this.setScale(1 + 0.5 * tier);

    // Add to scene render list
    scene.add.existing(this);
  }

  public setTier (tier: number): void {
    this.tier = tier;
  }

  public getTier (): number {
    return this.tier;
  }
}
