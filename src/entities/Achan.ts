import { MovementBehaviour } from "../behaviour/MovementBehaviour";
import { StepSoundBehaviour } from "../behaviour/StepSoundBehaviour";
import { CATEGORY_PLAYER, CATEGORY_SENSOR, CATEGORY_TERRAIN } from "../const/collisions";
import { Depths } from "../const/depths";
import { SFX } from "../models/SFX";
import Character from "./Character";

export default class Achan extends Character {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    options?: Phaser.Types.Physics.Matter.MatterBodyConfig | undefined
  ) {
    super(scene, x, y, 'achan', 'achan', 'sfx:achan', options);
    this.movementBehaviour = new MovementBehaviour(this);

    const stepSFX = this.scene.registry.get('sfx:steps') as SFX | undefined;
    if (stepSFX) this.stepSoundBehaviour = new StepSoundBehaviour(this.scene, stepSFX, [3, 7]);

    // Setup physics
    const Bodies = new Phaser.Physics.Matter.MatterPhysics(scene).bodies;
    const rect = Bodies.rectangle(0, 0, 14, 36, {
      inertia: Infinity,
      restitution: 0,
      friction: 0,
      frictionAir: 0,
      frictionStatic: 0,
      chamfer: { radius: 7 },
      render: { sprite: { xOffset: 0, yOffset: 0.08 }},
      collisionFilter: {
        group: 0,
        category: CATEGORY_PLAYER,
        mask: CATEGORY_TERRAIN | CATEGORY_SENSOR
      }
    });

    rect.label = 'achan';

    this.movementBehaviour.acceleration = 4;
    this.airControl = 0.3;
    this.movementBehaviour.deacceleration = 10;
    this.movementBehaviour.maxSpeed = 6;

    this.setPlayerControlled(true);
    this.setExistingBody(rect);
    this.setScale(6);
    this.setDepth(Depths.PLAYER_LAYER);
    this.setPosition(x, y);
    this.setFixedRotation();
    this.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);

    this.postFX.addShadow(10, 10, 1, 1, undefined, 1, 1);
		this.anims.createFromAseprite('achan');
    // this.play({ key: 'achan:idle', repeat: -1 });
  }

  public update (time: number, delta: number) {
    super.update(time, delta);
  }
}