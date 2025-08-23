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
    // standar mutu routes
    Route::resource('standar-mutu', StandarMutuController::class);
    Route::post('standar-mutu/{standar}/indikator', [StandarMutuController::class, 'storeIndikator']);
    Route::put('indikator/{id}', [StandarMutuController::class, 'updateIndikator']);
    Route::delete('indikator/{id}', [StandarMutuController::class, 'destroyIndikator']);
    Route::post('indikator/{indikator}/pertanyaan', [StandarMutuController::class, 'storePertanyaan']);
    Route::put('pertanyaan/{id}', [StandarMutuController::class, 'updatePertanyaan']);
    Route::delete('pertanyaan/{id}', [StandarMutuController::class, 'destroyPertanyaan']);
    Route::post('standar-mutu/{standar}/indikator/urutan', [StandarMutuController::class, 'updateUrutanIndikator']);
    Route::post('indikator/{indikator}/pertanyaan/urutan', [StandarMutuController::class, 'updateUrutanPertanyaan']);
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
