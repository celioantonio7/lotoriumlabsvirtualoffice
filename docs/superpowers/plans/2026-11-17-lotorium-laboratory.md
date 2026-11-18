# LOTORIUM LABS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development to implement this plan task-by-task.

**Goal:** Ship own branded persistent virtual team, expanded world/cat, real ordered tasks and safe DeskComm integration.
**Architecture:** Existing Node server + canvas world; persistent visual roster distinct from live provider sessions; task runtime only explicit local command; DeskComm scoped API authoritative for CRM users.
**Tech Stack:** TypeScript, Vite, Node, existing canvas simulation; DeskComm Next/React/Supabase.
**Spec:** docs/superpowers/specs/2026-11-17-lotorium-laboratory-design.md

## Constraints
No upstream World publishing; no credentials, local history or fabricated work; preserve licenses; no broad ERP changes. Isolated lab worktree. Agents own disjoint files, root integrates shared entrypoints.

## Tasks
- [ ] 1. Expand world, pool/new zones and roaming Kali. Agent world owns client/src/world except entrypoint wiring; test collision and meaningful browser screenshots.
- [ ] 2. DeskComm authenticated tenant-scoped laboratory UI/API/dispatch. Agent CRM owns CRM and new lab bridge modules; document contracts for root wiring; test cross-tenant rejection and real dispatch.
- [ ] 3. Evaluate/integrate page-mascot reactive portrait module and assets, team profiles/skills contract. Agent portraits owns new client/src/laboratory portraits modules + shared/laboratory-team.ts; no world/entrypoint changes.
- [ ] 4. Root implements persistent visual roster and CRM-only UI/entrypoints; integrates parent bridge and real CRM status/output. No local executors, sessions or tool providers. Tests disconnected/no-local-network/security cases.
- [ ] 5. Root rebrands product, settings namespace migration, publication hygiene and dedicated origin/main. Preserve legal notices.
- [ ] 6. Independent review; build/typecheck/tests/browser visual validation; start local app and push own GitHub repo. Record limitations without claiming unavailable production integrations.

## Ledger
Ruling: User approved implementation and GitHub publication in same session; proceed without repeated approval.
Ruling: Existing read-only session monitor remains local; CRM client view must not expose it.
Ruling: page-mascot portrait enhancement complements existing canvas walking, not replacing it.

Ruling: User explicitly superseded local execution: CRM exclusive. Removed unintegrated Codex executor modules; only CRM authorizes and executes tasks.
