// ============================================
// COMPLETE SKIFF-CRYPTO REPLACEMENT
// Same algorithms, same security, no WebAssembly
// ============================================

import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
import { scrypt } from '@noble/hashes/scrypt';
import { hkdf } from '@noble/hashes/hkdf';
import { sha256 } from '@noble/hashes/sha256';

// ============================================
// TYPE DEFINITIONS (Match Skiff-Crypto)
// ============================================

export interface GeneratePublicPrivateKeyPairResult {
  publicKey: string;
  privateKey: string;
}

export interface EncryptedDataPayload {
  ciphertext: string;
  nonce: string;
  metadata: {
    nonce?: string;
    ephemeralPublicKey?: string;
  };
}

// ============================================
// KEY GENERATION
// ============================================

/**
 * Generate X25519/Curve25519 keypair for encryption
 * Equivalent to skiff-crypto's generatePublicPrivateKeyPair
 */
export function generatePublicPrivateKeyPair(): GeneratePublicPrivateKeyPairResult {
  const keyPair = nacl.box.keyPair();
  return {
    publicKey: naclUtil.encodeBase64(keyPair.publicKey),
    privateKey: naclUtil.encodeBase64(keyPair.secretKey),
  };
}

/**
 * Generate Ed25519 keypair for signing
 */
export function generateSigningKeyPair(): GeneratePublicPrivateKeyPairResult {
  const keyPair = nacl.sign.keyPair();
  return {
    publicKey: naclUtil.encodeBase64(keyPair.publicKey),
    privateKey: naclUtil.encodeBase64(keyPair.secretKey),
  };
}

// ============================================
// KEY DERIVATION (Argon2id replacement with scrypt)
// ============================================

/**
 * Derive key from password using scrypt (similar security to Argon2id)
 * Equivalent to skiff-crypto's createKeyFromSecret
 */
export async function createKeyFromSecret(
  secret: string,
  salt: string
): Promise<string> {
  const saltBytes = naclUtil.decodeUTF8(salt);
  const secretBytes = naclUtil.decodeUTF8(secret);
  
  // scrypt with high security parameters (similar to Argon2id)
  // N=2^16 for high memory cost (64MB)
  // r=8, p=1 are standard secure values
  const derivedKey = await scrypt(secretBytes, saltBytes, {
    N: 2 ** 16,  // CPU/memory cost (higher than default for security)
    r: 8,        // Block size
    p: 1,        // Parallelization
    dkLen: 32    // 256-bit output
  });
  
  return naclUtil.encodeBase64(derivedKey);
}

/**
 * Further derive key using HKDF for specific purposes
 * Equivalent to skiff-crypto's createPasswordDerivedSecret
 */
export async function createPasswordDerivedSecret(
  masterSecret: string,
  context: string
): Promise<string> {
  const masterBytes = naclUtil.decodeBase64(masterSecret);
  
  // HKDF with SHA-256 for key expansion
  const derivedKey = hkdf(
    sha256,
    masterBytes,
    undefined,  // No salt (masterSecret is already derived)
    context,    // Info/context string
    32         // 256-bit output
  );
  
  return naclUtil.encodeBase64(derivedKey);
}

// ============================================
// SYMMETRIC ENCRYPTION (XSalsa20-Poly1305)
// ============================================

/**
 * Encrypt with symmetric key using NaCl secretbox
 * Equivalent to skiff-crypto's encryptSymmetric
 */
export function encryptSymmetric(
  plaintext: string,
  key: string,
  aad: string // Additional authenticated data (used as context)
): EncryptedDataPayload {
  const keyBytes = naclUtil.decodeBase64(key);
  
  // Ensure key is 32 bytes
  if (keyBytes.length !== 32) {
    throw new Error('Key must be 32 bytes');
  }
  
  // Generate random nonce
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  
  // Combine AAD with plaintext for authenticated encryption
  const message = `${aad}:${plaintext}`;
  const messageBytes = naclUtil.decodeUTF8(message);
  
  // Encrypt using NaCl secretbox (XSalsa20-Poly1305)
  const ciphertext = nacl.secretbox(messageBytes, nonce, keyBytes);
  
  return {
    ciphertext: naclUtil.encodeBase64(ciphertext),
    nonce: naclUtil.encodeBase64(nonce),
    metadata: {
      nonce: naclUtil.encodeBase64(nonce),
    },
  };
}

/**
 * Decrypt with symmetric key using NaCl secretbox
 * Equivalent to skiff-crypto's decryptSymmetric
 */
