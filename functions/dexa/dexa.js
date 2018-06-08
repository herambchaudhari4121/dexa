const alexa = require('alexa-app'),
  app = new alexa.app('dexa'),
  path = require('path'),
  {dexIntent} = require(path.join(__dirname, 'intents/dexintent')),
  {itemIntent} = require(path.join(__dirname, 'intents/itemintent')),
  {abilityIntent} = require(path.join(__dirname, 'intents/abilityintent')),
  {moveIntent} = require(path.join(__dirname, 'intents/moveintent')),
  {typeIntent} = require(path.join(__dirname, 'intents/typeintent'));

app.launch((req, res) => {
  res.say('Dexa is ready for browsing!');
});

app.intent('AMAZON.StopIntent', {
  slots: {},
  utterances: []
}, (request, response) => {
  const stopOutput = 'Don\'t You Worry. I\'ll be back.';

  response.say(stopOutput);
});

app.intent('AMAZON.CancelIntent', {
  slots: {},
  utterances: []
}, (request, response) => {
  const cancelOutput = 'No problem. Request cancelled.';

  response.say(cancelOutput);
});

app.error = function (exc, req, res) {
  console.error(exc);
  res.say('Sorry, I couldn\'t find data for that request.');
};

app.intent('DexIntent', {
  slots: {POKEMON: 'POKEMON'},
  utterances: ['data on {-|POKEMON}', 'pokemon {-|POKEMON}']
}, (req, res) => {
  dexIntent(req, res);
});

app.intent('ItemIntent', {
  slots: {ITEM: 'ITEM'},
  utterances: ['item {-|ITEM}']
}, (req, res) => {
  itemIntent(req, res);
});

app.intent('AbilityIntent', {
  slots: {ABILITY: 'ABILITY'},
  utterances: ['ability {-|ABILITY}']
}, (req, res) => {
  abilityIntent(req, res);
});

app.intent('MoveIntent', {
  slots: {MOVE: 'MOVE'},
  utterances: ['move {-|MOVE}']
}, (req, res) => {
  moveIntent(req, res);
});

app.intent('TypeIntent', {
  slots: {TYPE: 'TYPE'},
  utterances: ['type {-|TYPE}', 'type {-|TYPE} {-|TYPE}']
}, (req, res) => {
  typeIntent(req, res);
});

module.exports = app;