<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('auditor_reviews', function (Blueprint $table) {
            $table->id();
            // Match AuditeeSubmission::$table = 'audit_auditee_submissions'
            $table->foreignId('auditee_submission_id')->constrained('audit_auditee_submissions')->cascadeOnDelete()->unique();
            $table->decimal('score', 3, 1)->nullable(); // 0.1 - 2.0
            $table->text('reviewer_note')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('auditor_reviews');
    }
};
