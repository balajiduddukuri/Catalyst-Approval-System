/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApprovalRole, ApprovalRule, ValidationFinding, ValidationReport } from '../types/rules';

export function validateApprovalRules(
  rules: ApprovalRule[],
  roles: ApprovalRole[]
): ValidationReport {
  const findings: ValidationFinding[] = [];
  const activeRules = rules.filter((r) => r.active).sort((a, b) => a.priority - b.priority);
  const roleMap = new Map<string, ApprovalRole>(roles.map((r) => [r.id, r]));

  // 1. Mandatory Human Approval Gate Hook Check
  activeRules.forEach((rule) => {
    // Check if gate hook is enforced
    if (!rule.enforceGateHook && rule.sdlcStage !== 'global') {
      findings.push({
        id: `finding-gate-hook-${rule.id}`,
        ruleId: rule.id,
        ruleCode: rule.code,
        type: 'GATE_HOOK_BYPASS',
        severity: 'error',
        title: `Mandatory Gate Hook Disabled on ${rule.code}`,
        description: `Rule ${rule.code} ("${rule.name}") allows pipeline progression without hard-enforcing a human-approval gate hook. This violates the North Star requirement: "Agent drafts every artefact; human approves at each gated stage."`,
        location: `Rule ${rule.code} > Gate Hook Policy`,
        suggestion: 'Enable "Enforce Mandatory Gate Hook" to block autonomous stage progression.',
        autoFixAvailable: true,
        autoFixAction: 'enable_gate_hook',
      });
    }

    // Check if stages exist
    if (!rule.stages || rule.stages.length === 0) {
      findings.push({
        id: `finding-empty-stages-${rule.id}`,
        ruleId: rule.id,
        ruleCode: rule.code,
        type: 'UNREACHABLE_STAGE',
        severity: 'error',
        title: `Rule Has No Designated Human Gate Reviewers`,
        description: `Rule ${rule.code} has zero approval stages or gate owners assigned. Incoming subagent outputs will be orphaned.`,
        location: `Rule ${rule.code}`,
        suggestion: 'Assign at least one stage reviewer (e.g. Manish Sethi for PR Review, Jagan Vijayakumar for Quality).',
        autoFixAvailable: true,
        autoFixAction: 'assign_default_reviewer',
      });
    }

    // Check approver role validity and fallback escalation
    rule.stages.forEach((stage, idx) => {
      if (!roleMap.has(stage.approverRoleId)) {
        findings.push({
          id: `finding-missing-role-${rule.id}-${idx}`,
          ruleId: rule.id,
          ruleCode: rule.code,
          type: 'UNREACHABLE_STAGE',
          severity: 'error',
          title: `Unassigned Gate Reviewer Role in Stage ${stage.stageNumber}`,
          description: `Gate reviewer role "${stage.approverRoleId}" does not exist in the Catelyst team roster.`,
          location: `Rule ${rule.code} > Stage ${stage.stageNumber}`,
          suggestion: 'Assign a valid Catelyst lead (e.g., Harjinder Singh, Balaji Duddukuri, Manish Sethi).',
          autoFixAvailable: true,
          autoFixAction: 'assign_lead_orchestrator',
        });
      }

      if (stage.timeoutHours > 0 && !stage.escalationRoleId && stage.mode !== 'auto_verify') {
        findings.push({
          id: `finding-missing-escalation-${rule.id}-${idx}`,
          ruleId: rule.id,
          ruleCode: rule.code,
          type: 'CIRCULAR_ESCALATION',
          severity: 'warning',
          title: `No Escalation Fallback for Gate Hook Stage ${stage.stageNumber}`,
          description: `Stage ${stage.stageNumber} has an SLA timeout of ${stage.timeoutHours}h, but no escalation lead is designated if the gate reviewer is away.`,
          location: `Rule ${rule.code} > Stage ${stage.stageNumber}`,
          suggestion: 'Set escalation path to AIDLC Orchestrator Lead (Balaji Duddukuri / Harjinder Singh).',
          autoFixAvailable: true,
          autoFixAction: 'add_escalation_lead',
        });
      }
    });

    // 2. Reviewer Subagent Read-Only Tool Scoping Check
    if (rule.code === 'TOOL-02' || rule.sdlcStage === 'review') {
      const writeToolCondition = rule.conditions.find(
        (c) => c.field === 'hasWriteToolAccess' && c.operator === 'equals' && c.value === true
      );
      if (writeToolCondition) {
        findings.push({
          id: `finding-tool-scoping-${rule.id}`,
          ruleId: rule.id,
          ruleCode: rule.code,
          type: 'TOOL_SCOPING_VIOLATION',
          severity: 'error',
          title: 'Reviewer Subagent Granted Write Tools (Architectural Breach)',
          description: `The Reviewer subagent is configured with write-tool access. By architectural specification, Reviewer subagent must strictly possess read-only tools to avoid unauthorized alterations during code reviews.`,
          location: `Rule ${rule.code} > Tool Permissions`,
          suggestion: 'Change hasWriteToolAccess to false and restrict to Read-Only tools.',
          autoFixAvailable: true,
          autoFixAction: 'enforce_read_only_reviewer',
        });
      }
    }

    // 3. Telemetry & Token Cost Logging Check (Milestone 1 gap from file)
    if (!rule.requiresTelemetryLogging && rule.priority <= 2) {
      findings.push({
        id: `finding-telemetry-gap-${rule.id}`,
        ruleId: rule.id,
        ruleCode: rule.code,
        type: 'MISSING_TELEMETRY',
        severity: 'optimization',
        title: 'Milestone 1 Telemetry Gap: Token Cost & Cycle-Time Tracking',
        description: `Rule ${rule.code} does not mandate telemetry logging. Team identified that without token cost and cycle-time instrumentation, Level 3 maturity claims cannot be substantiated.`,
        location: `Rule ${rule.code} > Telemetry Policy`,
        suggestion: 'Enable "Require Telemetry Logging" to capture AI token costs and stage latency metrics.',
        autoFixAvailable: true,
        autoFixAction: 'require_telemetry',
      });
    }
  });

  // 4. Circular Escalation Loops Across Catelyst Roles
  roles.forEach((role) => {
    const visited = new Set<string>();
    let current: ApprovalRole | undefined = role;
    while (current && current.fallbackRoleId) {
      if (visited.has(current.id)) {
        findings.push({
          id: `finding-circular-loop-${role.id}`,
          type: 'CIRCULAR_ESCALATION',
          severity: 'error',
          title: `Circular Gate Escalation Loop for ${role.name}`,
          description: `Escalation path from "${role.name}" cycles back onto itself ("${current.name}"), creating an infinite loop during pipeline blockages.`,
          location: `Role Directory > ${role.name}`,
          suggestion: 'Route terminal escalation directly to AIDLC Orchestrator Lead (Balaji Duddukuri).',
          autoFixAvailable: false,
        });
        break;
      }
      visited.add(current.id);
      current = roleMap.get(current.fallbackRoleId);
    }
  });

  // Calculate Health Score
  const errorCount = findings.filter((f) => f.severity === 'error').length;
  const warningCount = findings.filter((f) => f.severity === 'warning').length;
  const optCount = findings.filter((f) => f.severity === 'optimization').length;

  let score = 100 - errorCount * 25 - warningCount * 10 - optCount * 3;
  if (score < 0) score = 0;

  const status =
    errorCount > 0 ? 'CRITICAL_ISSUES' : warningCount > 0 ? 'WARNINGS' : 'HEALTHY';

  return {
    timestamp: new Date().toISOString(),
    totalRules: rules.length,
    activeRules: activeRules.length,
    healthScore: score,
    status,
    findings,
    summary: {
      errors: errorCount,
      warnings: warningCount,
      optimizations: optCount,
    },
  };
}
