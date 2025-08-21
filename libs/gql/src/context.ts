import { PrismaClient } from '@prisma/client';

export interface Context {
  prisma: PrismaClient;
  user?: {
    id: string;
    walletAddress: string;
    publicKey?: string;
    signingPublicKey?: string;
    encryptedUserData?: string;
  };
  sessionToken?: string;
}

export function createContext(prisma: PrismaClient): Context {
  return {
    prisma,
  };
}