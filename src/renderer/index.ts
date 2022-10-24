window.onload = function () {
  const { atomAPI } = window;
  atomAPI.addTimeMarker('window:onload:start');
  try {
    if (atomAPI.config().profileStartup) {
      console.profile('startup');
      atomAPI.addTimeMarker('window:initialize:start');
      atomAPI.initializeWindow().then(function () {
        atomAPI.sendWindowCommand('window:loaded');
        atomAPI.setLoadTime();
        atomAPI.addTimeMarker('window:initialize:end');
        console.profileEnd('startup');
        console.log(
          'Switch to the Profiles tab to view the created startup profile'
        );
      });
    } else {
      atomAPI.addTimeMarker('window:initialize:start');
      atomAPI.initializeWindow().then(() => {
        atomAPI.sendWindowCommand('window:loaded');
        atomAPI.setLoadTime();
        atomAPI.addTimeMarker('window:initialize:end');
      });
    }
  } catch (error) {
    atomAPI.handleSetupError(error);
  }
  atomAPI.addTimeMarker('window:onload:end');
};
