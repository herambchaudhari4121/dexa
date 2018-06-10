const alexa = require('alexa-app'),
  app = new alexa.app('dexa'),
  path = require('path'),
  {stripIndents} = require('common-tags'),
  {dexIntent} = require(path.join(__dirname, 'intents/dexintent')),
  {itemIntent} = require(path.join(__dirname, 'intents/itemintent')),
  {abilityIntent} = require(path.join(__dirname, 'intents/abilityintent')),
  {moveIntent} = require(path.join(__dirname, 'intents/moveintent')),
  {typeIntent} = require(path.join(__dirname, 'intents/typeintent')),
  {removeDiacritics} = require(path.join(__dirname, 'util'));

app.launch((req, res) => {
  res.say('Welcome to Dexa, your one stop place for PokeDex information. Say "ask dexa for help" to learn my commands, but for now, is there a Pokémon you want to hear about?');
});

app.intent('AMAZON.StopIntent', {
  slots: {},
  utterances: []
}, (req, res) => {
  const stopOutput = 'Don\'t You Worry. I\'ll be back.';

  res.say(stopOutput);
});

app.intent('AMAZON.CancelIntent', {
  slots: {},
  utterances: []
}, (req, res) => {
  const cancelOutput = 'No problem. Request cancelled.';

  res.say(cancelOutput);
});

app.intent('AMAZON.HelpIntent', {
  slots: {},
  utterances: []
},
(req, res) => {
  const helpOutput = stripIndents`Dexa has a couple of sources of information, Pokémon, Items, Abilities, Moves and Type matchups. Respectively these can be invoked with.
  1: \`Ask Dexa Browser Pokemon Dragonite\`.
  2: \`Ask Dexa Browser Items Life Orb\`.
  3: \`Ask Dexa Browser Abilities Moves\`.
  4: \`Ask Dexa Browser Moves Dragon Dance\`.
  5: \`Ask Dexa Browser Types Dragon Flying\`.
  
  You can always stop or cancel anything I am saying by saying \`Alexa Stop\` or \`Alexa Cancel\`.`;
  const reprompt = 'What would you like to do?';

  res.say(helpOutput).reprompt(reprompt)
    .shouldEndSession(false);
}
);


app.error = function (exc, req, res) {
  console.error(exc);
  /* eslint-disable curly*/
  try {
    if (req.data.request.intent.name === 'DexIntent') {
      return res.say(`I couldn't find a Pokemon for ${req.slot('POKEMON')}. Are you sure you spelled that correctly?`);
    } else if (req.data.request.intent.name === 'AbilityIntent') {
      return res.say(`I couldn't find an Ability for ${req.slot('ABILITY')}. Are you sure you spelled that correctly?`);
    } else if (req.data.request.intent.name === 'MoveIntent') {
      return res.say(`I couldn't find an Move for ${req.slot('MOVE')}. I only support moves that have are used inside battles`);
    } else if (req.data.request.intent.name === 'ItemIntent') {
      return res.say(`I couldn't find an Item for ${req.slot('ITEM')}. Is that really an item that can be used in battle?`);
    } else if (req.data.request.intent.name === 'TypeIntent') {
      const data = {
          typeone: req.slot('FIRSTTYPE') ? removeDiacritics(req.slot('FIRSTTYPE')).toLowerCase() : null,
          typetwo: req.slot('SECONDTYPE') ? removeDiacritics(req.slot('SECONDTYPE')).toLowerCase() : null
        },
        validTypes = ['bug', 'dark', 'dragon', 'electric', 'fairy', 'fighting', 'fire', 'flying', 'ghost', 'grass', 'ground', 'ice', 'normal', 'poison', 'psychic', 'rock', 'steel', 'water'];

      if (!data.typeone) {
        return res.say(`You need to provide one or two types for the matchups. The valid types are: ${validTypes.join(', ')}`);
      } else if (data.typeone && !data.typetwo) {
        if (!validTypes.includes(data.typeone)) return res.say(`Your first type, ${req.slot('FIRSTTYPE')}, was invalid. Valid types are: ${validTypes.join(', ')}`);
      } else if (data.typeone && data.typetwo) {
        if (!validTypes.includes(data.typeone)) return res.say(`Your first type, ${req.slot('FIRSTTYPE')}, was invalid. Valid types are: ${validTypes.join(', ')}`);
        if (!validTypes.includes(data.typetwo)) return res.say(`Your second type, ${req.slot('SECONDTYPE')}, was invalid. Valid types are: ${validTypes.join(', ')}`);
      }

      return res.say('Something went awfully wrong in the type matchup. Please use `Alexa ask Dexa Browser for help` if you are unsure how to use Dexa'); // this should never throw unless the coding is very wrong
    }

    return res.say('Something went awfully wrong browsing my dataset. Please use `Alexa ask Dexa Browser for help` if you are unsure how to use Dexa'); // in case the error somehow gets thrown outside of any of the intents
  } catch (err) {
    return res.say('Something went awfully wrong browsing my dataset. Please use `Alexa ask Dexa Browser for help` if you are unsure how to use Dexa'); // general error in case something goes wrong that is not covered in the code
  }
};
/* eslint-enable curly */

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
  slots: {
    FIRSTTYPE: 'TYPE',
    SECONDTYPE: 'TYPE'
  },
  utterances: ['type {-|FIRSTTYPE}', 'type {-|FIRSTTYPE} {-|SECONDTYPE}']
}, (req, res) => {
  typeIntent(req, res);
});

module.exports = app;