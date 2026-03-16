import type { LangTextEntry } from '@/services/general/data';
import { langOptions } from '@/services/general/data';
import { CloseOutlined } from '@ant-design/icons';
import type { FormInstance } from 'antd';
import { Button, Col, Form, Input, Row, Select, message } from 'antd';
import type { NamePath, Rule } from 'rc-field-form/lib/interface';
import { FC, ReactNode, useRef, type MutableRefObject } from 'react';
import { FormattedMessage, useIntl } from 'umi';

const { TextArea } = Input;

type FormListEntry = Record<PropertyKey, LangTextEntry[] | undefined>;
type FormValueReader = Pick<FormInstance, 'getFieldValue'>;
type FormValueReaderRef = MutableRefObject<FormValueReader | undefined>;

const isLangTextFieldValue = (value: unknown): value is LangTextEntry =>
  typeof value === 'object' && value !== null;

type Props = {
  name: NamePath;
  label: ReactNode | string;
  rules?: Rule[];
  setRuleErrorState?: (showError: boolean) => void;
  formRef?: FormValueReaderRef;
  listName?: Array<string | number>;
};

const LangTextItemForm: FC<Props> = ({
  name,
  label,
  rules = [],
  setRuleErrorState,
  formRef,
  listName,
}) => {
  const intl = useIntl();
  const isRequired = rules?.some(
    (rule) => typeof rule === 'object' && rule !== null && 'required' in rule && !!rule.required,
  );
  const initialRenderRef = useRef(true);

  const formContext = Form.useFormInstance();
  const form: FormValueReader | undefined = formRef?.current ?? formContext;
  const namePath = Array.isArray(name) ? name : [name];

  let formValues: LangTextEntry[] = [];
  if (listName) {
    const listValues = (form?.getFieldValue([...listName]) as FormListEntry[] | undefined) ?? [];
    const fieldName = namePath[namePath.length - 1];
    if (fieldName !== undefined) {
      formValues = listValues[0]?.[fieldName] ?? [];
    }
  } else {
    formValues = (form?.getFieldValue(name) as LangTextEntry[] | undefined) ?? [];
  }

  const selectedLangValues = (formValues ?? [])
    .filter(
      (item): item is LangTextEntry & { '@xml:lang': string } =>
        isLangTextFieldValue(item) && typeof item['@xml:lang'] === 'string',
    )
    .map((item) => item['@xml:lang']);

  return (
    <Form.Item>
      <Form.List
        name={name}
        rules={
          isRequired
            ? [
                {
                  // When adding or deleting items, check whether the language meets the requirements
                  validator: async (_, value?: LangTextEntry[]) => {
                    const lists = (value ?? []).filter(
                      (item): item is LangTextEntry & { '@xml:lang': string } =>
                        isLangTextFieldValue(item) && typeof item['@xml:lang'] === 'string',
                    );
                    const langs = lists.map((item) => item['@xml:lang']);
                    const enIndex = langs.indexOf('en');
                    if (langs && langs.length && enIndex === -1) {
                      if (setRuleErrorState) {
                        setRuleErrorState(true);
                      } else {
                        message.error(
                          intl.formatMessage({
                            id: 'validator.lang.mustBeEnglish',
                            defaultMessage: 'English is a required language!',
                          }),
                        );
                      }
                      return Promise.reject(new Error());
                    }
                    if (setRuleErrorState) setRuleErrorState(false);
                    return Promise.resolve();
                  },
                },
              ]
            : []
        }
      >
        {(subFields, subOpt) => {
          if (isRequired && subFields.length === 0 && initialRenderRef.current) {
            initialRenderRef.current = false;
            requestAnimationFrame(() => {
              subOpt.add();
            });
          }

          return (
            <div style={{ display: 'flex', flexDirection: 'column', rowGap: 16 }}>
              {subFields.map((subField) => {
                const currentLang = formValues?.[subField.name]?.['@xml:lang'];

                const optionsWithDisabled = langOptions.map((option) => ({
                  ...option,
                  disabled:
                    selectedLangValues.includes(option.value) && option.value !== currentLang,
                }));

                return (
                  <Row key={subField.key} gutter={[10, 0]} align='top'>
                    <Col flex='180px'>
                      <Form.Item
                        name={[subField.name, '@xml:lang']}
                        rules={
                          isRequired
                            ? [
                                {
                                  required: true,
                                  message: (
                                    <FormattedMessage
                                      id='validator.lang.select'
                                      defaultMessage='Please select a language!'
                                    />
                                  ),
                                },
                                {
                                  validator: async (_, value) => {
                                    if (value === 'en' && setRuleErrorState) {
                                      setRuleErrorState(false);
                                    }
                                    return Promise.resolve();
                                  },
                                },
                              ]
                            : []
                        }
                        style={{ marginBottom: 0 }}
                      >
                        <Select
                          placeholder={
                            <FormattedMessage
                              id='pages.lang.select'
                              defaultMessage='Select a lang'
                            />
                          }
                          optionFilterProp='lang'
                          options={optionsWithDisabled}
                        />
                      </Form.Item>
                    </Col>
                    <Col flex='auto'>
                      <Form.Item
                        name={[subField.name, '#text']}
                        rules={rules}
                        style={{ marginBottom: 0 }}
                      >
                        <TextArea rows={1} />
                      </Form.Item>
                    </Col>
                    <Col flex='20px' style={{ paddingTop: '8px' }}>
                      <CloseOutlined
                        style={{
                          cursor: isRequired && subFields.length === 1 ? 'not-allowed' : 'pointer',
                        }}
                        onClick={() => {
                          if (isRequired && subFields.length === 1) {
                            return;
                          }
                          subOpt.remove(subField.name);
                        }}
                      />
                    </Col>
                  </Row>
                );
              })}
              <Button type='dashed' onClick={() => subOpt.add()} block style={{ marginTop: '8px' }}>
                + <FormattedMessage id='pages.button.item.add' defaultMessage='Add' /> {label}{' '}
                <FormattedMessage id='pages.button.item.label' defaultMessage='Item' />
              </Button>
            </div>
          );
        }}
      </Form.List>
    </Form.Item>
  );
};

export default LangTextItemForm;
