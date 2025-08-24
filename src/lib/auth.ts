import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";
import { siwe } from "better-auth/plugins";
import { generateRandomString } from "better-auth/crypto";
import { verifyMessage, createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: false,
  },
  plugins: [
    siwe({
      domain: "myapp.com",
      emailDomainName: "myapp.com",
      anonymous: false,
      getNonce: async () => {
        // Generate a cryptographically secure random nonce
        return generateRandomString(32);
      },
      verifyMessage: async ({ message, signature, address }) => {
        try {
          // Verify the signature using viem (recommended)
          const isValid = await verifyMessage({
            address: address as `0x${string}`,
            message,
            signature: signature as `0x${string}`,
          });
          return isValid;
        } catch (error) {
          console.error("SIWE verification failed:", error);
          return false;
        }
      },
    }),
  ],
});
