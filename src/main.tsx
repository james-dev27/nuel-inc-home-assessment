
import { createRoot } from 'react-dom/client'
import * as Apollo from '@apollo/client'
import { apolloClient } from './lib/apollo'
const { ApolloProvider } = Apollo;
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <ApolloProvider client={apolloClient}>
    <App />
  </ApolloProvider>
);
