<?php

namespace App\Policies;

use App\Models\Document;
use App\Models\User;

class DocumentPolicy
{
    public function view(User $user, Document $document): bool
    {
        // Admins can view all; others can view within their unit
        if (method_exists($user, 'hasRole') && $user->hasRole('admin')) {
            return true;
        }
        $userUnitId = optional(optional($user)->dosen)->unit_id;
        return $userUnitId && $document->unit_id === $userUnitId;
    }

    public function update(User $user, Document $document): bool
    {
        if (method_exists($user, 'hasRole') && $user->hasRole('admin')) {
            return true;
        }
        $userUnitId = optional(optional($user)->dosen)->unit_id;
        return $userUnitId && $document->unit_id === $userUnitId;
    }

    public function delete(User $user, Document $document): bool
    {
        if (method_exists($user, 'hasRole') && $user->hasRole('admin')) {
            return true;
        }
        $userUnitId = optional(optional($user)->dosen)->unit_id;
        return $userUnitId && $document->unit_id === $userUnitId;
    }
}
