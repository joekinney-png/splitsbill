const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const braintree = require('braintree');
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const apiRouter = require('./routes/api');

const app = express();
app.use(express.json());
app.use(cookieParser());

// IDs for the braintree / venmo oauth
const client_id = process.env.VENMO_CLIENT_ID;
const client_secret = process.env.VENMO_CLIENT_SECRET;
const redirect_uri = process.env.VENMO_REDIRECT_URI;

// create a new gateway to braintree
const gateway = new braintree.BraintreeGateway({
  clientId: client_id,
  clientSecret: client_secret,
});

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
  // redirect the user to braintree to initiate OAuth process
  const url = gateway.oauth.connectUrl({
    redirectUri: redirect_uri,
    scope: 'read_only',
    state: 'foo_state',
  });

  // redirect the user to the oauth callback after user grants authorization on braintree
  // response includes code from braintree
  res.redirect(url);
});

async function getAccessToken(code) {
  console.log(code);

  // &merchantId=${client_id}
  const res = await gateway.oauth.createTokenFromCode({
    code: `${redirect_uri}/callback?state=foo_state&code=${code}`,
  });
  console.log(res);
  const data = await res.json();
  console.log(data);
}

async function getVenmoUser(access_token) {}

app.get('/login/venmo/callback', async (req, res) => {
  // pull the braintree response code out of the query property of the request object
  const code = req.query.code;
  // exchange the code for the access token (have already opened gateway)
  const token = await getAccessToken(code);
  // use access token to get the data of the venmo user that has logged into the app
  const venmoData = await getVenmoUser(token);
  // return the user data after converting it from json
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
