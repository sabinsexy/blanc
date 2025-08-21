import type { KeyPair, SigningKeyPair } from './types';
export declare function generatePublicPrivateKeyPair(): KeyPair;
export declare function generateSigningKeyPair(): SigningKeyPair;
export declare function encryptAsymmetric(plaintext: any, recipientPublicKey: string, senderPrivateKey: string): string;
export declare function decryptAsymmetric(encryptedData: string, senderPublicKey: string, recipientPrivateKey: string): any;
export declare function signData(data: string, signingPrivateKey: string): string;
export declare function verifySignature(signedData: string, signingPublicKey: string): string | null;
export declare function encryptSessionKeyForRecipients(sessionKey: string, recipientPublicKeys: string[], senderPrivateKey: string): Record<string, string>;
//# sourceMappingURL=asymmetric.d.ts.map