const app = require('./app');
const env = require('./config/env');
const logger = require('./config/logger');

const server = app.listen(env.port, () => {
  logger.info(`RenewCred CMS backend listening on port ${env.port} [${env.nodeEnv}]`);
});

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled promise rejection:');
  logger.error(err);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => process.exit(0));
});
