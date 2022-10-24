declare global {
  interface Window {
    atomAPI: {
      addTimeMarker: (label: string) => void;
      config: () => {
        profileStartup: boolean;
      };
      setupWindow: () => Promise<void>;
      setLoadTime: () => void;
      handleSetupError: (err: Error) => void;
    };
  }
}

export {};
