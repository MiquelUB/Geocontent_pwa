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

const connectionString = `${process.env.DATABASE_URL}`;

// FIX: In development, if using Supabase Pooler (Session 5432), switch to Transaction 6543 to avoid ECONNREFUSED
// because Next.js hot reload exhausts connections rapidly.
if (process.env.NODE_ENV === "development" && connectionString.includes('pooler.supabase.com')) {
    if (connectionString.includes(':5432')) {
        const newUrl = connectionString.replace(':5432', ':6543');
        // valid PGBouncer requires pgbouncer=true flat, but Prisma handles it usually. 
        // Let's add it if missing to be safe for Transaction mode.
        const finalUrl = newUrl.includes('?') ? (newUrl.includes('pgbouncer=true') ? newUrl : `${newUrl}&pgbouncer=true`) : `${newUrl}?pgbouncer=true`;
        process.env.DATABASE_URL = finalUrl;
        console.log(" [Prisma] Dev: Switched to Transaction Pooling (6543)");
    }
}

// Create Pool and Adapter only once
const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL, 
    max: process.env.NODE_ENV === 'development' ? 1 : 10, // Restrict pool in dev
    idleTimeoutMillis: 30000 
});
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  // Pool is only used if adapter is used, but we keep it for now if we revert
}

export default prisma;
