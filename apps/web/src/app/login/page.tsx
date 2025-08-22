'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useSignMessage } from 'wagmi';
import { SiweMessage } from 'siwe';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { WalletIcon } from '@web3icons/react';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

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


  const handleWalletConnect = async (walletType: string) => {
    if (walletType === 'phantom') {
      // Check if Phantom is installed
      if (typeof window !== 'undefined' && (window as any).phantom?.solana) {
        try {
          setIsLoading(true);
          setError(null);
          
          // Find phantom connector
          const connector = connectors.find(c => c.id === 'phantom' || c.name.toLowerCase().includes('phantom'));
          
          if (connector) {
            const result = await connect({ connector });
            // After successful connection, automatically trigger sign
            if (result && result.accounts && result.accounts[0]) {
              // Wait a moment for state to update, then sign
              setTimeout(async () => {
                try {
                  await handleSiweAuth();
                } catch (err) {
                  console.error('SIWE Auth failed:', err);
                  setIsLoading(false);
                }
              }, 500);
            }
          } else {
            setError('Phantom connector not available');
            setIsLoading(false);
          }
        } catch (err) {
          console.error('Phantom connection failed:', err);
          setError('Phantom wallet connection failed');
          setIsLoading(false);
        }
      } else {
        // Redirect to Phantom download page
        window.open('https://phantom.com/download', '_blank');
      }
    } else {
      // Disable other wallets for now
      setError('Only Phantom wallet is supported currently');
    }
  };

  const handleSiweAuth = async () => {
    if (!address) {
      setError('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const nonce = Math.random().toString(36).substring(2, 15);

      const message = new SiweMessage({
        domain: window.location.host,
        address: address,
        statement: 'Sign in to Skiff Mail Clone',
        uri: window.location.origin,
        version: '1',
        chainId: 1,
        nonce: nonce,
      });

      const signature = await signMessageAsync({
        message: message.prepareMessage()
      });

      const verifyResult = await message.verify({ signature });
      
      if (!verifyResult.success) {
        throw new Error('Signature verification failed');
      }

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


  if (!isConnected) {
    // Show loading page when connecting/signing
    if (isLoading) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="bg-card border rounded-lg p-6 w-full max-w-sm">
            {/* Back button */}
            <div className="mb-6">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsLoading(false)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Large Phantom icon */}
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-6">
                <WalletIcon id="phantom" variant="branded" size="80" className="w-20 h-20" />
              </div>
              
              <h2 className="text-xl font-semibold mb-2">Connecting to Phantom</h2>
              <p className="text-muted-foreground text-sm">Please sign the message in your wallet</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
        {/* Top left corner logo */}
        <div className="absolute top-4 left-4">
          <span className="text-lg font-bold text-black">blanc</span>
        </div>
        
        <div className="bg-card border rounded-lg p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">Welcome to blanc</h1>
          </div>
          
          <div className="flex gap-4">
            <Button
              variant="outline"
              size="icon"
              className="h-24 w-24 [&_svg]:!w-16 [&_svg]:!h-16"
              onClick={() => handleWalletConnect('phantom')}
              disabled={isLoading}
            >
              <WalletIcon id="phantom" variant="branded" size="64" className="w-16 h-16" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              className="h-24 w-24 [&_svg]:!w-16 [&_svg]:!h-16 opacity-50"
              onClick={() => handleWalletConnect('metamask')}
              disabled={true}
            >
              <WalletIcon id="metamask" variant="branded" size="64" className="w-16 h-16" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              className="h-24 w-24 [&_svg]:!w-16 [&_svg]:!h-16 opacity-50"
              onClick={() => handleWalletConnect('coinbase')}
              disabled={true}
            >
              <WalletIcon id="coinbase" variant="branded" size="64" className="w-16 h-16" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              className="h-24 w-24 [&_svg]:!w-16 [&_svg]:!h-16 opacity-50"
              onClick={() => handleWalletConnect('walletconnect')}
              disabled={true}
            >
              <WalletIcon id="walletconnect" variant="branded" size="64" className="w-16 h-16" />
            </Button>
          </div>

          {(error) && (
            <div className="mt-4 p-3 border border-destructive rounded-md">
              <p className="text-sm text-destructive">
                {error}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // If connected but not yet signed, show loading state
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card border rounded-lg p-6">
        <div className="flex gap-4">
          <Button
            variant="outline"
            size="icon"
            className="h-24 w-24 [&_svg]:!w-16 [&_svg]:!h-16"
            disabled={true}
          >
            <WalletIcon id="phantom" variant="branded" size="64" className="w-16 h-16" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="h-24 w-24 [&_svg]:!w-16 [&_svg]:!h-16"
            disabled={true}
          >
            <WalletIcon id="metamask" variant="branded" size="64" className="w-16 h-16" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="h-24 w-24 [&_svg]:!w-16 [&_svg]:!h-16"
            disabled={true}
          >
            <WalletIcon id="coinbase" variant="branded" size="64" className="w-16 h-16" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="h-24 w-24 [&_svg]:!w-16 [&_svg]:!h-16"
            disabled={true}
          >
            <WalletIcon id="walletconnect" variant="branded" size="64" className="w-16 h-16" />
          </Button>
        </div>
        
        {error && (
          <div className="mt-4 p-3 border border-destructive rounded-md">
            <p className="text-sm text-destructive text-center">
              {error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}