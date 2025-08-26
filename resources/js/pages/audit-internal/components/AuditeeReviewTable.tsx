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
  answer_comment?: string | null;
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

  // Review modal state (moves all inputs into a single modal)
  const [reviewModal, setReviewModal] = useState<{ open: boolean; row?: SubmissionRow }>({ open: false });
  const openReview = (row: SubmissionRow) => setReviewModal({ open: true, row });
  const closeReview = () => setReviewModal({ open: false });
  const setScore = (val: '0' | '1' | '2') => {
    if (!reviewModal.row) return;
    onChange(reviewModal.row.id, 'score', val);
  };
  const onChangeField = (field: 'reviewer_note' | 'outcome_status' | 'special_note', value: string) => {
    if (!reviewModal.row) return;
    onChange(reviewModal.row.id, field, value);
  };
  const clearReview = () => {
    if (!reviewModal.row) return;
    onChange(reviewModal.row.id, 'score', '');
    onChange(reviewModal.row.id, 'outcome_status', '');
    onChange(reviewModal.row.id, 'reviewer_note', '');
    onChange(reviewModal.row.id, 'special_note', '');
  };

  return (
    <>
      <div className="overflow-x-auto rounded-lg border mt-3">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-2 text-left">Standar / Indikator / Pertanyaan</th>
              <th className="px-3 py-2 text-left">Link Bukti Dokumen</th>
              <th className="px-3 py-2 text-left" style={{ width: 260 }}>Narasi Auditee</th>
              <th className="px-3 py-2 text-left" style={{ width: 180 }}>Status</th>
              <th className="px-3 py-2 text-left" style={{ width: 120 }}>Aksi</th>
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
                          <div className="text-sm whitespace-pre-wrap">
                            {r.answer_comment && r.answer_comment.trim() !== '' ? (
                              r.answer_comment
                            ) : (
                              <span className="text-muted-foreground">Belum ada narasi</span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          {renderStatusBadge(r, draft)}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex flex-col gap-2">
                            <Button size="sm" variant="outline" onClick={() => openReview(r)} disabled={isUnitSubmitted}>
                              Review
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
      {/* Review Modal */}
      {reviewModal.open && reviewModal.row && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-2xl rounded-lg bg-white p-4 shadow-lg">
            <h3 className="mb-3 text-lg font-semibold">Review Auditor</h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium mb-1">Pertanyaan</div>
                <div className="text-sm text-muted-foreground">{reviewModal.row.pertanyaan?.isi}</div>
              </div>
              <div>
                <div className="text-sm font-medium mb-1">Skor</div>
                <div className="space-y-2 text-sm">
                  {[
                    { val: '0', label: '0 — tidak ada Dokumen (Tidak Memenuhi Standar Univrab)' },
                    { val: '1', label: '1 — ada Dokumen (Memenuhi Standar Univrab)' },
                    { val: '2', label: '2 — ada Dokumen tambahan (Melebihi Standar Univrab)' },
                  ].map((opt) => (
                    <label key={opt.val} className="flex items-start gap-2">
                      <input
                        type="radio"
                        name="score-pick"
                        value={opt.val}
                        checked={(draft[reviewModal.row!.id]?.score ?? '') === opt.val}
                        onChange={() => setScore(opt.val as '0' | '1' | '2')}
                        disabled={isUnitSubmitted}
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-1">Status Hasil Audit</div>
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
                        name={`status-${reviewModal.row!.id}`}
                        value={opt.val}
                        checked={draft[reviewModal.row!.id]?.outcome_status === opt.val}
                        onChange={(e) => onChangeField('outcome_status', e.target.value)}
                        disabled={isUnitSubmitted}
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-1">Hasil Observasi</div>
                <Textarea
                  value={draft[reviewModal.row.id]?.reviewer_note ?? ''}
                  onChange={(e) => onChangeField('reviewer_note', e.target.value)}
                  placeholder="Hasil Observasi"
                  rows={3}
                  disabled={isUnitSubmitted}
                />
              </div>
              <div>
                <div className="text-sm font-medium mb-1">Catatan Khusus</div>
                <Textarea
                  value={draft[reviewModal.row.id]?.special_note ?? ''}
                  onChange={(e) => onChangeField('special_note', e.target.value)}
                  placeholder="Catatan Khusus"
                  rows={3}
                  disabled={isUnitSubmitted}
                />
              </div>
            </div>
            <div className="mt-4 flex justify-between gap-2">
              <div className="flex gap-2">
                <Button variant="outline" onClick={clearReview} disabled={isUnitSubmitted}>Kosongkan</Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={closeReview}>Batal</Button>
                <Button onClick={() => { onSaveRow(reviewModal.row!.id); closeReview(); }} disabled={!!saving[reviewModal.row!.id] || isUnitSubmitted}>
                  {saving[reviewModal.row!.id] ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function renderStatusBadge(r: SubmissionRow, draft: Props['draft']) {
  const savedScore = r.review?.score !== undefined && r.review?.score !== null && String(r.review?.score) !== '';
  const savedStatus = !!r.review?.outcome_status && r.review?.outcome_status !== '';
  const draftScore = (draft[r.id]?.score ?? '') !== '';
  const draftStatus = (draft[r.id]?.outcome_status ?? '') !== '';

  const isComplete = draftScore && draftStatus;
  const isSaved = savedScore && savedStatus;
  const isDirty = (draft[r.id]?.score ?? '') !== (r.review?.score !== undefined && r.review?.score !== null ? String(r.review?.score) : '')
    || (draft[r.id]?.outcome_status ?? '') !== (r.review?.outcome_status ?? '')
    || (draft[r.id]?.reviewer_note ?? '') !== (r.review?.reviewer_note ?? '')
    || (draft[r.id]?.special_note ?? '') !== (r.review?.special_note ?? '');

  const pill = (text: string, color: string) => (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>{text}</span>
  );

  return (
    <div className="flex flex-col gap-1">
      {isComplete ? pill('Lengkap', 'bg-green-100 text-green-700') : pill('Belum Lengkap', 'bg-yellow-100 text-yellow-700')}
      {isDirty ? pill('Perubahan Belum Disimpan', 'bg-orange-100 text-orange-700') : (isSaved ? pill('Tersimpan', 'bg-blue-100 text-blue-700') : pill('Belum Ada Review', 'bg-gray-100 text-gray-700'))}
    </div>
  );
}
