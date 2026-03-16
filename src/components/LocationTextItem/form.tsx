import { getILCDLocationAll } from '@/services/ilcd/api';
import { Form, Select, Space } from 'antd';
import type { NamePath, Rule } from 'rc-field-form/lib/interface';
import { FC, ReactNode, useEffect, useState } from 'react';
import RequiredMark from '../RequiredMark';

type IlcdLocationItem = {
  '@value'?: string;
  '#text'?: string;
};

type IlcdLocationRow = {
  location?: IlcdLocationItem[];
};

type LocationOption = {
  label: string;
  value: string;
};

type Props = {
  name: NamePath;
  label: ReactNode | string;
  lang: string;
  onData: () => void;
  rules?: Rule[];
  showRequiredLable?: boolean;
};

const LocationTextItemForm: FC<Props> = ({
  name,
  label,
  lang,
  onData,
  rules,
  showRequiredLable = false,
}) => {
  const [locationData, setLocationData] = useState<LocationOption[]>([]);

  const handleLChange = async () => {
    onData();
  };

  useEffect(() => {
    getILCDLocationAll(lang).then((res) => {
      if (res.success) {
        const data = ((res.data ?? []) as IlcdLocationRow[])[0]?.location ?? [];
        setLocationData(
          data.map((location) => {
            if (location?.['@value'] === 'NULL') {
              return { label: '', value: 'NULL' };
            }
            return {
              label: `${location?.['@value'] ?? ''} (${location?.['#text'] ?? ''})`,
              value: location?.['@value'] ?? '',
            };
          }),
        );
      }
    });
  }, []);

  return (
    <Space direction='vertical' style={{ width: '100%' }}>
      <Form.Item
        required={false}
        label={showRequiredLable ? <RequiredMark label={label} showError={false} /> : label}
        name={name}
        rules={rules}
      >
        <Select
          showSearch
          // defaultValue={null} defaultValue报错
          onChange={handleLChange}
          options={locationData}
          filterOption={(input, option) =>
            typeof option?.label === 'string' &&
            option.label.toLowerCase().includes(input.toLowerCase())
          }
        />
      </Form.Item>
    </Space>
  );
};

export default LocationTextItemForm;
