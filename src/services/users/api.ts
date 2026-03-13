import { getCurrentUser } from '@/services/auth';
import { supabase } from '@/services/supabase';
import { FunctionRegion } from '@supabase/supabase-js';
import type { FunctionInvokeResult, JsonObject } from '../general/data';

export type UserContactInfo = JsonObject;

export type UserMetadata = {
  email?: string;
  display_name?: string;
  [key: string]: unknown;
};

export type UserSummary = {
  id: string;
  email?: string;
  display_name?: string;
};

export type UserEmailLookup = {
  id: string;
  email?: string;
};

export type UserDetailRecord = UserSummary & {
  raw_user_meta_data?: UserMetadata;
  contact?: UserContactInfo | null;
};

type UserInfoByEmailResult =
  | {
      user: UserDetailRecord;
      contact: UserContactInfo | null;
      success: true;
    }
  | {
      user: null;
      contact: null;
      success: false;
      error: unknown;
    };

export async function getUsersByIds(userIds: string[]): Promise<UserSummary[] | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, raw_user_meta_data->email,raw_user_meta_data->display_name')
      .in('id', userIds);
    if (error) {
      throw error;
    }
    return (data ?? []) as UserSummary[];
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function getUserIdByEmail(email: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('raw_user_meta_data->>email', email)
      .single();
    if (error) {
      throw error;
    }
    return data?.id;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function getUserEmailByUserIds(userIds: string[]) {
  const result = await supabase
    .from('users')
    .select('id,raw_user_meta_data->email')
    .in('id', userIds);
  return (result.data ?? []) as UserEmailLookup[];
}

export async function getUserId() {
  const user = await getCurrentUser();
  return user?.userid ?? '';
}

export async function getUserInfoByEmail(email: string): Promise<UserInfoByEmailResult> {
  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, raw_user_meta_data, contact')
      .eq('raw_user_meta_data->>email', email)
      .single();

    if (userError) {
      throw userError;
    }

    return {
      user: userData as UserDetailRecord,
      contact: (userData.contact as UserContactInfo | null) || null,
      success: true,
    };
  } catch (error) {
    console.log(error);
    return {
      user: null,
      contact: null,
      success: false,
      error,
    };
  }
}

export async function updateUserContact(
  userId: string,
  contactInfo: UserContactInfo,
): Promise<FunctionInvokeResult> {
  let result: FunctionInvokeResult = {};
  const session = await supabase.auth.getSession();
  if (session.data.session) {
    result = await supabase.functions.invoke('update_user', {
      headers: {
        Authorization: `Bearer ${session.data.session?.access_token ?? ''}`,
      },
      body: { userId, data: { contact: contactInfo } },
      region: FunctionRegion.UsEast1,
    });
  }
  return result;
}

export async function getUserDetail() {
  const id = await getUserId();
  const result = await supabase.from('users').select('contact').eq('id', id).single();
  return result;
}
