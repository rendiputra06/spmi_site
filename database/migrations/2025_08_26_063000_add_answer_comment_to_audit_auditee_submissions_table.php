<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('audit_auditee_submissions', function (Blueprint $table) {
            $table->text('answer_comment')->nullable()->after('note');
        });
    }

    public function down(): void
    {
        Schema::table('audit_auditee_submissions', function (Blueprint $table) {
            $table->dropColumn('answer_comment');
        });
    }
};
