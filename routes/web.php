<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\BackupController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\UserFileController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\SettingAppController;
use App\Http\Controllers\MediaFolderController;
use App\Http\Controllers\StandarMutuController;
use App\Http\Controllers\DosenController;
use App\Http\Controllers\UnitController;
use App\Http\Controllers\PeriodeController;
use App\Http\Controllers\AuditSessionController;
use App\Http\Controllers\AuditSessionDetailController;
use App\Http\Controllers\DocumentsController;
use App\Http\Controllers\AuditeeSubmissionController;
use App\Http\Controllers\UserImpersonationController;
use App\Http\Controllers\DosenProfileController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'menu.permission'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::resource('roles', RoleController::class);
    Route::resource('menus', MenuController::class);
    Route::post('menus/reorder', [MenuController::class, 'reorder'])->name('menus.reorder');
    Route::resource('permissions', PermissionController::class);
    Route::resource('users', UserController::class);
    Route::put('/users/{user}/reset-password', [UserController::class, 'resetPassword'])->name('users.reset-password');
    Route::get('/settingsapp', [SettingAppController::class, 'edit'])->name('setting.edit');
    Route::post('/settingsapp', [SettingAppController::class, 'update'])->name('setting.update');
    Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');
    Route::get('/backup', [BackupController::class, 'index'])->name('backup.index');
    Route::post('/backup/run', [BackupController::class, 'run'])->name('backup.run');
    Route::get('/backup/download/{file}', [BackupController::class, 'download'])->name('backup.download');
    Route::delete('/backup/delete/{file}', [BackupController::class, 'delete'])->name('backup.delete');
    Route::get('/files', [UserFileController::class, 'index'])->name('files.index');
    Route::post('/files', [UserFileController::class, 'store'])->name('files.store');
    Route::delete('/files/{id}', [UserFileController::class, 'destroy'])->name('files.destroy');
    Route::resource('media', MediaFolderController::class);
    // dosen routes
    Route::resource('dosen', DosenController::class)->only(['index','store','update','destroy']);
    // units routes
    Route::resource('units', UnitController::class)->only(['index','store','update','destroy']);
    // periodes routes
    Route::resource('periodes', PeriodeController::class)->only(['index','store','update','destroy']);
    // audit mutu internal (AMI)
    Route::resource('audit-internal', AuditSessionController::class)->only(['index','store','update','destroy']);
    Route::get('audit-internal/{id}/detail', [AuditSessionDetailController::class, 'show'])->name('audit-internal.detail');
    Route::post('audit-internal/{id}/standars', [AuditSessionDetailController::class, 'saveStandars']);
    Route::post('audit-internal/{id}/units', [AuditSessionDetailController::class, 'addUnit']);
    Route::delete('audit-internal/{id}/units/{sessionUnitId}', [AuditSessionDetailController::class, 'removeUnit']);
    Route::post('audit-internal/{id}/units/{sessionUnitId}/auditors', [AuditSessionDetailController::class, 'saveAuditors']);
    // standar mutu routes
    Route::resource('standar-mutu', StandarMutuController::class);
    Route::get('standar-mutu/{id}.json', [StandarMutuController::class, 'showJson'])->name('standar-mutu.show-json');
    Route::post('standar-mutu/{standar}/indikator', [StandarMutuController::class, 'storeIndikator']);
    Route::put('standar-mutu/{standar}/indikator/{id}', [StandarMutuController::class, 'updateIndikator']);
    Route::delete('standar-mutu/{standar}/indikator/{id}', [StandarMutuController::class, 'destroyIndikator']);
    Route::post('indikator/{indikator}/pertanyaan', [StandarMutuController::class, 'storePertanyaan']);
    Route::put('pertanyaan/{id}', [StandarMutuController::class, 'updatePertanyaan']);
    Route::delete('standar-mutu/{standar}/indikator/{indikator}/pertanyaan/{id}', [StandarMutuController::class, 'destroyPertanyaan']);
    Route::post('standar-mutu/{standar}/indikator/urutan', [StandarMutuController::class, 'updateUrutanIndikator']);
    Route::post('indikator/{indikator}/pertanyaan/urutan', [StandarMutuController::class, 'updateUrutanPertanyaan']);

    // documents management
    Route::resource('documents', DocumentsController::class)->only(['index','store','update','destroy']);
    Route::get('documents/{document}/download', [DocumentsController::class, 'download'])->name('documents.download');
    Route::get('documents.json', [DocumentsController::class, 'jsonIndex']);

    // auditee submissions (response)
    Route::get('audit-internal/{session}/auditee-submissions', [AuditeeSubmissionController::class, 'index']);
    Route::post('audit-internal/{session}/auditee-submissions/upsert', [AuditeeSubmissionController::class, 'upsert']);
    Route::post('auditee-submissions/{submission}/attach-documents', [AuditeeSubmissionController::class, 'attachDocuments']);
    Route::post('auditee-submissions/{submission}/detach-documents', [AuditeeSubmissionController::class, 'detachDocuments']);
    Route::post('audit-internal/{session}/auditee-submissions/submit', [AuditeeSubmissionController::class, 'submit']);
    Route::get('auditee-submissions/{submission}/documents', [AuditeeSubmissionController::class, 'documents']);

    // Auditor review routes
    Route::get('audit-internal/{session}/auditee-review', [\App\Http\Controllers\AuditeeSubmissionReviewController::class, 'index']);
    Route::post('auditee-submissions/{submission}/review', [\App\Http\Controllers\AuditeeSubmissionReviewController::class, 'review']);

    // impersonation routes
    Route::post('/users/{user}/impersonate', [UserImpersonationController::class, 'start'])->name('users.impersonate.start');
    Route::delete('/impersonate/stop', [UserImpersonationController::class, 'stop'])->name('users.impersonate.stop');

    // My Dosen profile (self-view)
    Route::get('/my/dosen', DosenProfileController::class)->name('my-dosen.index');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
