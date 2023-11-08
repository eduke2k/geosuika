import Phaser from 'phaser'
import FontFaceObserver from 'fontfaceobserver';
import YatoPNG from './../assets/yato.png';
import YatoJSON from './../assets/yato.json';
import DogPNG from './../assets/dog.png';
import DogJSON from './../assets/dog.json';
import FlagsPNG from './../assets/flags.png';
import FlagsJSON from './../assets/flags.json';


import TilesPNG from './../assets/tilesets/tilesheet_complete.png';
import TilesJSON from './../assets/tilesets/map.json';

export default class MainMenuScene extends Phaser.Scene {

	constructor() {
		super({ key: 'boot-scene', active: true })
	}

	public preload () {
		this.load.aseprite('yato', YatoPNG, YatoJSON);
		this.load.aseprite('dog', DogPNG, DogJSON);
		this.load.aseprite('flags', FlagsPNG, FlagsJSON);
	
		// load the PNG file
		this.load.image('tileset', TilesPNG)

		// load the JSON file
		this.load.tilemapTiledJSON('tilemap', TilesJSON)

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
