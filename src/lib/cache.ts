// Simple cache implementation for API responses
type CacheItem<T> = {
  data: T;
  timestamp: number;
};

class ApiCache {
  private cache: Record<string, CacheItem<any>> = {};
  private maxAge: number; // Cache expiration in milliseconds

  constructor(maxAgeInMinutes: number = 15) {
    this.maxAge = maxAgeInMinutes * 60 * 1000;
  }

  /**
   * Get an item from the cache
   * @param key Cache key
   * @returns The cached data or null if not found or expired
   */
  get<T>(key: string): T | null {
    const item = this.cache[key];
    
    if (!item) {
      return null;
    }
    
    // Check if the cache is still valid
    const now = Date.now();
    if (now - item.timestamp > this.maxAge) {
      // Cache expired, remove it
      this.remove(key);
      return null;
    }
    
    return item.data as T;
  }

  /**
   * Store an item in the cache
   * @param key Cache key
   * @param data Data to store
   */
  set<T>(key: string, data: T): void {
    this.cache[key] = {
      data,
      timestamp: Date.now(),
    };
  }

  /**
   * Remove an item from the cache
   * @param key Cache key
   */
  remove(key: string): void {
    delete this.cache[key];
  }

  /**
   * Clear all items from the cache
   */
  clear(): void {
    this.cache = {};
  }

  /**
   * Get a wrapper for an async function that caches its results
   * @param fn The async function to wrap
   * @param keyFn Function to generate the cache key based on arguments
   * @returns A function that returns cached results if available
   */
  withCache<T, Args extends any[]>(
    fn: (...args: Args) => Promise<T>,
    keyFn: (...args: Args) => string
  ): (...args: Args) => Promise<T> {
    return async (...args: Args): Promise<T> => {
      const key = keyFn(...args);
      const cached = this.get<T>(key);
      
      if (cached !== null) {
        return cached;
      }
      
      const result = await fn(...args);
      this.set(key, result);
      return result;
    };
  }
}

// Create a singleton instance
export const apiCache = new ApiCache();

// Export a wrapper function for easy use
export function withCache<T, Args extends any[]>(
  fn: (...args: Args) => Promise<T>,
  keyFn: (...args: Args) => string
): (...args: Args) => Promise<T> {
  return apiCache.withCache(fn, keyFn);
} 