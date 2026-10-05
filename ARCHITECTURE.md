# Catelyst · AIDLC Orchestrator Architecture & Approval Gate Specification

**AI/RUN Mission 2026 · Milestone 1**  
**Team**: Catelyst (`1346-LVNV-FALC`)  
**Account**: `LVNV-FALC`  
**Target Maturity Level**: Level 3  

---

## 1. Executive Summary & North Star

The **Catelyst AIDLC Orchestrator** is a custom Claude Code plugin that converts traditional, manual Software Development Life Cycle (SDLC) stages into an autonomous, agentic pipeline. 

### The Core Paradigm Shift
* **Baseline (Shift From)**: Fully manual code writing, pull request review, test-case authoring, and dev verification.
* **Target State (Shift To)**: *Agent drafts every artefact; human approves or decides at each gated stage before the workflow proceeds.*

---

## 2. High-Level Architecture Diagram

```
                 [ Incoming Jira Ticket (LVNV-XXXX) ]
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. REQUIREMENTS STAGE                                                       │
│   • Scoping Subagent (Claude Code + Jira MCP)                              │
│   • Requirements Subagent (Claude Code)                                     │
│   • User-Stories Subagent (Claude Code + Jira MCP)                          │
│   • Artefact: un/requirements/{TICKET}-stories.md                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                 │
               ▼───────────────────────────────────▼
               │ GATE HOOK 1: Requirements Sign-off│
               │ Authority: Ismail Chorwadwala     │
               ▲───────────────────────────────────▲
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. ENGINEERING STAGE                                                        │
│   • Architect Subagent (Claude Code + PostgreSQL MCP)                       │
│   • Implementer Subagent (Claude Code + PostgreSQL MCP)                     │
│   • Artefact: un/engineering/{TICKET}-migration.sql                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                 │
               ▼───────────────────────────────────▼
               │ GATE HOOK 2: Architecture & Code  │
               │ Authority: Harjinder / Krishna    │
               ▲───────────────────────────────────▲
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. CODE REVIEW & RELEASE STAGE                                              │
│   • Reviewer Subagent (Claude Code, Strictly READ-ONLY tools)               │
│   • PR-Publisher Subagent (Claude Code)                                     │
│   • Artefact: un/review/{TICKET}-findings.md                                │
└─────────────────────────────────────────────────────────────────────────────┘
                                 │
               ▼───────────────────────────────────▼
               │ GATE HOOK 3: PR Release Approval  │
               │ Authority: Manish Sethi           │
               ▲───────────────────────────────────▲
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 4. QUALITY & API VERIFICATION STAGE                                         │
│   • Tester Subagent (Claude Code + Postman MCP)                             │
│   • API-Verifier Subagent (Claude Code + Postman MCP)                       │
│   • Artefact: un/quality/{TICKET}-tests.json                                │
└─────────────────────────────────────────────────────────────────────────────┘
                                 │
               ▼───────────────────────────────────▼
               │ GATE HOOK 4: QA & Postman Sign-off│
               │ Authority: Jagan Vijayakumar      │
               ▲───────────────────────────────────▲
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 5. OPERATIONS & DEPLOYMENT STAGE                                            │
│   • Deploy-Verification Subagent (Claude Code)                              │
│   • Ops-Planning Subagent (Claude Code)                                     │
│   • Artefact: un/operations/{TICKET}-runbook.md                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                 │
               ▼───────────────────────────────────▼
               │ GATE HOOK 5: Production Release   │
               │ Authority: Vaibhav Singh / Balaji │
               ▲───────────────────────────────────▲
```

---

## 3. The 12 Scoped Subagents & Tool Isolation Matrix

To minimize security attack surfaces and prevent inadvertent source alterations, every subagent operates under strictly bounded Model Context Protocol (MCP) permissions:

