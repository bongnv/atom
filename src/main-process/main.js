const startTime = Date.now();
const StartupTime = require('../shared/startup-time');
StartupTime.setStartTime();

const start = require('./start');
start(startTime);
