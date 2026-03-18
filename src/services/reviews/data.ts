import type { CommentRow } from '../comments/data';
import type { LangTextEntry, LangTextValue, ReferenceItem } from '../general/data';
import { isJsonObject } from '../general/util';
import type { LifeCycleModelJsonTg, LifeCycleModelNamedText } from '../lifeCycleModels/data';
import type { Tables } from '../supabase/database.types';

export type ReviewDatasetName = LifeCycleModelNamedText;

export type ReviewDataSnapshot = {
  id: string;
  version: string;
  name: ReviewDatasetName;
};

export type ReviewTeamSnapshot = {
  id: string | null;
  name?: LangTextValue | string | null;
};

export type ReviewUserSnapshot = {
  id: string;
  name?: string;
  email?: string | null;
};

export type ReviewCommentSnapshot = {
  message?: string;
};

export type ReviewLogSnapshot = {
  action?: string;
  time?: string | Date;
  user?: {
    id?: string;
    display_name?: string;
    name?: string;
  };
};

export type ReviewJson = {
  data: ReviewDataSnapshot;
  team: ReviewTeamSnapshot;
  user: ReviewUserSnapshot;
  comment?: ReviewCommentSnapshot;
  logs?: ReviewLogSnapshot[];
};

export type ReviewMutableJson = {
  data?: Partial<ReviewDataSnapshot>;
  team?: Partial<ReviewTeamSnapshot>;
  user?: Partial<ReviewUserSnapshot>;
  comment?: ReviewCommentSnapshot;
  logs?: ReviewLogSnapshot[];
};

export type ReviewRow = Tables<'reviews'>;

export type ReviewDetailRow = Omit<ReviewRow, 'json'> & {
  json: ReviewMutableJson | null;
};

export type ReviewProcessRecord = Pick<ReviewRow, 'id'> & {
  json: Pick<ReviewMutableJson, 'logs'> | null;
};

export type ReviewModelProcessInstance = {
  referenceToProcess?: ReferenceItem;
};

export type ReviewModelJsonSnapshot = {
  lifeCycleModelDataSet?: {
    lifeCycleModelInformation?: {
      dataSetInformation?: {
        name?: ReviewDatasetName;
      };
      technology?: {
        processes?: {
          processInstance?: ReviewModelProcessInstance | ReviewModelProcessInstance[] | null;
        };
      };
    };
  };
};

export type ReviewModelJsonTgSnapshot = {
  xflow?: LifeCycleModelJsonTg['xflow'];
  submodels?: Array<{
    id: string;
    version?: string;
    type?: 'primary' | 'secondary' | string;
  }>;
};

export type ReviewModelDataSnapshot = {
  id: string;
  version: string;
  json: ReviewModelJsonSnapshot;
  json_tg?: ReviewModelJsonTgSnapshot;
};

export type ReviewSubTableRow = {
  key: string;
  id: string;
  version: string;
  name: string;
  sourceType?: 'processInstance' | 'submodel';
  submodelType?: string;
};

export type ReviewSubTableDataMap = Record<string, ReviewSubTableRow[]>;

export type ReviewUpdatePayload = Partial<{
  json: ReviewMutableJson;
  reviewer_id: React.Key[];
  state_code: number;
  deadline: string;
  modified_at: string;
}>;

export type ReviewRowRecord = {
  id: string;
  created_at: string;
  modified_at: string;
  deadline?: string | null;
  state_code: number;
  json: ReviewJson;
  comments?: { state_code: number }[];
};

export type ReviewCommentResultRow = Pick<CommentRow, 'review_id'> & {
  reviews?: ReviewRowRecord | ReviewRowRecord[] | null;
};

export type ReviewCommentQueryResult = {
  data?: ReviewCommentResultRow[] | null;
  error?: unknown;
  count?: number | null;
  status?: number;
  statusText?: string;
};

export type ReviewsTable = {
  key: string;
  id: string;
  name: string;
  teamName: string;
  modifiedAt?: string;
  deadline?: string | null;
  userName: string;
  createAt?: string;
  isFromLifeCycle: boolean;
  stateCode?: number;
  comments?: { state_code: number }[];
  json: ReviewJson;
  modelData?: ReviewModelDataSnapshot | null;
};

const REVIEW_DATASET_NAME_KEYS = [
  'baseName',
  'treatmentStandardsRoutes',
  'mixAndLocationTypes',
  'functionalUnitFlowProperties',
] as const;
const REVIEW_DATASET_NAME_KEY_SET = new Set<string>(REVIEW_DATASET_NAME_KEYS);

