export declare function generateSymmetricKey(): string;
export declare function encryptSymmetric(plaintext: any, key: string, additionalData?: any): string;
export declare function decryptSymmetric(encryptedData: string, key: string): any;
export declare function encryptForStorage(data: Uint8Array, key: string): Uint8Array;
export declare function decryptFromStorage(encryptedData: Uint8Array, key: string): Uint8Array;
//# sourceMappingURL=symmetric.d.ts.map