import React from 'react';
import { X, Check, Gamepad2, School, Wrench, ShieldAlert } from 'lucide-react';
import { HARDWARE_SCENARIOS, TROUBLESHOOT_PRESETS } from '../data/hardwareData';
import { HardwareScenario } from '../types/pc';

interface ScenarioPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedScenarioId: string;
  onSelectScenario: (scenario: HardwareScenario) => void;
  activeMode: 'tutorial' | 'sandbox' | 'exam' | 'troubleshoot';
  onSelectMode: (mode: 'tutorial' | 'sandbox' | 'exam' | 'troubleshoot') => void;
  onStartTroubleshootPreset: (presetId: string) => void;
}

export const ScenarioPickerModal: React.FC<ScenarioPickerModalProps> = ({
  isOpen,
  onClose,
  selectedScenarioId,
  onSelectScenario,
  activeMode,
  onSelectMode,
  onStartTroubleshootPreset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">
              Pilih Skenario Perakitan & Mode Praktikum
            </h3>
            <p className="text-xs text-slate-400">
              Sesuaikan spesifikasi komputer dan tingkat kesulitan pembelajaran lab vokasi
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {/* Mode Selector */}
          <div>
            <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-3">
              1. Pilih Mode Belajar
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Tutorial Mode */}
              <button
                onClick={() => onSelectMode('tutorial')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  activeMode === 'tutorial'
                    ? 'bg-sky-500/10 border-sky-500 ring-2 ring-sky-500/20'
                    : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-sm text-white flex items-center justify-between mb-1">
                  <span>Mode Terpandu (SOP)</span>
                  {activeMode === 'tutorial' && <Check className="w-4 h-4 text-sky-400" />}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Langkah demi langkah dengan panduan visual dan catatan keselamatan kerja industri.
                </p>
              </button>

              {/* Exam Mode */}
              <button
                onClick={() => onSelectMode('exam')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  activeMode === 'exam'
                    ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20'
                    : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-sm text-white flex items-center justify-between mb-1">
                  <span>Mode Ujian Praktikum</span>
                  {activeMode === 'exam' && <Check className="w-4 h-4 text-amber-400" />}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Merakit mandiri dengan timer waktu, pengurangan skor kesalahan, dan cetak rapor guru.
                </p>
              </button>

              {/* Troubleshoot Mode */}
              <button
                onClick={() => onSelectMode('troubleshoot')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  activeMode === 'troubleshoot'
                    ? 'bg-rose-500/10 border-rose-500 ring-2 ring-rose-500/20'
                    : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-sm text-white flex items-center justify-between mb-1">
                  <span>Tantangan Kerusakan</span>
                  {activeMode === 'troubleshoot' && <Check className="w-4 h-4 text-rose-400" />}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  PC gagal menyala! Analisis Debug LED dan kode beep untuk memperbaiki hardware.
                </p>
              </button>
            </div>
          </div>

          {/* Scenario Selector */}
          <div>
            <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-3">
              2. Pilih Spesifikasi Komputer (Skenario Praktikum)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {HARDWARE_SCENARIOS.map((scen) => {
                const isSelected = selectedScenarioId === scen.id;
                return (
                  <button
                    key={scen.id}
                    onClick={() => {
                      onSelectScenario(scen);
                    }}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-sky-500/10 border-sky-500 ring-2 ring-sky-500/20'
                        : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between font-bold text-sm text-white mb-1">
                        <span>{scen.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-sky-400 shrink-0" />}
                      </div>
                      <div className="text-[11px] text-sky-400 font-mono mb-2">
                        Estimasi: {scen.budgetEst}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed mb-3">
                        {scen.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-0.5">
                      <div>CPU: {scen.components.cpu.name.split('(')[0]}</div>
                      <div>RAM: {scen.components.ram.name.split('(')[0]}</div>
                      <div>VGA: {scen.components.gpu.name.split('(')[0]}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Troubleshooting Presets (If in troubleshoot mode) */}
          {activeMode === 'troubleshoot' && (
            <div>
              <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Pilih Kasus Kerusakan untuk Dianalisis:</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {TROUBLESHOOT_PRESETS.map((tp) => (
                  <button
                    key={tp.id}
                    onClick={() => {
                      onStartTroubleshootPreset(tp.id);
                      onClose();
                    }}
                    className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-rose-500/60 hover:bg-slate-900 text-left transition-all cursor-pointer group"
                  >
                    <div className="font-bold text-sm text-rose-300 group-hover:text-rose-200 mb-1">
                      {tp.title}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mb-2">
                      {tp.scenarioDescription}
                    </p>
                    <div className="text-[11px] font-mono text-rose-400 flex items-center gap-1 font-semibold">
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Mulai Diagnosa Kasus Ini &rarr;</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 bg-slate-900 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Terapkan & Mulai Merakit
          </button>
        </div>
      </div>
    </div>
  );
};
