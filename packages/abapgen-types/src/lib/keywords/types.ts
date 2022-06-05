// TYPES dtype type...
export type Types = {
  types: Record<string, Type> | StructuredType;
};

//export type StructuredType = StructuredTypeFlat; // | StructuredTypeDeep;

interface ABAPtype {
  length?: number;
  decimals?: number;
}

export type Type =
  //   1. TYPES { {dtype[(len)] TYPE abap_type [DECIMALS dec]}
  //   | {dtype TYPE abap_type [LENGTH len] [DECIMALS dec]}}.
  | ({ type: string } & ABAPtype)
  | { type: Record<string, ABAPtype> }
  // 2. TYPES dtype { {TYPE [LINE OF] type}
  //           | {LIKE [LINE OF] dobj}  }.
  // 3. TYPES ref_type { {TYPE REF TO type}
  //                 | {LIKE REF TO dobj} }.
  | Partial<
      Record<
        'type' | 'like',
        | 'string'
        | { line: { of: string } }
        | { ref: { to: string } }
        | Partial<Record<'line of' | 'ref to', string>>
      >
    >;

// 4. TYPES BEGIN OF struc_type.
//     ...
//     TYPES comp ...
//     TYPES comp TYPE struc_type BOXED.
//     INCLUDE {TYPE|STRUCTURE} ...
//     ...
//   TYPES END OF struc_type.
type Component = Record<string, Type>;

//type Tree = Record<string,{tree: Tree}>;
export type StructuredType = Array<
  | { begin: { of: string } }
  | StructuredType
  | Component
  | { end: { of: string } }
>;

// export type StructuredType = [
//   { begin: { of: string } },
//   ...Array<Component>,
//   // Array<StructuredType2>,
//   { end: { of: string } }
// ];

// 5. TYPES table_type { {TYPE tabkind OF [REF TO] type}
//                  | {LIKE tabkind OF dobj} }
//                      [tabkeys][INITIAL SIZE n].
type TableTypeSimple = (
  | { type: TableKind; of: string | { ref: { to: string } } }
  | { like: TableKind; of: string }
) & { initial?: { size: number } };

type TableTypeWithKeys = [TableTypeSimple, TableKeys];

type TableType = TableTypeSimple | TableTypeWithKeys;

type TableKind = {};

//   ... [ WITH key ]
//     [ WITH secondary_key1 ] [ WITH secondary_key2 ] ...
//     [ {WITH|WITHOUT} FURTHER SECONDARY KEYS ] ...
type TableKeys = [
  { with: PrimaryKey },
  { with: SecondaryKey },
  Partial<Record<'with' | 'without', 'further secondary keys'>>
];

type PrimaryKey = {};
type SecondaryKey = {};
