<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('audit_session_auditor_reports', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('audit_session_id');
            $table->unsignedBigInteger('unit_id');
            $table->unsignedBigInteger('uploaded_by');
            $table->string('title')->nullable();
            $table->text('notes')->nullable();
            // legacy file fields for quick access; Spatie MediaLibrary will store the real file
            $table->string('file_path')->nullable();
            $table->string('mime')->nullable();
            $table->unsignedBigInteger('size')->nullable();
            $table->timestamps();

            $table->foreign('audit_session_id')->references('id')->on('audit_sessions')->onDelete('cascade');
            $table->foreign('unit_id')->references('id')->on('units')->onDelete('cascade');
            $table->foreign('uploaded_by')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_session_auditor_reports');
    }
};
