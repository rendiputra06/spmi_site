<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('audit_sessions', function (Blueprint $table) {
            $table->id();
            $table->string('kode')->unique();
            $table->string('nama');
            $table->unsignedBigInteger('periode_id')->nullable();
            $table->date('tanggal_mulai');
            $table->date('tanggal_selesai');
            $table->text('deskripsi')->nullable();
            $table->boolean('status')->default(true);
            $table->boolean('is_locked')->default(false);
            $table->timestamps();

            $table->foreign('periode_id')->references('id')->on('periodes')->nullOnDelete();
        });

        Schema::create('audit_session_standars', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('audit_session_id');
            $table->unsignedBigInteger('standar_id');
            $table->timestamps();

            $table->unique(['audit_session_id','standar_id']);
            $table->foreign('audit_session_id')->references('id')->on('audit_sessions')->cascadeOnDelete();
            $table->foreign('standar_id')->references('id')->on('standar_mutu')->cascadeOnDelete();
        });

        Schema::create('audit_session_units', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('audit_session_id');
            $table->unsignedBigInteger('unit_id');
            $table->timestamps();

            $table->unique(['audit_session_id','unit_id']);
            $table->foreign('audit_session_id')->references('id')->on('audit_sessions')->cascadeOnDelete();
            $table->foreign('unit_id')->references('id')->on('units')->cascadeOnDelete();
        });

        Schema::create('audit_session_unit_auditors', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('audit_session_unit_id');
            $table->unsignedBigInteger('dosen_id');
            $table->string('role'); // auditor|auditee
            $table->timestamps();

            $table->foreign('audit_session_unit_id')->references('id')->on('audit_session_units')->cascadeOnDelete();
            $table->foreign('dosen_id')->references('id')->on('dosen')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_session_unit_auditors');
        Schema::dropIfExists('audit_session_units');
        Schema::dropIfExists('audit_session_standars');
        Schema::dropIfExists('audit_sessions');
    }
};
