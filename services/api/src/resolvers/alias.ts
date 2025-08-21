import { Context } from '@smc/gql';
import { requireAuth, checkUserAccess } from '../auth';

export const aliasResolvers = {
  Query: {
    aliases: async (parent: any, args: any, context: Context) => {
      const user = requireAuth(context.user);
      
      return await context.prisma.alias.findMany({
        where: { userId: user.id },
        orderBy: { isDefault: 'desc' }
      });
    }
  },

  Mutation: {
    createAlias: async (parent: any, args: { input: { address: string; displayName?: string } }, context: Context) => {
      const user = requireAuth(context.user);
      const { input } = args;

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input.address)) {
        throw new Error('Invalid email address format');
      }

      // Check if alias already exists
      const existingAlias = await context.prisma.alias.findUnique({
        where: { address: input.address }
      });

      if (existingAlias) {
        throw new Error('This email address is already in use');
      }

      // Check if this is the first alias for the user
      const aliasCount = await context.prisma.alias.count({
        where: { userId: user.id }
      });

      const alias = await context.prisma.alias.create({
        data: {
          userId: user.id,
          address: input.address,
          displayName: input.displayName,
          isDefault: aliasCount === 0 // First alias becomes default
        }
      });

      return alias;
    },

    updateAlias: async (parent: any, args: { id: string; displayName?: string }, context: Context) => {
      const user = requireAuth(context.user);
      
      const alias = await context.prisma.alias.findUnique({
        where: { id: args.id }
      });

      if (!alias) {
        throw new Error('Alias not found');
      }

      checkUserAccess(user, alias.userId);

      return await context.prisma.alias.update({
        where: { id: args.id },
        data: {
          ...(args.displayName && { displayName: args.displayName })
        }
      });
    },

    deleteAlias: async (parent: any, args: { id: string }, context: Context) => {
      const user = requireAuth(context.user);
      
      const alias = await context.prisma.alias.findUnique({
        where: { id: args.id }
      });

      if (!alias) {
        throw new Error('Alias not found');
      }

      checkUserAccess(user, alias.userId);

      // Don't allow deleting the default alias if it's the only one
      if (alias.isDefault) {
        const aliasCount = await context.prisma.alias.count({
          where: { userId: user.id }
        });

        if (aliasCount === 1) {
          throw new Error('Cannot delete the only alias');
        }

        // Set another alias as default
        const nextAlias = await context.prisma.alias.findFirst({
          where: {
            userId: user.id,
            id: { not: args.id }
          }
        });

        if (nextAlias) {
          await context.prisma.alias.update({
            where: { id: nextAlias.id },
            data: { isDefault: true }
          });
        }
      }

      await context.prisma.alias.delete({
        where: { id: args.id }
      });

      return true;
    }
  }
};