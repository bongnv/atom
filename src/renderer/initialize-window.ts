import etch from 'etch';

export default async () => {
  const { atomAPI } = window;

  atomAPI.initializeAtomEnv();

  etch.setScheduler(atomAPI.getViews());

  await atomAPI.startEditorWindow();
};
