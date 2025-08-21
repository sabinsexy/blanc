export interface KeyPair {
    publicKey: string;
    privateKey: string;
}
export interface SigningKeyPair {
    publicKey: string;
    privateKey: string;
}
export interface EncryptedData {
    encryptedData: string;
    nonce?: string;
}
export interface EncryptedSessionKey {
    encryptedSessionKey: string;
    senderPublicKey: string;
    recipientPublicKey: string;
}
export interface EmailDatagram {
    to: string[];
    from: string;
    subject: string;
    body: string;
    timestamp: number;
    messageId: string;
}
export interface UserKeys {
    encryptionKeyPair: KeyPair;
    signingKeyPair: SigningKeyPair;
    walletDerivedKey: string;
}
export interface SRPSession {
    salt: string;
    verifier: string;
    sessionKey?: string;
}
export interface DecryptedUserData {
    privateKey: string;
    signingPrivateKey: string;
    encryptedSessionKeys?: Record<string, string>;
}
//# sourceMappingURL=types.d.ts.map