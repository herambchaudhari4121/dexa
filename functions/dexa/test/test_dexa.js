/* eslint-disable no-undef, no-unused-vars, sort-vars, no-mixed-requires, global-require*/
const express = require('express');
const request = require('supertest');
const {expect} = require('chai');

describe('Dexa', () => {
  let server = null;

  beforeEach(() => {
    const app = express();
    const dexa = require('../dexa');

    dexa.express({
      expressApp: app,
      debug: true,
      checkCert: false
    });
    server = app.listen(3000);
  });

  afterEach(() => {
    server.close();
  });

  it('responds to invalid data', () => request(server)
    .post('/dexa')
    .send({})
    .expect(200)
    .then(response => expect(response.body).to.eql({
      version: '1.0',
      response: {
        directives: [],
        shouldEndSession: true,
        outputSpeech: {
          type: 'SSML',
          ssml: '<speak>Something went awfully wrong browsing my dataset. Please use `Alexa ask Dexa Browser for help` if you are unsure how to use Dexa</speak>'
        }
      },
      sessionAttributes: {}
    })));

  it('responds to a launch event', () => request(server)
    .post('/dexa')
    .send({request: {type: 'LaunchRequest'}})
    .expect(200)
    .then((response) => {
      const {ssml} = response.body.response.outputSpeech;

      return expect(ssml).to.eql('<speak>Welcome to Dexa, your one stop place for PokeDex information. Say "ask dexa for help" to learn my commands, but for now, is there a Pokémon you want to hear about?</speak>');
    }));

  it('responds to a dex lookup event', () => request(server)
    .post('/dexa')
    .send({
      request: {
        type: 'IntentRequest',
        intent: {
          name: 'DexIntent',
          slots: {
            POKEMON: {
              name: 'POKEMON',
              value: 'dragonite'
            }
          }
        }
      }
    })
    .expect(200)
    .then((response) => {
      const {ssml} = response.body.response.outputSpeech;

      return expect(ssml).to.eql('<speak>Dragonite, number 149, You\'ll often hear tales of this kindhearted Pokémon rescuing people or Pokémon that are drowning. It is Dragon Flying type. It\'s pre-evolutions are Dragonair and Dratini. Dragonite gets the abilities Inner Focus and Multiscale and it is typically 2.2 meters tall and weighs about 210 kilograms. Dragonite appears as roughly 50% Male and 50% Female.</speak>');
    }));

  it('responds to a item lookup event', () => request(server)
    .post('/dexa')
    .send({
      request: {
        type: 'IntentRequest',
        intent: {
          name: 'ItemIntent',
          slots: {
            ITEM: {
              name: 'ITEM',
              value: 'life orb'
            }
          }
        }
      }
    })
    .expect(200)
    .then((response) => {
      const {ssml} = response.body.response.outputSpeech;

      return expect(ssml).to.eql('<speak>Life orb, Holder\'s attacks do 1.3 times damage, and it loses 1/10 its max HP after the attack. It was introduced in generation 4.</speak>');
    }));

  it('responds to a move lookup event', () => request(server)
    .post('/dexa')
    .send({
      request: {
        type: 'IntentRequest',
        intent: {
          name: 'MoveIntent',
          slots: {
            MOVE: {
              name: 'MOVE',
              value: 'dragon dance'
            }
          }
        }
      }
    })
    .expect(200)
    .then((response) => {
      const {ssml} = response.body.response.outputSpeech;

      return expect(ssml).to.eql('<speak>Dragon Dance, Raises the user\'s Attack and Speed by 1 stage. Dragon Dance is a Dragon type move with 20 pp. Under normal conditions it will have a priority factor of 0 and an accuracy of 100%. In battles with multiple pokemon on each side it will have an effect on Self. It is categorized as a Status type move in battles and as a Cool type move in contests.</speak>');
    }));

  it('responds to a ability lookup event', () => request(server)
    .post('/dexa')
    .send({
      request: {
        type: 'IntentRequest',
        intent: {
          name: 'AbilityIntent',
          slots: {
            ABILITY: {
              name: 'ABILITY',
              value: 'multiscale'
            }
          }
        }
      }
    })
    .expect(200)
    .then((response) => {
      const {ssml} = response.body.response.outputSpeech;

      return expect(ssml).to.eql('<speak>Multiscale, If this Pokemon is at full HP, damage taken from attacks is halved.</speak>');
    }));

  it('responds to a single type lookup event', () => request(server)
    .post('/dexa')
    .send({
      request: {
        type: 'IntentRequest',
        intent: {
          name: 'TypeIntent',
          slots: {
            FIRSTTYPE: {
              name: 'TYPE',
              value: 'dragon'
            }
          }
        }
      }
    })
    .expect(200)
    .then((response) => {
      const {ssml} = response.body.response.outputSpeech;

      return expect(ssml).to.eql('<speak>Dragon is Supereffective against: Dragon (times 2), Deals normal damage to: Bug, Dark, Electric, Fighting, Fire, Flying, Ghost, Grass, Ground, Ice, Normal, Poison, Psychic, Rock, Water, is Not very effective against: Steel (times 0.5) and Doesn\'t affect: Fairy. Furthermore, Dragon is Vulnerable to: Dragon (times 2),Takes normal damage from: Bug, Dark, Fighting, Flying, Ghost, Ground, Normal, Poison, Psychic, Rock, Steel, and Resists: Electric (times 0.5)</speak>');
    }));

  it('responds to a dual type lookup event', () => request(server)
    .post('/dexa')
    .send({
      request: {
        type: 'IntentRequest',
        intent: {
          name: 'TypeIntent',
          slots: {
            FIRSTTYPE: {
              name: 'TYPE',
              value: 'dragon'
            },
            SECONDTYPE: {
              name: 'TYPE',
              value: 'flying'
            }
          }
        }
      }
    })
    .expect(200)
    .then((response) => {
      const {ssml} = response.body.response.outputSpeech;

      return expect(ssml).to.eql('<speak>Dragon Flying is Supereffective against: Bug (times 2), Deals normal damage to: Dark, Fire, Flying, Ghost, Ground, Ice, Normal, Poison, Psychic, Water, is Not very effective against: Electric (times 0.5), Steel (times 0.25) and Doesn\'t affect: Fairy. Furthermore, Dragon Flying is Vulnerable to: Dragon (times 2), Ice (times 4),Takes normal damage from: Dark, Electric, Flying, Ghost, Normal, Poison, Psychic, Steel, Resists: Bug (times 0.5), Grass (times 0.25) and is Not affected by: Ground</speak>');
    }));
});