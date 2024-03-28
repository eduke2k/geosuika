import { MovementBehaviour } from "../behaviour/MovementBehaviour";
import { StepSoundBehaviour } from "../behaviour/StepSoundBehaviour";
import { CATEGORY_ONEWAY_PLATFORM, CATEGORY_PLAYER, CATEGORY_SENSOR, CATEGORY_TERRAIN, CATEGORY_TERRAIN_OBJECT } from "../const/collisions";
import { Depths } from "../const/depths";
import { SFX } from "../models/SFX";
import GameScene from "../scenes/GameScene";
import HUDScene from "../scenes/HUDScene";
import Character from "./Character";

export default class Achan extends Character {
  constructor(
    scene: GameScene,
    id: number,
    x: number,
    y: number,
    options?: Phaser.Types.Physics.Matter.MatterBodyConfig | undefined
  ) {
    super(scene, id, x, y, 'achan', 'creepyEasterBunny', 'sfx:achan', options);
    this.movementBehaviour = new MovementBehaviour(this);
    this.interactable = false;
    this.portraitKey = 'portrait:achan';

    const stepSFX = this.scene.registry.get('sfx:steps') as SFX | undefined;
    if (stepSFX) this.stepSoundBehaviour = new StepSoundBehaviour(scene, stepSFX, [3, 7]);

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
        mask: CATEGORY_TERRAIN | CATEGORY_SENSOR | CATEGORY_TERRAIN_OBJECT | CATEGORY_ONEWAY_PLATFORM
      }
    });

    rect.label = 'achan';

    this.movementBehaviour.acceleration = 4;
    this.airControl = 0.5;
    this.movementBehaviour.deacceleration = 10;
    this.movementBehaviour.maxSpeed = 4;

    this.setPlayerControlled(true);
    this.setExistingBody(rect);
    this.setScale(4);
    this.setDepth(Depths.PLAYER_LAYER);
    this.setPosition(x, y);
    this.setFixedRotation();
    this.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);

		this.anims.createFromAseprite('creepyEasterBunny');
    // this.play({ key: 'achan:idle', repeat: -1 });
  }

  public update (time: number, delta: number) {
    super.update(time, delta);

    const hudScene = this.scene.scene.get('hud-scene') as HUDScene | undefined;
    if (hudScene) hudScene.addDebugText(this.state);
  }
}
