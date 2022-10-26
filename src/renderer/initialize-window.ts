import etch from 'etch';

export default async () => {
  const { atomAPI } = window;
  etch.setScheduler(atomAPI.getViews());

  await atomAPI.initializePreload();
};
