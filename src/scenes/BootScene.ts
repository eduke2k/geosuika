import Phaser from 'phaser'
import FontFaceObserver from 'fontfaceobserver';
import KirbyPNG from './../assets/kirby.png';
import KirbyJSON from './../assets/kirby.json';

export default class MainMenuScene extends Phaser.Scene {

	constructor() {
		super({ key: 'boot-scene', active: true })
	}

	public preload () {
    this.load.aseprite('kirby', KirbyPNG, KirbyJSON);
		// this.load.setBaseURL('https://labs.phaser.io')
		// this.load.image('sky', 'assets/skies/space3.png')
		// this.load.image('logo', 'assets/sprites/phaser3-logo.png')
		// this.load.image('red', 'assets/particles/red.png')
	}

	public async create () {
    console.log('--- Creating Boot Scene ---');

    const font = new FontFaceObserver('Coiny');
    await font.load();
    console.log('--- Finished Loading Fonts ---');

		this.anims.createFromAseprite('kirby');
		console.log('--- Finished Creating Animations from Spritesheets ---');

    this.scene.start('main-menu');
  }
}
