import { Interface } from './keywords/interface';
import { Type, StructuredType } from './keywords/types';

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
    [
      { begin: { of: 'nested_type' } },
      { string_property: samples.string_type_decalration },
      { end: { of: 'nested_type' } },
    ],
    { end: { of: 'structured_type' } },
  ];

  static simple_interface: Interface = [
    { interface: 'lif_interface', public: true },
    { types: samples.string_property },
    {
      types: [
        ':',
        { string_type2: samples.string_type_decalration },
        ...samples.structure_type,
      ],
    },

    'endinterface',
  ];
}

export default samples;
