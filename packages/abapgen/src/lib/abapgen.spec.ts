import abapgen from './abapgen';
import test from '../../../abapgen-types/src/lib/abapgen-types.spec';

describe('abapgen', () => {
  // {"type":"string"} => "type string"
  it('Simple type declaration', () => {
    expect(abapgen(test.string_type_decalration)).toEqual('type string');
  });
  // {"type":"string","length":100} => "type string length 100"
  it('Simple type with length', () => {
    expect(abapgen(test.simple_type_flat)).toEqual(
      'type string length 100'
    );
  });
  // {"type":"string","length":100} => "type string length 100"
  it('Simple type (nested object)', () => {
    expect(abapgen(test.simple_type_nested)).toEqual(
      'type string length 200'
    );
  });
  //Multine declararion using types:
  it('Multine declararion using types:[{begin:{...}}]', () => {
    expect(
      abapgen({
        types: [
          { begin: { of: 'structure_type' } },
          { foo: { type: 'bar' } },
          { lorem: { type: 'ipsum' } },
          { end: { of: 'structure_type' } },
        ],
      })
    ).toEqual(
      'types:\nbegin of structure_type,\nfoo type bar,\nlorem type ipsum,\nend of structure_type.'
    );
  });

  // table type declaration
  it('table type declaration', () => {
    expect(
      abapgen({
        types: [
          {
            table_type: {
              type: { 'sorted table of': 'string' },
              with: 'empty key',
            },
          },
        ],
      })
    ).toEqual('types:\ntable_type type sorted table of string with empty key.');
  });
});

describe('interfaces', () => {
  it('Interface defintion', () => {
    expect(abapgen(test.simple_interface)).toEqual(
      `interface lif_interface public.
types string_property type string.
types:
string_type2 type string,
begin of structured_type,
string_property type string,
string_property2 type string length 100,
begin of nested_type,
string_property type string,
end of nested_type,
end of structured_type.
endinterface.`
    );
  });
});
