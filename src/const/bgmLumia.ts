import { generateChordProgressionFromPattern } from "../functions/helper";
import { BGMPatternConfig, BackgroundMusicConfig } from "../models/BackgroundMusic";
import { Chord } from "./scales";

const bgmLumiaPattern: BGMPatternConfig = [
  {
    repeatablePattern: [
      { chord: Chord.A_MINOR, duration: 3.429 },
      { chord: Chord.D_MINOR, duration: 3.429 },
      { chord: Chord.E_MINOR, duration: 3.429 },
      { chord: Chord.A_MINOR, duration: 3.429 },
    ],
    plays: 2
  },
  {
    repeatablePattern: [
      { chord: Chord.A_MINOR, duration: 3.429 },
      { chord: Chord.D_MINOR, duration: 3.429 },
      { chord: Chord.F_MAJOR, duration: 3.429 },
      { chord: Chord.G_MAJOR, duration: 3.429 },
    ],
    plays: 1
  },
  { // PreChorus
    repeatablePattern: [
      { chord: Chord.A_MINOR, duration: 3.429 },
      { chord: Chord.F_MAJOR, duration: 3.429 },
      { chord: Chord.C_MAJOR, duration: 3.429 },
      { chord: Chord.G_MAJOR, duration: 3.429 },
    ],
    plays: 2
  },
  {
    repeatablePattern: [
      { chord: Chord.A_MINOR, duration: 3.429 },
      { chord: Chord.D_MINOR, duration: 3.429 },
      { chord: Chord.E_MINOR, duration: 3.429 },
      { chord: Chord.A_MINOR, duration: 3.429 },
    ],
    plays: 2
  },
  {
    repeatablePattern: [
      { chord: Chord.C_MAJOR, duration: 3.429 },
      { chord: Chord.F_MAJOR, duration: 3.429 },
      { chord: Chord.G_MAJOR, duration: 3.429 },
      { chord: Chord.C_MAJOR, duration: 3.429 },
      { chord: Chord.C_MAJOR, duration: 3.429 },
      { chord: Chord.F_MAJOR, duration: 3.429 },
      { chord: Chord.A_MINOR, duration: 3.429 },
      { chord: Chord.G_MAJOR, duration: 3.429 },
    ],
    plays: 1
  },
  { // PreChorus
    repeatablePattern: [
      { chord: Chord.A_MINOR, duration: 3.429 },
      { chord: Chord.F_MAJOR, duration: 3.429 },
      { chord: Chord.C_MAJOR, duration: 3.429 },
      { chord: Chord.G_MAJOR, duration: 3.429 },
    ],
    plays: 2
  },
  { // Chorus
    repeatablePattern: [
      { chord: Chord.A_MINOR, duration: 3.429 },
      { chord: Chord.C_MAJOR, duration: 3.429 },
      { chord: Chord.G_MAJOR, duration: 3.429 },
      { chord: Chord.D_MINOR, duration: 3.429 },
    ],
    plays: 2
  },
  {
    repeatablePattern: [
      { chord: Chord.A_MINOR, duration: 3.429 },
      { chord: Chord.F_MAJOR, duration: 3.429 },
      { chord: Chord.G_MAJOR, duration: 3.429 },
      { chord: Chord.C_MAJOR, duration: 3.429 },
    ],
    plays: 1
  },
  {
    repeatablePattern: [
      { chord: Chord.C_MAJOR, duration: 3.429 },
      { chord: Chord.F_MAJOR, duration: 3.429 },
      { chord: Chord.G_MAJOR, duration: 3.429 },
      { chord: Chord.C_MAJOR, duration: 3.429 },
    ],
    plays: 2
  },
  {
    repeatablePattern: [
      { chord: Chord.C_MAJOR, duration: 3.429 },
      { chord: Chord.F_MAJOR, duration: 3.429 },
      { chord: Chord.A_MINOR, duration: 3.429 },
      { chord: Chord.G_MAJOR, duration: 3.429 },
    ],
    plays: 1
  },
  { // PreChorus
    repeatablePattern: [
      { chord: Chord.A_MINOR, duration: 3.429 },
      { chord: Chord.F_MAJOR, duration: 3.429 },
      { chord: Chord.C_MAJOR, duration: 3.429 },
      { chord: Chord.G_MAJOR, duration: 3.429 },
    ],
    plays: 2
  },
  { // Chorus
    repeatablePattern: [
      { chord: Chord.A_MINOR, duration: 3.429 },
      { chord: Chord.C_MAJOR, duration: 3.429 },
      { chord: Chord.G_MAJOR, duration: 3.429 },
      { chord: Chord.D_MINOR, duration: 3.429 },
      { chord: Chord.A_MINOR, duration: 3.429 },
      { chord: Chord.C_MAJOR, duration: 3.429 },
      { chord: Chord.G_MAJOR, duration: 3.429 },
      { chord: Chord.F_MAJOR, duration: 3.429 },
    ],
    plays: 1
  },
  { // Bridge
    repeatablePattern: [
      { chord: Chord.A_MINOR, duration: 3.429 },
      { chord: Chord.D_MINOR, duration: 3.429 },
      { chord: Chord.E_MINOR, duration: 3.429 },
      { chord: Chord.G_MAJOR, duration: 3.429 },
      { chord: Chord.C_MAJOR, duration: 3.429 },
      { chord: Chord.F_MAJOR, duration: 3.429 },
      { chord: Chord.E_MINOR, duration: 3.429 },
      { chord: Chord.G_MAJOR, duration: 3.429 },
    ],
    plays: 1
  },
  { // Solo
    repeatablePattern: [
      { chord: Chord.A_MINOR, duration: 3.429 },
      { chord: Chord.D_MINOR, duration: 3.429 },
      { chord: Chord.E_MINOR, duration: 3.429 },
      { chord: Chord.G_MAJOR, duration: 3.429 },
      { chord: Chord.C_MAJOR, duration: 3.429 },
      { chord: Chord.F_MAJOR, duration: 3.429 },
      { chord: Chord.E_MINOR, duration: 3.429 },
      { chord: Chord.G_MAJOR, duration: 3.429 },
    ],
    plays: 1
  },
  { // Chorus
    repeatablePattern: [
      { chord: Chord.A_MINOR, duration: 3.429 },
      { chord: Chord.C_MAJOR, duration: 3.429 },
      { chord: Chord.G_MAJOR, duration: 3.429 },
      { chord: Chord.D_MINOR, duration: 3.429 },
      { chord: Chord.A_MINOR, duration: 3.429 },
      { chord: Chord.C_MAJOR, duration: 3.429 },
      { chord: Chord.G_MAJOR, duration: 3.429 },
      { chord: Chord.F_MAJOR, duration: 3.429 },
    ],
    plays: 1
  },
  { // Outro
    repeatablePattern: [
      { chord: Chord.A_MINOR, duration: 3.429 },
      { chord: Chord.C_MAJOR, duration: 3.429 },
      { chord: Chord.G_MAJOR, duration: 3.429 },
      { chord: Chord.D_MINOR, duration: 3.429 },
      { chord: Chord.A_MINOR, duration: 3.429 },
      { chord: Chord.C_MAJOR, duration: 3.429 },
      { chord: Chord.F_MAJOR, duration: 3.429 },
      { chord: Chord.G_MAJOR, duration: 3.429 },
      { chord: Chord.C_MAJOR, duration: 3.429 },
      { chord: Chord.C_MAJOR, duration: 3.429 },
    ],
    plays: 1
  },
]

