/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BookOpen,
  Layers,
  Sparkles,
  ShieldCheck,
  Terminal,
  Database,
  GitPullRequest,
  CheckCircle2,
  Lock,
  ArrowRight,
  ExternalLink,
  Users,
  Clock,
  Coins,
  Cpu,
  FolderGit2,
  FileText,
  Copy,
  Download,
  Plus,
  ThumbsUp,
  Filter,
  Check,
  Code2,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import { CATELYST_TEAM_METADATA, CATELYST_TEAM_MEMBERS } from '../data/defaultRules';

type DocSection = 'overview' | 'architecture' | 'enhancements';

interface EnhancementItem {
  id: string;
  code: string;
  title: string;
  category: 'Telemetry & Tracking' | 'Test Automation' | 'Cost & Optimization' | 'Security & Audit' | 'Developer Experience';
  gap: string;
  scope: string[];
  votes: number;
  status: 'Proposed' | 'In Milestone 2' | 'Under Review';
  author: string;
}

const INITIAL_ENHANCEMENTS: EnhancementItem[] = [
  {
    id: 'enh-1',
    code: 'ENHANCEMENT 01',
    title: 'Real-Time Jira Webhook & MCP Auto-Labeling',
    category: 'Telemetry & Tracking',
    gap: 'No Jira labels or delivery tracking in place; cycle-time metrics missing.',
    scope: [
      'Automated Jira label injection (aidlc-requirements, aidlc-review, aidlc-qa).',
      'Cycle-time timestamp recording on stage transitions to calculate true hours saved.',
      'Two-way webhook synchronization with team Jira board (LVNV-FALC).',
    ],
    votes: 18,
    status: 'In Milestone 2',
    author: 'Ismail Chorwadwala',
  },
  {
    id: 'enh-2',
    code: 'ENHANCEMENT 02',
    title: 'Self-Healing API-Verifier Loop via Postman MCP',
    category: 'Test Automation',
    gap: 'API-verification stage has in-progress fixes and is not yet stable.',
    scope: [
      'In-memory Postman collection execution sandbox with automated retry backoff.',
      'Error feedback loop returning HTTP 500 error traces to implementer-agent for autonomous patch drafting.',
      'Stabilization gate ensuring zero deployment until smoke test suite passes 100%.',
    ],
    votes: 24,
    status: 'In Milestone 2',
    author: 'Jagan Vijayakumar',
  },
  {
    id: 'enh-3',
    code: 'ENHANCEMENT 03',
    title: 'Fine-Grained AI Token-Cost & Cache Tracker',
    category: 'Cost & Optimization',
    gap: 'AI token cost untracked, blocking verified Level 3 ROI claims.',
    scope: [
      'Real-time token consumption meter per ticket run (Input/Output tokens + Claude Code prompt caching efficiency).',
      'Cost allocation by stage ($/requirements vs $/implementation).',
      'Integrated into the Recharts Analytics dashboard.',
    ],
    votes: 31,
    status: 'In Milestone 2',
    author: 'Balaji Duddukuri',
  },
  {
    id: 'enh-4',
    code: 'ENHANCEMENT 04',
    title: 'Ed25519 Cryptographic Multi-Party Gate Hook Signatures',
    category: 'Security & Audit',
    gap: 'Gate signatures currently use lightweight simulated digital hashes (SIG-CAT-XXXX).',
    scope: [
      'Asymmetric keypair verification for each team lead (Ismail, Harjinder, Manish, Jagan, Balaji).',
      'Cryptographically signed gate hook payload written into git commit metadata.',
      'Immutable audit proof for enterprise compliance (SOX, ISO-27001).',
    ],
    votes: 15,
    status: 'Proposed',
    author: 'Harjinder Singh',
  },
  {
    id: 'enh-5',
    code: 'ENHANCEMENT 05',
    title: 'Offline PWA & Git Pre-Commit Hook CLI (aidlc-gate-hook)',
    category: 'Developer Experience',
    gap: 'Engineers must manually check the web portal rather than catching gate breaches in their local terminal.',
    scope: [
      'Lightweight CLI (npx aidlc-gate-hook) executed as a git pre-commit / pre-push hook.',
      'Evaluates active stage rules and subagent tool constraints locally before pushing code.',
      'Offline caching with PWA service worker support for remote field reviews.',
    ],
    votes: 22,
    status: 'Proposed',
    author: 'Balaji Duddukuri',
  },
];

