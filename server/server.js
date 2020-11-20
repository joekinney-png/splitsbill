const cookieParser = require('cookie-parser');
const braintree = require('braintree');
const express = require('express');
// const fetch = require('node-fetch');
const path = require('path');
const apiRouter = require('./routes/api');

const app = express();
app.use(express.json());
app.use(cookieParser());

// IDs for the braintree / venmo oauth
const client_id = process.env.VENMO_CLIENT_ID;
const client_secret = process.env.VENMO_CLIENT_SECRET;

// routes all client requests
app.use('/api', apiRouter);

// handles initial page load when in production
if (process.env.NODE_ENV === 'production') {
  app.use('/dist', express.static(path.join(__dirname, '../dist')));

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

app.get('/login/venmo', (req, res) => {
  console.log(client_id);
  console.log(client_secret);

  const gateway = new braintree.BraintreeGateway({
    clientId: client_id,
    clientSecret: client_secret,
  });

  console.log(gateway);

  const url = gateway.oauth.connectUrl({
    redirectUri: 'http://localhost:3000/login/venmo/callback',
    scope: 'read_only',
    state: 'foo_state',
  });

  console.log(url);

  res.redirect(url);
});

async function getAccessToken(code) {}

async function getVenmoUser(access_token) {}

app.get('/login/venmo/callback', async (req, res) => {
  console.log('was redirected to the callback');
  const code = req.query.code;
  const token = await getAccessToken(code);
  const venmoData = await getVenmoUser(token);
  res.json(venmoData);
});

app.use('*', (req, res) => res.status(404).send('page not found'));

app.use(function errorHandler(err, req, res, next) {
  const defaultError = {
    log: 'Express error handler caught unknown middleware error',
    status: 400,
    message: { err: 'An error occurred' },
  };
  const errorObj = Object.assign(defaultError, err);
  console.log(errorObj.log);
  res.status(errorObj.status).json(errorObj.message);
});

app.listen(3000, console.log('listening on 3000'));
