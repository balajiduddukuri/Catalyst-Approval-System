/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { TopNav, ActiveTab } from './components/TopNav';
import { RuleValidatorReport } from './components/RuleValidatorReport';
import { RuleSimulator } from './components/RuleSimulator';
import { DecisionTableView } from './components/DecisionTableView';
import { RuleStudio } from './components/RuleStudio';
import { LiveRequestHub } from './components/LiveRequestHub';
import { AnalyticsView } from './components/AnalyticsView';
import { DocumentationView } from './components/DocumentationView';
import {
  ApprovalRole,
  ApprovalRule,
  ApprovalRequest,
  SimulationPayload,
  ValidationFinding,
} from './types/rules';
import {
  CATELYST_TEAM_METADATA,
  CATELYST_GATE_ROLES,
  CATELYST_AIDLC_RULES,
  CATELYST_INITIAL_REQUESTS,
  CATELYST_SIMULATION_PRESETS,
} from './data/defaultRules';
import { validateApprovalRules } from './engine/ruleValidator';
import { simulateRuleExecution } from './engine/ruleEvaluator';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('validator');
  const [rules, setRules] = useState<ApprovalRule[]>(CATELYST_AIDLC_RULES);
  const [roles, setRoles] = useState<ApprovalRole[]>(CATELYST_GATE_ROLES);
  const [requests, setRequests] = useState<ApprovalRequest[]>(CATELYST_INITIAL_REQUESTS);
  const [targetStudioRuleId, setTargetStudioRuleId] = useState<string | undefined>(undefined);

  // Simulation state initialized with Catelyst Ticket LVNV-1042
  const [simPayload, setSimPayload] = useState<SimulationPayload>(
    CATELYST_SIMULATION_PRESETS[0].payload
  );

  // Static validation report
  const validationReport = useMemo(() => {
    return validateApprovalRules(rules, roles);
  }, [rules, roles]);

  // Live simulation execution
  const simulationResult = useMemo(() => {
    return simulateRuleExecution(simPayload, rules, roles);
  }, [simPayload, rules, roles]);

  // Handlers
  const handleToggleRuleActive = (ruleId: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, active: !r.active } : r))
    );
  };

  const handleSaveRule = (updatedRule: ApprovalRule) => {
    setRules((prev) => {
      const idx = prev.findIndex((r) => r.id === updatedRule.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updatedRule;
        return copy;
      }
      return [...prev, updatedRule];
    });
  };

  const handleDeleteRule = (ruleId: string) => {
    setRules((prev) => prev.filter((r) => r.id !== ruleId));
  };

  const handleReorderPriority = (ruleId: string, direction: 'up' | 'down') => {
    setRules((prev) => {
      const sorted = [...prev].sort((a, b) => a.priority - b.priority);
      const idx = sorted.findIndex((r) => r.id === ruleId);
      if (idx < 0) return prev;

      if (direction === 'up' && idx > 0) {
        const temp = sorted[idx].priority;
        sorted[idx].priority = sorted[idx - 1].priority;
        sorted[idx - 1].priority = temp;
      } else if (direction === 'down' && idx < sorted.length - 1) {
        const temp = sorted[idx].priority;
        sorted[idx].priority = sorted[idx + 1].priority;
        sorted[idx + 1].priority = temp;
      }

      return [...sorted];
    });
  };

  // 1-Click Auto-Fix Handler for Catelyst AIDLC rules
  const handleApplyAutoFix = (finding: ValidationFinding) => {
    if (!finding.ruleId && !finding.autoFixAction) return;

    setRules((prev) => {
      return prev.map((r) => {
        if (r.id === finding.ruleId) {
          const ruleCopy = { ...r };

          if (finding.autoFixAction === 'enable_gate_hook') {
            ruleCopy.enforceGateHook = true;
          } else if (finding.autoFixAction === 'enforce_read_only_reviewer') {
            ruleCopy.conditions = ruleCopy.conditions.map((c) =>
              c.field === 'hasWriteToolAccess' ? { ...c, value: false } : c
            );
            ruleCopy.enforceReadOnlySubagent = true;
          } else if (finding.autoFixAction === 'require_telemetry') {
            ruleCopy.requiresTelemetryLogging = true;
          } else if (finding.autoFixAction === 'add_escalation_lead') {
            ruleCopy.stages = ruleCopy.stages.map((stg) => ({
              ...stg,
              escalationRoleId: stg.escalationRoleId || 'role-lead-orch',
              escalationRoleName: stg.escalationRoleName || 'Balaji Duddukuri / Harjinder Singh',
            }));
          } else if (finding.autoFixAction === 'assign_lead_orchestrator') {
            ruleCopy.stages = ruleCopy.stages.map((stg) => ({
              ...stg,
              approverRoleId: 'role-lead-orch',
              approverRoleName: 'AIDLC Orchestrator Lead',
              approverPersonName: 'Balaji Duddukuri',
            }));
          }

          return ruleCopy;
        }
        return r;
      });
    });
  };

  // Implement All Suggestions across entire ruleset
  const handleApplyAllSuggestions = () => {
    setRules((prev) => {
      return prev.map((rule) => {
        const copy = { ...rule };
        // 1. Enforce mandatory human gate hook across all stages
        copy.enforceGateHook = true;
        // 2. Instrument telemetry & token-cost logging on all rules (Milestone 1 requirement)
        copy.requiresTelemetryLogging = true;
        // 3. Enforce Reviewer subagent read-only constraint
        if (copy.code === 'TOOL-02' || copy.sdlcStage === 'review') {
          copy.enforceReadOnlySubagent = true;
          copy.conditions = copy.conditions.map((c) =>
            c.field === 'hasWriteToolAccess' ? { ...c, value: false } : c
          );
        }
        // 4. Fallback escalation lead on all stages
        copy.stages = copy.stages.map((stg) => ({
          ...stg,
          escalationRoleId: stg.escalationRoleId || 'role-lead-orch',
          escalationRoleName: stg.escalationRoleName || 'Balaji Duddukuri / Harjinder Singh',
          approverRoleId: stg.approverRoleId || 'role-lead-orch',
          approverRoleName: stg.approverRoleName || 'AIDLC Orchestrator Lead',
          approverPersonName: stg.approverPersonName || 'Balaji Duddukuri',
        }));
        return copy;
      });
    });
  };

  // Inject defect / corner case for testing
  const handleInjectTestBug = () => {
    // Deliberately modify TOOL-02 to give write-tool access to reviewer subagent
    // and disable gate hook on PR-04 to observe instant linter flags
    setRules((prev) =>
      prev.map((r) => {
        if (r.code === 'TOOL-02') {
          return {
            ...r,
            conditions: r.conditions.map((c) =>
              c.field === 'hasWriteToolAccess' ? { ...c, value: true } : c
            ),
          };
        }
        if (r.code === 'PR-04') {
          return {
            ...r,
            enforceGateHook: false,
          };
        }
        return r;
      })
    );
  };

  const handleResetDefaults = () => {
    setRules(JSON.parse(JSON.stringify(CATELYST_AIDLC_RULES)));
    setRoles(JSON.parse(JSON.stringify(CATELYST_GATE_ROLES)));
    setRequests(JSON.parse(JSON.stringify(CATELYST_INITIAL_REQUESTS)));
    setSimPayload({ ...CATELYST_SIMULATION_PRESETS[0].payload });
  };

  const handleJumpToRule = (ruleId?: string) => {
    if (ruleId) {
      setTargetStudioRuleId(ruleId);
      setActiveTab('studio');
    }
  };

  const handleTestRuleInSimulator = (rule: ApprovalRule) => {
    setSimPayload({
      jiraTicketId: `LVNV-${Math.floor(1000 + Math.random() * 900)}`,
      jiraTitle: `Validation test for ${rule.name}`,
      sdlcStage: rule.sdlcStage === 'global' ? 'review' : rule.sdlcStage,
      activeSubagent:
        rule.code === 'TOOL-02'
          ? 'reviewer-agent'
          : rule.code === 'MCP-03'
          ? 'implementer-agent'
          : rule.code === 'PR-04'
          ? 'pr-publisher-agent'
          : 'aidlc-orchestrator',
      mcpToolsUsed:
        rule.code === 'MCP-03'
          ? ['Claude Code', 'PostgreSQL MCP']
          : ['Claude Code', 'Read-Only Tools'],
      hasWriteToolAccess: rule.code !== 'TOOL-02',
      hasHumanGateApproval: true,
      riskLevel: 'Medium',
      artefactStoredInUn: true,
      artefactPath: `un/${rule.sdlcStage}/test-artefact.md`,
      hasTelemetryLogging: true,
      isPrPublished: false,
      apiVerificationStatus: 'passed',
      estimatedStoryPoints: 5,
      requesterName: 'Balaji Duddukuri',
      requesterRole: 'AIDLC Orchestrator Lead Engineer',
      notes: `Generated from Decision Table to validate Rule ${rule.code}`,
    });
    setActiveTab('simulator');
  };

  const handleDispatchToLiveQueue = (payload: SimulationPayload, matchedRuleCode: string) => {
    const newReqId = `req-gen-${Date.now()}`;
    const newReqCode = `AIDLC-GATE-${Math.floor(100 + Math.random() * 900)}`;

    const newStages = simulationResult.approvalChain.map((step) => ({
      stageNumber: step.stageNumber,
      stageName: step.stageName,
      roleName: step.roleName,
      approverName: step.approverName,
      status: (step.status === 'Gate-Verified' ? 'approved' : 'pending') as 'pending' | 'approved' | 'rejected' | 'skipped',
      actionDate: step.status === 'Gate-Verified' ? new Date().toISOString().replace('T', ' ').substring(0, 16) : undefined,
      comments: step.status === 'Gate-Verified' ? 'Gate hook verified and passed.' : undefined,
      signatureId: step.status === 'Gate-Verified' ? `SIG-CAT-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
      gateHookVerified: step.status === 'Gate-Verified',
    }));

    const isAllApproved = newStages.every((s) => s.status === 'approved');

    const newRequest: ApprovalRequest = {
      id: newReqId,
      code: newReqCode,
      jiraTicketId: payload.jiraTicketId,
      payload: { ...payload },
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: isAllApproved ? 'approved' : 'pending',
      matchedRuleCode,
      currentStageIndex: isAllApproved ? newStages.length : 0,
      stages: newStages,
      auditLogs: [
        {
          id: `log-${Date.now()}-1`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          actor: payload.requesterName,
          action: 'PIPELINE_RUN_DISPATCHED',
          details: `Dispatched ${payload.jiraTicketId} (${payload.jiraTitle}) at stage ${payload.sdlcStage.toUpperCase()}. Matched ${matchedRuleCode}.`,
          hash: Math.random().toString(36).substring(2, 10),
          artefactRef: payload.artefactPath,
        },
        {
          id: `log-${Date.now()}-2`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          actor: 'Approval-Gate Hook',
          action: 'GATE_EVALUATION_LOGGED',
          details: `Gate Hook Status: ${simulationResult.decisionReason}`,
          hash: Math.random().toString(36).substring(2, 10),
        },
      ],
    };

    setRequests((prev) => [newRequest, ...prev]);
    setActiveTab('requests');
  };

  const handleApproveStage = (requestId: string, comments: string) => {
    setRequests((prev) =>
      prev.map((req) => {
        if (req.id !== requestId) return req;

        const currentIdx = req.currentStageIndex;
        if (currentIdx >= req.stages.length) return req;

        const updatedStages = [...req.stages];
        updatedStages[currentIdx] = {
          ...updatedStages[currentIdx],
          status: 'approved',
          actionDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
          comments,
          signatureId: `SIG-GATE-${Math.floor(1000 + Math.random() * 9000)}`,
          gateHookVerified: true,
        };

        const nextIdx = currentIdx + 1;
        const isFinished = nextIdx >= updatedStages.length;

        const newLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          actor: updatedStages[currentIdx].approverName,
          action: `GATE_STAGE_${currentIdx + 1}_AUTHORIZED`,
          details: `Human gate hook authorized for ${updatedStages[currentIdx].stageName}: "${comments}"`,
          hash: Math.random().toString(36).substring(2, 10),
        };

        return {
          ...req,
          stages: updatedStages,
          currentStageIndex: nextIdx,
          status: isFinished ? 'approved' : 'pending',
          auditLogs: [...req.auditLogs, newLog],
        };
      })
    );
  };

  const handleRejectRequest = (requestId: string, reason: string) => {
    setRequests((prev) =>
      prev.map((req) => {
        if (req.id !== requestId) return req;

        const currentIdx = req.currentStageIndex;
        const updatedStages = [...req.stages];
        if (currentIdx < updatedStages.length) {
          updatedStages[currentIdx] = {
            ...updatedStages[currentIdx],
            status: 'rejected',
            actionDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
            comments: reason,
          };
        }

        const newLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          actor: 'Catelyst Gate Authority',
          action: 'GATE_HOOK_REJECTED',
          details: `Stage ${currentIdx + 1} rejected: "${reason}". Subagent returned to revision loop.`,
          hash: Math.random().toString(36).substring(2, 10),
        };

        return {
          ...req,
          stages: updatedStages,
          status: 'rejected',
          auditLogs: [...req.auditLogs, newLog],
        };
      })
    );
  };

  const handleExportRulesJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(rules, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `catelyst_aidlc_approval_rules_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navigation */}
      <TopNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        healthScore={validationReport.healthScore}
        unresolvedIssuesCount={validationReport.findings.length}
        onRunValidation={() => setActiveTab('validator')}
        onResetDefaults={handleResetDefaults}
      />

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'validator' && (
          <RuleValidatorReport
            report={validationReport}
            onApplyAutoFix={handleApplyAutoFix}
            onApplyAllSuggestions={handleApplyAllSuggestions}
            onJumpToRule={handleJumpToRule}
            onInjectTestBug={handleInjectTestBug}
          />
        )}

        {activeTab === 'simulator' && (
          <RuleSimulator
            rules={rules}
            roles={roles}
            simulationResult={simulationResult}
            currentPayload={simPayload}
            onPayloadChange={setSimPayload}
            onRunSimulation={() => {}}
            onDispatchToLiveQueue={handleDispatchToLiveQueue}
          />
        )}

        {activeTab === 'matrix' && (
          <DecisionTableView
            rules={rules}
            roles={roles}
            onToggleRuleActive={handleToggleRuleActive}
            onEditRule={(ruleId) => {
              setTargetStudioRuleId(ruleId);
              setActiveTab('studio');
            }}
            onTestRuleInSimulator={handleTestRuleInSimulator}
            onExportRulesJson={handleExportRulesJson}
            onAddRule={(newRule) => {
              setRules((prev) => [...prev, newRule]);
            }}
          />
        )}

        {activeTab === 'studio' && (
          <RuleStudio
            rules={rules}
            roles={roles}
            selectedRuleId={targetStudioRuleId}
            onSaveRule={handleSaveRule}
            onDeleteRule={handleDeleteRule}
            onReorderPriority={handleReorderPriority}
          />
        )}

        {activeTab === 'requests' && (
          <LiveRequestHub
            requests={requests}
            onApproveStage={handleApproveStage}
            onRejectRequest={handleRejectRequest}
            onSelectForSimulation={(req) => {
              setSimPayload({ ...req.payload });
              setActiveTab('simulator');
            }}
            onAddRequest={(newReq) => {
              setRequests((prev) => [newReq, ...prev]);
            }}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            requests={requests}
            onSelectRequestForReview={(req) => {
              setSimPayload({ ...req.payload });
              setActiveTab('requests');
            }}
          />
        )}

        {activeTab === 'docs' && <DocumentationView />}
      </main>

      {/* Subtle Footer with Catelyst Metadata */}
      <footer className="border-t border-slate-200 bg-white py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">
              {CATELYST_TEAM_METADATA.teamName} · {CATELYST_TEAM_METADATA.teamCode}
            </span>
            <span>·</span>
            <span>{CATELYST_TEAM_METADATA.mission}</span>
            <span>·</span>
            <span className="text-orange-600 font-medium">12 Scoped Subagents & Hard Gate Hooks</span>
          </div>
          <div className="text-slate-400 font-mono text-[11px] tabular-nums">
            Active Rules: {rules.filter((r) => r.active).length} / {rules.length} · Target Maturity: Level {CATELYST_TEAM_METADATA.targetLevel}
          </div>
        </div>
      </footer>
    </div>
  );
}
