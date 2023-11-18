import { generateChordProgressionFromPattern } from "../functions/helper";
import { BGMPatternConfig, BackgroundMusicConfig } from "../models/BackgroundMusic";
import { Chord } from "./scales";

const bgm02Pattern: BGMPatternConfig = [
  {
    repeatablePattern: [
      { chord: Chord.A_MAJOR, duration: 6.8572 },
      { chord: Chord.C_MAJOR, duration: 6.8572 },
      { chord: Chord.B_MINOR, duration: 6.8572 },
      { chord: Chord.A_MAJOR, duration: 6.8572 },
    ],
    repeats: 9
  }
]

export const bgm02BGMConfig: BackgroundMusicConfig = {
  audioKeys: [
    {
      key: 'bgm02-drums',
      minScoreRatio: 0.11
    },
    {
      key: 'bgm02-bass',
      minScoreRatio: 0.22
    },
    {
      key: 'bgm02-pads',
      minScoreRatio: 0.33
    },
    {
      key: 'bgm02-melody',
      minScoreRatio: 0.44
    },
    {
      key: 'bgm02-lofi01',
      minScoreRatio: 0.55
    },
    {
      key: 'bgm02-lofi02',
      minScoreRatio: 0.66
    },
    {
      key: 'bgm02-lofi03',
      minScoreRatio: 0.77
    },
    {
      key: 'bgm02-lofi04',
      minScoreRatio: 0.88
    },
    {
      key: 'bgm02-voice',
      minScoreRatio: 1
    }
  ],
  chordProgression: generateChordProgressionFromPattern(bgm02Pattern)
}
