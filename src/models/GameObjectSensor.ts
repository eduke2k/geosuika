import GameObject from "../entities/GameObject";

export class GameObjectSensor {
  public gameObject: GameObject;
  public body: MatterJS.BodyType;

  public constructor(gameObject: GameObject, body: MatterJS.BodyType) {
    this.gameObject = gameObject;
    this.body = body;
  }
}