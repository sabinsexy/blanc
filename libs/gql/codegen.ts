import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'src/schema.graphql',
  documents: ['src/**/*.ts', 'src/**/*.tsx'],
  generates: {
    './generated/': {
      preset: 'client',
      plugins: [],
      presetConfig: {
        gqlTagName: 'gql',
      }
    },
    './generated/resolvers-types.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        useIndexSignature: true,
        contextType: '../src/context#Context',
        mappers: {
          User: '@prisma/client#User',
          Email: '@prisma/client#Email',
          Folder: '@prisma/client#Folder',
          Alias: '@prisma/client#Alias',
          Attachment: '@prisma/client#Attachment',
        }
      }
    }
  }
};

export default config;