import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import React, { useMemo, useState } from 'react';
import DocsPreviewModal from './DocsPreviewModal';

export interface DocItem {
  id: number;
  title: string;
  mime?: string | null;
  size?: number | null;
  download_url: string;
}

export interface SubmissionRow {
  id: number;
  unit_id: number;
  standar: { id: number; nama: string } | null;
  indikator: { id: number; nama: string } | null;
  pertanyaan: { id: number; isi: string } | null;
  documents: DocItem[];
  review: {
    score?: number | string | null;
    reviewer_note?: string | null;
    outcome_status?: string | null;
    special_note?: string | null;
    is_submitted?: boolean | null;
    submitted_at?: string | null;
  } | null;
}

interface Props {
  submissions: SubmissionRow[];
  draft: Record<number, { score?: string; reviewer_note?: string; outcome_status?: string; special_note?: string }>;
  saving: Record<number, boolean>;
  isUnitSubmitted: boolean;
  onChange: (id: number, field: 'score' | 'reviewer_note' | 'outcome_status' | 'special_note', value: string) => void;
  onSaveRow: (id: number) => void;
}

export default function AuditeeReviewTable({ submissions, draft, saving, isUnitSubmitted, onChange, onSaveRow }: Props) {
  const groups = useMemo(() => {
    const byStandar: Record<string, { standar?: SubmissionRow['standar']; indikators: Record<string, { indikator?: SubmissionRow['indikator']; rows: SubmissionRow[] }> }> = {};
    submissions.forEach((row) => {
      const sKey = row.standar?.id ? String(row.standar.id) : 'null';
      const iKey = row.indikator?.id ? String(row.indikator.id) : 'null';
      if (!byStandar[sKey]) byStandar[sKey] = { standar: row.standar || undefined, indikators: {} };
      if (!byStandar[sKey].indikators[iKey]) byStandar[sKey].indikators[iKey] = { indikator: row.indikator || undefined, rows: [] };
      byStandar[sKey].indikators[iKey].rows.push(row);
    });
    return byStandar;
  }, [submissions]);

  // Document preview state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocItem | null>(null);
  const openPreview = (doc: DocItem) => { setPreviewDoc(doc); setPreviewOpen(true); };
  const closePreview = () => { setPreviewOpen(false); setPreviewDoc(null); };

  // Score modal state
  const [scoreModal, setScoreModal] = useState<{ open: boolean; rowId?: number }>({ open: false });
  const openScore = (rowId: number) => setScoreModal({ open: true, rowId });
  const closeScore = () => setScoreModal({ open: false });
  const setScore = (val: '0' | '1' | '2') => {
    if (!scoreModal.rowId) return;
    onChange(scoreModal.rowId, 'score', val);
  };

  return (
    <>
      <div className="overflow-x-auto rounded-lg border mt-3">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-2 text-left">Standar / Indikator / Pertanyaan</th>
              <th className="px-3 py-2 text-left">Link Bukti Dokumen</th>
              <th className="px-3 py-2 text-left" style={{ width: 220 }}>
                Hasil Observasi
              </th>
              <th className="px-3 py-2 text-left" style={{ width: 220 }}>
                Status Hasil Audit
              </th>
              <th className="px-3 py-2 text-left" style={{ width: 180 }}>
                Skor
              </th>
              <th className="px-3 py-2 text-left" style={{ width: 260 }}>
                Catatan Khusus
              </th>
              <th className="px-3 py-2 text-left" style={{ width: 120 }}>
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groups).map(([sKey, sVal]) => (
              <React.Fragment key={`standar-${sKey}`}>
                <tr className="bg-muted/30">
                  <td className="px-3 py-2 font-semibold" colSpan={5}>
                    {sVal.standar?.nama || 'Tanpa Standar'}
                  </td>
                </tr>
                {Object.entries(sVal.indikators).map(([iKey, iVal]) => (
                  <React.Fragment key={`indikator-${sKey}-${iKey}`}>
                    <tr className="bg-muted/20">
                      <td className="px-3 py-2 pl-6 font-medium" colSpan={5}>
                        {iVal.indikator?.nama || 'Tanpa Indikator'}
                      </td>
                    </tr>
                    {iVal.rows.map((r) => (
                      <tr key={`q-${r.id}`} className="align-top">
                        <td className="px-3 py-2 pl-10">- {r.pertanyaan?.isi}</td>
                        <td className="px-3 py-2">
                          <div className="flex flex-col gap-1">
                            {r.documents?.length ? (
                              r.documents.map((d) => (
                                <button
                                  key={d.id}
                                  className="text-left text-xs text-blue-600 underline hover:text-blue-700"
                                  onClick={() => openPreview(d)}
                                >
                                  {d.title}
                                </button>
                              ))
                            ) : (
                              <span className="text-muted-foreground">Tidak ada dokumen</span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <Textarea
                            value={draft[r.id]?.reviewer_note ?? ''}
                            onChange={(e) => onChange(r.id, 'reviewer_note', e.target.value)}
                            placeholder="Hasil Observasi"
                            rows={2}
                            disabled={isUnitSubmitted}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex flex-col gap-1 text-sm">
                            {[
                              { val: 'positif', label: 'Positif' },
                              { val: 'negatif_observasi', label: 'Negatif (Observasi)' },
                              { val: 'negatif_minor', label: 'Negatif (Minor)' },
                              { val: 'negatif_mayor', label: 'Negatif (Mayor)' },
                            ].map((opt) => (
                              <label key={opt.val} className="inline-flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`status-${r.id}`}
                                  value={opt.val}
                                  checked={draft[r.id]?.outcome_status === opt.val}
                                  onChange={(e) => onChange(r.id, 'outcome_status', e.target.value)}
                                  disabled={isUnitSubmitted}
                                />
                                <span>{opt.label}</span>
                              </label>
                            ))}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="inline-block min-w-6 text-center font-medium">
                              {(draft[r.id]?.score ?? '') !== '' ? draft[r.id]?.score : '-'}
                            </span>
                            <Button size="sm" variant="outline" onClick={() => openScore(r.id)} disabled={isUnitSubmitted}>
                              Pilih Skor
                            </Button>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <Textarea
                            value={draft[r.id]?.special_note ?? ''}
                            onChange={(e) => onChange(r.id, 'special_note', e.target.value)}
                            placeholder="Catatan Khusus"
                            rows={2}
                            disabled={isUnitSubmitted}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex flex-col gap-2">
                            <Button size="sm" onClick={() => onSaveRow(r.id)} disabled={!!saving[r.id] || isUnitSubmitted}>
                              {saving[r.id] ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {/* Preview Modal */}
      <DocsPreviewModal open={previewOpen} onClose={closePreview} doc={previewDoc} />
      {/* Score Modal */}
      {scoreModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-lg">
            <h3 className="mb-3 text-lg font-semibold">Pilih Skor</h3>
            <div className="space-y-2 text-sm">
              <label className="flex items-start gap-2">
                <input
                  type="radio"
                  name="score-pick"
                  value="0"
                  checked={draft[scoreModal.rowId!]?.score === '0'}
                  onChange={() => setScore('0')}
                />
                <div>
                  <div className="font-medium">0</div>
                  <div className="text-muted-foreground">tidak ada Dokumen (Tidak Memenuhi Standar Univrab)</div>
                </div>
              </label>
              <label className="flex items-start gap-2">
                <input
                  type="radio"
                  name="score-pick"
                  value="1"
                  checked={draft[scoreModal.rowId!]?.score === '1'}
                  onChange={() => setScore('1')}
                />
                <div>
                  <div className="font-medium">1</div>
                  <div className="text-muted-foreground">ada Dokumen (Memenuhi Standar Univrab)</div>
                </div>
              </label>
              <label className="flex items-start gap-2">
                <input
                  type="radio"
                  name="score-pick"
                  value="2"
                  checked={draft[scoreModal.rowId!]?.score === '2'}
                  onChange={() => setScore('2')}
                />
                <div>
                  <div className="font-medium">2</div>
                  <div className="text-muted-foreground">ada Dokumen tambahan (Melebihi Standar Univrab)</div>
                </div>
              </label>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={closeScore}>Batal</Button>
              <Button onClick={closeScore}>Selesai</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
