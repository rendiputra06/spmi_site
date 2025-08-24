<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('audit_auditee_submissions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('audit_session_id');
            $table->unsignedBigInteger('unit_id');
            $table->unsignedBigInteger('standar_mutu_id');
            $table->unsignedBigInteger('indikator_id');
            $table->unsignedBigInteger('pertanyaan_id');
            $table->text('note')->nullable();
            $table->enum('status', ['draft', 'submitted'])->default('draft');
            $table->unsignedBigInteger('submitted_by')->nullable();
            $table->timestamp('submitted_at')->nullable();
            // reviewer fields (for auditor usage later)
            $table->decimal('score', 3, 1)->nullable(); // 0.1 - 2.0
            $table->text('reviewer_note')->nullable();
            $table->unsignedBigInteger('reviewed_by')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['audit_session_id', 'unit_id', 'pertanyaan_id'], 'uniq_session_unit_question');
        });

        Schema::create('audit_auditee_submission_documents', function (Blueprint $table) {
            $table->unsignedBigInteger('submission_id');
            $table->unsignedBigInteger('document_id');
            $table->string('note')->nullable();
            $table->primary(['submission_id', 'document_id'], 'pk_submission_document');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_auditee_submission_documents');
        Schema::dropIfExists('audit_auditee_submissions');
    }
};
