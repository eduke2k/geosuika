import { CATEGORY_OBJECT, CATEGORY_PLAYER, CATEGORY_SENSOR, CATEGORY_TERRAIN } from "../const/collisions";
import Character from "./Character";
import InteractableGameObject from "./InteractableGameObject";

export default class GenericInteractable extends InteractableGameObject {
  public text: string;

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
    mirror?: boolean,
    options?: Phaser.Types.Physics.Matter.MatterBodyConfig | undefined
  ) {
    super(scene, x, y, name, spriteKey, frame, options);
    this.direction = mirror ? -1 : 1;
    this.interactable = true;
    this.name = name;
    this.text = text;

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

    this.sensor = this.scene.matter.add.rectangle(0, 0, 28 * scale, 58 * scale, {
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

    console.log('created', this);
  }

  public trigger (referenceCharacter: Character): void {
    console.log('trigger', referenceCharacter);
    console.log('text', this.text);
  }
}
