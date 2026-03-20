import { LifeCycleModel } from '@tiangong-lca/tidas-sdk';
import type { LangTextValue, ReferenceItem } from '../general/data';
import type {
  ProcessExchangeData,
  ProcessTable,
  ReviewMergeComplianceDeclarationsSection,
  ReviewMergeDataSet,
  ReviewMergeValidationSection,
} from '../processes/data';

export type LifeCycleModelTable = {
  id: string;
  name: string;
  generalComment: string;
  classification: string;
  version: string;
  modifiedAt: Date;
  stateCode?: number;
  teamId: string;
};

export type Up2DownEdge = {
  id: string; //upstreamId + '->' + downstreamId + ':' + dependence
  flowUUID: string;
  flowIsRef: boolean;
  upstreamId: string;
  upstreamNodeId?: string;
  downstreamId: string;
  downstreamNodeId?: string;
  dependence?: string;
  mainDependence?: string;
  mainScalingFactor?: number;
  mainOutputFlowUUID: string;
  mainInputFlowUUID: string;
  downScalingFactor?: number;
  upScalingFactor?: number;
  scalingFactor?: number;
  exchangeAmount?: number;
  unbalancedAmount?: number;
  isBalanced?: boolean;
  isCycle?: boolean;
};

export type LifeCycleModelExchangeDirection = 'INPUT' | 'OUTPUT';

export type LifeCycleModelReference = ReferenceItem;

export type LifeCycleModelNamedText = {
  baseName?: LangTextValue;
  treatmentStandardsRoutes?: LangTextValue;
  mixAndLocationTypes?: LangTextValue;
  functionalUnitFlowProperties?: LangTextValue;
};

export type LifeCycleModelProcessOutputExchange = {
  '@flowUUID'?: string;
  downstreamProcess?: LifeCycleModelDownstreamProcess | LifeCycleModelDownstreamProcess[] | null;
};

export type LifeCycleModelDownstreamProcess = {
  '@id'?: string;
  '@flowUUID'?: string;
  nodeId?: string;
};

export type LifeCycleModelProcessConnections = {
  outputExchange?:
    | LifeCycleModelProcessOutputExchange
    | LifeCycleModelProcessOutputExchange[]
    | null;
};

export type LifeCycleModelProcessDefinition = {
  '@dataSetInternalID'?: string;
  '@multiplicationFactor'?: string | number;
  referenceToProcess?: ReferenceItem;
  groups?: unknown;
  parameters?: unknown;
  connections?: LifeCycleModelProcessConnections;
  nodeId?: string;
};

export type LifeCycleModelDbProcessRow = {
  id: string;
  version: string;
  exchange?: ProcessExchangeData | ProcessExchangeData[] | null;
  quantitativeReference?: {
    referenceToReferenceFlow?: string;
  } | null;
};

export type LifeCycleModelDbProcessRefExchange = {
  exchangeId: string;
  flowId: string;
  direction: LifeCycleModelExchangeDirection;
  refExchange?: ProcessExchangeData;
};

export type LifeCycleModelDbProcessValue = {
  id: string;
  version: string;
  exchanges: ProcessExchangeData[];
  refExchangeMap: LifeCycleModelDbProcessRefExchange;
  exIndex?: {
    inputByFlowId: Map<string, ProcessExchangeData>;
    outputByFlowId: Map<string, ProcessExchangeData>;
  };
};

export type LifeCycleModelScalingDirection = '' | 'downstream' | 'upstream';

export type LifeCycleModelScalingDependence = {
  direction: LifeCycleModelScalingDirection;
  nodeId: string;
  flowUUID: string;
  edgeId: string;
  exchangeAmount?: number;
};

export type LifeCycleModelCalculatedExchange = ProcessExchangeData & {
  remainingRate?: number;
};

