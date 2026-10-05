/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Table,
  Check,
  X,
  Play,
  Edit2,
  Filter,
  Download,
  ShieldCheck,
  Terminal,
  Plus,
  Sparkles,
} from 'lucide-react';
import { ApprovalRule, SdlcStage, ApprovalRole } from '../types/rules';

interface DecisionTableViewProps {
  rules: ApprovalRule[];
  roles: ApprovalRole[];
  onToggleRuleActive: (ruleId: string) => void;
  onEditRule: (ruleId: string) => void;
  onTestRuleInSimulator: (rule: ApprovalRule) => void;
  onExportRulesJson: () => void;
  onAddRule?: (newRule: ApprovalRule) => void;
}

export const DecisionTableView: React.FC<DecisionTableViewProps> = ({
  rules,
  roles,
  onToggleRuleActive,
  onEditRule,
  onTestRuleInSimulator,
  onExportRulesJson,
  onAddRule,
}) => {
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Add Rule Form State
  const [ruleName, setRuleName] = useState<string>('');
  const [ruleCode, setRuleCode] = useState<string>(`RULE-${Math.floor(10 + Math.random() * 90)}`);
  const [ruleDescription, setRuleDescription] = useState<string>('');
  const [sdlcStage, setSdlcStage] = useState<SdlcStage | 'global'>('review');
  const [priority, setPriority] = useState<number>(rules.length + 1);
  const [enforceGateHook, setEnforceGateHook] = useState<boolean>(true);
  const [enforceReadOnly, setEnforceReadOnly] = useState<boolean>(false);
  const [requiresTelemetry, setRequiresTelemetry] = useState<boolean>(true);
  const [approverRoleId, setApproverRoleId] = useState<string>(roles[0]?.id || 'role-ismail');

  const filteredRules = rules
    .filter((r) => {
      if (selectedStage !== 'all' && r.sdlcStage !== selectedStage) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          r.name.toLowerCase().includes(q) ||
          r.code.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => a.priority - b.priority);

  const handleApplyTemplate = (type: 'security' | 'database' | 'telemetry' | 'canary') => {
    if (type === 'security') {
      setRuleCode(`SEC-${Math.floor(10 + Math.random() * 80)}`);
      setRuleName('Mandatory Static AppSec & Dependency Audit Gate');
      setRuleDescription('Blocks merge if high-severity CVEs or unreviewed external packages are detected by reviewer-agent.');
      setSdlcStage('review');
      setEnforceGateHook(true);
      setEnforceReadOnly(true);
      setApproverRoleId('role-manish');
    } else if (type === 'database') {
      setRuleCode(`DB-${Math.floor(10 + Math.random() * 80)}`);
      setRuleName('PostgreSQL Schema Migration Sandbox Verification');
      setRuleDescription('Verifies that SQL migration scripts execute without locking customer tables or dropping foreign keys.');
      setSdlcStage('engineering');
      setEnforceGateHook(true);
      setApproverRoleId('role-harjinder');
    } else if (type === 'telemetry') {
      setRuleCode(`MET-${Math.floor(10 + Math.random() * 80)}`);
      setRuleName('Autonomous Token-Cost & Cache Verification Gate');
      setRuleDescription('Tracks input/output token usage per Jira ticket run to ensure Level 3 AI cost ceiling is maintained.');
      setSdlcStage('global');
      setRequiresTelemetry(true);
      setApproverRoleId('role-balaji');
    } else if (type === 'canary') {
      setRuleCode(`OPS-${Math.floor(10 + Math.random() * 80)}`);
      setRuleName('Canary Progressive Rollout & Error-Budget Check');
      setRuleDescription('Verifies that the automated canary deployment achieves 0.0% error spike before complete production switch.');
      setSdlcStage('operations');
      setEnforceGateHook(true);
      setApproverRoleId('role-vaibhav');
    }
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim() || !ruleCode.trim()) return;

    const selectedRole = roles.find((r) => r.id === approverRoleId) || roles[0];

    const newRule: ApprovalRule = {
      id: `rule-custom-${Date.now()}`,
      code: ruleCode.trim().toUpperCase(),
      name: ruleName.trim(),
      description: ruleDescription.trim() || 'Custom AIDLC gate rule defined in Decision Matrix.',
      sdlcStage,
      priority,
      active: true,
      matchStrategy: 'ALL',
      conditions: [
        {
          id: `c-stage-${Date.now()}`,
          field: 'sdlcStage',
          operator: 'equals',
          value: sdlcStage === 'global' ? 'review' : sdlcStage,
        },
      ],
      stages: [
        {
          stageNumber: 1,
          stageName: `${ruleName.trim()} Hook`,
          approverRoleId: selectedRole.id,
          approverRoleName: selectedRole.name,
          approverPersonName: selectedRole.assignedPerson,
          mode: 'gate_hook',
          timeoutHours: 24,
        },
      ],
      enforceGateHook,
      enforceReadOnlySubagent: enforceReadOnly,
      enforceMcpScoping: sdlcStage === 'engineering',
      requiresTelemetryLogging: requiresTelemetry,
      notes: 'Added via AIDLC Decision Matrix.',
    };

    if (onAddRule) {
      onAddRule(newRule);
    }
    setShowAddModal(false);
    setRuleName('');
    setRuleDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Table className="w-4 h-4 text-orange-600" />
              <span>AIDLC Approval Gate Decision Matrix</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive decision table modeling subagent privileges, tool permissions, gate hook enforcements, and designated Catelyst reviewers.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Gate Rule</span>
            </button>

            <button
              type="button"
              onClick={onExportRulesJson}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export AIDLC Rules (JSON)</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">SDLC Stage:</span>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs overflow-x-auto">
              {['all', 'requirements', 'engineering', 'review', 'quality', 'operations', 'global'].map((stg) => (
                <button
                  key={stg}
                  type="button"
                  onClick={() => setSelectedStage(stg)}
                  className={`px-2.5 py-1 rounded-md font-medium capitalize transition-colors whitespace-nowrap ${
                    selectedStage === stg
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {stg === 'all' ? 'All Stages' : stg}
                </button>
              ))}
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search rule code, agent, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-slate-50/50"
            />
          </div>
        </div>
      </div>

      {/* High-Density Data Grid Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Pri</th>
                <th className="py-3 px-3">Rule Code & Name</th>
                <th className="py-3 px-3">SDLC Stage</th>
                <th className="py-3 px-3">Gate Hook Enforcement</th>
                <th className="py-3 px-3">Subagent Tool Boundary</th>
                <th className="py-3 px-3">Designated Gate Reviewer</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRules.map((rule) => {
                const primaryStage = rule.stages[0];
                return (
                  <tr
                    key={rule.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      !rule.active ? 'opacity-50 bg-slate-50/40' : ''
                    }`}
                  >
                    {/* Priority */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-400 text-center">
                      #{rule.priority}
                    </td>

                    {/* Rule Identity */}
                    <td className="py-3.5 px-3 max-w-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                          {rule.code}
                        </span>
                        <span className="font-bold text-slate-900 truncate">
                          {rule.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                        {rule.description}
                      </p>
                    </td>

                    {/* SDLC Stage */}
                    <td className="py-3.5 px-3">
                      <span className="font-mono text-[11px] uppercase font-semibold px-2 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">
                        {rule.sdlcStage}
                      </span>
                    </td>

                    {/* Gate Hook Policy */}
                    <td className="py-3.5 px-3">
                      {rule.enforceGateHook ? (
                        <div className="flex items-center gap-1.5 text-emerald-700 font-medium text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Mandatory Human Gate</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Subagent Direct</span>
                      )}
                    </td>

                    {/* Tool Boundary */}
                    <td className="py-3.5 px-3 text-[11px]">
                      {rule.enforceReadOnlySubagent ? (
                        <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-medium">
                          Strict Read-Only
                        </span>
                      ) : rule.enforceMcpScoping ? (
                        <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 font-medium">
                          Postgres MCP Scoped
                        </span>
                      ) : (
                        <span className="text-slate-500">Standard Claude Code</span>
                      )}
                    </td>

                    {/* Reviewer / Authority */}
                    <td className="py-3.5 px-3">
                      <span className="font-semibold text-slate-800 block text-[11px]">
                        {primaryStage?.approverPersonName || 'Unassigned'}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate max-w-[140px]">
                        {primaryStage?.approverRoleName}
                      </span>
                    </td>

                    {/* Active Toggle */}
                    <td className="py-3.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => onToggleRuleActive(rule.id)}
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-md transition-colors ${
                          rule.active
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                        }`}
                        title={rule.active ? 'Rule Active' : 'Rule Inactive'}
                      >
                        {rule.active ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onTestRuleInSimulator(rule)}
                          className="p-1.5 rounded-lg text-orange-600 hover:bg-orange-50 transition-colors"
                          title="Simulate Ticket Payload for this Gate Rule"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onEditRule(rule.id)}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                          title="Edit in Rule Studio"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredRules.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-slate-400">
                    No approval gate rules match your search or stage filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Gate Rule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-orange-600" />
                <h3 className="font-bold text-slate-900 text-sm">Create AIDLC Approval Gate Rule</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Quick Templates */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Quick Gate Templates:
              </span>
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleApplyTemplate('security')}
                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-orange-50 hover:text-orange-700 font-medium text-slate-700 transition-colors"
                >
                  🛡️ AppSec Gate
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyTemplate('database')}
                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-orange-50 hover:text-orange-700 font-medium text-slate-700 transition-colors"
                >
                  🗄️ Database Gate
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyTemplate('telemetry')}
                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-orange-50 hover:text-orange-700 font-medium text-slate-700 transition-colors"
                >
                  📊 Telemetry Gate
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyTemplate('canary')}
                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-orange-50 hover:text-orange-700 font-medium text-slate-700 transition-colors"
                >
                  🚀 Canary Deploy Gate
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Rule Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SEC-08"
                    value={ruleCode}
                    onChange={(e) => setRuleCode(e.target.value)}
                    className="w-full px-3 py-1.5 font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    SDLC Stage
                  </label>
                  <select
                    value={sdlcStage}
                    onChange={(e) => setSdlcStage(e.target.value as SdlcStage | 'global')}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
                  >
                    <option value="requirements">Requirements</option>
                    <option value="engineering">Engineering</option>
                    <option value="review">Review</option>
                    <option value="quality">Quality</option>
                    <option value="operations">Operations</option>
                    <option value="global">Global (All Stages)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Rule Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mandatory Reviewer Read-Only Verification"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Description / Invariant
                </label>
                <input
                  type="text"
                  placeholder="Policy enforcement rationale..."
                  value={ruleDescription}
                  onChange={(e) => setRuleDescription(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Designated Gate Authority Role
                </label>
                <select
                  value={approverRoleId}
                  onChange={(e) => setApproverRoleId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.assignedPerson})
                    </option>
                  ))}
                </select>
              </div>

              {/* Invariant Policy Toggles */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <span className="font-semibold text-slate-800 block text-[11px] uppercase tracking-wider">
                  Hard Invariants
                </span>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Mandatory Human Gate Hook</span>
                  <input
                    type="checkbox"
                    checked={enforceGateHook}
                    onChange={(e) => setEnforceGateHook(e.target.checked)}
                    className="rounded text-orange-600 focus:ring-orange-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Enforce Read-Only Tools (Zero Write Access)</span>
                  <input
                    type="checkbox"
                    checked={enforceReadOnly}
                    onChange={(e) => setEnforceReadOnly(e.target.checked)}
                    className="rounded text-orange-600 focus:ring-orange-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Enforce Level 3 Token & Latency Telemetry</span>
                  <input
                    type="checkbox"
                    checked={requiresTelemetry}
                    onChange={(e) => setRequiresTelemetry(e.target.checked)}
                    className="rounded text-orange-600 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-xs"
                >
                  Add Gate Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
