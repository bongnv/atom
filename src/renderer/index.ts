window.onload = function () {
  const { atomAPI } = window;
  atomAPI.addTimeMarker('window:onload:start');
  try {
    if (atomAPI.config().profileStartup) {
      console.profile('startup');
      atomAPI.setupWindow().then(function () {
        atomAPI.setLoadTime();
        console.profileEnd('startup');
        console.log(
          'Switch to the Profiles tab to view the created startup profile'
        );
      });
    } else {
      atomAPI.addTimeMarker('window:setup-window:start');
      atomAPI.setupWindow().then(() => {
        atomAPI.setLoadTime();
        atomAPI.addTimeMarker('window:setup-window:end');
      });
    }
  } catch (error) {
    atomAPI.handleSetupError(error);
  }
  atomAPI.addTimeMarker('window:onload:end');
};
