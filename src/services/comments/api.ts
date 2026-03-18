import { supabase } from '@/services/supabase';
import { getUserId } from '@/services/users/api';
import { FunctionRegion } from '@supabase/supabase-js';
import { SortOrder } from 'antd/lib/table/interface';
import type { FunctionInvokeResult } from '../general/data';
import type { ReviewCommentQueryResult } from '../reviews/data';
import type {
  CommentActionType,
  CommentInsertPayload,
  CommentJsonRecord,
  CommentMutationResult,
  CommentReviewerState,
  CommentUpdatePayload,
  UserManageCommentSummary,
} from './data';
import { mapCommentJsonRecords, mapCommentRows } from './data';

type ServiceQueryResult<T> = {
  data: T | null;
  error: unknown;
  count?: number | null;
  status?: number;
  statusText?: string;
};

export async function addCommentApi(data: CommentInsertPayload | CommentInsertPayload[]) {
  const { error } = await supabase.from('comments').upsert(data).select();
  return { error };
}

export async function updateCommentByreviewerApi(
  reviewId: string,
  reviewerId: string,
  data: CommentUpdatePayload,
) {
  const { error } = await supabase
    .from('comments')
    .update(data)
    .eq('reviewer_id', reviewerId)
    .eq('review_id', reviewId);
  return { error };
}

export async function updateCommentApi(
  reviewId: string,
  data: CommentUpdatePayload,
  tabType: CommentActionType,
) {
  let result: FunctionInvokeResult<CommentMutationResult> = {};
  const session = await supabase.auth.getSession();
  if (session.data.session) {
    result = await supabase.functions.invoke('update_comment', {
      headers: {
        Authorization: `Bearer ${session.data.session?.access_token ?? ''}`,
      },
      body: { id: reviewId, data, tabType },
      region: FunctionRegion.UsEast1,
    });
  }
  if (result.error) {
    console.log('error', result.error);
  }
  return result?.data;
}

export async function getCommentApi(reviewId: string, actionType: CommentActionType) {
  if (['review', 'reviewer-rejected', 'admin-rejected'].includes(actionType)) {
    const userId = await getUserId();

    if (!userId) {
      return { error: true, data: [] };
    }
    let query = supabase.from('comments').select('*').eq('review_id', reviewId);

    if (actionType === 'admin-rejected') {
      const { data, error } = await query;
      return {
        data: data ? mapCommentRows(data) : data,
        error,
      };
    }
    if (actionType === 'review' || actionType === 'reviewer-rejected') {
      query = query.eq('reviewer_id', userId);
      const { data, error } = await query;
      return {
        data: data ? mapCommentRows(data) : data,
        error,
      };
    }
  }
  if (actionType === 'assigned') {
    const { data, error } = await supabase.from('comments').select('*').eq('review_id', reviewId);
    return {
      data: data ? mapCommentRows(data) : data,
      error,
    };
  }
  return { data: [], error: true };
}

export async function getReviewedComment(
  params: {
    current?: number;
    pageSize?: number;
  } = {},
  sort: Record<string, SortOrder> = {},
  user_id?: string,
): Promise<ReviewCommentQueryResult> {
  const normalizedSort = sort ?? {};
  const sortBy = Object.keys(normalizedSort)[0] ?? 'modified_at';
  const orderBy = normalizedSort[sortBy] ?? 'descend';

  const userId = user_id ?? (await getUserId());

  if (!userId) {
    return { error: true, data: [] };
  }

  const pageSize = params.pageSize ?? 10;
  const currentPage = params.current ?? 1;

  const result = await supabase
    .from('comments')
    .select('review_id, reviews!inner(*)', { count: 'exact' })
    .eq('reviewer_id', userId)
    .in('state_code', [1, 2, -3])
    .filter('reviews.state_code', 'gt', 0)
    .order(sortBy, { ascending: orderBy === 'ascend' })
    .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);
  return result;
}

export async function getPendingComment(
  params: {
    current?: number;
    pageSize?: number;
  } = {},
  sort: Record<string, SortOrder> = {},
  user_id?: string,
): Promise<ReviewCommentQueryResult> {
  const normalizedSort = sort ?? {};
  const sortBy = Object.keys(normalizedSort)[0] ?? 'modified_at';
  const orderBy = normalizedSort[sortBy] ?? 'descend';
  const userId = user_id ?? (await getUserId());

  if (!userId) {
    return { error: true, data: [] };
  }

  const pageSize = params.pageSize ?? 10;
  const currentPage = params.current ?? 1;

  const result = await supabase
    .from('comments')
    .select('review_id, reviews!inner(*)', { count: 'exact' })
    .eq('reviewer_id', userId)
    .eq('state_code', 0)
    .filter('reviews.state_code', 'gt', 0)
    .order(sortBy, { ascending: orderBy === 'ascend' })
    .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);
  return result;
}

export async function getRejectedComment(
  params: {
    current?: number;
    pageSize?: number;
  } = {},
  sort: Record<string, SortOrder> = {},
  user_id?: string,
): Promise<ReviewCommentQueryResult> {
  const normalizedSort = sort ?? {};
  const sortBy = Object.keys(normalizedSort)[0] ?? 'modified_at';
  const orderBy = normalizedSort[sortBy] ?? 'descend';
  const userId = user_id ?? (await getUserId());

  if (!userId) {
    return { error: true, data: [] };
  }

  const pageSize = params.pageSize ?? 10;
  const currentPage = params.current ?? 1;

  const result = await supabase
    .from('comments')
    .select('review_id, reviews!inner(*)', { count: 'exact' })
    .eq('reviewer_id', userId)
    .eq('state_code', -1)
    .eq('reviews.state_code', -1)
    .order(sortBy, { ascending: orderBy === 'ascend' })
    .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);
  return result;
}

export async function getUserManageComments(): Promise<
  ServiceQueryResult<UserManageCommentSummary[]>
> {
  const result = await supabase
    .from('comments')
    .select('review_id,state_code,reviewer_id,reviews!inner(state_code)')
    .in('state_code', [0, 1, 2])
    .filter('reviews.state_code', 'gt', 0);
  return result;
}

export async function getReviewerIdsByReviewId(
  reviewId: string,
): Promise<CommentReviewerState[] | null> {
  const { data } = await supabase
    .from('comments')
    .select('state_code,reviewer_id')
    .eq('review_id', reviewId);
  return data;
}

export async function getRejectedCommentsByReviewIds(
  reviewIds: string[],
): Promise<ServiceQueryResult<CommentJsonRecord[]>> {
  const result = await supabase
    .from('comments')
    .select('json')
    .in('review_id', reviewIds)
    .eq('state_code', -1);
  return {
    ...result,
    data: result.data ? mapCommentJsonRecords(result.data) : result.data,
  };
}
