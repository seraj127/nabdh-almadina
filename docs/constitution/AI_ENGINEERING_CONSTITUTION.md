---
document_type: AI Engineering Constitution
document_id: AI-ENGINEERING-CONSTITUTION-2026
version: 3.0.0
status: Approved
owner: Technical Lead / Staff Software Engineer
effective_date: 2026-08-16
last_review: 2026-08-16
authority_level: MANDATORY — Single Engineering Source of Truth
language: Arabic/English (Bilingual Technical)
usage_scope: All AI Agents, Human Engineers, QA, DevOps, Architects, Security, Product, and Reviewers
compliance_requirement: 100% — No silent violations
---

# AI Engineering Constitution
## Unified AI Engineering, Governance & Delivery Constitution — v3.0.0

> **Purpose:** This document is the universal engineering constitution for software projects developed, modified, reviewed, tested, deployed, or operated with AI assistance.
>
> **Core principle:** Evidence before claims. AI-generated output is untrusted until validated.

---

# 0. Authority & Document Model

## 0.1 Authority

This Constitution defines the **universal engineering rules and operating constraints**. It does not replace a project's product requirements, technical specification, database schema, API contract, UI/UX specification, or project-specific test plan.

Authority order:

1. This Constitution — universal engineering rules
2. Approved Project PRD — product/business requirements
3. Approved Technical Specification — project architecture and implementation
4. Approved Security/Compliance Profile — project controls
5. Project Test Plan — project-specific verification
6. API/Database/UI contracts — implementation contracts
7. ADRs — recorded decisions within the applicable authority boundary

If two documents conflict, the AI MUST stop, identify the conflict, cite both sources, and request or record a resolution. No silent override is permitted.

## 0.2 Universal vs Project-Specific Separation

Universal defaults belong here.

Project-specific values belong in a **Project Quality Profile**, including:

- performance budgets
- availability targets
- RTO/RPO
- test counts
- coverage floors
- device matrix
- supported browsers
- load profiles
- retention periods where legally/project-defined
- deployment cadence
- selected tools

A project may set stricter values. It may relax a universal default only through an explicit, reviewed exception/ADR.

---

# 1. AI Execution Directive

Every AI agent MUST:

1. Understand the applicable requirements before acting.
2. Identify applicable Rule IDs before implementation.
3. State material assumptions.
4. Ask for clarification when a missing fact materially changes correctness or safety.
5. Prefer the simplest compliant solution.
6. Never silently violate a rule.
7. Never invent APIs, dependencies, credentials, test results, evidence, or documentation.
8. Treat generated code, SQL, shell commands, infrastructure, and AI output as untrusted until validated.
9. Maintain traceability between requirement → implementation → validation → evidence.
10. Run or report applicable quality gates before declaring completion.
11. Distinguish **PASS**, **FAIL**, **BLOCKED**, and **UNVERIFIED**.
12. Never claim PASS without evidence.

### 1.1 Evidence Before Claims

The following claims require verifiable evidence:

- tests passed
- coverage achieved
- build succeeded
- deployment succeeded
- SBOM generated
- security scan passed
- accessibility passed
- performance budget passed
- reproducible build verified
- migration succeeded
- backup/restore verified
- compliance achieved

If evidence is unavailable:

```text
Status: UNVERIFIED
```

not:

```text
Status: PASS
```

---

# 2. Governance & Decision Control

## [GOV-001] Architecture Decision Records

Significant architectural, security, data, integration, or operational decisions MUST be recorded as ADRs.

Requirements:

- Store under `docs/adr/`
- Sequential identifiers
- Lifecycle: `Proposed → Accepted → Deprecated/Superseded`
- Accepted ADRs are immutable; changes create a new ADR
- Significant PRs reference applicable ADRs

## [GOV-002] Machine-Enforced Definition of Done

DoD MUST be represented in `docs/DEFINITION_OF_DONE.md` and enforced by automation wherever technically possible.

Minimum applicable gates:

