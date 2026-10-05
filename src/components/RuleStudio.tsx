/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Save,
  Check,
  Sliders,
  ShieldCheck,
  Clock,
  ArrowUp,
  ArrowDown,
  Terminal,
} from 'lucide-react';
import {
  ApprovalRole,
  ApprovalRule,
  ApprovalStageConfig,
  ConditionField,
  ConditionOperator,
  RuleCondition,
  SdlcStage,
} from '../types/rules';

interface RuleStudioProps {
  rules: ApprovalRule[];
  roles: ApprovalRole[];
  selectedRuleId?: string;
  onSaveRule: (rule: ApprovalRule) => void;
  onDeleteRule: (ruleId: string) => void;
  onReorderPriority: (ruleId: string, direction: 'up' | 'down') => void;
}

export const RuleStudio: React.FC<RuleStudioProps> = ({
  rules,
  roles,
  selectedRuleId,
  onSaveRule,
  onDeleteRule,
  onReorderPriority,
}) => {
  const [activeRuleId, setActiveRuleId] = useState<string>(selectedRuleId || rules[0]?.id || '');

  const currentRule = rules.find((r) => r.id === activeRuleId) || rules[0];
  const [editingRule, setEditingRule] = useState<ApprovalRule>(
    currentRule ? JSON.parse(JSON.stringify(currentRule)) : rules[0]
  );
  const [saveToast, setSaveToast] = useState(false);

  const handleSelectRule = (ruleId: string) => {
    setActiveRuleId(ruleId);
    const r = rules.find((rule) => rule.id === ruleId);
    if (r) {
      setEditingRule(JSON.parse(JSON.stringify(r)));
    }
  };

  const handleAddNewRule = () => {
    const newRule: ApprovalRule = {
      id: `rule-custom-${Date.now()}`,
      code: `GATE-${Math.floor(10 + Math.random() * 90)}`,
      name: 'Custom Pipeline Stage Gate Hook',
      description: 'Human sign-off hook requirement before proceeding to subsequent stage.',
      sdlcStage: 'engineering',
      priority: rules.length + 1,
      active: true,
      matchStrategy: 'ALL',
      conditions: [
        {
          id: `c-${Date.now()}`,
          field: 'hasHumanGateApproval',
          operator: 'equals',
          value: true,
        },
      ],
      stages: [
        {
          stageNumber: 1,
          stageName: 'Stage Gate Authorization',
          approverRoleId: 'role-lead-orch',
          approverRoleName: 'AIDLC Orchestrator Lead',
          approverPersonName: 'Balaji Duddukuri',
          mode: 'gate_hook',
          timeoutHours: 12,
          escalationRoleId: 'role-eng-gate',
          escalationRoleName: 'Harjinder Singh',
          allowSelfApproval: false,
        },
      ],
      enforceGateHook: true,
      enforceReadOnlySubagent: false,
      enforceMcpScoping: true,
      requiresTelemetryLogging: true,
    };
    onSaveRule(newRule);
    setActiveRuleId(newRule.id);
    setEditingRule(newRule);
  };

  const handleAddCondition = () => {
    const newCond: RuleCondition = {
      id: `cond-${Date.now()}`,
      field: 'hasHumanGateApproval',
      operator: 'equals',
      value: true,
    };
    setEditingRule({
      ...editingRule,
      conditions: [...editingRule.conditions, newCond],
    });
  };

  const handleRemoveCondition = (condId: string) => {
    setEditingRule({
      ...editingRule,
      conditions: editingRule.conditions.filter((c) => c.id !== condId),
    });
  };

  const handleUpdateCondition = (condId: string, updates: Partial<RuleCondition>) => {
    setEditingRule({
      ...editingRule,
      conditions: editingRule.conditions.map((c) => (c.id === condId ? { ...c, ...updates } : c)),
    });
  };

  const handleAddStage = () => {
    const nextNumber = editingRule.stages.length + 1;
    const newStage: ApprovalStageConfig = {
      stageNumber: nextNumber,
      stageName: `Stage ${nextNumber} Gate Review`,
      approverRoleId: 'role-lead-orch',
      approverRoleName: 'AIDLC Orchestrator Lead',
      approverPersonName: 'Balaji Duddukuri / Harjinder Singh',
      mode: 'gate_hook',
      timeoutHours: 12,
      allowSelfApproval: false,
    };
    setEditingRule({
      ...editingRule,
      stages: [...editingRule.stages, newStage],
    });
  };

  const handleRemoveStage = (stageIdx: number) => {
    const newStages = editingRule.stages
      .filter((_, idx) => idx !== stageIdx)
      .map((stg, idx) => ({ ...stg, stageNumber: idx + 1 }));
    setEditingRule({
      ...editingRule,
      stages: newStages,
    });
  };

  const handleSave = () => {
    onSaveRule(editingRule);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Rule Selector & Priority Reordering (4 cols) */}
      <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Catelyst AIDLC Rules</h3>
            <p className="text-[11px] text-slate-500">Execution priority governs gate evaluation</p>
          </div>

          <button
            type="button"
            onClick={handleAddNewRule}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Rule</span>
          </button>
        </div>

        <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
          {rules
            .slice()
            .sort((a, b) => a.priority - b.priority)
            .map((r, idx) => (
              <div
                key={r.id}
                onClick={() => handleSelectRule(r.id)}
                className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between ${
                  r.id === activeRuleId
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                }`}
              >
                <div className="space-y-0.5 truncate flex-1 mr-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono font-bold text-[11px] px-1.5 py-0.2 rounded ${
                        r.id === activeRuleId ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {r.code}
                    </span>
                    <span className="font-semibold truncate">{r.name}</span>
                  </div>
                  <div
                    className={`text-[10px] truncate ${
                      r.id === activeRuleId ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {r.sdlcStage.toUpperCase()} · {r.stages.length} gate reviewer(s)
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => onReorderPriority(r.id, 'up')}
                    className={`p-1 rounded ${
                      r.id === activeRuleId
                        ? 'hover:bg-slate-800 text-slate-300 disabled:opacity-30'
                        : 'hover:bg-slate-200 text-slate-500 disabled:opacity-30'
                    }`}
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === rules.length - 1}
                    onClick={() => onReorderPriority(r.id, 'down')}
                    className={`p-1 rounded ${
                      r.id === activeRuleId
                        ? 'hover:bg-slate-800 text-slate-300 disabled:opacity-30'
                        : 'hover:bg-slate-200 text-slate-500 disabled:opacity-30'
                    }`}
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Right Column: Rule Editor Form (8 cols) */}
      <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
        {editingRule ? (
          <>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-slate-500">
                  EDITING {editingRule.code}
                </span>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  {editingRule.name}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                {saveToast && (
                  <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                    <Check className="w-4 h-4" /> Saved & Validated
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Gate Rule</span>
                </button>
              </div>
            </div>

            {/* General Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rule Code
                </label>
                <input
                  type="text"
                  value={editingRule.code}
                  onChange={(e) => setEditingRule({ ...editingRule, code: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs font-mono font-bold border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  SDLC Stage
                </label>
                <select
                  value={editingRule.sdlcStage}
                  onChange={(e) =>
                    setEditingRule({
                      ...editingRule,
                      sdlcStage: e.target.value as SdlcStage | 'global',
                    })
                  }
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium"
                >
                  <option value="global">Global (All Pipeline Stages)</option>
                  <option value="requirements">1. Requirements & User Stories</option>
                  <option value="engineering">2. Architecture & Implementation</option>
                  <option value="review">3. Code Review & PR Publishing</option>
                  <option value="quality">4. Testing & API Verification</option>
                  <option value="operations">5. Ops Planning & Deployment</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Match Strategy
                </label>
                <select
                  value={editingRule.matchStrategy}
                  onChange={(e) =>
                    setEditingRule({
                      ...editingRule,
                      matchStrategy: e.target.value as 'ALL' | 'ANY',
                    })
                  }
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  <option value="ALL">Match ALL Conditions (AND)</option>
                  <option value="ANY">Match ANY Condition (OR)</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rule Description & Policy Mandate
                </label>
                <input
                  type="text"
                  value={editingRule.description}
                  onChange={(e) =>
                    setEditingRule({ ...editingRule, description: e.target.value })
                  }
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            {/* Conditions Section */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Pipeline Conditions & Scoping Invariants
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Defines subagent constraints, write permissions, tool scopes, and gate flags.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddCondition}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Condition</span>
                </button>
              </div>

              <div className="space-y-2">
                {editingRule.conditions.map((cond) => (
                  <div
                    key={cond.id}
                    className="flex flex-col sm:flex-row items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200 text-xs shadow-2xs"
                  >
                    <select
                      value={cond.field}
                      onChange={(e) =>
                        handleUpdateCondition(cond.id, {
                          field: e.target.value as ConditionField,
                        })
                      }
                      className="w-full sm:w-48 px-2 py-1 border border-slate-200 rounded font-semibold text-slate-800"
                    >
                      <option value="hasHumanGateApproval">hasHumanGateApproval (Boolean)</option>
                      <option value="hasWriteToolAccess">hasWriteToolAccess (Boolean)</option>
                      <option value="activeSubagent">activeSubagent (ID)</option>
                      <option value="mcpToolsUsed">mcpToolsUsed (List)</option>
                      <option value="artefactStoredInUn">artefactStoredInUn (Boolean)</option>
                      <option value="hasTelemetryLogging">hasTelemetryLogging (Boolean)</option>
                      <option value="apiVerificationStatus">apiVerificationStatus</option>
                      <option value="sdlcStage">sdlcStage</option>
                      <option value="riskLevel">riskLevel</option>
                    </select>

                    <select
                      value={cond.operator}
                      onChange={(e) =>
                        handleUpdateCondition(cond.id, {
                          operator: e.target.value as ConditionOperator,
                        })
                      }
                      className="w-full sm:w-32 px-2 py-1 border border-slate-200 rounded text-slate-700"
                    >
                      <option value="equals">equals (=)</option>
                      <option value="not_equals">not equals (≠)</option>
                      <option value="contains">contains</option>
                      <option value="in">in</option>
                    </select>

                    <input
                      type="text"
                      value={String(cond.value)}
                      onChange={(e) => {
                        const val =
                          cond.field === 'hasHumanGateApproval' ||
                          cond.field === 'hasWriteToolAccess' ||
                          cond.field === 'artefactStoredInUn' ||
                          cond.field === 'hasTelemetryLogging'
                            ? e.target.value === 'true'
                            : e.target.value;
                        handleUpdateCondition(cond.id, { value: val });
                      }}
                      placeholder="Value (e.g. true, false, reviewer-agent)..."
                      className="w-full sm:flex-1 px-2.5 py-1 border border-slate-200 rounded font-mono"
                    />

                    <button
                      type="button"
                      onClick={() => handleRemoveCondition(cond.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      title="Remove Condition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Stages Section */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Designated Catelyst Gate Reviewers
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Defines responsible lead, gate hook mode, and escalation timeout.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddStage}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Gate Reviewer</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {editingRule.stages.map((stage, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white rounded-lg border border-slate-200 space-y-3 text-xs shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] font-mono">
                          {stage.stageNumber}
                        </span>
                        <input
                          type="text"
                          value={stage.stageName}
                          onChange={(e) => {
                            const newStages = [...editingRule.stages];
                            newStages[idx].stageName = e.target.value;
                            setEditingRule({ ...editingRule, stages: newStages });
                          }}
                          className="font-semibold text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-slate-900 focus:outline-none px-1"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveStage(idx)}
                        disabled={editingRule.stages.length <= 1}
                        className="text-slate-400 hover:text-rose-600 disabled:opacity-30 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Assigned Gate Lead
                        </label>
                        <select
                          value={stage.approverRoleId}
                          onChange={(e) => {
                            const r = roles.find((role) => role.id === e.target.value);
                            const newStages = [...editingRule.stages];
                            newStages[idx].approverRoleId = e.target.value;
                            newStages[idx].approverRoleName = r ? r.name : e.target.value;
                            newStages[idx].approverPersonName = r ? r.assignedPerson : 'Catelyst Lead';
                            setEditingRule({ ...editingRule, stages: newStages });
                          }}
                          className="w-full px-2 py-1 border border-slate-200 rounded text-xs"
                        >
                          {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.assignedPerson} ({role.name})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Gate SLA Timeout (Hours)
                        </label>
                        <input
                          type="number"
                          value={stage.timeoutHours}
                          onChange={(e) => {
                            const newStages = [...editingRule.stages];
                            newStages[idx].timeoutHours = Number(e.target.value);
                            setEditingRule({ ...editingRule, stages: newStages });
                          }}
                          className="w-full px-2 py-1 border border-slate-200 rounded text-xs font-mono tabular-nums"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Escalation Authority
                        </label>
                        <select
                          value={stage.escalationRoleId || ''}
                          onChange={(e) => {
                            const r = roles.find((role) => role.id === e.target.value);
                            const newStages = [...editingRule.stages];
                            newStages[idx].escalationRoleId = e.target.value || undefined;
                            newStages[idx].escalationRoleName = r ? r.assignedPerson : undefined;
                            setEditingRule({ ...editingRule, stages: newStages });
                          }}
                          className="w-full px-2 py-1 border border-slate-200 rounded text-xs"
                        >
                          <option value="">None (No Fallback)</option>
                          {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.assignedPerson}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Invariant Policy Toggles */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Catelyst Architecture Policy Invariants
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingRule.enforceGateHook}
                    onChange={(e) =>
                      setEditingRule({
                        ...editingRule,
                        enforceGateHook: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-orange-600 rounded"
                  />
                  <div>
                    <span className="font-semibold block text-slate-900">
                      Enforce Mandatory Human Gate Hook
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Hard-blocks downstream subagents until human signs off.
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingRule.requiresTelemetryLogging}
                    onChange={(e) =>
                      setEditingRule({
                        ...editingRule,
                        requiresTelemetryLogging: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-slate-900 rounded"
                  />
                  <div>
                    <span className="font-semibold block text-slate-900">
                      Require Token Cost & Latency Logging
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Instruments stage metrics for Level 3 maturity claim.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => onDeleteRule(editingRule.id)}
                disabled={rules.length <= 1}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:text-rose-900 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Rule</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Rule & Validate</span>
              </button>
            </div>
          </>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">
            Select a rule from the left panel to edit its parameters.
          </div>
        )}
      </div>
    </div>
  );
};
