import { oneLine } from 'common-tags';
import fetch from 'supertest';
import { SERVER } from './utils';

describe('ItemIntent', () => {
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
