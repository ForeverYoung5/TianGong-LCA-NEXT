import LangTextItemDescription from '@/components/LangTextItem/description';
import type { ReferenceItem } from '@/services/general/data';
import { Card, Descriptions, Divider } from 'antd';
import type { FC } from 'react';

type ReferenceDescriptionData = Partial<Omit<ReferenceItem, 'common:shortDescription'>> & {
  'common:shortDescription'?: unknown;
};

type Props = {
  title: string;
  data: ReferenceDescriptionData | null | undefined;
};

const SourceDescription: FC<Props> = ({ title, data }) => {
  // if (!data) {
  //   return (
  //     <Card size="small" title={title}>
  //       <Descriptions bordered size={'small'} column={1}>
  //         <Descriptions.Item key={0} labelStyle={{ display: 'none' }}>
  //           -
  //         </Descriptions.Item>
  //       </Descriptions>
  //     </Card>
  //   );
  // }
  return (
    <Card size='small' title={title}>
      <Descriptions bordered size={'small'} column={1}>
        <Descriptions.Item key={0} label='Type' labelStyle={{ width: '120px' }}>
          {data?.['@type'] ?? '-'}
        </Descriptions.Item>
      </Descriptions>
      <br />
      <Descriptions bordered size={'small'} column={1}>
        <Descriptions.Item key={0} label='Ref Object Id' labelStyle={{ width: '120px' }}>
          {data?.['@refObjectId'] ?? '-'}
        </Descriptions.Item>
      </Descriptions>
      <br />
      <Descriptions bordered size={'small'} column={1}>
        <Descriptions.Item key={0} label='URI' labelStyle={{ width: '120px' }}>
          {data?.['@uri'] ?? '-'}
        </Descriptions.Item>
      </Descriptions>
      <br />
      <Descriptions bordered size={'small'} column={1}>
        <Descriptions.Item key={0} label='Version' labelStyle={{ width: '120px' }}>
          {data?.['@version'] ?? '-'}
        </Descriptions.Item>
      </Descriptions>
      <Divider orientationMargin='0' orientation='left' plain>
        Short Description
      </Divider>
      <LangTextItemDescription data={data?.['common:shortDescription']} />
    </Card>
  );
};

export default SourceDescription;
