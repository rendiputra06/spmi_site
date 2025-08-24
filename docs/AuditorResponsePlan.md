# Auditor Response Feature Plan

## Goals
- Provide a simple scoring/review interface for auditors on the active session assigned to them.
- Table with rows: Standar → Indikator → Pertanyaan → Dokumen (from auditee) → Skor (0.1–2.0) → Komentar.
- Status per pertanyaan response: draft | submitted.

## Data Model
- Reuse auditee submissions as the source of rows to review.
- audit_auditee_submissions (extended for auditor review fields)
  - score decimal(3,1) nullable (range 0.1–2.0)
  - reviewer_note text nullable
  - reviewed_by (FK → users) nullable
  - reviewed_at datetime nullable

Relations:
- AuditSession hasMany AuditeeSubmission
- AuditeeSubmission belongsTo AuditSession, Unit, StandarMutu, Indikator, Pertanyaan; belongsToMany Document

## Permissions & Policies
- Permissions: auditee-submission-review (auditor/QA)
- Policies:
  - Auditors can review submissions for sessions they are assigned to (and units in scope).
  - QA/Admin can view all; may also review depending on role.

## Backend (Laravel)
- Controller: AuditeeSubmissionReviewController (or reuse AuditeeSubmissionController with review methods)
  - index(session_id): resolve active session for logged auditor; list table standar→indikator→pertanyaan with linked documents
  - review(submission_id): set score (0.1–2.0 step 0.1), reviewer_note; mark status (draft/submitted as needed)
- Routes:
  - GET /audit-internal/{session}/auditee-review
  - POST /auditee-submissions/{submission}/review

## Frontend (Inertia React + TS)
- Page: `resources/js/pages/audit-internal/AuditeeReviewIndex.tsx`
  - Table rows: Standar → Indikator → Pertanyaan → Dokumen (list/preview) → Skor (input number step=0.1, min=0.1, max=2.0) → Komentar (textarea)
  - Filters: unit (admin), status (draft/submitted), search by indikator/pertanyaan
  - Actions: Save review per row; bulk Save optional

## Menu & Seeding
- Menu: add "Auditee Review" under Audit group → /audit-internal/{session}/auditee-review
- Seeder: create permissions above and assign to roles (admin, auditor). Optionally create an Auditor role.

## Workflow
1. Admin/QA sets up AuditSession (existing) and assigns auditors.
2. Auditor selects active session; table appears with rows per pertanyaan, showing linked documents from auditee.
3. Auditor sets skor (0.1–2.0) and komentar, then saves.

## Iteration Plan
- MVP: review table, set score/comment, save; basic policies

## Reuse & Consistency
- Reuse Documents preview (image/PDF) and filtering patterns.
- Follow Inertia pagination/filter pattern used in Documents/Dosen pages.
- Apply unit-based checks similar to DocumentPolicy.
