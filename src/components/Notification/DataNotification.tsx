import { getLang } from '@/services/general/util';
import { getNotifyReviews } from '@/services/reviews/api';
import type { ReviewsTable } from '@/services/reviews/data';
import { Button, Space, Table, Tag, Tooltip, theme } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'umi';

type DataNotificationItem = Pick<
  ReviewsTable,
  'id' | 'name' | 'teamName' | 'userName' | 'modifiedAt' | 'isFromLifeCycle' | 'stateCode' | 'json'
> & {
  key: string;
  modifiedAt: string;
  rejectReason?: string;
};

interface DataNotificationProps {
  timeFilter: number;
  onDataLoaded?: () => Promise<void>;
}

const DataNotification: React.FC<DataNotificationProps> = ({ timeFilter, onDataLoaded }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DataNotificationItem[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const intl = useIntl();
  const lang = getLang(intl.locale);
  const { token } = theme.useToken();

  const fetchDataNotifications = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const reviewsRes = await getNotifyReviews({ pageSize, current: page }, lang, timeFilter);
      if (!reviewsRes.success) {
        return;
      }
      const rejectedData =
        reviewsRes.data?.map((item) => ({
          key: item.id,
          id: item.id,
          name: item.name,
          teamName: item.teamName,
          userName: item.userName,
          modifiedAt: item.modifiedAt || '-',
          isFromLifeCycle: item.isFromLifeCycle,
          rejectReason: item.json.comment?.message || '',
          stateCode: item.stateCode,
          json: item.json,
        })) || [];

      setData(rejectedData);
      setPagination({
        current: page,
        pageSize,
        total: reviewsRes.total || 0,
      });
      // Call callback after data is loaded (only on initial load, not pagination)
      if (page === 1 && onDataLoaded) {
        await onDataLoaded();
      }
    } catch (error) {
      console.error('获取数据通知失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataNotifications();
  }, [timeFilter]);

  const handleTableChange = (page: number, pageSize: number) => {
    fetchDataNotifications(page, pageSize);
  };

  const getStatusTag = (stateCode?: number) => {
    switch (stateCode) {
      case -1:
        return {
          color: token.red,
          text: intl.formatMessage({
            id: 'pages.review.data.rejected',
            defaultMessage: 'Rejected',
          }),
        };
      case 1:
        return {
          color: token.blue,
          text: intl.formatMessage({
            id: 'pages.review.data.assigned',
            defaultMessage: 'Assigned',
          }),
        };
      case 2:
        return {
          color: token.green,
          text: intl.formatMessage({
            id: 'pages.review.data.approved',
            defaultMessage: 'Approved',
          }),
        };
      default:
        return {
          color: token.colorTextDisabled,
          text: intl.formatMessage({ id: 'teams.members.role.empty', defaultMessage: 'Empty' }),
        };
    }
  };

  const columns: ColumnsType<DataNotificationItem> = [
    {
      title: intl.formatMessage({ id: 'pages.review.table.name', defaultMessage: 'Name' }),
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => name,
    },
    {
      title: intl.formatMessage({ id: 'pages.review.table.teamName', defaultMessage: 'Team' }),
      dataIndex: 'teamName',
      key: 'teamName',
    },
    {
      title: intl.formatMessage({ id: 'pages.review.table.status', defaultMessage: 'Status' }),
      dataIndex: 'status',
      key: 'status',
      render: (stateCode: number, record: DataNotificationItem) => {
        const statusTag = getStatusTag(record.stateCode);
        return (
          <Tooltip title={record.rejectReason} placement='topLeft'>
            <Tag color={statusTag.color}>{statusTag.text}</Tag>
          </Tooltip>
        );
      },
    },
    {
      title: intl.formatMessage({
        id: 'pages.review.table.modifiedAt',
        defaultMessage: 'Modified At',
      }),
      dataIndex: 'modifiedAt',
      key: 'modifiedAt',
      render: (time: string) => {
        if (!time) return '';
        const date = new Date(time);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hour = date.getHours();
        const minute = date.getMinutes();
        const second = date.getSeconds();
        return `${year}-${month}-${day} ${hour.toString().padStart(2, '0')}:${minute
          .toString()
          .padStart(2, '0')}:${second.toString().padStart(2, '0')}`;
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.review.table.actions', defaultMessage: 'Actions' }),
      key: 'actions',
      render: (record: DataNotificationItem) => (
        <Space>
          <Button
            type='link'
            size='small'
            style={{ color: token.colorPrimary }}
            onClick={() => {
              window.open(
                `/mydata/processes?id=${record?.json?.data?.id}&version=${record?.json?.data?.version}`,
                '_blank',
              );
            }}
          >
            {intl.formatMessage({ id: 'pages.review.table.view', defaultMessage: 'View' })}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        // showSizeChanger: true,
        // showQuickJumper: true,
        showTotal: (total, range) =>
          intl.formatMessage(
            { id: 'pages.pagination.showTotal', defaultMessage: 'Items {start}-{end} of {total}' },
            { start: range[0], end: range[1], total },
          ),
        onChange: handleTableChange,
      }}
      size='small'
    />
  );
};

export default DataNotification;
