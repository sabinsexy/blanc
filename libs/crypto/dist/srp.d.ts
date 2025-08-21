export declare class SRPAuthenticator {
    static generateSRPCredentials(walletAddress: string, walletSignature: string): Promise<{
        salt: string;
        verifier: string;
    }>;
    static verifySRPCredentials(walletAddress: string, walletSignature: string, storedSalt: string, storedVerifier: string): Promise<boolean>;
    static generateSessionKey(walletAddress: string, walletSignature: string, nonce: string): Promise<string>;
    static validateSessionKey(sessionKey: string, walletAddress: string, maxAge?: number): Promise<boolean>;
}
export declare class SIWEChallenge {
    static generateChallenge(walletAddress: string): {
        challenge: string;
        nonce: string;
        timestamp: number;
    };
    static validateChallenge(challenge: string, nonce: string, timestamp: number, maxAge?: number): boolean;
}
//# sourceMappingURL=srp.d.ts.map