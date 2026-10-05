/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ApprovalRole,
  ApprovalRule,
  ConditionEvaluationResult,
  GeneratedApprovalStep,
  RuleCondition,
  RuleEvaluationTrace,
  SimulationPayload,
  SimulationResult,
} from '../types/rules';

export function evaluateCondition(
  condition: RuleCondition,
  payload: SimulationPayload
): ConditionEvaluationResult {
  const { field, operator, value } = condition;
  const actualVal: any = payload[field as keyof SimulationPayload];
  let satisfied = false;

  const expectedStr = Array.isArray(value) ? value.join(', ') : String(value);
  const actualStr = actualVal !== undefined ? (Array.isArray(actualVal) ? actualVal.join(', ') : String(actualVal)) : 'undefined';

  switch (operator) {
    case 'equals':
      satisfied = String(actualVal).toLowerCase() === String(value).toLowerCase();
      break;

    case 'not_equals':
      satisfied = String(actualVal).toLowerCase() !== String(value).toLowerCase();
      break;

    case 'in':
      if (Array.isArray(value)) {
        satisfied = value.map((v) => String(v).toLowerCase()).includes(String(actualVal).toLowerCase());
      }
      break;

    case 'contains':
      if (Array.isArray(actualVal)) {
        satisfied = actualVal.map((v) => String(v).toLowerCase()).includes(String(value).toLowerCase());
      } else if (typeof actualVal === 'string') {
        satisfied = actualVal.toLowerCase().includes(String(value).toLowerCase());
      }
      break;

    default:
      satisfied = false;
  }

  return {
    conditionId: condition.id,
    field,
    operator,
    expected: expectedStr,
    actual: actualStr,
    satisfied,
  };
}

