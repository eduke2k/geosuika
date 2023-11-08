export default class ExplosionForce extends Phaser.Physics.Matter.Sprite {
  private duration: number;
  private strength: number;
  private aliveTime = 0;
  public name: string;

  public constructor(
    name: string,
    scene: Phaser.Scene,
    x: number,
    y: number,
    radius: number,
    strength: number,
    duration: number
  ) {
    super(scene.matter.world, x, y, '');

    this.name = name;
    this.duration = duration;
    this.strength = strength;

    this.setBody(
      {
        type: 'circle',
        radius
      },
      {
        isSensor: true,
        isStatic: true,
        plugin: {
          attractors: [
            (bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType) => ({
              x: (bodyA.position.x - bodyB.position.x) * -this.strength,
              y: (bodyA.position.y - bodyB.position.y) * -this.strength
            })
          ]
        }
      }
    );

    scene.events.on('update', this.update, this);
  }

  public update (_time: number, delta: number): void {
    if (this.aliveTime >= this.duration) {
      // this.scene.events.off('update', this.update);
      this.destroy();
    }
    this.aliveTime += delta;
  }
}
