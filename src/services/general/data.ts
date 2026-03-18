export type ListPagination = {
  total: number;
  pageSize: number;
  current: number;
};

export type DataTabKey = 'tg' | 'co' | 'my' | 'te';

export type PaginationParams = {
  current?: number;
  pageSize?: number;
};

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export type JsonObject = {
  [key: string]: JsonValue | undefined;
};

export type VersionRef = {
  id: string;
  version: string;
};

export type LangTextEntry = {
  '@xml:lang'?: string;
  '#text'?: string;
};

export type LangTextValue = LangTextEntry | LangTextEntry[] | null | undefined;

export type ClassificationLevelItem = {
  '@level'?: string;
  '#text'?: string;
  '@classId'?: string;
  '@catId'?: string;
};

export type ReferenceItem = {
  '@refObjectId'?: string;
  '@type'?: string;
  '@uri'?: string;
  '@version'?: string;
  'common:shortDescription'?: LangTextValue;
};

export type Classification = {
  id: string;
  value: string;
  label: string;
  children: Classification[];
};

export type FunctionInvokeResult<TData = unknown> = {
  data?: TData | null;
  error?: unknown;
};

export const langOptions = [
  {
    value: 'en',
    label: 'English',
  },
  {
    value: 'zh',
    label: '简体中文',
  },
];

export const initVersion = '01.01.000';
