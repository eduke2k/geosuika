import Phaser from 'phaser'

import MainMenuScene from './scenes/MainMenuScene'
import GameScene from './scenes/GameScene'
import BootScene from './scenes/BootScene'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	parent: 'app',
	width: 1280,
	height: 720,
	antialias: true,
	roundPixels: true,
	fps: {
		limit: 60,
	},
	physics: {
		default: 'matter',
		matter: {
			gravity: {
				y: 1
			},
			constraintIterations: 4,
			// "plugins.attractors": true,
			debug: {
				showSensors: true,
				showCollisions: false,
				showVelocity: false,
				showBounds: true,
				showSeparation: false,
				showBody: true
			}
		}
	},
	scene: [BootScene, MainMenuScene, GameScene],
}

export default new Phaser.Game(config)
