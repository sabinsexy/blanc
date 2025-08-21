import type { KeyPair, DecryptedUserData } from './types';
export declare function deriveKeyFromWalletSignature(signature: string, salt?: Uint8Array): Promise<{
    key: string;
    salt: Uint8Array;
}>;
export declare function generateUserKeys(walletSignature: string): Promise<{
    publicKey: string;
    signingPublicKey: string;
    encryptedUserData: string;
    salt: string;
}>;
export declare function decryptUserKeys(encryptedUserData: string, walletSignature: string, salt: string): Promise<DecryptedUserData>;
export declare function reencryptUserData(currentEncryptedData: string, currentWalletSignature: string, newWalletSignature: string, salt: string): Promise<string>;
export declare function validateKeyPair(keyPair: KeyPair): boolean;
//# sourceMappingURL=keys.d.ts.map