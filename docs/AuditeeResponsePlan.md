# Auditee Response Feature Plan

## Goals
- Let auditees answer per-pertanyaan with documents in the active Audit Session assigned to them.
- Keep it simple: one table view (standar > indikator > pertanyaan), attach/pick documents, then submit final (from draft).
- Enforce unit-based access (auditee only for their unit) and basic role permissions.

## Workflow (High Level)
1. Admin/QA creates an `AuditSession` and assigns units + auditees (users).
2. Auditee logs in. System auto-selects the active session for that auditee's unit.
3. Auditee sees a table: Standar → Indikator → Pertanyaan. Each pertanyaan has action to upload or pick an existing Document as evidence.
4. Auditee fills all required pertanyaan with documents. While editing: status = draft.
5. When ready, auditee clicks Submit to finalize the responses: status = submitted (locked for auditee).
6. Auditor process is described in `docs/AuditorResponsePlan.md`.

## Data Model
- audit_auditee_submissions
  - id
  - audit_session_id (FK → audit_sessions)
  - unit_id (FK → units)
  - standar_mutu_id / indikator_id (FK)
  - pertanyaan_id (FK → pertanyaans)
  - note text nullable (opsional catatan auditee)
  - status enum: draft | submitted (default: draft)
  - submitted_by (FK → users) nullable
  - submitted_at datetime nullable
  - timestamps, soft deletes

- audit_auditee_submission_documents (pivot)
  - submission_id (FK → audit_auditee_submissions)
  - document_id (FK → documents)
  - note nullable

- Optional: audit_assignments (if not exist)
  - id, audit_session_id, user_id, unit_id, role (auditee/auditor), timestamps

Relations:
- AuditSession hasMany AuditeeSubmission
- AuditeeSubmission belongsTo AuditSession, Unit, StandarMutu, Indikator, Pertanyaan; belongsToMany Document
- Document belongsToMany AuditeeSubmission

## Permissions & Policies
- Permissions:
  - auditee-submission-view
  - auditee-submission-create
  - auditee-submission-update
  - auditee-submission-submit
- Policies:
  - Auditee can create/update/submit only for their assigned unit and session.
  - Auditor permissions are covered in `AuditorResponsePlan.md`.

## Backend (Laravel)
- Controller: AuditeeSubmissionController
  - index(session_id): resolve active session for logged auditee; list tree standar→indikator→pertanyaan + submission status/doc count
  - upsert(session_id, pertanyaan_id): create/update draft submission for the auditee’s unit
  - attachDocuments(submission_id, document_id[]): link evidence from Documents
  - submit(session_id): bulk mark all submissions for the unit+session as submitted; set submitted_by/at
- Routes (nested):
  - GET /audit-internal/{session}/auditee-submissions
  - POST /audit-internal/{session}/auditee-submissions/upsert
  - POST /auditee-submissions/{submission}/attach-documents
  - POST /audit-internal/{session}/auditee-submissions/submit

## Frontend (Inertia React + TS)
- Page: `resources/js/pages/audit-internal/AuditeeSubmissionsIndex.tsx`
  - Auto-select active session for logged auditee; show unit name.
  - Table (nested rows): Standar → Indikator → Pertanyaan.
  - Each pertanyaan row: Evidence cell with [Upload] and [Pilih Dokumen] actions; show selected doc(s) count and preview link.
  - Header action: [Submit Semua] to finalize (only enabled if all mandatory pertanyaan have at least one document).
- Evidence Picker:
  - Re-use Documents module; filter by category/status; show preview for image/PDF.
  - Respect unit-based access.

## Menu & Seeding
- Menu entries under Audit group:
  - "Auditee Submissions" (auditee view) → /audit-internal/{session}/auditee-submissions
- Seeder: create permissions above; grant to roles (admin, auditee). Optionally create an `auditee` role.

## Status Flow
- draft (auditee editable) → submitted (locked for auditee)

## Validation & Constraints
- Enforce one active submission per (session, unit, pertanyaan) to prevent duplicates (unique index).
- Limit document linking to unit-owned docs (or admin override).

## Iteration Plan
- MVP: tree table + attach/pick documents + submit + basic policies

## Reuse & Consistency
- Adopt the filtering/pagination patterns used in Documents/Dosen modules.
- Reuse `DocumentCard` preview pattern for evidence.
- Apply unit-based checks similar to DocumentPolicy.
