import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { walletAddress?: string };
    const { walletAddress } = body;

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    // Get or create deterministic challenge for this wallet
    // This challenge is separate from SIWE auth and never expires
    // Used for consistent key derivation across sessions
    let challengeRecord = await prisma.keyDerivationChallenge.findUnique({
      where: { walletAddress },
    });

    if (!challengeRecord) {
      // Create deterministic challenge based on wallet address
      // This message will always be the same for consistent key derivation
      const challenge = `Sign this message to derive your encryption keys.\n\nWallet: ${walletAddress}\nPurpose: Key Derivation\nVersion: 1`;
      
      challengeRecord = await prisma.keyDerivationChallenge.create({
        data: {
          challenge,
          walletAddress,
        },
      });
    }

    return NextResponse.json({ challenge: challengeRecord.challenge });
  } catch (error) {
    console.error('Get challenge error:', error);
    return NextResponse.json(
      { error: 'Failed to get challenge' },
      { status: 500 }
    );
  }
}