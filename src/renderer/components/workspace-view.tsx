import * as React from 'react';
import { useEffect, useRef } from 'react';

type Props = {
  onReady: Function;
};

export const WorkspaceView = ({ onReady }: Props) => {
  const workspaceRef = useRef(null);

  useEffect(() => {
    onReady(workspaceRef.current);
  });

  // @ts-ignore
  return <atom-workspace ref={workspaceRef} />;
};
