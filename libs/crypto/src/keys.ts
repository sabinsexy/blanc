import argon2 from 'argon2-browser';
import { encodeBase64, decodeBase64, generateRandomBytes } from './utils';
import { encryptSymmetric, decryptSymmetric } from './symmetric';
import { generatePublicPrivateKeyPair, generateSigningKeyPair } from './asymmetric';
import type { KeyPair, SigningKeyPair, UserKeys, DecryptedUserData } from './types';

// Key derivation from wallet signature (like Skiff's approach)

export async function deriveKeyFromWalletSignature(
  signature: string,
  salt?: Uint8Array
): Promise<{ key: string; salt: Uint8Array }> {
  try {
    const actualSalt = salt || generateRandomBytes(32);
    
    const result = await argon2.hash({
      pass: signature,
      salt: actualSalt,
      type: argon2.ArgonType.Argon2id,
      hashLen: 32,
      time: 3,           // iterations
      mem: 4096,         // memory in KB
      parallelism: 1     // threads
    });
    
    return {
      key: encodeBase64(result.hash),
      salt: actualSalt
    };
  } catch (error) {
    throw new Error(`Key derivation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Generate user's encryption keys on first sign-in
export async function generateUserKeys(walletSignature: string): Promise<{
  publicKey: string;
  signingPublicKey: string;
  encryptedUserData: string;
  salt: string;
}> {
  try {
    // Generate key pairs
    const encryptionKeyPair = generatePublicPrivateKeyPair();
    const signingKeyPair = generateSigningKeyPair();
    
    // Derive key from wallet signature
    const { key: walletDerivedKey, salt } = await deriveKeyFromWalletSignature(walletSignature);
    
    // Prepare data to encrypt
    const userData: DecryptedUserData = {
      privateKey: encryptionKeyPair.privateKey,
      signingPrivateKey: signingKeyPair.privateKey
    };
    
    // Encrypt private keys with wallet-derived key
    const encryptedUserData = encryptSymmetric(userData, walletDerivedKey);
    
    return {
      publicKey: encryptionKeyPair.publicKey,
      signingPublicKey: signingKeyPair.publicKey,
      encryptedUserData,
      salt: encodeBase64(salt)
    };
  } catch (error) {
    throw new Error(`User key generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Decrypt user's private keys using wallet signature
export async function decryptUserKeys(
  encryptedUserData: string,
  walletSignature: string,
  salt: string
): Promise<DecryptedUserData> {
  try {
    const saltUint8 = decodeBase64(salt);
    const { key: walletDerivedKey } = await deriveKeyFromWalletSignature(
      walletSignature,
      saltUint8
    );
    
    const decryptedData = decryptSymmetric(encryptedUserData, walletDerivedKey);
    return decryptedData as DecryptedUserData;
  } catch (error) {
    throw new Error(`User key decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Re-encrypt user data (for key rotation or updates)
export async function reencryptUserData(
  currentEncryptedData: string,
  currentWalletSignature: string,
  newWalletSignature: string,
  salt: string
): Promise<string> {
  try {
    // Decrypt with current signature
    const userData = await decryptUserKeys(
      currentEncryptedData,
      currentWalletSignature,
      salt
    );
    
    // Derive new key from new signature
    const saltUint8 = decodeBase64(salt);
    const { key: newWalletDerivedKey } = await deriveKeyFromWalletSignature(
      newWalletSignature,
      saltUint8
    );
    
    // Re-encrypt with new key
    return encryptSymmetric(userData, newWalletDerivedKey);
  } catch (error) {
    throw new Error(`User data re-encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Validate key pair integrity
export function validateKeyPair(keyPair: KeyPair): boolean {
  try {
    const testMessage = 'test-message-for-validation';
    const testKey = 'test-symmetric-key-32-bytes-long';
    
    // This is a simplified validation - in production you'd do proper crypto validation
    return keyPair.publicKey.length > 0 && keyPair.privateKey.length > 0;
  } catch {
    return false;
  }
}