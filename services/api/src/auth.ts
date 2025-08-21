import { PrismaClient } from '@prisma/client';
import { SRPAuthenticator } from '@smc/crypto';

export interface AuthUser {
  id: string;
  walletAddress: string;
  publicKey?: string;
  signingPublicKey?: string;
  encryptedUserData?: string;
}

// Authenticate user by session token
export async function authenticateUser(
  sessionToken: string,
  prisma: PrismaClient
): Promise<AuthUser | null> {
  try {
    // In a real implementation, you'd decode and verify the JWT
    // For now, find user by session
    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    const user = session.user;
    return {
      id: user.id,
      walletAddress: user.walletAddress,
      publicKey: user.publicKey || undefined,
      signingPublicKey: user.signingPublicKey || undefined,
      encryptedUserData: user.encryptedUserData || undefined,
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

// Require authenticated user
export function requireAuth(user?: AuthUser): AuthUser {
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

// Check if user has access to resource
export function checkUserAccess(user: AuthUser, userId: string): void {
  if (user.id !== userId) {
    throw new Error('Access denied');
  }
}