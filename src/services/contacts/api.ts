import schema from '@/pages/Contacts/contacts_schema.json';
import { FunctionRegion } from '@supabase/supabase-js';
import {
  classificationToString,
  genClassificationZH,
  getLangText,
  getRuleVerification,
  jsonToList,
} from '../general/util';

import { supabase } from '@/services/supabase';
import { SortOrder } from 'antd/lib/table/interface';
import { getDataDetail, getTeamIdByUserId } from '../general/api';
import { getILCDClassification } from '../ilcd/api';
import { genContactJsonOrdered } from './util';

export async function createContact(id: string, data: any) {
  const newData = genContactJsonOrdered(id, data);
  const rule_verification = getRuleVerification(schema, newData)?.valid;
  // const teamId = await getTeamIdByUserId();
  const result = await supabase
    .from('contacts')
    .insert([{ id: id, json_ordered: newData, rule_verification }])
    .select();
  return result;
}

export async function updateContact(id: string, version: string, data: any) {
  const newData = genContactJsonOrdered(id, data);
  const rule_verification = getRuleVerification(schema, newData)?.valid;
  let result: any = {};
  const session = await supabase.auth.getSession();
  if (session.data.session) {
    result = await supabase.functions.invoke('update_data', {
      headers: {
        Authorization: `Bearer ${session.data.session?.access_token ?? ''}`,
      },
      body: { id, version, table: 'contacts', data: { json_ordered: newData, rule_verification } },
      region: FunctionRegion.UsEast1,
    });
  }
  if (result.error) {
    console.log('error', result.error);
  }
  return result?.data;
}

export async function deleteContact(id: string, version: string) {
  const result = await supabase.from('contacts').delete().eq('id', id).eq('version', version);
  return result;
}

export async function getContactTableAll(
  params: {
    current?: number;
    pageSize?: number;
  },
  sort: Record<string, SortOrder>,
  lang: string,
  dataSource: string,
  tid: string | [],
  stateCode?: string | number,
) {
  const sortBy = Object.keys(sort)[0] ?? 'modified_at';
  const orderBy = sort[sortBy] ?? 'descend';

  const selectStr = `
    id,
    json->contactDataSet->contactInformation->dataSetInformation->"common:shortName",
    json->contactDataSet->contactInformation->dataSetInformation->"common:name",
    json->contactDataSet->contactInformation->dataSetInformation->classificationInformation->"common:classification"->"common:class",
    json->contactDataSet->contactInformation->dataSetInformation->>email,
    version,
    modified_at,
    team_id
  `;

  const tableName = 'contacts';

  let query = supabase
    .from(tableName)
    .select(selectStr, { count: 'exact' })
    .order(sortBy, { ascending: orderBy === 'ascend' })
    .range(
      ((params.current ?? 1) - 1) * (params.pageSize ?? 10),
      (params.current ?? 1) * (params.pageSize ?? 10) - 1,
    );

  if (dataSource === 'tg') {
    query = query.eq('state_code', 100);
    if (tid.length > 0) {
      query = query.eq('team_id', tid);
    }
  } else if (dataSource === 'co') {
    query = query.eq('state_code', 200);
    if (tid.length > 0) {
      query = query.eq('team_id', tid);
    }
  } else if (dataSource === 'my') {
    if (typeof stateCode === 'number') {
      query = query.eq('state_code', stateCode);
    }
    const session = await supabase.auth.getSession();
    if (session.data.session) {
      query = query.eq('user_id', session?.data?.session?.user?.id);
    } else {
      return Promise.resolve({
        data: [],
        success: false,
      });
    }
  } else if (dataSource === 'te') {
    const teamId = await getTeamIdByUserId();
    if (teamId) {
      query = query.eq('team_id', teamId);
    } else {
      return Promise.resolve({
        data: [],
        success: true,
      });
    }
  }

  const result = await query;

  if (result.error) {
    console.log('error', result.error);
  }

  if (result.data) {
    if (result.data.length === 0) {
      return Promise.resolve({
        data: [],
        success: true,
      });
    }

    let data: any[] = [];

    // const categories: string[] = Array.from(new Set(result.data.map((i: any) => {
    //   const l0 = jsonToList(i?.['common:class'])?.find((j: any) => j?.['@level'] === '0');
    //   return l0?.['#text'] ?? '';
    // })));

    await getILCDClassification('Contact', lang, ['all']).then((res) => {
      data = result.data.map((i: any) => {
        try {
          const classifications = jsonToList(i?.['common:class']);
          const classificationZH = genClassificationZH(classifications, res?.data);

          return {
            key: i.id + ':' + i.version,
            id: i.id,
            shortName: getLangText(i?.['common:shortName'], lang),
            name: getLangText(i?.['common:name'], lang),
            classification: classificationToString(classificationZH),
            email: i?.email ?? '-',
            version: i.version,
            modifiedAt: new Date(i?.modified_at),
            teamId: i?.team_id,
          };
        } catch (e) {
          console.error(e);
          return {
            id: i.id,
          };
        }
      });
    });

    return Promise.resolve({
      data: data,
      page: params.current ?? 1,
      success: true,
      total: result.count ?? 0,
    });
  }
  return Promise.resolve({
    data: [],
    success: false,
  });
}

