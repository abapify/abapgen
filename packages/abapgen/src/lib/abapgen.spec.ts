import abapgen from './abapgen';
import test from '../../../abapgen-types/src/lib/abapgen-types.spec';
import { $comment } from '@abapify/abapgen-common';
//import test from '@abapify/abapgen-types/src/lib/abapgen-types.spec'

describe('interfaces', () => {
  it('Interface defintion', () => {
    expect(abapgen(test.simple_interface)).toEqual(
      `"test comment before
interface lif_interface public. "test comment after
types string_property type string.
types:
string_type2 type string,
begin of structured_type,
string_property type string,
string_property2 type string length 100,
begin of nested_type,
string_property type string,
end of nested_type,
end of structured_type,
string_table type standard table of string with empty key.
methods:
do_this,
do_that importing
p1 type string
p2 type string.
endinterface.`
    );
  });
});

console.log(abapgen({ type: 'string', [$comment.before]: 'test' }));
