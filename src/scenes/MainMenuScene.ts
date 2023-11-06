import Phaser from 'phaser'
import FontFaceObserver from 'fontfaceobserver';
import { MenuItem } from '../types';
const MENU_PADDING = 36;
const MENU_ITEM_GAP = 0;

export default class MainMenuScene extends Phaser.Scene {
  private menuContainer!: Phaser.GameObjects.Container;
  private menuItems: MenuItem[] = [
    { label: 'Play', key: 'play' },
    { label: 'Credits', key: 'credits' },
  ];

	constructor() {
		super({ key: 'main-menu', active: true })
	}

	public preload () {
		this.load.setBaseURL('https://labs.phaser.io')
		this.load.image('sky', 'assets/skies/space3.png')
	}

  private handleAction (key: string): void {
    switch (key) {
      case 'play': this.scene.start('game-scene'); break;
      case 'credits': console.log('implement me'); break;
    }
  }

	public async create () {
    const font = new FontFaceObserver('Coiny');
    await font.load();

    this.menuContainer = this.add.container(0, 0);

    let y = 0;
    this.menuItems.forEach((item, i) => {
      const text = item;
      const t = this.add.text(0, y * i, text.label.toUpperCase(), { font: "32px Coiny", align: "center" });
      this.menuContainer.add(t);
      const hitbox = new Phaser.Geom.Rectangle(0, 0, t.getBounds().width, t.getBounds().height);
      t.setInteractive(hitbox, Phaser.Geom.Rectangle.Contains);
      t.on('pointerover', () => { t.setTint(0x7878ff); });
      t.on('pointerout', () => { t.clearTint(); });
      t.on('pointerdown', () => { t.setTint(0xff0000); });
      t.on('pointerup', () => { t.clearTint(); this.handleAction(item.key) });
      y += t.getBounds().height + MENU_ITEM_GAP;
    });

    this.menuContainer.setY(this.game.canvas.height - this.menuContainer.getBounds().height - MENU_PADDING);
    this.menuContainer.setX(MENU_PADDING);
  }
}