export async function getContactTablePgroongaSearch(
  params: {
    current?: number;
    pageSize?: number;
  },
  // sort: Record<string, SortOrder>,
  lang: string,
  dataSource: string,
  queryText: string,
  filterCondition: any,
  stateCode?: string | number,
) {
  let result: any = {};
  const session = await supabase.auth.getSession();
  if (session.data.session) {
    result = await supabase.rpc(
      'pgroonga_search_contacts',
      typeof stateCode === 'number'
        ? {
            query_text: queryText,
            filter_condition: filterCondition,
            page_size: params.pageSize ?? 10,
            page_current: params.current ?? 1,
            data_source: dataSource,
            this_user_id: session.data.session.user?.id,
            state_code: stateCode,
          }
        : {
            query_text: queryText,
            filter_condition: filterCondition,
            page_size: params.pageSize ?? 10,
            page_current: params.current ?? 1,
            data_source: dataSource,
            this_user_id: session.data.session.user?.id,
          },
    );
  }
  if (result.error) {
    console.log('error', result.error);
  }
  if (result.data) {
    if (result.data.length === 0) {
      return Promise.resolve({
        data: [],
        success: true,
      });
    }

    const totalCount = result.data[0].total_count;

    let data: any[] = [];
    await getILCDClassification('Contact', lang, ['all']).then((res) => {
      data = result.data.map((i: any) => {
        try {
          const dataInfo = i.json?.contactDataSet?.contactInformation?.dataSetInformation;
          const classifications = jsonToList(
            dataInfo?.classificationInformation?.['common:classification']?.['common:class'],
          );
          const classificationZH = genClassificationZH(classifications, res?.data);
          return {
            key: i.id + ':' + i.version,
            id: i.id,
            shortName: getLangText(dataInfo?.['common:shortName'], lang),
            name: getLangText(dataInfo?.['common:name'], lang),
            classification: classificationToString(classificationZH),
            email: dataInfo?.email ?? '-',
            version: i.version,
            modifiedAt: new Date(i?.modified_at),
            teamId: i?.team_id,
          };
        } catch (e) {
          console.error(e);
          return {
            id: i.id,
          };
        }
      });
    });

    return Promise.resolve({
      data: data,
      page: params.current ?? 1,
      success: true,
      total: totalCount ?? 0,
    });
  }
  return result;
}

export async function contact_hybrid_search(
  params: {
    current?: number;
    pageSize?: number;
  },
  // sort: Record<string, SortOrder>,
  lang: string,
  dataSource: string,
  queryText: string,
  filterCondition: any,
  stateCode?: string | number,
) {
  let result: any = {};
  const session = await supabase.auth.getSession();
  if (session.data.session) {
    result = await supabase.functions.invoke('contact_hybrid_search', {
      headers: {
        Authorization: `Bearer ${session.data.session?.access_token ?? ''}`,
      },
      body:
        typeof stateCode === 'number'
          ? { query: queryText, filter: filterCondition, state_code: stateCode }
          : { query: queryText, filter: filterCondition },
      region: FunctionRegion.UsEast1,
    });
  }
  if (result.error) {
    console.log('error', result.error);
  }
  if (result.data?.data) {
    if (result.data.data.length === 0) {
      return Promise.resolve({
        data: [],
        success: true,
      });
    }
    const resultData = result.data.data;
    const totalCount = resultData.total_count;

    let data: any[] = [];
    await getILCDClassification('Contact', lang, ['all']).then((res) => {
      data = resultData.map((i: any) => {
        try {
          const dataInfo = i.json?.contactDataSet?.contactInformation?.dataSetInformation;
          const classifications = jsonToList(
            dataInfo?.classificationInformation?.['common:classification']?.['common:class'],
          );
          const classificationZH = genClassificationZH(classifications, res?.data);
          return {
            key: i.id + ':' + i.version,
            id: i.id,
            shortName: getLangText(dataInfo?.['common:shortName'], lang),
            name: getLangText(dataInfo?.['common:name'], lang),
            classification: classificationToString(classificationZH),
            email: dataInfo?.email ?? '-',
            version: i.version,
            modifiedAt: new Date(i?.modified_at),
            teamId: i?.team_id,
          };
        } catch (e) {
          console.error(e);
          return {
            id: i.id,
          };
        }
      });
    });

    return Promise.resolve({
      data: data,
      page: params.current ?? 1,
      success: true,
      total: totalCount ?? 0,
    });
  }
  return result;
}

export async function getContactDetail(id: string, version: string) {
  return getDataDetail(id, version, 'contacts');
}
