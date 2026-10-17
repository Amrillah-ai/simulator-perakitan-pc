import React, { useState, useEffect } from 'react';
import { 
  X, 
  Cpu, 
  HardDrive, 
  Activity, 
  Play, 
  Terminal, 
  Check, 
  AlertTriangle,
  RotateCcw,
  Zap,
  Gauge
} from 'lucide-react';
import { AssemblyState, HardwareScenario } from '../types/pc';
import confetti from 'canvas-confetti';

interface POSTScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  assemblyState: AssemblyState;
  scenario: HardwareScenario;
  onFixFault?: (faultField: keyof AssemblyState) => void;
}

export const POSTScreenModal: React.FC<POSTScreenModalProps> = ({
  isOpen,
  onClose,
  assemblyState,
  scenario,
  onFixFault,
}) => {
  const [activeTab, setActiveTab] = useState<'uefi' | 'desktop' | 'troubleshoot'>('uefi');
  const [expoEnabled, setExpoEnabled] = useState(true);
  const [fanProfile, setFanProfile] = useState<'quiet' | 'standard' | 'turbo'>('standard');
  const [isStressTesting, setIsStressTesting] = useState(false);
  const [stressProgress, setStressProgress] = useState(0);
  const [liveTemp, setLiveTemp] = useState(assemblyState.cpuTemperature);

  // Trigger celebration confetti if POST succeeds on modal open
  useEffect(() => {
    if (isOpen && assemblyState.postState === 'post_success') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
  }, [isOpen, assemblyState.postState]);

  // Stress test loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStressTesting) {
      interval = setInterval(() => {
        setStressProgress((prev) => {
          if (prev >= 100) {
            setIsStressTesting(false);
            return 100;
          }
          return prev + 10;
        });

        setLiveTemp((prev) => {
          if (!assemblyState.thermalPasteApplied || !assemblyState.coolerMounted) {
            // Overheating without paste/cooler!
            return Math.min(105, prev + 8);
          }
          return Math.min(68, prev + 2.5);
        });
      }, 400);
    } else {
      // Cooldown
      setLiveTemp(assemblyState.thermalPasteApplied ? 38 : 75);
    }

    return () => clearInterval(interval);
  }, [isStressTesting, assemblyState.thermalPasteApplied, assemblyState.coolerMounted]);

  if (!isOpen) return null;

  const isPostError = assemblyState.postState === 'post_error';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Simulator Monitor Virtual & Uji POST</span>
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                  isPostError ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {isPostError ? 'POST GAGAL' : 'POST SUKSES (BOOTABLE)'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Visualisasi BIOS UEFI, deteksi komponen hardware, dan simulasi pengujian performa OS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switchers */}
            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab('uefi')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  activeTab === 'uefi' ? 'bg-slate-800 text-sky-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                UEFI BIOS
              </button>
              {!isPostError && (
                <button
                  onClick={() => setActiveTab('desktop')}
                  className={`px-3 py-1 rounded-md font-medium transition-colors ${
                    activeTab === 'desktop' ? 'bg-slate-800 text-sky-400' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Desktop OS & Stress Test
                </button>
              )}
              {isPostError && (
                <button
                  onClick={() => setActiveTab('troubleshoot')}
                  className={`px-3 py-1 rounded-md font-medium transition-colors ${
                    activeTab === 'troubleshoot' ? 'bg-rose-950/60 text-rose-300 border border-rose-800/40' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Troubleshooting LED
                </button>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: UEFI BIOS Screen */}
          {activeTab === 'uefi' && (
            <div className="space-y-5">
              {/* Hardware Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* CPU & Memory Card */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider mb-3">
                    <Cpu className="w-4 h-4" />
                    <span>Informasi Prosesor & Memori</span>
                  </div>

                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Model CPU:</span>
                      <span className="text-white font-semibold">{scenario.components.cpu.name.split('(')[0]}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Soket:</span>
                      <span className="text-sky-300">{scenario.components.cpu.socket}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Kapasitas RAM:</span>
                      <span className="text-white font-semibold">16384 MB (16GB)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Saluran Memori:</span>
                      <span className="text-emerald-400 font-bold">Dual-Channel (DIMM 2 & 4 Aktif)</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-400">Profil EXPO / XMP:</span>
                      <button
                        onClick={() => setExpoEnabled(!expoEnabled)}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                          expoEnabled ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {expoEnabled ? '5600 MT/s (Aktif)' : '4800 MT/s (JEDEC)'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Telemetry & Thermals Card */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider mb-3">
                    <Gauge className="w-4 h-4" />
                    <span>Status Termal & Catu Daya</span>
                  </div>

                  <div className="space-y-2.5 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Suhu Inti CPU:</span>
                      <span className={`text-base font-bold ${
                        liveTemp > 80 ? 'text-rose-400' : liveTemp > 60 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {Math.round(liveTemp)}°C
                      </span>
                    </div>

                    {/* Temperature bar */}
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          liveTemp > 80 ? 'bg-rose-500' : liveTemp > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, (liveTemp / 100) * 100)}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      <span className="text-slate-400">Profil Kipas:</span>
                      <div className="flex gap-1">
                        {(['quiet', 'standard', 'turbo'] as const).map((prof) => (
                          <button
                            key={prof}
                            onClick={() => setFanProfile(prof)}
                            className={`px-2 py-0.5 text-[10px] rounded font-semibold uppercase ${
                              fanProfile === prof ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {prof}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between py-1 border-t border-slate-800/60 text-slate-400 text-[11px]">
                      <span>Rel Tegangan:</span>
                      <span>+12V: 12.06V · +5V: 5.01V · +3.3V: 3.32V</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Storage & Expansion Card */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider mb-2">
                  <HardDrive className="w-4 h-4" />
                  <span>Media Penyimpanan & Jalur Ekspansi</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/60">
                    <div className="text-slate-400 text-[11px] mb-1">Slot M.2_1 (Langsung ke CPU):</div>
                    <div className="text-white font-semibold">Kingston KC3000 PCIe 4.0 NVMe 1TB</div>
                    <div className="text-emerald-400 text-[11px] mt-1">Status: Terdeteksi & Siap Booting</div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/60">
                    <div className="text-slate-400 text-[11px] mb-1">Slot PCIe 5.0 x16 Utama:</div>
                    <div className="text-white font-semibold">NVIDIA GeForce RTX 4060 8GB GDDR6</div>
                    <div className="text-emerald-400 text-[11px] mt-1">Link Speed: Gen 4.0 x16 (Full Bandwidth)</div>
                  </div>
                </div>
              </div>

              {/* Error notice if POST failed */}
              {isPostError && (
                <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-rose-200 mb-1">
                      POST Error: {assemblyState.errorMessage}
                    </h4>
                    <p className="leading-relaxed mb-2">
                      {assemblyState.errorSolution}
                    </p>
                    <button
                      onClick={() => setActiveTab('troubleshoot')}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-semibold transition-colors"
                    >
                      Buka Analisis Diagnostic LED & Solusi Cepat
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Desktop OS & Stress Test */}
          {activeTab === 'desktop' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white mb-0.5">
                    PC Master OS Benchmark & Stress Test
                  </h4>
                  <p className="text-xs text-slate-400">
                    Uji ketahanan termal, stabilitas pasta termal, dan performa kartu grafis pada beban kerja penuh (100% Load).
                  </p>
                </div>

                <button
                  onClick={() => {
                    setIsStressTesting(true);
                    setStressProgress(0);
                  }}
                  disabled={isStressTesting}
                  className="px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-md"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isStressTesting ? 'Menguji...' : 'Mulai Stress Test'}</span>
                </button>
              </div>

              {/* Progress and Live Thermals */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                  <div className="text-xs text-slate-400 font-mono mb-1">BEBAN KERJA CPU</div>
                  <div className="text-3xl font-extrabold text-white font-mono">
                    {isStressTesting ? '100%' : '3%'}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Multi-core AVX2 Stress</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                  <div className="text-xs text-slate-400 font-mono mb-1">SUHU REAL-TIME</div>
                  <div className={`text-3xl font-extrabold font-mono ${
                    liveTemp > 80 ? 'text-rose-400' : liveTemp > 60 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {Math.round(liveTemp)}°C
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {liveTemp > 90 ? 'THERMAL THROTTLING DETECTED' : 'Kondisi Termal Stabil & Dingin'}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                  <div className="text-xs text-slate-400 font-mono mb-1">ESTIMASI GAMING FPS</div>
                  <div className="text-3xl font-extrabold text-sky-400 font-mono">
                    {liveTemp > 95 ? '24 FPS' : '165 FPS'}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Ultra 1080p Ray Tracing</div>
                </div>
              </div>

              {/* Progress bar */}
              {isStressTesting && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-400 font-mono">
                    <span>Kemajuan Uji Beban:</span>
                    <span>{stressProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-sky-500 h-full transition-all duration-300"
                      style={{ width: `${stressProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Troubleshooting Diagnostic Matrix */}
          {activeTab === 'troubleshoot' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-3">
                  Peta Diagnosis Motherboard EZ-Debug LED
                </h4>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                  <div className={`p-3 rounded-xl border ${
                    assemblyState.debugLeds.cpu
                      ? 'bg-rose-950/40 border-rose-600 text-rose-300 ring-2 ring-rose-500/30'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400'
                  }`}>
                    <div className="w-3 h-3 rounded-full mx-auto mb-2 bg-rose-500 shadow-sm shadow-rose-500" />
                    <div className="font-bold font-mono text-sm">CPU LED</div>
                    <div className="text-[11px] mt-1">{assemblyState.debugLeds.cpu ? 'BERMASALAH' : 'NORMAL'}</div>
                  </div>

                  <div className={`p-3 rounded-xl border ${
                    assemblyState.debugLeds.dram
                      ? 'bg-amber-950/40 border-amber-600 text-amber-300 ring-2 ring-amber-500/30'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400'
                  }`}>
                    <div className="w-3 h-3 rounded-full mx-auto mb-2 bg-amber-500 shadow-sm shadow-amber-500" />
                    <div className="font-bold font-mono text-sm">DRAM LED</div>
                    <div className="text-[11px] mt-1">{assemblyState.debugLeds.dram ? 'BERMASALAH' : 'NORMAL'}</div>
                  </div>

                  <div className={`p-3 rounded-xl border ${
                    assemblyState.debugLeds.vga
                      ? 'bg-slate-800 border-white text-white ring-2 ring-white/30'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400'
                  }`}>
                    <div className="w-3 h-3 rounded-full mx-auto mb-2 bg-white shadow-sm shadow-white" />
                    <div className="font-bold font-mono text-sm">VGA LED</div>
                    <div className="text-[11px] mt-1">{assemblyState.debugLeds.vga ? 'BERMASALAH' : 'NORMAL'}</div>
                  </div>

                  <div className={`p-3 rounded-xl border ${
                    assemblyState.debugLeds.boot
                      ? 'bg-emerald-950/40 border-emerald-600 text-emerald-300 ring-2 ring-emerald-500/30'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400'
                  }`}>
                    <div className="w-3 h-3 rounded-full mx-auto mb-2 bg-emerald-500 shadow-sm shadow-emerald-500" />
                    <div className="font-bold font-mono text-sm">BOOT LED</div>
                    <div className="text-[11px] mt-1">{assemblyState.debugLeds.boot ? 'BERMASALAH' : 'NORMAL'}</div>
                  </div>
                </div>
              </div>

              {/* Direct Fix Tool for Lab Students */}
              {onFixFault && (
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-white mb-0.5">Tindakan Cepat Perbaikan (Quick Repair)</h5>
                    <p className="text-xs text-slate-400">
                      Otomatis kencangkan kembali kabel atau pasang komponen yang terlewat untuk mencoba booting ulang.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (!assemblyState.standoffsInstalled) onFixFault('standoffsInstalled');
                      if (!assemblyState.cableCpu8PinConnected) onFixFault('cableCpu8PinConnected');
                      if (!assemblyState.ramSlot2Installed || assemblyState.ramPartiallySeated) onFixFault('ramSlot2Installed');
                      if (!assemblyState.cableGpuPcieConnected) onFixFault('cableGpuPcieConnected');
                      if (!assemblyState.thermalPasteApplied) onFixFault('thermalPasteApplied');
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>Perbaiki Kesalahan Sekarang</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900/90 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            Laboratorium Perakitan Komputer SMK / Vokasi TKJ & Rekayasa Perangkat Lunak
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Tutup Monitor
          </button>
        </div>
      </div>
    </div>
  );
};
