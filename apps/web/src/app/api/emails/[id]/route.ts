import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = await prisma.email.findUnique({
      where: { id: params.id },
      include: {
        folder: true,
        attachments: true
      }
    });

    if (!email) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 });
    }

    if (email.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(email);
  } catch (error) {
    console.error(`GET /api/emails/${params.id} error:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { isRead, isStarred, folderId } = body;

    const email = await prisma.email.findUnique({
      where: { id: params.id }
    });

    if (!email) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 });
    }

    if (email.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // If moving to folder, verify folder belongs to user
    if (folderId) {
      const folder = await prisma.folder.findUnique({
        where: { id: folderId }
      });

      if (!folder || folder.userId !== session.user.id) {
        return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
      }
    }

    const updatedEmail = await prisma.email.update({
      where: { id: params.id },
      data: {
        ...(typeof isRead === 'boolean' && { isRead }),
        ...(typeof isStarred === 'boolean' && { isStarred }),
        ...(folderId && { folderId })
      },
      include: {
        folder: true,
        attachments: true
      }
    });

    return NextResponse.json(updatedEmail);
  } catch (error) {
    console.error(`PATCH /api/emails/${params.id} error:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = await prisma.email.findUnique({
      where: { id: params.id }
    });

    if (!email) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 });
    }

    if (email.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Move to trash folder instead of hard delete
    const trashFolder = await prisma.folder.findFirst({
      where: { 
        userId: session.user.id,
        type: 'trash'
      }
    });

    if (trashFolder) {
      await prisma.email.update({
        where: { id: params.id },
        data: { folderId: trashFolder.id }
      });
    } else {
      // Hard delete if no trash folder
      await prisma.email.delete({
        where: { id: params.id }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`DELETE /api/emails/${params.id} error:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}