const ARCHITECTURE_DOC_TEXT = `# Catalyst · AIDLC Orchestrator Architecture & Approval Gate Specification

**AI/RUN Mission 2026 · Milestone 1**  
**Team**: Catalyst (1346-LVNV-FALC)  
**Account**: LVNV-FALC  
**Target Maturity Level**: Level 3  

## 1. Executive Summary & North Star
The Catalyst AIDLC Orchestrator is a custom Claude Code plugin that converts traditional, manual SDLC stages into an autonomous, agentic pipeline.
* Baseline: Fully manual code writing, PR review, test-case writing, dev test execution.
* Target State: Agent drafts every artefact; human approves or decides at each gated stage before workflow proceeds.

## 2. The 5 Gated Stages & Gate Hooks
1. Requirements Stage: Scoping, Requirements, User-Stories Agents -> Gate Hook 1: Ismail Chorwadwala
2. Engineering Stage: Architect, Implementer Agents -> Gate Hook 2: Harjinder Singh / Krishna
3. Code Review & Release Stage: Reviewer (Read-Only), PR-Publisher -> Gate Hook 3: Manish Sethi
4. Quality & API Verification Stage: Tester, API-Verifier -> Gate Hook 4: Jagan Vijayakumar
5. Operations & Deployment Stage: Deploy-Verification, Ops-Planning -> Gate Hook 5: Vaibhav Singh / Balaji Duddukuri

## 3. The 12 Scoped Subagents & Tool Isolation Matrix
- scoping-agent: Claude Code + Jira MCP (Read-only intake)
- requirements-agent: Claude Code (Markdown under un/)
- user-stories-agent: Claude Code + Jira MCP (Jira issue story linkage)
- architect-agent: Claude Code + PostgreSQL MCP (Schema introspection only)
- implementer-agent: Claude Code + PostgreSQL MCP (Restricted to feature branch)
- tester-agent: Claude Code + Postman MCP (Sandboxed test execution)
- reviewer-agent: Claude Code (ZERO write tools by design)
- pr-publisher-agent: Claude Code, Git (Hard Gate Hook blocked)
- api-verifier-agent: Claude Code + Postman MCP (M1 stability fix in progress)
- deploy-verification-agent: Claude Code (Read-only cluster verification)
- ops-planning-agent: Claude Code (Runbooks persisted under un/)
- aidlc-orchestrator: Claude Code Plugin (Gate hook policy supervisor)

## 4. Hard-Enforced Invariant Gate Policies
- RULE-GATE-01: Mandatory Human Sign-off before downstream stage unlocks.
- RULE-TOOL-02: Reviewer subagent granted strictly read-only tools; zero write tools.
- RULE-MCP-03: PostgreSQL MCP isolated strictly to Architect & Implementer subagents.
- RULE-PR-04: PR publishing prohibited without Gate Hook 3 sign-off.
- RULE-API-05: API-verifier test failures or in-progress status halt release.
- RULE-UN-06: Every subagent artefact must be written to un/ store for inspection.
- RULE-MET-07: Token cost and cycle time tracking enforced for Level 3 maturity claim.
`;

