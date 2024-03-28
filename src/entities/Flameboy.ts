import { CATEGORY_PLAYER, CATEGORY_SENSOR, CATEGORY_TERRAIN } from "../const/collisions";
import { Depths } from "../const/depths";
import HUDScene from "../scenes/HUDScene";
import Character from "./Character";

const texts = [
  "That's it. End of the line.\nThere's only one step left to finish this: Jump down!\nYour progess will be saved though. So, if you haven't found everything yet, you can get back to the start this way.\nWish you a nice holiday and so on.\nGet lost now, I want to enjoy my free time.",
  'Did I stutter? Jump down and enjoy starting over. Hunting Easter eggs is so much fun, I can barely contain myself!',
  'Come on. Don\'t waste my time. I have places to be.',
  'I give up.',
  '...'
];

export default class Flameboy extends Character {
  public textIndex = 0;
  private light: Phaser.GameObjects.Light | undefined;

  constructor(
    scene: Phaser.Scene,
    id: number,
    x: number,
    y: number,
    direction: 1 | -1,
    options?: Phaser.Types.Physics.Matter.MatterBodyConfig | undefined
  ) {
    super(scene, id, x, y, 'flameboy', '', '', options);
    this.setPipeline('Light2D');
    this.interactable = true;

    // Setup physics
    const Bodies = new Phaser.Physics.Matter.MatterPhysics(scene).bodies;
    const rect = Bodies.rectangle(0, 0, 26, 48, {
      inertia: Infinity,
      restitution: 0,
      friction: 0,
      frictionAir: 0,
      frictionStatic: 0,
      render: { sprite: { xOffset: 0, yOffset: 0 }},
      collisionFilter: {
        group: 0,
        category: CATEGORY_PLAYER,
        mask: CATEGORY_TERRAIN | CATEGORY_SENSOR
      }
    });

    rect.label = 'flameboy';

    this.setExistingBody(rect);
    this.setDepth(Depths.CHARACTER_LAYER);
    this.setScale(4);
    this.setPosition(x, y);
    this.setFixedRotation();
    this.direction = direction;

    this.light = this.scene.lights.addLight(x, y, 250, 0Xffc334, 1);

    this.sensor = this.scene.matter.add.rectangle(0, 0, 26 * this.scale, 48 * this.scale, {
      collisionFilter: {
        group: 0,
        category: CATEGORY_SENSOR,
        mask: CATEGORY_PLAYER
      },
      label: 'flameboy-sensor',
      isStatic: true,
      isSensor: true
    });

    this.sensor.gameObject = this;
    this.anims.createFromAseprite('flameboy');
    this.play({ key: 'idle', repeat: -1 });
    this.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
  }
  
  public trigger (_referenceCharacter: Character): void {
    this.getGameScene().setCinematicBar(0.5, 500);
    this.getGameScene().ignoreInputs = true;
    (this.scene.scene.get('hud-scene') as HUDScene).triggerSpeechBubble(this, texts[this.textIndex], () => {
      this.getGameScene().setCinematicBar(0, 500);
      this.getGameScene().ignoreInputs = false;
      this.textIndex++;
      if (this.textIndex + 1 > texts.length) this.textIndex = texts.length - 1; 
    });
  }

  public update (time: number, delta: number) {
    super.update(time, delta);
    if (this.light) this.light.setPosition(this.x, this.y);
  }
}
