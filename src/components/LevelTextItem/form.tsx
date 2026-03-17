import RequiredMark from '@/components/RequiredMark';
import type { Classification } from '@/services/general/data';
import { getILCDClassification, getILCDFlowCategorization } from '@/services/ilcd/api';
import type { FormInstance } from 'antd';
import { Cascader, Form, Input, TreeSelect } from 'antd';
import type { NamePath, Rule } from 'rc-field-form/lib/interface';
import { FC, MutableRefObject, useEffect, useState } from 'react';
import { FormattedMessage } from 'umi';

type ClassificationTreeNode = Classification & {
  title?: string;
  selectable?: boolean;
  children?: ClassificationTreeNode[];
};

type ClassificationFieldValue = {
  id?: string[];
  value?: string[];
  showValue?: string;
};

type FormValueAccessor = Pick<FormInstance, 'getFieldValue' | 'setFieldValue'>;
type FormValueAccessorRef = MutableRefObject<FormValueAccessor | undefined>;

type Props = {
  name: NamePath;
  lang: string;
  dataType: string;
  flowType?: string;
  formRef: FormValueAccessorRef;
  hidden?: boolean;
  onData: () => void;
  rules?: Rule[];
  showRules?: boolean;
};

const LevelTextItemForm: FC<Props> = ({
  name,
  lang,
  dataType,
  flowType,
  formRef,
  hidden,
  onData,
  rules = [],
  showRules = false,
}) => {
  const [selectOptions, setSelectOptions] = useState<ClassificationTreeNode[]>([]);
  const [hasClassId, setHasClassId] = useState<boolean>(false);
  const namePath = Array.isArray(name) ? name : [name];

  const getNodePath = (
    targetId: string,
    nodes: ClassificationTreeNode[],
  ): { ids: string[]; values: string[]; labels: string[] } => {
    const findPath = (
      currentNodes: ClassificationTreeNode[],
      pathIds: string[],
      pathValues: string[],
      pathLabels: string[],
    ): { ids: string[]; values: string[]; labels: string[] } | null => {
      for (const node of currentNodes) {
        const currentId = node.id;
        const currentValue = node.value || node.title || '';
        const currentLabel = node.label || node.title || '';

        if (node.id === targetId) {
          return {
            ids: [...pathIds, currentId],
            values: [...pathValues, currentValue],
            labels: [...pathLabels, currentLabel],
          };
        }

        if (node.children && node.children.length > 0) {
          const result = findPath(
            node.children,
            [...pathIds, currentId],
            [...pathValues, currentValue],
            [...pathLabels, currentLabel],
          );
          if (result) {
            return result;
          }
        }
      }
      return null;
    };

    const result = findPath(nodes, [], [], []);
    return result || { ids: [], values: [], labels: [] };
  };

  const getIdByValue = (value: string, nodes: ClassificationTreeNode[]): string => {
    const findId = (currentNodes: ClassificationTreeNode[]): string | null => {
      for (const node of currentNodes) {
        if (!node.children && (node.value === value || node.title === value)) {
          return node.id;
        }
        if (node.children && node.children.length > 0) {
          const result = findId(node.children);
          if (result) {
            return result;
          }
        }
      }
      return null;
    };
    return findId(nodes) || '';
  };

  const processTreeData = (treeData: ClassificationTreeNode[]): ClassificationTreeNode[] => {
    const addFullPath = (
      nodes: ClassificationTreeNode[],
      parentPath: string[] = [],
    ): ClassificationTreeNode[] => {
      return nodes.map((node) => {
        const newNode = { ...node };
        const currentPath = [...parentPath, node.label];
        newNode.title = currentPath.join('/');

        if (node.children && node.children.length > 0) {
          newNode.selectable = false;
          newNode.children = addFullPath(node.children, currentPath);
        } else {
          newNode.selectable = true;
        }
        return newNode;
      });
    };
    return addFullPath(treeData);
  };

  const setShowValue = async () => {
    const field =
      (formRef.current?.getFieldValue(namePath) as ClassificationFieldValue | undefined) ?? {};
    if (
      field.id &&
      field.id.length &&
      field.id.every((item: string) => typeof item === 'string' && item.length !== 0)
    ) {
      const id = field.id[field.id.length - 1];
      setHasClassId(true);
      await formRef.current?.setFieldValue([...namePath, 'showValue'], id);
    } else if (field.value && field.value.length && field.value.every((item) => !!item)) {
      const value = field.value[field.value.length - 1];
      const id = getIdByValue(value, selectOptions);
      await formRef.current?.setFieldValue([...namePath, 'showValue'], id);
      setHasClassId(true);
    } else {
      setHasClassId(false);
    }
  };

  useEffect(() => {
    const fetchClassification = async (dt: string, ft: string | undefined) => {
      let result: { data: Classification[]; success: boolean } = { data: [], success: false };
      if (dt === 'Flow' && !ft) {
        return;
      }
      if (dt === 'Flow' && ft === 'Elementary flow') {
        result = await getILCDFlowCategorization(lang, ['all']);
      } else {
        result = await getILCDClassification(dt, lang, ['all']);
      }
      setSelectOptions(processTreeData(result?.data));
    };

    fetchClassification(dataType, flowType);
  }, [dataType, flowType]);

  useEffect(() => {
    setTimeout(() => {
      setShowValue();
    });
  });

  const handleValueChange = async (item: string) => {
    const fullPath = getNodePath(item, selectOptions);
    await formRef.current?.setFieldValue([...namePath, 'id'], fullPath.ids);
    await formRef.current?.setFieldValue([...namePath, 'value'], fullPath.values);
    await formRef.current?.setFieldValue(
      [...namePath, 'showValue'],
      fullPath.ids[fullPath.ids.length - 1],
    );
    if (fullPath?.ids?.length > 0) {
      setHasClassId(true);
    } else {
      setHasClassId(false);
    }
    onData();
  };

  return (
    <>
      <Form.Item
        hidden={hidden}
        required={false}
        label={
          <RequiredMark
            showError={false}
            label={
              <FormattedMessage id='pages.contact.classification' defaultMessage='Classification' />
            }
          />
        }
        name={[...namePath, 'showValue']}
        rules={rules}
        validateStatus={showRules && !hasClassId ? 'error' : undefined}
        help={
          showRules && !hasClassId ? (
            <FormattedMessage
              id='pages.contact.validator.classification.required'
              defaultMessage='Please input classification'
            />
          ) : undefined
        }
      >
        <TreeSelect
          treeDefaultExpandedKeys={
            formRef.current?.getFieldValue([...namePath, 'showValue'])
              ? [formRef.current?.getFieldValue([...namePath, 'showValue'])]
              : []
          }
          onChange={handleValueChange}
          fieldNames={{ label: 'label', value: 'id', children: 'children' }}
          style={{ width: '100%' }}
          treeData={selectOptions}
          showSearch
          filterTreeNode={(inputValue, treeNode) => {
            return (treeNode?.title as string)?.toLowerCase().includes(inputValue.toLowerCase());
          }}
          treeNodeFilterProp='title'
          treeExpandAction='click'
          // labelInValue={true}
          treeNodeLabelProp='title'
        />
      </Form.Item>
      <Form.Item name={[...namePath, 'id']} hidden={true}>
        <Input />
      </Form.Item>
      <Form.Item name={[...namePath, 'value']} hidden={true}>
        <Cascader options={selectOptions} />
      </Form.Item>
    </>
  );
};

export default LevelTextItemForm;
