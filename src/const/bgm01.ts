import { generateChordProgressionFromPattern } from "../functions/helper";
import { BGMPatternConfig, BackgroundMusicConfig } from "../models/BackgroundMusic";
import { Chord } from "./scales";

const bgm01Pattern: BGMPatternConfig = [
  {
    repeatablePattern: [
      { chord: Chord.G_MAJOR, duration: 3.429 },
      { chord: Chord.D_MAJOR, duration: 3.429 },
      { chord: Chord.E_MINOR, duration: 3.429 },
      { chord: Chord.C_MAJOR, duration: 3.429 },
      { chord: Chord.G_MAJOR, duration: 3.429 },
      { chord: Chord.D_MAJOR, duration: 3.429 },
      { chord: Chord.C_MAJOR, duration: 3.429 },
      { chord: Chord.G_MAJOR, duration: 3.429 },
    ],
    plays: 2
  },
  {
    repeatablePattern: [
      { chord: Chord.G_MAJOR, duration: 3.429 },
      { chord: Chord.D_MAJOR, duration: 3.429 },
      { chord: Chord.E_MINOR, duration: 3.429 },
      { chord: Chord.C_MAJOR, duration: 3.429 },
      { chord: Chord.G_MAJOR, duration: 3.429 },
      { chord: Chord.D_MAJOR, duration: 3.429 },
      { chord: Chord.E_MINOR, duration: 1.716 },
      { chord: Chord.C_MAJOR, duration: 1.716 },
      { chord: Chord.G_MAJOR, duration: 3.429 },
    ],
    plays: 4
  },
  {
    repeatablePattern: [
      { chord: Chord.G_MAJOR, duration: 3.429 },
      { chord: Chord.D_MAJOR, duration: 3.429 },
      { chord: Chord.G_MAJOR, duration: 3.429 },
      { chord: Chord.C_MAJOR, duration: 3.429 },
      { chord: Chord.G_MAJOR, duration: 3.429 },
      { chord: Chord.D_MAJOR, duration: 3.429 },
      { chord: Chord.E_MINOR, duration: 1.716 },
      { chord: Chord.C_MAJOR, duration: 1.716 },
      { chord: Chord.G_MAJOR, duration: 3.429 },
    ],
    plays: 1
  },
  {
    repeatablePattern: [
      { chord: Chord.D_MAJOR, duration: 3.429 },
      { chord: Chord.E_MINOR, duration: 3.429 },
      { chord: Chord.C_MAJOR, duration: 3.429 },
      { chord: Chord.G_MAJOR, duration: 3.429 },
    ], 
    plays: 4
  },
  {
    repeatablePattern: [
      { chord: Chord.G_MAJOR, duration: 3.429 },
      { chord: Chord.D_MAJOR, duration: 3.429 },
      { chord: Chord.G_MAJOR, duration: 3.429 },
      { chord: Chord.C_MAJOR, duration: 3.429 },
      { chord: Chord.G_MAJOR, duration: 3.429 },
      { chord: Chord.D_MAJOR, duration: 3.429 },
      { chord: Chord.E_MINOR, duration: 1.716 },
      { chord: Chord.C_MAJOR, duration: 1.716 },
      { chord: Chord.G_MAJOR, duration: 3.429 },
    ],
    plays: 1
  },
  {
    repeatablePattern: [
      { chord: Chord.G_MAJOR, duration: 3.429 },
      { chord: Chord.D_MAJOR, duration: 3.429 },
      { chord: Chord.G_MAJOR, duration: 3.429 },
      { chord: Chord.C_MAJOR, duration: 3.429 },
      { chord: Chord.G_MAJOR, duration: 3.429 },
      { chord: Chord.D_MAJOR, duration: 3.429 },
      { chord: Chord.E_MINOR, duration: 1.716 },
      { chord: Chord.C_MAJOR, duration: 1.716 },
      { chord: Chord.G_MAJOR, duration: 3.429 },
    ],
    plays: 1
  },
  {
    repeatablePattern: [
      { chord: Chord.G_MAJOR, duration: 3.429 },
      { chord: Chord.D_MAJOR, duration: 3.429 },
      { chord: Chord.E_MINOR, duration: 3.429 },
      { chord: Chord.C_MAJOR, duration: 3.429 },
      { chord: Chord.G_MAJOR, duration: 3.429 },
      { chord: Chord.D_MAJOR, duration: 3.429 },
      { chord: Chord.E_MINOR, duration: 1.716 },
      { chord: Chord.C_MAJOR, duration: 1.716 },
      { chord: Chord.G_MAJOR, duration: 3.429 },
    ],
    plays: 3
  },
]

export const bgm01BGMConfig: BackgroundMusicConfig = {
  key: 'bgm01',
  artist: 'Annoying Edu',
  songTitle: 'All the Ducks',
  title: 'Memories of Ducks',
  year: 2023,
  ytLink: 'https://www.youtube.com/watch?v=2np5PISWCIo',
  audioKeys: [
    {
      key: 'bgm01-drums',
      minScoreRatio: 0.0121
    },
    {
      key: 'bgm01-bass',
      minScoreRatio: 0.0484
    },
    {
      key: 'bgm01-pads',
      minScoreRatio: 0.11
    },
    {
      key: 'bgm01-melody01',
      minScoreRatio: 0.2
    },
    {
      key: 'bgm01-melody02',
      minScoreRatio: 0.3
    },
    {
      key: 'bgm01-lofi01',
      minScoreRatio: 0.44
    },
    {
      key: 'bgm01-lofi02',
      minScoreRatio: 0.6
    },
    {
      key: 'bgm01-lofi03',
      minScoreRatio: 0.7
    },
    {
      key: 'bgm01-lofi04',
      minScoreRatio: 0.87
    },
    {
      key: 'bgm01-voice',
      minScoreRatio: 1
    }
  ],
  chordProgression: generateChordProgressionFromPattern(bgm01Pattern)
}
