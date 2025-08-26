<?php

namespace App\Policies;

use App\Models\AuditSessionUnitAuditor;
use App\Models\AuditeeSubmission;
use App\Models\User;

class AuditeeSubmissionReviewPolicy
{
    public function review(User $user, AuditeeSubmission $submission): bool
    {
        // Admins always allowed
        if (method_exists($user, 'hasRole') && $user->hasRole('admin')) {
            return true;
        }

        // Must have permission to review
        if (method_exists($user, 'can') && !$user->can('auditee-submission-review')) {
            return false;
        }

        // Must be assigned as auditor to the session and the specific unit
        $dosenId = optional(optional($user)->dosen)->id;
        if (!$dosenId) return false;

        $assignedUnitIds = AuditSessionUnitAuditor::whereHas('sessionUnit', function ($q) use ($submission) {
                $q->where('audit_session_id', $submission->audit_session_id);
            })
            ->where('dosen_id', $dosenId)
            ->with('sessionUnit')
            ->get()
            ->pluck('sessionUnit.unit_id')
            ->unique();

        return $assignedUnitIds->contains($submission->unit_id);
    }
}
