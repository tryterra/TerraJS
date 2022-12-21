const { default: Terra } = require('terra-api');
require('dotenv').config();

// setup a new object instance
const terra = new Terra(process.env.DEV_ID, process.env.API_KEY, process.env.SECRET);

// ---------------------------
// Server
// ---------------------------
const express = require('express');
const bodyParser = require('body-parser');
const { randomInt } = require('crypto');
const app = express();
const PORT = 3000;
app.use(
  bodyParser.json({
    verify: (req, _, buf) => {
      req.rawBody = buf;
    },
  }),
);
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function handleWebhook(req) {
  await timeout(randomInt(3) * 1000);
  if (randomInt(3) === 1) throw 'some error';
  console.log(req.url);
}

// Webhook port
app.post('/hook', (req, res) => {
  console.log('registering', req.url);
  // handleWebhook(req) // async, random order processing that might result in race conditions
  terra.executeSynchronously(handleWebhook, req); // sync, process one by one
  if (!terra.checkTerraSignature(req.headers['terra-signature'], req.rawBody)) res.sendStatus(401);
  res.sendStatus(200);
});

app.get('/', (_, res) => {
  res.send('Hello Terra!');
});

app.get('/session', (req, res) => {
  terra
    .generateWidgetSession('refID', 'EN', ['GARMIN', 'FITBIT'])
    .then((s) => res.send(s.url))
    .catch((e) => console.log(e));
});

terra
  .generateWidgetSession('refID', 'EN')
  .then((s) => console.log(s.url))
  .catch((e) => console.log(e));

terra
  .generateAuthToken()
  .then((s) => console.log(s))
  .catch((e) => console.log(e));

terra
  .authUser('INBODY', 'reference', undefined, undefined, undefined, '1234')
  .then((r) => console.log(r))
  .catch((e) => console.log(e));

terra
  .getUsers()
  .then((res) => {
    console.log(res);
    res.users.forEach((u) => {
      if (u.provider == 'OURA') {
        terra
          .getAthlete(u.user_id, false)
          .then((r) => console.log(r))
          .catch((e) => console.log(e));
        terra
          .getBody(u.user_id, new Date(), undefined, false)
          .then((r) => console.log(r))
          .catch((e) => console.log(e));
        terra
          .getDaily(u.user_id, new Date(), undefined, false)
          .then((r) => console.log(r))
          .catch((e) => console.log(e));
        terra
          .getMenstruation(u.user_id, new Date(), undefined, false)
          .then((r) => console.log(r))
          .catch((e) => console.log(e));
        terra
          .getSleep(u.user_id, new Date(), undefined, false)
          .then((r) => console.log(r))
          .catch((e) => console.log(e));
        terra
          .getActivity(u.user_id, new Date(), undefined, false)
          .then((r) => console.log(r))
          .catch((e) => console.log(e));
      }
    });
  })
  .catch((e) => console.log(e));
