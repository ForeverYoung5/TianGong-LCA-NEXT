import type { LangTextEntry } from '@/services/general/data';
import { getLangList } from '@/services/general/util';
import { Descriptions } from 'antd';
import type { FC } from 'react';

type Props = {
  data: unknown;
};

const LangTextItemDescription: FC<Props> = ({ data }) => {
  if (!data || getLangList(data).length === 0) {
    return (
      <Descriptions bordered size={'small'} column={1}>
        <Descriptions.Item key={0} labelStyle={{ display: 'none' }}>
          -
        </Descriptions.Item>
      </Descriptions>
    );
  }
  const items = getLangList(data) as Array<LangTextEntry | string | null | undefined>;
  return (
    <Descriptions bordered size={'small'} column={1}>
      {items.map((name, index) => (
        <Descriptions.Item
          key={index}
          label={
            (typeof name === 'object' ? name?.['@xml:lang'] : undefined) === 'en'
              ? 'English'
              : (typeof name === 'object' ? name?.['@xml:lang'] : undefined) === 'zh'
                ? '简体中文'
                : '-'
          }
          labelStyle={{ width: '100px' }}
        >
          {typeof name === 'string'
            ? name
            : typeof name?.['#text'] === 'string'
              ? name['#text']
              : '-'}
        </Descriptions.Item>
      ))}
    </Descriptions>
  );
};

export default LangTextItemDescription;