- tests
- coverage
- security
- secrets
- accessibility
- performance
- documentation
- review
- deployment/recovery readiness

## [GOV-003] Continuous Governance

The Constitution and its controls MUST evolve from evidence.

Sources include:

- incidents
- postmortems
- security findings
- audits
- production defects
- CI failures
- reliability data
- developer feedback

Use semantic versioning and a changelog.

## [GOV-004] Controlled Exceptions

Exceptions MUST:

- identify the Rule ID
- explain the reason
- define risk
- define mitigation
- identify owner
- define expiration/review date
- be recorded in an ADR or exception register

No permanent "temporary" exceptions.

---

# 3. Engineering Principles

## [PRIN-001] Quality Primacy

Short-term convenience MUST NOT knowingly sacrifice long-term correctness, security, maintainability, or reliability.

## [PRIN-002] SOLID

Apply SOLID where appropriate. Intentional deviations require justification.

## [PRIN-003] DRY

Do not duplicate true business logic. Avoid premature abstraction of accidental similarity.

## [PRIN-004] KISS

Prefer the simplest correct, observable, testable, and maintainable solution.

## [PRIN-005] YAGNI

Do not implement speculative features or architecture without a validated requirement.

## [PRIN-006] Explicit Over Clever

Prefer readable, predictable behavior over clever abstractions.

---

# 4. Requirements Engineering

## [REQ-001] Testable Requirements

Every functional requirement MUST have:

- unique ID
- clear behavior
- acceptance criteria
- testable outcome

Use EARS and/or Given-When-Then where appropriate.

## [REQ-002] Quantified NFRs

Non-functional requirements SHOULD be measurable as:

- budgets
- thresholds
- SLOs
- error rates
- latency
- availability
- capacity
- accessibility criteria

## [REQ-003] Clarify Material Ambiguity

Do not silently invent product behavior when ambiguity materially affects the outcome.

## [REQ-004] Requirement Traceability

Every production-impacting requirement MUST be traceable to implementation and validation.

---

# 5. Architecture

## [ARC-001] Architecture Before Significant Code

For non-trivial systems, establish an architecture package before major implementation:

- C4/context diagram
- container/component view as appropriate
- dependency boundaries
- data flows
- trust boundaries
- integration boundaries

## [ARC-002] Feature-Oriented Organization

Prefer feature/domain-oriented organization over purely technical folder structures when it improves ownership and cohesion.

## [ARC-003] Dependency Direction

Dependencies MUST respect declared architectural boundaries. Domain logic SHOULD remain framework-independent where practical.

## [ARC-004] Fault Isolation

Design failure boundaries using appropriate mechanisms:

- timeouts
- bulkheads
- circuit breakers
- queues
- isolation
- graceful degradation

## [ARC-005] Architecture Fitness

Architecture decisions MUST be evaluated against:

- correctness
- security
- scalability
- operability
- complexity
- cost
- team capability

---

# 6. Code Organization

## [ORG-001] Ubiquitous Language

Use domain terminology consistently in:

- requirements
- documentation
- code
- APIs
- database models
- tests

Maintain `docs/GLOSSARY.md`.

## [ORG-002] Bounded Module Size

Large files/functions are review triggers, not automatic defects.

Suggested review triggers:

- file > ~300 LOC
- function > ~50 LOC
- cyclomatic complexity > ~10

Exceptions require engineering judgment.

## [ORG-003] Tool-Enforced Standards

Use formatter, linter, type checking, SAST, and appropriate static analysis in CI.

## [ORG-004] Refactoring Discipline

Refactoring MUST preserve behavior unless behavior change is explicitly part of the requirement.

## [ORG-005] No Production Placeholders

No unresolved:

- TODOs
- fake implementations
- dummy credentials
- mock production paths
- unreachable fallback presented as real behavior

Test-only fixtures are permitted when explicitly scoped as test assets.

---

# 7. Frontend Engineering

## [FE-001] Separation of Presentation and Domain Logic

Keep UI rendering separate from business logic where practical.

