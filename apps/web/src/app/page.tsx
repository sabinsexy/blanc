'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // Check if user has auth token
    const token = localStorage.getItem('auth-token');
    
    if (token) {
      // Redirect to mail app
      router.push('/mail');
    } else {
      // Redirect to login
      router.push('/login');
    }
  }, [router, isMounted]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="mono-card text-center">
        <h1 className="mono-title text-2xl mb-4">SKIFF MAIL CLONE</h1>
        <p className="mono-text">Loading...</p>
      </div>
    </div>
  );
}
