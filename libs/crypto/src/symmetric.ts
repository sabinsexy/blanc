import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64, stringToUint8Array, uint8ArrayToString } from './utils';
import type { EncryptedData } from './types';

// Symmetric encryption using NaCl secretbox (like Skiff)

export function generateSymmetricKey(): string {
  const key = nacl.randomBytes(nacl.secretbox.keyLength);
  return encodeBase64(key);
}

export function encryptSymmetric(
  plaintext: any,
  key: string,
  additionalData?: any
): string {
  try {
    // Convert data to JSON string then to Uint8Array
    const dataToEncrypt = typeof plaintext === 'string' 
      ? plaintext 
      : JSON.stringify(plaintext);
    
    const messageUint8 = stringToUint8Array(dataToEncrypt);
    const keyUint8 = decodeBase64(key);
    const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
    
    // Encrypt using NaCl secretbox
    const encrypted = nacl.secretbox(messageUint8, nonce, keyUint8);
    
    if (!encrypted) {
      throw new Error('Encryption failed');
    }
    
    // Combine nonce + encrypted data
    const fullMessage = new Uint8Array(nonce.length + encrypted.length);
    fullMessage.set(nonce);
    fullMessage.set(encrypted, nonce.length);
    
    return encodeBase64(fullMessage);
  } catch (error) {
    throw new Error(`Symmetric encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function decryptSymmetric(
  encryptedData: string,
  key: string
): any {
  try {
    const fullMessage = decodeBase64(encryptedData);
    const keyUint8 = decodeBase64(key);
    
    // Extract nonce and encrypted data
    const nonce = fullMessage.slice(0, nacl.secretbox.nonceLength);
    const encrypted = fullMessage.slice(nacl.secretbox.nonceLength);
    
    // Decrypt using NaCl secretbox
    const decrypted = nacl.secretbox.open(encrypted, nonce, keyUint8);
    
    if (!decrypted) {
      throw new Error('Decryption failed - invalid key or corrupted data');
    }
    
    const decryptedString = uint8ArrayToString(decrypted);
    
    // Try to parse as JSON, fall back to string
    try {
      return JSON.parse(decryptedString);
    } catch {
      return decryptedString;
    }
  } catch (error) {
    throw new Error(`Symmetric decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Encrypt large data (for R2 storage)
export function encryptForStorage(
  data: Uint8Array,
  key: string
): Uint8Array {
  const keyUint8 = decodeBase64(key);
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  
  const encrypted = nacl.secretbox(data, nonce, keyUint8);
  if (!encrypted) {
    throw new Error('Storage encryption failed');
  }
  
  // Return nonce + encrypted data as Uint8Array
  const result = new Uint8Array(nonce.length + encrypted.length);
  result.set(nonce);
  result.set(encrypted, nonce.length);
  
  return result;
}

export function decryptFromStorage(
  encryptedData: Uint8Array,
  key: string
): Uint8Array {
  const keyUint8 = decodeBase64(key);
  
  // Extract nonce and encrypted data
  const nonce = encryptedData.slice(0, nacl.secretbox.nonceLength);
  const encrypted = encryptedData.slice(nacl.secretbox.nonceLength);
  
  const decrypted = nacl.secretbox.open(encrypted, nonce, keyUint8);
  if (!decrypted) {
    throw new Error('Storage decryption failed');
  }
  
  return decrypted;
}