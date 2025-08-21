import { Context } from '@smc/gql';
import { requireAuth, checkUserAccess } from '../auth';

export const folderResolvers = {
  Query: {
    folders: async (parent: any, args: any, context: Context) => {
      const user = requireAuth(context.user);
      
      const folders = await context.prisma.folder.findMany({
        where: { userId: user.id },
        orderBy: { sortOrder: 'asc' }
      });

      // Add email count for each folder
      const foldersWithCount = await Promise.all(
        folders.map(async (folder) => {
          const emailCount = await context.prisma.email.count({
            where: { 
              userId: user.id,
              folderId: folder.id 
            }
          });
          return { ...folder, emailCount };
        })
      );

      return foldersWithCount;
    }
  },

  Mutation: {
    createFolder: async (parent: any, args: { input: { name: string; color?: string } }, context: Context) => {
      const user = requireAuth(context.user);
      const { input } = args;

      // Check if folder name already exists for user
      const existingFolder = await context.prisma.folder.findFirst({
        where: {
          userId: user.id,
          name: input.name
        }
      });

      if (existingFolder) {
        throw new Error('Folder with this name already exists');
      }

      // Get next sort order
      const maxSortOrder = await context.prisma.folder.aggregate({
        where: { userId: user.id },
        _max: { sortOrder: true }
      });

      const folder = await context.prisma.folder.create({
        data: {
          userId: user.id,
          name: input.name,
          type: 'custom',
          color: input.color,
          sortOrder: (maxSortOrder._max.sortOrder || 0) + 1
        }
      });

      return { ...folder, emailCount: 0 };
    },

    updateFolder: async (parent: any, args: { id: string; name?: string; color?: string }, context: Context) => {
      const user = requireAuth(context.user);
      
      const folder = await context.prisma.folder.findUnique({
        where: { id: args.id }
      });

      if (!folder) {
        throw new Error('Folder not found');
      }

      checkUserAccess(user, folder.userId);

      // Don't allow updating system folders
      if (folder.type !== 'custom') {
        throw new Error('Cannot update system folders');
      }

      const updatedFolder = await context.prisma.folder.update({
        where: { id: args.id },
        data: {
          ...(args.name && { name: args.name }),
          ...(args.color && { color: args.color })
        }
      });

      const emailCount = await context.prisma.email.count({
        where: { 
          userId: user.id,
          folderId: folder.id 
        }
      });

      return { ...updatedFolder, emailCount };
    },

    deleteFolder: async (parent: any, args: { id: string }, context: Context) => {
      const user = requireAuth(context.user);
      
      const folder = await context.prisma.folder.findUnique({
        where: { id: args.id }
      });

      if (!folder) {
        throw new Error('Folder not found');
      }

      checkUserAccess(user, folder.userId);

      // Don't allow deleting system folders
      if (folder.type !== 'custom') {
        throw new Error('Cannot delete system folders');
      }

      // Move emails to inbox before deleting folder
      const inboxFolder = await context.prisma.folder.findFirst({
        where: {
          userId: user.id,
          type: 'inbox'
        }
      });

      if (inboxFolder) {
        await context.prisma.email.updateMany({
          where: { folderId: args.id },
          data: { folderId: inboxFolder.id }
        });
      }

      await context.prisma.folder.delete({
        where: { id: args.id }
      });

      return true;
    }
  }
};