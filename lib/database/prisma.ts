/**
 * PXX — Prisma Client Singleton
 * Prevents multiple instances in development (hot reload)
 * Updated for Prisma 7 + Driver Adapter (Supabase/PostgreSQL)
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

const getPrismaClient = () => {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const connectionString = process.env.DATABASE_URL || "";
  let finalConnectionString = connectionString;

  if (process.env.NODE_ENV === "development" && connectionString.includes('pooler.supabase.com')) {
    if (connectionString.includes(':5432')) {
      const newUrl = connectionString.replace(':5432', ':6543');
      finalConnectionString = newUrl.includes('?') ? (newUrl.includes('pgbouncer=true') ? newUrl : `${newUrl}&pgbouncer=true`) : `${newUrl}?pgbouncer=true`;
      console.log(" [Prisma] Dev: Switched to Transaction Pooling (6543)");
    }
  }

  const pool = new Pool({
    connectionString: finalConnectionString,
    max: process.env.NODE_ENV === 'development' ? 1 : 10,
    idleTimeoutMillis: 30000
  });
  const adapter = new PrismaPg(pool);

  const client = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }

  return client;
};

export const prisma = getPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  // Pool is only used if adapter is used, but we keep it for now if we revert
}

export default prisma;
