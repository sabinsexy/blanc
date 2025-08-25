'use client';

import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useWagmiAuth } from '@/hooks/useWagmiAuth';
import { Button } from '@/components/ui/button';

export function WalletAuth() {
  const { isConnected } = useAccount();
  const {
    isAuthenticated,
    isLoading,
    error,
    userKeys,
    authenticate,
    signOut,
  } = useWagmiAuth();

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Blanc Wallet Authentication
      </h1>

      {/* RainbowKit Connect Button */}
      <div className="mb-6">
        <ConnectButton />
      </div>

      {/* Authentication */}
      {isConnected && (
        <div className="space-y-4">
          {/* Status */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <p>Authentication: {isAuthenticated ? '✅ Authenticated' : '⭕ Not authenticated'}</p>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Actions */}
          {!isAuthenticated ? (
            <Button
              onClick={authenticate}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Authenticating...' : 'Authenticate with SIWE'}
            </Button>
          ) : (
            <Button
              onClick={signOut}
              variant="destructive"
              className="w-full"
            >
              Sign Out
            </Button>
          )}

          {/* Keys Display */}
          {userKeys && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold mb-2">🔐 Encryption Keys Loaded</h3>
              <details>
                <summary className="cursor-pointer text-sm text-green-700">
                  View Public Keys
                </summary>
                <div className="mt-2 space-y-2 text-xs">
                  <div>
                    <p className="font-medium">Encryption:</p>
                    <code className="break-all text-xs bg-white p-1 rounded">
                      {userKeys.encryptionPublicKey}
                    </code>
                  </div>
                  <div>
                    <p className="font-medium">Signing:</p>
                    <code className="break-all text-xs bg-white p-1 rounded">
                      {userKeys.signingPublicKey}
                    </code>
                  </div>
                </div>
              </details>
            </div>
          )}
        </div>
      )}
    </div>
  );
}