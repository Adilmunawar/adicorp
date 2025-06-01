
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class DataCache {
  private cache = new Map<string, CacheItem<any>>();
  private readonly DEFAULT_EXPIRY = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, expiryMs?: number): void {
    const expiry = expiryMs || this.DEFAULT_EXPIRY;
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    const keys = Array.from(this.cache.keys());
    keys.forEach(key => {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

export const dataCache = new DataCache();

// Utility function to generate cache keys
export const getCacheKey = (prefix: string, ...args: (string | number)[]): string => {
  return `${prefix}:${args.join(':')}`;
};
