const express = require('express');
const expressRateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const mongoose = require('mongoose');
const { APIError } = require('./utils/responseHandler');
const { validateHeaders } = require('./middlewares/authMiddlewares');
const Constants = require('./constants/appConstants');
// const { initializeFirebaseAdmin } = require('./utils/pushNotificationHandler');

const app = express();

app.use(
  cors({
    origin: [
      'http://localhost:8080',
      'https://admin.knowledgetemple.in',
      'https://www.admin.knowledgetemple.in',
      'www.admin.knowledgetemple.in',
      'admin.knowledgetemple.in',
    ], // Set specific origin
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Set security HTTP headers
app.use(helmet());
app.use(
  expressRateLimit({
    windowMs: 10 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  })
);

// Body parser, reading data from body into req.body
app.use(
  express.json({
    // limit: "15kb",
  })
);

// Data sanitization against Nosql query injection
app.use(mongoSanitize());

// Data sanitization against XSS(clean user input from malicious HTML code)
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Apply middlewares
// app.use(decryptRequest);
// app.use(encryptResponse);

// version v1
const userApiV1 = require('./apis/v1/userIndex');
app.use('/api/v1/user', validateHeaders, userApiV1);

const adminApiV1 = require('./apis/v1/adminIndex');
app.use('/api/v1/admin', adminApiV1);

const commonApiV1 = require('./apis/v1/commonIndex');
app.use('/api/v1', commonApiV1);

app.get('/', async (req, res) => {
  return res.status(200).send({ message: 'Welcome to Knowledge Temple API.' });
});

// handle undefined Routes
app.use((req, res) => {
  const err = new APIError(404, 'Undefined Route.').toJson();
  return res.status(404).json(err);
});

// connect databse
mongoose
  .connect(Constants.DATABASE)
  .then((con) => {
    console.log('Database Connected.');
  })
  .catch((err) => {
    console.log(err);
  });

// initializeFirebaseAdmin();

module.exports = app;
