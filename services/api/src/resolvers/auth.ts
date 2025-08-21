import { Context } from '@smc/gql';
import { SIWEChallenge, SRPAuthenticator } from '@smc/crypto';

export const authResolvers = {
  Mutation: {
    startLogin: async (parent: any, args: { walletAddress: string }, context: Context) => {
      const { walletAddress } = args;

      // Generate SIWE challenge
      const challenge = SIWEChallenge.generateChallenge(walletAddress);

      // Store challenge temporarily (in production, use Redis or similar)
      // For now, we'll return it and rely on client to send it back
      return {
        challenge: challenge.challenge,
        nonce: challenge.nonce,
        timestamp: new Date(challenge.timestamp)
      };
    },

    completeLogin: async (parent: any, args: { walletAddress: string; signature: string; nonce: string }, context: Context) => {
      const { walletAddress, signature, nonce } = args;

      try {
        // Find or create user
        let user = await context.prisma.user.findUnique({
          where: { walletAddress: walletAddress.toLowerCase() }
        });

        if (!user) {
          // Create new user
          user = await context.prisma.user.create({
            data: {
              walletAddress: walletAddress.toLowerCase(),
              name: `User ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
            }
          });
        }

        // Verify SRP credentials if they exist
        if (user.srpSalt && user.srpVerifier) {
          const isValid = await SRPAuthenticator.verifySRPCredentials(
            walletAddress,
            signature,
            user.srpSalt,
            user.srpVerifier
          );

          if (!isValid) {
            throw new Error('Invalid signature');
          }
        }

        // Generate session key
        const sessionKey = await SRPAuthenticator.generateSessionKey(
          walletAddress,
          signature,
          nonce
        );

        // Create session
        const session = await context.prisma.session.create({
          data: {
            userId: user.id,
            token: sessionKey,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            ipAddress: '', // Would extract from request in production
            userAgent: '' // Would extract from request in production
          }
        });

        return {
          user: {
            ...user,
            aliases: [],
            folders: []
          },
          sessionToken: sessionKey
        };
      } catch (error) {
        console.error('Login error:', error);
        throw new Error('Authentication failed');
      }
    }
  }
};