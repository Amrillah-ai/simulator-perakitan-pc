import React, { useState } from 'react';
import { 
  Wrench, 
  Droplet, 
  Hand, 
  Zap, 
  Power, 
  Volume2, 
  VolumeX, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw,
  Monitor,
  Box,
  Cpu,
  Layers,
  FileCheck,
  Move,
  Rotate3d,
  ZoomIn,
  ZoomOut,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  PanelRightOpen,
  PanelRightClose,
  AlertTriangle,
  Clock,
  RotateCw,
  Check
} from 'lucide-react';
import { AssemblyState, AssemblyStep } from '../types/pc';

interface ControlOverlayProps {
  assemblyState: AssemblyState;
  currentStep: AssemblyStep;
  activeCameraPreset: 'bench' | 'case' | 'monitor' | 'free';
  onSelectCamera: (preset: 'bench' | 'case' | 'monitor' | 'free') => void;
  onExecuteAction: () => void;
  onReset: () => void;
  onOpenExamReport: () => void;
  onOpenBIOS: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  selectedTool: 'hands' | 'thermal_paste' | 'screwdriver' | 'cable';
  onSelectTool: (tool: 'hands' | 'thermal_paste' | 'screwdriver' | 'cable') => void;
  cursorMode: 'orbit' | 'pan';
  onToggleCursorMode: () => void;
  onPanCamera?: (x: number, y: number) => void;
  onZoomCamera?: (delta: number) => void;
  onResetCamera?: () => void;
  onToggleCaseGlass?: () => void;
  onRotateCpu?: () => void;
  cooldownRemaining?: number;
  shakeTool?: boolean;
  shakeButton?: boolean;
}

