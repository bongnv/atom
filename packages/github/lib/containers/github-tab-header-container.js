import React from 'react';
import PropTypes from 'prop-types';
import { QueryRenderer, graphql } from 'react-relay';

import { EndpointPropType, TokenPropType } from '../prop-types';
import RelayNetworkLayerManager from '../relay-network-layer-manager';
import { UNAUTHENTICATED, INSUFFICIENT } from '../shared/keytar-strategy';
import Author, { nullAuthor } from '../models/author';
import GithubTabHeaderController from '../controllers/github-tab-header-controller';

export default class GithubTabHeaderContainer extends React.Component {
  static propTypes = {
    // Connection
    endpoint: EndpointPropType.isRequired,
    token: TokenPropType,

    // Workspace
    currentWorkDir: PropTypes.string,
    contextLocked: PropTypes.bool.isRequired,
    changeWorkingDirectory: PropTypes.func.isRequired,
    setContextLock: PropTypes.func.isRequired,
    getCurrentWorkDirs: PropTypes.func.isRequired,

    // Event Handlers
    onDidChangeWorkDirs: PropTypes.func,
  };

  render() {
    if (
      this.props.token == null ||
      this.props.token instanceof Error ||
      this.props.token === UNAUTHENTICATED ||
      this.props.token === INSUFFICIENT
    ) {
      return this.renderNoResult();
    }

    const environment = RelayNetworkLayerManager.getEnvironmentForHost(
      this.props.endpoint,
      this.props.token
    );
    const query = graphql`
      query githubTabHeaderContainerQuery {
        viewer {
          name
          email
          avatarUrl
          login
        }
      }
    `;

    return (
      <QueryRenderer
        environment={environment}
        variables={{}}
        query={query}
        render={this.renderWithResult}
      />
    );
  }

  renderWithResult = ({ error, props }) => {
    if (error || props === null) {
      return this.renderNoResult();
    }

    // eslint-disable-next-line react/prop-types
    const { email, name, avatarUrl, login } = props.viewer;

    return (
      <GithubTabHeaderController
        user={new Author(email, name, login, false, avatarUrl)}
        // Workspace
        currentWorkDir={this.props.currentWorkDir}
        contextLocked={this.props.contextLocked}
        getCurrentWorkDirs={this.props.getCurrentWorkDirs}
        changeWorkingDirectory={this.props.changeWorkingDirectory}
        setContextLock={this.props.setContextLock}
        // Event Handlers
        onDidChangeWorkDirs={this.props.onDidChangeWorkDirs}
      />
    );
  };

  renderNoResult() {
    return (
      <GithubTabHeaderController
        user={nullAuthor}
        // Workspace
        currentWorkDir={this.props.currentWorkDir}
        contextLocked={this.props.contextLocked}
        changeWorkingDirectory={this.props.changeWorkingDirectory}
        setContextLock={this.props.setContextLock}
        getCurrentWorkDirs={this.props.getCurrentWorkDirs}
        // Event Handlers
        onDidChangeWorkDirs={this.props.onDidChangeWorkDirs}
      />
    );
  }
}
