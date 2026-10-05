/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, CheckCircle2, ShieldCheck, Clock, FileText, Lock, KeyRound, Terminal, FolderGit2 } from 'lucide-react';
import { ApprovalRequest } from '../types/rules';

interface AuditTrailModalProps {
  request: ApprovalRequest | null;
  onClose: () => void;
}

export const AuditTrailModal: React.FC<AuditTrailModalProps> = ({ request, onClose }) => {
  if (!request) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                {request.jiraTicketId}
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs font-mono font-bold text-slate-700">
                {request.code}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-1">
              {request.payload.jiraTitle}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs">
          {/* Summary Box */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <span className="text-slate-400 font-medium block">SDLC Stage</span>
              <span className="font-mono text-xs font-bold uppercase text-slate-900">
                {request.payload.sdlcStage}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Active Subagent</span>
              <span className="font-semibold text-slate-800 truncate block">
                {request.payload.activeSubagent}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Governance Rule</span>
              <span className="font-mono font-bold text-slate-900">
                {request.matchedRuleCode}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Gate Status</span>
              <span
                className={`font-semibold capitalize ${
                  request.status === 'approved'
                    ? 'text-emerald-700'
                    : request.status === 'rejected'
                    ? 'text-rose-700'
                    : 'text-amber-700'
                }`}
              >
                {request.status}
              </span>
            </div>
          </div>

          {/* Artefact Store in un/ */}
          {request.payload.artefactPath && (
            <div className="p-3 bg-slate-100/70 border border-slate-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-slate-600" />
                <span className="text-slate-600 font-semibold text-[11px]">
                  Persisted Artefact Store:
                </span>
                <code className="text-[11px] font-mono font-bold text-slate-900">
                  {request.payload.artefactPath}
                </code>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded font-semibold">
                MD Verified
              </span>
            </div>
          )}

          {/* Workflow Stages Progress */}
          <div>
            <h4 className="font-semibold text-slate-900 uppercase tracking-wider text-[11px] mb-3">
              Catelyst Human Approval Gate Hooks
            </h4>
            <div className="space-y-2.5">
              {request.stages.map((stage) => (
                <div
                  key={stage.stageNumber}
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    stage.status === 'approved'
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : stage.status === 'rejected'
                      ? 'bg-rose-50/50 border-rose-200'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] font-mono ${
                        stage.status === 'approved'
                          ? 'bg-emerald-600 text-white'
                          : stage.status === 'rejected'
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {stage.status === 'approved' ? '✓' : stage.stageNumber}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">
                        {stage.stageName} · <span className="font-normal text-slate-600">{stage.roleName}</span>
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        Gate Reviewer: <span className="font-medium text-slate-800">{stage.approverName}</span>
                      </div>
                      {stage.comments && (
                        <div className="text-slate-600 italic mt-1 bg-white/80 p-1.5 rounded border border-slate-100 text-[11px]">
                          "{stage.comments}"
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`font-semibold block ${
                        stage.status === 'approved'
                          ? 'text-emerald-700'
                          : stage.status === 'rejected'
                          ? 'text-rose-700'
                          : 'text-amber-600'
                      }`}
                    >
                      {stage.status.toUpperCase()}
                    </span>
                    {stage.signatureId && (
                      <span className="font-mono text-[10px] text-slate-400 block">
                        {stage.signatureId}
                      </span>
                    )}
                    {stage.actionDate && (
                      <span className="text-[10px] text-slate-400 block">
                        {stage.actionDate}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tamper-Evident Audit Trail Log */}
          <div>
            <h4 className="font-semibold text-slate-900 uppercase tracking-wider text-[11px] mb-3 flex items-center justify-between">
              <span>Timestamped Hook & Subagent Audit Trail</span>
              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1 font-normal">
                <KeyRound className="w-3 h-3 text-slate-400" /> Hook Ledger
              </span>
            </h4>

            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
              {request.auditLogs.map((log) => (
                <div key={log.id} className="p-3 bg-white hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-slate-400 tabular-nums">
                      {log.timestamp}
                    </span>
                    <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1 rounded">
                      hash:{log.hash}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-900 mt-0.5">
                    {log.action} · <span className="font-normal text-slate-600">{log.actor}</span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-0.5">{log.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
