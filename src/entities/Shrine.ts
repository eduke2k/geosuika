import { CATEGORY_OBJECT, CATEGORY_PLAYER, CATEGORY_SENSOR, CATEGORY_TERRAIN } from "../const/collisions";
import Character from "./Character";
import InteractableGameObject from "./InteractableGameObject";

export type ShrineTag = 'tori' | 'bollard';

export default class Shrine extends InteractableGameObject {
  private tag: ShrineTag = 'tori';
  private target: string;

  constructor(
    scene: Phaser.Scene,
    id: number,
    x: number,
    y: number,
    tag: ShrineTag,
    target: string,
    options?: Phaser.Types.Physics.Matter.MatterBodyConfig | undefined
  ) {
    super(scene, id, x, y, `shrine`, 'shrine', '', options);
    this.direction = 1;
    this.interactable = true;
    this.tag = tag;
    this.target = target;

    // Setup physics
    const Bodies = new Phaser.Physics.Matter.MatterPhysics(scene).bodies;


    let w = 64;
    let h = 64;

    if (this.tag === 'tori') { w = 40; h = 56; }

    const body = Bodies.rectangle(0, 0, w, h, {
      label: `shrine`,
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

    // Setup size depending on tier
    this.setScale(4);
    this.setFixedRotation();

    if (this.body) this.scene.matter.alignBody(this.body as MatterJS.BodyType, x, y, Phaser.Display.Align.BOTTOM_CENTER);

    this.sensor = this.scene.matter.add.rectangle(0, 0, w * this.scale, h * this.scale, {
      collisionFilter: {
        group: 0,
        category: CATEGORY_SENSOR,
        mask: CATEGORY_PLAYER
      },
      label: 'shrine-sensor',
      isStatic: true,
      isSensor: true
    });

    this.sensor.gameObject = this;
    this.play({ key: `shrine:${this.tag}`, repeat: -1 });
    this.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
  }

  public trigger (_referenceCharacter: Character): void {
    this.getGameScene()?.startLayerChange(this.target);
  }
}