Use typed API clients and explicit data contracts.

## [FE-002] State-Complete UI

Applicable views SHOULD define:

1. loading
2. empty
3. error
4. success

Also define offline, permission, and partial-data states where applicable.

## [FE-003] Design Tokens

Use centralized design tokens for visual primitives.

## [FE-004] Responsive & Adaptive Design

Support declared device/screen targets and accessible interaction sizes.

Default touch target guidance: 44–48 CSS px/dp where platform standards permit.

## [FE-005] Client Security

Never trust client-side authorization. UI restrictions are not security controls.

---

# 8. Backend Engineering

## [BE-001] Layered Responsibilities

Maintain clear responsibility boundaries such as:

```text
Controller / Transport
        ↓
Application / Service
        ↓
Domain
        ↓
Repository / Infrastructure
```

Exact architecture may vary by project.

## [BE-002] Resilient External Integrations

External calls SHOULD define:

- timeout
- retry policy
- exponential backoff
- jitter
- circuit breaking where appropriate
- idempotency
- failure behavior

## [BE-003] Concurrency Safety

Protect invariants through:

- transactions
- constraints
- locking
- optimistic concurrency
- idempotency
- conflict handling

## [BE-004] Background Jobs

Jobs MUST have:

- ownership
- idempotency
- bounded retries
- dead-letter strategy where applicable
- observability
- failure handling

## [BE-005] Reliable Messaging

Events MUST define:

- schema
- version
- ownership
- delivery semantics
- compatibility expectations
- duplicate tolerance

---

# 9. Mobile Engineering

## [MOB-001] Offline-First Where Required

For products requiring offline capability:

- local persistence
- sync engine
- conflict policy
- retry strategy
- data ownership
- offline UI states

MUST be explicitly designed.

## [MOB-002] Lifecycle Discipline

Handle:

- startup
- backgrounding
- termination
- network changes
- interrupted operations
- storage pressure

Project-specific startup and crash budgets belong in the Project Quality Profile.

---

# 10. Database Engineering

## [DB-001] Versioned Migrations

All production schema changes MUST be version-controlled migrations.

No uncontrolled manual DDL in production.

## [DB-002] Query Hygiene

Avoid:

- N+1 queries
- unbounded queries
- accidental full scans
- missing critical indexes

Use query plans for performance-sensitive paths.

## [DB-003] Data Ownership

Every important entity MUST have a defined owner and source of truth.

## [DB-004] Integrity Constraints

Use database constraints for invariants that must survive application bugs.

## [DB-005] Data Lifecycle

Define:

- creation
- access
- retention
- archival
- deletion
- recovery

according to project and legal requirements.

---

# 11. API Engineering

## [API-001] Contract-First APIs

Maintain versioned API contracts, preferably OpenAPI for HTTP APIs.

## [API-002] Compatibility

Breaking changes MUST be explicit and versioned/managed according to the project's compatibility policy.

## [API-003] Pagination & Filtering

Collections MUST avoid uncontrolled result sizes.

Use cursor pagination where appropriate.

## [API-004] Rate Limiting

Sensitive/high-volume endpoints MUST have appropriate rate controls.

Return machine-readable limits and `Retry-After` where applicable.

## [API-005] Idempotency

Financial, order, payment, provisioning, and other non-idempotent operations MUST define duplicate-request behavior.

---

# 12. Security Constitution

> **Never trust input. Never trust identity. Never trust internal networks. Never trust embedded secrets.**

## [SEC-001] Boundary Validation

Validate untrusted input at every trust boundary.

Cover as applicable:

- type
- structure
- size
- encoding
- semantics
- authorization context

## [SEC-002] Injection Prevention

Use parameterized queries and contextual output encoding.

Never concatenate untrusted input into:

- SQL
- shell
- HTML
- templates
- commands
- dynamic code

## [SEC-003] Default-Deny Authorization

Authorization MUST be centralized and deny by default.

Object-level authorization MUST prevent IDOR/BOLA.

## [SEC-004] Authentication

