import base, { RecordOrArray } from './common';
import { Types } from './types';


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

interface InterfaceMethod extends base {
  // methods?: string,
  abstract?: true;
  final?: true;
  default?: 'ignore';
  fail?: true;
  importing?: Array<unknown>;
  exporting?: [];
  changing?: [];
  raising?: [];
  exceptions?: [];
}

// {methods: "do_this", importing: [], returning: {type:{ref:{to:"string"}}} }
// {methods: "do_that", importing: [], returning: {type:{ref:{to:"string"}}} }

// {methods:[{ "do_this":{ importing: [], returning: {type:{ref:{to:"string"}}} }]


export type InterfaceMethods = RecordOrArray<InterfaceMethod, 'methods'>;
