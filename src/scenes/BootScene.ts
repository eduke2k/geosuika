import Phaser from 'phaser'
import FontFaceObserver from 'fontfaceobserver';
import YatoPNG from './../assets/yato.png';
import YatoJSON from './../assets/yato.json';
import DogPNG from './../assets/dog.png';
import DogJSON from './../assets/dog.json';
import FlagsPNG from './../assets/flags.png';
import FlagsJSON from './../assets/flags.json';
import TetrominosPNG from './../assets/tetrominos.png';
import TetrominosJSON from './../assets/tetrominos.json';
import TetrominosShapesJSON from './../shapes/tetrominos.json';
import ProgressArrowPNG from './../assets/progressArrow.png';
import ProgressArrowJSON from './../assets/progressArrow.json';
import ScoreLabelPNG from './../assets/scoreLabel.png';
import ScoreLabelJSON from './../assets/scoreLabel.json';
import FlaresPNG from './../assets/flares.png';
import FlaresJSON from './../assets/flares.json';
import DangerLinePNG from './../assets/dangerLine.png';
import DangerLineJSON from './../assets/dangerLine.json';

// Audio SFX
import HarpSFX from './../assets/sfx/harp.ogg';
import BassSFX from './../assets/sfx/bass.ogg';

// Audio BGM
import Bgm01ChelloChord from './../assets/bgm/bgm01/chello-chord.ogg';
import Bgm01BackingVoice from './../assets/bgm/bgm01/backing-voice.ogg';
import Bgm01Bass from './../assets/bgm/bgm01/bass.ogg';
import Bgm01ChelloMelody from './../assets/bgm/bgm01/chello-melody.ogg';
import Bgm01KamoVoice from './../assets/bgm/bgm01/kamo-voice.ogg';
import Bgm01MainVoice from './../assets/bgm/bgm01/main-voice.ogg';
import Bgm01Piano from './../assets/bgm/bgm01/piano.ogg';

// Tiles
import TilesPNG from './../assets/tilesets/tilesheet_complete.png';
import TilesJSON from './../assets/tilesets/map.json';
import { Instrument } from '../models/Instrument';

export default class MainMenuScene extends Phaser.Scene {

	constructor() {
		super({ key: 'boot-scene', active: true })
	}

	public preload () {
		// IMPORTANT: When adding new aseprite sprites, don't forget to load their animations in the create-method.
		this.load.aseprite('yato', YatoPNG, YatoJSON);
		this.load.aseprite('dog', DogPNG, DogJSON);
		this.load.aseprite('flags', FlagsPNG, FlagsJSON);
		this.load.aseprite('tetrominos', TetrominosPNG, TetrominosJSON);
		this.load.aseprite('progressArrow', ProgressArrowPNG, ProgressArrowJSON);
		this.load.aseprite('scoreLabel', ScoreLabelPNG, ScoreLabelJSON);
		this.load.aseprite('flares', FlaresPNG, FlaresJSON);
		this.load.aseprite('dangerLine', DangerLinePNG, DangerLineJSON);

		// Audio SFX
		// Don't forget to register the corresponsing instrument when adding new instrument sfx files
		this.load.audio('harp', HarpSFX);
		this.load.audio('bass', BassSFX);

		// Audio BGM
		this.load.audio('bgm01-chello-chord', Bgm01ChelloChord);
		this.load.audio('bgm01-backing-voice', Bgm01BackingVoice);
		this.load.audio('bgm01-bass', Bgm01Bass);
		this.load.audio('bgm01-chello-melody', Bgm01ChelloMelody);
		this.load.audio('bgm01-kamo-voice', Bgm01KamoVoice);
		this.load.audio('bgm01-main-voice', Bgm01MainVoice);
		this.load.audio('bgm01-piano', Bgm01Piano);

		// this.load.audio('harpC2', HarpC2);
		// this.load.audio('harpCSharp2', HarpCSharp2);
		// this.load.audio('harpD2', HarpD2);
		// this.load.audio('harpDSharp2', HarpDSharp2);
		// this.load.audio('harpE2', HarpE2);
		// this.load.audio('harpF2', HarpF2);
		// this.load.audio('harpFSharp2', HarpFSharp2);
		// this.load.audio('harpG2', HarpG2);
		// this.load.audio('harpGSharp2', HarpGSharp2);
		// this.load.audio('harpA2', HarpA2);
		// this.load.audio('harpASharp2', HarpASharp2);
		// this.load.audio('harpB2', HarpB2);
		// this.load.audio('harpC3', HarpC3);
		// this.load.audio('harpCSharp3', HarpCSharp3);
		// this.load.audio('harpD3', HarpD3);
		// this.load.audio('harpDSharp3', HarpDSharp3);
		// this.load.audio('harpE3', HarpE3);
		// this.load.audio('harpF3', HarpF3);
		// this.load.audio('harpFSharp3', HarpFSharp3);
		// this.load.audio('harpG3', HarpG3);
		// this.load.audio('harpGSharp3', HarpGSharp3);
		// this.load.audio('harpA3', HarpA3);
		// this.load.audio('harpASharp3', HarpASharp3);
		// this.load.audio('harpB3', HarpB3);

    // Load body shapes from JSON file generated using PhysicsEditor
    this.load.json('shapes', TetrominosShapesJSON);

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

		this.registry.set('instument:harp', new Instrument({ key: 'harp', octaves: 3, audioMarkerDuration: 4 }));
		this.registry.set('instument:bass', new Instrument({ key: 'bass', octaves: 2, audioMarkerDuration: 4 }));
		console.log('---finished loading instruments');

		this.anims.createFromAseprite('dog');
		this.anims.createFromAseprite('flags');
		this.anims.createFromAseprite('tetrominos');
		this.anims.createFromAseprite('progressArrow');
		this.anims.createFromAseprite('scoreLabel');
		this.anims.createFromAseprite('flares');
		this.anims.createFromAseprite('dangerLine');
		console.log('--- Finished Creating Animations from Spritesheets ---');

    this.scene.start('main-menu');
  }
}
