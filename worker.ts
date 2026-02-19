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

// Lazy load Prisma to ensure env vars are loaded
const { prisma } = require('./lib/database/prisma');
const { generateExecutiveSummary } = require('./lib/services/openrouter');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });

const worker = new Worker('report-generation', async job => {
  const { reportId, municipalityId } = job.data;
  console.log(`Processing report ${reportId} for municipality ${municipalityId}`);

  try {
    // 1. Update status to PROCESSING
    await prisma.report.update({
      where: { id: reportId },
      data: { status: 'PROCESSING' }
    });

    // 2. Fetch Data (Mocked for now as per instructions/current capability)
    // In real scenario: Fetch from database based on logs/analytics
    const reportData = {
      visits: 12500,
      peakHours: ['11:00', '17:00'],
      topLocations: [
        { label: 'Mirador del Pic', value: 4500 },
        { label: 'Ermita Romànica', value: 3200 },
        { label: 'Cascada Gran', value: 2800 }
      ],
      weeklyTraffic: [
        { label: 'Dl', value: 120 },
        { label: 'Dt', value: 140 },
        { label: 'Dc', value: 130 },
        { label: 'Dj', value: 180 },
        { label: 'Dv', value: 450 },
        { label: 'Ds', value: 890 },
        { label: 'Dg', value: 760 }
      ],
      demographics: {
        locals: 35,
        tourists: 65
      }
    };

    // 3. Generate Content
    console.log("Generating AI Summary...");
    const summary = await generateExecutiveSummary(reportData);
    
    console.log("Generating Charts...");
    const barChartUrl = generateBarChartUrl(reportData.weeklyTraffic);
    const pieChartUrl = generatePieChartUrl(reportData.demographics.locals, reportData.demographics.tourists);

    // 4. Generate HTML for PDF
    // Using inline styles for simplicity in PDF generation
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e2b25; }
          h1, h2 { family: 'Playfair Display', serif; color: #568F72; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #568F72; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-weight: bold; font-size: 24px; }
          .section { margin-bottom: 30px; page-break-inside: avoid; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .card { background: #F9F7F2; padding: 20px; border-radius: 8px; }
          .chart { width: 100%; height: auto; display: block; margin: 0 auto; }
          .summary { background: #fff; border-left: 4px solid #568F72; padding: 15px; font-style: italic; white-space: pre-wrap; }
          .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">Ajuntament (Marca Blanca)</div>
          <div>Informe d'Impacte Turístic</div>
        </div>

        <h1>Resum Executiu</h1>
        <div class="section summary">
          ${summary}
        </div>

        <div class="grid">
             <div class="section card">
                <h2>Afluència Setmanal</h2>
                <img src="${barChartUrl}" class="chart" />
             </div>
             <div class="section card">
                <h2>Locals vs Turistes</h2>
                <img src="${pieChartUrl}" class="chart" />
             </div>
        </div>

        <div class="section">
            <h2>Dades Clau</h2>
            <ul>
                <li><strong>Total Visites:</strong> ${reportData.visits}</li>
                <li><strong>Hores Punta:</strong> ${reportData.peakHours.join(', ')}</li>
                <li><strong>Lloc més visitat:</strong> ${reportData.topLocations[0].label} (${reportData.topLocations[0].value})</li>
            </ul>
        </div>

        <div class="footer">
          Powered by Xino Xano Intelligence
        </div>
      </body>
      </html>
    `;

    // 5. Generate PDF
    console.log("Rendering PDF...");
    const pdfBuffer = await generatePdf(html);

    // 6. Upload PDF (Simulated - saving to public folder)
    // In strict PWA, likely upload to Supabase Storage.
    // For now, save to public/reports
    const fileName = `report-${reportId}.pdf`;
    const publicDir = path.join(process.cwd(), 'public', 'reports');
    if (!fs.existsSync(publicDir)){
        fs.mkdirSync(publicDir, { recursive: true });
    }
    const filePath = path.join(publicDir, fileName);
    fs.writeFileSync(filePath, pdfBuffer);
    
    // Construct local URL (relative)
    const resultUrl = `/reports/${fileName}`;

    // 7. Update Status
    console.log("Job Completed.");
    await prisma.report.update({
      where: { id: reportId },
      data: { 
        status: 'COMPLETED',
        resultUrl: resultUrl,
        data: reportData as any
      }
    });

  } catch (error: any) {
    console.error("Job Failed:", error);
    await prisma.report.update({
      where: { id: reportId },
      data: { 
        status: 'FAILED',
        error: error.message
      }
    });
  }

}, { connection: connection as any });

console.log("Worker started...");
