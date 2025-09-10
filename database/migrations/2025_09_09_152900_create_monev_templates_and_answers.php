<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('monev_templates', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->text('deskripsi')->nullable();
            $table->timestamps();
        });

        Schema::create('monev_template_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('template_id')->constrained('monev_templates')->cascadeOnDelete();
            $table->string('pertanyaan');
            // tipe pertanyaan, default rating 1-5
            $table->string('tipe')->default('rating_1_5');
            // aspek penilaian (textarea panjang per-pertanyaan)
            $table->longText('aspek_penilaian')->nullable();
            // keterangan per skala (1..5) disimpan sebagai JSON array
            $table->json('skala')->nullable();
            $table->unsignedInteger('urutan')->default(0);
            $table->timestamps();
        });

        Schema::table('monev_sessions', function (Blueprint $table) {
            $table->foreignId('template_id')->nullable()->after('tahun')->constrained('monev_templates')->nullOnDelete();
        });

        Schema::create('monev_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evaluation_id')->constrained('monev_evaluations')->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('monev_template_questions')->cascadeOnDelete();
            // nilai rating 1..5 untuk tipe rating_1_5
            $table->tinyInteger('nilai')->nullable();
            // catatan opsional
            $table->text('catatan')->nullable();
            $table->timestamps();
            $table->unique(['evaluation_id', 'question_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('monev_answers');
        Schema::table('monev_sessions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('template_id');
        });
        Schema::dropIfExists('monev_template_questions');
        Schema::dropIfExists('monev_templates');
    }
};
