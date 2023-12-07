import { MovementBehaviour } from "../behaviour/MovementBehaviour";
import { CATEGORY_PLAYER, CATEGORY_SENSOR, CATEGORY_TERRAIN } from "../const/collisions";
import { Depths } from "../const/depths";
import Character from "./Character";

export default class Dog extends Character {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    options?: Phaser.Types.Physics.Matter.MatterBodyConfig | undefined
  ) {
    super(scene, x, y, 'dog', 'flags', '', options);
    this.movementBehaviour = new MovementBehaviour(this);

    // Setup physics
    const Bodies = new Phaser.Physics.Matter.MatterPhysics(scene).bodies;
    const rect = Bodies.rectangle(0, 0, 150, 260, {
      inertia: Infinity,
      restitution: 0,
      friction: 0,
      frictionAir: 0,
      frictionStatic: 0,
      // gravityScale: { x: 1, y: 1 },
      // ignoreGravity: true,
      chamfer: { radius: 75 },
      render: { sprite: { xOffset: 0, yOffset: 0.21 }},
      collisionFilter: {
        group: 0,
        category: CATEGORY_PLAYER,
        mask: CATEGORY_TERRAIN | CATEGORY_SENSOR
      }
    });

    rect.label = 'dog';

    this.movementBehaviour.acceleration = 4;
    this.movementBehaviour.deacceleration = 10;

    this.setExistingBody(rect);
    this.setDepth(Depths.PLAYER_LAYER);
    this.setScale(0.5);
    this.setPosition(x, y);
    this.setFixedRotation();
    this.play({ key: 'idle', repeat: -1 });
  }

  public update (time: number, delta: number) {
    super.update(time, delta);
  }
}
