import { OpenapiToABAP } from './abapgen-openapi';
import { abapgen } from '@abapify/abapgen';

test('Load and parse petstore model', async () => {
  const parser = await OpenapiToABAP.load(
    'https://petstore3.swagger.io/api/v3/openapi.json'
  );
  parser.parse();
  console.log(    
    abapgen(parser.get_interface({ interface_name: 'zif_test_petstore3' }))
  );
  // throw "breakpoint";
});
