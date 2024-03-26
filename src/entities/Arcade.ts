import { CATEGORY_OBJECT, CATEGORY_PLAYER, CATEGORY_SENSOR, CATEGORY_TERRAIN } from "../const/collisions";
import { BackgroundMusic } from "../models/BackgroundMusic";
import { Instrument } from "../models/Instrument";
import HUDScene from "../scenes/HUDScene";
import { FontName } from "../types";
import Character from "./Character";
import DropBucket from "./DropBucket/DropBucket";
import { ArcadeInfo } from "./HUD/ArcadeInfo";
import InteractableGameObject from "./InteractableGameObject";

export default class Arcade extends InteractableGameObject {
  public linkedBucket: DropBucket | undefined;
  private isLoading = false;
  private arcadeInfo: ArcadeInfo | undefined;
  // private titleTextfield: HoverText;
  // private highscoreTextfield: HoverText;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    name: string,
    frame?: string | number | undefined,
    bucket?: DropBucket,
    mirror?: boolean,
    options?: Phaser.Types.Physics.Matter.MatterBodyConfig | undefined
  ) {
    super(scene, x, y, name, 'arcade', frame, options);
    this.direction = mirror ? -1 : 1;
    this.interactable = true;
    this.name = `${name}-${this.scene.game.getTime()}`;
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
          xOffset: mirror ? -0.2 : 0.2, yOffset: 0
        }
      }
    });

    this.setExistingBody(body);
    
		this.setBounce(0);
    this.setFriction(0.1);
    this.setPipeline('Light2D');

    this.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);

    // Setup size depending on tier
    this.setScale(3);
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

    // this.titleTextfield = new HoverText(this.scene, this.linkedBucket?.getBGMConfig()?.title ?? '???', this.x, this.y - (this.displayHeight / 2) - 64, { fontFamily: FontName.REGULAR, fontSize: 24, movementY: 16, duration: 250 });
    
    // const highscore = LocalStorage.getHighscore(this.linkedBucket?.name ?? '')
    // const highscoreText = highscore > 0 ? `Best: ${highscore.toString()}` : 'No Highscore';
    // this.highscoreTextfield = new HoverText(this.scene, highscoreText, this.x, this.titleTextfield.y + 24, { fontFamily: FontName.BOLD, fontSize: 18, movementY: 16, duration: 250 });
  }

  public onCollisionStart (other: Character): void {
    super.onCollisionStart(other);
    // this.titleTextfield.start();

    // const highscore = LocalStorage.getHighscore(this.linkedBucket?.name ?? '')
    // const highscoreText = highscore > 0 ? `Best: ${highscore.toString()}` : 'No Highscore';
    // this.highscoreTextfield.setText(highscoreText);
    // this.highscoreTextfield.start();
    if (!this.arcadeInfo) this.arcadeInfo = (this.scene.scene.get('hud-scene') as HUDScene).getArcadeInfo(this);

    this.arcadeInfo.show();
  }

  public onCollisionEnd (other: Character): void {
    super.onCollisionEnd(other);
    // this.titleTextfield.end();
    // this.highscoreTextfield.end();
    // (this.scene.scene.get('hud-scene') as HUDScene).hideArcadeInfo(this);
    this.arcadeInfo?.hide();
  }

  public destroy (): void {
    // this.titleTextfield.destroy();
    // this.highscoreTextfield.destroy();
    this.arcadeInfo?.hide();
    super.destroy();
  }

  public trigger (referenceCharacter: Character): void {
    if (this.isLoading) return;
    // this.titleTextfield.end();
    // this.highscoreTextfield.end();

    // place character
    const referenceBody = referenceCharacter.getBody()
    if (this.body && referenceBody) {
      if (referenceBody.gameObject) referenceBody.gameObject.isAtArcade = true;
      referenceCharacter.setDirection(this.direction === 1 ? -1 : 1);
      // referenceCharacter.setX((this.body?.position.x ?? 0) - this.width);
      this.scene.matter.alignBody(referenceBody, this.body.position.x + (10 * this.direction), referenceCharacter.body?.position.y ?? 0, this.direction === -1 ? Phaser.Display.Align.RIGHT_CENTER : Phaser.Display.Align.LEFT_CENTER);
    }

    if (!this.linkedBucket) {
      const hudScene = this.scene.scene.get('hud-scene') as HUDScene | undefined;
      if (hudScene) hudScene.addBlinkingText('Not connected', {x: 0, y: 0}, { fontFamily: FontName.LIGHT, fadeInTime: 250, movementY: 16, fontSize: this.getScene().scaled(32), duration: 1000, referenceObject: this, updateReferencePosition: true });
    } else {
      this.isLoading = true;

      // This freeze inputs of player character
      this.getGameScene()?.getPlayerCharacter()?.setFreezeInputs(true);

      // const loadingText = new BlinkingText(this.scene, '0%', this.x, this.y - (this.displayHeight / 2) - 16, { fontSize: 24, movementY: 16, duration: 1000, manualEnd: true });
      
      BackgroundMusic.preloadByBGMKey(
        this.scene,
        this.linkedBucket.bgmKey,
        (value: number) => {
          const percentage = Math.round(value * 100);
          this.arcadeInfo?.updateLoadingPercentage(percentage);
          // loadingText.setText(`${percentage}%`);
        },
        () => {
          // loadingText.end();
          this.isLoading = false;
          this.linkedBucket?.mountBucket();
          this.arcadeInfo?.fadeOut();
        }
      );

      const sfx = this.scene.registry.get('instrument:confirm') as Instrument | undefined;
      if (sfx) sfx.playRandomNote(this.getScene(), 0, 0.5);
    }
  }
}
