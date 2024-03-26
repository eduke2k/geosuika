import { CATEGORY_OBJECT, CATEGORY_PLAYER, CATEGORY_SENSOR, CATEGORY_TERRAIN } from "../const/collisions";
import { Instrument } from "../models/Instrument";
import HUDScene from "../scenes/HUDScene";
import Character from "./Character";
import InteractableGameObject from "./InteractableGameObject";

export default class GenericInteractable extends InteractableGameObject {
  public text: string;
  public collectible: boolean;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    w: number,
    h: number,
    scale: number,
    name: string,
    spriteKey: string,
    frame: string | number,
    text: string,
    collectible?: boolean,
    mirror?: boolean,
    options?: Phaser.Types.Physics.Matter.MatterBodyConfig | undefined
  ) {
    super(scene, x, y, name, spriteKey, frame, options);
    this.direction = mirror ? -1 : 1;
    this.interactable = true;
    this.name = name;
    this.text = text;
    this.collectible = collectible ?? false;

    // Setup physics
    const Bodies = new Phaser.Physics.Matter.MatterPhysics(scene).bodies;

    const body = Bodies.rectangle(0, 0, w, h, {
      label: this.name,
      collisionFilter: {
        group: 0,
        category: CATEGORY_OBJECT,
        mask: CATEGORY_TERRAIN
      },
      render: {
        sprite: {
          xOffset: 0, yOffset: 0
        }
      }
    });

    this.setExistingBody(body);
    
		this.setBounce(0);
    this.setFriction(0.1);
    this.setPipeline('Light2D');

    this.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);

    // Setup size depending on tier
    this.setScale(scale);
    this.setFixedRotation();

    if (this.body) this.scene.matter.alignBody(this.body as MatterJS.BodyType, x, y, Phaser.Display.Align.BOTTOM_CENTER);

    this.sensor = this.scene.matter.add.rectangle(0, 0, w * scale, h * scale, {
      collisionFilter: {
        group: 0,
        category: CATEGORY_SENSOR,
        mask: CATEGORY_PLAYER
      },
      label: `${name}-sensor`,
      isStatic: true,
      isSensor: true
    });

    this.sensor.gameObject = this;
  }
  
  private triggerExplodeParticles (): void {
    const quantity = 10;
    const emitter = this.scene.add.particles(this.body?.position.x, this.body?.position.y, 'flares', {
      frame: [4,5,6,7,8],
      lifespan: 1000,
      speed: { min: 20, max: 100 },
      scale: { start: 0.5, end: 0 },
      gravityY: 50,
      rotate: { min: 0, max: 360 },
      blendMode: 'ADD',
      emitting: false,
    });

    emitter.particleBringToTop = true;
    emitter.explode(quantity);

    this.scene.time.delayedCall(5000, function() {
      emitter.destroy();
    });
  }

  public playCollectSound (): void {
    const instrument = this.scene.registry.get('instrument:merge') as Instrument | undefined;
    if (instrument) {
      instrument.playRandomNote(this.getScene(), 0, 1);
    }
  }

  public trigger (referenceCharacter: Character): void {
    if (this.text) {
      (this.scene.scene.get('hud-scene') as HUDScene).triggerSpeechBubble(referenceCharacter, this.text);
    }

    if (this.collectible) {
      this.playCollectSound();
      this.getGameScene().setCollected(this.name);
      this.triggerExplodeParticles();
      this.destroy();
    }
  }
}