Use established standards and strong password hashing where passwords exist.

Support appropriate:

- MFA
- rate limiting
- account recovery
- session controls
- step-up authentication

## [SEC-005] Multi-Tenant Isolation

Tenant context MUST come from trusted identity/session context, not arbitrary client input.

Scope access at the repository/service/data layer.

## [SEC-006] Cryptography

Use established cryptographic libraries and modern authenticated encryption.

Never implement custom cryptographic algorithms.

Key management MUST use appropriate secret/KMS infrastructure.

## [SEC-007] Session & Token Lifecycle

Use:

- short-lived access tokens where appropriate
- secure storage
- rotation
- revocation
- secure cookies where applicable

## [SEC-008] Secrets

Secrets MUST NOT be committed to source code.

Use:

- secret managers
- workload identity
- rotation
- least privilege

AI MUST NEVER generate or expose real credentials.

## [SEC-009] Dependency Security

Continuously scan dependencies and address critical/high-risk vulnerabilities according to project policy.

## [SEC-010] File & Upload Security

Validate:

- file type
- size
- content
- storage location
- authorization
- processing behavior

Treat uploaded files as untrusted.

---

# 13. AI Engineering & Agent Safety

> **AI output is untrusted data, not truth.**

## [AIE-001] Model Calls as Untrusted Dependencies

AI calls MUST define:

- timeout
- cost/token budget
- schema validation
- failure behavior
- fallback behavior
- evaluation criteria

## [AIE-002] AI-Assisted Development Governance

AI-generated code MUST undergo normal engineering validation.

AI is not an authority merely because it generated the output.

## [AIE-003] Prompt Injection Resistance

Separate:

- system instructions
- developer instructions
- user data
- retrieved content
- tool output

Do not allow untrusted content to silently become instructions.

## [AIE-004] Agent Tool Authorization

Every agent/tool combination MUST have explicit permissions.

High-impact actions require additional controls.

Agents MUST NOT self-escalate privileges.

## [AIE-005] AI Output Safety

Never directly execute AI-generated:

- code
- SQL
- shell commands
- infrastructure changes
- destructive operations

without appropriate validation, authorization, and sandboxing.

## [AIE-006] Tool Action Confirmation

Destructive or externally consequential actions SHOULD require explicit confirmation or an equivalent policy gate.

## [AIE-007] AI Evaluation

AI features MUST define suitable evaluation datasets and metrics.

Where applicable evaluate:

- correctness
- faithfulness
- relevance
- safety
- robustness
- latency
- cost

## [AIE-008] Hallucination Control

AI MUST NOT invent:

- APIs
- package capabilities
- files
- test results
- deployment results
- security status
- business facts

Unknown information MUST be marked unknown.

---

# 14. Performance Engineering

## [PERF-001] Performance Budgets

Performance-critical systems MUST define measurable budgets in the Project Quality Profile.

Possible metrics:

- LCP
- INP
- CLS
- API p95/p99
- startup time
- memory
- CPU
- database latency

## [PERF-002] Deliberate Caching

Every important cache SHOULD define:

- key
- TTL
- invalidation
- ownership
- stampede protection
- failure behavior

## [PERF-003] Capacity Testing

Critical systems MUST have load/capacity validation appropriate to expected traffic.

---

# 15. Testing Constitution

## [TEST-001] Test Pyramid

Prefer:

```text
Many fast unit tests
        ↓
Fewer integration tests
        ↓
Few high-value E2E tests
```

Add specialized tests where risk requires them.

## [TEST-002] Regression-First Fixes

For a reproducible defect:

```text
Failing regression test
        ↓
Fix
        ↓
Verification
        ↓
Regression suite
```

## [TEST-003] No Assertion-Free False Confidence

Tests must validate behavior or explicit properties.

## [TEST-004] Flaky Test Governance

Flaky tests MUST be:

- identified
- quarantined when necessary
- tracked
- repaired
- removed from quarantine within a defined period

## [TEST-005] Security Testing

