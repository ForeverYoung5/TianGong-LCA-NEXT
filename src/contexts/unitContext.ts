import { createContext, useContext } from 'react';

export type UnitContextUnit = {
  id?: string;
  [key: string]: unknown;
};

export type UnitsContextValue = {
  units: unknown[];
  setUnits: (...args: unknown[]) => void;
  setTargetUnit: (...args: unknown[]) => void;
};

const defaultUnitsContextValue: UnitsContextValue = {
  units: [],
  setUnits: () => {},
  setTargetUnit: () => {},
};

const UnitsContext = createContext<unknown>(null);

const useUnitsContext = (): UnitsContextValue => {
  const context = useContext(UnitsContext);
  if (!context) {
    return defaultUnitsContextValue;
  }
  return context as UnitsContextValue;
};

export { UnitsContext, useUnitsContext };
