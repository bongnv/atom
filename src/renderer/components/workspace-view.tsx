import * as React from 'react';
import { useEffect, useRef } from 'react';
import { WorkspaceElement } from '../workspace-element';

type Props = {
  onReady: (ref: WorkspaceElement) => void;
};

export const WorkspaceView = ({ onReady }: Props) => {
  const workspaceRef = useRef(null);

  useEffect(() => {
    onReady(workspaceRef.current);
  });

  // @ts-ignore
  return <atom-workspace ref={workspaceRef} />;
};