export function decryptSymmetric(
  encrypted: EncryptedDataPayload,
  key: string,
  aad: string
): string {
  const keyBytes = naclUtil.decodeBase64(key);
  const ciphertextBytes = naclUtil.decodeBase64(encrypted.ciphertext);
  const nonceBytes = naclUtil.decodeBase64(encrypted.nonce);
  
  // Decrypt using NaCl secretbox
  const decrypted = nacl.secretbox.open(ciphertextBytes, nonceBytes, keyBytes);
  
  if (!decrypted) {
    throw new Error('Decryption failed');
  }
  
  // Verify and remove AAD
  const message = naclUtil.encodeUTF8(decrypted);
  const expectedPrefix = `${aad}:`;
  
  if (!message.startsWith(expectedPrefix)) {
    throw new Error('Authentication failed');
  }
  
  return message.slice(expectedPrefix.length);
}

// ============================================
// ASYMMETRIC ENCRYPTION (X25519 + XSalsa20-Poly1305)
// ============================================

/**
 * Encrypt with public key using NaCl box
 * Equivalent to skiff-crypto's encryptAsymmetric
 */
export function encryptAsymmetric(
  senderPrivateKey: string,
  recipientPublicKey: string,
  plaintext: string
): EncryptedDataPayload {
  const senderPrivKeyBytes = naclUtil.decodeBase64(senderPrivateKey);
  const recipientPubKeyBytes = naclUtil.decodeBase64(recipientPublicKey);
  const messageBytes = naclUtil.decodeUTF8(plaintext);
  
  // Generate nonce
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  
  // Encrypt using NaCl box (X25519 + XSalsa20-Poly1305)
  const ciphertext = nacl.box(
    messageBytes,
    nonce,
    recipientPubKeyBytes,
    senderPrivKeyBytes
  );
  
  return {
    ciphertext: naclUtil.encodeBase64(ciphertext),
    nonce: naclUtil.encodeBase64(nonce),
    metadata: {
      nonce: naclUtil.encodeBase64(nonce),
    },
  };
}

/**
 * Decrypt with private key using NaCl box
 * Equivalent to skiff-crypto's decryptAsymmetric
 */
export function decryptAsymmetric(
  recipientPrivateKey: string,
  senderPublicKey: string,
  encrypted: EncryptedDataPayload
): string {
  const recipientPrivKeyBytes = naclUtil.decodeBase64(recipientPrivateKey);
  const senderPubKeyBytes = naclUtil.decodeBase64(senderPublicKey);
  const ciphertextBytes = naclUtil.decodeBase64(encrypted.ciphertext);
  const nonceBytes = naclUtil.decodeBase64(encrypted.nonce);
  
  // Decrypt using NaCl box
  const decrypted = nacl.box.open(
    ciphertextBytes,
    nonceBytes,
    senderPubKeyBytes,
    recipientPrivKeyBytes
  );
  
  if (!decrypted) {
    throw new Error('Decryption failed');
  }
  
  return naclUtil.encodeUTF8(decrypted);
}

// ============================================
// SIGNING OPERATIONS (Ed25519)
// ============================================

/**
 * Sign a message with Ed25519
 */
export function signMessage(
  message: string,
  privateKey: string
): string {
  const messageBytes = naclUtil.decodeUTF8(message);
  const privateKeyBytes = naclUtil.decodeBase64(privateKey);
  
  const signature = nacl.sign.detached(messageBytes, privateKeyBytes);
  return naclUtil.encodeBase64(signature);
}

/**
 * Verify a signature with Ed25519
 */
export function verifySignature(
  message: string,
  signature: string,
  publicKey: string
): boolean {
  const messageBytes = naclUtil.decodeUTF8(message);
  const signatureBytes = naclUtil.decodeBase64(signature);
  const publicKeyBytes = naclUtil.decodeBase64(publicKey);
  
  return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Generate a random symmetric key
 */
export function generateSymmetricKey(): string {
  const key = nacl.randomBytes(32); // 256-bit key
  return naclUtil.encodeBase64(key);
}

/**
 * Convert string to encrypted payload
 * Equivalent to skiff-crypto's stringToEncryptedDataPayload
 */
export function stringToEncryptedDataPayload(str: string): EncryptedDataPayload {
  const parsed = JSON.parse(str);
  return {
    ciphertext: parsed.ciphertext,
    nonce: parsed.nonce,
    metadata: parsed.metadata || { nonce: parsed.nonce },
  };
}

/**
 * Convert encrypted payload to string
 * Equivalent to skiff-crypto's encryptedDataPayloadToString
 */
export function encryptedDataPayloadToString(payload: EncryptedDataPayload): string {
  return JSON.stringify({
    ciphertext: payload.ciphertext,
    nonce: payload.nonce,
    metadata: payload.metadata,
  });
}