import React from "react";
import gql from "graphql-tag";
import { withState } from "recompose";
import IssueItem from "../IssueItem";
import Loading from "../../Loading";
import ErrorMessage from "../../Error";
import { Query, ApolloConsumer } from "react-apollo";
import { ButtonUnobtrusive } from "../../Button";
import "./style.css";

const ISSUE_STATES = {
  NONE: "NONE",
  OPEN: "OPEN",
  CLOSED: "CLOSED",
};
const TRANSITION_LABELS = {
  [ISSUE_STATES.NONE]: "Show Open Issues",
  [ISSUE_STATES.OPEN]: "Show Closed Issues",
  [ISSUE_STATES.CLOSED]: "Hide Issues",
};

const TRANSITION_STATE = {
  [ISSUE_STATES.NONE]: ISSUE_STATES.OPEN,
  [ISSUE_STATES.OPEN]: ISSUE_STATES.CLOSED,
  [ISSUE_STATES.CLOSED]: ISSUE_STATES.NONE,
};

const isShow = (issueState) => issueState !== ISSUE_STATES.NONE;

const GET_ISSUES_OF_REPOSITORY = gql`
  query(
    $repositoryOwner: String!
    $repositoryName: String!
    $issueState: IssueState!
  ) {
    repository(name: $repositoryName, owner: $repositoryOwner) {
      issues(first: 5, states: [$issueState]) {
        edges {
          node {
            id
            number
            state
            title
            url
            bodyHTML
          }
        }
      }
    }
  }
`;

const Issues = ({
  repositoryOwner,
  repositoryName,
  issueState,
  onChangeIssueState,
}) => (
  <div className="Issues">
    <IssueFilter
      issueState={issueState}
      onChangeIssueState={onChangeIssueState}
      repositoryOwner={repositoryOwner}
      repositoryName={repositoryName}
    />

    {isShow(issueState) && (
      <Query
        query={GET_ISSUES_OF_REPOSITORY}
        variables={{
          repositoryOwner,
          repositoryName,
          issueState,
        }}
      >
        {({ data, loading, error }) => {
          if (error) {
            return <ErrorMessage error={error} />;
          }

          if (loading && !data) {
            return <Loading />;
          }

          const { repository } = data;

          const filteredRepository = {
            issues: {
              edges: repository.issues.edges.filter(
                (issue) => issue.node.state === issueState
              ),
            },
          };

          if (!filteredRepository.issues.edges.length) {
            return <div className="IssueList">No issues ...</div>;
          }

          return <IssueList issues={filteredRepository.issues} />;
        }}
      </Query>
    )}
  </div>
);

const IssueList = ({ issues }) => (
  <div className="IssueList">
    {issues.edges.map(({ node }) => (
      <IssueItem key={node.id} issue={node} />
    ))}
  </div>
);

const prefetchIssues = (
  client,
  repositoryOwner,
  repositoryName,
  issueState
) => {
  const nextIssueState = TRANSITION_STATE[issueState];
  if (isShow(nextIssueState)) {
    client.query({
      query: GET_ISSUES_OF_REPOSITORY,
      variables: {
        repositoryOwner,
        repositoryName,
        issueState: nextIssueState,
      },
    });
  }
};

const IssueFilter = ({
  issueState,
  onChangeIssueState,
  repositoryOwner,
  repositoryName,
}) => (
  <ApolloConsumer>
    {(client) => (
      <ButtonUnobtrusive
        onClick={() => onChangeIssueState(TRANSITION_STATE[issueState])}
        onMouseOver={() =>
          prefetchIssues(client, repositoryOwner, repositoryName, issueState)
        }
      >
        {TRANSITION_LABELS[issueState]}
      </ButtonUnobtrusive>
    )}
  </ApolloConsumer>
);

export default withState(
  "issueState",
  "onChangeIssueState",
  ISSUE_STATES.NONE
)(Issues);
