const startTime = Date.now();
const StartupTime = require('../startup-time');
StartupTime.setStartTime();

const start = require('./start');
start(startTime);
