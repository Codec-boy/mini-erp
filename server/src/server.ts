import app from './app';
import { envConfig } from './config/env.config';
import { prisma } from './config/db.config';

const PORT = envConfig.port;

async function startServer() {
  try {
    // Verify DB Connection
    await prisma.$connect();
    console.log('✅ Successfully connected to PostgreSQL Database via Prisma ORM');

    app.listen(PORT, () => {
      console.log(`🚀 Mini ERP + CRM Server running in ${envConfig.nodeEnv} mode on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
