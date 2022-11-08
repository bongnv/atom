import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const WorkspaceView = ({ onWorkspaceReady }) => {
  const workspaceRef = useRef(null);

  useEffect(() => {
    onWorkspaceReady(workspaceRef.current);
  });

  return <atom-workspace ref={workspaceRef} />;
};

WorkspaceView.propTypes = {
  onWorkspaceReady: PropTypes.func.isRequired,
};

export default WorkspaceView;
