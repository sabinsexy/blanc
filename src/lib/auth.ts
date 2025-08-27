import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";
import { siwe } from "better-auth/plugins";
import { generateRandomString } from "better-auth/crypto";
import { verifyMessage } from "@wagmi/core";
import { wagmiConfig } from "./wagmi";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: false,
  },
  plugins: [
    // In auth.ts, ensure your SIWE config matches:
    siwe({
      domain: process.env.NEXT_PUBLIC_APP_URL?.replace(/https?:\/\//, '') || "localhost:3000",
      getNonce: async () => {
        return generateRandomString(32);
      },
      verifyMessage: async ({ message, signature, address }) => {
        try {
          console.log({ message, signature, address });
          const isValid = await verifyMessage(wagmiConfig, {
            address: address as `0x${string}`,
            message,
            signature: signature as `0x${string}`,
          });
          console.log("Verification result:", isValid);
          return isValid;
        } catch (error) {
          console.error("SIWE verification failed:", error);
          return false;
        }
      },
    }),
  ],
});
