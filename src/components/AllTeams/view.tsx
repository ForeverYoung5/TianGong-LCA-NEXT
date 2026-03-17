import { getThumbFileUrls } from '@/services/supabase/storage';
import { getTeamMessageApi } from '@/services/teams/api';
import type { TeamTable } from '@/services/teams/data';
import { CloseOutlined, ProfileOutlined } from '@ant-design/icons';
import { Button, Card, Descriptions, Drawer, Image, Space, Spin, Tooltip } from 'antd';
import type { ButtonType } from 'antd/es/button';
import type { FC } from 'react';
import { useState } from 'react';
import { FormattedMessage } from 'umi';

type Props = {
  id: string;
  buttonType: string;
  buttonTypeProp?: ButtonType;
};

const TeamView: FC<Props> = ({ id, buttonType, buttonTypeProp = 'default' }) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [initData, setInitData] = useState<TeamTable | null>(null);

  const teamContent: React.ReactNode = (
    <>
      <Card
        size='small'
        title={<FormattedMessage id='pages.team.info.title' defaultMessage='Team Name' />}
      >
        <Descriptions bordered size={'small'} column={1}>
          {initData?.json?.title?.map((item, index) => (
            <Descriptions.Item
              key={index}
              label={item['@xml:lang'] === 'zh' ? '简体中文' : 'English'}
              labelStyle={{ width: '120px' }}
            >
              {item['#text'] || '-'}
            </Descriptions.Item>
          ))}
        </Descriptions>
      </Card>
      <br />
      <Card
        size='small'
        title={
          <FormattedMessage id='pages.team.info.description' defaultMessage='Team Description' />
        }
      >
        <Descriptions bordered size={'small'} column={1}>
          {initData?.json?.description?.map((item, index) => (
            <Descriptions.Item
              key={index}
              label={item['@xml:lang'] === 'zh' ? '简体中文' : 'English'}
              labelStyle={{ width: '120px' }}
            >
              {item['#text'] || '-'}
            </Descriptions.Item>
          ))}
        </Descriptions>
      </Card>
      <br />
      <Card
        size='small'
        title={<FormattedMessage id='pages.team.info.public' defaultMessage='Public Display' />}
      >
        <Descriptions bordered size={'small'} column={1}>
          <Descriptions.Item
            label={<FormattedMessage id='pages.team.info.public' defaultMessage='Public Display' />}
            labelStyle={{ width: '120px' }}
          >
            {initData?.rank === -1 ? (
              <FormattedMessage
                id='component.allTeams.drawer.public'
                defaultMessage='Public Display'
              />
            ) : initData?.rank === 0 ? (
              <FormattedMessage
                id='component.allTeams.drawer.public'
                defaultMessage='Not Public Display'
              />
            ) : (
              '-'
            )}
          </Descriptions.Item>
        </Descriptions>
      </Card>
      <br />
      <Card
        size='small'
        title={<FormattedMessage id='component.allTeams.logo.title' defaultMessage='Team Logo' />}
      >
        <Space direction='vertical' size='middle'>
          <Descriptions bordered size={'small'} column={1}>
            <Descriptions.Item
              label={
                <FormattedMessage id='pages.team.info.lightLogo' defaultMessage='Light Logo' />
              }
              labelStyle={{ width: '120px' }}
            >
              {initData?.json?.previewLightUrl ? (
                <Image width={100} src={initData?.json?.previewLightUrl} alt='Light Logo' />
              ) : (
                '-'
              )}
            </Descriptions.Item>
          </Descriptions>
          <Descriptions bordered size={'small'} column={1}>
            <Descriptions.Item
              label={<FormattedMessage id='pages.team.info.darkLogo' defaultMessage='Dark Logo' />}
              labelStyle={{ width: '120px' }}
            >
              {initData?.json?.previewDarkUrl ? (
                <Image
                  style={
                    initData?.json?.previewDarkUrl
                      ? { background: '#141414', display: 'inline-block', borderRadius: '8px' }
                      : {}
                  }
                  width={100}
                  src={initData?.json?.previewDarkUrl}
                  alt='Dark Logo'
                />
              ) : (
                '-'
              )}
            </Descriptions.Item>
          </Descriptions>
        </Space>
      </Card>
    </>
  );

  const onView = () => {
    setDrawerVisible(true);
    setSpinning(true);
    getTeamMessageApi(id)
      .then(async (result) => {
        const teamData = result.data?.[0];
        if (!teamData) {
          return;
        }

        const nextTeamData: TeamTable = {
          ...teamData,
          json: { ...teamData.json },
        };
        const { lightLogo, darkLogo } = nextTeamData.json;
        const [lightThumbs, darkThumbs] = await Promise.all([
          lightLogo ? getThumbFileUrls([{ '@uri': `${lightLogo}` }]) : Promise.resolve([]),
          darkLogo ? getThumbFileUrls([{ '@uri': `${darkLogo}` }]) : Promise.resolve([]),
        ]);

        if (lightThumbs[0]?.status === 'done') {
          nextTeamData.json.previewLightUrl = lightThumbs[0].thumbUrl;
        }
        if (darkThumbs[0]?.status === 'done') {
          nextTeamData.json.previewDarkUrl = darkThumbs[0].thumbUrl;
        }

        setInitData(nextTeamData);
      })
      .finally(() => {
        setSpinning(false);
      });
  };

  return (
    <>
      {buttonType === 'icon' ? (
        <Tooltip
          title={<FormattedMessage id='component.allTeams.table.view' defaultMessage='View' />}
        >
          <Button
            shape='circle'
            type={buttonTypeProp}
            icon={<ProfileOutlined />}
            size='small'
            onClick={onView}
          />
        </Tooltip>
      ) : (
        <Button onClick={onView}>
          <FormattedMessage id='component.allTeams.table.view' defaultMessage='View' />
        </Button>
      )}

      <Drawer
        getContainer={() => document.body}
        title={
          <FormattedMessage id='component.allTeams.drawer.title.view' defaultMessage='View Team' />
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
        maskClosable={true}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        <Spin spinning={spinning}>{teamContent}</Spin>
      </Drawer>
    </>
  );
};

export default TeamView;
