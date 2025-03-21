import LangTextItemForm from '@/components/LangTextItem/form';
import ContactSelectForm from '@/pages/Contacts/Components/select/form';
import SourceSelectForm from '@/pages/Sources/Components/select/form';
import { CloseOutlined } from '@ant-design/icons';
import { ProFormInstance } from '@ant-design/pro-components';
import { Button, Card, Col, Divider, Form, Row, Select, Space } from 'antd';
import { FC } from 'react';
import { FormattedMessage } from 'umi';
import { reviewTypeOptions } from '../optiondata';
import DataQualityIndicatorItemForm from './DataQualityIndicator/form';
import ScopeItemForm from './Scope/form';

// const { TextArea } = Input;

type Props = {
  name: any;
  lang: string;
  formRef: React.MutableRefObject<ProFormInstance | undefined>;
  onData: () => void;
};

const ReveiwItemForm: FC<Props> = ({ name, lang, formRef, onData }) => {
  return (
    <Form.Item>
      <Form.List name={name}>
        {(subFields, subOpt) => (
          <div style={{ display: 'flex', flexDirection: 'column', rowGap: 16 }}>
            {subFields.map((subField) => (
              <Row key={subField.key}>
                <Space direction='vertical' style={{ width: '100%' }}>
                  <Card
                    size='small'
                    title={
                      <>
                        <FormattedMessage
                          id='pages.process.modellingAndValidation.validation.review'
                          defaultMessage='Review'
                        />{' '}
                        {` ${subField.key + 1}`}
                      </>
                    }
                    extra={
                      <CloseOutlined
                        style={{ marginTop: '10px' }}
                        onClick={() => {
                          subOpt.remove(subField.name);
                        }}
                      />
                    }
                  >
                    <Col flex='auto' style={{ marginRight: '10px' }}>
                      <Form.Item
                        label={
                          <FormattedMessage
                            id='pages.process.validation.modellingAndValidation.review.type'
                            defaultMessage='Type of review'
                          />
                        }
                        name={[subField.name, '@type']}
                      >
                        <Select options={reviewTypeOptions} />
                      </Form.Item>
                    </Col>
                    <Card
                      size='small'
                      title={
                        <FormattedMessage
                          id='pages.process.modellingAndValidation.validation.review.scope'
                          defaultMessage='Scope of review'
                        />
                      }
                    >
                      <ScopeItemForm name={[subField.name, 'common:scope']} />
                    </Card>
                    <br />
                    <Card
                      size='small'
                      title={
                        <FormattedMessage
                          id='pages.process.modellingAndValidation.validation.review.dataQualityIndicators'
                          defaultMessage='Data quality indicators'
                        />
                      }
                    >
                      <DataQualityIndicatorItemForm
                        name={[
                          subField.name,
                          'common:dataQualityIndicators',
                          'common:dataQualityIndicator',
                        ]}
                      />
                    </Card>
                    <Divider orientationMargin='0' orientation='left' plain>
                      <FormattedMessage
                        id='pages.process.view.modellingAndValidation.validation.reviewDetails'
                        defaultMessage='Review details'
                      />
                    </Divider>
                    <LangTextItemForm
                      name={[subField.name, 'common:reviewDetails']}
                      label={
                        <FormattedMessage
                          id='pages.process.view.modellingAndValidation.validation.reviewDetails'
                          defaultMessage='Review details'
                        />
                      }
                    />
                    <Divider orientationMargin='0' orientation='left' plain>
                      <FormattedMessage
                        id='pages.process.view.modellingAndValidation.validation.otherReviewDetails'
                        defaultMessage='Other review details'
                      />
                    </Divider>
                    <LangTextItemForm
                      name={[subField.name, 'common:otherReviewDetails']}
                      label={
                        <FormattedMessage
                          id='pages.process.view.modellingAndValidation.validation.otherReviewDetails'
                          defaultMessage='Other review details'
                        />
                      }
                    />
                    <ContactSelectForm
                      parentName={name}
                      name={[subField.name, 'common:referenceToNameOfReviewerAndInstitution']}
                      label={
                        <FormattedMessage
                          id='pages.process.view.modellingAndValidation.referenceToNameOfReviewerAndInstitution'
                          defaultMessage='Reviewer name and institution'
                        />
                      }
                      lang={lang}
                      formRef={formRef}
                      onData={onData}
                    />
                    <br />
                    <SourceSelectForm
                      parentName={name}
                      name={[subField.name, 'common:referenceToCompleteReviewReport']}
                      label={
                        <FormattedMessage
                          id='pages.process.view.modellingAndValidation.referenceToCompleteReviewReport'
                          defaultMessage='Complete review report'
                        />
                      }
                      lang={lang}
                      formRef={formRef}
                      onData={onData}
                    />
                  </Card>
                </Space>
              </Row>
            ))}
            <Button type='dashed' onClick={() => subOpt.add()} block>
              + <FormattedMessage id='pages.button.item.add' defaultMessage='Add' />{' '}
              <FormattedMessage id='pages.process.validation.review' defaultMessage='Review' />{' '}
              <FormattedMessage id='pages.button.item.label' defaultMessage='Item' />
            </Button>
          </div>
        )}
      </Form.List>
    </Form.Item>
  );
};

export default ReveiwItemForm;
