import React from 'react';
import {Query} from 'react-apollo';
import gql from 'graphql-tag'
import Loading from '../Loading'
import RepositoryList, {REPOSITORY_FRAGMENT} from '../Repository'
import ErrorMessage from '../Error'

const GET_REPOSITORIES_OF_CURRENT_USER = gql`
  {
    viewer {
      repositories(
        first: 5
        orderBy: { direction: DESC, field: STARGAZERS }
      ) {
        edges {
          node {
            ...repository
          }
        }
      }
    }
  }
  ${REPOSITORY_FRAGMENT}
`;

const Profile = () => (
    <Query query={GET_REPOSITORIES_OF_CURRENT_USER}>
      {({ data, loading, error }) => {
          if(error){
              return <ErrorMessage error={error}/>
          }
    
    if (loading || !data) {
        return <Loading />;
      }
       const {viewer} = data;
   
       return <RepositoryList repositories={viewer.repositories} />;
      }}
    </Query>
  );

export default Profile;