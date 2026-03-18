import { supabase } from '@/services/supabase';
import { addTeam } from '@/services/teams/api';
import { getUserId, getUserIdByEmail, getUsersByIds } from '@/services/users/api';
import { FunctionRegion } from '@supabase/supabase-js';
import { SortOrder } from 'antd/lib/table/interface';
import { getUserManageComments } from '../comments/api';
import type { FunctionInvokeResult, PaginationParams } from '../general/data';
import type { TeamJson } from '../teams/data';

const SYSTEM_TEAM_ID = '00000000-0000-0000-0000-000000000000';

export type RoleType =
  | 'admin'
  | 'owner'
  | 'member'
  | 'is_invited'
  | 'rejected'
  | 'review-admin'
  | 'review-member';

export type RoleRecord = {
  user_id: string;
  team_id: string;
  role: RoleType;
  modified_at?: string;
};

export type RoleUserTable = {
  user_id: string;
  role: RoleType;
  email: string;
  display_name?: string;
  team_id: string;
  pendingCount?: number;
  reviewedCount?: number;
};

type RoleTableSort = Record<string, SortOrder | null | undefined>;
type ReviewRole = Extract<RoleType, 'review-admin' | 'review-member'>;
type RoleMutationResult = {
  data?: unknown;
  error?: unknown;
  success?: boolean;
};

export async function getUserTeamId() {
  const session = await supabase.auth.getSession();
  const { data } = await supabase
    .from('roles')
    .select(
      `
      user_id,
      team_id,
      role
      `,
    )
    .eq('user_id', session?.data?.session?.user?.id)
    .neq('team_id', SYSTEM_TEAM_ID);

  return data?.[0]?.team_id;
}

export async function getTeamRoles(params: PaginationParams, sort: RoleTableSort, teamId: string) {
  const sortBy = Object.keys(sort)[0] ?? 'created_at';
  const orderBy = sort[sortBy] ?? 'descend';

  return await supabase
    .from('roles')
    .select(
      `
  user_id,
  team_id,
  role
  `,
    )
    .eq('team_id', teamId)
    .neq('team_id', SYSTEM_TEAM_ID)
    .order(sortBy, { ascending: orderBy === 'ascend' })
    .range(
      ((params.current ?? 1) - 1) * (params.pageSize ?? 10),
      (params.current ?? 1) * (params.pageSize ?? 10) - 1,
    );
}
export async function addRoleApi(userId: string, teamId: string, role: RoleType) {
  const { error } = await supabase.from('roles').insert({
    user_id: userId,
    role,
    team_id: teamId,
    modified_at: new Date().toISOString(),
  });
  return error;
}
export async function getRoleByuserId(userId: string) {
  return await supabase
    .from('roles')
    .select('*')
    .eq('user_id', userId)
    .neq('team_id', SYSTEM_TEAM_ID);
}

export async function getUserRoles() {
  const session = await supabase.auth.getSession();
  const result = await supabase
    .from('roles')
    .select(
      `
      user_id,
      team_id,
      role
      `,
    )
    .eq('user_id', session?.data?.session?.user?.id)
    .neq('team_id', SYSTEM_TEAM_ID);

  return Promise.resolve({
    data: result.data ?? [],
    success: true,
  });
}

export const getUserIdsByTeamIds = async (teamIds: string[]) => {
  const result = await supabase.from('roles').select('user_id,team_id,role').in('team_id', teamIds);
  return (result.data ?? []) as RoleRecord[];
};

export async function getTeamInvitationStatusApi(timeFilter: number = 3) {
  const userId = await getUserId();
  if (!userId?.length) {
    return {
      success: false,
      data: null,
    };
  } else {
    let query = supabase
      .from('roles')
      .select('*')
      .eq('user_id', userId)
      .neq('team_id', SYSTEM_TEAM_ID)
      .order('modified_at', { ascending: false });

    if (timeFilter > 0) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - timeFilter);
      query = query.gte('modified_at', cutoffDate.toISOString());
    }

    const { data: roleResult, error: roleError } = await query.maybeSingle();

    if (roleError) {
      return {
        success: false,
        data: null,
      };
    }
    return {
      success: true,
      data: roleResult,
    };
  }
}

