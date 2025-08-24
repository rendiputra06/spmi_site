<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasColumn('dosen', 'unit_id')) {
            Schema::table('dosen', function (Blueprint $table) {
                $table->unsignedBigInteger('unit_id')->nullable()->after('email');
                $table->foreign('unit_id')->references('id')->on('units')->nullOnDelete();
                $table->index('unit_id');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('dosen', 'unit_id')) {
            Schema::table('dosen', function (Blueprint $table) {
                $table->dropForeign(['unit_id']);
                $table->dropIndex(['unit_id']);
                $table->dropColumn('unit_id');
            });
        }
    }
};
