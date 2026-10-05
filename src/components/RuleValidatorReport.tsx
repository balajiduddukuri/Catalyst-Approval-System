/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  Wrench,
  CheckCircle2,
  Lock,
  GitBranch,
  Terminal,
  Activity,
  Sparkles,
  Users,
  Layers,
  Database,
  FileCode,
  CheckCheck,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';
import { ValidationFinding, ValidationReport } from '../types/rules';
import { CATELYST_TEAM_METADATA, CATELYST_TEAM_MEMBERS } from '../data/defaultRules';

interface RuleValidatorReportProps {
  report: ValidationReport;
  onApplyAutoFix: (finding: ValidationFinding) => void;
  onApplyAllSuggestions: () => void;
  onJumpToRule: (ruleId?: string) => void;
  onInjectTestBug: () => void;
}

export const RuleValidatorReport: React.FC<RuleValidatorReportProps> = ({
  report,
  onApplyAutoFix,
  onApplyAllSuggestions,
  onJumpToRule,
  onInjectTestBug,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'error' | 'warning' | 'optimization'>('all');
  const [showAppliedToast, setShowAppliedToast] = useState(false);

  const filteredFindings = report.findings.filter((f) => {
    if (filterSeverity === 'all') return true;
    return f.severity === filterSeverity;
  });

  const handleImplementAll = () => {
    onApplyAllSuggestions();
    setShowAppliedToast(true);
    setTimeout(() => setShowAppliedToast(false), 3000);
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'error':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            <ShieldAlert className="w-3 h-3 text-rose-600" />
            Blocking Gate Breach
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            Gate Policy Warning
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
            <Info className="w-3 h-3 text-sky-600" />
            Milestone 1 Optimization
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification when suggestions applied */}
      {showAppliedToast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-900 text-white px-4 py-3 rounded-xl shadow-lg border border-emerald-700 flex items-center gap-3 transition-all animate-bounce">
          <CheckCheck className="w-5 h-5 text-emerald-400" />
          <div>
            <div className="font-bold text-xs">All Suggestions Implemented!</div>
            <div className="text-[11px] text-emerald-200">
              Gate hooks enforced, tool permissions scoped, and Milestone 1 telemetry active.
            </div>
          </div>
        </div>
      )}

      {/* Catalyst Mission & North Star Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="px-2 py-0.5 rounded bg-orange-600 text-white font-bold">
                {CATELYST_TEAM_METADATA.teamName}
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-300">{CATELYST_TEAM_METADATA.account}</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-300">Target Maturity: Level {CATELYST_TEAM_METADATA.targetLevel}</span>
            </div>

            <h1 className="text-lg font-bold text-white tracking-tight">
              AIDLC Orchestrator Approval Gate & Rule Validator
            </h1>

            <p className="text-xs text-slate-300 leading-relaxed">
              <span className="font-semibold text-white">North Star Goal: </span>
              {CATELYST_TEAM_METADATA.northStarGoal}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700">
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">
                  Shift From (Baseline)
                </span>
                <span className="text-slate-200 text-[11px]">
                  {CATELYST_TEAM_METADATA.shiftFrom}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700">
                <span className="text-orange-400 block text-[10px] uppercase tracking-wider font-semibold">
                  Shift To (Agentic + Hard Gate Hook)
                </span>
                <span className="text-white text-[11px] font-medium">
                  {CATELYST_TEAM_METADATA.shiftTo}
                </span>
              </div>
            </div>
          </div>

          {/* Catalyst Team Leads Full Roster */}
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 text-xs space-y-2 lg:w-80 shrink-0">
            <div className="flex items-center justify-between text-slate-300 font-semibold border-b border-slate-700 pb-1.5 text-[11px]">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-orange-400" />
                Catalyst Team Leads ({CATELYST_TEAM_MEMBERS.length})
              </span>
              <span className="font-mono text-orange-400 text-[10px] uppercase font-bold">1346-LVNV</span>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {CATELYST_TEAM_MEMBERS.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-1 rounded hover:bg-slate-700/40 text-[11px]">
                  <div className="truncate pr-2">
                    <span className="font-bold text-white block truncate">{m.name}</span>
                    <span className="text-[10px] text-orange-400 truncate block">{m.role}</span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 shrink-0">
                    {m.email.split('@')[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Health Score */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Gate Hook Compliance
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
                {report.healthScore}%
              </span>
              <span
                className={`text-xs font-semibold ${
                  report.healthScore >= 90
                    ? 'text-emerald-600'
                    : report.healthScore >= 70
                    ? 'text-amber-600'
                    : 'text-rose-600'
                }`}
              >
                {report.status === 'HEALTHY'
                  ? 'Audit Verified'
                  : report.status === 'WARNINGS'
                  ? 'Gaps Detected'
                  : 'Bypasses Found'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Evaluated across {report.activeRules} active rules
            </p>
          </div>
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              report.healthScore >= 90
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : report.healthScore >= 70
                ? 'bg-amber-50 text-amber-600 border border-amber-200'
                : 'bg-rose-50 text-rose-600 border border-rose-200'
            }`}
          >
            {report.healthScore >= 90 ? (
              <ShieldCheck className="w-6 h-6" />
            ) : (
              <ShieldAlert className="w-6 h-6" />
            )}
          </div>
        </div>

        {/* Blocking Violations */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Gate Hook Bypasses
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
              {report.summary.errors}
            </span>
            <span className="text-xs text-rose-600 font-medium">Blocking SDLC</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Missing gate hook, unassigned reviewers
          </p>
        </div>

        {/* Warnings */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Tool Scoping Alerts
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
              {report.summary.warnings}
            </span>
            <span className="text-xs text-amber-600 font-medium">Escalation checks</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Reviewer write access, Postgres scoping
          </p>
        </div>

        {/* Milestone 1 Optimizations */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Level 3 Optimizations
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
                {report.summary.optimizations}
              </span>
              <span className="text-xs text-sky-600 font-medium">M1 Instrumentations</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Token cost & cycle-time logging
            </p>
          </div>
        </div>
      </div>

      {/* Action Control Bar with "Implement All Suggestions" */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-slate-900 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-orange-600" />
            <span>Automated Hook Linting & Scoping Verifier</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Static analysis checks active rulesets to guarantee that subagents cannot bypass human sign-off hooks or escalate tool permissions.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onInjectTestBug}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
            title="Inject test tool scoping bug and gate bypass to observe linter detection"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Simulate Tool / Gate Defect</span>
          </button>

          <button
            type="button"
            onClick={handleImplementAll}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors shadow-xs"
            title="Automatically apply all recommended fixes and policy rules across the ruleset"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Implement All Suggestions ({report.findings.length})</span>
          </button>
        </div>
      </div>

      {/* Catalyst Milestone 1 Advice & Learning Checklist Card */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              AI/RUN Mission 2026 · Milestone 1 Advice & Invariant Checklist
            </h3>
          </div>
          <button
            type="button"
            onClick={handleImplementAll}
            className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            <span>Apply All Core Guidelines</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900">1. Mandatory Gate Hook</span>
              <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                ENFORCED
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Hard-enforced hook blocks every stage until human approves.
            </p>
          </div>

          <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900">2. Scoped Tool Access</span>
              <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                VERIFIED
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Reviewer has read-only tools; PostgreSQL MCP restricted to DB leads.
            </p>
          </div>

          <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900">3. Token & Latency Telemetry</span>
              <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                LEVEL 3 READY
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Captures token costs and cycle-time hooks for Level 3 maturity claim.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Diagnostic Findings ({report.findings.length})
          </span>
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setFilterSeverity('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterSeverity === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({report.findings.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterSeverity('error')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterSeverity === 'error'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Errors ({report.summary.errors})
            </button>
            <button
              type="button"
              onClick={() => setFilterSeverity('warning')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterSeverity === 'warning'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Warnings ({report.summary.warnings})
            </button>
            <button
              type="button"
              onClick={() => setFilterSeverity('optimization')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterSeverity === 'optimization'
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Optimizations ({report.summary.optimizations})
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-mono tabular-nums">
          Last validated: {new Date(report.timestamp).toLocaleTimeString()}
        </div>
      </div>

      {/* Findings List */}
      {filteredFindings.length === 0 ? (
        <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-emerald-950">
            All AIDLC Approval Gates & Tool Scopes Fully Verified
          </h3>
          <p className="text-xs text-emerald-700 max-w-lg mx-auto mt-1">
            Mandatory human gate hooks hard-enforced at every stage, reviewer subagent read-only constraint verified, and PostgreSQL MCP strictly scoped.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFindings.map((finding) => (
            <div
              key={finding.id}
              className={`bg-white border rounded-xl p-5 shadow-xs transition-all ${
                finding.severity === 'error'
                  ? 'border-rose-200 hover:border-rose-300'
                  : finding.severity === 'warning'
                  ? 'border-amber-200 hover:border-amber-300'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    {getSeverityBadge(finding.severity)}
                    <span className="text-xs font-mono text-slate-500 font-medium">
                      {finding.location}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-900">
                    {finding.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {finding.description}
                  </p>

                  <div className="mt-2.5 p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg text-xs text-slate-700 flex items-start gap-2">
                    <span className="font-semibold text-slate-900 shrink-0">Recommendation:</span>
                    <span>{finding.suggestion}</span>
                  </div>
                </div>

                <div className="flex items-center md:flex-col gap-2 shrink-0 md:w-44">
                  {finding.autoFixAvailable && (
                    <button
                      type="button"
                      onClick={() => onApplyAutoFix(finding)}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Implement Suggestion</span>
                    </button>
                  )}

                  {finding.ruleId && (
                    <button
                      type="button"
                      onClick={() => onJumpToRule(finding.ruleId)}
                      className="w-full px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors text-center"
                    >
                      Inspect in Rule Studio
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
