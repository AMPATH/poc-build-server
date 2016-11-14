const cron = require('node-cron');
const config = require('./config');
const build = require('./build');
cron.schedule(config.buildTime, function() {
    build.build();
});
