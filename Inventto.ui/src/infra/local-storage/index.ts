export class LocalStorageService {
  private static isAvailable(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof window.localStorage !== 'undefined'
    );
  }

  public static setItem<T>(key: string, value: T): void {
    try {
      if (!this.isAvailable()) return;

      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }

  public static getItem<T>(key: string): T | undefined {
    try {
      if (!this.isAvailable()) return undefined;

      const item = localStorage.getItem(key);

      return item ? (JSON.parse(item) as T) : undefined;
    } catch (error) {
      console.error(`Error getting localStorage key "${key}":`, error);

      return undefined;
    }
  }

  public static removeItem(key: string): void {
    try {
      if (!this.isAvailable()) return;

      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }

  public static clear(): void {
    try {
      if (!this.isAvailable()) return;

      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
}
