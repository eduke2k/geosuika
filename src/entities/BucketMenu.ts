import { MenuItem } from "../types";
import DropBucket from "./DropBucket";

const MENU_ITEM_GAP = 0;

export default class BucketMenu extends Phaser.GameObjects.Container {
  private bucket: DropBucket;
  private menuItems: MenuItem[] = [
    { label: 'Restart', key: 'restart' },
    { label: 'Leave', key: 'leave' },
  ];

  public constructor(
    bucket: DropBucket,
    x: number,
    y: number
  ) {
    super(bucket.scene, x, y);
    this.bucket = bucket;
    let yIncrement = 0;
    this.menuItems.forEach((item, i) => {
      const text = item;
      const t = this.scene.add.text(0, yIncrement * i, text.label.toUpperCase(), { font: "24px Coiny", align: "center" }).setOrigin(0, 0.5);
      this.add(t);
      const hitbox = new Phaser.Geom.Rectangle(0, 0, t.getBounds().width, t.getBounds().height);

      const config: Phaser.Types.Input.InputConfiguration = {
        hitArea: hitbox,
        hitAreaCallback: Phaser.Geom.Rectangle.Contains,
        useHandCursor: true
      }

      t.setInteractive(config);
      t.on('pointerover', () => { t.setTint(0x7878ff); });
      t.on('pointerout', () => { t.clearTint(); });
      t.on('pointerdown', () => { t.setTint(0xff0000); });
      t.on('pointerup', () => { t.clearTint(); this.handleAction(item.key) });
      yIncrement += t.getBounds().height + MENU_ITEM_GAP;
    });

    bucket.scene.add.existing(this);
  }

  private handleAction (key: string): void {
    switch (key) {
      case 'restart': this.bucket.restartBucket(); break;
      case 'leave': this.bucket.unmountBucket(); break;
    }
  }
}
