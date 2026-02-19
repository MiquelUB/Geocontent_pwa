'use server'

import { reportQueue } from '@/lib/queue/client';
import { prisma } from '@/lib/database/prisma';
import { revalidatePath } from 'next/cache';

export async function generateReport(municipalityId: string) {
  try {
    const report = await prisma.report.create({
      data: {
        municipalityId,
        title: `Informe Impacte Turístic - ${new Date().toLocaleDateString('es-ES')}`,
        status: 'PENDING'
      }
    });

    await reportQueue.add('generate-report', {
      reportId: report.id,
      municipalityId
    });
    
    revalidatePath('/admin/reports'); // Depending on where the UI is
    revalidatePath('/admin');
    return { success: true, reportId: report.id };
  } catch (error: any) {
    console.error("Error generating report:", error);
    return { success: false, error: error.message };
  }
}

export async function getReports(municipalityId?: string) {
    try {
        const whereClause = municipalityId ? { municipalityId } : {};
        const reports = await prisma.report.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            include: { municipality: true }
        });
        return reports;
    } catch (error) {
        console.error("Error fetching reports:", error);
        return [];
    }
}
