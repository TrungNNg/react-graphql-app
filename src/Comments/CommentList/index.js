import React from "react";
import gql from "graphql-tag";
import { Query } from "react-apollo";
import Loading from "../../Loading";
import ErrorMessage from "../../Error";
import Comment from "../CommentItem";
import FetchMore from "../../FetchMore";
import CommentAdd from "../CommentAdd";
import './style.css'

const GET_COMMENTS_OF_ISSUE = gql`
  query($repositoryOwner: String!, $repositoryName: String!, $number: Int!) {
    repository(name: $repositoryName, owner: $repositoryOwner) {
      issue(number: $number) {
        id
        comments(first: 1) {
          edges {
            node {
              id
              bodyHTML
              author {
                login
              }
            }
          }
          pageInfo {
            endCursor
            hasNextPage
          }
        }
      }
    }
  }
`;

const updateQuery = (previousResult, { fetchMoreResult }) => {
  if (!fetchMoreResult) {
    return previousResult;
  }

  return {
    ...previousResult,
    repository: {
      ...previousResult.repository,
      issue: {
        ...previousResult.repository.issue,
        ...fetchMoreResult.repository.issue,
        comments: {
          ...previousResult.repository.issue.comments,
          ...fetchMoreResult.repository.issue.comments,
          edges: [
            ...previousResult.repository.issue.comments.edges,
            ...fetchMoreResult.repository.issue.comments.edges,
          ],
        },
      },
    },
  };
};

const Comments = ({ repositoryOwner, repositoryName, issue }) => {
  return (
    <Query
      query={GET_COMMENTS_OF_ISSUE}
      variables={{ number: issue.number, repositoryName, repositoryOwner }}
      notifyOnNetworkStatusChange={true}
    >
      {({ data, loading, error, fetchMore }) => {
        if (error) {
          return <ErrorMessage error={error} />;
        }

        if (loading && !data) {
          return <Loading />;
        }

        const { repository } = data;
        return (
            <div>
          <CommentList
            comments={repository.issue.comments}
            loading={loading}
            fetchMore={fetchMore}
            number={issue.number}
            repositoryName={repositoryName}
            repositoryOwner={repositoryOwner}
          />
          <CommentAdd issueId={repository.issue.id} />
          </div>
        );
      }}
    </Query>
  );
};

const CommentList = ({
  comments,
  loading,
  fetchMore,
  number,
  repositoryName,
  repositoryOwner,
}) => {
  return (
    <div>
      {comments.edges.map(({ node }) => (
        <Comment key={node.id} comment={node} />
      ))}

      <FetchMore
        loading={loading}
        fetchMore={fetchMore}
        variables={{ number, repositoryName, repositoryOwner, cursor: comments.pageInfo.endCursor }}
        updateQuery={updateQuery}
        hasNextPage={comments.pageInfo.hasNextPage}
      />
    </div>
  );
};

export default Comments;
