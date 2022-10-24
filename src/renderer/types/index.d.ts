declare global {
  interface Window {
    atomAPI: {
      addTimeMarker: (label: string) => void;
      config: () => {
        profileStartup: boolean;
      };
      initializeWindow: () => Promise<void>;
      setLoadTime: () => void;
      handleSetupError: (err: Error) => void;
      sendWindowCommand: (command: string) => void;
    };
  }
}

export {};
