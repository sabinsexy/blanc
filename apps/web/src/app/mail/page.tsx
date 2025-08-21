'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MailSidebar } from '@/components/mail/mail-sidebar';
import { MailList } from '@/components/mail/mail-list';
import { MailViewer } from '@/components/mail/mail-viewer';
import { ComposeDialog } from '@/components/mail/compose-dialog';

export default function MailApp() {
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // Check authentication
    const token = localStorage.getItem('auth-token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Get actual wallet address from localStorage
    const address = localStorage.getItem('wallet-address');
    if (address) {
      setWalletAddress(`${address.slice(0, 6)}...${address.slice(-4)}`);
    } else {
      setWalletAddress('Connected');
    }
  }, [router, isMounted]);

  const handleLogout = () => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('wallet-address');
    router.push('/login');
  };

  const handleEmailSelect = (emailId: string) => {
    setSelectedEmailId(emailId);
  };

  if (!isMounted || !walletAddress) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="mono-card text-center">
          <p className="mono-text">Loading mail app...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="email-layout">
      {/* Sidebar */}
      <MailSidebar 
        walletAddress={walletAddress} 
        onLogout={handleLogout}
        onCompose={() => setComposeOpen(true)}
      />

      {/* Email List */}
      <MailList 
        selectedEmailId={selectedEmailId || undefined}
        onEmailSelect={handleEmailSelect}
      />

      {/* Email Viewer */}
      <MailViewer emailId={selectedEmailId || undefined} />

      {/* Compose Dialog */}
      <ComposeDialog 
        open={composeOpen} 
        onOpenChange={setComposeOpen}
      />
    </div>
  );
}