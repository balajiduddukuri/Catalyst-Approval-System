/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Play,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Send,
  Zap,
  Terminal,
  Lock,
  GitPullRequest,
  Database,
  FileText,
  UserCheck,
  AlertOctagon,
} from 'lucide-react';
import {
  ApprovalRole,
  ApprovalRule,
  McpTool,
  RiskLevel,
  SdlcStage,
  SimulationPayload,
  SimulationResult,
  SubagentId,
} from '../types/rules';
import { CATELYST_SIMULATION_PRESETS } from '../data/defaultRules';

interface RuleSimulatorProps {
  rules: ApprovalRule[];
  roles: ApprovalRole[];
  onDispatchToLiveQueue: (payload: SimulationPayload, matchedRuleCode: string) => void;
  simulationResult: SimulationResult;
  currentPayload: SimulationPayload;
  onPayloadChange: (payload: SimulationPayload) => void;
  onRunSimulation: () => void;
}

export const RuleSimulator: React.FC<RuleSimulatorProps> = ({
  rules,
  roles,
  onDispatchToLiveQueue,
  simulationResult,
  currentPayload,
  onPayloadChange,
  onRunSimulation,
}) => {
  const [customPresets, setCustomPresets] = useState<{ name: string; payload: SimulationPayload }[]>([]);
  const [selectedPresetName, setSelectedPresetName] = useState<string>(CATELYST_SIMULATION_PRESETS[0].name);

  const allPresets = [...CATELYST_SIMULATION_PRESETS, ...customPresets];

  const handleSelectPreset = (presetName: string) => {
    const found = allPresets.find((p) => p.name === presetName);
    if (found) {
      setSelectedPresetName(presetName);
      onPayloadChange({ ...found.payload });
    }
  };

  const handleSaveCurrentAsScenario = () => {
    const newName = `Custom: ${currentPayload.jiraTicketId} (${currentPayload.sdlcStage})`;
    const newPreset = {
      name: newName,
      payload: JSON.parse(JSON.stringify(currentPayload)),
    };
    setCustomPresets((prev) => [...prev, newPreset]);
    setSelectedPresetName(newName);
  };

  const stages: { value: SdlcStage; label: string }[] = [
    { value: 'requirements', label: '1. Requirements & User Stories' },
    { value: 'engineering', label: '2. Architecture & Implementation' },
    { value: 'review', label: '3. Code Review & PR Publishing' },
    { value: 'quality', label: '4. Testing & API Verification' },
    { value: 'operations', label: '5. Ops Planning & Deployment' },
  ];

  const subagents: { id: SubagentId; label: string }[] = [
    { id: 'scoping-agent', label: 'Scoping Subagent (Jira MCP)' },
    { id: 'requirements-agent', label: 'Requirements Subagent' },
    { id: 'user-stories-agent', label: 'User-Stories Subagent (Jira MCP)' },
    { id: 'architect-agent', label: 'Architect Subagent (PostgreSQL MCP)' },
    { id: 'implementer-agent', label: 'Implementer Subagent (PostgreSQL MCP)' },
    { id: 'tester-agent', label: 'Tester Subagent (Postman MCP)' },
    { id: 'reviewer-agent', label: 'Reviewer Subagent (Read-Only by design)' },
    { id: 'pr-publisher-agent', label: 'PR-Publisher Subagent' },
    { id: 'api-verifier-agent', label: 'API-Verifier Subagent (Postman MCP)' },
    { id: 'deploy-verification-agent', label: 'Deploy-Verification Subagent' },
    { id: 'ops-planning-agent', label: 'Ops-Planning Subagent' },
    { id: 'aidlc-orchestrator', label: 'AIDLC Orchestrator Plugin' },
  ];

  const mcpOptions: McpTool[] = [
    'Claude Code',
    'Jira MCP',
    'PostgreSQL MCP',
    'Postman MCP',
    'Read-Only Tools',
  ];

  const toggleMcpTool = (tool: McpTool) => {
    const exists = currentPayload.mcpToolsUsed.includes(tool);
    const updated = exists
      ? currentPayload.mcpToolsUsed.filter((t) => t !== tool)
      : [...currentPayload.mcpToolsUsed, tool];
    onPayloadChange({ ...currentPayload, mcpToolsUsed: updated });
  };

  return (
    <div className="space-y-6">
      {/* Header and Preset Selector */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-600" />
              <span>AIDLC Pipeline Approval Gate Simulator</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate Jira ticket payloads through the 12 agentic SDLC subagents to test gate hooks, MCP tool permissions, and reviewer constraints.
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-2xl">
            <span className="text-xs font-semibold text-slate-400 shrink-0">Scenarios:</span>
            {allPresets.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleSelectPreset(preset.name)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all whitespace-nowrap shrink-0 ${
                  selectedPresetName === preset.name
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {preset.name.split(':')[0]}
              </button>
            ))}
            <button
              type="button"
              onClick={handleSaveCurrentAsScenario}
              className="px-2.5 py-1 text-xs font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg transition-all whitespace-nowrap shrink-0"
              title="Save current payload as a new reusable scenario"
            >
              + Save Scenario
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Payload Inputs vs Execution Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Simulation Payload Form (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-semibold text-slate-900">
              Pipeline Run & Subagent Parameters
            </h3>
            <span className="text-xs font-mono text-slate-400">JIRA PAYLOAD</span>
          </div>

          <div className="space-y-3.5">
            {/* Jira Ticket Key & Title */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jira Key
                </label>
                <input
                  type="text"
                  value={currentPayload.jiraTicketId}
                  onChange={(e) =>
                    onPayloadChange({ ...currentPayload, jiraTicketId: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-slate-50/50"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ticket Summary / Feature Title
                </label>
                <input
                  type="text"
                  value={currentPayload.jiraTitle}
                  onChange={(e) =>
                    onPayloadChange({ ...currentPayload, jiraTitle: e.target.value })
                  }
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-slate-50/50"
                />
              </div>
            </div>

            {/* Stage & Active Subagent */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  SDLC Stage
                </label>
                <select
                  value={currentPayload.sdlcStage}
                  onChange={(e) =>
                    onPayloadChange({
                      ...currentPayload,
                      sdlcStage: e.target.value as SdlcStage,
                    })
                  }
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-slate-50/50 font-medium"
                >
                  {stages.map((stg) => (
                    <option key={stg.value} value={stg.value}>
                      {stg.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Active Subagent
                </label>
                <select
                  value={currentPayload.activeSubagent}
                  onChange={(e) =>
                    onPayloadChange({
                      ...currentPayload,
                      activeSubagent: e.target.value as SubagentId,
                    })
                  }
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-slate-50/50 font-medium"
                >
                  {subagents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* MCP Tools Assigned */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                MCP Tool Access Granted to Subagent
              </label>
              <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-lg border border-slate-200">
                {mcpOptions.map((tool) => {
                  const active = currentPayload.mcpToolsUsed.includes(tool);
                  return (
                    <button
                      key={tool}
                      type="button"
                      onClick={() => toggleMcpTool(tool)}
                      className={`px-2 py-1 text-[11px] rounded-md font-mono transition-colors ${
                        active
                          ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {active ? '✓ ' : '+ '}
                      {tool}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Core Control Checks */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5 text-xs">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-semibold text-slate-900 block">
                    Human-Approval Gate Hook Satisfied
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Mandatory sign-off before proceeding to next stage
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={currentPayload.hasHumanGateApproval}
                  onChange={(e) =>
                    onPayloadChange({
                      ...currentPayload,
                      hasHumanGateApproval: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-600"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-200">
                <div>
                  <span className="font-semibold text-slate-900 block">
                    Subagent Has Write-Tool Permissions
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Must be FALSE for Reviewer subagent by architecture
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={currentPayload.hasWriteToolAccess}
                  onChange={(e) =>
                    onPayloadChange({
                      ...currentPayload,
                      hasWriteToolAccess: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-slate-900"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-200">
                <div>
                  <span className="font-semibold text-slate-900 block">
                    Artefact Persisted under "un/" Markdown Store
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Filesystem state store for transparent auditability
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={currentPayload.artefactStoredInUn}
                  onChange={(e) =>
                    onPayloadChange({
                      ...currentPayload,
                      artefactStoredInUn: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-slate-900"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-200">
                <div>
                  <span className="font-semibold text-slate-900 block">
                    Token Cost & Latency Telemetry Active
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Required for Milestone 1 Level 3 maturity claim
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={currentPayload.hasTelemetryLogging}
                  onChange={(e) =>
                    onPayloadChange({
                      ...currentPayload,
                      hasTelemetryLogging: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-slate-900"
                />
              </label>
            </div>

            {/* API Verification Status & Story Points */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  API-Verification Status
                </label>
                <select
                  value={currentPayload.apiVerificationStatus}
                  onChange={(e) =>
                    onPayloadChange({
                      ...currentPayload,
                      apiVerificationStatus: e.target.value as any,
                    })
                  }
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-slate-50/50"
                >
                  <option value="passed">Passed (Postman MCP)</option>
                  <option value="pending">Pending Execution</option>
                  <option value="in_progress_fix">In-Progress Fix (M1 issue)</option>
                  <option value="failed">Failed Tests</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Team Requester
                </label>
                <select
                  value={currentPayload.requesterName}
                  onChange={(e) =>
                    onPayloadChange({ ...currentPayload, requesterName: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-slate-50/50 font-medium"
                >
                  <option value="Balaji Duddukuri">Balaji Duddukuri</option>
                  <option value="Harjinder Singh">Harjinder Singh</option>
                  <option value="Ismail Chorwadwala">Ismail Chorwadwala</option>
                  <option value="Jagan Vijayakumar">Jagan Vijayakumar</option>
                  <option value="Krishnakumar Bada">Krishnakumar Bada</option>
                  <option value="Manish Sethi">Manish Sethi</option>
                  <option value="Vaibhav Singh">Vaibhav Singh</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onRunSimulation}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Evaluate Gate Rules</span>
            </button>

            {simulationResult.matchedRule && (
              <button
                type="button"
                onClick={() =>
                  onDispatchToLiveQueue(
                    currentPayload,
                    simulationResult.matchedRule?.code || 'GATE-01'
                  )
                }
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
                title="Send this ticket run to Live SDLC Runs queue"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit to SDLC Queue</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Execution Breakdown & Generated Approval Hierarchy (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Outcome Result Card */}
          <div
            className={`border rounded-xl p-5 shadow-xs bg-white ${
              simulationResult.outcome === 'GATE_APPROVED'
                ? 'border-emerald-200'
                : simulationResult.outcome === 'REQUIRES_GATE_HOOK'
                ? 'border-amber-300'
                : 'border-rose-300'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                {simulationResult.outcome === 'GATE_APPROVED' ? (
                  <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                ) : simulationResult.outcome === 'REQUIRES_GATE_HOOK' ? (
                  <Clock className="w-6 h-6 text-amber-600 shrink-0" />
                ) : (
                  <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0" />
                )}
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {simulationResult.outcome === 'GATE_APPROVED'
                      ? 'Gate Hook Authorized: Pipeline Permitted to Advance'
                      : simulationResult.outcome === 'REQUIRES_GATE_HOOK'
                      ? 'Gate Hook Engaged: Awaiting Human Approval'
                      : 'Stage Transition Blocked: Rule / Scoping Breach'}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    {simulationResult.decisionReason}
                  </p>
                </div>
              </div>

              {simulationResult.totalSlaHours > 0 && (
                <div className="text-right shrink-0">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">
                    Gate SLA
                  </span>
                  <span className="text-sm font-bold font-mono text-slate-800 tabular-nums">
                    {simulationResult.totalSlaHours}h
                  </span>
                </div>
              )}
            </div>

            {/* Policy & Tool Scoping Alerts */}
            {simulationResult.policyFlags.length > 0 && (
              <div className="mt-3 space-y-2">
                {simulationResult.policyFlags.map((flag, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg text-xs flex items-start justify-between gap-2.5 ${
                      flag.severity === 'error'
                        ? 'bg-rose-50 border border-rose-200 text-rose-800'
                        : 'bg-amber-50 border border-amber-200 text-amber-800'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold block">{flag.code}</span>
                        <span>{flag.message}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const updated = { ...currentPayload };
                        if (flag.code === 'GATE_HOOK_BLOCK') {
                          updated.hasHumanGateApproval = true;
                        } else if (flag.code === 'TOOL_SCOPING_VIOLATION') {
                          updated.hasWriteToolAccess = false;
                          updated.mcpToolsUsed = updated.mcpToolsUsed.filter((t) => t !== 'PostgreSQL MCP');
                        } else if (flag.code === 'UNPRIVILEGED_MCP_ACCESS') {
                          updated.mcpToolsUsed = updated.mcpToolsUsed.filter((t) => t !== 'PostgreSQL MCP');
                        } else if (flag.code === 'ARTEFACT_STORE_MISSING') {
                          updated.artefactStoredInUn = true;
                          updated.artefactPath = `un/${currentPayload.sdlcStage}/${currentPayload.jiraTicketId}-artefact.md`;
                        } else if (flag.code === 'TELEMETRY_UNTRACKED') {
                          updated.hasTelemetryLogging = true;
                        } else if (flag.code === 'API_VERIFIER_STABILITY') {
                          updated.apiVerificationStatus = 'passed';
                        }
                        onPayloadChange(updated);
                      }}
                      className="shrink-0 px-2 py-1 text-[11px] font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded shadow-2xs transition-colors whitespace-nowrap"
                    >
                      Fix In Payload
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Generated Approval Hierarchy Chain */}
            <div className="mt-4">
              <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2.5">
                Designated Stage Gate Reviewers
              </h4>

              {simulationResult.approvalChain.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-lg text-xs text-slate-500 text-center">
                  No gate hooks generated. Check rule criteria or tool permissions.
                </div>
              ) : (
                <div className="space-y-2">
                  {simulationResult.approvalChain.map((step, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
                        step.status === 'Gate-Verified'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                          : step.status === 'Flagged' || step.status === 'Blocked'
                          ? 'bg-rose-50/80 border-rose-300 text-rose-950'
                          : 'bg-amber-50/50 border-amber-200 text-amber-950'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-white border border-slate-300 text-slate-700 flex items-center justify-center font-bold text-[11px] shadow-2xs font-mono">
                          {step.stageNumber}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 flex items-center gap-2">
                            <span>{step.stageName}</span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              ({step.mode.replace('_', ' ')})
                            </span>
                          </div>
                          <div className="text-slate-600 text-[11px] mt-0.5">
                            Assigned Gate Reviewer:{' '}
                            <span className="font-semibold text-slate-900">
                              {step.approverName}
                            </span>
                          </div>
                          {step.gateWarning && (
                            <p className="text-[11px] text-rose-700 font-medium mt-1">
                              {step.gateWarning}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[11px] text-slate-500 font-mono tabular-nums block">
                          Timeout: {step.slaHours}h
                        </span>
                        {step.escalationTo && (
                          <span className="text-[10px] text-slate-400">
                            Escalates to: {step.escalationTo}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Rule Evaluation Trace List */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Step-by-Step Rule Evaluation Trace
              </h4>
              <span className="text-xs text-slate-400 font-mono">
                {simulationResult.ruleTraces.length} Active Rules Evaluated
              </span>
            </div>

            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {simulationResult.ruleTraces.map((trace) => (
                <div
                  key={trace.ruleId}
                  className={`p-3 rounded-lg border text-xs transition-colors ${
                    trace.passed
                      ? 'bg-emerald-50/40 border-emerald-300'
                      : 'bg-white border-slate-200 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                        {trace.ruleCode}
                      </span>
                      <span className="font-semibold text-slate-900">
                        {trace.ruleName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        P{trace.priority}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {trace.passed ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          SATISFIED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          <XCircle className="w-3 h-3 text-slate-400" />
                          SKIPPED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Conditions details */}
                  <div className="mt-2 pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    {trace.conditions.map((cond, cIdx) => (
                      <div
                        key={cIdx}
                        className={`p-1.5 rounded flex items-center justify-between ${
                          cond.satisfied ? 'bg-emerald-100/40 text-emerald-900' : 'bg-slate-50 text-slate-500'
                        }`}
                      >
                        <span className="font-mono text-[10px] truncate mr-2">
                          {cond.field} {cond.operator} {cond.expected}
                        </span>
                        <span className="font-mono font-semibold shrink-0">
                          {cond.satisfied ? '✓ Pass' : '✕ Fail'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
