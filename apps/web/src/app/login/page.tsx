'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useSignMessage } from 'wagmi';
import { SiweMessage } from 'siwe';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);


  const handleSiweAuth = async () => {
    if (!address) {
      setError('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // For demo purposes, create SIWE message directly without backend
      // In production, this would go through the GraphQL API
      const nonce = Math.random().toString(36).substring(2, 15);

      // Step 1: Create SIWE message
      const message = new SiweMessage({
        domain: window.location.host,
        address: address,
        statement: 'Sign in to Skiff Mail Clone',
        uri: window.location.origin,
        version: '1',
        chainId: 1,
        nonce: nonce,
      });

      // Step 2: Sign the message
      const signature = await signMessageAsync({
        message: message.prepareMessage()
      });

      // Step 3: Verify signature (basic verification)
      const verifyResult = await message.verify({ signature });
      
      if (!verifyResult.success) {
        throw new Error('Signature verification failed');
      }

      // Step 4: Create demo session token and store
      const demoSessionToken = `demo-session-${address}-${Date.now()}`;
      localStorage.setItem('auth-token', demoSessionToken);
      localStorage.setItem('wallet-address', address);
      
      router.push('/mail');
    } catch (err) {
      console.error('SIWE Auth Error:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state during hydration
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mono-card text-center">
            <div className="mb-8">
              <h1 className="mono-title text-2xl mb-2">SKIFF MAIL CLONE</h1>
              <p className="mono-text-small">End-to-end encrypted email with Web3 authentication</p>
            </div>
            <p className="mono-text">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mono-card text-center">
          {/* Header */}
          <div className="mb-8">
            <h1 className="mono-title text-2xl mb-2">SKIFF MAIL CLONE</h1>
            <p className="mono-text-small">End-to-end encrypted email with Web3 authentication</p>
          </div>

          {/* Connection Status */}
          {!isConnected ? (
            <div className="space-y-4">
              <h2 className="mono-title">Connect Wallet</h2>
              <p className="mono-text-small mb-6">
                Connect your wallet to access encrypted email
              </p>
              
              <div className="space-y-2">
                {connectors.map((connector) => (
                  <button
                    key={connector.uid}
                    onClick={() => connect({ connector })}
                    className="mono-button w-full"
                    disabled={!connector.available}
                  >
                    {connector.name}
                    {!connector.available && ' (unavailable)'}
                  </button>
                ))}
              </div>

              {connectError && (
                <div className="mt-4 p-3 border border-destructive">
                  <p className="mono-text-small text-destructive">
                    {connectError.message}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="mono-title">Wallet Connected</h2>
              <div className="p-3 border border-border">
                <p className="mono-text-small break-all">{address}</p>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={handleSiweAuth}
                  disabled={isLoading}
                  className="mono-button primary w-full"
                >
                  {isLoading ? 'Authenticating...' : 'Sign In with Ethereum'}
                </button>
                
                <button
                  onClick={() => disconnect()}
                  className="mono-button w-full"
                >
                  Disconnect Wallet
                </button>
              </div>

              {error && (
                <div className="mt-4 p-3 border border-destructive">
                  <p className="mono-text-small text-destructive">
                    {error}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="mono-text-small">
            Powered by TweetNaCl.js encryption
          </p>
          <p className="mono-text-small">
            Your keys, your data
          </p>
        </div>
      </div>
    </div>
  );
}