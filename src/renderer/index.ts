window.onload = function () {
  const { atomAPI } = window;
  atomAPI.addTimeMarker('window:onload:start');
  try {
    if (atomAPI.config().profileStartup) {
      atomAPI.openWithDevTools(() => {
        console.profile('startup');
        const startTime = Date.now();
        atomAPI.setupWindow().then(function () {
          atomAPI.setLoadTime(Date.now() - startTime);
          console.profileEnd('startup');
          console.log(
            'Switch to the Profiles tab to view the created startup profile'
          );
        });
      });
    } else {
      const startTime = Date.now();
      atomAPI.addTimeMarker('window:setup-window:start');
      atomAPI.setupWindow().then(() => {
        atomAPI.setLoadTime(Date.now() - startTime);
        atomAPI.addTimeMarker('window:setup-window:end');
      });
    }
  } catch (error) {
    atomAPI.handleSetupError(error);
  }
  atomAPI.addTimeMarker('window:onload:end');
};