export async function getTeamInvitationCountApi(timeFilter: number = 3, lastViewTime?: number) {
  const userId = await getUserId();
  if (!userId?.length) {
    return {
      success: false,
      data: [],
      total: 0,
    };
  }

  let query = supabase
    .from('roles')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .in('role', ['is_invited'])
    .neq('team_id', SYSTEM_TEAM_ID)
    .order('modified_at', { ascending: false });

  if (lastViewTime && lastViewTime > 0) {
    query = query.gt('modified_at', new Date(lastViewTime).toISOString());
  } else if (timeFilter > 0) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeFilter);
    query = query.gte('modified_at', cutoffDate.toISOString());
  }

  const { data: roleResult, error: roleError, count } = await query;

  if (roleError) {
    return {
      success: false,
      data: [],
      total: 0,
    };
  }
  return {
    success: true,
    data: roleResult ?? [],
    total: count ?? 0,
  };
}

export async function createTeamMessage(
  id: string,
  data: TeamJson,
  rank: number,
  is_public: boolean,
) {
  const session = await supabase.auth.getSession();
  await supabase
    .from('roles')
    .delete()
    .eq('user_id', session?.data?.session?.user?.id)
    .eq('role', 'rejected')
    .neq('team_id', SYSTEM_TEAM_ID);

  const error = await addTeam(id, data, rank, is_public);
  if (!error) {
    const roleError = await addRoleApi(session?.data?.session?.user?.id || '', id, 'owner');
    return roleError;
  }
  return error;
}

export async function updateRoleApi(
  teamId: string,
  userId: string,
  role: Extract<RoleType, 'admin' | 'member' | 'review-admin' | 'review-member'>,
): Promise<RoleMutationResult> {
  let result: FunctionInvokeResult<RoleMutationResult> = {};
  const session = await supabase.auth.getSession();
  if (session.data.session) {
    result = await supabase.functions.invoke('update_role', {
      headers: {
        Authorization: `Bearer ${session.data.session?.access_token ?? ''}`,
      },
      body: { teamId, userId, data: { role } },
      region: FunctionRegion.UsEast1,
    });
  }
  if (result.error) {
    console.log('error', result.error);
  }
  return result.data ?? {};
}

export async function delRoleApi(teamId: string, userId: string) {
  const result = await supabase.from('roles').delete().eq('team_id', teamId).eq('user_id', userId);
  return result;
}

export async function reInvitedApi(userId: string, teamId: string): Promise<unknown> {
  let result: FunctionInvokeResult<RoleMutationResult> = {};
  const session = await supabase.auth.getSession();
  if (session.data.session) {
    result = await supabase.functions.invoke('update_role', {
      headers: {
        Authorization: `Bearer ${session.data.session?.access_token ?? ''}`,
      },
      body: { teamId, userId, data: { role: 'is_invited' } },
      region: FunctionRegion.UsEast1,
    });
  }
  if (result.error) {
    console.log('error', result.error);
  }
  return result.data?.error;
}

export async function rejectTeamInvitationApi(teamId: string, userId: string) {
  let result: FunctionInvokeResult<RoleMutationResult> = {};
  const session = await supabase.auth.getSession();
  if (session.data.session) {
    result = await supabase.functions.invoke('update_role', {
      headers: {
        Authorization: `Bearer ${session.data.session?.access_token ?? ''}`,
      },
      body: { teamId, userId, data: { role: 'rejected' } },
      region: FunctionRegion.UsEast1,
    });
  }
  if (result.error) {
    console.log('error', result.error);
  }
  return {
    success: !result.error,
    error: result.data?.error,
  };
}

