declare global {
  interface Window {
    atomAPI: {
      addTimeMarker: (label: string) => void;
      config: () => {
        profileStartup: boolean;
      };
      initializeAtomEnv: () => void;
      setLoadTime: () => void;
      handleSetupError: (err: Error) => void;
      sendWindowCommand: (command: string) => void;
      getViews: () => any; // eslint-disable-line @typescript-eslint/no-explicit-any
      startEditorWindow: () => Promise<void>;
    };
    measure: (description: string, fn: () => void) => void;
    profile: (description: string, fn: () => void) => void;
  }
}

export {};
