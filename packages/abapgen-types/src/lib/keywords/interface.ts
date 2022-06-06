import base from './common'

// 1. INTERFACE intf [PUBLIC].
//     [components]
//   ENDINTERFACE
// 2. INTERFACE intf DEFERRED [PUBLIC].

// type MultiLine = ["."|'', ...any];

export type Interface = [  
  { interface: string; deferred?: boolean; public?: boolean } & base,
  ...InterfaceComponents[],
  'endinterface'
];

type InterfaceComponents = Record<'types', {}>;
