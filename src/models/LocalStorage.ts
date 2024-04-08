const PREFIX = 'eastersuika';

export class LocalStorage {
  public static setHighscore (key: string, highscore: number): void {
    localStorage.setItem(`${PREFIX}:highscore:${key}`, highscore.toString());
  }

  public static getHighscore (key: string): number {
    return parseInt(localStorage.getItem(`${PREFIX}:highscore:${key}`) ?? '0');
  }

  public static resetSnapshot (): void {
    localStorage.removeItem(`${PREFIX}:snapshot`);
  }

  public static setSnapshot (snapshot: string): void {
    localStorage.setItem(`${PREFIX}:snapshot`, snapshot);
  }

  public static getSnapshot (): string | null {
    return localStorage.getItem(`${PREFIX}:snapshot`);
  }
}