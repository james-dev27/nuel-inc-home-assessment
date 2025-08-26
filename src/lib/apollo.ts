import * as Apollo from '@apollo/client';
const { ApolloClient, InMemoryCache, createHttpLink } = Apollo;

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
});

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});