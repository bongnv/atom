import AtomEnvironment from '../renderer/atom-environment';
import { nodeAPI } from '../preload/node-api';

declare global {
  interface Window {
    nodeAPI: typeof nodeAPI;
    atom: AtomEnvironment;
  }
}

export {};
