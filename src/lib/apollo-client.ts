// src/lib/apollo-client.ts
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const SUBGRAPH_URL = 'https://subgraph.satsuma-prod.com/5d543e96d159/viabull-labs/heavy-helms-subgraph/api';

export const apolloClient = new ApolloClient({
  link: new HttpLink({ uri: SUBGRAPH_URL }),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});