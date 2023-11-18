import Phaser from 'phaser'
import FontFaceObserver from 'fontfaceobserver';

// Aseprite sprites
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

import BarPNG from './../assets/bar.png';
import BarJSON from './../assets/bar.json';

// Images
import OsakaCastleBucketPNG from './../assets/buckets/osaka_castle.png';

// Audio SFX
import HarpSFX from './../assets/sfx/harp.ogg';
import BassSFX from './../assets/sfx/bass.ogg';
import MergeSFX from './../assets/sfx/merge.ogg';

// Audio BGM 01 All The Ducks
import Bgm01ChelloChord from './../assets/bgm/bgm01/chello-chord.ogg';
import Bgm01BackingVoice from './../assets/bgm/bgm01/backing-voice.ogg';
import Bgm01Bass from './../assets/bgm/bgm01/bass.ogg';
import Bgm01ChelloMelody from './../assets/bgm/bgm01/chello-melody.ogg';
import Bgm01KamoVoice from './../assets/bgm/bgm01/kamo-voice.ogg';
import Bgm01MainVoice from './../assets/bgm/bgm01/main-voice.ogg';
import Bgm01Piano from './../assets/bgm/bgm01/piano.ogg';

// Audio BGM 02 Achan
import Bgm02Drums from './../assets/bgm/bgm02/drums.ogg';
import Bgm02Bass from './../assets/bgm/bgm02/bass.ogg';
import Bgm02Pads from './../assets/bgm/bgm02/pads.ogg';
import Bgm02Melody from './../assets/bgm/bgm02/melody.ogg';
import Bgm02Lofi01 from './../assets/bgm/bgm02/lofi01.ogg';
import Bgm02Lofi02 from './../assets/bgm/bgm02/lofi02.ogg';
import Bgm02Lofi03 from './../assets/bgm/bgm02/lofi03.ogg';
import Bgm02Lofi04 from './../assets/bgm/bgm02/lofi04.ogg';
import Bgm02Voice from './../assets/bgm/bgm02/voice.ogg';

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
		this.load.atlas('bar', BarPNG, BarJSON);

		// Images
		this.load.image('bucket:osaka-castle', OsakaCastleBucketPNG);

		// Audio SFX
		// Don't forget to register the corresponsing instrument when adding new instrument sfx files
		this.load.audio('sfx:harp', HarpSFX);
		this.load.audio('sfx:bass', BassSFX);
		this.load.audio('sfx:merge', MergeSFX);

		// Audio BGM 01
		this.load.audio('bgm01-chello-chord', Bgm01ChelloChord);
		this.load.audio('bgm01-backing-voice', Bgm01BackingVoice);
		this.load.audio('bgm01-bass', Bgm01Bass);
		this.load.audio('bgm01-chello-melody', Bgm01ChelloMelody);
		this.load.audio('bgm01-kamo-voice', Bgm01KamoVoice);
		this.load.audio('bgm01-main-voice', Bgm01MainVoice);
		this.load.audio('bgm01-piano', Bgm01Piano);

		// Audio BGM 01
		this.load.audio('bgm02-drums', Bgm02Drums);
		this.load.audio('bgm02-bass', Bgm02Bass);
		this.load.audio('bgm02-pads', Bgm02Pads);
		this.load.audio('bgm02-melody', Bgm02Melody);
		this.load.audio('bgm02-lofi01', Bgm02Lofi01);
		this.load.audio('bgm02-lofi02', Bgm02Lofi02);
		this.load.audio('bgm02-lofi03', Bgm02Lofi03);
		this.load.audio('bgm02-lofi04', Bgm02Lofi04);
		this.load.audio('bgm02-voice', Bgm02Voice);

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

		this.registry.set('instument:harp', new Instrument({ key: 'sfx:harp', octaves: 3, audioMarkerDuration: 4 }));
		this.registry.set('instument:bass', new Instrument({ key: 'sfx:bass', octaves: 2, audioMarkerDuration: 4 }));
		this.registry.set('instument:merge', new Instrument({ key: 'sfx:merge', octaves: 3, audioMarkerDuration: 4 }));
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