const isReviewLangTextEntry = (value: unknown): value is LangTextEntry => {
  if (!isJsonObject(value)) {
    return false;
  }

  return Object.keys(value).every((key) => key === '#text' || key === '@xml:lang');
};

const isLangTextValue = (value: unknown): value is LangTextValue =>
  value === undefined ||
  value === null ||
  isReviewLangTextEntry(value) ||
  (Array.isArray(value) && value.every((item) => isReviewLangTextEntry(item)));

const isReviewDatasetNameObject = (value: unknown): value is LifeCycleModelNamedText => {
  if (!isJsonObject(value)) {
    return false;
  }

  return Object.keys(value).every((key) => REVIEW_DATASET_NAME_KEY_SET.has(key));
};

const isReviewDatasetName = (value: unknown): value is ReviewDatasetName =>
  isReviewDatasetNameObject(value) &&
  REVIEW_DATASET_NAME_KEYS.every((key) => isLangTextValue(value[key]));

const isReviewMutableData = (value: unknown): value is ReviewMutableJson['data'] => {
  if (!isJsonObject(value)) {
    return false;
  }

  return (
    (value.id === undefined || typeof value.id === 'string') &&
    (value.version === undefined || typeof value.version === 'string') &&
    (value.name === undefined || isReviewDatasetName(value.name))
  );
};

const isReviewMutableTeam = (value: unknown): value is ReviewMutableJson['team'] => {
  if (!isJsonObject(value)) {
    return false;
  }

  return (
    (value.id === undefined || value.id === null || typeof value.id === 'string') &&
    (value.name === undefined ||
      value.name === null ||
      typeof value.name === 'string' ||
      isLangTextValue(value.name))
  );
};

const isReviewMutableUser = (value: unknown): value is ReviewMutableJson['user'] => {
  if (!isJsonObject(value)) {
    return false;
  }

  return (
    (value.id === undefined || typeof value.id === 'string') &&
    (value.name === undefined || typeof value.name === 'string') &&
    (value.email === undefined || value.email === null || typeof value.email === 'string')
  );
};

const isReviewCommentSnapshot = (value: unknown): value is ReviewCommentSnapshot => {
  if (!isJsonObject(value)) {
    return false;
  }

  return value.message === undefined || typeof value.message === 'string';
};

const isReviewLogUser = (value: unknown): value is NonNullable<ReviewLogSnapshot['user']> => {
  if (!isJsonObject(value)) {
    return false;
  }

  return (
    (value.id === undefined || typeof value.id === 'string') &&
    (value.display_name === undefined || typeof value.display_name === 'string') &&
    (value.name === undefined || typeof value.name === 'string')
  );
};

const isReviewLogSnapshot = (value: unknown): value is ReviewLogSnapshot => {
  if (!isJsonObject(value)) {
    return false;
  }

  return (
    (value.action === undefined || typeof value.action === 'string') &&
    (value.time === undefined || typeof value.time === 'string' || value.time instanceof Date) &&
    (value.user === undefined || isReviewLogUser(value.user))
  );
};

export const isReviewMutableJson = (value: unknown): value is ReviewMutableJson =>
  isJsonObject(value) &&
  (value.data === undefined || isReviewMutableData(value.data)) &&
  (value.team === undefined || isReviewMutableTeam(value.team)) &&
  (value.user === undefined || isReviewMutableUser(value.user)) &&
  (value.comment === undefined || isReviewCommentSnapshot(value.comment)) &&
  (value.logs === undefined ||
    (Array.isArray(value.logs) && value.logs.every((item) => isReviewLogSnapshot(item))));

export const toReviewMutableJson = (value: unknown): ReviewMutableJson | null =>
  isReviewMutableJson(value) ? value : null;

export const mapReviewDetailRow = (row: ReviewRow): ReviewDetailRow => ({
  ...row,
  json: toReviewMutableJson(row.json),
});

export const mapReviewDetailRows = (rows: ReviewRow[] | null | undefined): ReviewDetailRow[] =>
  (rows ?? []).map(mapReviewDetailRow);

export const mapReviewProcessRow = (row: Pick<ReviewRow, 'id' | 'json'>): ReviewProcessRecord => ({
  id: row.id,
  json: (() => {
    const reviewJson = toReviewMutableJson(row.json);
    return reviewJson ? { logs: reviewJson.logs } : null;
  })(),
});

export const mapReviewProcessRows = (
  rows: Array<Pick<ReviewRow, 'id' | 'json'>> | null | undefined,
): ReviewProcessRecord[] => (rows ?? []).map(mapReviewProcessRow);
