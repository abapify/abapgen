import { RecordOrArray } from './common';
import { has_comments as base } from '@abapify/abapgen-common';

export type Types = RecordOrArray<Component, 'types'>;

interface ABAPtype {
  length?: number;
  decimals?: number;
}

type Base<T extends object> = T & base;


export type SimpleType = base &
//   1. TYPES { {dtype[(len)] TYPE abap_type [DECIMALS dec]}
//   | {dtype TYPE abap_type [LENGTH len] [DECIMALS dec]}}.
(| ({ type: string } & ABAPtype)
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
    >
  | TableType
);
export type Type = SimpleType | TableType

// 4. TYPES BEGIN OF struc_type.
//     ...
//     TYPES comp ...
//     TYPES comp TYPE struc_type BOXED.
//     INCLUDE {TYPE|STRUCTURE} ...
//     ...
//   TYPES END OF struc_type.
type ArrayElementType<ArrayType extends Array<unknown>> = ArrayType[number];

export type Component = Record<string, Type> | StructuredType;
export type Components = Array<
  Record<string, Type> | ArrayElementType<StructuredType>
>;

//type Tree = Record<string,{tree: Tree}>;
export type StructuredType = Array<
  Base<{ begin: { of: string } }> | Component | { end: { of: string } } | string
>;

// 5. TYPES table_type { {TYPE tabkind OF [REF TO] type}
//                  | {LIKE tabkind OF dobj} }
//                      [tabkeys][INITIAL SIZE n].
type TableTypeSimple =  base & (
  | { type?: TableKind; of: string | { ref: { to: string } } }
  | { like?: TableKind; of: string }  
) & { with?: 'default key' | 'empty key'; initial?: { size: number } };
type TableTypeWithKeys = [TableTypeSimple, TableKeys];
export type TableType = TableTypeSimple | TableTypeWithKeys;

// TYPES - tabkind
// ... { {[STANDARD] TABLE}
//     | {SORTED TABLE}
//     | {HASHED TABLE}
//     | {ANY TABLE}
//     | {INDEX TABLE} } ...
type TableKinds = 'standard' | 'sorted' | 'hashed' | 'any' | 'index';
type TableKindGeneric<T extends string> = `${T} table`;
type TableKind = TableKindGeneric<TableKinds> | 'table';

// //   ... [ WITH key ]
// //     [ WITH secondary_key1 ] [ WITH secondary_key2 ] ...
// //     [ {WITH|WITHOUT} FURTHER SECONDARY KEYS ] ...
type TableKeys = [
  { with: PrimaryKey },
  { with: SecondaryKey },
  Partial<Record<'with' | 'without', 'further secondary keys'>>
];

// // ... { [UNIQUE | NON-UNIQUE]
// //   { {KEY [primary_key [ALIAS key_name] COMPONENTS] comp1 comp2 ...}
// //   | {DEFAULT KEY} }  }
// // | { EMPTY KEY } ...
// ToDo
type PrimaryKey = Record<string, unknown> | 'default key' | 'empty key';
type SecondaryKey = Record<string, unknown>;
