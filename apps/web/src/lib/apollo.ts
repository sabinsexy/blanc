'use client';

import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

// HTTP link for GraphQL endpoint
const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8787/graphql',
});

// Auth link to add authorization header
const authLink = setContext(async (_, { headers }) => {
  // Get auth token from better-auth or local storage
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('auth-token')
    : null;

  return {
    headers: {
      ...headers,
      ...(token && { authorization: `Bearer ${token}` }),
    },
  };
});

// Error link for handling GraphQL and network errors
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
    });
  }

  if (networkError) {
    console.error(`Network error: ${networkError}`);
    
    // Handle authentication errors
    if ('statusCode' in networkError && networkError.statusCode === 401) {
      // Clear auth token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-token');
        window.location.href = '/login';
      }
    }
  }
});

// Apollo Client configuration
const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      User: {
        fields: {
          emails: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
          folders: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
        },
      },
      Email: {
        fields: {
          // Client-side computed field for decrypted data
          decryptedData: {
            read(_, options) {
              const { readField } = options;
              const encryptedData = readField('encryptedData');
              const encryptedSessionKey = readField('encryptedSessionKey');
              
              if (!encryptedData || !encryptedSessionKey) {
                return null;
              }

              // This will be implemented in the email decryption hook
              // For now, return placeholder
              return {
                subject: '[Encrypted]',
                body: '[Encrypted content - decrypt to view]',
                from: '[Encrypted]',
                to: ['[Encrypted]'],
              };
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

export default apolloClient;