<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('monev_evaluations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('monev_session_id')->constrained('monev_sessions')->cascadeOnDelete();
            // unit (prodi) being evaluated
            $table->foreignId('unit_id')->constrained('units')->cascadeOnDelete();
            // mata kuliah in that prodi
            $table->foreignId('mata_kuliah_id')->constrained('mata_kuliah')->cascadeOnDelete();
            // dosen pengajar
            $table->foreignId('dosen_id')->constrained('dosen')->cascadeOnDelete();
            // area monev (free text for now)
            $table->string('area');
            $table->timestamps();

            $table->index(['monev_session_id', 'unit_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('monev_evaluations');
    }
};