export const DocumentationView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<DocSection>('architecture');
  const [copiedDoc, setCopiedDoc] = useState(false);

  // Enhancement Roadmap state
  const [enhancements, setEnhancements] = useState<EnhancementItem[]>(INITIAL_ENHANCEMENTS);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<EnhancementItem['category']>('Telemetry & Tracking');
  const [newGap, setNewGap] = useState('');
  const [newScope, setNewScope] = useState('');
  const [newAuthor, setNewAuthor] = useState('Balaji Duddukuri');

  // Interactive Architecture Stage Inspector
  const [selectedStageId, setSelectedStageId] = useState<number>(2);

  const handleCopyDoc = () => {
    navigator.clipboard.writeText(ARCHITECTURE_DOC_TEXT);
    setCopiedDoc(true);
    setTimeout(() => setCopiedDoc(false), 2000);
  };

  const handleDownloadDoc = () => {
    const blob = new Blob([ARCHITECTURE_DOC_TEXT], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'CATALYST-AIDLC-ARCHITECTURE.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUpvote = (id: string) => {
    setEnhancements((prev) =>
      prev.map((item) => (item.id === id ? { ...item, votes: item.votes + 1 } : item))
    );
  };

  const handleCreateEnhancement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newGap.trim()) return;

    const newItem: EnhancementItem = {
      id: `enh-${Date.now()}`,
      code: `ENHANCEMENT 0${enhancements.length + 1}`,
      title: newTitle.trim(),
      category: newCategory,
      gap: newGap.trim(),
      scope: newScope
        ? newScope.split('\n').filter((s) => s.trim().length > 0)
        : ['Automated subagent workflow extension.', 'Gate validation check implementation.'],
      votes: 1,
      status: 'Proposed',
      author: newAuthor.trim() || 'Balaji Duddukuri',
    };

    setEnhancements((prev) => [newItem, ...prev]);
    setShowAddModal(false);
    setNewTitle('');
    setNewGap('');
    setNewScope('');
  };

  const filteredEnhancements = enhancements.filter((item) => {
    if (filterCategory === 'All') return true;
    return item.category === filterCategory;
  });

  const stageDetails = [
    {
      stageNum: 1,
      name: 'Requirements & Scoping',
      owner: 'Ismail Chorwadwala',
      gateName: 'GATE HOOK 1',
      subagents: ['scoping-agent', 'requirements-agent', 'user-stories-agent'],
      tools: ['Claude Code', 'Jira MCP'],
      invariants: ['Read-only Jira intake', 'Persists user stories under un/requirements/'],
      artefact: 'un/requirements/{TICKET}-stories.md',
      sampleSnippet: `# Requirements Spec for {TICKET}\n## Gherkin User Story\nScenario: Scoped subagent executes gated flow\n  Given incoming ticket\n  When requirements verified\n  Then Gate Hook 1 triggered for Ismail`,
    },
    {
      stageNum: 2,
      name: 'Engineering & Architecture',
      owner: 'Harjinder Singh / Krishna',
      gateName: 'GATE HOOK 2',
      subagents: ['architect-agent', 'implementer-agent'],
      tools: ['Claude Code', 'PostgreSQL MCP'],
      invariants: ['Only Architect/Implementer allowed PostgreSQL MCP', 'DDL migrations must execute in sandbox'],
      artefact: 'un/engineering/{TICKET}-migration.sql',
      sampleSnippet: `-- Database Migration for {TICKET}\nCREATE TABLE IF NOT EXISTS aidlc_ticket_audit (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  stage_code VARCHAR(32) NOT NULL,\n  gate_hook_signed BOOLEAN DEFAULT FALSE\n);`,
    },
    {
      stageNum: 3,
      name: 'Code Review & PR Release',
      owner: 'Manish Sethi',
      gateName: 'GATE HOOK 3',
      subagents: ['reviewer-agent', 'pr-publisher-agent'],
      tools: ['Claude Code (Read-Only)', 'Git'],
      invariants: ['Reviewer must have ZERO write tools', 'PR publication prohibited without Hook 3 sign-off'],
      artefact: 'un/review/{TICKET}-findings.md',
      sampleSnippet: `# Code Audit Findings for {TICKET}\n- Static Analysis: PASS (0 defects)\n- Tool Scoping: PASSED (No write tools provisioned to reviewer-agent)\n- Gate Authority: Awaiting Manish Sethi approval`,
    },
    {
      stageNum: 4,
      name: 'Quality & API Verification',
      owner: 'Jagan Vijayakumar',
      gateName: 'GATE HOOK 4',
      subagents: ['tester-agent', 'api-verifier-agent'],
      tools: ['Claude Code', 'Postman MCP'],
      invariants: ['Postman smoke tests must achieve 100% pass', 'api-verifier in_progress_fix halts release'],
      artefact: 'un/quality/{TICKET}-tests.json',
      sampleSnippet: `{\n  "collection": "{TICKET}-smoke-suite",\n  "totalTests": 24,\n  "passed": 24,\n  "failed": 0,\n  "postmanMcpStatus": "PASSED"\n}`,
    },
    {
      stageNum: 5,
      name: 'Operations & Deployment',
      owner: 'Vaibhav Singh / Balaji Duddukuri',
      gateName: 'GATE HOOK 5',
      subagents: ['deploy-verification-agent', 'ops-planning-agent'],
      tools: ['Claude Code', 'Read-Only Cloud MCP'],
      invariants: ['Runbook generated under un/operations/', 'Cluster rollout telemetry verified'],
      artefact: 'un/operations/{TICKET}-runbook.md',
      sampleSnippet: `# Deployment Runbook for {TICKET}\n- Rollout Strategy: Canary (10% -> 50% -> 100%)\n- Rollback Trigger: Error budget variance > 2%\n- Signed by: Vaibhav Singh & Balaji Duddukuri`,
    },
  ];

  const activeStageDetail = stageDetails.find((s) => s.stageNum === selectedStageId) || stageDetails[1];

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Actions */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-orange-600 text-white font-mono text-[10px] font-bold">
              {CATELYST_TEAM_METADATA.teamName}
            </span>
            <span className="text-xs font-mono text-slate-400">
              {CATELYST_TEAM_METADATA.account} · AI/RUN Mission 2026
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-orange-600" />
            <span>AIDLC System Architecture & Documentation</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Engineering specifications, subagent tool-scoping matrices, and Milestone 2/3 roadmap enhancements.
          </p>
        </div>

        {/* Section Navigation Tabs & Export Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setActiveSection('overview')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                activeSection === 'overview'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>1. System Overview</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('architecture')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                activeSection === 'architecture'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-orange-600" />
              <span>2. High-Level Architecture</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('enhancements')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                activeSection === 'enhancements'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>3. Scope for Enhancements</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopyDoc}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-2xs"
              title="Copy ARCHITECTURE.md markdown"
            >
              {copiedDoc ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedDoc ? 'Copied!' : 'Copy Doc'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadDoc}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs"
              title="Download ARCHITECTURE.md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .md</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: SYSTEM OVERVIEW */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-100 pb-2">
              The Catalyst Mission & Paradigm Shift
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Catalyst's mission under **AI/RUN 2026 (Milestone 1)** addresses the critical pain point of slow deliverables across the SDLC. Before this programme, all code writing, pull request review, test-case writing, and dev test verification were 100% manual.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Baseline (Shift From)
                </span>
                <p className="text-xs font-medium text-slate-800">
                  {CATELYST_TEAM_METADATA.shiftFrom}
                </p>
                <p className="text-[11px] text-slate-500">
                  High developer friction, manual context switching between Jira, IDE, and test tools.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-orange-50/60 border border-orange-200 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700">
                  Target State (Shift To)
                </span>
                <p className="text-xs font-bold text-slate-900">
                  {CATELYST_TEAM_METADATA.shiftTo}
                </p>
                <p className="text-[11px] text-orange-950 font-medium">
                  Autonomous agents draft all artefacts while human gate hooks strictly prevent unapproved merges or deployments.
                </p>
              </div>
            </div>
          </div>

          {/* Quickstart Guide */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-100 pb-2">
              Application Modules Quickstart
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Gate Linter</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Static analysis detecting gate hook bypasses, unassigned reviewers, and reviewer write tool violations.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-orange-600" />
                  <span>Pipeline Simulator</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Test Jira ticket payloads through subagents to evaluate gate hook behavior and tool constraints.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <GitPullRequest className="w-4 h-4 text-slate-800" />
                  <span>Live SDLC Runs</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Authorize or reject live ticket runs with reviewer sign-off signatures and cryptographic audit logs.
                </p>
              </div>
            </div>
          </div>

          {/* Team Roles */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-100 pb-2">
              Catalyst Team Gate Authorities Roster
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {CATELYST_TEAM_MEMBERS.map((m) => (
                <div key={m.id} className="p-3 bg-slate-50/70 border border-slate-200 rounded-lg">
                  <span className="font-bold text-slate-900 block">{m.name}</span>
                  <span className="text-[11px] text-orange-600 font-semibold block">{m.role}</span>
                  <span className="text-[10px] text-slate-400 font-mono block mt-1">{m.email}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: HIGH LEVEL ARCHITECTURE */}
      {activeSection === 'architecture' && (
        <div className="space-y-6">
          {/* Interactive Visual Stage Pipeline Diagram */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xs border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-orange-400 uppercase tracking-wider">
                  SYSTEM DESIGN OVERVIEW · CLICK STAGE TO INSPECT
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  End-to-End AIDLC Pipeline & Gate Hook Architecture
                </h3>
              </div>
              <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2.5 py-1 rounded border border-slate-700">
                5 Gated Stages · 12 Subagents · 4 MCPs
              </span>
            </div>

            {/* Pipeline Steps Flow */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
              {stageDetails.map((stage) => {
                const isSelected = stage.stageNum === selectedStageId;
                return (
                  <button
                    key={stage.stageNum}
                    type="button"
                    onClick={() => setSelectedStageId(stage.stageNum)}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-slate-800 border-orange-500 shadow-md ring-1 ring-orange-500/50'
                        : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-orange-400' : 'text-slate-400'}`}>
                          STAGE {stage.stageNum}
                        </span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                        )}
                      </div>
                      <h4 className="font-bold text-white text-xs mt-0.5">{stage.name}</h4>
                      <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                        {stage.subagents.join(', ')}
                      </p>
                      <div className="mt-2 text-[10px] font-mono text-slate-400 space-y-0.5">
                        {stage.tools.map((t) => (
                          <div key={t}>• {t}</div>
                        ))}
                      </div>
                    </div>
                    <div className="pt-2 mt-3 border-t border-slate-700/80">
                      <span className="text-[10px] text-orange-400 font-bold block uppercase tracking-wider">
                        {stage.gateName}
                      </span>
                      <span className="text-[11px] text-white font-medium truncate block">
                        {stage.owner}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Interactive Stage Deep-Dive Card */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/70 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold text-xs font-mono">
                    S{activeStageDetail.stageNum}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Stage {activeStageDetail.stageNum}: {activeStageDetail.name}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Designated Gate Hook: <span className="text-orange-400 font-semibold">{activeStageDetail.gateName}</span> · Authority: <span className="text-white font-medium">{activeStageDetail.owner}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                  <FolderGit2 className="w-3.5 h-3.5 text-orange-400" />
                  <span>Artefact: {activeStageDetail.artefact}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Active Subagents & Tools */}
                <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-700/80 space-y-2">
                  <span className="text-[10px] font-mono text-orange-400 uppercase tracking-wider font-bold block">
                    ACTIVE SUBAGENTS & TOOLS
                  </span>
                  <div className="space-y-1">
                    {activeStageDetail.subagents.map((ag) => (
                      <div key={ag} className="font-mono text-[11px] text-slate-200 flex items-center gap-1.5">
                        <Terminal className="w-3 h-3 text-orange-400" />
                        <span>{ag}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                    Permitted MCPs: <span className="text-white">{activeStageDetail.tools.join(', ')}</span>
                  </div>
                </div>

                {/* Invariant Security Policies */}
                <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-700/80 space-y-2">
                  <span className="text-[10px] font-mono text-orange-400 uppercase tracking-wider font-bold block">
                    INVARIANT SECURITY RULES
                  </span>
                  <ul className="space-y-1 text-[11px] text-slate-300 list-disc list-inside">
                    {activeStageDetail.invariants.map((inv, idx) => (
                      <li key={idx}>{inv}</li>
                    ))}
                  </ul>
                </div>

                {/* Artefact Preview */}
                <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-700/80 space-y-2">
                  <span className="text-[10px] font-mono text-orange-400 uppercase tracking-wider font-bold block">
                    MOCK ARTEFACT UNDER un/ STORE
                  </span>
                  <pre className="text-[10px] font-mono text-emerald-400 bg-slate-950 p-2 rounded overflow-x-auto max-h-24 whitespace-pre-wrap">
                    {activeStageDetail.sampleSnippet}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* The 12 Scoped Subagents Table */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-100 pb-2">
              The 12 Scoped Subagents & Tool Access Control Matrix
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Subagent Name</th>
                    <th className="py-2.5 px-3">Role & Responsibility</th>
                    <th className="py-2.5 px-3">Permitted Tools</th>
                    <th className="py-2.5 px-3">Invariant Policy Rule</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {[
                    { id: 1, name: 'scoping-agent', role: 'Interprets incoming Jira request & defines scope', tools: 'Claude Code + Jira MCP', rule: 'Read-only Jira intake' },
                    { id: 2, name: 'requirements-agent', role: 'Generates requirements artefacts from scoped input', tools: 'Claude Code', rule: 'Persists markdown under un/' },
                    { id: 3, name: 'user-stories-agent', role: 'Drafts user stories & writes back to Jira', tools: 'Claude Code + Jira MCP', rule: 'Jira issue story linkage' },
                    { id: 4, name: 'architect-agent', role: 'Produces design & architecture artefacts', tools: 'Claude Code + PostgreSQL MCP', rule: 'Schema introspection only' },
                    { id: 5, name: 'implementer-agent', role: 'Writes implementation code & DDL migrations', tools: 'Claude Code + PostgreSQL MCP', rule: 'Restricted to feature branch' },
                    { id: 6, name: 'tester-agent', role: 'Writes test cases & executes against dev', tools: 'Claude Code + Postman MCP', rule: 'Sandboxed test execution' },
                    { id: 7, name: 'reviewer-agent', role: 'Performs code review; no write-tool access', tools: 'Claude Code (Read-Only)', rule: 'ZERO write tools by design' },
                    { id: 8, name: 'pr-publisher-agent', role: 'Plans & publishes PR after human approval', tools: 'Claude Code, Git', rule: 'Hard Gate Hook blocked' },
                    { id: 9, name: 'api-verifier-agent', role: 'Runs post-deploy API smoke tests', tools: 'Claude Code + Postman MCP', rule: 'M1 stability fix in progress' },
                    { id: 10, name: 'deploy-verification-agent', role: 'Confirms successful deployment rollout', tools: 'Claude Code', rule: 'Read-only cluster verification' },
                    { id: 11, name: 'ops-planning-agent', role: 'Produces runbook & operational planning', tools: 'Claude Code', rule: 'Runbooks persisted under un/' },
                    { id: 12, name: 'aidlc-orchestrator', role: 'Top-level supervisory plugin coordinating SDLC', tools: 'Claude Code Plugin', rule: 'Gate hook policy supervisor' },
                  ].map((agent) => (
                    <tr key={agent.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-slate-400 font-bold">{agent.id}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{agent.name}</td>
                      <td className="py-2.5 px-3 text-slate-700">{agent.role}</td>
                      <td className="py-2.5 px-3 font-mono text-orange-700 font-semibold">{agent.tools}</td>
                      <td className="py-2.5 px-3 text-slate-600 font-medium">{agent.rule}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: SCOPE FOR ENHANCEMENTS */}
      {activeSection === 'enhancements' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-orange-600 font-bold uppercase tracking-wider">
                  CATALYST FUTURE PHASES
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs font-semibold text-slate-600">
                  Milestone 2 & 3 Roadmap
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                Enhancement Proposals & Strategic Scope
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                Targeting identified gaps from Milestone 1 to achieve Level 3/4 AI factory maturity. Upvote existing items or propose new enhancements below.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Enhancement Proposal</span>
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            {(['All', 'Telemetry & Tracking', 'Test Automation', 'Cost & Optimization', 'Security & Audit', 'Developer Experience'] as const).map(
              (cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2.5 py-1 text-xs rounded-lg transition-colors font-medium ${
                    filterCategory === cat
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              )
            )}
          </div>

          {/* Enhancement Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEnhancements.map((item) => (
              <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                        {item.code}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {item.category}
                      </span>
                    </div>

                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {item.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm">
                    {item.title}
                  </h4>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong>Current Gap:</strong> {item.gap}
                  </p>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                    <span className="font-semibold block text-slate-900">Implementation Scope:</span>
                    <ul className="space-y-0.5 text-[11px] list-disc list-inside">
                      {item.scope.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">
                    Proposed by: <strong className="text-slate-700">{item.author}</strong>
                  </span>

                  <button
                    type="button"
                    onClick={() => handleUpvote(item.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-orange-50 hover:text-orange-700 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Upvote ({item.votes})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Enhancement Modal */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-orange-600" />
                    <h3 className="font-bold text-slate-900 text-sm">Propose New AIDLC Enhancement</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="text-slate-400 hover:text-slate-700 text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateEnhancement} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Enhancement Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Automated PostgreSQL Rollback Hooks on DDL Failure"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Category
                      </label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value as EnhancementItem['category'])}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
                      >
                        <option value="Telemetry & Tracking">Telemetry & Tracking</option>
                        <option value="Test Automation">Test Automation</option>
                        <option value="Cost & Optimization">Cost & Optimization</option>
                        <option value="Security & Audit">Security & Audit</option>
                        <option value="Developer Experience">Developer Experience</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Author / Lead
                      </label>
                      <input
                        type="text"
                        value={newAuthor}
                        onChange={(e) => setNewAuthor(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Identified Gap / Pain Point *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Manual rollback required if implementer-agent migration fails."
                      value={newGap}
                      onChange={(e) => setNewGap(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Implementation Scope (One bullet per line)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="• Snapshot database schema before DDL migration&#10;• Catch PostgreSQL error codes&#10;• Trigger rollback script automatically"
                      value={newScope}
                      onChange={(e) => setNewScope(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono text-[11px]"
                    />
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
                      Submit Enhancement
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
