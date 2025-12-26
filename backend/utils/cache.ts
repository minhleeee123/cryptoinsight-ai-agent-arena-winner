/**
 * In-Memory Cache for Gemini API Responses
 * Reduces API costs by caching responses for identical requests
 */

import crypto from 'crypto';

interface CacheEntry {
  response: any;
  timestamp: number;
  expiresAt: number;
}

class CacheManager {
  private cache: Map<string, CacheEntry> = new Map();
  private stats = {
    hits: 0,
    misses: 0,
    savings: 0
  };

  /**
   * Generate cache key from request data
   */
  generateKey(data: any): string {
    const normalized = JSON.stringify(data, Object.keys(data).sort());
    return crypto.createHash('md5').update(normalized).digest('hex');
  }

  /**
   * Get cached response if exists and not expired
   */
  get(key: string): any | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check expiration
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    console.log(`💾 Cache HIT! (Total: ${this.stats.hits} hits, ${this.stats.misses} misses)`);
    return entry.response;
  }

  /**
   * Save response to cache
   */
  set(key: string, response: any, ttlSeconds: number = 3600): void {
    const entry: CacheEntry = {
      response,
      timestamp: Date.now(),
      expiresAt: Date.now() + (ttlSeconds * 1000)
    };

    this.cache.set(key, entry);
    console.log(`💾 Cached response (TTL: ${ttlSeconds}s, Total cached: ${this.cache.size})`);
  }

  /**
   * Clear expired entries
   */
  clearExpired(): number {
    const now = Date.now();
    let cleared = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleared++;
      }
    }

    if (cleared > 0) {
      console.log(`🧹 Cleared ${cleared} expired cache entries`);
    }

    return cleared;
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    console.log('🧹 Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0
      ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(1)
      : '0';

    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      cacheSize: this.cache.size
    };
  }

  /**
   * Estimate cost savings (assuming $0.00001 per request)
   */
  estimateSavings(): string {
    const costPerRequest = 0.00001; // $0.01 per 1000 requests
    const saved = this.stats.hits * costPerRequest;
    return `$${saved.toFixed(4)}`;
  }
}

// Singleton instance
export const cache = new CacheManager();

// Auto-cleanup expired entries every 5 minutes
setInterval(() => {
  cache.clearExpired();
}, 5 * 60 * 1000);

// Log stats every 10 minutes
setInterval(() => {
  const stats = cache.getStats();
  console.log('📊 Cache Stats:', {
    hits: stats.hits,
    misses: stats.misses,
    hitRate: stats.hitRate,
    cacheSize: stats.cacheSize,
    estimatedSavings: cache.estimateSavings()
  });
}, 10 * 60 * 1000);
