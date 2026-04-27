import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  pgPool?: Pool;
  pgAdapter?: PrismaPg;
  prisma?: PrismaClient;
};

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not configured");
}

const pgPool =
  globalForPrisma.pgPool ??
  new Pool({
    connectionString: databaseUrl,
  });

const pgAdapter = globalForPrisma.pgAdapter ?? new PrismaPg(pgPool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: pgAdapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.pgPool = pgPool;
  globalForPrisma.pgAdapter = pgAdapter;
  globalForPrisma.prisma = prisma;
}
