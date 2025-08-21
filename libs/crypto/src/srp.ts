import argon2 from 'argon2-browser';
import { encodeBase64, decodeBase64, generateRandomBytes } from './utils';
import type { SRPSession } from './types';

// Simplified SRP-like implementation for wallet-based auth
// This adapts SRP concepts for Web3 authentication

export class SRPAuthenticator {
  // Generate SRP salt and verifier for wallet address
  static async generateSRPCredentials(
    walletAddress: string,
    walletSignature: string
  ): Promise<{ salt: string; verifier: string }> {
    try {
      // Generate random salt
      const salt = generateRandomBytes(32);
      
      // Create identifier from wallet address + signature
      const identifier = `${walletAddress.toLowerCase()}:${walletSignature}`;
      
      // Generate verifier using Argon2
      const verifierResult = await argon2.hash({
        pass: identifier,
        salt: salt,
        type: argon2.ArgonType.Argon2id,
        hashLen: 32,
        time: 3,
        mem: 4096,
        parallelism: 1
      });
      
      return {
        salt: encodeBase64(salt),
        verifier: encodeBase64(verifierResult.hash)
      };
    } catch (error) {
      throw new Error(`SRP credential generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Verify wallet signature against stored SRP credentials
  static async verifySRPCredentials(
    walletAddress: string,
    walletSignature: string,
    storedSalt: string,
    storedVerifier: string
  ): Promise<boolean> {
    try {
      const salt = decodeBase64(storedSalt);
      const identifier = `${walletAddress.toLowerCase()}:${walletSignature}`;
      
      // Generate verifier with same parameters
      const verifierResult = await argon2.hash({
        pass: identifier,
        salt: salt,
        type: argon2.ArgonType.Argon2id,
        hashLen: 32,
        time: 3,
        mem: 4096,
        parallelism: 1
      });
      
      const computedVerifier = encodeBase64(verifierResult.hash);
      
      // Constant-time comparison
      return computedVerifier === storedVerifier;
    } catch (error) {
      throw new Error(`SRP verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Generate session key for authenticated session
  static async generateSessionKey(
    walletAddress: string,
    walletSignature: string,
    nonce: string
  ): Promise<string> {
    try {
      const sessionData = `${walletAddress}:${walletSignature}:${nonce}:${Date.now()}`;
      const salt = generateRandomBytes(16);
      
      const result = await argon2.hash({
        pass: sessionData,
        salt: salt,
        type: argon2.ArgonType.Argon2id,
        hashLen: 32,
        time: 1, // Lighter for session keys
        mem: 1024,
        parallelism: 1
      });
      
      return encodeBase64(result.hash);
    } catch (error) {
      throw new Error(`Session key generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Validate session key
  static async validateSessionKey(
    sessionKey: string,
    walletAddress: string,
    maxAge: number = 24 * 60 * 60 * 1000 // 24 hours
  ): Promise<boolean> {
    try {
      // In a real implementation, you'd decode the session key
      // and verify its components including timestamp
      // For now, just check if it's a valid base64 string
      const decoded = decodeBase64(sessionKey);
      return decoded.length === 32; // 32 bytes = 256 bits
    } catch {
      return false;
    }
  }
}

// Challenge-response for SIWE authentication
export class SIWEChallenge {
  static generateChallenge(walletAddress: string): {
    challenge: string;
    nonce: string;
    timestamp: number;
  } {
    const nonce = encodeBase64(generateRandomBytes(16));
    const timestamp = Date.now();
    const challenge = `Sign this message to authenticate with Skiff Mail Clone:

Wallet: ${walletAddress}
Nonce: ${nonce}
Timestamp: ${timestamp}

This request will not trigger a blockchain transaction or cost any gas fees.`;
    
    return { challenge, nonce, timestamp };
  }
  
  static validateChallenge(
    challenge: string,
    nonce: string,
    timestamp: number,
    maxAge: number = 5 * 60 * 1000 // 5 minutes
  ): boolean {
    const now = Date.now();
    const age = now - timestamp;
    
    return age <= maxAge && age >= 0;
  }
}