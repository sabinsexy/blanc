import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { siwe } from "better-auth/plugins";
// If your Prisma file is located elsewhere, you can change the path
import prisma from "@/lib/prisma";

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql", // or "mysql", "postgresql", ...etc
	}),
	emailAndPassword: {
		enabled: false,
	},
	plugins: [
		siwe({
			domain: "example.com",
			emailDomainName: "example.com", // optional
			anonymous: false, // optional, default is true
			getNonce: async () => {
				// Implement your nonce generation logic here
				return "your-secure-random-nonce";
			},
			verifyMessage: async (args) => {
				// Implement your SIWE message verification logic here
				// This should verify the signature against the message
				return true; // return true if signature is valid
			},
			ensLookup: async (args) => {
				// Optional: Implement ENS lookup for user names and avatars
				return {
					name: "user.eth",
					avatar: "https://example.com/avatar.png",
				};
			},
		}),
	],
});
