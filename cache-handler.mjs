import { CacheHandler } from '@neshca/cache-handler';
import createLruHandler from '@neshca/cache-handler/local-lru';
import createRedisHandler from '@neshca/cache-handler/redis-stack';
import { createClient } from 'redis';
import { createPool } from 'generic-pool';

const PHASE_PRODUCTION_BUILD = 'phase-production-build';

let redisPool;

// Only create the Redis connection pool if we are not in the production build phase
if (PHASE_PRODUCTION_BUILD !== process.env.NEXT_PHASE) {
  // Create a Redis client factory for the pool
  const redisFactory = {
    create: async () => {
      const client = createClient({
        url: process.env.REDIS_URL,
      });

      client.on('error', (error) => {
        console.error('Redis client error:', error);
      });

      await client.connect();
      return client;
    },
    destroy: async (client) => {
      await client.disconnect();
    },
  };

  // Configure the Redis connection pool
  redisPool = createPool(redisFactory, {
    max: 10,    // Maximum number of clients in the pool
    min: 2,     // Minimum number of clients in the pool
    idleTimeoutMillis: 30000, // Disconnect if idle for this long
    acquireTimeoutMillis: 1000, // Wait up to 1 second for a connection
  });

  console.info('Redis connection pool created.');
} else {
  console.log('Skipping Redis pool creation during production build phase.');
}

CacheHandler.onCreation(async () => {
  let client;

  // Only attempt to acquire a Redis client if the pool is available
  if (redisPool) {
    try {
      // Acquire a client from the pool for each request
      client = await redisPool.acquire();
      console.info('Redis client acquired from pool.');
    } catch (error) {
      console.warn('Failed to acquire Redis client from pool:', error);
    }
  }

  /** @type {import("@neshca/cache-handler").Handler | null} */
  let handler;

  if (client?.isReady) {
    handler = await createRedisHandler({
      client,
      keyPrefix: 'pages:',
      timeoutMs: 1000,
    });
  } else {
    handler = createLruHandler();
    console.warn('Falling back to LRU handler because Redis client is not available.');
  }

  // Release the client back to the pool when done
  if (client) {
    redisPool.release(client);
  }

  return {
    handlers: [handler],
  };
});

export default CacheHandler;
