import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { envConfig } from '../config/env.config';
import { Role } from '@prisma/client';

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
  name: string;
}

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (payload: JwtPayload): string => {
  const options: SignOptions = {
    expiresIn: envConfig.jwtExpiresIn as any,
  };
  return jwt.sign(payload, envConfig.jwtSecret, options);
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, envConfig.jwtSecret) as JwtPayload;
};
