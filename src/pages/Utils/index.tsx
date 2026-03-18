import type { ProColumns, ProFormInstance } from '@ant-design/pro-components';
import type { Rule } from 'antd/lib/form';
import type { MutableRefObject } from 'react';
import { FormattedMessage } from 'umi';

type SchemaRule = {
  pattern?: RegExp | string;
  type?: string;
  messageKey?: string;
  defaultMessage?: string;
};

type FormRefValidator = Pick<ProFormInstance, 'validateFields'>;

export function getDataTitle(dataSource: string) {
  if (dataSource === 'my') {
    return <FormattedMessage id='menu.mydata' defaultMessage='My Data' />;
  } else if (dataSource === 'tg') {
    return <FormattedMessage id='menu.tgdata' defaultMessage='Open Data' />;
  } else if (dataSource === 'co') {
    return <FormattedMessage id='menu.codata' defaultMessage='Commercial Data' />;
  } else if (dataSource === 'te') {
    return <FormattedMessage id='menu.tedata' defaultMessage='Team Data' />;
  }
  return '';
}

export function getAllVersionsColumns(columns: ProColumns<any>[], versionIndex: number) {
  const newColumns = [...columns];
  newColumns[versionIndex] = {
    ...newColumns[versionIndex],
    render: undefined,
  };

  newColumns.pop();
  return newColumns;
}

const getRulePattern = (pattern?: SchemaRule['pattern']): RegExp | undefined => {
  if (pattern === 'dataSetVersion') {
    return /^\d{2}\.\d{2}\.\d{3}$/;
  }
  if (pattern === 'CASNumber') {
    return /^\d{2,7}-\d{2}-\d$/;
  }
  if (pattern === 'year') {
    return /^[0-9]{4}$/;
  }
  return pattern instanceof RegExp ? pattern : undefined;
};

export function getRules(rules: SchemaRule[]): Rule[] {
  return rules.map((rule) => {
    const { defaultMessage, messageKey, ...restRule } = rule;
    const result = {
      ...restRule,
      pattern: getRulePattern(rule.pattern),
      message: <FormattedMessage id={messageKey ?? ''} defaultMessage={defaultMessage} />,
    };
    return result as Rule;
  });
}

export const validateRefObjectId = (
  formRef: MutableRefObject<FormRefValidator | undefined>,
  name: Array<string | number>,
  parentName?: Array<string | number>,
) => {
  if (parentName) {
    formRef.current?.validateFields([[...parentName, ...name, '@refObjectId']]);
  } else {
    formRef.current?.validateFields([[...name, '@refObjectId']]);
  }
};

export const getLocalValueProps = (value: string) => ({
  value: value === 'en' ? 'English' : value === 'zh' ? '简体中文' : value,
});

export const getClassificationValues = (value: unknown): string[] | undefined => {
  if (!value || typeof value !== 'object') {
    return undefined;
  }
  if (!('value' in value)) {
    return undefined;
  }
  const raw = (value as { value?: unknown }).value;
  if (!Array.isArray(raw)) {
    return undefined;
  }
  return raw.filter((item): item is string => typeof item === 'string');
};