export const lumiaBGMConfig: BackgroundMusicConfig = {
  key: 'lumia',
  artist: 'Annoying Edu',
  songTitle: 'Lumia\'s Quest Theme',
  title: 'Memories of Hope',
  year: 2024,
  audioKeys: [
    {
      key: 'lumia-drums',
      minScoreRatio: 0.006
    },
    {
      key: 'lumia-bass',
      minScoreRatio: 0.026
    },
    {
      key: 'lumia-pads',
      minScoreRatio: 0.058
    },
    {
      key: 'lumia-riff3',
      minScoreRatio: 0.102
    },
    {
      key: 'lumia-riff1',
      minScoreRatio: 0.16
    },
    {
      key: 'lumia-music-box',
      minScoreRatio: 0.23
    },
    {
      key: 'lumia-lead1',
      minScoreRatio: 0.314
    },
    {
      key: 'lumia-lead2',
      minScoreRatio: 0.41
    },
    {
      key: 'lumia-cello',
      minScoreRatio: 0.518
    },
    {
      key: 'lumia-violin',
      minScoreRatio: 0.64
    },
    {
      key: 'lumia-solo',
      minScoreRatio: 0.774
    },
    {
      key: 'lumia-voice',
      minScoreRatio: 1
    }
  ],
  chordProgression: generateChordProgressionFromPattern(bgmLumiaPattern)
}
