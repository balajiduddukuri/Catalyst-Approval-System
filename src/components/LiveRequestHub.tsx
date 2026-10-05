/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Inbox,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileText,
  Search,
  Check,
  X,
  AlertCircle,
  FolderGit2,
  Terminal,
  GitPullRequest,
  Plus,
  Code2,
  Sparkles,
} from 'lucide-react';
import { ApprovalRequest, RequestStageState, SdlcStage, SubagentId, RiskLevel, McpTool } from '../types/rules';
import { AuditTrailModal } from './AuditTrailModal';

interface LiveRequestHubProps {
  requests: ApprovalRequest[];
  onApproveStage: (requestId: string, comments: string) => void;
  onRejectRequest: (requestId: string, reason: string) => void;
  onSelectForSimulation: (req: ApprovalRequest) => void;
  onAddRequest?: (newRequest: ApprovalRequest) => void;
}

export const LiveRequestHub: React.FC<LiveRequestHubProps> = ({
  requests,
  onApproveStage,
  onRejectRequest,
  onSelectForSimulation,
  onAddRequest,
}) => {
  const [selectedRequestId, setSelectedRequestId] = useState<string>(requests[0]?.id || '');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionComments, setActionComments] = useState<string>('');
  const [viewingAuditReq, setViewingAuditReq] = useState<ApprovalRequest | null>(null);

  // Add Ticket Modal State
  const [showAddTicketModal, setShowAddTicketModal] = useState<boolean>(false);
  const [ticketId, setTicketId] = useState<string>(`LVNV-${Math.floor(1100 + Math.random() * 800)}`);
  const [ticketTitle, setTicketTitle] = useState<string>('');
  const [sdlcStage, setSdlcStage] = useState<SdlcStage>('requirements');
  const [activeSubagent, setActiveSubagent] = useState<SubagentId>('scoping-agent');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('Medium');
  const [requesterName, setRequesterName] = useState<string>('Balaji Duddukuri');
  const [hasWriteAccess, setHasWriteAccess] = useState<boolean>(false);
  const [hasHumanApproval, setHasHumanApproval] = useState<boolean>(false);
  const [storyPoints, setStoryPoints] = useState<number>(3);
  const [notes, setNotes] = useState<string>('');

  // Artefact Inspection Modal State
  const [inspectingArtefactReq, setInspectingArtefactReq] = useState<ApprovalRequest | null>(null);

  const filteredRequests = requests.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        r.code.toLowerCase().includes(q) ||
        r.jiraTicketId.toLowerCase().includes(q) ||
        r.payload.jiraTitle.toLowerCase().includes(q) ||
        r.payload.requesterName.toLowerCase().includes(q) ||
        r.matchedRuleCode.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeRequest = requests.find((r) => r.id === selectedRequestId) || filteredRequests[0];

  const handleApprove = () => {
    if (!activeRequest) return;
    onApproveStage(activeRequest.id, actionComments || 'Gate hook authorized by Catalyst stage reviewer.');
    setActionComments('');
  };

  const handleReject = () => {
    if (!activeRequest) return;
    onRejectRequest(activeRequest.id, actionComments || 'Gate hook rejected. Subagent returned to revision loop.');
    setActionComments('');
  };

  const handleCreateNewTicketRun = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketTitle.trim()) return;

    const newId = `req-custom-${Date.now()}`;
    const newCode = `AIDLC-GATE-${Math.floor(200 + Math.random() * 800)}`;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const stagesConfig: RequestStageState[] = [
      {
        stageNumber: 1,
        stageName: 'Requirements & Scoping Gate',
        roleName: 'Requirements & Scoping Gate Owner',
        approverName: 'Ismail Chorwadwala',
        status: sdlcStage === 'requirements' ? 'pending' : 'approved',
        actionDate: sdlcStage === 'requirements' ? undefined : nowStr,
        comments: sdlcStage === 'requirements' ? undefined : 'Pre-approved in prior stage',
        gateHookVerified: sdlcStage !== 'requirements',
      },
      {
        stageNumber: 2,
        stageName: 'Architecture & Code Sign-off Gate',
        roleName: 'Lead Architect & Technical Lead',
        approverName: 'Harjinder Singh / Krishna',
        status: sdlcStage === 'engineering' ? 'pending' : sdlcStage === 'requirements' ? 'pending' : 'approved',
        actionDate: ['review', 'quality', 'operations'].includes(sdlcStage) ? nowStr : undefined,
        gateHookVerified: ['review', 'quality', 'operations'].includes(sdlcStage),
      },
      {
        stageNumber: 3,
        stageName: 'Reviewer Read-Only Invariant & PR Release',
        roleName: 'Release Engineer & Gate Auditor',
        approverName: 'Manish Sethi',
        status: sdlcStage === 'review' ? 'pending' : ['quality', 'operations'].includes(sdlcStage) ? 'approved' : 'pending',
        gateHookVerified: ['quality', 'operations'].includes(sdlcStage),
      },
      {
        stageNumber: 4,
        stageName: 'QA & API-Verifier Sign-off Gate',
        roleName: 'Quality & Test Automation Lead',
        approverName: 'Jagan Vijayakumar',
        status: sdlcStage === 'quality' ? 'pending' : sdlcStage === 'operations' ? 'approved' : 'pending',
        gateHookVerified: sdlcStage === 'operations',
      },
      {
        stageNumber: 5,
        stageName: 'Production Deploy Runbook Gate',
        roleName: 'Deploy & Ops Planning Lead',
        approverName: 'Vaibhav Singh / Balaji Duddukuri',
        status: sdlcStage === 'operations' ? 'pending' : 'pending',
        gateHookVerified: false,
      },
    ];

    const currentStageIndex =
      sdlcStage === 'requirements'
        ? 0
        : sdlcStage === 'engineering'
        ? 1
        : sdlcStage === 'review'
        ? 2
        : sdlcStage === 'quality'
        ? 3
        : 4;

    const newRequest: ApprovalRequest = {
      id: newId,
      code: newCode,
      jiraTicketId: ticketId.trim() || 'LVNV-1150',
      submittedAt: nowStr,
      status: 'pending',
      matchedRuleCode:
        activeSubagent === 'reviewer-agent' && hasWriteAccess
          ? 'TOOL-02'
          : sdlcStage === 'requirements'
          ? 'GATE-01'
          : 'PR-04',
      currentStageIndex,
      payload: {
        jiraTicketId: ticketId.trim() || 'LVNV-1150',
        jiraTitle: ticketTitle.trim(),
        sdlcStage,
        activeSubagent,
        mcpToolsUsed:
          activeSubagent === 'scoping-agent'
            ? ['Claude Code', 'Jira MCP']
            : activeSubagent === 'architect-agent' || activeSubagent === 'implementer-agent'
            ? ['Claude Code', 'PostgreSQL MCP']
            : activeSubagent === 'reviewer-agent'
            ? ['Claude Code', 'Read-Only Tools']
            : activeSubagent === 'tester-agent' || activeSubagent === 'api-verifier-agent'
            ? ['Claude Code', 'Postman MCP']
            : ['Claude Code'],
        hasWriteToolAccess: hasWriteAccess,
        hasHumanGateApproval: hasHumanApproval,
        riskLevel,
        artefactStoredInUn: true,
        artefactPath: `un/${sdlcStage}/${ticketId.trim()}-artefact.${sdlcStage === 'engineering' ? 'sql' : sdlcStage === 'quality' ? 'json' : 'md'}`,
        hasTelemetryLogging: true,
        isPrPublished: false,
        apiVerificationStatus: 'passed',
        estimatedStoryPoints: storyPoints,
        requesterName: requesterName.trim() || 'Balaji Duddukuri',
        requesterRole: 'AIDLC Orchestrator Lead Engineer',
        notes: notes.trim() || 'Custom Jira ticket SDLC run dispatched via Live Execution Hub.',
      },
      stages: stagesConfig,
      auditLogs: [
        {
          id: `log-init-${Date.now()}`,
          timestamp: nowStr,
          actor: requesterName.trim() || 'Balaji Duddukuri',
          action: 'DISPATCH_NEW_SDLC_RUN',
          details: `Enqueued ticket ${ticketId.trim()} at stage [${sdlcStage.toUpperCase()}] via subagent [${activeSubagent}].`,
          hash: `0x${Math.random().toString(16).substring(2, 10).toUpperCase()}`,
        },
      ],
    };

    if (onAddRequest) {
      onAddRequest(newRequest);
    }
    setSelectedRequestId(newRequest.id);
    setShowAddTicketModal(false);
    setTicketTitle('');
    setNotes('');
  };

  const getArtefactContent = (req: ApprovalRequest) => {
    const { jiraTicketId, payload } = req;
    if (payload.sdlcStage === 'requirements') {
      return `# Requirements Specification: ${jiraTicketId}
## Title: ${payload.jiraTitle}
**Authoring Subagent**: ${payload.activeSubagent} (Claude Code + Jira MCP)
**Target Gate**: Gate Hook 1 (Ismail Chorwadwala)
**Risk Level**: ${payload.riskLevel} | Story Points: ${payload.estimatedStoryPoints}

### User Story
As an authenticated enterprise user,
I want ${payload.jiraTitle.toLowerCase()}
So that operations remain compliant with zero gate bypasses.

### Acceptance Criteria
1. Subagent output strictly persisted under un/requirements/${jiraTicketId}-stories.md
2. No write permissions provisioned to unauthorized subagents.
3. Gate Hook sign-off required prior to unlocking Engineering stage.`;
    }

    if (payload.sdlcStage === 'engineering') {
      return `-- Database Migration Artefact: ${jiraTicketId}
-- Produced by Implementer Subagent (Claude Code + PostgreSQL MCP)
-- Sandboxed feature branch migration

BEGIN;

CREATE TABLE IF NOT EXISTS tbl_${jiraTicketId.toLowerCase().replace('-', '_')}_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_key VARCHAR(32) NOT NULL DEFAULT '${jiraTicketId}',
    stage VARCHAR(32) NOT NULL DEFAULT 'engineering',
    verified_by VARCHAR(64) DEFAULT 'Harjinder Singh',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_${jiraTicketId.toLowerCase().replace('-', '_')}_ticket 
ON tbl_${jiraTicketId.toLowerCase().replace('-', '_')}_audit (ticket_key);

COMMIT;`;
    }

    if (payload.sdlcStage === 'review') {
      return `# Code Audit & PR Review Findings: ${jiraTicketId}
**Auditor**: reviewer-agent (Claude Code - READ-ONLY)
**Gate Authority**: Manish Sethi (Gate Hook 3)

### Static Policy Verification
- Tool Scoping Check: ${payload.hasWriteToolAccess ? 'FAILED (Write tools detected!)' : 'PASSED (Read-only tools strictly enforced)'}
- Invariant RULE-TOOL-02: ${payload.hasWriteToolAccess ? 'BLOCKED' : 'VERIFIED'}
- Segregation of Duties: Verified. Subagent cannot self-authorize.

### Reviewer Verdict
Awaiting manual gate hook sign-off from Manish Sethi prior to PR merge.`;
    }

    if (payload.sdlcStage === 'quality') {
      return `{
  "testSuite": "${jiraTicketId}-postman-smoke",
  "generatedBy": "tester-agent",
  "verifiedBy": "api-verifier-agent",
  "gateHook": "Gate Hook 4 (Jagan Vijayakumar)",
  "environment": "Dev-Sandbox",
  "results": {
    "totalAssertions": 18,
    "passed": 18,
    "failed": 0,
    "postmanMcpStatus": "${payload.apiVerificationStatus.toUpperCase()}",
    "latencyP99Ms": 142
  }
}`;
    }

    return `# Operations Runbook: ${jiraTicketId}
**Subagents**: deploy-verification-agent & ops-planning-agent
**Gate Hook**: Gate Hook 5 (Vaibhav Singh / Balaji Duddukuri)

## Deployment Procedure
1. Container image digest verified against sha256 signatures.
2. Progressive canary deployment (10% -> 50% -> 100%).
3. Automated rollback condition: Error rate > 0.5% over 5-minute rolling window.
4. Level 3 telemetry verified: Token cost & cycle time logged.`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with "+ Add Ticket Run" Action */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <GitPullRequest className="w-4 h-4 text-orange-600" />
            <span>Live AIDLC Pipeline Execution & Gate Hook Sign-Off</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Active SDLC runs progressing through agentic subagents with mandatory human gate verification.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-md font-medium capitalize transition-colors ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Add Ticket Run Button */}
          <button
            type="button"
            onClick={() => setShowAddTicketModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Ticket Run</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Request List (5 cols) vs Sign-off Detail (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Request List */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search Jira key, title, reviewer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-slate-50/50"
            />
          </div>

          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {filteredRequests.map((req) => {
              const isSelected = req.id === activeRequest?.id;
              return (
                <div
                  key={req.id}
                  onClick={() => setSelectedRequestId(req.id)}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono font-bold text-[11px] px-1.5 py-0.2 rounded ${
                          isSelected ? 'bg-orange-600 text-white' : 'bg-orange-50 text-orange-700 border border-orange-200'
                        }`}
                      >
                        {req.jiraTicketId}
                      </span>
                      <span
                        className={`font-mono text-[10px] ${
                          isSelected ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        {req.code}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        req.status === 'approved'
                          ? 'text-emerald-400'
                          : req.status === 'rejected'
                          ? 'text-rose-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  <h4 className="font-semibold truncate mb-1">{req.payload.jiraTitle}</h4>

                  <div
                    className={`flex items-center justify-between text-[11px] ${
                      isSelected ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    <span>Stage: {req.payload.sdlcStage.toUpperCase()}</span>
                    <span className="font-mono text-[10px] text-right">
                      {req.payload.activeSubagent}
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredRequests.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                No matching pipeline runs found.
              </div>
            )}
          </div>
        </div>

        {/* Detailed Review & Sign-Off Panel */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
          {activeRequest ? (
            <>
              {/* Request Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded">
                      {activeRequest.jiraTicketId}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {activeRequest.code}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        activeRequest.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : activeRequest.status === 'rejected'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {activeRequest.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">
                    {activeRequest.payload.jiraTitle}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setInspectingArtefactReq(activeRequest)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                  >
                    <FolderGit2 className="w-3.5 h-3.5 text-orange-600" />
                    <span>View Artefact</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewingAuditReq(activeRequest)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>Audit Trail</span>
                  </button>
                </div>
              </div>

              {/* Subagent & Tool Scoping Context */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50/70 p-3 rounded-lg border border-slate-200/80">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                    SDLC STAGE
                  </span>
                  <span className="font-semibold text-slate-800 uppercase">
                    {activeRequest.payload.sdlcStage}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                    ACTIVE SUBAGENT
                  </span>
                  <span className="font-mono text-slate-800 font-semibold truncate block">
                    {activeRequest.payload.activeSubagent}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                    TOOL SCOPE
                  </span>
                  <span
                    className={`font-semibold ${
                      activeRequest.payload.hasWriteToolAccess
                        ? 'text-rose-600'
                        : 'text-emerald-700'
                    }`}
                  >
                    {activeRequest.payload.hasWriteToolAccess ? 'Write Tools Granted' : 'Read-Only Tools'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                    REQUESTER
                  </span>
                  <span className="font-medium text-slate-800 truncate block">
                    {activeRequest.payload.requesterName}
                  </span>
                </div>
              </div>

              {/* Multi-Stage Gate Hooks Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
                  <span>Mandatory Human Gate Hooks Chain</span>
                  <span className="text-[10px] font-mono text-slate-400 font-normal">
                    {activeRequest.stages.filter((s) => s.status === 'approved').length} of {activeRequest.stages.length} authorized
                  </span>
                </h4>

                <div className="space-y-2 text-xs">
                  {activeRequest.stages.map((stage, idx) => (
                    <div
                      key={stage.stageNumber}
                      className={`p-3 rounded-lg border flex items-center justify-between ${
                        stage.status === 'approved'
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : stage.status === 'rejected'
                          ? 'bg-rose-50/50 border-rose-200'
                          : idx === activeRequest.currentStageIndex
                          ? 'bg-orange-50/60 border-orange-300 ring-1 ring-orange-200'
                          : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                            stage.status === 'approved'
                              ? 'bg-emerald-600 text-white'
                              : stage.status === 'rejected'
                              ? 'bg-rose-600 text-white'
                              : idx === activeRequest.currentStageIndex
                              ? 'bg-orange-600 text-white'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {stage.status === 'approved' ? '✓' : stage.stageNumber}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">
                            {stage.stageName} · <span className="font-normal text-slate-600">{stage.roleName}</span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Designated Reviewer: <span className="font-medium text-slate-900">{stage.approverName}</span>
                          </div>
                          {stage.comments && (
                            <div className="text-[11px] text-slate-600 italic mt-1">
                              "{stage.comments}"
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-semibold uppercase tracking-wider text-[11px] block">
                          {stage.status}
                        </span>
                        {stage.actionDate && (
                          <span className="text-[10px] text-slate-400 font-mono block">
                            {stage.actionDate}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Form if Pending */}
              {activeRequest.status === 'pending' && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Gate Hook Reviewer Action
                  </h4>

                  <textarea
                    rows={2}
                    placeholder="Enter review findings, test validation notes, or rejection rationale..."
                    value={actionComments}
                    onChange={(e) => setActionComments(e.target.value)}
                    className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
                  />

                  <div className="flex items-center gap-3 justify-end">
                    <button
                      type="button"
                      onClick={handleReject}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject & Request Revision</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleApprove}
                      className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Authorize Gate Hook</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              No pipeline run selected. Select a Jira ticket run from the left queue.
            </div>
          )}
        </div>
      </div>

      {/* Add New SDLC Ticket Run Modal */}
      {showAddTicketModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <GitPullRequest className="w-5 h-5 text-orange-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Dispatch New AIDLC SDLC Ticket Run
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddTicketModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewTicketRun} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Jira Ticket ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LVNV-1150"
                    value={ticketId}
                    onChange={(e) => setTicketId(e.target.value)}
                    className="w-full px-3 py-1.5 font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    SDLC Stage *
                  </label>
                  <select
                    value={sdlcStage}
                    onChange={(e) => {
                      const st = e.target.value as SdlcStage;
                      setSdlcStage(st);
                      if (st === 'requirements') setActiveSubagent('scoping-agent');
                      else if (st === 'engineering') setActiveSubagent('implementer-agent');
                      else if (st === 'review') setActiveSubagent('reviewer-agent');
                      else if (st === 'quality') setActiveSubagent('tester-agent');
                      else setActiveSubagent('ops-planning-agent');
                    }}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
                  >
                    <option value="requirements">Requirements</option>
                    <option value="engineering">Engineering</option>
                    <option value="review">Review</option>
                    <option value="quality">Quality</option>
                    <option value="operations">Operations</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Feature / Ticket Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement Webhook Auth Verification Loop"
                  value={ticketTitle}
                  onChange={(e) => setTicketTitle(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Active Subagent
                  </label>
                  <select
                    value={activeSubagent}
                    onChange={(e) => setActiveSubagent(e.target.value as SubagentId)}
                    className="w-full px-3 py-1.5 font-mono text-[11px] border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
                  >
                    <option value="scoping-agent">scoping-agent</option>
                    <option value="requirements-agent">requirements-agent</option>
                    <option value="user-stories-agent">user-stories-agent</option>
                    <option value="architect-agent">architect-agent</option>
                    <option value="implementer-agent">implementer-agent</option>
                    <option value="tester-agent">tester-agent</option>
                    <option value="reviewer-agent">reviewer-agent</option>
                    <option value="pr-publisher-agent">pr-publisher-agent</option>
                    <option value="api-verifier-agent">api-verifier-agent</option>
                    <option value="deploy-verification-agent">deploy-verification-agent</option>
                    <option value="ops-planning-agent">ops-planning-agent</option>
                    <option value="aidlc-orchestrator">aidlc-orchestrator</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Risk Level
                  </label>
                  <select
                    value={riskLevel}
                    onChange={(e) => setRiskLevel(e.target.value as RiskLevel)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              {/* Invariant Toggles */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <span className="font-semibold text-slate-800 block text-[11px] uppercase tracking-wider">
                  Security & Gate Invariant Parameters
                </span>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Provision Write Tools to Subagent</span>
                  <input
                    type="checkbox"
                    checked={hasWriteAccess}
                    onChange={(e) => setHasWriteAccess(e.target.checked)}
                    className="rounded text-orange-600 focus:ring-orange-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Pre-Approved by Stage Reviewer</span>
                  <input
                    type="checkbox"
                    checked={hasHumanApproval}
                    onChange={(e) => setHasHumanApproval(e.target.checked)}
                    className="rounded text-orange-600 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Requester Name
                </label>
                <input
                  type="text"
                  value={requesterName}
                  onChange={(e) => setRequesterName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTicketModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-xs"
                >
                  Dispatch Ticket Run
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Artefact Inspection Modal */}
      {inspectingArtefactReq && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-orange-600" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Artefact Store Inspector: {inspectingArtefactReq.jiraTicketId}
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">
                    Path: {inspectingArtefactReq.payload.artefactPath || `un/${inspectingArtefactReq.payload.sdlcStage}/${inspectingArtefactReq.jiraTicketId}-artefact.md`}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectingArtefactReq(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Subagent: <strong className="text-slate-800 font-mono">{inspectingArtefactReq.payload.activeSubagent}</strong></span>
                <span>Stage: <strong className="text-slate-800 uppercase">{inspectingArtefactReq.payload.sdlcStage}</strong></span>
              </div>
              <pre className="p-4 bg-slate-950 text-emerald-400 rounded-xl font-mono text-xs overflow-x-auto max-h-96 whitespace-pre-wrap leading-relaxed">
                {getArtefactContent(inspectingArtefactReq)}
              </pre>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setInspectingArtefactReq(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Modal */}
      {viewingAuditReq && (
        <AuditTrailModal
          request={viewingAuditReq}
          onClose={() => setViewingAuditReq(null)}
        />
      )}
    </div>
  );
};