| # | Subagent Name | Role & Responsibility | Permitted Tools | Invariant Security Rules |
|---|---------------|----------------------|-----------------|--------------------------|
| 1 | `scoping-agent` | Interprets Jira tickets and defines initial technical scope | Claude Code, Jira MCP | Read Jira tickets; cannot mutate source code |
| 2 | `requirements-agent` | Generates functional and non-functional specifications | Claude Code | Markdown generation in `un/` store |
| 3 | `user-stories-agent` | Converts requirements into Gherkin user stories | Claude Code, Jira MCP | Writes stories back to Jira board |
| 4 | `architect-agent` | Produces database schemas and system design docs | Claude Code, PostgreSQL MCP | Scoped to PostgreSQL introspection |
| 5 | `implementer-agent` | Writes implementation code and database migrations | Claude Code, PostgreSQL MCP | Scoped to feature branch & Postgres MCP |
| 6 | `tester-agent` | Authors unit tests and Postman collection files | Claude Code, Postman MCP | Sandboxed dev test execution |
| 7 | `reviewer-agent` | Conducts security and code quality audits | Claude Code (**Read-Only**) | **ZERO write tools by design** |
| 8 | `pr-publisher-agent` | Drafts pull request body and publishes PR | Claude Code, Git | Requires Gate Hook sign-off prior to publishing |
| 9 | `api-verifier-agent` | Executes post-deploy smoke tests | Claude Code, Postman MCP | In-progress stability fixes (Milestone 1 gap) |
| 10 | `deploy-verification-agent`| Validates successful container and cluster rollout | Claude Code | Read-only Kubernetes/Cloud status |
| 11 | `ops-planning-agent` | Produces disaster recovery and runbook planning docs | Claude Code | Generates markdown runbooks under `un/` |
| 12 | `aidlc-orchestrator` | Top-level supervisory plugin coordinating pipeline | Claude Code | Evaluates Gate Hook policies & state |

---

## 4. Hard-Enforced Gate Hook Governance Rules

The rule validation engine continuously checks for four fundamental invariants:

1. **`RULE-GATE-01` (Mandatory Human Sign-off)**: No subagent can trigger downstream stages without an authorized gate hook recorded in state.
2. **`RULE-TOOL-02` (Reviewer Read-Only Invariant)**: Reviewer subagent cannot be provisioned write tools. Violation triggers immediate pipeline halting.
3. **`RULE-MCP-03` (PostgreSQL MCP Isolation)**: Only `architect-agent` and `implementer-agent` are granted direct DB MCP access.
4. **`RULE-PR-04` (PR Publishing Gate)**: PR publication requires prior review sign-off by Manish Sethi.
5. **`RULE-API-05` (API-Verifier Stability)**: Halts release if Postman MCP test execution status is `in_progress_fix` or `failed`.
6. **`RULE-UN-06` (Markdown Persistence in `un/`)**: Every subagent output must be persisted as markdown for transparent auditing.
7. **`RULE-MET-07` (Milestone 1 Telemetry)**: Enforces token-cost and cycle-time tracking required for Level 3 maturity claim.

---

## 5. Scope for Enhancements (Milestone 2 & 3 Roadmap)

### Enhancement 1: Real-Time Jira Webhook & MCP Auto-Labeling
* **Current Gap**: Milestone 1 handout noted: *"No Jira labels or delivery tracking in place. Tracking not yet implemented."*
* **Scope**: Implement two-way Jira MCP webhooks that automatically attach labels (`aidlc-requirements`, `aidlc-review`, `aidlc-qa`) and log stage transition timestamps directly onto the Jira issue.

### Enhancement 2: Self-Healing API-Verifier Loop (Postman MCP)
* **Current Gap**: Milestone 1 handout noted: *"API-verification stage has in-progress fixes and is not yet stable."*
* **Scope**: Introduce automated self-healing where Postman MCP error responses (HTTP 4xx/5xx) are fed back to the `implementer-agent` with stack traces to generate corrective patches before invoking human reviewers.

### Enhancement 3: Fine-Grained Token Cost & Latency Dashboard
* **Current Gap**: Milestone 1 handout noted: *"AI token cost not tracked. Identified as a gap needed for a Level 3 claim."*
* **Scope**: Instrument per-subagent token usage counters ($/ticket), prompt caching efficiency metrics, and model temperature telemetry integrated into the Recharts analytics suite.

### Enhancement 4: Cryptographic Multi-Party Sign-off (Ed25519)
* **Scope**: Upgrade the digital signature mechanism (`SIG-CAT-XXXX`) to asymmetric cryptographic signing with team public keys to guarantee tamper-proof audit trails for SOX and ISO-27001 enterprise compliance.

### Enhancement 5: Offline PWA & Git Pre-Commit Hook CLI
* **Scope**: Provide a companion CLI (`npx aidlc-gate-hook`) that developers can install as a Git pre-commit or pre-push hook to evaluate approval gates locally before code touches remote branches.
