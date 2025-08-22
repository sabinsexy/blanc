import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

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
    const { name, color } = body;

    const folder = await prisma.folder.findUnique({
      where: { id: params.id }
    });

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    if (folder.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Don't allow updating system folders
    if (folder.type !== 'custom') {
      return NextResponse.json({ error: 'Cannot update system folders' }, { status: 400 });
    }

    const updatedFolder = await prisma.folder.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(color !== undefined && { color })
      }
    });

    const emailCount = await prisma.email.count({
      where: { 
        userId: session.user.id,
        folderId: folder.id 
      }
    });

    return NextResponse.json({ ...updatedFolder, emailCount });
  } catch (error) {
    console.error(`PATCH /api/folders/${params.id} error:`, error);
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

    const folder = await prisma.folder.findUnique({
      where: { id: params.id }
    });

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    if (folder.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Don't allow deleting system folders
    if (folder.type !== 'custom') {
      return NextResponse.json({ error: 'Cannot delete system folders' }, { status: 400 });
    }

    // Move emails to inbox before deleting folder
    const inboxFolder = await prisma.folder.findFirst({
      where: {
        userId: session.user.id,
        type: 'inbox'
      }
    });

    if (inboxFolder) {
      await prisma.email.updateMany({
        where: { folderId: params.id },
        data: { folderId: inboxFolder.id }
      });
    }

    await prisma.folder.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`DELETE /api/folders/${params.id} error:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}