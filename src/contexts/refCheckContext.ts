import { createContext, useContext } from 'react';

export type RefCheckType = {
  id: string;
  version: string;
  ruleVerification?: boolean;
  nonExistent?: boolean;
  stateCode?: number;
  versionUnderReview?: boolean;
  underReviewVersion?: string;
  versionIsInTg?: boolean;
};

type RefCheckContextType = {
  refCheckData: RefCheckType[];
  // updateRefCheckStatus: (onlyCheck: boolean) => void;
};

const defaultRefCheckContextValue: RefCheckContextType = {
  refCheckData: [],
};

const RefCheckContext = createContext<RefCheckContextType | null>(defaultRefCheckContextValue);

const useRefCheckContext = (): RefCheckContextType => {
  const context = useContext(RefCheckContext);
  if (!context) {
    return defaultRefCheckContextValue;
  }
  return context;
};

export { RefCheckContext, useRefCheckContext };
