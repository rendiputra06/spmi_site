# Auditor Response Feature Plan

## Goals
- Enable auditors to record findings per standard/indicator within an Audit Session.
- Attach evidence (documents), add recommendations, score, and manage statuses (Draft → Submitted → Reviewed → Closed).
- Enforce role- and unit-based access control.

## Data Model
- audit_findings
  - id
  - audit_session_id (FK → audit_sessions)
  - unit_id (FK → units)
  - standar_mutu_id / indikator_id (FK → standar_mutu or indikator table you use)
  - severity enum: minor | major | obs
  - description text
  - recommendation text nullable
  - status enum: draft | submitted | reviewed | closed (default: draft)
  - score decimal(5,2) nullable
  - created_by (FK → users)
  - timestamps, soft deletes
- audit_responses
  - id
  - audit_finding_id (FK → audit_findings)
  - responder_id (FK → users)
  - note text
  - status enum: draft | submitted (optional, can be simplified)
  - timestamps
- audit_finding_documents (pivot)
  - audit_finding_id (FK)
  - document_id (FK → documents)
  - note nullable

Relations:
- AuditSession hasMany AuditFinding
- AuditFinding belongsTo AuditSession, Unit, StandarMutu; hasMany AuditResponse; belongsToMany Document
- AuditResponse belongsTo AuditFinding, User
- Document belongsToMany AuditFinding

## Permissions & Policies
- Permissions: audit-response-view, audit-response-create, audit-response-update, audit-response-submit, audit-response-review
- Policies:
  - Auditors can create/update findings for sessions they are assigned to and within their unit scope.
  - QA/Admin can view all, review, and change status/score.

## Backend (Laravel)
- Controller: AuditFindingController (and optionally AuditResponseController)
  - index(session_id, unit_id?, search?, status?, severity?): list & filters
  - store(session_id): create finding (validate standar/indikator, severity, description)
  - update(AuditFinding $finding): edit fields (score restricted to reviewer)
  - attachDocuments(AuditFinding $finding, document_id[]): link evidence (policy: same unit or admin)
  - changeStatus(AuditFinding $finding): transitions draft→submitted (auditor), submitted→reviewed (reviewer), reviewed→closed (admin/QA)
  - storeResponse(AuditFinding $finding): add auditor response notes
- Routes (nested under audit session):
  - GET /audit-internal/{session}/findings
  - POST /audit-internal/{session}/findings
  - PUT /findings/{finding}
  - POST /findings/{finding}/attach-documents
  - POST /findings/{finding}/status
  - POST /findings/{finding}/responses

## Frontend (Inertia React + TS)
- Page: resources/js/pages/audit-internal/FindingsIndex.tsx
  - Toolbar: search, unit (admin), status, severity filters
  - List view: indikator, unit, severity, status badge, score, evidence count, updated_at
  - Actions: add finding (modal), change status, attach evidence, add response
- Detail Page (show):
  - Header with metadata
  - Tabs:
    - Detail (description, recommendation, score)
    - Evidence (linked documents with preview/download)
    - Responses (list + add form)
    - History (optional)
- Evidence Picker: modal/drawer using existing documents page patterns; filter by category/status; preview via image/PDF modal

## Menu & Seeding
- Menu: add "Auditor Response" under Audit group → /audit-internal/{session}/findings (or session detail tab)
- Seeder: create permissions above and assign to roles (admin, auditor). Optionally create an Auditor role.

## Workflow
1. Admin/QA sets up AuditSession (existing).
2. Admin assigns auditors to session/unit (table: audit_assignments with session_id, user_id, unit_id).
3. Auditor creates findings, attaches evidence, and submits.
4. Reviewer/QA reviews, can add score, and change status to reviewed/closed.
5. (Optional) Units can view read-only findings for their unit.

## Iteration Plan
- Iteration 1 (MVP): audit_findings + attach documents + draft→submitted + index/detail + policies
- Iteration 2: audit_responses + scoring + reviewed/closed + timeline/history

## Reuse & Consistency
- Reuse Documents preview (image/PDF) and filtering patterns.
- Follow Inertia pagination/filter pattern used in Documents/Dosen pages.
- Apply unit-based checks similar to DocumentPolicy.
