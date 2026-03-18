import { isJsonObject, jsonToList } from '../general/util';
import type { FormProcess, ProcessComplianceItem, ProcessReviewItem } from '../processes/data';
import type {
  Json as DatabaseJson,
  Tables,
  TablesInsert,
  TablesUpdate,
} from '../supabase/database.types';

export type CommentActionType = 'assigned' | 'review' | 'reviewer-rejected' | 'admin-rejected';

export type CommentRow = Tables<'comments'>;
export type CommentInsert = TablesInsert<'comments'>;
export type CommentUpdate = TablesUpdate<'comments'>;

type ProcessModellingAndValidation = NonNullable<FormProcess['modellingAndValidation']>;

export type CommentValidation = ProcessModellingAndValidation['validation'];

export type CommentComplianceDeclarations = ProcessModellingAndValidation['complianceDeclarations'];

export type CommentModellingAndValidation = {
  validation?: CommentValidation;
  complianceDeclarations?: CommentComplianceDeclarations;
};

export type CommentJson = {
  comment?: {
    message?: string;
  };
  modellingAndValidation?: CommentModellingAndValidation;
};

export type CommentMutationResult = {
  error?: unknown;
  success?: boolean;
};

export type CommentTable = Omit<CommentRow, 'json'> & {
  json: CommentJson | null;
};

export type CommentInsertPayload = Omit<CommentInsert, 'json'> & {
  json?: CommentJson | null;
};

export type CommentUpdatePayload = Omit<CommentUpdate, 'json'> & {
  json?: CommentJson | null;
};

export type CommentReviewerState = Pick<CommentRow, 'reviewer_id' | 'state_code'>;

export type UserManageCommentSummary = Pick<
  CommentRow,
  'review_id' | 'reviewer_id' | 'state_code'
> & {
  reviews?: Array<{
    state_code?: number | null;
  }> | null;
};

export type CommentJsonRecord = {
  json: CommentJson | null;
};

export const isCommentJson = (value: unknown): value is CommentJson => isJsonObject(value);

const isCommentReviewCollection = (
  value: unknown,
): value is ProcessReviewItem | ProcessReviewItem[] => Array.isArray(value) || isJsonObject(value);

const isCommentComplianceCollection = (
  value: unknown,
): value is ProcessComplianceItem | ProcessComplianceItem[] =>
  Array.isArray(value) || isJsonObject(value);

export const isCommentValidation = (value: unknown): value is CommentValidation => {
  if (!isJsonObject(value)) {
    return false;
  }

  return value.review === undefined || isCommentReviewCollection(value.review);
};

export const isCommentComplianceDeclarations = (
  value: unknown,
): value is CommentComplianceDeclarations => {
  if (!isJsonObject(value)) {
    return false;
  }

  return value.compliance === undefined || isCommentComplianceCollection(value.compliance);
};

export const isCommentModellingAndValidation = (
  value: unknown,
): value is CommentModellingAndValidation => {
  if (!isJsonObject(value)) {
    return false;
  }

  return (
    (value.validation === undefined || isCommentValidation(value.validation)) &&
    (value.complianceDeclarations === undefined ||
      isCommentComplianceDeclarations(value.complianceDeclarations))
  );
};

const toCommentModellingAndValidation = (
  value: unknown,
): CommentModellingAndValidation | undefined => {
  if (!isJsonObject(value)) {
    return undefined;
  }

  const modellingAndValidation: CommentModellingAndValidation = {};

  if (isCommentValidation(value.validation)) {
    modellingAndValidation.validation = value.validation;
  }

  if (isCommentComplianceDeclarations(value.complianceDeclarations)) {
    modellingAndValidation.complianceDeclarations = value.complianceDeclarations;
  }

  return Object.keys(modellingAndValidation).length > 0 ? modellingAndValidation : undefined;
};

export const toCommentJson = (value: DatabaseJson | null | undefined): CommentJson | null => {
  if (!isCommentJson(value)) {
    return null;
  }

  const commentJson: CommentJson = {};

  if (isJsonObject(value.comment) && typeof value.comment.message === 'string') {
    commentJson.comment = { message: value.comment.message };
  }

  const modellingAndValidation = toCommentModellingAndValidation(value.modellingAndValidation);
  if (modellingAndValidation) {
    commentJson.modellingAndValidation = modellingAndValidation;
  }

  return Object.keys(commentJson).length > 0 ? commentJson : null;
};

export const mapCommentRow = (row: CommentRow): CommentTable => ({
  ...row,
  json: toCommentJson(row.json),
});

export const mapCommentRows = (rows: CommentRow[] | null | undefined): CommentTable[] =>
  (rows ?? []).map(mapCommentRow);

export const mapCommentJsonRecord = (row: Pick<CommentRow, 'json'>): CommentJsonRecord => ({
  json: toCommentJson(row.json),
});

export const mapCommentJsonRecords = (
  rows: Pick<CommentRow, 'json'>[] | null | undefined,
): CommentJsonRecord[] => (rows ?? []).map(mapCommentJsonRecord);

export const getCommentMessage = (json: CommentJson | null | undefined): string | undefined =>
  typeof json?.comment?.message === 'string' ? json.comment.message : undefined;

export const getCommentReviews = (json: CommentJson | null | undefined): ProcessReviewItem[] =>
  jsonToList(json?.modellingAndValidation?.validation?.review);

export const getCommentCompliances = (
  json: CommentJson | null | undefined,
): ProcessComplianceItem[] =>
  jsonToList(json?.modellingAndValidation?.complianceDeclarations?.compliance);
