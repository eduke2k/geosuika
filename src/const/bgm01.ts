import { generateChordProgressionFromPattern } from "../functions/helper";
import { BGMPatternConfig, BackgroundMusicConfig } from "../models/BackgroundMusic";
import { Chord } from "./scales";

const bgm01Pattern: BGMPatternConfig = [
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

export const bgm01BGMConfig: BackgroundMusicConfig = {
  audioKeys: [
    {
      key: 'bgm01-chello-chord',
      minScoreRatio: 0.14
    },
    {
      key: 'bgm01-backing-voice',
      minScoreRatio: 0.28
    },
    {
      key: 'bgm01-bass',
      minScoreRatio: 0.42
    },
    {
      key: 'bgm01-chello-melody',
      minScoreRatio: 0.56
    },
    {
      key: 'bgm01-kamo-voice',
      minScoreRatio: 0.70
    },
    {
      key: 'bgm01-main-voice',
      minScoreRatio: 0.84
    },
    {
      key: 'bgm01-piano',
      minScoreRatio: 1
    }
  ],
  chordProgression: generateChordProgressionFromPattern(bgm01Pattern)
}