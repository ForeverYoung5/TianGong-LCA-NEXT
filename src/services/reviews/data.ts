import type { JsonObject, LangTextValue } from '../general/data';

export type ReviewsTable = {
  key: string;
  id: string;
  name: string;
  teamName: string;
  modifiedAt?: string;
  userName: string;
  createAt?: string;
  isFromLifeCycle: boolean;
  stateCode?: number;
  comments?: { state_code: number }[];
  json: {
    data: {
      id: string;
      version: string;
      name: LangTextValue;
    };
    team: {
      name: string;
      id: string;
    };
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
  modelData?: {
    id: string;
    version: string;
    json: JsonObject;
    json_tg: JsonObject;
  } | null;
};
