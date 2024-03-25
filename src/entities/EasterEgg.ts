import { CATEGORY_OBJECT, CATEGORY_PLAYER, CATEGORY_SENSOR, CATEGORY_TERRAIN } from "../const/collisions";
import Character from "./Character";
import InteractableGameObject from "./InteractableGameObject";

export default class EasterEgg extends InteractableGameObject {
  private eggType: string;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    eggType: string,
    frame?: string | number | undefined,
    options?: Phaser.Types.Physics.Matter.MatterBodyConfig | undefined
  ) {
    super(scene, x, y, `egg-${eggType}`, 'eggs', frame, options);
    this.direction = 1;
    this.interactable = true;
    this.eggType = eggType;
    this.name = `${name}-${eggType}-${this.scene.game.getTime()}`;

    // Setup physics
    const Bodies = new Phaser.Physics.Matter.MatterPhysics(scene).bodies;

    const body = Bodies.rectangle(0, 0, 18, 18, {
      label: `egg-${this.eggType}`,
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
    this.setScale(4);
    this.setFixedRotation();

    if (this.body) this.scene.matter.alignBody(this.body as MatterJS.BodyType, x, y, Phaser.Display.Align.BOTTOM_CENTER);

    this.sensor = this.scene.matter.add.rectangle(0, 0, 28 * this.scale, 58 * this.scale, {
      collisionFilter: {
        group: 0,
        category: CATEGORY_SENSOR,
        mask: CATEGORY_PLAYER
      },
      label: 'egg-sensor',
      isStatic: true,
      isSensor: true
    });

    this.sensor.gameObject = this;

    this.play({ key: `egg:${this.eggType}`, repeat: -1 });  }

  public trigger (referenceCharacter: Character): void {
    console.log('trigger egg', referenceCharacter);
  }
}
