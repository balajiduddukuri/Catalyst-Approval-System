/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SdlcStage =
  | 'requirements'
  | 'engineering'
  | 'review'
  | 'quality'
  | 'operations';

export type SubagentId =
  | 'scoping-agent'
  | 'requirements-agent'
  | 'user-stories-agent'
  | 'architect-agent'
  | 'implementer-agent'
  | 'tester-agent'
  | 'reviewer-agent'
  | 'pr-publisher-agent'
  | 'api-verifier-agent'
  | 'deploy-verification-agent'
  | 'ops-planning-agent'
  | 'aidlc-orchestrator';

export type McpTool =
  | 'Jira MCP'
  | 'PostgreSQL MCP'
  | 'Postman MCP'
  | 'Claude Code'
  | 'Read-Only Tools';

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  team: string; // Catalyst
  account: string; // LVNV-FALC
}

export interface ApprovalRole {
  id: string;
  name: string;
  title: string;
  stageOwner: SdlcStage | 'All';
  assignedPerson: string;
  email: string;
  isLead: boolean;
  fallbackRoleId?: string;
}

export type ConditionField =
  | 'sdlcStage'
  | 'activeSubagent'
  | 'mcpToolsUsed'
  | 'hasWriteToolAccess'
  | 'hasHumanGateApproval'
  | 'riskLevel'
  | 'artefactStoredInUn'
  | 'hasTelemetryLogging'
  | 'isPrPublished'
  | 'apiVerificationStatus'
  | 'estimatedStoryPoints';

export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'in'
  | 'contains';

export interface RuleCondition {
  id: string;
  field: ConditionField;
  operator: ConditionOperator;
  value: string | number | boolean | string[];
}

export interface ApprovalStageConfig {
  stageNumber: number;
  stageName: string;
  approverRoleId: string;
  approverRoleName: string;
  approverPersonName: string;
  mode: 'sequential' | 'parallel' | 'gate_hook' | 'auto_verify';
  timeoutHours: number;
  escalationRoleId?: string;
  escalationRoleName?: string;
  allowSelfApproval?: boolean;
}

export interface ApprovalRule {
  id: string;
  code: string; // e.g. "GATE-01", "TOOL-02", "PR-03"
  name: string;
  description: string;
  sdlcStage: SdlcStage | 'global';
  priority: number;
  active: boolean;
  matchStrategy: 'ALL' | 'ANY';
  conditions: RuleCondition[];
  stages: ApprovalStageConfig[];
  enforceGateHook: boolean; // Mandatory human-approval gate hard-enforced by hook
  enforceReadOnlySubagent: boolean; // e.g. Reviewer must have no write-tools
  enforceMcpScoping: boolean; // e.g. only Architect/Implementer have PostgreSQL MCP
  requiresTelemetryLogging: boolean; // Token cost + cycle time logging
  notes?: string;
}

export type ValidationSeverity = 'error' | 'warning' | 'info' | 'optimization';

export interface ValidationFinding {
  id: string;
  ruleId?: string;
  ruleCode?: string;
  type:
    | 'GATE_HOOK_BYPASS'
    | 'TOOL_SCOPING_VIOLATION'
    | 'CIRCULAR_ESCALATION'
    | 'MISSING_TELEMETRY'
    | 'UNSTABLE_API_VERIFIER'
    | 'UNREACHABLE_STAGE'
    | 'ARTEFACT_STORE_MISSING'
    | 'SHADOW_RULE';
  severity: ValidationSeverity;
  title: string;
  description: string;
  location: string;
  suggestion: string;
  autoFixAvailable: boolean;
  autoFixAction?: string;
}

export interface ValidationReport {
  timestamp: string;
  totalRules: number;
  activeRules: number;
  healthScore: number;
  status: 'HEALTHY' | 'WARNINGS' | 'CRITICAL_ISSUES';
  findings: ValidationFinding[];
  summary: {
    errors: number;
    warnings: number;
    optimizations: number;
  };
}

export interface SimulationPayload {
  jiraTicketId: string;
  jiraTitle: string;
  sdlcStage: SdlcStage;
  activeSubagent: SubagentId;
  mcpToolsUsed: McpTool[];
  hasWriteToolAccess: boolean;
  hasHumanGateApproval: boolean;
  riskLevel: RiskLevel;
  artefactStoredInUn: boolean;
  artefactPath?: string;
  hasTelemetryLogging: boolean;
  isPrPublished: boolean;
  apiVerificationStatus: 'passed' | 'pending' | 'in_progress_fix' | 'failed';
  estimatedStoryPoints: number;
  requesterName: string;
  requesterRole: string;
  notes?: string;
}

export interface ConditionEvaluationResult {
  conditionId: string;
  field: ConditionField;
  operator: ConditionOperator;
  expected: string;
  actual: string;
  satisfied: boolean;
}

export interface RuleEvaluationTrace {
  ruleId: string;
  ruleCode: string;
  ruleName: string;
  priority: number;
  passed: boolean;
  conditions: ConditionEvaluationResult[];
  reason?: string;
}

export interface GeneratedApprovalStep {
  stageNumber: number;
  stageName: string;
  roleName: string;
  approverName: string;
  slaHours: number;
  escalationTo?: string;
  mode: string;
  status: 'Pending' | 'Gate-Verified' | 'Flagged' | 'Blocked';
  gateWarning?: string;
}

export interface SimulationResult {
  matchedRule: ApprovalRule | null;
  ruleTraces: RuleEvaluationTrace[];
  outcome: 'GATE_APPROVED' | 'REQUIRES_GATE_HOOK' | 'GATE_VIOLATION_BLOCKED';
  approvalChain: GeneratedApprovalStep[];
  policyFlags: {
    severity: 'info' | 'warning' | 'error';
    code: string;
    message: string;
  }[];
  totalSlaHours: number;
  decisionReason: string;
}

export interface RequestStageState {
  stageNumber: number;
  stageName: string;
  roleName: string;
  approverName: string;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  actionDate?: string;
  comments?: string;
  signatureId?: string;
  gateHookVerified?: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
  hash: string;
  artefactRef?: string;
}

export interface ApprovalRequest {
  id: string;
  code: string;
  jiraTicketId: string;
  payload: SimulationPayload;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  matchedRuleCode: string;
  currentStageIndex: number;
  stages: RequestStageState[];
  auditLogs: AuditLogEntry[];
}
