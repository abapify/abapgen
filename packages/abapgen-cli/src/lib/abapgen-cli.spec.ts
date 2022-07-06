import { generate } from '../commands/generate';

describe('Test generate', () => {
  jest.setTimeout(10000);
  it('Petstore V3', async () => {
    await generate.parseAsync(
      [
        '--openapi',
        'https://petstore3.swagger.io/api/v3/openapi.json',
        '--interface',
        'zif_petstore3',
        '--folder',
        'output',
      ],
      { from: 'user' }
    );
  });
});