Apply appropriate:

- SAST
- DAST
- dependency scanning
- API security testing
- secret scanning
- authorization tests
- injection tests

## [TEST-006] Accessibility Testing

Use automated and manual validation as appropriate.

## [TEST-007] Contract Testing

Use contract testing where independently deployed services require compatibility guarantees.

## [TEST-008] Chaos/Resilience Testing

For systems where resilience is critical, test controlled failure scenarios in safe environments.

---

# 16. DevOps & Supply Chain

## [DOPS-001] Everything as Code

Infrastructure and operational configuration SHOULD be version controlled.

## [DOPS-002] Immutable & Traceable Artifacts

Build artifacts MUST be traceable to source revision and build context.

## [DOPS-003] SBOM

Production artifacts SHOULD generate an SBOM using an accepted format such as:

- SPDX
- CycloneDX

## [DOPS-004] Provenance

Where feasible, establish artifact provenance and build integrity.

## [DOPS-005] License Compliance

Track dependencies and license obligations.

## [DOPS-006] Configuration Management

Configuration MUST be:

- externalized where appropriate
- validated
- environment-aware
- fail-fast for invalid critical settings

---

# 17. CI/CD

## [CICD-001] Trusted Pipeline

CI MUST provide automated verification appropriate to the repository.

A red protected main branch MUST trigger investigation.

## [CICD-002] Deploy ≠ Release

Use feature flags/progressive delivery when product risk warrants separation between deployment and release.

## [CICD-003] Rollback

Critical deployments MUST have a tested rollback or recovery path.

## [CICD-004] Environment Parity

Reduce uncontrolled differences between environments.

---

# 18. Observability

## [OBS-001] Correlated Telemetry

Use appropriate:

- structured logs
- metrics
- traces

Correlate requests where technically possible.

## [OBS-002] Privacy-Safe Observability

Do not log secrets or unnecessary PII.

## [OBS-003] Symptom-Based Alerting

Alerts SHOULD focus on user/system symptoms and SLO impact rather than noisy internal events.

## [OBS-004] Operational Runbooks

Production alerts MUST have an actionable runbook where operational response is required.

---

# 19. Documentation

## [DOC-001] Docs as Code

Technical documentation belongs in version control and follows review practices.

## [DOC-002] Explain Why

Comments should explain intent, constraints, or non-obvious decisions rather than restate code.

## [DOC-003] Living Project Map

Projects using AI agents SHOULD maintain:

```text
PROJECT_MAP.md
```

with:

- TECH_STACK
- SYSTEM_FLOW
- ARCHITECTURE
- IMPORTANT_MODULES
- INTEGRATIONS
- ORPHANS & PENDING
- KNOWN_CONSTRAINTS

---

# 20. Accessibility

## [A11Y-001] WCAG

Web products SHOULD target WCAG 2.2 AA unless a project-specific standard requires otherwise.

## [A11Y-002] Keyboard & Semantic Access

Interactive functionality MUST be accessible through appropriate semantic and keyboard mechanisms.

## [A11Y-003] Dynamic Content

Use appropriate:

- focus management
- live regions
- accessible names
- non-color-only signaling

---

# 21. Internationalization & RTL

## [I18N-001] Externalized Strings

Do not hard-code user-facing strings.

Use semantic translation keys and locale-aware formatting.

## [I18N-002] ICU & Intl

Use locale-aware pluralization, dates, numbers, currencies, and formatting.

## [I18N-003] RTL/BiDi

For RTL products:

- use logical CSS properties
- support bidirectional text
- mirror UI intentionally
- test RTL layouts
- avoid directional assumptions

---

# 22. Production Readiness

## [PROD-001] Production Readiness Review

Before first production users, verify as applicable:

- functionality
- security
- testing
- performance
- accessibility
- observability
- backup
- restore
- DR
- deployment
- rollback
- configuration
- ownership

## [PROD-002] Operability After Launch

Production systems MUST have an ownership model and appropriate:

