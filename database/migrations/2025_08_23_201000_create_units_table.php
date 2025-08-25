<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('units', function (Blueprint $table) {
            $table->id();
            $table->string('kode')->unique();
            $table->string('nama');
            $table->string('tipe'); // universitas, fakultas, prodi, unit
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->unsignedBigInteger('leader_id')->nullable(); // reference to dosen
            $table->string('leader_nama')->nullable();
            $table->string('leader_jabatan')->nullable();
            $table->boolean('status')->default(true);
            $table->timestamps();

            $table->foreign('parent_id')->references('id')->on('units')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('units');
    }
};
