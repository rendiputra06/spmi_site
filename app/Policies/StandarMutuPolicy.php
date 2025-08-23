<?php

namespace App\Policies;

use App\Models\StandarMutu;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class StandarMutuPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('view_any_standar_mutu');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, StandarMutu $standarMutu): bool
    {
        return $user->can('view_standar_mutu');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('create_standar_mutu');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, StandarMutu $standarMutu): bool
    {
        return $user->can('update_standar_mutu');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, StandarMutu $standarMutu): bool
    {
        return $user->can('delete_standar_mutu');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, StandarMutu $standarMutu): bool
    {
        return $user->can('restore_standar_mutu');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, StandarMutu $standarMutu): bool
    {
        return $user->can('force_delete_standar_mutu');
    }
}
