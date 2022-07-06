import { $comment } from '@abapify/abapgen-common';
import { Interface } from './keywords/interface';
import { Type, StructuredType, TableType } from './keywords/types';

class samples {
  // simple type decalration sample
  static string_type_decalration: Type = { type: 'string' };
  // flat type decalration with additional properties
  static simple_type_flat: Type = { type: 'string', length: 100 };
  // type decalration using nested objects
  static simple_type_nested: Type = { type: { string: { length: 200 } } };
  // component definition
  static string_property = { string_property: samples.string_type_decalration };
  // strcutured type sample
  static structure_type: StructuredType = [
    { begin: { of: 'structured_type' } },
    { string_property: samples.string_type_decalration },
    { string_property2: samples.simple_type_flat },
    ...[
      { begin: { of: 'nested_type' } },
      { string_property: samples.string_type_decalration },
      { end: { of: 'nested_type' } },
    ],
    { end: { of: 'structured_type' } },
  ];
  // simple table type
  static string_table_type: TableType = {
    type: 'standard table',
    of: 'string',
    with: 'empty key',
  };

  static simple_interface: Interface = [
    {
      [$comment.before]: 'test comment before',
      interface: 'lif_interface',
      public: true,
      [$comment.after]: 'test comment after',
    },
    { types: samples.string_property },
    {
      types: [
        ':',
        { string_type2: samples.string_type_decalration },
        ...samples.structure_type,
        { string_table: samples.string_table_type },
      ],
    },
    {
      methods: [
        ':',
        { do_this: {} },
        {
          do_that: [            
            {
              importing: [                
                { p1: { type: 'string' } },
                { p2: { type: 'string' } },
              ],
            },
            {
              returning: { 'value(result)': { type: 'string' } },
            },
          ],
        },
      ],
    },
    'endinterface',
  ];
}

export default samples;
