import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { siwe } from "better-auth/plugins/siwe";
import { SiweMessage } from "siwe";
import prisma from "./prisma";
import { generateUserKeys, decryptUserKeys } from "@smc/crypto";
import { SRPAuthenticator } from "@smc/crypto";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  plugins: [
    siwe({
      domain: process.env.NEXT_PUBLIC_DOMAIN || "localhost:3000",
      anonymous: false,
      getNonce: async () => {
        // Generate cryptographically secure nonce
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
      },
      verifyMessage: async ({ message, signature, address }) => {
        try {
          // Proper SIWE message verification
          const siweMessage = new SiweMessage(message);
          const result = await siweMessage.verify({ signature });
          return result.success && siweMessage.address.toLowerCase() === address.toLowerCase();
        } catch (error) {
          console.error('SIWE verification error:', error);
          return false;
        }
      },
    }),
  ],
  callbacks: {
    session: {
      async onSignIn({ user, account }) {
        try {
          const walletAddress = user.walletAddress || account?.accountId;
          if (!walletAddress) {
            throw new Error('No wallet address found');
          }

          // Check if user already has encryption keys
          const existingUser = await prisma.user.findUnique({
            where: { walletAddress: walletAddress.toLowerCase() }
          });

          if (!existingUser?.publicKey) {
            // Generate encryption keys on first sign-in
            const signature = account?.signature || '';
            const keyData = await generateUserKeys(signature);
            
            // Generate SRP credentials
            const srpCreds = await SRPAuthenticator.generateSRPCredentials(
              walletAddress,
              signature
            );

            // Update user with encryption data
            await prisma.user.update({
              where: { id: user.id },
              data: {
                walletAddress: walletAddress.toLowerCase(),
                publicKey: keyData.publicKey,
                signingPublicKey: keyData.signingPublicKey,
                encryptedUserData: keyData.encryptedUserData,
                srpSalt: srpCreds.salt,
                srpVerifier: srpCreds.verifier,
              }
            });

            // Create default folders
            await createDefaultFolders(user.id);
          }

          return { user, account };
        } catch (error) {
          console.error('Sign-in callback error:', error);
          throw error;
        }
      }
    }
  }
});

// Create default email folders for new users
async function createDefaultFolders(userId: string) {
  const defaultFolders = [
    { name: 'Inbox', type: 'inbox', sortOrder: 0 },
    { name: 'Sent', type: 'sent', sortOrder: 1 },
    { name: 'Drafts', type: 'drafts', sortOrder: 2 },
    { name: 'Trash', type: 'trash', sortOrder: 3 },
  ];

  for (const folder of defaultFolders) {
    await prisma.folder.create({
      data: {
        ...folder,
        userId,
      }
    });
  }
}