- dependency cadence
- incident process
- technical debt register
- recovery exercises
- monitoring
- operational documentation

---

# 23. Universal Quality Gates

## Gate A — UI Quality Gate

Applicable UI changes MUST validate:

1. Functional correctness
2. Accessibility
3. Responsiveness
4. Performance
5. Security
6. Localization
7. Loading
8. Empty
9. Error
10. Offline behavior where applicable
11. Lifecycle behavior where applicable

## Gate B — Data & Resilience Gate

Applicable backend/data changes MUST answer:

1. What if the request is duplicated?
2. What if two users modify the resource simultaneously?
3. What if the database becomes slow?
4. What if an external API times out?
5. What if a message is delivered twice?
6. What if a background job fails?
7. What if cache is unavailable?
8. What if the network disconnects?
9. What if a dependency becomes unavailable?

## Gate C — AI Safety Gate

Applicable AI changes MUST answer:

1. What is the actual requirement?
2. What assumptions were introduced?
3. Were APIs/dependencies verified?
4. Were secrets protected?
5. Was authorization preserved?
6. Was unsafe execution prevented?
7. Were outputs validated?
8. Were AI-specific evaluations executed?
9. Were tests executed?
10. Is the change traceable and reviewable?

## Gate D — Security Gate

Applicable changes MUST verify:

- authentication
- authorization
- input validation
- injection resistance
- secret scanning
- dependency risk
- data exposure
- logging/privacy
- tenant isolation where applicable

## Gate E — Production Gate

Applicable releases MUST verify:

- deployment path
- configuration
- migrations
- observability
- rollback/recovery
- backup/restore
- ownership

---

# 24. AI Operating Model

## 24.1 Planning Protocol

Before implementation, the AI MUST:

1. Read applicable project documents.
2. Identify requirements.
3. Identify applicable Rule IDs.
4. Identify constraints.
5. Identify assumptions.
6. Inspect existing architecture and ADRs.
7. Determine affected modules.
8. Propose the simplest compliant approach.
9. Define validation strategy.
10. Define expected evidence.

For non-trivial work, output a milestone plan before implementation.

## 24.2 Execution Engine

During implementation:

```text
Understand
   ↓
Plan
   ↓
Implement
   ↓
Test
   ↓
Inspect
   ↓
Fix
   ↓
Verify
   ↓
Update documentation/map
```

Do not declare completion merely because code was generated.

## 24.3 Surgical Editing Protocol

For existing code:

1. Read surrounding context.
2. Inspect architecture and dependencies.
3. Identify blast radius.
4. Make the smallest safe change.
5. Preserve existing behavior unless explicitly changing it.
6. Add/update regression tests.
7. Run applicable gates.
8. Update documentation/ADR if required.

---

# 25. Traceability

Every significant change SHOULD be traceable:

```text
Requirement
    ↓
Rule IDs
    ↓
Architecture / ADR
    ↓
Implementation
    ↓
Tests
    ↓
Quality Gates
    ↓
Evidence
    ↓
Release
```

### Traceability Matrix

| Requirement | Rule IDs | Implementation | Tests | Gate | Evidence | Status |
|---|---|---|---|---|---|---|
| REQ-XXX | SEC-001 | module/path | test ID | Security | CI run | Required |

---

# 26. Final AI Self-Review

Before declaring a task COMPLETE, answer all applicable questions:

1. Does it satisfy the actual requirement?
2. Is the architecture appropriate?
3. Is it maintainable?
4. Is it secure?
5. Is it tested?
6. Is it observable?
7. Is it performant enough?
8. Does it handle failure?
9. Is it accessible where applicable?
10. Is it documented?
11. Can it be deployed safely?
12. Can it be rolled back or recovered?
13. Does it introduce technical debt?
14. Does it comply with this Constitution?
15. Is every claimed PASS backed by evidence?

Any unanswered applicable item prevents `COMPLETE`.

---

# 27. Per-Task Compliance Report