export type LifeCycleModelProcessScalingRecord = {
  nodeId: string;
  dependence: LifeCycleModelScalingDependence;
  processId: string;
  processVersion: string;
  quantitativeReferenceFlowIndex?: string;
  scalingFactor: number;
  baseExchanges: ProcessExchangeData[];
  mainConnectExchanges: ProcessExchangeData[];
  secondaryConnectExchanges: ProcessExchangeData[];
  noneConnectExchanges: ProcessExchangeData[];
  exchanges: ProcessExchangeData[];
  count?: number;
  remainingExchanges?: LifeCycleModelCalculatedExchange[];
};

export type LifeCycleModelAllocatedExchange = {
  exchange: LifeCycleModelCalculatedExchange;
  allocatedFraction: number;
};

export type LifeCycleModelFinalProductType = 'has' | 'no';

export type LifeCycleModelChildProcess = LifeCycleModelProcessScalingRecord & {
  isAllocated: boolean;
  allocatedExchangeId: string;
  allocatedExchangeDirection: string;
  allocatedExchangeFlowId?: string;
  allocatedFraction: number;
  finalProductType: LifeCycleModelFinalProductType;
  childExchanges: LifeCycleModelCalculatedExchange[];
  childAllocatedFraction?: number;
  childScalingPercentage?: number;
  resultExchanges?: LifeCycleModelCalculatedExchange[];
};

export type LifeCycleModelSubModelFinalId = {
  nodeId: string;
  processId: string;
  allocatedExchangeFlowId?: string;
  allocatedExchangeDirection?: string;
  referenceToFlowDataSet?: {
    '@refObjectId': string;
    '@exchangeDirection': LifeCycleModelExchangeDirection | string;
  };
};

export type LifeCycleModelGeneratedProcessDataSet = {
  processInformation?: Record<string, unknown>;
  exchanges?: {
    exchange?: LifeCycleModelCalculatedExchange[];
  };
  LCIAResults?: {
    LCIAResult?: Array<Record<string, unknown>>;
  };
};

export type LifeCycleModelGeneratedProcess = {
  option: 'create' | 'update';
  modelInfo: {
    id: string;
    type: 'primary' | 'secondary';
    finalId: LifeCycleModelSubModelFinalId;
  };
  data: {
    processDataSet: LifeCycleModelGeneratedProcessDataSet;
  };
  refProcesses?: Array<Record<string, unknown>>;
};

export type LifeCycleModelDataSetObjectKeys = Exclude<
  {
    [K in keyof LifeCycleModel['lifeCycleModelDataSet']]: LifeCycleModel['lifeCycleModelDataSet'][K] extends
      | object
      | undefined
      ? K
      : never;
  }[keyof LifeCycleModel['lifeCycleModelDataSet']],
  undefined
>;

export type FormLifeCycleModel = Pick<
  LifeCycleModel['lifeCycleModelDataSet'],
  LifeCycleModelDataSetObjectKeys
>;

type LifeCycleModelModellingAndValidation = NonNullable<
  FormLifeCycleModel['modellingAndValidation']
>;

export type LifeCycleModelReviewMergeValidationSection = ReviewMergeValidationSection<
  LifeCycleModelModellingAndValidation['validation']
>;

export type LifeCycleModelReviewMergeComplianceDeclarationsSection =
  ReviewMergeComplianceDeclarationsSection<
    LifeCycleModelModellingAndValidation['complianceDeclarations']
  >;

export type LifeCycleModelReviewMergeDataSet = ReviewMergeDataSet<FormLifeCycleModel>;

export type LifeCycleModelReviewMergeModellingAndValidation = NonNullable<
  LifeCycleModelReviewMergeDataSet['modellingAndValidation']
>;

export type LifeCycleModelReviewMergeJson = {
  lifeCycleModelDataSet?: LifeCycleModelReviewMergeDataSet;
};

