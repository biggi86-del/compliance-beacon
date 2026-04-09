import { StateRule } from '../../types';
import { getCaliforniaRules, CA_RULES } from './california';
import { getNewYorkRules, NY_RULES } from './new-york';
import { getWashingtonRules, WA_RULES } from './washington';

export type StateModuleGetter = (asOfDate: string) => StateRule[];

const STATE_MODULE_REGISTRY: Record<string, StateModuleGetter> = {
  CA: getCaliforniaRules,
  NY: getNewYorkRules,
  WA: getWashingtonRules,
};

export function getStateRules(stateCode: string, asOfDate: string): StateRule[] | null {
  const getter = STATE_MODULE_REGISTRY[stateCode.toUpperCase()];
  if (!getter) return null;
  return getter(asOfDate);
}

export function isStateModuleAvailable(stateCode: string): boolean {
  return stateCode.toUpperCase() in STATE_MODULE_REGISTRY;
}

export function getAvailableStates(): string[] {
  return Object.keys(STATE_MODULE_REGISTRY);
}

export function getAllStateRules(): StateRule[] {
  return [...CA_RULES, ...NY_RULES, ...WA_RULES];
}
