import { setup, teardown } from './utils';

jest.retryTimes(2);

beforeAll(() => {
  setup();
});

afterAll(() => {
  teardown();
});
