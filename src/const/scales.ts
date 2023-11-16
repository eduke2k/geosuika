export enum BaseNote {
  C = 0,
  C_SHARP = 1,
  D = 2,
  D_SHARP= 3,
  E = 4,
  F = 5,
  F_SHARP = 6,
  G = 7,
  G_SHARP = 8,
  A = 9,
  A_SHARP = 10,
  B = 11,
}

export enum Chord {
  C_MAJOR = 'C',
  C_MINOR = 'Cm',
  C_SHARP_MAJOR = 'C#',
  C_SHARP_MINOR = 'C#m',
  D_MAJOR = 'D',
  D_MINOR = 'Dm',
  D_SHARP_MAJOR = 'D#',
  D_SHARP_MINOR = 'D#m',
  E_MAJOR = 'E',
  E_MINOR = 'Em',
  F_MAJOR = 'F',
  F_MINOR = 'Fm',
  F_SHARP_MAJOR = 'F#',
  F_SHARP_MINOR = 'F#m',
  G_MAJOR = 'G',
  G_MINOR = 'Gm',
  G_SHARP_MAJOR = 'G#',
  G_SHARP_MINOR = 'G#m',
  A_MAJOR = 'A',
  A_MINOR = 'Am',
  A_SHARP_MAJOR = 'A#',
  A_SHARP_MINOR = 'A#m',
  B_MAJOR = 'B',
  B_MINOR = 'Bm'
}

// const MARKER_INCREMENT = 4;

// const scaleNotes = [
//   'c2', 'cSharp2', 'd2', 'dSharp2', 'e2', 'f2', 'fSharp2', 'g2', 'gSharp2', 'a2', 'aSharp2', 'b2',
//   'c3', 'cSharp3', 'd3', 'dSharp3', 'e3', 'f3', 'fSharp3', 'g3', 'gSharp3', 'a3', 'aSharp3', 'b3',
// ];

export const getMajorChord = (base: BaseNote): BaseNote[] => {
  return [base, (base + 4) % 12, (base + 7) % 12];
}

export const getMinorChord = (base: BaseNote): BaseNote[] => {
  return [base, (base + 3) % 12, (base + 7) % 12];
}

export const chordNotes: Record<Chord, BaseNote[]> = {
  [Chord.C_MAJOR]: getMajorChord(BaseNote.C),
  [Chord.C_SHARP_MAJOR]: getMajorChord(BaseNote.C_SHARP),
  [Chord.D_MAJOR]: getMajorChord(BaseNote.D),
  [Chord.D_SHARP_MAJOR]: getMajorChord(BaseNote.D_SHARP),
  [Chord.E_MAJOR]: getMajorChord(BaseNote.E),
  [Chord.F_MAJOR]: getMajorChord(BaseNote.F),
  [Chord.F_SHARP_MAJOR]: getMajorChord(BaseNote.F_SHARP),
  [Chord.G_MAJOR]: getMajorChord(BaseNote.G),
  [Chord.G_SHARP_MAJOR]: getMajorChord(BaseNote.G_SHARP),
  [Chord.A_MAJOR]: getMajorChord(BaseNote.A),
  [Chord.A_SHARP_MAJOR]: getMajorChord(BaseNote.A_SHARP),
  [Chord.B_MAJOR]: getMajorChord(BaseNote.B),
  [Chord.C_MINOR]: getMinorChord(BaseNote.C),
  [Chord.C_SHARP_MINOR]: getMinorChord(BaseNote.C_SHARP),
  [Chord.D_MINOR]: getMinorChord(BaseNote.D),
  [Chord.D_SHARP_MINOR]: getMinorChord(BaseNote.D_SHARP),
  [Chord.E_MINOR]: getMinorChord(BaseNote.E),
  [Chord.F_MINOR]: getMinorChord(BaseNote.F),
  [Chord.F_SHARP_MINOR]: getMinorChord(BaseNote.F_SHARP),
  [Chord.G_MINOR]: getMinorChord(BaseNote.G),
  [Chord.G_SHARP_MINOR]: getMinorChord(BaseNote.G_SHARP),
  [Chord.A_MINOR]: getMinorChord(BaseNote.A),
  [Chord.A_SHARP_MINOR]: getMinorChord(BaseNote.A_SHARP),
  [Chord.B_MINOR]: getMinorChord(BaseNote.B),
}

// export const scaleSoundMarkers: Phaser.Types.Sound.SoundMarker[] = scaleNotes.map((n, i) => ({
//   name: n,
//   duration: MARKER_INCREMENT,
//   start: MARKER_INCREMENT * i
// }));

// const taikoNotes = [
//   'deep1', 'deep2', 'deep3', 'deep4',
//   'slam1', 'slam2', 'slam3', 'slam4',
//   'slight1', 'slight2',
//   'rim1', 'rim2', 'rim3', 'rim4', 'rim5'
// ];

// export const taikoSoundMarkers: Phaser.Types.Sound.SoundMarker[] = taikoNotes.map((n, i) => ({
//   name: n,
//   duration: MARKER_INCREMENT,
//   start: MARKER_INCREMENT * i
// }));

