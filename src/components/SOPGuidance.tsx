import React, { useState } from 'react';
import { AssemblyState, AssemblyStep } from '../types/pc';
import { AlertCircle, CheckCircle2, Clock, ChevronDown, ChevronUp, LogIn, LogOut, User as UserIcon, Wrench, Droplet, Hand, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface SOPGuidanceProps {
  assemblyState: AssemblyState;
  currentStep: AssemblyStep;
  totalSteps: number;
  onSelectPhase: (phase: 1 | 2 | 3 | 4) => void;
  onOpenScenarioModal: () => void;
  onOpenTroubleshootModal: () => void;
  onOpenHardwareSpecs: () => void;
}

export const SOPGuidance: React.FC<SOPGuidanceProps> = ({
  assemblyState,
  currentStep,
  totalSteps,
  onSelectPhase,
  onOpenScenarioModal,
  onOpenTroubleshootModal,
  onOpenHardwareSpecs,
}) => {
  const { user, signInWithGoogle, signOut } = useAuth();
  // Collapsible / Accordion state for opening and closing the SOP guidance panel
  const [isExpanded, setIsExpanded] = useState(true);

  // Format elapsed seconds into mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const phases = [
    { num: 1 as const, name: 'Preparasi Mobo' },
    { num: 2 as const, name: 'Sasis & Mounting' },
    { num: 3 as const, name: 'Power & Storage' },
    { num: 4 as const, name: 'Ekspansi & Kabel' },
  ];

  return (
    <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
      {/* Zone 1, 2, 3: Top Navigation Bar Contract */}
      <header className="pointer-events-auto flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-950/85 border-b border-slate-800/80 backdrop-blur-md">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-sky-500/20 text-sm">
            PC
          </div>
          <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
            PC Master Sim 3D
          </span>
        </div>

        {/* Zone 2: 4-5 Concise Single-line Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <button
            onClick={onOpenScenarioModal}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 text-left cursor-pointer"
          >
            Skenario Hardware
          </button>
          <button
            onClick={onOpenHardwareSpecs}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 text-left cursor-pointer"
          >
            Anatomi Komponen
          </button>
          <button
            onClick={onOpenTroubleshootModal}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 text-left cursor-pointer"
          >
            Tantangan Troubleshooting
          </button>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono tabular-nums whitespace-nowrap shrink-0">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>Waktu: {formatTime(assemblyState.elapsedSeconds)}</span>
          </div>
        </nav>

        {/* Zone 3: Primary Action & User Authentication */}
        <div className="flex items-center gap-2.5 shrink-0">
          {user ? (
            <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-900 border border-slate-700/80 rounded-lg text-xs">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-[10px]">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <span className="text-slate-200 font-medium max-w-[100px] truncate hidden sm:inline">
                {user.displayName || user.email?.split('@')[0]}
              </span>
              <button
                onClick={signOut}
                title="Keluar"
                className="text-slate-400 hover:text-rose-400 p-0.5 rounded transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <LogIn className="w-3.5 h-3.5 text-sky-400" />
              <span>Masuk Google</span>
            </button>
          )}

          <button
            onClick={onOpenScenarioModal}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
          >
            Ganti Mode
          </button>
        </div>
      </header>

      {/* SOP Status Banner & Guidance Card with Open/Close (Buka Tutup) */}
      <div className="p-4 max-w-2xl pointer-events-auto transition-all duration-300">
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-xl p-3.5 shadow-xl backdrop-blur-md">
          {/* Header Row with Toggle Button */}
          <div 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-between gap-3 cursor-pointer select-none"
          >
            <div className="flex items-center gap-2 text-xs truncate">
              <span className="font-bold text-sky-400 font-mono shrink-0">
                Langkah {currentStep.stepNumber}/{totalSteps}
              </span>
              <span className="text-slate-500">·</span>
              <span className="font-semibold text-white truncate">
                {currentStep.title}
              </span>
            </div>

            {/* Buka / Tutup Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/60 shadow-sm transition-colors shrink-0 cursor-pointer"
              title={isExpanded ? 'Tutup Panduan' : 'Buka Panduan SOP Lengkap'}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5 text-sky-400" />
                  <span>Tutup</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-sky-400" />
                  <span>Buka Panduan</span>
                </>
              )}
            </button>
          </div>

          {/* Expanded Content (Phase sequence, full instructions, and warnings) */}
          {isExpanded && (
            <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-3">
              {/* Phase Sequence Tabs */}
              <div className="flex items-center gap-1.5 pb-2 overflow-x-auto">
                {phases.map((p) => {
                  const isActive = assemblyState.currentPhase === p.num;
                  const isPassed = assemblyState.currentPhase > p.num;

                  return (
                    <button
                      key={p.num}
                      onClick={() => onSelectPhase(p.num)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                        isActive
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-semibold'
                          : isPassed
                          ? 'text-emerald-400 hover:bg-slate-800'
                          : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {isPassed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] flex items-center justify-center font-bold">
                          {p.num}
                        </span>
                      )}
                      <span>{p.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Current Step Instruction */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>{currentStep.phaseTitle}</span>
                  <span className="font-mono tabular-nums text-sky-400">
                    Langkah {currentStep.stepNumber} dari {totalSteps}
                  </span>
                </div>

                <h2 className="text-base font-bold text-white mb-1.5">
                  {currentStep.title}
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed mb-2.5">
                  {currentStep.instruction}
                </p>

                {/* Required Tool Indicator */}
                <div className="flex flex-wrap items-center gap-2 mb-2.5 text-xs">
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800 w-fit">
                    <span className="text-slate-400">Perkakas SOP:</span>
                    <span className="font-semibold text-sky-400 flex items-center gap-1.5">
                      {currentStep.toolRequired === 'screwdriver' && <Wrench className="w-3.5 h-3.5 text-amber-400" />}
                      {currentStep.toolRequired === 'thermal_paste' && <Droplet className="w-3.5 h-3.5 text-cyan-400" />}
                      {currentStep.toolRequired === 'cable' && <Zap className="w-3.5 h-3.5 text-yellow-400" />}
                      {(!currentStep.toolRequired || currentStep.toolRequired === 'hands') && <Hand className="w-3.5 h-3.5 text-sky-400" />}
                      <span>
                        {currentStep.toolRequired === 'screwdriver' ? 'Obeng Presisi Magnetik' :
                         currentStep.toolRequired === 'thermal_paste' ? 'Pasta Termal (Thermal Grease)' :
                         currentStep.toolRequired === 'cable' ? 'Pengkabelan Daya (Cabling)' : 'Tangan Kosong'}
                      </span>
                    </span>
                  </div>

                  {/* CPU Pin 1 Orientation Physical Lock Status */}
                  {(currentStep.id === 'step_cpu_install' || currentStep.id === 'step_cpu_lever_lock') && (
                    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold ${
                      assemblyState.cpuOrientation === 0
                        ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-950/70 border-rose-500/40 text-rose-300 animate-pulse'
                    }`}>
                      <span>Orientasi Pin 1:</span>
                      <span>{assemblyState.cpuOrientation === 0 ? 'Sejajar (0°) ✓' : `Terbalik (${assemblyState.cpuOrientation}°) ⚠️`}</span>
                    </div>
                  )}

                  {/* RAM Dual-Click Push Status */}
                  {currentStep.id === 'step_ram_install' && (
                    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold ${
                      assemblyState.ramPushStage === 'dual_clicked'
                        ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                        : assemblyState.ramPushStage === 'first_click'
                        ? 'bg-amber-950/70 border-amber-500/40 text-amber-300 animate-pulse'
                        : 'bg-slate-950/70 border-slate-800 text-slate-400'
                    }`}>
                      <span>Uji Dorong:</span>
                      <span>
                        {assemblyState.ramPushStage === 'dual_clicked'
                          ? 'Dual-Click Mantap ✓'
                          : assemblyState.ramPushStage === 'first_click'
                          ? 'Menancap Sebelah (Butuh Klik 2) ⚠️'
                          : 'Belum Terkunci'}
                      </span>
                    </div>
                  )}

                  {/* Active Target Guide Marker Badge */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-amber-500/30 bg-amber-950/40 text-amber-300 text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
                    <span className="text-amber-400">Target 3D:</span>
                    <span className="text-white font-medium">Klik Lingkaran Berkedip</span>
                  </div>
                </div>

                {/* SOP Warning Callout */}
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs leading-snug">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                  <span>{currentStep.sopWarning}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