export type LifeCycleModelDataSetInformationSnapshot = {
  name?: LifeCycleModelNamedText;
  identifierOfSubDataSet?: unknown;
  'common:synonyms'?: LangTextValue | unknown;
  classificationInformation?: {
    'common:classification'?: {
      'common:class'?: unknown;
    };
  };
  'common:generalComment'?: LangTextValue;
  referenceToExternalDocumentation?: LifeCycleModelReference;
};

export type LifeCycleModelTimeSnapshot = {
  'common:referenceYear'?: unknown;
  'common:dataSetValidUntil'?: unknown;
  'common:timeRepresentativenessDescription'?: unknown;
};

export type LifeCycleModelGeographyLocationSnapshot = {
  '@location'?: unknown;
  '@subLocation'?: unknown;
  descriptionOfRestrictions?: unknown;
};

export type LifeCycleModelTechnologySnapshot = {
  processes?: {
    processInstance?: LifeCycleModelProcessDefinition | LifeCycleModelProcessDefinition[] | null;
  };
  technologyDescriptionAndIncludedProcesses?: unknown;
  technologicalApplicability?: unknown;
  referenceToTechnologyPictogramme?: LifeCycleModelReference;
  referenceToTechnologyFlowDiagrammOrPicture?: LifeCycleModelReference;
};

export type LifeCycleModelVariableParameterSnapshot = {
  '@name'?: unknown;
  formula?: unknown;
  meanValue?: unknown;
  minimumValue?: unknown;
  maximumValue?: unknown;
  uncertaintyDistributionType?: unknown;
  relativeStandardDeviation95In?: unknown;
  comment?: unknown;
};

export type LifeCycleModelMathematicalRelationsSnapshot = {
  modelDescription?: unknown;
  variableParameter?: LifeCycleModelVariableParameterSnapshot | null;
};

export type LifeCycleModelInformationSnapshot = {
  quantitativeReference?: {
    referenceToReferenceProcess?: string;
  };
  dataSetInformation?: LifeCycleModelDataSetInformationSnapshot;
  time?: LifeCycleModelTimeSnapshot;
  geography?: {
    locationOfOperationSupplyOrProduction?: LifeCycleModelGeographyLocationSnapshot;
    subLocationOfOperationSupplyOrProduction?: LifeCycleModelGeographyLocationSnapshot;
  };
  technology?: LifeCycleModelTechnologySnapshot;
  mathematicalRelations?: LifeCycleModelMathematicalRelationsSnapshot;
};

export type LifeCycleModelModellingValidationSnapshot = {
  LCIMethodAndAllocation?: {
    typeOfDataSet?: unknown;
    LCIMethodPrinciple?: unknown;
    deviationsFromLCIMethodPrinciple?: unknown;
    LCIMethodApproaches?: unknown;
    deviationsFromLCIMethodApproaches?: unknown;
    modellingConstants?: unknown;
    deviationsFromModellingConstants?: unknown;
    referenceToLCAMethodDetails?: LifeCycleModelReference;
  };
  dataSourcesTreatmentAndRepresentativeness?: {
    dataCutOffAndCompletenessPrinciples?: unknown;
    deviationsFromCutOffAndCompletenessPrinciples?: unknown;
    dataSelectionAndCombinationPrinciples?: unknown;
    deviationsFromSelectionAndCombinationPrinciples?: unknown;
    dataTreatmentAndExtrapolationsPrinciples?: unknown;
    deviationsFromTreatmentAndExtrapolationPrinciples?: unknown;
    referenceToDataHandlingPrinciples?: LifeCycleModelReference;
    referenceToDataSource?: LifeCycleModelReference;
    percentageSupplyOrProductionCovered?: unknown;
    annualSupplyOrProductionVolume?: unknown;
    samplingProcedure?: unknown;
    dataCollectionPeriod?: unknown;
    uncertaintyAdjustments?: unknown;
    useAdviceForDataSet?: unknown;
  };
  completeness?: {
    completenessProductModel?: unknown;
    completenessElementaryFlows?: {
      '@type'?: unknown;
      '@value'?: unknown;
    };
    completenessOtherProblemField?: unknown;
  };
  validation?: Record<string, unknown>;
  complianceDeclarations?: Record<string, unknown>;
};

