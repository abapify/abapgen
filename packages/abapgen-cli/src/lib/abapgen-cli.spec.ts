import { abapgenCli } from './abapgen-cli';

describe('abapgenCli', () => {
  it('should work', () => {
    expect(abapgenCli()).toEqual('abapgen-cli');
  });
});
