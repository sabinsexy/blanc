import { mergeResolvers } from '@graphql-tools/merge';
import { userResolvers } from './user';
import { emailResolvers } from './email';
import { folderResolvers } from './folder';
import { aliasResolvers } from './alias';
import { authResolvers } from './auth';

export const resolvers = mergeResolvers([
  userResolvers,
  emailResolvers,
  folderResolvers,
  aliasResolvers,
  authResolvers,
]);