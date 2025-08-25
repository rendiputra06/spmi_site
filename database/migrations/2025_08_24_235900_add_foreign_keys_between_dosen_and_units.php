<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('dosen', function (Blueprint $table) {
            // Add FK from dosen.unit_id -> units.id (on delete set null)
            $table->foreign('unit_id')->references('id')->on('units')->nullOnDelete();
        });

        Schema::table('units', function (Blueprint $table) {
            // Add FK from units.leader_id -> dosen.id (on delete set null)
            $table->foreign('leader_id')->references('id')->on('dosen')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('dosen', function (Blueprint $table) {
            $table->dropForeign(['unit_id']);
        });

        Schema::table('units', function (Blueprint $table) {
            $table->dropForeign(['leader_id']);
        });
    }
};