export type LifeCycleModelAdministrativeInformationSnapshot = {
  'common:commissionerAndGoal'?: {
    'common:referenceToCommissioner'?: LifeCycleModelReference;
    'common:project'?: unknown;
    'common:intendedApplications'?: unknown;
  };
  dataGenerator?: {
    'common:referenceToPersonOrEntityGeneratingTheDataSet'?: LifeCycleModelReference;
  };
  dataEntryBy?: {
    'common:timeStamp'?: unknown;
    'common:referenceToDataSetFormat'?: LifeCycleModelReference;
    'common:referenceToConvertedOriginalDataSetFrom'?: LifeCycleModelReference;
    'common:referenceToPersonOrEntityEnteringTheData'?: LifeCycleModelReference;
    'common:referenceToDataSetUseApproval'?: LifeCycleModelReference;
  };
  publicationAndOwnership?: {
    'common:dateOfLastRevision'?: unknown;
    'common:dataSetVersion'?: unknown;
    'common:permanentDataSetURI'?: unknown;
    'common:workflowAndPublicationStatus'?: unknown;
    'common:referenceToUnchangedRepublication'?: LifeCycleModelReference;
    'common:referenceToRegistrationAuthority'?: LifeCycleModelReference;
    'common:registrationNumber'?: unknown;
    'common:referenceToOwnershipOfDataSet'?: LifeCycleModelReference;
    'common:copyright'?: unknown;
    'common:referenceToEntitiesWithExclusiveAccess'?: LifeCycleModelReference;
    'common:licenseType'?: unknown;
    'common:accessRestrictions'?: unknown;
  };
};

export type LifeCycleModelDataSetSnapshot = {
  lifeCycleModelInformation?: LifeCycleModelInformationSnapshot;
  modellingAndValidation?: LifeCycleModelModellingValidationSnapshot;
  administrativeInformation?: LifeCycleModelAdministrativeInformationSnapshot;
};

export type LifeCycleModelOrderedJson = {
  lifeCycleModelDataSet?: LifeCycleModelDataSetSnapshot;
};

type DeepPartial<T> =
  T extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T extends object
      ? { [K in keyof T]?: DeepPartial<T[K]> }
      : T;

export type LifeCycleModelFormData = DeepPartial<FormLifeCycleModel>;

export type LifeCycleModelFormState = LifeCycleModelFormData & {
  id?: string;
  version?: string;
};

export type LifeCycleModelPortGroup = 'groupInput' | 'groupOutput';

export type LifeCycleModelPortData = {
  textLang?: LangTextValue;
  flowId?: string;
  flowVersion?: string;
  quantitativeReference?: boolean;
  allocations?: ProcessExchangeData['allocations'];
};

export type LifeCycleModelPortItem = {
  id: string;
  args?: { x?: number | string; y?: number };
  attrs?: {
    text?: {
      text?: string;
      title?: string;
      cursor?: string;
      fill?: string;
      'font-weight'?: string;
    };
  };
  group: LifeCycleModelPortGroup | string;
  data?: LifeCycleModelPortData;
};

export type LifeCycleModelNodeData = {
  id?: string;
  version?: string;
  index?: string;
  label?: unknown;
  shortDescription?: unknown;
  quantitativeReference?: '0' | '1';
  targetAmount?: string | number;
  originalAmount?: string | number;
  scalingFactor?: string | number;
};

export type LifeCycleModelGraphNode = {
  id?: string;
  label?: string;
  shape?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  size?: { width: number; height: number };
  attrs?: Record<string, unknown>;
  data?: LifeCycleModelNodeData;
  ports?: {
    groups?: Record<string, unknown>;
    items?: LifeCycleModelPortItem[];
  };
  tools?: Array<{ id?: string; [key: string]: unknown } | string>;
  selected?: boolean;
};

