<?php

namespace App\Http\Controllers;

use App\Models\AuditSession;
use App\Models\AuditSessionUnit;
use App\Models\AuditSessionUnitAuditor;
use App\Models\StandarMutu;
use App\Models\Unit;
use App\Models\Dosen;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuditSessionDetailController extends Controller
{
    public function show($id)
    {
        $session = AuditSession::with(['periode','standars','units.unit','units.auditors.dosen'])->findOrFail($id);
        $allStandars = StandarMutu::orderBy('kode')->get(['id','kode','nama']);
        $unitOptions = Unit::orderBy('nama')->get(['id','nama','tipe']);
        $auditorOptions = Dosen::orderBy('nama')->get(['id','nama','nidn']);

        // totals
        $standarIds = $session->standars->pluck('id');
        $totalStandar = $standarIds->count();
        $totalIndikator = \App\Models\Indikator::whereIn('standar_id', $standarIds)->count();
        $totalPertanyaan = \App\Models\Pertanyaan::whereIn('indikator_id', function($q) use ($standarIds) {
            $q->select('id')->from('indikator')->whereIn('standar_id', $standarIds);
        })->count();
        $totalUnit = $session->units()->count();

        return Inertia::render('audit-internal/Detail', [
            'session' => $session,
            'standar_options' => $allStandars,
            'unit_options' => $unitOptions,
            'auditor_options' => $auditorOptions,
            'stats' => [
                'total_standar' => $totalStandar,
                'total_indikator' => $totalIndikator,
                'total_pertanyaan' => $totalPertanyaan,
                'total_unit' => $totalUnit,
            ],
        ]);
    }

    public function saveStandars(Request $request, $id)
    {
        $session = AuditSession::findOrFail($id);
        $data = $request->validate([
            'standar_ids' => 'array',
            'standar_ids.*' => 'exists:standar_mutu,id',
        ]);
        $session->standars()->sync($data['standar_ids'] ?? []);
        return back();
    }

    public function addUnit(Request $request, $id)
    {
        $session = AuditSession::findOrFail($id);
        $data = $request->validate([
            'unit_id' => 'required|exists:units,id',
        ]);
        AuditSessionUnit::firstOrCreate([
            'audit_session_id' => $session->id,
            'unit_id' => $data['unit_id'],
        ]);
        return back();
    }

    public function removeUnit($id, $sessionUnitId)
    {
        $su = AuditSessionUnit::where('audit_session_id', $id)->findOrFail($sessionUnitId);
        $su->delete();
        return back();
    }

    public function saveAuditors(Request $request, $id, $sessionUnitId)
    {
        $su = AuditSessionUnit::where('audit_session_id', $id)->findOrFail($sessionUnitId);
        $data = $request->validate([
            'auditors' => 'array',
            'auditors.*.dosen_id' => 'required|exists:dosen,id',
            'auditors.*.role' => 'required|in:auditor,auditee',
        ]);
        // replace
        $su->auditors()->delete();
        foreach ($data['auditors'] ?? [] as $a) {
            AuditSessionUnitAuditor::create([
                'audit_session_unit_id' => $su->id,
                'dosen_id' => $a['dosen_id'],
                'role' => $a['role'],
            ]);
        }
        return back();
    }
}
