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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        aliases: {
          orderBy: { isDefault: 'desc' }
        },
        folders: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Add email count for each folder
    const foldersWithCount = await Promise.all(
      user.folders.map(async (folder) => {
        const emailCount = await prisma.email.count({
          where: { 
            userId: user.id,
            folderId: folder.id 
          }
        });
        return { ...folder, emailCount };
      })
    );

    return NextResponse.json({
      ...user,
      folders: foldersWithCount
    });
  } catch (error) {
    console.error('GET /api/user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}