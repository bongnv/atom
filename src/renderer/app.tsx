import * as React from 'react';
import ReactDom from 'react-dom';
import { WorkspaceView } from './components/workspace-view';
import Workspace from './workspace';

export const renderApp = (workspace: Workspace) =>
  new Promise((resolve) => {
    ReactDom.render(
      <WorkspaceView
        onReady={(workspaceElement) => {
          workspace.element = workspaceElement;
          workspaceElement.initialize(workspace, {
            config: workspace.config,
            project: workspace.project,
            viewRegistry: workspace.viewRegistry,
            styleManager: workspace.styleManager,
          });
          resolve(true);
        }}
      />,
      document.body
    );
  });
