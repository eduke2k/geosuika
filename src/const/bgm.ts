import { round } from "../functions/helper";
import { BGMPatternConfig, BackgroundMusicConfig, ChordProgressionMarker } from "../models/BackgroundMusic";
import { Chord } from "./scales";

const allTheDucksPattern: BGMPatternConfig = [
  {
    repeatablePattern: [
      { chord: Chord.C_MAJOR, duration: 2.4 }, // silence
    ],
    repeats: 0
  },
  {
    repeatablePattern: [
      { chord: Chord.G_MAJOR, duration: 2.4 },
      { chord: Chord.D_MAJOR, duration: 2.4 },
      { chord: Chord.E_MINOR, duration: 2.4 },
      { chord: Chord.C_MAJOR, duration: 2.4 },
      { chord: Chord.G_MAJOR, duration: 2.4 },
      { chord: Chord.D_MAJOR, duration: 2.4 },
      { chord: Chord.E_MINOR, duration: 1.2 },
      { chord: Chord.C_MAJOR, duration: 1.2 },
      { chord: Chord.G_MAJOR, duration: 2.4 }
    ],
    repeats: 5
  },
  {
    repeatablePattern: [
      { chord: Chord.G_MAJOR, duration: 4.8 }
    ],
    repeats: 0
  }
]

const generateChordProgressionFromPattern = (pattern: BGMPatternConfig): ChordProgressionMarker[] => {
  let marker = 0;
  const chordProgression: ChordProgressionMarker[] = [];

  pattern.forEach(part => {
    for(let i = 0; i <= part.repeats; i++) {
      part.repeatablePattern.forEach(p => {
        chordProgression.push({
          chord: p.chord,
          duration: p.duration,
          start: marker
        });
        marker = round(marker + p.duration, 2);
      });
    }
  });
  return chordProgression;
}

export const allTheDucksBGMConfig: BackgroundMusicConfig = {
  audioKeys: [
    {
      key: 'bgm01-chello-chord',
      minScoreRatio: 0.1
    },
    {
      key: 'bgm01-backing-voice',
      minScoreRatio: 0.2
    },
    {
      key: 'bgm01-bass',
      minScoreRatio: 0.3
    },
    {
      key: 'bgm01-chello-melody',
      minScoreRatio: 0.4
    },
    {
      key: 'bgm01-kamo-voice',
      minScoreRatio: 0.5
    },
    {
      key: 'bgm01-main-voice',
      minScoreRatio: 0.6
    },
    {
      key: 'bgm01-piano',
      minScoreRatio: 0.7
    }
  ],
  chordProgression: generateChordProgressionFromPattern(allTheDucksPattern)
}
