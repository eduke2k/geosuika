import { CATEGORY_OBJECT, CATEGORY_PLAYER, CATEGORY_SENSOR, CATEGORY_TERRAIN } from "../const/collisions";
import { BackgroundMusic } from "../models/BackgroundMusic";
import { Instrument } from "../models/Instrument";
import { LocalStorage } from "../models/LocalStorage";
import BlinkingText from "./BlinkingText";
import Character from "./Character";
import DropBucket from "./DropBucket";
import GameObject from "./GameObject";
import HoverText from "./HoverText";

export default class Arcade extends GameObject {
  private linkedBucket: DropBucket | undefined;
  private isLoading = false;
  private titleTextfield: HoverText;
  private highscoreTextfield: HoverText;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    name: string,
    frame?: string | number | undefined,
    bucket?: DropBucket,
    options?: Phaser.Types.Physics.Matter.MatterBodyConfig | undefined
  ) {
    super(scene, x, y, name, 'arcade', frame, options);
    this.direction = -1;
    this.interactable = true;
    this.name = name;
    this.linkedBucket = bucket;

    // Setup physics
    const Bodies = new Phaser.Physics.Matter.MatterPhysics(scene).bodies;

    const body = Bodies.rectangle(0, 0, 26, 56, {
      label: name,
      collisionFilter: {
        group: 0,
        category: CATEGORY_OBJECT,
        mask: CATEGORY_TERRAIN
      },
      render: {
        sprite: {
          xOffset: 0.1, yOffset: 0
        }
      }
    });

    this.setExistingBody(body);
    
		this.setBounce(0);
    this.setFriction(0.1);

    this.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);

    // Setup size depending on tier
    this.setScale(4);
    this.setFixedRotation();

    if (this.body) this.scene.matter.alignBody(this.body as MatterJS.BodyType, x, y, Phaser.Display.Align.BOTTOM_CENTER);

    this.sensor = this.scene.matter.add.rectangle(0, 0, 28 * this.scale, 58 * this.scale, {
      collisionFilter: {
        group: 0,
        category: CATEGORY_SENSOR,
        mask: CATEGORY_PLAYER
      },
      label: 'arcade-sensor',
      isStatic: true,
      isSensor: true
    });

    this.sensor.gameObject = this;

    this.play({ key: 'arcade:idle', repeat: -1 });

    this.titleTextfield = new HoverText(this.scene, this.linkedBucket?.getBGMConfig()?.title ?? '???', this.x, this.y - (this.displayHeight / 2) - 64, { fontSize: 24, movementY: 16, duration: 250 });
    
    const highscore = LocalStorage.getHighscore(this.linkedBucket?.name ?? '')
    const highscoreText = highscore > 0 ? `Best: ${highscore.toString()}` : 'No Highscore';
    this.highscoreTextfield = new HoverText(this.scene, highscoreText, this.x, this.titleTextfield.y + 24, { fontSize: 18, movementY: 16, duration: 250 });
  }

  public onCollisionStart (other: Character): void {
    super.onCollisionStart(other);
    this.titleTextfield.start();

    const highscore = LocalStorage.getHighscore(this.linkedBucket?.name ?? '')
    const highscoreText = highscore > 0 ? `Best: ${highscore.toString()}` : 'No Highscore';
    this.highscoreTextfield.setText(highscoreText);
    this.highscoreTextfield.start();
    this.setVelocityY(-5);

    const sfx = this.scene.registry.get('instrument:musicbox') as Instrument | undefined;
    if (sfx) sfx.playRandomNote(this.scene, 0, 0.2);
  }

  public onCollisionEnd (other: Character): void {
    super.onCollisionEnd(other);
    this.titleTextfield.end();
    this.highscoreTextfield.end();
  }

  public trigger (): void {
    if (this.isLoading) return;
    this.titleTextfield.end();
    this.highscoreTextfield.end();

    if (!this.linkedBucket) {
      new BlinkingText(this.scene, 'Not connected', this.x, this.y - (this.displayHeight / 2) - 16, { fontSize: 24, movementY: 16, duration: 1000 });
    } else {
      this.isLoading = true;

      // This freeze inputs of player character
      this.getGameScene()?.getPlayerCharacter()?.setFreezeInputs(true);

      const loadingText = new BlinkingText(this.scene, '0%', this.x, this.y - (this.displayHeight / 2) - 16, { fontSize: 24, movementY: 16, duration: 1000, manualEnd: true });
      BackgroundMusic.preloadByBGMKey(
        this.scene,
        this.linkedBucket.bgmKey,
        (value: number) => {
          const percentage = Math.round(value * 100);
          loadingText.setText(`${percentage}%`);
        },
        () => {
          loadingText.end();
          this.isLoading = false;
          this.linkedBucket?.mountBucket();
        }
      );

      const sfx = this.scene.registry.get('instrument:confirm') as Instrument | undefined;
      if (sfx) sfx.playRandomNote(this.scene, 0, 0.5);
    }
  }
}
