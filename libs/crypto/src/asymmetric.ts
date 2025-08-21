import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64, stringToUint8Array, uint8ArrayToString } from './utils';
import type { KeyPair, SigningKeyPair } from './types';

// Asymmetric encryption using NaCl box (like Skiff)

export function generatePublicPrivateKeyPair(): KeyPair {
  const keypair = nacl.box.keyPair();
  return {
    publicKey: encodeBase64(keypair.publicKey),
    privateKey: encodeBase64(keypair.secretKey)
  };
}

export function generateSigningKeyPair(): SigningKeyPair {
  const keypair = nacl.sign.keyPair();
  return {
    publicKey: encodeBase64(keypair.publicKey),
    privateKey: encodeBase64(keypair.secretKey)
  };
}

export function encryptAsymmetric(
  plaintext: any,
  recipientPublicKey: string,
  senderPrivateKey: string
): string {
  try {
    const dataToEncrypt = typeof plaintext === 'string' 
      ? plaintext 
      : JSON.stringify(plaintext);
    
    const messageUint8 = stringToUint8Array(dataToEncrypt);
    const recipientPublicKeyUint8 = decodeBase64(recipientPublicKey);
    const senderPrivateKeyUint8 = decodeBase64(senderPrivateKey);
    const nonce = nacl.randomBytes(nacl.box.nonceLength);
    
    // Encrypt using NaCl box
    const encrypted = nacl.box(
      messageUint8,
      nonce,
      recipientPublicKeyUint8,
      senderPrivateKeyUint8
    );
    
    if (!encrypted) {
      throw new Error('Asymmetric encryption failed');
    }
    
    // Combine nonce + encrypted data
    const fullMessage = new Uint8Array(nonce.length + encrypted.length);
    fullMessage.set(nonce);
    fullMessage.set(encrypted, nonce.length);
    
    return encodeBase64(fullMessage);
  } catch (error) {
    throw new Error(`Asymmetric encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function decryptAsymmetric(
  encryptedData: string,
  senderPublicKey: string,
  recipientPrivateKey: string
): any {
  try {
    const fullMessage = decodeBase64(encryptedData);
    const senderPublicKeyUint8 = decodeBase64(senderPublicKey);
    const recipientPrivateKeyUint8 = decodeBase64(recipientPrivateKey);
    
    // Extract nonce and encrypted data
    const nonce = fullMessage.slice(0, nacl.box.nonceLength);
    const encrypted = fullMessage.slice(nacl.box.nonceLength);
    
    // Decrypt using NaCl box
    const decrypted = nacl.box.open(
      encrypted,
      nonce,
      senderPublicKeyUint8,
      recipientPrivateKeyUint8
    );
    
    if (!decrypted) {
      throw new Error('Asymmetric decryption failed - invalid keys or corrupted data');
    }
    
    const decryptedString = uint8ArrayToString(decrypted);
    
    // Try to parse as JSON, fall back to string
    try {
      return JSON.parse(decryptedString);
    } catch {
      return decryptedString;
    }
  } catch (error) {
    throw new Error(`Asymmetric decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Sign data with signing key
export function signData(data: string, signingPrivateKey: string): string {
  const dataUint8 = stringToUint8Array(data);
  const signingPrivateKeyUint8 = decodeBase64(signingPrivateKey);
  
  const signed = nacl.sign(dataUint8, signingPrivateKeyUint8);
  return encodeBase64(signed);
}

// Verify signed data
export function verifySignature(
  signedData: string,
  signingPublicKey: string
): string | null {
  try {
    const signedDataUint8 = decodeBase64(signedData);
    const signingPublicKeyUint8 = decodeBase64(signingPublicKey);
    
    const verified = nacl.sign.open(signedDataUint8, signingPublicKeyUint8);
    if (!verified) {
      return null;
    }
    
    return uint8ArrayToString(verified);
  } catch {
    return null;
  }
}

// Encrypt session key for multiple recipients (like Skiff's approach)
export function encryptSessionKeyForRecipients(
  sessionKey: string,
  recipientPublicKeys: string[],
  senderPrivateKey: string
): Record<string, string> {
  const encryptedKeys: Record<string, string> = {};
  
  for (const publicKey of recipientPublicKeys) {
    encryptedKeys[publicKey] = encryptAsymmetric(
      sessionKey,
      publicKey,
      senderPrivateKey
    );
  }
  
  return encryptedKeys;
}