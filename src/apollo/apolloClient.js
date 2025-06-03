import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

const httpLink = createHttpLink({
  uri: process.env.REACT_APP_API_URL,
});

// Token'ı ekleyen middleware
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// ❗ Hataları yakala
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    for (let err of graphQLErrors) {
      if (
        err.message === 'Yetkisiz işlem.' ||
        err.message.toLowerCase().includes('jwt') ||
        err.message.toLowerCase().includes('geçersiz')
      ) {
        console.warn('🚫 Token geçersiz. Oturum kapatılıyor...');
        localStorage.removeItem('token');
        window.location.href = '/login'; // logout yap
      }
    }
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

// Apollo Client
const client = new ApolloClient({
  link: from([errorLink, authLink.concat(httpLink)]),
  cache: new InMemoryCache(),
});

export default client;
