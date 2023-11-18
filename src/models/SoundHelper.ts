// import { Chord } from "../const/scales";

// export class SoundHelper {
//   public static playHarpSound (chord: Chord, scene: Phaser.Scene, pan: number, volume: number): void {
//     const randomNote = getRandomMarkerIndexFromChord('instrument:harp', chord);
//     const markerConfig = scaleSoundMarkers[randomNote];

//     const config: Phaser.Types.Sound.SoundMarker = {
//       ...markerConfig,
//       config: { pan, volume }
//     };

//     scene.sound.play('instrument:harp', config);
//   }

//   public static playBassSound (chord: Chord, scene: Phaser.Scene, pan: number, volume: number): void {
//     const randomNote = getRandomMarkerIndexFromChord('bass', chord);
//     const markerConfig = scaleSoundMarkers[randomNote];

//     const config: Phaser.Types.Sound.SoundMarker = {
//       ...markerConfig,
//       config: { pan, volume }
//     };

//     scene.sound.play('bass', config);
//   }
// }