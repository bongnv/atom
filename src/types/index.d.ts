declare module 'electron' {
  interface BrowserWindow {
    startupMarkers: Record<string, number>[];
  }
}
