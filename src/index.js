import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {ApolloProvider} from 'react-apollo'
import {ApolloClient} from 'apollo-client'
import {ApolloLink} from 'apollo-link'
import {HttpLink} from 'apollo-link-http'
import {onError} from 'apollo-link-error'
import {InMemoryCache} from 'apollo-cache-inmemory'
import './style.css'

const cache = new InMemoryCache();
const GITHUB_BASE_URL = 'https://api.github.com/graphql';

const httpLink = new HttpLink({
  uri: GITHUB_BASE_URL,
  headers: {
    authorization: `Bearer ${
      process.env.REACT_APP_GITHUB_PERSONAL_ACCESS_TOKEN
    }`
  }
})

const errorLink = onError(({graphQLErrors, networkError}) => {
  if(graphQLErrors){
    //handle graphql error
  }
  if(networkError){
    //handle network error
  }
})

const link = ApolloLink.from([errorLink, httpLink]);

const client = new ApolloClient({
  link,
  cache
})

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root')
);