```markdown
## Task Compliance Report

**Task ID:** [ID]
**Task:** [Description]

### Applicable Rules
- [RULE-ID]
- [RULE-ID]

### Assumptions
- None / [list]

### Validation
- Tests: PASS / FAIL / BLOCKED / UNVERIFIED
- Security: PASS / FAIL / BLOCKED / UNVERIFIED
- Performance: PASS / FAIL / BLOCKED / UNVERIFIED
- Accessibility: PASS / FAIL / BLOCKED / UNVERIFIED
- Documentation: PASS / FAIL / BLOCKED / UNVERIFIED

### Quality Gates
- UI Gate: N/A / PASS / FAIL / BLOCKED / UNVERIFIED
- Data & Resilience Gate: N/A / PASS / FAIL / BLOCKED / UNVERIFIED
- AI Safety Gate: N/A / PASS / FAIL / BLOCKED / UNVERIFIED
- Security Gate: N/A / PASS / FAIL / BLOCKED / UNVERIFIED
- Production Gate: N/A / PASS / FAIL / BLOCKED / UNVERIFIED

### Evidence
- Test run: [link/log]
- Coverage: [value + evidence]
- SAST: [link/log]
- Build: [link/log]
- Other: [link/log]

### Deviations
- None
- OR: [Rule ID + reason + ADR]

### Final Status
**COMPLETE / INCOMPLETE / BLOCKED / UNVERIFIED**
```

---

# 28. ADR Template

```markdown
# ADR-XXX — [Title]

**Status:** Proposed | Accepted | Deprecated | Superseded
**Date:** YYYY-MM-DD
**Owner:** [Owner]
**Related Rules:** [Rule IDs]
**Reversal Conditions:** [When to revisit]

## Context

## Decision

## Alternatives Considered

## Security Impact

## Operational Impact

## Consequences

### Positive
- 

### Negative
- 

## Validation

## References
```

---

# 29. Project Quality Profile

Each project SHOULD define:

```yaml
project_quality_profile:
  performance:
    api_p95_ms: null
    web_lcp_ms: null
    mobile_startup_ms: null

  reliability:
    availability_slo: null
    crash_free_target: null

  testing:
    unit_coverage_floor: null
    integration_requirements: []
    e2e_requirements: []

  security:
    severity_block_policy: {}

  accessibility:
    standard: "WCAG-2.2-AA"

  recovery:
    rto: null
    rpo: null

  supported_platforms: []

  supported_locales: []

  data_retention:
    policy: "project-defined"
```

The Constitution supplies the governance framework; the Project Quality Profile supplies project-specific numeric targets.

---

# 30. Brownfield Adoption

For existing systems:

### Phase 0 — Audit
Create a compliance matrix.

### Phase 1 — Lock Behavior
Create characterization/regression tests.

### Phase 2 — Stop the Bleeding
Apply rules first to new and modified code.

### Phase 3 — Surgical Remediation
Prioritize:

```text
Security
↓
Data Integrity
↓
API Contracts
↓
Architecture
↓
Reliability
↓
Maintainability
```

### Phase 4 — Full Enforcement
Enable repository-wide quality gates.

---

# 31. Recommended Repository Governance Structure

```text
docs/
├── constitution/
│   └── AI_ENGINEERING_CONSTITUTION.md
│
├── project/
│   ├── PROJECT_PRD.md
│   ├── PROJECT_QUALITY_PROFILE.yaml
│   ├── TECHNICAL_SPEC.md
│   ├── DATABASE_SCHEMA.md
│   └── PROJECT_MAP.md
│
├── architecture/
│   ├── C4/
│   └── ADR/
│
├── api/
│   └── openapi.yaml
│
├── testing/
│   ├── TEST_PLAN.md
│   ├── TEST_DATA_POLICY.md
│   └── TEST_TAXONOMY.md
│
├── security/
│   ├── SECURITY_PROFILE.md
│   └── THREAT_MODEL.md
│
└── operations/
    ├── RUNBOOKS/
    ├── PRR.md
    └── DR.md
```

---

