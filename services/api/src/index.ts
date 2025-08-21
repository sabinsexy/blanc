import { ApolloServer } from '@apollo/server';
import { PrismaClient } from '@prisma/client';
import { typeDefs, createContext } from '@smc/gql';
import { resolvers } from './resolvers';
import { authenticateUser } from './auth';

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
});

export default {
  async fetch(request: Request, env: any, ctx: any) {
    try {
      // Create context with authentication
      const context = createContext(prisma);
      
      // Authenticate user from request headers
      const authorization = request.headers.get('Authorization');
      if (authorization) {
        const token = authorization.replace('Bearer ', '');
        const user = await authenticateUser(token, prisma);
        if (user) {
          context.user = user;
          context.sessionToken = token;
        }
      }

      // Handle GraphQL requests
      const url = new URL(request.url);
      if (url.pathname === '/graphql' && request.method === 'POST') {
        const body = await request.text();
        const { query, variables, operationName } = JSON.parse(body);
        
        const response = await server.executeOperation(
          { query, variables, operationName },
          { contextValue: context }
        );

        return new Response(JSON.stringify(response), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        });
      }

      // Handle CORS preflight
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        });
      }

      return new Response('GraphQL endpoint available at /graphql', { status: 200 });
    } catch (error) {
      console.error('GraphQL Server Error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }
};