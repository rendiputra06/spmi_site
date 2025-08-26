<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('auditor_reviews', function (Blueprint $table) {
            $table->string('outcome_status')->nullable()->after('score'); // positif|negatif_observasi|negatif_minor|negatif_mayor
            $table->text('special_note')->nullable()->after('reviewer_note');
            $table->boolean('is_submitted')->default(false)->after('special_note');
            $table->timestamp('submitted_at')->nullable()->after('is_submitted');
        });
    }

    public function down(): void
    {
        Schema::table('auditor_reviews', function (Blueprint $table) {
            $table->dropColumn(['outcome_status', 'special_note', 'is_submitted', 'submitted_at']);
        });
    }
};
