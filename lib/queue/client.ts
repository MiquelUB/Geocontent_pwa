import { Queue } from 'bullmq';
import IORedis from 'ioredis';

// Singleton for Redis connection to prevent creating too many connections in serverless env (though Next.js server actions are separate)
// We need to ensure we don't spawn multiple connections locally in dev hot reload.

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
});

export const reportQueue = new Queue('report-generation', { connection: connection as any });
