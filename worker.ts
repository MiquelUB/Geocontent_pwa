import { config } from 'dotenv';
config({ path: '.env.local' });
config();


import { Worker } from 'bullmq';
import IORedis from 'ioredis';
// import { PrismaClient } from '@prisma/client'; // Import dynamically
// import { generateExecutiveSummary } from './lib/services/openrouter'; // Import dynamically
import { generateBarChartUrl, generatePieChartUrl } from './lib/services/charts';
import { generatePdf } from './lib/services/pdf';
import * as fs from 'fs';
import * as path from 'path';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });

const { processReport } = require('./lib/services/reportProcessor');

const worker = new Worker('report-generation', async job => {
  const { reportId, municipalityId } = job.data;
  await processReport(reportId, municipalityId);
}, { connection: connection as any });

console.log("Worker started...");
