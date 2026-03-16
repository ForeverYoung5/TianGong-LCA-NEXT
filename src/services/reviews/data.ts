import type { LangTextValue, ReferenceItem } from '../general/data';
import type { LifeCycleModelJsonTg, LifeCycleModelNamedText } from '../lifeCycleModels/data';

export type ReviewDatasetName =
  | string
  | (LifeCycleModelNamedText & {
      flowProperties?: LangTextValue;
      [key: string]: unknown;
    });

export type ReviewTeamSnapshot = {
  id: string;
  name: LangTextValue | string;
};

export type ReviewUserSnapshot = {
  id: string;
  name?: string;
  email?: string;
};

export type ReviewCommentSnapshot = {
  message?: string;
  [key: string]: unknown;
};

export type ReviewLogSnapshot = {
  action?: string;
  time?: string | Date;
  user?: {
    id?: string;
    display_name?: string;
    name?: string;
  };
  [key: string]: unknown;
};

export type ReviewJson = {
  data: {
    id: string;
    version: string;
    name: ReviewDatasetName;
  };
  team: ReviewTeamSnapshot;
  user: ReviewUserSnapshot;
  comment?: ReviewCommentSnapshot;
  logs?: ReviewLogSnapshot[];
  [key: string]: unknown;
};

export type ReviewModelProcessInstance = {
  referenceToProcess?: ReferenceItem;
  [key: string]: unknown;
};

export type ReviewModelJsonSnapshot = {
  lifeCycleModelDataSet?: {
    lifeCycleModelInformation?: {
      dataSetInformation?: {
        name?: ReviewDatasetName;
        [key: string]: unknown;
      };
      technology?: {
        processes?: {
          processInstance?: ReviewModelProcessInstance | ReviewModelProcessInstance[] | null;
          [key: string]: unknown;
        };
        [key: string]: unknown;
      };
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
};

export type ReviewModelJsonTgSnapshot = {
  xflow?: LifeCycleModelJsonTg['xflow'];
  submodels?: Array<{
    id: string;
    version?: string;
    type?: 'primary' | 'secondary' | string;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
};

export type ReviewModelDataSnapshot = {
  id: string;
  version: string;
  json: ReviewModelJsonSnapshot;
  json_tg?: ReviewModelJsonTgSnapshot;
};

export type ReviewSubTableRow = {
  key: string;
  id: string;
  version: string;
  name: string;
  sourceType?: 'processInstance' | 'submodel';
  submodelType?: string;
};

export type ReviewSubTableDataMap = Record<string, ReviewSubTableRow[]>;

export type ReviewUpdatePayload = Partial<{
  json: ReviewJson;
  reviewer_id: React.Key[];
  state_code: number;
  deadline: string;
  modified_at: string;
}> &
  Record<string, unknown>;

export type ReviewsTable = {
  key: string;
  id: string;
  name: string;
  teamName: string;
  modifiedAt?: string;
  deadline?: string | null;
  userName: string;
  createAt?: string;
  isFromLifeCycle: boolean;
  stateCode?: number;
  comments?: { state_code: number }[];
  json: ReviewJson;
  modelData?: ReviewModelDataSnapshot | null;
};
