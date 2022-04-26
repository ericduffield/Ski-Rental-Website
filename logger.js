const pino = require('pino')
const logger = pino(pino.destination('logs/server-log'));

module.exports = logger;