import { BackgroundMusic } from "../models/BackgroundMusic";
import GameScene from "../scenes/GameScene";
import BlinkingText from "./BlinkingText";
import DropBucket from "./DropBucket";

export default class Arcade extends Phaser.Physics.Matter.Sprite {
  private direction = 1;
  private linkedBucket: DropBucket | undefined;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    name: string,
    frame?: string | number | undefined,
    bucket?: DropBucket,
    options?: Phaser.Types.Physics.Matter.MatterBodyConfig | undefined
  ) {
    super(scene.matter.world, x, y, 'arcade', frame, options);
    this.direction = -1;
    this.name = name;
    this.linkedBucket = bucket;

    // Setup physics
    const Bodies = new Phaser.Physics.Matter.MatterPhysics(scene).bodies;
    const rect = Bodies.rectangle(0, 0, 26, 56, { render: { sprite: { xOffset: 0.1, yOffset: 0 }} });

    this.setExistingBody(rect);
		this.setBounce(0);
    this.setFriction(0.1);
    this.setPosition(x, y);
    this.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);

    // this.flipX = true;

    // Setup size depending on tier (just for testing)
    this.setScale(4);
    this.setFixedRotation();
    this.play({ key: 'arcade:idle', repeat: -1 });

    // Add to scene render list
    scene.add.existing(this);
  }

  public trigger (): void {
    if (!this.linkedBucket) {
      console.log(this.displayHeight);
      new BlinkingText(this.scene, 'Not connected', this.x, this.y - (this.displayHeight / 2) - 16, { fontSize: 24, movementY: 16, duration: 1000 });
    } else {
      const loadingText = new BlinkingText(this.scene, '0%', this.x, this.y - (this.displayHeight / 2) - 16, { fontSize: 24, movementY: 16, duration: 1000, manualEnd: true });
      BackgroundMusic.preloadByBGMKey(
        this.scene,
        'bgm02',
        (value: number) => {
          const percentage = Math.round(value * 100);
          loadingText.setText(`${percentage}%`);
        },
        () => {
          loadingText.end();
          this.linkedBucket?.mountBucket();
        }
      );
    }
  }

  public getGameScene (): GameScene | undefined {
    if (this.scene instanceof GameScene) return this.scene;
    return;
  }

  public update (_time: number, _delta: number): void {
    this.flipX = this.direction === -1;
  }
}
