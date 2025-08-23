<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('standar_mutu', function (Blueprint $table) {
            $table->id();
            $table->string('kode')->unique();
            $table->string('nama');
            $table->text('deskripsi')->nullable();
            $table->boolean('status')->default(true);
            $table->timestamps();
        });

        Schema::create('indikator', function (Blueprint $table) {
            $table->id();
            $table->foreignId('standar_id')->constrained('standar_mutu')->onDelete('cascade');
            $table->string('nama');
            $table->text('kriteria_penilaian')->nullable();
            $table->enum('jenis_pengukuran', ['kuantitatif', 'kualitatif']);
            $table->string('target_pencapaian')->nullable();
            $table->integer('urutan')->default(0);
            $table->timestamps();
        });

        Schema::create('pertanyaan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('indikator_id')->constrained('indikator')->onDelete('cascade');
            $table->text('isi');
            $table->integer('urutan')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pertanyaan');
        Schema::dropIfExists('indikator');
        Schema::dropIfExists('standar_mutu');
    }
};
