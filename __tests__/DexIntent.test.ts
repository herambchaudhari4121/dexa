import { oneLine } from 'common-tags';
import fetch from 'supertest';
import { SERVER, setup, teardown } from './utils';

describe('DexIntent', () => {
  beforeAll(() => {
    setup();
  });

  afterAll(() => {
    teardown();
  });

  test('GIVEN Pokémon with evolutions THEN returns data with prevos', async () => {
    expect.assertions(2);

    const res = await fetch(SERVER)
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
      });

    const { ssml } = res.body.response.outputSpeech;

    expect(res.status).toBe(200);
    expect(ssml).toBe(oneLine`
        <speak>Dragonite, number 149, It is said that this Pokémon lives somewhere in the sea and that it flies.
        However, these are only rumors.
        It is Dragon Flying type.
        Its pre-evolutions are dragonair (Level: 55) and dratini (Level: 30).
        Dragonite is typically 2.2 meters tall and weighs about 210 kilograms.
        It has a gender ratio of 50% male and 50% female.</speak>
    `);
  });

  test('GIVEN Pokémon with complicated evolutions THEN returns data with varying evos', async () => {
    expect.assertions(2);

    const res = await fetch(SERVER)
      .post('/dexa')
      .send({
        request: {
          type: 'IntentRequest',
          intent: {
            name: 'DexIntent',
            slots: {
              POKEMON: {
                name: 'POKEMON',
                value: 'eevee'
              }
            }
          }
        }
      });

    const { ssml } = res.body.response.outputSpeech;

    expect(res.status).toBe(200);
    expect(ssml).toBe(oneLine`
        <speak>Eevee, number 133, Thanks to its unstable genetic makeup, this special Pokémon conceals many different possible evolutions.
          It is Normal type. It evolves into
          vaporeon (Special Condition: use Water Stone) and
          jolteon (Special Condition: use Thunder Stone) and
          flareon (Special Condition: use Fire Stone) and
          espeon (Special Condition: Level up during Daytime with High Friendship) and
          umbreon (Special Condition: Level up during Nighttime with High Friendship) and
          leafeon (Special Condition: use Leaf Stone) and
          glaceon (Special Condition: use Ice Stone) and
          sylveon (Special Condition: Level up while having high Affection and knowing a Fairy type move).
          Eevee is typically 0.3 meters tall and weighs about 6.5 kilograms.
          It has a gender ratio of 87.5% male and 12.5% female.</speak>
    `);
  });

  test('GIVEN Pokémon with pre-evolution and evolution THEN returns data with prevo and evo', async () => {
    expect.assertions(2);

    const res = await fetch(SERVER)
      .post('/dexa')
      .send({
        request: {
          type: 'IntentRequest',
          intent: {
            name: 'DexIntent',
            slots: {
              POKEMON: {
                name: 'POKEMON',
                value: 'dragonair'
              }
            }
          }
        }
      });

    const { ssml } = res.body.response.outputSpeech;

    expect(res.status).toBe(200);
    expect(ssml).toBe(oneLine`
      <speak>Dragonair, number 148, According to a witness, its body was surrounded by a strange aura that gave it a
      mystical look.
      It is Dragon type.
      Its pre-evolution is dratini (Level: 30).
      It evolves into dragonite (Level: 55).
      Dragonair is typically 4 meters tall and weighs about 16.5 kilograms.
      It has a gender ratio of 50% male and 50% female.</speak>
    `);
  });

  test('GIVEN Pokémon with two evolution THEN returns data with evos', async () => {
    expect.assertions(2);

    const res = await fetch(SERVER)
      .post('/dexa')
      .send({
        request: {
          type: 'IntentRequest',
          intent: {
            name: 'DexIntent',
            slots: {
              POKEMON: {
                name: 'POKEMON',
                value: 'dratini'
              }
            }
          }
        }
      });

    const { ssml } = res.body.response.outputSpeech;

    expect(res.status).toBe(200);
    expect(ssml).toBe(oneLine`
      <speak>Dratini, number 147, Long thought to be a myth, this Pokémon's existence was only recently confirmed by a
      fisherman who caught one.
      It is Dragon type.
      It evolves into dragonair (Level: 30) and dragonite (Level: 55).
      Dratini is typically 1.8 meters tall and weighs about 3.3 kilograms.
      It has a gender ratio of 50% male and 50% female.</speak>
    `);
  });

  test('GIVEN Pokémon with no evolutions or pre-evolutions THEN returns data of just Pokémon', async () => {
    expect.assertions(2);

    const res = await fetch(SERVER)
      .post('/dexa')
      .send({
        request: {
          type: 'IntentRequest',
          intent: {
            name: 'DexIntent',
            slots: {
              POKEMON: {
                name: 'POKEMON',
                value: 'smeargle'
              }
            }
          }
        }
      });

    const { ssml } = res.body.response.outputSpeech;

    expect(res.status).toBe(200);
    expect(ssml).toBe(oneLine`
      <speak>Smeargle, number 235, It draws symbols with the fluid that oozes from the tip of its tail.
      Depending on the symbol, Smeargle fanatics will pay big money for them.
      It is Normal type.
      Smeargle is typically 1.2 meters tall and weighs about 58 kilograms.
      It has a gender ratio of 50% male and 50% female.</speak>
    `);
  });

  test('GIVEN Pokémon with no genders THEN returns data of with genderless', async () => {
    expect.assertions(2);

    const res = await fetch(SERVER)
      .post('/dexa')
      .send({
        request: {
          type: 'IntentRequest',
          intent: {
            name: 'DexIntent',
            slots: {
              POKEMON: {
                name: 'POKEMON',
                value: 'metagross'
              }
            }
          }
        }
      });

    const { ssml } = res.body.response.outputSpeech;

    expect(res.status).toBe(200);
    expect(ssml).toBe(oneLine`
      <speak>Metagross, number 376, It analyzes its opponents with more accuracy than a supercomputer,
      which enables it to calmly back them into a corner.
      It is Steel Psychic type.
      Its pre-evolutions are metang (Level: 45) and beldum (Level: 20).
      Metagross is typically 1.6 meters tall and weighs about 550 kilograms.
      It is genderless.</speak>
    `);
  });

  test('GIVEN invalid data THEN returns error response', async () => {
    // Mocking out the GraphQL warning response
    jest.spyOn(console, 'warn').mockImplementationOnce(() => undefined);
    expect.assertions(2);

    const res = await fetch(SERVER)
      .post('/dexa')
      .send({
        request: {
          type: 'IntentRequest',
          intent: {
            name: 'DexIntent',
            slots: {
              POKEMON: {
                name: 'POKEMON',
                value: 'aklsjdkjlashgdjlhaksgdjaghsdghasjd'
              }
            }
          }
        }
      });

    const { ssml } = res.body.response.outputSpeech;

    expect(res.status).toBe(200);
    expect(ssml).toBe(oneLine`
      <speak>I am sorry but I could not resolve that query.
      I think you said aklsjdkjlashgdjlhaksgdjaghsdghasjd?
      Maybe try again, or respond with \"Alexa Cancel\" if you want to stop.</speak>
    `);
  });
});
