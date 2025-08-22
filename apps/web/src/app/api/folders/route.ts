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

    const folders = await prisma.folder.findMany({
      where: { userId: session.user.id },
      orderBy: { sortOrder: 'asc' }
    });

    // Add email count for each folder
    const foldersWithCount = await Promise.all(
      folders.map(async (folder) => {
        const emailCount = await prisma.email.count({
          where: { 
            userId: session.user.id,
            folderId: folder.id 
          }
        });
        return { ...folder, emailCount };
      })
    );

    return NextResponse.json(foldersWithCount);
  } catch (error) {
    console.error('GET /api/folders error:', error);
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
    const { name, color } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Check if folder name already exists for user
    const existingFolder = await prisma.folder.findFirst({
      where: {
        userId: session.user.id,
        name
      }
    });

    if (existingFolder) {
      return NextResponse.json({ error: 'Folder with this name already exists' }, { status: 409 });
    }

    // Get next sort order
    const maxSortOrder = await prisma.folder.aggregate({
      where: { userId: session.user.id },
      _max: { sortOrder: true }
    });

    const folder = await prisma.folder.create({
      data: {
        userId: session.user.id,
        name,
        type: 'custom',
        color,
        sortOrder: (maxSortOrder._max.sortOrder || 0) + 1
      }
    });

    return NextResponse.json({ ...folder, emailCount: 0 });
  } catch (error) {
    console.error('POST /api/folders error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}