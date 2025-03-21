import { getFlowpropertyDetail, updateFlowproperties } from '@/services/flowproperties/api';
import styles from '@/style/custom.less';
import { CloseOutlined, FormOutlined } from '@ant-design/icons';
import { ActionType, ProForm, ProFormInstance } from '@ant-design/pro-components';

import {
  Button,
  Collapse,
  Drawer,
  // Select,
  Space,
  Spin,
  // Spin,
  Tooltip,
  Typography,
  message,
} from 'antd';
import type { FC } from 'react';
import {
  useEffect,
  // useCallback, useEffect,
  useRef,
  useState,
} from 'react';
import { FormattedMessage, useIntl } from 'umi';

import { UpdateReferenceContext } from '@/contexts/updateReferenceContext';
import { genFlowpropertyFromData } from '@/services/flowproperties/util';

import { FlowpropertyForm } from './form';
type Props = {
  id: string;
  version: string;
  buttonType: string;
  actionRef?: React.MutableRefObject<ActionType | undefined>;
  lang: string;
};
const FlowpropertiesEdit: FC<Props> = ({ id, version, buttonType, actionRef, lang }) => {
  const formRefEdit = useRef<ProFormInstance>();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [activeTabKey, setActiveTabKey] = useState<string>('flowPropertiesInformation');
  const [fromData, setFromData] = useState<any>({});
  const [initData, setInitData] = useState<any>({});
  const [spinning, setSpinning] = useState(false);
  const intl = useIntl();

  const [referenceValue, setReferenceValue] = useState(0);

  const updateReference = async () => {
    setReferenceValue(referenceValue + 1);
  };
  const onTabChange = (key: string) => {
    setActiveTabKey(key);
  };

  const handletFromData = () => {
    if (fromData?.id)
      setFromData({
        ...fromData,
        [activeTabKey]: formRefEdit.current?.getFieldsValue()?.[activeTabKey] ?? {},
      });
  };

  const onEdit = () => {
    setDrawerVisible(true);
  };

  const onReset = () => {
    setSpinning(true);
    formRefEdit.current?.resetFields();
    getFlowpropertyDetail(id, version).then(async (result: any) => {
      const fromData0 = await genFlowpropertyFromData(result.data?.json?.flowPropertyDataSet ?? {});
      setInitData({
        ...fromData0,
        id: id,
      });
      formRefEdit.current?.setFieldsValue({
        ...fromData0,
        id: id,
      });
      setFromData({
        ...fromData0,
        id: id,
      });

      setSpinning(false);
    });
  };

  useEffect(() => {
    if (!drawerVisible) return;
    onReset();
  }, [drawerVisible]);

  return (
    <>
      <Tooltip title={<FormattedMessage id={'pages.button.edit'} defaultMessage={'Edit'} />}>
        {buttonType === 'icon' ? (
          <Button shape='circle' icon={<FormOutlined />} size='small' onClick={onEdit} />
        ) : (
          <Button onClick={onEdit}>
            <FormattedMessage
              id={buttonType ? buttonType : 'pages.button.edit'}
              defaultMessage='Edit'
            />
          </Button>
        )}
      </Tooltip>
      <Drawer
        getContainer={() => document.body}
        title={
          <FormattedMessage
            id='pages.flowproperty.drawer.title.edit'
            defaultMessage='Edit Flow property'
          />
        }
        width='90%'
        closable={false}
        extra={
          <Button
            icon={<CloseOutlined />}
            style={{ border: 0 }}
            onClick={() => setDrawerVisible(false)}
          />
        }
        maskClosable={false}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        footer={
          <Space size={'middle'} className={styles.footer_right}>
            <Button
              onClick={() => {
                updateReference();
              }}
            >
              <FormattedMessage
                id='pages.button.updateReference'
                defaultMessage='Update reference'
              />
            </Button>
            <Button onClick={() => setDrawerVisible(false)}>
              {' '}
              <FormattedMessage id='pages.button.cancel' defaultMessage='Cancel' />
            </Button>
            <Button onClick={onReset}>
              {' '}
              <FormattedMessage id='pages.button.reset' defaultMessage='Reset' />
            </Button>
            <Button onClick={() => formRefEdit.current?.submit()} type='primary'>
              <FormattedMessage id='pages.button.save' defaultMessage='Save' />
            </Button>
          </Space>
        }
      >
        <Spin spinning={spinning}>
          <UpdateReferenceContext.Provider value={{ referenceValue }}>
            <ProForm
              formRef={formRefEdit}
              initialValues={initData}
              submitter={{
                render: () => {
                  return [];
                },
              }}
              onFinish={async () => {
                const updateResult = await updateFlowproperties(id, version, fromData);
                if (updateResult?.data) {
                  message.success(
                    intl.formatMessage({
                      id: 'pages.flowproperty.editsuccess',
                      defaultMessage: 'Edit flowproperties successfully!',
                    }),
                  );
                  setDrawerVisible(false);
                  // setViewDrawerVisible(false);
                  setActiveTabKey('flowPropertiesInformation');
                  actionRef?.current?.reload();
                } else {
                  message.error(updateResult?.error?.message);
                }
                return true;
              }}
              onValuesChange={(_, allValues) => {
                setFromData({ ...fromData, [activeTabKey]: allValues[activeTabKey] ?? {} });
              }}
            >
              <FlowpropertyForm
                lang={lang}
                activeTabKey={activeTabKey}
                drawerVisible={drawerVisible}
                formRef={formRefEdit}
                onData={handletFromData}
                onTabChange={onTabChange}
              />
            </ProForm>
          </UpdateReferenceContext.Provider>
          <Collapse
            items={[
              {
                key: '1',
                label: 'JSON Data',
                children: (
                  <Typography>
                    <pre>{JSON.stringify(fromData, null, 2)}</pre>
                  </Typography>
                ),
              },
            ]}
          />
        </Spin>
      </Drawer>
    </>
  );
};

export default FlowpropertiesEdit;
