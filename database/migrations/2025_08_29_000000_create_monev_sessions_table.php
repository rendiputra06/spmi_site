<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('monev_sessions', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->foreignId('periode_id')->constrained('periodes')->cascadeOnDelete();
            $table->integer('tahun');
            $table->date('tanggal_mulai');
            $table->date('tanggal_selesai');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('monev_sessions');
    }
};
