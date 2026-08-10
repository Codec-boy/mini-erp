import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const envConfig = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'fallback-jwt-secret-minierp',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
};
