<?php

namespace Database\Seeders;

use App\Models\Document;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DocumentSeeder extends Seeder
{
    public function run(): void
    {
        // Ensure storage directory exists
        Storage::disk('public')->makeDirectory('documents');

        $units = Unit::select('id', 'nama')->get();
        if ($units->isEmpty()) {
            // Nothing to seed without units
            return;
        }

        // Prefer admin as uploader if exists
        $admin = User::where('email', 'admin@admin.com')->first();
        $uploaderId = $admin?->id ?? User::query()->inRandomOrder()->value('id');
        if (!$uploaderId) {
            return; // no users
        }

        $samples = [
            ['title' => 'Kebijakan Mutu', 'category' => 'Kebijakan', 'status' => 'published'],
            ['title' => 'Prosedur Operasional (SOP) Pembelajaran', 'category' => 'SOP', 'status' => 'published'],
            ['title' => 'Rencana Strategis Unit', 'category' => 'Rencana', 'status' => 'draft'],
            ['title' => 'Laporan Evaluasi Internal', 'category' => 'Laporan', 'status' => 'published'],
            ['title' => 'Bukti Kegiatan Pengabdian', 'category' => 'Bukti', 'status' => 'draft'],
        ];

        foreach ($units as $unit) {
            foreach ($samples as $s) {
                $filename = Str::slug($s['title']).'-'.Str::random(6).'.txt';
                $path = 'documents/'.$filename;
                $content = "Judul: {$s['title']}\nUnit: {$unit->nama}\nKategori: {$s['category']}\nSeeder generated content.";
                Storage::disk('public')->put($path, $content);
                $size = Storage::disk('public')->size($path) ?: strlen($content);

                Document::create([
                    'unit_id' => $unit->id,
                    'uploaded_by' => $uploaderId,
                    'title' => $s['title'],
                    'description' => 'Dokumen contoh untuk unit '.$unit->nama,
                    'category' => $s['category'],
                    'status' => $s['status'],
                    'file_path' => $path,
                    'mime' => 'text/plain',
                    'size' => $size,
                ]);
            }
        }
    }
}
