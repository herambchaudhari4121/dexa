const alexa = require('alexa-app'),
  app = new alexa.app('dexa'),
  path = require('path'),
  {dex} = require(path.join(__dirname, 'intents/dexintent')),
  {item} = require(path.join(__dirname, 'intents/itemintent')),
  {ability} = require(path.join(__dirname, 'intents/itemintent')),
  {move} = require(path.join(__dirname, 'intents/itemintent')),
  {type} = require(path.join(__dirname, 'intents/itemintent'));

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
  dex(req, res);
});

app.intent('ItemIntent', {
  slots: {ITEM: 'ITEM'},
  utterances: ['item {-|ITEM}']
}, (req, res) => {
  item(req, res);
});

app.intent('AbilityIntent', {
  slots: {ABILITY: 'ABILITY'},
  utterances: ['ability {-|ABILITY}']
}, (req, res) => {
  ability(req, res);
});

app.intent('MoveIntent', {
  slots: {MOVE: 'MOVE'},
  utterances: ['move {-|MOVE}']
}, (req, res) => {
  move(req, res);
});

app.intent('TypeIntent', {
  slots: {TYPE: 'TYPE'},
  utterances: ['type {-|TYPE}']
}, (req, res) => {
  type(req, res);
});

module.exports = app;