export function simulateRuleExecution(
  payload: SimulationPayload,
  rules: ApprovalRule[],
  roles: ApprovalRole[]
): SimulationResult {
  const activeRules = rules
    .filter((r) => r.active && (r.sdlcStage === 'global' || r.sdlcStage === payload.sdlcStage))
    .sort((a, b) => a.priority - b.priority);

  const roleMap = new Map<string, ApprovalRole>(roles.map((r) => [r.id, r]));
  const traces: RuleEvaluationTrace[] = [];
  const policyFlags: { severity: 'info' | 'warning' | 'error'; code: string; message: string }[] = [];

  let matchedRule: ApprovalRule | null = null;

  for (const rule of activeRules) {
    const conditionResults: ConditionEvaluationResult[] = [];
    let isMatch = true;

    if (rule.conditions.length === 0) {
      isMatch = true;
    } else if (rule.matchStrategy === 'ANY') {
      let anyTrue = false;
      for (const cond of rule.conditions) {
        const res = evaluateCondition(cond, payload);
        conditionResults.push(res);
        if (res.satisfied) anyTrue = true;
      }
      isMatch = anyTrue;
    } else {
      // 'ALL'
      for (const cond of rule.conditions) {
        const res = evaluateCondition(cond, payload);
        conditionResults.push(res);
        if (!res.satisfied) {
          isMatch = false;
        }
      }
    }

    traces.push({
      ruleId: rule.id,
      ruleCode: rule.code,
      ruleName: rule.name,
      priority: rule.priority,
      passed: isMatch,
      conditions: conditionResults,
      reason: isMatch
        ? `All ${conditionResults.length} criteria satisfied.`
        : `Criteria failed on ${conditionResults.filter((c) => !c.satisfied).map((c) => c.field).join(', ')}.`,
    });

    if (isMatch && !matchedRule) {
      matchedRule = rule;
    }
  }

  // Check 1: Mandatory Human Approval Gate Hook (Core North Star)
  if (!payload.hasHumanGateApproval) {
    policyFlags.push({
      severity: 'error',
      code: 'GATE_HOOK_BLOCK',
      message:
        'CRITICAL APPROVAL GATE HOOK ENGAGED: Subagent cannot proceed or publish pull request without mandatory human review and authorization.',
    });
  }

  // Check 2: Reviewer Subagent Read-Only Constraint
  if (payload.activeSubagent === 'reviewer-agent' && payload.hasWriteToolAccess) {
    policyFlags.push({
      severity: 'error',
      code: 'TOOL_SCOPING_VIOLATION',
      message:
        'ARCHITECTURAL BREACH: Reviewer subagent detected with write-tool permissions. Reviewer subagent must strictly possess read-only tools.',
    });
  }

  // Check 3: PostgreSQL MCP Isolation
  if (
    payload.mcpToolsUsed.includes('PostgreSQL MCP') &&
    payload.activeSubagent !== 'architect-agent' &&
    payload.activeSubagent !== 'implementer-agent'
  ) {
    policyFlags.push({
      severity: 'error',
      code: 'UNPRIVILEGED_MCP_ACCESS',
      message: `TOOL SCOPING BREACH: Subagent "${payload.activeSubagent}" attempted to invoke PostgreSQL MCP. Database access is strictly isolated to Architect and Implementer subagents.`,
    });
  }

  // Check 4: Artefact Store Markdown in un/
  if (!payload.artefactStoredInUn) {
    policyFlags.push({
      severity: 'warning',
      code: 'ARTEFACT_STORE_MISSING',
      message:
        'Artefact markdown not detected in "un/" store. Pipeline state must be persisted as markdown for transparency.',
    });
  }

  // Check 5: Milestone 1 Telemetry Gap Check
  if (!payload.hasTelemetryLogging) {
    policyFlags.push({
      severity: 'warning',
      code: 'TELEMETRY_UNTRACKED',
      message:
        'Milestone 1 Gap: Token cost and cycle time logging is not enabled for this run. Telemetry is required to substantiate Level 3 maturity.',
    });
  }

  // Check 6: API Verifier In-Progress Fix
  if (payload.apiVerificationStatus === 'in_progress_fix') {
    policyFlags.push({
      severity: 'warning',
      code: 'API_VERIFIER_STABILITY',
      message:
        'API-verifier stage has in-progress fixes and is not yet stable. Postman MCP validation must pass before production deployment.',
    });
  }

  // Build the approval chain
  const approvalChain: GeneratedApprovalStep[] = [];
  let totalSlaHours = 0;

  if (matchedRule) {
    matchedRule.stages.forEach((stage) => {
      const role = roleMap.get(stage.approverRoleId);
      const approverName = stage.approverPersonName || (role ? role.assignedPerson : 'Catalyst Lead');

      approvalChain.push({
        stageNumber: stage.stageNumber,
        stageName: stage.stageName,
        roleName: stage.approverRoleName,
        approverName,
        slaHours: stage.timeoutHours,
        escalationTo: stage.escalationRoleName,
        mode: stage.mode,
        status: payload.hasHumanGateApproval ? 'Gate-Verified' : 'Pending',
        gateWarning: !payload.hasHumanGateApproval
          ? 'Mandatory human approval gate hook actively blocking stage transition.'
          : undefined,
      });

      totalSlaHours += stage.timeoutHours;
    });
  }

  const hasBlockingError = policyFlags.some((f) => f.severity === 'error');
  const outcome = hasBlockingError
    ? 'GATE_VIOLATION_BLOCKED'
    : payload.hasHumanGateApproval
    ? 'GATE_APPROVED'
    : 'REQUIRES_GATE_HOOK';

  let decisionReason = matchedRule
    ? `Governed by Rule ${matchedRule.code} ("${matchedRule.name}")`
    : 'Evaluated against AIDLC baseline ruleset';

  if (outcome === 'GATE_APPROVED') {
    decisionReason += ' - Human gate hook authorized. Pipeline stage approved to proceed.';
  } else if (outcome === 'GATE_VIOLATION_BLOCKED') {
    decisionReason += ' - Blocked by hard-enforced approval gate hook or subagent tool scoping violation.';
  } else {
    decisionReason += ' - Awaiting designated Catalyst gate reviewer sign-off before downstream stages unlock.';
  }

  return {
    matchedRule,
    ruleTraces: traces,
    outcome,
    approvalChain,
    policyFlags,
    totalSlaHours,
    decisionReason,
  };
}
