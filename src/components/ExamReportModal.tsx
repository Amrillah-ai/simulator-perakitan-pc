import React, { useState } from 'react';
import { X, Award, CheckCircle2, AlertTriangle, Printer, Clock, User, ShieldCheck, Cloud, Loader2 } from 'lucide-react';
import { AssemblyState, HardwareScenario } from '../types/pc';
import { useAuth } from '../context/AuthContext.tsx';

interface ExamReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  assemblyState: AssemblyState;
  scenario: HardwareScenario;
}

export const ExamReportModal: React.FC<ExamReportModalProps> = ({
  isOpen,
  onClose,
  assemblyState,
  scenario,
}) => {
  const { user, signInWithGoogle, saveResultToCloud } = useAuth();
  const [studentName, setStudentName] = useState(
    user?.displayName || assemblyState.studentName || 'Ahmad Fauzan'
  );
  const [studentClass, setStudentClass] = useState(assemblyState.studentClass || 'XI TKJ 1 (Teknik Komputer & Jaringan)');
  const [teacherName, setTeacherName] = useState('Budi Santoso, S.Kom., M.T.');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculate scores
  const sopScore = Math.max(10, 100 - assemblyState.sopMistakes.length * 15);
  const safetyScore = (assemblyState.standoffsInstalled ? 50 : 0) + (assemblyState.thermalPasteApplied ? 50 : 0);
  const cablingScore = 
    (assemblyState.cableMobo24PinConnected ? 25 : 0) +
    (assemblyState.cableCpu8PinConnected ? 25 : 0) +
    (assemblyState.cableGpuPcieConnected ? 25 : 0) +
    (assemblyState.cableFrontPanelConnected ? 25 : 0);
  
  const postSuccess = assemblyState.postState === 'post_success';
  const postScore = postSuccess ? 100 : assemblyState.isPowerOn ? 50 : 20;

  // Weighted total score: SOP 30%, Safety 25%, Cabling 25%, POST 20%
  const totalScore = Math.round(sopScore * 0.3 + safetyScore * 0.25 + cablingScore * 0.25 + postScore * 0.2);

  const getGrade = (score: number) => {
    if (score >= 90) return { letter: 'A', text: 'SANGAT KOMPETEN (EXCELLENT)', color: 'text-emerald-400' };
    if (score >= 75) return { letter: 'B', text: 'KOMPETEN (GOOD)', color: 'text-sky-400' };
    if (score >= 60) return { letter: 'C', text: 'CUKUP / PERLU PENGAYAAN', color: 'text-amber-400' };
    return { letter: 'D', text: 'BELUM KOMPETEN (REMEDIAL)', color: 'text-rose-400' };
  };

  const grade = getGrade(totalScore);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Rapor Hasil Uji Praktikum Perakitan Komputer
              </h3>
              <p className="text-xs text-slate-400">
                Format Penilaian Standar Vokasi SMK TKJ / RPL Berdasarkan SKKNI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {/* Student & Task Meta */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Nama Siswa / Praktikan:</label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white font-medium focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Kelas & Jurusan:</label>
              <input
                type="text"
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white font-medium focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Skenario Perakitan:</span>
              <span className="font-semibold text-white">{scenario.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Guru Pembimbing / Asesor:</span>
              <span className="font-semibold text-white">{teacherName}</span>
            </div>
          </div>

          {/* Score Badge Centerpiece */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-400 font-mono mb-1">
                NILAI AKHIR PRAKTIKUM
              </div>
              <div className="text-5xl font-black text-white font-mono flex items-baseline gap-2">
                <span>{totalScore}</span>
                <span className="text-lg text-slate-500 font-normal">/ 100</span>
              </div>
              <div className={`text-xs font-bold mt-1 ${grade.color}`}>
                PREDIKAT: {grade.letter} · {grade.text}
              </div>
            </div>

            <div className="text-right text-xs font-mono text-slate-400 space-y-1">
              <div>Waktu Pengerjaan: {Math.floor(assemblyState.elapsedSeconds / 60)}m {assemblyState.elapsedSeconds % 60}s</div>
              <div>Status Booting: {postSuccess ? 'LOLOS UJI POST' : 'GAGAL POST'}</div>
              <div>Kesalahan SOP: {assemblyState.sopMistakes.length} catatan</div>
            </div>
          </div>

          {/* Detailed Criteria Table */}
          <div>
            <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-3">
              Rincian Indikator Penilaian Objektif
            </h4>

            <div className="space-y-2.5 text-xs">
              {/* Criterion 1: SOP Urutan */}
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">1. Kepatuhan Urutan SOP Industri (Bobot 30%)</div>
                  <div className="text-slate-400 text-[11px]">
                    Memasang CPU, pasta termal, cooler, dan RAM di luar sasis sebelum memasukkan motherboard.
                  </div>
                </div>
                <div className="font-mono text-right">
                  <span className="font-bold text-sky-400 text-sm">{sopScore}</span>
                  <span className="text-slate-500"> / 100</span>
                </div>
              </div>

              {/* Criterion 2: Keselamatan & Pencegahan Korsleting */}
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">2. Keselamatan Kerja & Pencegahan Korsleting (Bobot 25%)</div>
                  <div className="text-slate-400 text-[11px]">
                    Memasang baut standoff kuningan sasis dan mengoles pasta termal dengan takaran pas.
                  </div>
                </div>
                <div className="font-mono text-right">
                  <span className="font-bold text-sky-400 text-sm">{safetyScore}</span>
                  <span className="text-slate-500"> / 100</span>
                </div>
              </div>

              {/* Criterion 3: Pengkabelan & Mekanikal */}
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">3. Pemasangan Komponen & Pengkabelan (Bobot 25%)</div>
                  <div className="text-slate-400 text-[11px]">
                    Koneksi kabel ATX 24-Pin, CPU 8-Pin, PCIe GPU, dan Front Panel switch.
                  </div>
                </div>
                <div className="font-mono text-right">
                  <span className="font-bold text-sky-400 text-sm">{cablingScore}</span>
                  <span className="text-slate-500"> / 100</span>
                </div>
              </div>

              {/* Criterion 4: Uji POST & Stabilitas */}
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">4. Validasi POST & Stabilitas Termal (Bobot 20%)</div>
                  <div className="text-slate-400 text-[11px]">
                    PC berhasil menyala, kipas berputar, lolos POST BIOS tanpa kode beep error.
                  </div>
                </div>
                <div className="font-mono text-right">
                  <span className="font-bold text-sky-400 text-sm">{postScore}</span>
                  <span className="text-slate-500"> / 100</span>
                </div>
              </div>
            </div>
          </div>

          {/* Log Pelanggaran SOP & Perkakas */}
          {assemblyState.sopMistakes.length > 0 && (
            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 text-xs">
              <div className="font-semibold text-rose-300 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Catatan Pelanggaran SOP & Disiplin Perkakas ({assemblyState.sopMistakes.length}):</span>
              </div>
              <ul className="space-y-1 list-disc list-inside text-rose-300/80 text-[11px] max-h-36 overflow-y-auto">
                {assemblyState.sopMistakes.map((m, idx) => (
                  <li key={idx} className="leading-snug">{m}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Teacher Notes & Feedback */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs">
            <div className="font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span>Catatan Evaluasi Guru Pembimbing:</span>
            </div>
            <p className="text-slate-400 leading-relaxed italic">
              {totalScore >= 80
                ? '"Praktikan menunjukkan pemahaman yang sangat baik terhadap SOP perakitan komputer industri. Langkah-langkah keselamatan kerja diterapkan secara tepat dan sistem berhasil lolos pengujian POST tanpa kesalahan."'
                : '"Praktikan disarankan untuk lebih teliti dalam urutan pemasangan kabel motherboard dan memastikan setiap slot pengunci (latch) berbunyi klik sebelum menyalakan daya."'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900 border-t border-slate-800">
          <div className="flex items-center gap-2">
            {user ? (
              <button
                onClick={async () => {
                  setIsSaving(true);
                  setSaveError(null);
                  const success = await saveResultToCloud({
                    studentName,
                    studentClass,
                    scenarioId: scenario.id,
                    scenarioTitle: scenario.name,
                    scoreTotal: totalScore,
                    scoreSop: sopScore,
                    scoreSafety: safetyScore,
                    scoreAccuracy: cablingScore,
                    scorePost: postScore,
                    timeSpentSeconds: assemblyState.elapsedSeconds,
                    grade: grade.letter,
                    feedback: totalScore >= 80 ? 'Sangat Kompeten' : 'Perlu Pengayaan',
                  });
                  setIsSaving(false);
                  if (success) {
                    setSaveSuccess(true);
                  } else {
                    setSaveError('Gagal menyimpan hasil. Coba lagi.');
                  }
                }}
                disabled={isSaving || saveSuccess}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  saveSuccess
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                {isSaving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : saveSuccess ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <Cloud className="w-3.5 h-3.5" />
                )}
                <span>
                  {saveSuccess ? 'Tersimpan ke Akun' : isSaving ? 'Menyimpan...' : 'Simpan Nilai ke Akun'}
                </span>
              </button>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <Cloud className="w-3.5 h-3.5 text-sky-400" />
                <span>Masuk untuk Simpan Nilai</span>
              </button>
            )}
            {saveError && (
              <span className="text-xs text-rose-400">{saveError}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Rapor</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
