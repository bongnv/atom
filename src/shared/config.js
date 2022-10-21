const path = require('path');

const rootDir = ROOT_DIR;
const config = {
    preloadWebpackEntry: PRELOAD_WEBPACK_ENTRY,
    taskWebpackDir: TASK_WEBPACK_DIR,
    rootDir,
    windowEntry: path.join(rootDir, 'static/index.html'),
};

module.exports = config;