'use client';

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';

interface QRModalProps {
  uri: string;
  isOpen: boolean;
  onClose: () => void;
}

export function QRModal({ uri, isOpen, onClose }: QRModalProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  useEffect(() => {
    if (uri) {
      QRCode.toDataURL(uri, { width: 256, margin: 2 })
        .then(setQrCodeDataUrl)
        .catch(console.error);
    }
  }, [uri]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-sm mx-4">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h2 className="text-lg font-semibold">Scan with your wallet</h2>
            
            {qrCodeDataUrl ? (
              <div className="flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={qrCodeDataUrl} 
                  alt="WalletConnect QR Code" 
                  className="w-64 h-64 border-2 border-gray-200 rounded-lg"
                />
              </div>
            ) : (
              <div className="w-64 h-64 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            )}
            
            <p className="text-sm text-gray-600">
              Open your mobile wallet and scan this QR code to connect
            </p>
            
            <Button 
              onClick={onClose}
              variant="outline"
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}