export const ControlOverlay: React.FC<ControlOverlayProps> = ({
  assemblyState,
  currentStep,
  activeCameraPreset,
  onSelectCamera,
  onExecuteAction,
  onReset,
  onOpenExamReport,
  onOpenBIOS,
  isMuted,
  onToggleMute,
  selectedTool,
  onSelectTool,
  cursorMode,
  onToggleCursorMode,
  onPanCamera,
  onZoomCamera,
  onResetCamera,
  onToggleCaseGlass,
  onRotateCpu,
  cooldownRemaining = 0,
  shakeTool = false,
  shakeButton = false,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const expectedTool = currentStep.toolRequired || 'hands';
  const isWrongTool = selectedTool !== expectedTool;

  const TOOL_LABELS: Record<'hands' | 'thermal_paste' | 'screwdriver' | 'cable', string> = {
    hands: 'Tangan',
    screwdriver: 'Obeng',
    thermal_paste: 'Pasta Termal',
    cable: 'Kabel',
  };

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 w-full max-w-4xl px-4 pointer-events-none transition-transform duration-300">
      {/* Floating Camera Navigation & Mode Pill Strip */}
      <div className="flex items-center justify-between gap-2 mb-2 pointer-events-auto">
        {/* Navigation Mode: Putar vs Geser */}
        <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700/70 rounded-lg p-1 shadow-lg backdrop-blur-md">
          <button
            onClick={() => {
              if (cursorMode !== 'orbit') onToggleCursorMode();
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              cursorMode === 'orbit'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Klik kiri untuk memutar kamera 360 derajat"
          >
            <Rotate3d className="w-3.5 h-3.5" />
            <span>Mode Putar</span>
          </button>

          <button
            onClick={() => {
              if (cursorMode !== 'pan') onToggleCursorMode();
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              cursorMode === 'pan'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Klik kiri dan geser untuk memindahkan posisi meja kerja secara bebas"
          >
            <Move className="w-3.5 h-3.5" />
            <span>Mode Geser (Bebas)</span>
          </button>
        </div>

        {/* Quick Direct Pan & Zoom Buttons */}
        <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700/70 rounded-lg p-1 shadow-lg backdrop-blur-md">
          {/* Pan Left */}
          <button
            onClick={() => onPanCamera && onPanCamera(-0.25, 0)}
            className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Geser Kamera ke Kiri"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          {/* Pan Up */}
          <button
            onClick={() => onPanCamera && onPanCamera(0, 0.2)}
            className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Geser Kamera ke Atas"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          {/* Pan Down */}
          <button
            onClick={() => onPanCamera && onPanCamera(0, -0.2)}
            className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Geser Kamera ke Bawah"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
          {/* Pan Right */}
          <button
            onClick={() => onPanCamera && onPanCamera(0.25, 0)}
            className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Geser Kamera ke Kanan"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-slate-700 mx-0.5" />

          {/* Zoom In */}
          <button
            onClick={() => onZoomCamera && onZoomCamera(1)}
            className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Perbesar Tampilan (Zoom In)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          {/* Zoom Out */}
          <button
            onClick={() => onZoomCamera && onZoomCamera(-1)}
            className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Perkecil Tampilan (Zoom Out)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          {/* Reset Camera */}
          <button
            onClick={() => onResetCamera && onResetCamera()}
            className="p-1 rounded text-slate-300 hover:text-sky-400 hover:bg-slate-800 transition-colors ml-0.5"
            title="Reset Sudut Pandang Kamera"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Collapse / Expand Toggle Button */}
        <div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium rounded-lg border border-slate-700/70 shadow-lg backdrop-blur-md transition-colors cursor-pointer"
            title={isCollapsed ? 'Tampilkan Kontrol Meja Kerja' : 'Sembunyikan Panel'}
          >
            {isCollapsed ? <ChevronUp className="w-3.5 h-3.5 text-sky-400" /> : <ChevronDown className="w-3.5 h-3.5 text-sky-400" />}
            <span>{isCollapsed ? 'Buka Kontrol' : 'Tutup'}</span>
          </button>
        </div>
      </div>

      {/* Main Unified Bottom Dock */}
      <div 
        className={`pointer-events-auto bg-slate-900/95 border border-slate-700/60 rounded-xl p-3 shadow-2xl backdrop-blur-md transition-all duration-300 ${
          isCollapsed ? 'translate-y-28 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
        }`}
      >
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Active Tool Selector */}
          <div className={`flex items-center gap-1 bg-slate-950/70 p-1 rounded-lg border transition-all shrink-0 ${
            shakeTool ? 'border-rose-500 ring-2 ring-rose-500/40 animate-shake' : 'border-slate-800'
          }`}>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2">Perkakas:</span>
            
            <button
              onClick={() => onSelectTool('hands')}
              className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                selectedTool === 'hands'
                  ? 'bg-sky-500 text-white shadow-sm ring-1 ring-sky-300/40'
                  : expectedTool === 'hands'
                  ? 'text-sky-300 bg-sky-950/50 border border-sky-500/50 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title="Gunakan Tangan untuk mengambil dan memasang komponen"
            >
              <Hand className="w-3.5 h-3.5" />
              <span>Tangan</span>
              {expectedTool === 'hands' && selectedTool !== 'hands' && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping ml-0.5" title="Perkakas dibutuhkan untuk langkah saat ini" />
              )}
            </button>

            <button
              onClick={() => onSelectTool('screwdriver')}
              className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                selectedTool === 'screwdriver'
                  ? 'bg-sky-500 text-white shadow-sm ring-1 ring-sky-300/40'
                  : expectedTool === 'screwdriver'
                  ? 'text-sky-300 bg-sky-950/50 border border-sky-500/50 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title="Obeng Presisi Magnetik untuk mengencangkan baut"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Obeng</span>
              {expectedTool === 'screwdriver' && selectedTool !== 'screwdriver' && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping ml-0.5" title="Perkakas dibutuhkan untuk langkah saat ini" />
              )}
            </button>

            <button
              onClick={() => onSelectTool('thermal_paste')}
              className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                selectedTool === 'thermal_paste'
                  ? 'bg-sky-500 text-white shadow-sm ring-1 ring-sky-300/40'
                  : expectedTool === 'thermal_paste'
                  ? 'text-sky-300 bg-sky-950/50 border border-sky-500/50 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title="Suntikan Pasta Termal (Thermal Grease)"
            >
              <Droplet className="w-3.5 h-3.5" />
              <span>Pasta Termal</span>
              {expectedTool === 'thermal_paste' && selectedTool !== 'thermal_paste' && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping ml-0.5" title="Perkakas dibutuhkan untuk langkah saat ini" />
              )}
            </button>

            <button
              onClick={() => onSelectTool('cable')}
              className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                selectedTool === 'cable'
                  ? 'bg-sky-500 text-white shadow-sm ring-1 ring-sky-300/40'
                  : expectedTool === 'cable'
                  ? 'text-sky-300 bg-sky-950/50 border border-sky-500/50 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title="Pengkabelan Daya (Cabling)"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Kabel</span>
              {expectedTool === 'cable' && selectedTool !== 'cable' && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping ml-0.5" title="Perkakas dibutuhkan untuk langkah saat ini" />
              )}
            </button>
          </div>

          {/* Primary Action & Physical Alignment Controls */}
          <div className="flex-1 flex flex-col items-center justify-center gap-1.5">
            {/* CPU Pin 1 Golden Triangle & Alignment Controls (Phase 1 CPU Steps) */}
            {(currentStep.id === 'step_cpu_install' || currentStep.id === 'step_cpu_lever_lock' || (assemblyState.cpuInstalled && !assemblyState.cpuLeverLocked)) && (
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-950/80 border border-slate-800 rounded-lg text-xs">
                <span className="text-slate-400 font-medium">Orientasi Pin 1 ZIF:</span>
                <span className={`flex items-center gap-1 font-mono font-bold px-2 py-0.5 rounded ${
                  assemblyState.cpuOrientation === 0
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-950/80 text-rose-300 border border-rose-500/40 animate-pulse'
                }`}>
                  {assemblyState.cpuOrientation === 0 ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Cocok (0°) ✓</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3 h-3 text-rose-400" />
                      <span>Terbalik ({assemblyState.cpuOrientation}°) ⚠️</span>
                    </>
                  )}
                </span>
                
                {onRotateCpu && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRotateCpu();
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 bg-sky-900/40 hover:bg-sky-800/60 text-sky-300 hover:text-white rounded border border-sky-600/40 text-[11px] font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
                    title="Putar Orientasi CPU 90 Derajat searah jarum jam agar tanda segitiga emas cocok dengan sudut panah soket"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>Putar CPU (+90°)</span>
                  </button>
                )}
              </div>
            )}

            {/* RAM Dual-Click Seating Feedback Widget (Step RAM) */}
            {currentStep.id === 'step_ram_install' && (
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-950/80 border border-slate-800 rounded-lg text-xs">
                <span className="text-slate-400 font-medium">Uji Klip Pengunci DIMM:</span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                  assemblyState.ramPushStage === 'none'
                    ? 'bg-slate-900 text-slate-400 border-slate-700'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                }`}>
                  Klip Atas: {assemblyState.ramPushStage !== 'none' ? 'Terkunci ✓' : 'Terbuka'}
                </span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                  assemblyState.ramPushStage === 'dual_clicked'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                    : assemblyState.ramPushStage === 'first_click'
                    ? 'bg-amber-950 text-amber-300 border-amber-500/40 animate-pulse'
                    : 'bg-slate-900 text-slate-400 border-slate-700'
                }`}>
                  Klip Bawah: {assemblyState.ramPushStage === 'dual_clicked' ? 'Terkunci ✓' : assemblyState.ramPushStage === 'first_click' ? 'Belum Rata ⚠️' : 'Terbuka'}
                </span>
              </div>
            )}

            {/* Primary Action Button */}
            <button
              onClick={onExecuteAction}
              className={`w-full md:w-auto px-6 py-2.5 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer relative overflow-hidden active:scale-95 ${
                shakeButton ? 'animate-shake ' : ''
              }${
                cooldownRemaining > 0
                  ? 'bg-slate-800/90 text-slate-300 border border-slate-700 shadow-slate-900/40'
                  : isWrongTool
                  ? 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-rose-900/40'
                  : currentStep.id === 'step_cpu_lever_lock' && assemblyState.cpuOrientation !== 0
                  ? 'bg-gradient-to-r from-rose-700 to-rose-900 border border-rose-500/50 text-rose-200'
                  : currentStep.id === 'step_ram_install' && assemblyState.ramPushStage === 'first_click'
                  ? 'bg-gradient-to-r from-amber-600 to-cyan-600 hover:from-amber-500 hover:to-cyan-500 text-white shadow-amber-900/40 ring-2 ring-amber-400/50 animate-pulse'
                  : 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-sky-500/25'
              }`}
            >
              {cooldownRemaining > 0 ? (
                <>
                  <Clock className="w-3.5 h-3.5 animate-spin text-sky-400" />
                  <span className="font-mono text-xs font-semibold">Jeda Transisi: {cooldownRemaining.toFixed(1)}s (Anti-Spam)</span>
                  <div 
                    className="absolute bottom-0 left-0 h-1 bg-sky-400/80 transition-all duration-75"
                    style={{ width: `${Math.min(100, (cooldownRemaining / 0.9) * 100)}%` }}
                  />
                </>
              ) : isWrongTool ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  <span className="text-xs font-semibold">Ganti Perkakas ke: {TOOL_LABELS[expectedTool]}</span>
                </>
              ) : currentStep.id === 'step_cpu_lever_lock' && assemblyState.cpuOrientation !== 0 ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-300 animate-bounce" />
                  <span className="text-xs font-semibold">Tuas Macet! Posisi CPU Terbalik ({assemblyState.cpuOrientation}°) - Putar ke 0°</span>
                </>
              ) : currentStep.id === 'step_ram_install' && assemblyState.ramPushStage === 'first_click' ? (
                <>
                  <span className="font-mono bg-white/20 px-1.5 py-0.5 rounded text-xs font-bold">KLIK 2</span>
                  <span className="font-semibold text-xs">Dorong Ujung Bawah RAM (Dual-Click Mantap!)</span>
                </>
              ) : currentStep.id === 'step_ram_install' && assemblyState.ramPushStage === 'none' ? (
                <>
                  <span className="font-mono bg-white/20 px-1.5 py-0.5 rounded text-xs font-bold">KLIK 1</span>
                  <span className="text-xs">Dorong Ujung Atas RAM (Slot DIMM 2 & 4)</span>
                </>
              ) : (
                <>
                  <span className="font-mono bg-white/20 px-1.5 py-0.5 rounded text-xs font-bold">SPASI / KLIK</span>
                  <span>Lakukan: {currentStep.title}</span>
                </>
              )}
            </button>
          </div>

          {/* Camera Viewpoints & Quick Tools */}
          <div className="flex items-center gap-1.5 justify-end shrink-0">
            {/* Camera Views */}
            <div className="flex items-center bg-slate-950/70 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => onSelectCamera('bench')}
                className={`p-1.5 rounded-md text-xs transition-colors ${
                  activeCameraPreset === 'bench' ? 'bg-slate-700 text-sky-400' : 'text-slate-400 hover:text-white'
                }`}
                title="Kamera Sudut Meja Kerja (Preparasi Mobo)"
              >
                <Cpu className="w-4 h-4" />
              </button>
              <button
                onClick={() => onSelectCamera('case')}
                className={`p-1.5 rounded-md text-xs transition-colors ${
                  activeCameraPreset === 'case' ? 'bg-slate-700 text-sky-400' : 'text-slate-400 hover:text-white'
                }`}
                title="Kamera Sudut Dalam Sasis Casing"
              >
                <Box className="w-4 h-4" />
              </button>
              <button
                onClick={() => onSelectCamera('monitor')}
                className={`p-1.5 rounded-md text-xs transition-colors ${
                  activeCameraPreset === 'monitor' ? 'bg-slate-700 text-sky-400' : 'text-slate-400 hover:text-white'
                }`}
                title="Kamera Layar Monitor Lab / BIOS"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => onSelectCamera('free')}
                className={`p-1.5 rounded-md text-xs transition-colors ${
                  activeCameraPreset === 'free' ? 'bg-slate-700 text-sky-400' : 'text-slate-400 hover:text-white'
                }`}
                title="Kamera Rotasi Bebas 360 Derajat"
              >
                <Layers className="w-4 h-4" />
              </button>
            </div>

            {/* Test Power Button */}
            <button
              onClick={() => onExecuteAction()}
              className={`p-2 rounded-lg border transition-colors flex items-center justify-center ${
                assemblyState.isPowerOn
                  ? 'bg-emerald-600/30 border-emerald-500 text-emerald-400 hover:bg-emerald-600/40'
                  : 'bg-slate-850 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              title="Tekan Tombol Power Casing untuk Uji POST"
            >
              <Power className="w-4 h-4" />
            </button>

            {/* View BIOS / POST Details */}
            {assemblyState.isPowerOn && (
              <button
                onClick={onOpenBIOS}
                className="px-2.5 py-1.5 rounded-lg bg-indigo-600/30 border border-indigo-500 text-indigo-300 hover:bg-indigo-600/50 text-xs font-semibold flex items-center gap-1 transition-colors"
                title="Buka Layar Penuh BIOS UEFI"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>UEFI</span>
              </button>
            )}

            {/* Buka / Tutup Panel Kaca Casing 3D */}
            {onToggleCaseGlass && (
              <button
                onClick={onToggleCaseGlass}
                className={`p-2 rounded-lg border transition-colors flex items-center justify-center cursor-pointer ${
                  assemblyState.caseGlassOpen
                    ? 'bg-amber-600/30 border-amber-500 text-amber-300 hover:bg-amber-600/40'
                    : 'bg-slate-850 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
                title={assemblyState.caseGlassOpen ? 'Tutup Panel Kaca Casing' : 'Buka Panel Kaca Casing'}
              >
                {assemblyState.caseGlassOpen ? (
                  <PanelRightOpen className="w-4 h-4 text-amber-400" />
                ) : (
                  <PanelRightClose className="w-4 h-4" />
                )}
              </button>
            )}

            {/* Rapor Penilaian Siswa */}
            <button
              onClick={onOpenExamReport}
              className="p-2 rounded-lg bg-slate-850 border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              title="Buka Lembar Penilaian & Rapor Praktikum Guru"
            >
              <FileCheck className="w-4 h-4" />
            </button>

            {/* Audio Mute Toggle */}
            <button
              onClick={onToggleMute}
              className="p-2 rounded-lg bg-slate-850 border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              title={isMuted ? 'Aktifkan Suara Mekanik' : 'Bisukan Suara'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Reset Perakitan */}
            <button
              onClick={onReset}
              className="p-2 rounded-lg bg-slate-850 border border-slate-700 text-slate-300 hover:bg-rose-900/40 hover:text-rose-300 hover:border-rose-700/60 transition-colors"
              title="Ulangi Perakitan dari Awal"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
