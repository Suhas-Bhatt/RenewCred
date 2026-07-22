const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');

const env = require('./config/env');
const logger = require('./config/logger');
const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: env.corsOrigins,
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.use(
  morgan(env.nodeEnv === 'production' ? 'combined' : 'dev', {
    stream: { write: (msg) => logger.info(msg.trim()) },
  })
);

// General API rate limit; login gets a tighter one to blunt brute force.
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));
app.use(
  '/api/auth/login',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: 'Too many login attempts, try again later' })
);

app.use('/uploads', express.static(path.join(process.cwd(), env.uploadDir)));

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
