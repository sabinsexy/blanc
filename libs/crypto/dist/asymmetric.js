import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64, stringToUint8Array, uint8ArrayToString } from './utils';
// Asymmetric encryption using NaCl box (like Skiff)
export function generatePublicPrivateKeyPair() {
    const keypair = nacl.box.keyPair();
    return {
        publicKey: encodeBase64(keypair.publicKey),
        privateKey: encodeBase64(keypair.secretKey)
    };
}
export function generateSigningKeyPair() {
    const keypair = nacl.sign.keyPair();
    return {
        publicKey: encodeBase64(keypair.publicKey),
        privateKey: encodeBase64(keypair.secretKey)
    };
}
export function encryptAsymmetric(plaintext, recipientPublicKey, senderPrivateKey) {
    try {
        const dataToEncrypt = typeof plaintext === 'string'
            ? plaintext
            : JSON.stringify(plaintext);
        const messageUint8 = stringToUint8Array(dataToEncrypt);
        const recipientPublicKeyUint8 = decodeBase64(recipientPublicKey);
        const senderPrivateKeyUint8 = decodeBase64(senderPrivateKey);
        const nonce = nacl.randomBytes(nacl.box.nonceLength);
        // Encrypt using NaCl box
        const encrypted = nacl.box(messageUint8, nonce, recipientPublicKeyUint8, senderPrivateKeyUint8);
        if (!encrypted) {
            throw new Error('Asymmetric encryption failed');
        }
        // Combine nonce + encrypted data
        const fullMessage = new Uint8Array(nonce.length + encrypted.length);
        fullMessage.set(nonce);
        fullMessage.set(encrypted, nonce.length);
        return encodeBase64(fullMessage);
    }
    catch (error) {
        throw new Error(`Asymmetric encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
export function decryptAsymmetric(encryptedData, senderPublicKey, recipientPrivateKey) {
    try {
        const fullMessage = decodeBase64(encryptedData);
        const senderPublicKeyUint8 = decodeBase64(senderPublicKey);
        const recipientPrivateKeyUint8 = decodeBase64(recipientPrivateKey);
        // Extract nonce and encrypted data
        const nonce = fullMessage.slice(0, nacl.box.nonceLength);
        const encrypted = fullMessage.slice(nacl.box.nonceLength);
        // Decrypt using NaCl box
        const decrypted = nacl.box.open(encrypted, nonce, senderPublicKeyUint8, recipientPrivateKeyUint8);
        if (!decrypted) {
            throw new Error('Asymmetric decryption failed - invalid keys or corrupted data');
        }
        const decryptedString = uint8ArrayToString(decrypted);
        // Try to parse as JSON, fall back to string
        try {
            return JSON.parse(decryptedString);
        }
        catch {
            return decryptedString;
        }
    }
    catch (error) {
        throw new Error(`Asymmetric decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
// Sign data with signing key
export function signData(data, signingPrivateKey) {
    const dataUint8 = stringToUint8Array(data);
    const signingPrivateKeyUint8 = decodeBase64(signingPrivateKey);
    const signed = nacl.sign(dataUint8, signingPrivateKeyUint8);
    return encodeBase64(signed);
}
// Verify signed data
export function verifySignature(signedData, signingPublicKey) {
    try {
        const signedDataUint8 = decodeBase64(signedData);
        const signingPublicKeyUint8 = decodeBase64(signingPublicKey);
        const verified = nacl.sign.open(signedDataUint8, signingPublicKeyUint8);
        if (!verified) {
            return null;
        }
        return uint8ArrayToString(verified);
    }
    catch {
        return null;
    }
}
// Encrypt session key for multiple recipients (like Skiff's approach)
export function encryptSessionKeyForRecipients(sessionKey, recipientPublicKeys, senderPrivateKey) {
    const encryptedKeys = {};
    for (const publicKey of recipientPublicKeys) {
        encryptedKeys[publicKey] = encryptAsymmetric(sessionKey, publicKey, senderPrivateKey);
    }
    return encryptedKeys;
}
//# sourceMappingURL=asymmetric.js.map