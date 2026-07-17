export class LocalStorageService {
  private static isAvailable(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof window.localStorage !== 'undefined'
    );
  }

  private static assertAvailable(): void {
    if (!this.isAvailable()) {
      throw new Error('storage is not available');
    }
  }

  public static setItem<T>(key: string, value: T): void {
    this.assertAvailable();
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }

  public static getItem<T>(key: string): T | undefined {
    this.assertAvailable();
    try {
      const item = localStorage.getItem(key);

      return item ? (JSON.parse(item) as T) : undefined;
    } catch (error) {
      console.error(`Error getting localStorage key "${key}":`, error);

      return undefined;
    }
  }

  public static removeItem(key: string): void {
    this.assertAvailable();
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }

  public static clear(): void {
    this.assertAvailable();
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
}
