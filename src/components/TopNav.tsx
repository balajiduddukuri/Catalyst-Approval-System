/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  PlayCircle,
  Table,
  Sliders,
  GitPullRequest,
  RotateCcw,
  Sparkles,
  BarChart3,
  BookOpen,
  Users,
  X,
  Mail,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { CATELYST_TEAM_METADATA, CATELYST_TEAM_MEMBERS } from '../data/defaultRules';

export type ActiveTab = 'validator' | 'simulator' | 'matrix' | 'studio' | 'requests' | 'analytics' | 'docs';

interface TopNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  healthScore: number;
  unresolvedIssuesCount: number;
  onRunValidation: () => void;
  onResetDefaults: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onTabChange,
  healthScore,
  unresolvedIssuesCount,
  onRunValidation,
  onResetDefaults,
}) => {
  const [showTeamModal, setShowTeamModal] = useState<boolean>(false);

  const getGateBadge = (role: string) => {
    if (role.includes('Requirements')) return 'Gate Hook 1 (Requirements)';
    if (role.includes('Architect') || role.includes('Engineering')) return 'Gate Hook 2 (Engineering)';
    if (role.includes('Review') || role.includes('PR')) return 'Gate Hook 3 (PR Release)';
    if (role.includes('Quality') || role.includes('Test')) return 'Gate Hook 4 (QA / Postman)';
    if (role.includes('Deployment') || role.includes('Operations')) return 'Gate Hook 5 (Production)';
    return 'Overall AIDLC Lead & Escalations';
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Zone 1: Brand Title & Team Leads Trigger */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold text-xs tracking-tight shadow-xs">
              CT
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-slate-900">
                  {CATELYST_TEAM_METADATA.teamName}
                </span>
                <span className="text-slate-300">/</span>
                <span className="text-xs text-slate-700 font-semibold hidden sm:inline">
                  AIDLC Gate Validator
                </span>
                <button
                  type="button"
                  onClick={() => setShowTeamModal(true)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-orange-50 hover:bg-orange-100 text-orange-700 font-mono text-[10px] font-bold border border-orange-200 transition-colors"
                  title="Click to display full Catelyst Team Leads list"
                >
                  <Users className="w-3 h-3" />
                  <span>Team Leads ({CATELYST_TEAM_MEMBERS.length})</span>
                </button>
              </div>
              <div className="text-[10px] text-slate-400 font-medium hidden sm:block">
                {CATELYST_TEAM_METADATA.mission} · Due {CATELYST_TEAM_METADATA.dueDate}
              </div>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => onTabChange('validator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                activeTab === 'validator'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Gate Linter</span>
              {unresolvedIssuesCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 font-mono">
                  {unresolvedIssuesCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => onTabChange('simulator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                activeTab === 'simulator'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Pipeline Simulator</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('matrix')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                activeTab === 'matrix'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Decision Matrix</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('studio')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                activeTab === 'studio'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Rule Studio</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('requests')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                activeTab === 'requests'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GitPullRequest className="w-3.5 h-3.5" />
              <span>Live SDLC Runs</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-orange-600" />
              <span>Analytics</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('docs')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                activeTab === 'docs'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-700" />
              <span>Docs & Architecture</span>
            </button>
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 text-xs font-mono tabular-nums text-slate-600">
              <span className="text-slate-400">Gate Integrity:</span>
              <span
                className={`font-semibold ${
                  healthScore >= 90
                    ? 'text-emerald-600'
                    : healthScore >= 70
                    ? 'text-amber-600'
                    : 'text-rose-600'
                }`}
              >
                {healthScore}%
              </span>
            </div>

            <button
              type="button"
              onClick={onResetDefaults}
              title="Reset Catelyst rules & tickets to baseline"
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onRunValidation}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shadow-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Validate Rules</span>
            </button>
          </div>
        </div>
      </header>

      {/* Full Catelyst Team Leads Modal */}
      {showTeamModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-3xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  CT
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">
                      Catelyst Team Leads & Gate Authorities
                    </h3>
                    <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-800 font-mono text-[10px] font-bold">
                      {CATELYST_TEAM_METADATA.teamCode}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Account: <strong>{CATELYST_TEAM_METADATA.account}</strong> · {CATELYST_TEAM_METADATA.mission}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowTeamModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Team Leads Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
              {CATELYST_TEAM_MEMBERS.map((member, idx) => (
                <div
                  key={member.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-orange-300 hover:shadow-xs transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold font-mono">
                        {idx + 1}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm">{member.name}</h4>
                    </div>

                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">
                      {getGateBadge(member.role).split(' ')[0]} {getGateBadge(member.role).split(' ')[1]}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-orange-800 block">
                      {member.role}
                    </span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Shield className="w-3 h-3 text-slate-400" />
                      <span>{getGateBadge(member.role)}</span>
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span className="font-mono text-[10px]">{member.email}</span>
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {member.account}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>All 7 team leads verified under AI/RUN Mission 2026 Charter</span>
              </span>

              <button
                type="button"
                onClick={() => setShowTeamModal(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
