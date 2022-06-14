import { has_comments as base } from '@abapify/abapgen-common';

export type RecordOrArray<T, K extends string> = Partial<
  | Record<K, (T & base) | StringArray<T | Record<string, T>>>
  | (T & Record<K, string>)

  //| { methods: Array<Record<string, InterfaceMethod> | string> }
>;

export type StringArray<T> = Array<T | string>;

export default base;
