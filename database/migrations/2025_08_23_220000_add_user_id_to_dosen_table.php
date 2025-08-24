<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasColumn('dosen', 'user_id')) {
            Schema::table('dosen', function (Blueprint $table) {
                $table->unsignedBigInteger('user_id')->nullable()->after('email');
                $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
                $table->index('user_id');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('dosen', 'user_id')) {
            Schema::table('dosen', function (Blueprint $table) {
                $table->dropForeign(['user_id']);
                $table->dropIndex(['user_id']);
                $table->dropColumn('user_id');
            });
        }
    }
};
