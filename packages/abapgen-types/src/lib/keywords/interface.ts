import base, { RecordOrArray, StringArray } from './common';
import { Types, SimpleType } from './types';

// 1. INTERFACE intf [PUBLIC].
//     [components]
//   ENDINTERFACE
// 2. INTERFACE intf DEFERRED [PUBLIC].

// type MultiLine = ["."|'', ...any];

// const methods: InterfaceComponents = [{methods:[]}]

// const test :Interface = [{interface:"lif_test"},{methods:[]},{endinterface:true}]

export type Interface = [
  { interface: string; deferred?: boolean; public?: boolean } & base,
  ...InterfaceComponents,
  'endinterface' | { endinterface: '' | true }
];

export type InterfaceTypes = Types;
export type InterfaceComponents = Array<InterfaceMethods | InterfaceTypes>;

// export type InterfaceMethods = Array<InterfaceMethod>;

// 1. METHODS meth [ABSTRACT|FINAL]
//               |[DEFAULT IGNORE|FAIL]
//     [IMPORTING parameters [PREFERRED PARAMETER p]]
//     [EXPORTING parameters]
//     [CHANGING  parameters]
//     [{RAISING exc1|RESUMABLE(exc1) exc2|RESUMABLE(exc2) ...}
//     |{EXCEPTIONS exc1 exc2 ...}].

export interface InterfaceMethod extends base {
  methods?: string | Record<string, Exclude<InterfaceMethod, 'methods'>>;
  abstract?: true;
  final?: true;
  default?: 'ignore';
  fail?: true;
  importing?: MethodParameters; //& {preferred?:{parameter:string}};
  exporting?: MethodParameters;
  changing?: MethodParameters;
  returning?: ValueType<string> | Record<string,SimpleType>;
  raising?: Array<string> | string;
  exceptions?: [];
}

// const i: Interface = [
//   { interface: 'lif_test' },
//   {
//     methods: [
//       {
//         do_this: [
//           {
//             importing: [{ p1: { type: 'string' } }, { p2: { type: 'string' } }],
//           },
//           {
//             returning: { 'value(result)': { type: 'string' } },
//           },
//         ],
//       },
//     ],
//   },
//   'endinterface',
// ];

// {[value(p1)]: }

// ... { VALUE(p1) | REFERENCE(p1) | p1 }
//         typing [OPTIONAL|{DEFAULT def1}]
//     { VALUE(p2) | REFERENCE(p2) | p2 }
//         typing [OPTIONAL|{DEFAULT def2}]
//     ...

//type RecordOrArray2<T> = Record<string,T> | Array<Record<string,T> | void | string>

export type MethodParameters =
  | Record<string, SimpleType>
  | Array<Record<string, SimpleType> | string>;

// {methods: "do_this", importing: [], returning: {type:{ref:{to:"string"}}} }
// {methods: "do_that", importing: [], returning: {type:{ref:{to:"string"}}} }

// {methods:[{ "do_this":{ importing: [], returning: {type:{ref:{to:"string"}}} }]

export type InterfaceMethods =
  | RecordOrArray<InterfaceMethod, 'methods'>
  | Array<InterfaceMethod | string>
  | {
      methods: Array<
        Record<string, InterfaceMethod | StringArray<InterfaceMethod>> | string
      >;
    };

// ... RETURNING VALUE(r) typing
type Value<value extends string> = `value(${value})`;
export type ValueType<value extends string> = Record<Value<value>, SimpleType>;
