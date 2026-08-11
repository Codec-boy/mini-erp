import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { envConfig } from './env.config';

const isProduction = envConfig.nodeEnv === 'production';
const hasSsl = isProduction || envConfig.databaseUrl.includes('sslmode=') || envConfig.databaseUrl.includes('render.com');

const pool = new Pool({
  connectionString: envConfig.databaseUrl,
  ssl: hasSsl ? { rejectUnauthorized: false } : false,
});

const adapter = new PrismaPg(pool);

const prismaClientSingleton = () => {
  return new PrismaClient({
    adapter,
    log: isProduction ? ['error'] : ['query', 'error', 'warn'],
  });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (envConfig.nodeEnv !== 'production') {
  globalThis.prismaGlobal = prisma;
}