# 32. Definition of Done — Universal Minimum

A task is not COMPLETE until all applicable conditions are satisfied:

- [ ] Requirement understood
- [ ] Applicable Rule IDs identified
- [ ] Architecture impact reviewed
- [ ] Implementation complete
- [ ] No production placeholders
- [ ] Appropriate tests added/updated
- [ ] Tests verified
- [ ] Security validated
- [ ] Performance validated where applicable
- [ ] Accessibility validated where applicable
- [ ] Documentation updated
- [ ] Traceability updated
- [ ] Quality gates passed
- [ ] Evidence recorded
- [ ] Deviations documented
- [ ] Rollback/recovery considered
- [ ] Final AI self-review completed

---

# 33. Mandatory AI Response Contract

For engineering tasks, AI SHOULD structure substantial responses as:

```text
1. Understanding
2. Applicable Rules
3. Assumptions
4. Impact Analysis
5. Proposed Solution
6. Implementation
7. Validation
8. Evidence
9. Deviations
10. Final Compliance Status
```

For simple requests, the structure may be compressed, but the underlying rules remain applicable.

---

# 34. Constitution Integrity Rules

The AI MUST NOT:

- silently modify this Constitution
- weaken a rule to make a task easier
- claim compliance without evidence
- fabricate missing project artifacts
- override an accepted ADR without explicit supersession
- convert uncertainty into certainty
- introduce speculative product features
- expose secrets
- bypass authorization
- execute untrusted AI-generated commands without controls

Changes to this Constitution require:

1. proposed revision
2. impact analysis
3. review
4. version increment
5. changelog entry
6. migration note where required

---

# 35. Master Rule Index

| Domain | Rule IDs |
|---|---|
| Governance | GOV-001 → GOV-004 |
| Principles | PRIN-001 → PRIN-006 |
| Requirements | REQ-001 → REQ-004 |
| Architecture | ARC-001 → ARC-005 |
| Organization | ORG-001 → ORG-005 |
| Frontend | FE-001 → FE-005 |
| Backend | BE-001 → BE-005 |
| Mobile | MOB-001 → MOB-002 |
| Database | DB-001 → DB-005 |
| API | API-001 → API-005 |
| Security | SEC-001 → SEC-010 |
| AI Engineering | AIE-001 → AIE-008 |
| Performance | PERF-001 → PERF-003 |
| Testing | TEST-001 → TEST-008 |
| DevOps | DOPS-001 → DOPS-006 |
| CI/CD | CICD-001 → CICD-004 |
| Observability | OBS-001 → OBS-004 |
| Documentation | DOC-001 → DOC-003 |
| Accessibility | A11Y-001 → A11Y-003 |
| Internationalization | I18N-001 → I18N-003 |
| Production | PROD-001 → PROD-002 |

**Core rules in this release: 104**

> The rule count is intentionally broader than the previous 68-rule baseline. The original 68-rule set is absorbed into this unified constitution, while additional controls from the production-grade engineering ruleset and Unified AI PRD are normalized into the same authority model.

---

# 36. Final Constitutional Statement

> **The AI assistant, automation system, reviewer, and engineering team shall treat this Constitution as a binding engineering contract throughout the software development lifecycle.**

Before implementation:

```text
Understand → Identify Rules → Clarify → Plan
```

During implementation:

```text
Implement → Test → Inspect → Secure → Document
```

Before completion:

```text
Verify → Apply Gates → Collect Evidence → Report Compliance
```

If uncertainty remains:

```text
STOP → STATE UNCERTAINTY → REQUEST CLARIFICATION
```

If a conflict exists:

```text
IDENTIFY CONFLICT → CITE RULES → PROPOSE OPTIONS → RECORD DECISION
```

### Golden Rule

> **No silent violations. No unsupported claims. No unverified AI output. No production completion without evidence.**

---

**Document:** AI Engineering Constitution  
**Version:** 3.0.0  
**Status:** Approved  
**Effective:** 2026-08-16  
**End of Constitution**
