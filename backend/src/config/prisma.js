const { PrismaClient } = require('@prisma/client');
const { nodeEnv } = require('./env');

// Singleton to avoid exhausting DB connections across hot reloads / requests.
const prisma = new PrismaClient({
  log: nodeEnv === 'development' ? ['warn', 'error'] : ['error'],
});

module.exports = prisma;
