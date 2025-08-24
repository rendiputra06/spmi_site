# Auditee Response Feature Plan

## Goals
- Allow auditees (unit owners) to submit evidence/documents and self-descriptions per standard/indicator within an Audit Session.
- Provide an auditor workflow to review/rate those submissions and give feedback.
- Enforce unit-based access (auditee can only manage their unit), and role-based permissions.

## Workflow (High Level)
1. Admin/QA creates an `AuditSession` and assigns units + auditees (users) to participate.
2. Auditee uploads evidence and fills submission forms per standard/indicator for their unit.
3. Auditor reviews auditee submissions, adds comments, sets scores/ratings, and status transitions.

## Data Model
- audit_auditee_submissions
  - id
  - audit_session_id (FK → audit_sessions)
  - unit_id (FK → units)
  - standar_mutu_id / indikator_id (FK)
  - self_description text (uraian/penjelasan dari auditee)
  - status enum: draft | submitted | returned | accepted (default: draft)
  - submitted_by (FK → users)
  - submitted_at datetime nullable
  - reviewed_by (FK → users) nullable
  - reviewed_at datetime nullable
  - score decimal(5,2) nullable
  - reviewer_note text nullable
  - timestamps, soft deletes

- audit_auditee_submission_documents (pivot)
  - submission_id (FK → audit_auditee_submissions)
  - document_id (FK → documents)
  - note nullable

- Optional: audit_assignments (if not exist)
  - id, audit_session_id, user_id, unit_id, role (auditor/auditee), timestamps

Relations:
- AuditSession hasMany AuditeeSubmission
- AuditeeSubmission belongsTo AuditSession, Unit, StandarMutu; belongsToMany Document
- Document belongsToMany AuditeeSubmission

## Permissions & Policies
- Permissions:
  - auditee-submission-view
  - auditee-submission-create
  - auditee-submission-update
  - auditee-submission-submit
  - auditee-submission-review (auditor/QA)
- Policies:
  - Auditee can create/update/submit only for their assigned unit and session.
  - Auditor/QA can view all submissions for sessions they handle; can review/score and change status.

## Backend (Laravel)
- Controller: AuditeeSubmissionController
  - index(session_id, unit_id?, status?, indikator?, search?)
  - store(session_id): create/update draft submission per indikator/standar for the unit of the logged auditee
  - submit(submission): transition to submitted (set submitted_by/at)
  - attachDocuments(submission, document_id[]): link evidence from Documents module
  - review(submission): auditor sets score, reviewer_note, status → returned/accepted; set reviewed_by/at
- Routes (nested):
  - GET /audit-internal/{session}/auditee-submissions
  - POST /audit-internal/{session}/auditee-submissions
  - POST /auditee-submissions/{submission}/submit
  - POST /auditee-submissions/{submission}/attach-documents
  - POST /auditee-submissions/{submission}/review

## Frontend (Inertia React + TS)
- Auditee Page: resources/js/pages/audit-internal/AuditeeSubmissionsIndex.tsx
  - Toolbar: search, status filter; (admin/auditor) unit filter; indikator filter
  - List: standar/indikator, unit, status badge, evidence count, updated_at
  - Actions: create/edit submission (modal/drawer), attach evidence, submit
- Auditee Form:
  - Fields: standar/indikator (select), self_description (textarea), attach evidence (picker from Documents)
  - Status controls: Draft → Submit
- Auditor Review Page: resources/js/pages/audit-internal/AuditeeReviewIndex.tsx (or detail route)
  - List submissions grouped by unit/indikator with status
  - Review Panel/Modal: score, reviewer_note, set status to returned/accepted
  - If returned: auditee can revise and re-submit
- Evidence Picker:
  - Re-use Documents module; filter by category/status; show preview for image/PDF

## Menu & Seeding
- Menu entries under Audit group:
  - "Auditee Submissions" (auditee view) → /audit-internal/{session}/auditee-submissions
  - (Optional) "Auditee Review" (auditor view) → /audit-internal/{session}/auditee-review
- Seeder: create permissions above; grant to roles (admin, auditor, auditee). Optionally create an `auditee` role.

## Status Flow
- draft (auditee editable) → submitted (locked for auditee) →
  - returned (auditee can edit again and re-submit), or
  - accepted (final)

## Validation & Constraints
- Enforce one active submission per (session, unit, indikator) to prevent duplicates (unique index).
- Limit document linking to unit-owned docs (or admin override).
- Scores range validation (e.g., 0–100) during review.

## Iteration Plan
- Iteration 1 (MVP): submissions CRUD (auditee), attach documents, submit, list/filter, basic policies
- Iteration 2: review workflow (return/accept), scoring & notes, audit history, notifications (optional)

## Reuse & Consistency
- Adopt the filtering/pagination patterns used in Documents/Dosen modules.
- Reuse `DocumentCard` preview pattern for evidence.
- Apply unit-based checks similar to DocumentPolicy.
