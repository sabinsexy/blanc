import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const folderId = searchParams.get('folderId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const query = searchParams.get('query');

    let whereClause: any = {
      userId: session.user.id,
      ...(folderId && { folderId })
    };

    // For search, we can only search unencrypted metadata
    // Note: Encrypted content search would need to be handled client-side
    if (query) {
      // This is a placeholder - encrypted emails can't be searched server-side
      // You would need to fetch all emails and search client-side after decryption
    }

    const emails = await prisma.email.findMany({
      where: whereClause,
      include: {
        folder: true,
        attachments: true
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset
    });

    return NextResponse.json(emails);
  } catch (error) {
    console.error('GET /api/emails error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { encryptedData, encryptedSessionKeys, r2BlobKey, threadId, attachments } = body;

    // Get sent folder
    const sentFolder = await prisma.folder.findFirst({
      where: {
        userId: session.user.id,
        type: 'sent'
      }
    });

    // Create email record
    const email = await prisma.email.create({
      data: {
        userId: session.user.id,
        encryptedData,
        encryptedSessionKey: JSON.stringify(encryptedSessionKeys),
        r2BlobKey,
        threadId,
        size: Buffer.byteLength(encryptedData, 'utf8'),
        folderId: sentFolder?.id || null
      },
      include: {
        folder: true,
        attachments: true
      }
    });

    // Create attachments if any
    if (attachments && attachments.length > 0) {
      await prisma.attachment.createMany({
        data: attachments.map((att: any) => ({
          emailId: email.id,
          encryptedMetadata: att.encryptedMetadata,
          r2BlobKey: att.r2BlobKey,
          size: att.size
        }))
      });
    }

    // Return email with attachments
    const emailWithAttachments = await prisma.email.findUnique({
      where: { id: email.id },
      include: {
        folder: true,
        attachments: true
      }
    });

    return NextResponse.json(emailWithAttachments);
  } catch (error) {
    console.error('POST /api/emails error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}