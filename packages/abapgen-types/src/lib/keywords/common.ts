import { has_comments as base } from '@abapify/abapgen-common';

export type RecordOrArray<T, K extends string> = Partial<
  Record<K, (T & base) | ArrayOrStringArray<T>> | T & Record<K,string>
>;

export type ArrayOrStringArray<T> = Array<T|string>

export default base;
