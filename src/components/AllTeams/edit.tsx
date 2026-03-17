import { FileType, isImage, removeLogoApi, uploadLogoApi } from '@/services/supabase/storage';
import { editTeamMessage, getTeamMessageApi } from '@/services/teams/api';
import type { TeamJson, TeamTable } from '@/services/teams/data';
import styles from '@/style/custom.less';
import { CloseOutlined, FormOutlined } from '@ant-design/icons';
import { ActionType, ProForm, ProFormInstance } from '@ant-design/pro-components';
import { Button, Drawer, Space, Spin, Tooltip, message } from 'antd';
import type { FC } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'umi';
import TeamForm, { type TeamLogoChange } from './form';

type Props = {
  id: string;
  buttonType: string;
  actionRef: React.MutableRefObject<ActionType | undefined>;
  setViewDrawerVisible?: React.Dispatch<React.SetStateAction<boolean>>;
  disabled?: boolean;
};

type TeamLogoSelection = FileType[] | string | null | undefined;
type TeamEditFormValues = TeamJson;
const EMPTY_TEAM_FORM_VALUES: TeamEditFormValues = {};

const TeamEdit: FC<Props> = ({
  id,
  buttonType,
  actionRef,
  setViewDrawerVisible,
  disabled = false,
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const formRefEdit = useRef<ProFormInstance>();
  const [spinning, setSpinning] = useState(false);
  const [initData, setInitData] = useState<TeamTable | null>(null);
  const [hasLoadedData, setHasLoadedData] = useState(false);
  const [lightLogo, setLightLogo] = useState<TeamLogoSelection>(undefined);
  const [darkLogo, setDarkLogo] = useState<TeamLogoSelection>(undefined);

  const [beforeLightLogoPath, setBeforeLightLogoPath] = useState('');
  const [beforeDarkLogoPath, setBeforeDarkLogoPath] = useState('');
  const intl = useIntl();

  const onEdit = useCallback(() => {
    setHasLoadedData(false);
    setDrawerVisible(true);
  }, []);

  const handletLogoChange = (data: TeamLogoChange) => {
    if (hasLoadedData) {
      setLightLogo(data.lightLogo);
      setDarkLogo(data.darkLogo);
    }
  };
  const handleRemoveLogo = async (type: 'lightLogo' | 'darkLogo') => {
    if (type === 'lightLogo') {
      setLightLogo([]);
      if (beforeLightLogoPath) {
        await removeLogoApi([beforeLightLogoPath]);
      }
    } else {
      setDarkLogo([]);
      if (beforeDarkLogoPath) {
        await removeLogoApi([beforeDarkLogoPath]);
      }
    }
  };
  const uploadLogo = async (fileList: FileType[], type: 'lightLogo' | 'darkLogo') => {
    if (fileList.length > 0) {
      const file = fileList[0];
      if (file) {
        if (!isImage(file)) {
          message.error(
            intl.formatMessage({
              id: 'teams.logo.typeError',
              defaultMessage: 'Only image files can be uploaded!',
            }),
          );
          if (type === 'lightLogo') {
            setLightLogo([]);
          } else {
            setDarkLogo([]);
          }
          return;
        }

        try {
          const suffix: string = file.name.split('.').pop() || '';
          const { data } = await uploadLogoApi(file.name, file, suffix);
          if (type === 'lightLogo') {
            setBeforeLightLogoPath(data?.path);
            return data.path;
          } else {
            setBeforeDarkLogoPath(data?.path);
            return data.path;
          }
        } catch (error) {
          console.log('upload error', error);
        }
      }
    }
  };
  const resolveLogoValue = async (logo: TeamLogoSelection, type: 'lightLogo' | 'darkLogo') => {
    if (!logo || (Array.isArray(logo) && logo.length === 0)) {
      await handleRemoveLogo(type);
      return null;
    }

    if (typeof logo === 'string') {
      return logo;
    }

    const logoPath = await uploadLogo(logo, type);
    return logoPath ? `../sys-files/${logoPath}` : null;
  };
  const onReset = async () => {
    setSpinning(true);
    formRefEdit.current?.resetFields();
    const result = await getTeamMessageApi(id);
    if (result.data && result.data.length > 0) {
      const teamData = result.data[0];
      setInitData(teamData);
      const formValues = {
        title: teamData.json?.title || [
          { '#text': '', '@xml:lang': 'zh' },
          { '#text': '', '@xml:lang': 'en' },
        ],
        description: teamData.json?.description || [
          { '#text': '', '@xml:lang': 'zh' },
          { '#text': '', '@xml:lang': 'en' },
        ],
        lightLogo: teamData.json?.lightLogo,
        darkLogo: teamData.json?.darkLogo,
      };
      setLightLogo(teamData.json?.lightLogo ?? undefined);
      setDarkLogo(teamData.json?.darkLogo ?? undefined);

      formRefEdit.current?.setFieldsValue({ ...formValues });
      setHasLoadedData(true);
    }
    setSpinning(false);
  };

  useEffect(() => {
    if (!drawerVisible) return;
    onReset();
  }, [drawerVisible]);

  return (
    <>
      {buttonType === 'icon' ? (
        <Tooltip title={<FormattedMessage id='pages.button.edit' defaultMessage='Edit' />}>
          <Button
            disabled={disabled}
            shape='circle'
            icon={<FormOutlined />}
            size='small'
            onClick={onEdit}
          />
        </Tooltip>
      ) : (
        <Button onClick={onEdit}>
          <FormattedMessage
            id={buttonType.trim().length > 0 ? buttonType : 'component.allTeams.table.edit'}
            defaultMessage='Edit'
          />
        </Button>
      )}

      <Drawer
        getContainer={() => document.body}
        title={
          <FormattedMessage id='component.allTeams.drawer.title.edit' defaultMessage='Edit Team' />
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
            <Button onClick={() => setDrawerVisible(false)}>
              <FormattedMessage id='pages.button.cancel' defaultMessage='Cancel' />
            </Button>
            <Button onClick={() => formRefEdit.current?.submit()} type='primary'>
              <FormattedMessage id='pages.button.save' defaultMessage='Save' />
            </Button>
          </Space>
        }
      >
        <Spin spinning={spinning}>
          <ProForm
            formRef={formRefEdit}
            submitter={{
              render: () => {
                return [];
              },
            }}
            initialValues={EMPTY_TEAM_FORM_VALUES}
            onFinish={async () => {
              setSpinning(true);
              const formValues = {
                ...((formRefEdit.current?.getFieldsValue() as TeamEditFormValues | undefined) ??
                  {}),
              };
              formValues.lightLogo = await resolveLogoValue(lightLogo, 'lightLogo');
              formValues.darkLogo = await resolveLogoValue(darkLogo, 'darkLogo');
              const updateResult = await editTeamMessage(id, formValues);
              if (updateResult?.data) {
                message.success(
                  intl.formatMessage({
                    id: 'component.allTeams.form.updateSuccess',
                    defaultMessage: 'Team updated successfully!',
                  }),
                );
                actionRef?.current?.reload();
                setDrawerVisible(false);
                if (setViewDrawerVisible) setViewDrawerVisible(false);
              } else {
                message.error(
                  intl.formatMessage({
                    id: 'component.allTeams.form.updateError',
                    defaultMessage: 'Failed to update team information.',
                  }),
                );
              }
              setSpinning(false);
              return true;
            }}
          >
            <TeamForm
              lightLogoProps={initData?.json?.lightLogo}
              darkLogoProps={initData?.json?.darkLogo}
              onLogoChange={handletLogoChange}
            />
          </ProForm>
        </Spin>
      </Drawer>
    </>
  );
};

export default TeamEdit;
