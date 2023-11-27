import { MovementBehaviour } from "../behaviour/MovementBehaviour";
import Character from "./Character";

export default class Dog extends Character {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    options?: Phaser.Types.Physics.Matter.MatterBodyConfig | undefined
  ) {
    super(scene, x, y, 'flags', options);
    this.movementBehaviour = new MovementBehaviour(this);

    // Setup physics
    const Bodies = new Phaser.Physics.Matter.MatterPhysics(scene).bodies;
    const rect = Bodies.rectangle(0, 0, 179, 290, { chamfer: { radius: 25 }, render: { sprite: { xOffset: 0, yOffset: 0.18 }} });

    this.setExistingBody(rect);
    this.setScale(0.5);
    this.setPosition(x, y);
    this.play({ key: 'idle', repeat: -1 });
  }

  public update (_time: number, delta: number) {
    // Handle Inputs
    this.handleInputs(delta);
  }
}
