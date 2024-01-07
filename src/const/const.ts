export const NATIVE_WIDTH = 1280;
export const NATIVE_HEIGHT = 720;
export const NATIVE_AR = NATIVE_WIDTH / NATIVE_HEIGHT;

export const RESOLUTIONS = [
  '1280x720',
  '1920x1080',
  '2560x1440'
];

export enum OPTION_KEYS {
  SFX_VOLUME = 'cor:sfx-volume',
  MUSIC_VOLUME = 'cor:music-volume',
  RESOLUTION = 'cor:resolution',
  POSTFX_RESOLUTION = 'cor:postfx-resolution'
} 