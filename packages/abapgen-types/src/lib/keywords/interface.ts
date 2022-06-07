import base from './common'

// 1. INTERFACE intf [PUBLIC].
//     [components]
//   ENDINTERFACE
// 2. INTERFACE intf DEFERRED [PUBLIC].

// type MultiLine = ["."|'', ...any];

export type Interface = [  
  { interface: string; deferred?: boolean; public?: boolean } & base,
  ...InterfaceComponents,
  'endinterface'
];

export type InterfaceComponents = Array<InterfaceMethod>;
export type InterfaceMethods = Array<InterfaceMethod>;

// 1. METHODS meth [ABSTRACT|FINAL]
//               |[DEFAULT IGNORE|FAIL]
//     [IMPORTING parameters [PREFERRED PARAMETER p]]
//     [EXPORTING parameters]
//     [CHANGING  parameters]
//     [{RAISING exc1|RESUMABLE(exc1) exc2|RESUMABLE(exc2) ...}
//     |{EXCEPTIONS exc1 exc2 ...}].

interface InterfaceMethod extends base {
  methods: string,
  abstract? : true
  final?: true,
  default?:"ignore",
  fail?:true,
  importing?: []
  exporting?: []
  changing?: []
  raising?: []
  exceptions?: []
}


