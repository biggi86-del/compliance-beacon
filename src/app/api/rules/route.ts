import { NextResponse } from 'next/server';
import { getAllFederalRules } from '@/lib/rules/federal-rules';
import { getAllStateRules, getAvailableStates } from '@/lib/rules/state-modules';

export async function GET() {
  return NextResponse.json({ federal_rules: getAllFederalRules(), state_rules: getAllStateRules(), available_states: getAvailableStates(), total: getAllFederalRules().length + getAllStateRules().length });
}
