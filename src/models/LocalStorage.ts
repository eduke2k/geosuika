const PREFIX = 'geosuika';

export class LocalStorage {
  public static setHighscore (key: string, highscore: number): void {
    localStorage.setItem(`${PREFIX}:highscore:${key}`, highscore.toString());
  }

  public static getHighscore (key: string): number {
    return parseInt(localStorage.getItem(`${PREFIX}:highscore:${key}`) ?? '0');
  }
}