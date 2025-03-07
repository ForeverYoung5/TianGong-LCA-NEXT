import { langOptions } from '@/services/general/data';
import { CloseOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, Row, Select } from 'antd';
import { FC, ReactNode } from 'react';
import { FormattedMessage } from 'umi';

const { TextArea } = Input;

type Props = {
  name: any;
  label: ReactNode | string;
  rules?: any[];
};

const LangTextItemForm: FC<Props> = ({ name, label, rules }) => {
  return (
    <Form.Item>
      <Form.List name={name}>
        {(subFields, subOpt) => (
          <div style={{ display: 'flex', flexDirection: 'column', rowGap: 16 }}>
            {subFields.map((subField) => (
              <Row key={subField.key}>
                <Col flex="120px" style={{ marginRight: '10px' }}>
                  <Form.Item noStyle name={[subField.name, '@xml:lang']}>
                    <Select
                      placeholder={
                        <FormattedMessage id="pages.lang.select" defaultMessage="Select a lang" />
                      }
                      optionFilterProp="lang"
                      options={langOptions}
                    />
                  </Form.Item>
                </Col>
                <Col flex="auto" style={{ marginRight: '10px' }}>
                  <Form.Item noStyle name={[subField.name, '#text']} rules={rules ?? []}>
                    <TextArea rows={1} />
                  </Form.Item>
                </Col>
                <Col flex="20px">
                  <CloseOutlined
                    style={{ marginTop: '10px' }}
                    onClick={() => {
                      subOpt.remove(subField.name);
                    }}
                  />
                </Col>
              </Row>
            ))}
            <Button type="dashed" onClick={() => subOpt.add()} block>
              + <FormattedMessage id="pages.button.item.add" defaultMessage="Add" /> {label}{' '}
              <FormattedMessage id="pages.button.item.label" defaultMessage="Item" />
            </Button>
          </div>
        )}
      </Form.List>
    </Form.Item>
  );
};

export default LangTextItemForm;
