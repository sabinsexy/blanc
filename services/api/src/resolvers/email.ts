import { Context } from '@smc/gql';
import { requireAuth, checkUserAccess } from '../auth';

export const emailResolvers = {
  Query: {
    emails: async (parent: any, args: { folderId?: string; limit?: number; offset?: number }, context: Context) => {
      const user = requireAuth(context.user);
      
      const { folderId, limit = 50, offset = 0 } = args;
      
      return await context.prisma.email.findMany({
        where: {
          userId: user.id,
          ...(folderId && { folderId })
        },
        include: {
          folder: true,
          attachments: true
        },
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset
      });
    },

    email: async (parent: any, args: { id: string }, context: Context) => {
      const user = requireAuth(context.user);
      
      const email = await context.prisma.email.findUnique({
        where: { id: args.id },
        include: {
          folder: true,
          attachments: true
        }
      });

      if (!email) {
        throw new Error('Email not found');
      }

      checkUserAccess(user, email.userId);
      return email;
    },

    searchEmails: async (parent: any, args: { query: string }, context: Context) => {
      const user = requireAuth(context.user);
      
      // Note: This is a simple search implementation
      // In production, you'd implement client-side search since emails are encrypted
      return await context.prisma.email.findMany({
        where: {
          userId: user.id,
          // We can't search encrypted content on the server
          // This would need to be handled client-side after decryption
        },
        include: {
          folder: true,
          attachments: true
        },
        orderBy: { timestamp: 'desc' },
        take: 100
      });
    }
  },

  Mutation: {
    sendEmail: async (parent: any, args: { input: any }, context: Context) => {
      const user = requireAuth(context.user);
      const { input } = args;

      // Create email record
      const email = await context.prisma.email.create({
        data: {
          userId: user.id,
          encryptedData: input.encryptedData,
          encryptedSessionKey: JSON.stringify(input.encryptedSessionKeys),
          r2BlobKey: input.r2BlobKey,
          threadId: input.threadId,
          size: Buffer.byteLength(input.encryptedData, 'utf8'),
          // Default to sent folder
          folderId: await getSentFolderId(context.prisma, user.id)
        },
        include: {
          folder: true,
          attachments: true
        }
      });

      // Create attachments if any
      if (input.attachments && input.attachments.length > 0) {
        await context.prisma.attachment.createMany({
          data: input.attachments.map((att: any) => ({
            emailId: email.id,
            encryptedMetadata: att.encryptedMetadata,
            r2BlobKey: att.r2BlobKey,
            size: att.size
          }))
        });
      }

      // Return email with attachments
      return await context.prisma.email.findUnique({
        where: { id: email.id },
        include: {
          folder: true,
          attachments: true
        }
      });
    },

    updateEmailReadStatus: async (parent: any, args: { id: string; isRead: boolean }, context: Context) => {
      const user = requireAuth(context.user);
      
      const email = await context.prisma.email.findUnique({
        where: { id: args.id }
      });

      if (!email) {
        throw new Error('Email not found');
      }

      checkUserAccess(user, email.userId);

      return await context.prisma.email.update({
        where: { id: args.id },
        data: { isRead: args.isRead },
        include: {
          folder: true,
          attachments: true
        }
      });
    },

    updateEmailStarStatus: async (parent: any, args: { id: string; isStarred: boolean }, context: Context) => {
      const user = requireAuth(context.user);
      
      const email = await context.prisma.email.findUnique({
        where: { id: args.id }
      });

      if (!email) {
        throw new Error('Email not found');
      }

      checkUserAccess(user, email.userId);

      return await context.prisma.email.update({
        where: { id: args.id },
        data: { isStarred: args.isStarred },
        include: {
          folder: true,
          attachments: true
        }
      });
    },

    moveEmailToFolder: async (parent: any, args: { id: string; folderId: string }, context: Context) => {
      const user = requireAuth(context.user);
      
      const email = await context.prisma.email.findUnique({
        where: { id: args.id }
      });

      if (!email) {
        throw new Error('Email not found');
      }

      checkUserAccess(user, email.userId);

      // Verify folder belongs to user
      const folder = await context.prisma.folder.findUnique({
        where: { id: args.folderId }
      });

      if (!folder || folder.userId !== user.id) {
        throw new Error('Folder not found');
      }

      return await context.prisma.email.update({
        where: { id: args.id },
        data: { folderId: args.folderId },
        include: {
          folder: true,
          attachments: true
        }
      });
    },

    deleteEmail: async (parent: any, args: { id: string }, context: Context) => {
      const user = requireAuth(context.user);
      
      const email = await context.prisma.email.findUnique({
        where: { id: args.id }
      });

      if (!email) {
        throw new Error('Email not found');
      }

      checkUserAccess(user, email.userId);

      // Move to trash folder instead of hard delete
      const trashFolder = await context.prisma.folder.findFirst({
        where: { 
          userId: user.id,
          type: 'trash'
        }
      });

      if (trashFolder) {
        await context.prisma.email.update({
          where: { id: args.id },
          data: { folderId: trashFolder.id }
        });
      } else {
        // Hard delete if no trash folder
        await context.prisma.email.delete({
          where: { id: args.id }
        });
      }

      return true;
    }
  }
};

// Helper function to get sent folder ID
async function getSentFolderId(prisma: any, userId: string): Promise<string | null> {
  const sentFolder = await prisma.folder.findFirst({
    where: {
      userId,
      type: 'sent'
    }
  });
  return sentFolder?.id || null;
}