export type LifeCycleModelEdgeConnection = {
  outputExchange?: {
    '@flowUUID'?: string;
    downstreamProcess?: {
      '@flowUUID'?: string;
      '@id'?: string;
    };
  };
  isBalanced?: boolean;
  exchangeAmount?: number;
  unbalancedAmount?: number;
};

export type LifeCycleModelEdgeNodeData = {
  sourceNodeID?: string;
  targetNodeID?: string;
  sourceProcessId?: string;
  sourceProcessVersion?: string;
  targetProcessId?: string;
  targetProcessVersion?: string;
};

export type LifeCycleModelEdgeData = {
  connection?: LifeCycleModelEdgeConnection;
  node?: LifeCycleModelEdgeNodeData;
};

export type LifeCycleModelGraphEdge = {
  id?: string;
  source?: {
    cell?: string;
    port?: string;
  };
  target?: {
    cell?: string;
    port?: string;
  };
  attrs?: Record<string, unknown>;
  labels?: unknown[];
  data?: LifeCycleModelEdgeData;
  selected?: boolean;
};

export type LifeCycleModelGraphData = {
  nodes: LifeCycleModelGraphNode[];
  edges: LifeCycleModelGraphEdge[];
};

export type LifeCycleModelEditorFormState = LifeCycleModelFormState & {
  model?: LifeCycleModelGraphData;
};

export type LifeCycleModelValidationIssue = {
  path: PropertyKey[];
};

export type LifeCycleModelCheckContext = 'review' | 'checkData';

export type LifeCycleModelCheckResult<TRefData = unknown> = {
  checkResult: boolean;
  unReview: TRefData[];
  problemNodes?: TRefData[];
};

export type LifeCycleModelToolbarEditInfoHandle<TRefData = unknown> = {
  submitReview: (unReview: TRefData[]) => Promise<void>;
  handleCheckData: (
    from: LifeCycleModelCheckContext,
    nodes: LifeCycleModelGraphNode[],
    edges: LifeCycleModelGraphEdge[],
    options?: { silent?: boolean },
  ) => Promise<LifeCycleModelCheckResult<TRefData>>;
  updateReferenceDescription: (formData: LifeCycleModelFormState) => Promise<void>;
};

export type LifeCycleModelSubModel = {
  id: string;
  version: string;
  type?: 'primary' | 'secondary' | string;
  finalId?: LifeCycleModelSubModelFinalId;
};

export type LifeCycleModelJsonTg = {
  xflow?: {
    nodes?: LifeCycleModelGraphNode[];
    edges?: LifeCycleModelGraphEdge[];
  };
  submodels?: LifeCycleModelSubModel[];
};

export type LifeCycleModelDetailData = {
  id: string;
  version: string;
  json: { lifeCycleModelDataSet?: FormLifeCycleModel };
  json_tg?: LifeCycleModelJsonTg;
  stateCode: number;
  ruleVerification: boolean;
  teamId?: string;
};

export type LifeCycleModelDetailResponse =
  | {
      data: LifeCycleModelDetailData;
      success: true;
    }
  | {
      data: object;
      success: false;
    };

export type LifeCycleModelImportData = Array<{
  lifeCycleModelDataSet?: FormLifeCycleModel;
  json_tg?: LifeCycleModelJsonTg;
}>;

export type LifeCycleModelProcessInstance = Pick<ProcessTable, 'id' | 'version'> & {
  modelId?: string;
  userId?: string;
};

export type LifeCycleModelTargetAmount = {
  targetAmount?: string | number;
  originalAmount?: string | number;
  scalingFactor?: string | number;
};

export type LifeCycleModelSelectedPortPayload = {
  selectedRowData: ProcessExchangeData[];
};

export type LifeCycleModelThemeToken = {
  colorPrimary: string;
  colorTextDescription: string;
  colorText: string;
  colorBgBase: string;
};
