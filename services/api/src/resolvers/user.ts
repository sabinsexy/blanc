import { Context } from '@smc/gql';
import { requireAuth } from '../auth';

export const userResolvers = {
  Query: {
    currentUser: async (parent: any, args: any, context: Context) => {
      const user = requireAuth(context.user);
      
      return await context.prisma.user.findUnique({
        where: { id: user.id },
        include: {
          aliases: true,
          folders: {
            orderBy: { sortOrder: 'asc' }
          }
        }
      });
    }
  },

  User: {
    aliases: async (parent: any, args: any, context: Context) => {
      return await context.prisma.alias.findMany({
        where: { userId: parent.id },
        orderBy: { isDefault: 'desc' }
      });
    },

    folders: async (parent: any, args: any, context: Context) => {
      const folders = await context.prisma.folder.findMany({
        where: { userId: parent.id },
        orderBy: { sortOrder: 'asc' }
      });

      // Add email count for each folder
      const foldersWithCount = await Promise.all(
        folders.map(async (folder) => {
          const emailCount = await context.prisma.email.count({
            where: { 
              userId: parent.id,
              folderId: folder.id 
            }
          });
          return { ...folder, emailCount };
        })
      );

      return foldersWithCount;
    }
  }
};