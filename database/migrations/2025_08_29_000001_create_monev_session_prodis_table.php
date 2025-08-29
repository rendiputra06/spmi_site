<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('monev_session_prodis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('monev_session_id')->constrained('monev_sessions')->cascadeOnDelete();
            $table->foreignId('unit_id')->constrained('units')->cascadeOnDelete();
            $table->foreignId('gjm_dosen_id')->constrained('dosen')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['monev_session_id', 'unit_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('monev_session_prodis');
    }
};