export async function acceptTeamInvitationApi(teamId: string, userId: string) {
  let result: FunctionInvokeResult<RoleMutationResult> = {};
  const session = await supabase.auth.getSession();
  if (session.data.session) {
    result = await supabase.functions.invoke('update_role', {
      headers: {
        Authorization: `Bearer ${session.data.session?.access_token ?? ''}`,
      },
      body: { teamId, userId, data: { role: 'member' } },
      region: FunctionRegion.UsEast1,
    });
  }
  if (result.error) {
    console.log('error', result.error);
  }
  const payload =
    result.data && typeof result.data === 'object' ? result.data : ({} as RoleMutationResult);
  return {
    success: !result.error,
    ...payload,
  };
}

// system api
export async function getSystemUserRoleApi() {
  try {
    const session = await supabase.auth.getSession();
    const { data, error } = await supabase
      .from('roles')
      .select('user_id,role')
      .eq('user_id', session?.data?.session?.user?.id)
      .eq('team_id', SYSTEM_TEAM_ID)
      .maybeSingle();

    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function getSystemMembersApi(params: PaginationParams, sort: RoleTableSort) {
  try {
    const sortBy = Object.keys(sort)[0] ?? 'created_at';
    const orderBy = sort[sortBy] ?? 'descend';

    let res: RoleUserTable[] = [];

    const { data, error, count } = await supabase
      .from('roles')
      .select('user_id,role', { count: 'exact' })
      .eq('team_id', SYSTEM_TEAM_ID)
      .in('role', ['admin', 'owner', 'member'])
      .order(sortBy, { ascending: orderBy === 'ascend' })
      .range(
        ((params.current ?? 1) - 1) * (params.pageSize ?? 10),
        (params.current ?? 1) * (params.pageSize ?? 10) - 1,
      );

    if (!error) {
      const roleData = (data ?? []) as RoleRecord[];
      const users = await getUsersByIds(roleData.map((item) => item.user_id));
      if (users) {
        res = roleData.map((roleItem) => {
          const user = users.find((user) => user.id === roleItem.user_id);
          return {
            user_id: roleItem.user_id,
            role: roleItem.role,
            email: user?.email ?? '',
            display_name: user?.display_name,
            team_id: SYSTEM_TEAM_ID,
          };
        });
      }
    }

    return {
      data: res || [],
      success: true,
      total: count || 0,
    };
  } catch (error) {
    console.log(error);
    return {
      data: [],
      total: 0,
      success: true,
    };
  }
}

export async function addSystemMemberApi(email: string) {
  try {
    const userId = await getUserIdByEmail(email);
    if (userId) {
      const addRoleError = await addRoleApi(userId, SYSTEM_TEAM_ID, 'member');
      if (addRoleError) {
        throw addRoleError;
      }
      return {
        success: true,
      };
    } else {
      return {
        success: false,
        error: 'notRegistered',
      };
    }
  } catch (error) {
    console.log(error);
    return {
      success: false,
    };
  }
}

// review api
export async function getReviewUserRoleApi() {
  try {
    const session = await supabase.auth.getSession();
    const { data, error } = await supabase
      .from('roles')
      .select('user_id,role')
      .eq('user_id', session?.data?.session?.user?.id)
      .eq('team_id', SYSTEM_TEAM_ID)
      .in('role', ['review-admin', 'review-member'])
      .maybeSingle();

    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function getUserManageTableData(
  params: PaginationParams,
  sort: RoleTableSort,
  role?: ReviewRole,
) {
  try {
    const sortBy = Object.keys(sort)[0] ?? 'created_at';
    const orderBy = sort[sortBy] ?? 'descend';

    let res: RoleUserTable[] = [];

    let query = supabase
      .from('roles')
      .select('user_id,role', { count: 'exact' })
      .eq('team_id', SYSTEM_TEAM_ID)
      .in('role', ['review-admin', 'review-member'])
      .order(sortBy, { ascending: orderBy === 'ascend' })
      .range(
        ((params.current ?? 1) - 1) * (params.pageSize ?? 10),
        (params.current ?? 1) * (params.pageSize ?? 10) - 1,
      );

    if (role) {
      query = query.eq('role', role);
    }

    const { data, error, count } = await query;

    if (!error) {
      const roleData = (data ?? []) as RoleRecord[];
      const users = await getUsersByIds(roleData.map((item) => item.user_id));
      if (users) {
        res = roleData.map((roleItem) => {
          const user = users.find((user) => user.id === roleItem.user_id);
          return {
            user_id: roleItem.user_id,
            role: roleItem.role,
            email: user?.email ?? '',
            display_name: user?.display_name,
            team_id: SYSTEM_TEAM_ID,
            pendingCount: 0,
            reviewedCount: 0,
          };
        });
      }
      const { data: comments } = await getUserManageComments();
      if (comments && comments.length) {
        comments.forEach((item) => {
          const userIndex = res.findIndex((user) => user.user_id === item.reviewer_id);
          if (userIndex !== -1) {
            res[userIndex].pendingCount =
              item.state_code === 0
                ? (res[userIndex].pendingCount ?? 0) + 1
                : res[userIndex].pendingCount;
            res[userIndex].reviewedCount =
              item.state_code === 1 || item.state_code === 2
                ? (res[userIndex].reviewedCount ?? 0) + 1
                : res[userIndex].reviewedCount;
          }
        });
      }
    }

    return {
      data: res || [],
      success: true,
      total: count || 0,
    };
  } catch (error) {
    return {
      data: [],
      total: 0,
      success: true,
    };
  }
}
export async function getReviewMembersApi(
  params: PaginationParams,
  sort: RoleTableSort,
  role?: ReviewRole,
) {
  try {
    const sortBy = Object.keys(sort)[0] ?? 'created_at';
    const orderBy = sort[sortBy] ?? 'descend';

    let res: RoleUserTable[] = [];

    let query = supabase
      .from('roles')
      .select('user_id,role', { count: 'exact' })
      .eq('team_id', SYSTEM_TEAM_ID)
      .in('role', ['review-admin', 'review-member'])
      .order(sortBy, { ascending: orderBy === 'ascend' })
      .range(
        ((params.current ?? 1) - 1) * (params.pageSize ?? 10),
        (params.current ?? 1) * (params.pageSize ?? 10) - 1,
      );

    if (role) {
      query = query.eq('role', role);
    }

    const { data, error, count } = await query;

    if (!error) {
      const roleData = (data ?? []) as RoleRecord[];
      const users = await getUsersByIds(roleData.map((item) => item.user_id));
      if (users) {
        res = roleData.map((roleItem) => {
          const user = users.find((user) => user.id === roleItem.user_id);
          return {
            user_id: roleItem.user_id,
            role: roleItem.role,
            email: user?.email ?? '',
            display_name: user?.display_name,
            team_id: SYSTEM_TEAM_ID,
          };
        });
      }
    }

    return {
      data: res || [],
      success: true,
      total: count || 0,
    };
  } catch (error) {
    return {
      data: [],
      total: 0,
      success: true,
    };
  }
}

export async function addReviewMemberApi(userId: string) {
  try {
    if (userId) {
      const addRoleError = await addRoleApi(userId, SYSTEM_TEAM_ID, 'review-member');
      return {
        success: !addRoleError,
        error: addRoleError,
      };
    }
  } catch (error) {
    console.log(error);
    return {
      success: false,
    };
  }
}

export async function getLatestRolesOfMine() {
  const userId = await getUserId();

  if (!userId) {
    return null;
  }

  const { data } = await supabase
    .from('roles')
    .select('*')
    .eq('user_id', userId)
    .in('role', ['admin', 'member', 'is_invited'])
    .order('modified_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return data;
}

export async function getRoleByUserId() {
  const userId = await getUserId();
  const { data } = await supabase.from('roles').select('team_id,role').eq('user_id', userId);
  return (data ?? []) as Array<Pick<RoleRecord, 'team_id' | 'role'>>;
}
