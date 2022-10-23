declare global {
  interface Window {
    atomAPI: {
      addTimeMarker: (label: string) => void;
      config: () => {
        profileStartup: boolean;
      };
      openWithDevTools: (callback: () => void) => void;
      setupWindow: () => Promise<void>;
      setLoadTime: (loadTime: number) => void;
      handleSetupError: (err: Error) => void;
    };
  }
}

export {};
