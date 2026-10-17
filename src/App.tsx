import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Viewport3D } from './components/Viewport3D';
import { ControlOverlay } from './components/ControlOverlay';
import { SOPGuidance } from './components/SOPGuidance';
import { POSTScreenModal } from './components/POSTScreenModal';
import { ExamReportModal } from './components/ExamReportModal';
import { HardwareInspectorModal } from './components/HardwareInspectorModal';
import { ScenarioPickerModal } from './components/ScenarioPickerModal';
import { ASSEMBLY_STEPS, HARDWARE_SCENARIOS, TROUBLESHOOT_PRESETS } from './data/hardwareData';
import { AssemblyState, HardwareScenario } from './types/pc';
import { sound } from './utils/audio';
import { Play, Sparkles, BookOpen, Wrench, ShieldAlert, AlertCircle, Crosshair } from 'lucide-react';

const INITIAL_ASSEMBLY_STATE: AssemblyState = {
  currentPhase: 1,
  currentStepIndex: 0,
  mode: 'tutorial',
  selectedScenarioId: 'scenario_esports',

  // Phase 1
  cpuInstalled: false,
  cpuLeverOpen: false,
  cpuLeverLocked: false,
  cpuOrientation: 180, // Default 180° (Misaligned initially to require physical alignment test)
  thermalPasteApplied: false,
  coolerMounted: false,
  coolerScrewsTightened: false,
  ramSlot2Installed: false,
  ramSlot4Installed: false,
  ramPushStage: 'none',
  ramPartiallySeated: false,

  // Phase 2
  caseGlassOpen: false,
  ioShieldInstalled: false,
  standoffsInstalled: false,
  moboPlacedInCase: false,
  moboScrewsTightened: false,

  // Phase 3
  psuMounted: false,
  psuScrewsTightened: false,
  m2SsdInstalled: false,
  m2ScrewTightened: false,

  // Phase 4
  pciBracketRemoved: false,
  gpuInstalled: false,
  gpuScrewTightened: false,
  cableMobo24PinConnected: false,
  cableCpu8PinConnected: false,
  cableGpuPcieConnected: false,
  cableFrontPanelConnected: false,
  caseGlassClosed: false,

  // Power & POST
  isPowerOn: false,
  powerButtonPressed: false,
  postState: 'off',
  debugLeds: {
    cpu: false,
    dram: false,
    vga: false,
    boot: false,
  },
  beepCode: 'none',
  cpuTemperature: 28,

  // Scoring
  startTime: Date.now(),
  elapsedSeconds: 0,
  sopMistakes: [],
  correctActionsCount: 0,
  studentName: 'Ahmad Fauzan',
  studentClass: 'XI TKJ 1 (Teknik Komputer & Jaringan)',
};

export default function App() {
  const [inTitleScreen, setInTitleScreen] = useState(true);
  const [assemblyState, setAssemblyState] = useState<AssemblyState>(INITIAL_ASSEMBLY_STATE);
  const [selectedScenario, setSelectedScenario] = useState<HardwareScenario>(HARDWARE_SCENARIOS[0]);
  const [activeCameraPreset, setActiveCameraPreset] = useState<'bench' | 'case' | 'monitor' | 'free'>('bench');
  const [cursorMode, setCursorMode] = useState<'orbit' | 'pan'>('orbit');
  const [selectedTool, setSelectedTool] = useState<'hands' | 'thermal_paste' | 'screwdriver' | 'cable'>('hands');
  const [isMuted, setIsMuted] = useState(false);
  const controlsAPIRef = useRef<{
    pan: (x: number, y: number) => void;
    zoom: (delta: number) => void;
    reset: () => void;
  } | null>(null);

  // Action Cooldown & Anti-Spam (0.8s - 1.0s: set to 900ms)
  const cooldownRef = useRef<number>(0);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const [alertMessage, setAlertMessage] = useState<{
    type: 'spam' | 'wrong_tool' | 'target_miss';
    text: string;
    id: number;
  } | null>(null);
  const [shakeTool, setShakeTool] = useState(false);
  const [shakeButton, setShakeButton] = useState(false);

  // Smooth cooldown ticker for UI indicator
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      if (cooldownRef.current > now) {
        setCooldownRemaining(Math.max(0, Math.ceil((cooldownRef.current - now) / 100) / 10));
      } else {
        setCooldownRemaining(0);
      }
    }, 40);
    return () => clearInterval(interval);
  }, []);

  // Auto-dismiss alert notification toast
  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => {
        setAlertMessage(null);
      }, 3200);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  // Threshold-based click detection for 3D interaction (5px / 200ms)
  const mouseDownRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const handle3DMouseDown = (e: React.MouseEvent | React.PointerEvent) => {
    mouseDownRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: performance.now(),
    };
  };

  // Modals
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isHardwareModalOpen, setIsHardwareModalOpen] = useState(false);
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);

  const currentStep = ASSEMBLY_STEPS[assemblyState.currentStepIndex] || ASSEMBLY_STEPS[ASSEMBLY_STEPS.length - 1];

  // Timer loop for Exam & Practice mode
  useEffect(() => {
    if (inTitleScreen) return;
    const timer = setInterval(() => {
      setAssemblyState((prev) => ({
        ...prev,
        elapsedSeconds: prev.elapsedSeconds + 1,
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, [inTitleScreen]);

  // Trigger Power Button and POST Simulation
  const triggerPowerOn = useCallback(() => {
    const now = Date.now();
    // Anti-spam cooldown check on power button
    if (now < cooldownRef.current) {
      sound.playErrorBuzzer();
      const remainSec = ((cooldownRef.current - now) / 1000).toFixed(1);
      setAlertMessage({
        type: 'spam',
        text: `Jeda Transisi Aksi: Jangan mengetuk beruntun! Tunggu ${remainSec}s.`,
        id: now,
      });
      setShakeButton(true);
      setTimeout(() => setShakeButton(false), 350);
      return;
    }

    cooldownRef.current = now + 900;
    setCooldownRemaining(0.9);
    sound.playPowerClick();

    setAssemblyState((prev) => {
      const isCurrentlyOn = prev.isPowerOn;
      if (isCurrentlyOn) {
        // Power off
        sound.stopFanHum();
        return {
          ...prev,
          isPowerOn: false,
          postState: 'off',
          debugLeds: { cpu: false, dram: false, vga: false, boot: false },
          cpuTemperature: 28,
        };
      }

      // Turn on fans sound
      sound.startFanHum();

      // Check for faults
      const hasCpuPower = prev.cableCpu8PinConnected;
      const hasRam = prev.ramSlot2Installed;
      const hasPaste = prev.thermalPasteApplied;
      const hasGpuPower = prev.cableGpuPcieConnected;
      const hasStandoffs = prev.standoffsInstalled;

      let postState: AssemblyState['postState'] = 'powering_up';
      let debugLeds = { cpu: false, dram: false, vga: false, boot: false };
      let beep: AssemblyState['beepCode'] = 'none';
      let errorMsg = '';
      let errorSol = '';

      if (!hasStandoffs) {
        postState = 'post_error';
        debugLeds.cpu = true;
        beep = 'cpu_fault';
        errorMsg = 'Korsleting Motherboard! Baut standoff kuningan tidak dipasang sebelum mobo.';
        errorSol = 'Bongkar kembali motherboard dan pasang standoff spacer terlebih dahulu.';
      } else if (!hasCpuPower) {
        postState = 'post_error';
        debugLeds.cpu = true;
        beep = 'cpu_fault';
        errorMsg = 'CPU Debug LED Merah: Kabel daya CPU 8-pin (EPS) belum terhubung!';
        errorSol = 'Colokkan kabel CPU 8-pin dari power supply ke sudut kiri atas motherboard.';
      } else if (!hasRam || prev.ramPartiallySeated) {
        postState = 'post_error';
        debugLeds.dram = true;
        beep = 'ram_fault';
        if (prev.ramPartiallySeated) {
          errorMsg = 'DRAM Debug LED Kuning: Modul RAM menancap sebelah! Klip pengunci slot DIMM 2 & 4 belum terdorong ganda (dual-click) hingga rata.';
          errorSol = 'Buka tuas slot, sejajarkan lekukan notch, lalu tekan kedua ujung RAM berbarengan hingga terdengar klik ganda pengunci.';
        } else {
          errorMsg = 'DRAM Debug LED Kuning: Modul memori RAM belum terpasang atau longgar!';
          errorSol = 'Tekan modul RAM ke slot DIMM 2 & 4 hingga kedua klip mengunci mantap.';
        }
      } else if (!hasGpuPower) {
        postState = 'post_error';
        debugLeds.vga = true;
        beep = 'gpu_fault';
        errorMsg = 'VGA Debug LED Putih: Kabel daya PCIe GPU belum terpasang!';
        errorSol = 'Hubungkan kabel PCIe 8-pin dari PSU langsung ke soket daya kartu grafis.';
      } else {
        postState = 'post_success';
        beep = 'success_short';
        debugLeds.boot = true;
      }

      // Play Beep after 600ms
      setTimeout(() => {
        if (beep === 'success_short') {
          sound.playPostBeep('success');
        } else if (beep === 'cpu_fault') {
          sound.playPostBeep('cpu');
        } else if (beep === 'ram_fault') {
          sound.playPostBeep('ram');
        } else if (beep === 'gpu_fault') {
          sound.playPostBeep('vga');
        }
      }, 700);

      // Open BIOS modal automatically after 1.8s
      setTimeout(() => {
        setIsPostModalOpen(true);
      }, 1800);

      return {
        ...prev,
        isPowerOn: true,
        postState,
        debugLeds,
        beepCode: beep,
        errorMessage: errorMsg,
        errorSolution: errorSol,
        cpuTemperature: hasPaste ? 38 : 95,
      };
    });
  }, []);

  // Execute assembly action (Next SOP step or interactive tool action)
  const executeNextAction = useCallback(() => {
    const now = Date.now();

    // 1. Anti-Spam & Action Cooldown Check (0.8s - 1.0s, set to 900ms)
    if (now < cooldownRef.current) {
      sound.playErrorBuzzer();
      const remainSec = ((cooldownRef.current - now) / 1000).toFixed(1);
      setAlertMessage({
        type: 'spam',
        text: `Jeda Transisi Aksi: Jangan mengetuk membabi buta! Berikan jeda ${remainSec}s agar komponen terpasang presisi.`,
        id: now,
      });
      setShakeButton(true);
      setTimeout(() => setShakeButton(false), 350);
      return;
    }

    const curStep = ASSEMBLY_STEPS[assemblyState.currentStepIndex] || ASSEMBLY_STEPS[ASSEMBLY_STEPS.length - 1];
    const expectedTool = curStep.toolRequired || 'hands';

    // 2. Active Tool Validation Check
    if (selectedTool !== expectedTool) {
      sound.playErrorBuzzer();

      const toolNames: Record<'hands' | 'thermal_paste' | 'screwdriver' | 'cable', string> = {
        hands: 'Tangan',
        screwdriver: 'Obeng',
        thermal_paste: 'Pasta Termal',
        cable: 'Kabel',
      };
      const curToolName = toolNames[selectedTool] || selectedTool;
      const expToolName = toolNames[expectedTool] || expectedTool;

      const mistakeLog = `[Langkah ${curStep.stepNumber}: ${curStep.title}] Menggunakan perkakas "${curToolName}", seharusnya "${expToolName}".`;

      setAssemblyState((prev) => ({
        ...prev,
        sopMistakes: [...prev.sopMistakes, mistakeLog],
      }));

      setAlertMessage({
        type: 'wrong_tool',
        text: `Perkakas Tidak Sesuai! Anda memilih "${curToolName}", tetapi langkah "${curStep.title}" memerlukan "${expToolName}". Silakan pilih perkakas yang tepat di Bottom Dock. Skor kedisiplinan berkurang!`,
        id: now,
      });

      setShakeTool(true);
      setShakeButton(true);
      setTimeout(() => {
        setShakeTool(false);
        setShakeButton(false);
      }, 450);
      return;
    }

    // 3. Action Validated -> Apply Cooldown of 900ms
    cooldownRef.current = now + 900;
    setCooldownRemaining(0.9);
    setAlertMessage(null);

    sound.playClick();

    setAssemblyState((prev) => {
      const stepIdx = prev.currentStepIndex;
      const nextIdx = Math.min(ASSEMBLY_STEPS.length - 1, stepIdx + 1);
      const nextStep = ASSEMBLY_STEPS[nextIdx];

      // Deep copy
      const next = { ...prev, currentStepIndex: nextIdx, currentPhase: nextStep.phase };

      // Step-by-step logic
      switch (stepIdx) {
        case 0: // Buka Tuas Soket CPU
          sound.playLeverLatch();
          next.cpuLeverOpen = true;
          break;
        case 1: // Pasang CPU (Orientasi Pin 1)
          sound.playSnap();
          next.cpuInstalled = true;
          if (prev.cpuOrientation !== 0) {
            setAlertMessage({
              type: 'wrong_tool',
              text: `CPU diletakkan di soket ZIF, namun sudut segitiga emas (Pin 1) terbalik (${prev.cpuOrientation}°)! Putar CPU ke 0° agar sejajar dengan tanda panah soket sebelum tuas dapat dikunci.`,
              id: now,
            });
          } else {
            setAlertMessage({
              type: 'spam',
              text: 'Orientasi Pin 1 CPU Sejajar Sempurna (0°) ✓! Siap mengunci tuas pengait soket.',
              id: now,
            });
          }
          break;
        case 2: // Kunci Tuas Pengait (Precision & Orientation Lock)
          // Jika posisi terbalik, tuas pengait (retention lever) tidak bisa dikunci!
          if (prev.cpuOrientation !== 0) {
            sound.playMechanicalJam();
            sound.playErrorBuzzer();
            const mistake = `[Langkah 3: Kunci Tuas Pengait] Orientasi CPU terbalik (${prev.cpuOrientation}°)! Tanda segitiga emas tidak cocok dengan tanda panah soket ZIF. Memaksa tuas dapat membengkokkan pin soket LGA/AM!`;
            setAlertMessage({
              type: 'wrong_tool',
              text: `Tuas Pengait Macet! Posisi CPU terbalik (${prev.cpuOrientation}°). Sudut tanda segitiga emas pada prosesor wajib cocok dengan tanda panah di soket LGA/AM motherboard. Putar CPU ke orientasi 0°!`,
              id: now,
            });
            setShakeButton(true);
            setTimeout(() => setShakeButton(false), 450);
            return {
              ...prev,
              sopMistakes: [...prev.sopMistakes, mistake],
            };
          }
          sound.playLeverLatch();
          next.cpuLeverOpen = false;
          next.cpuLeverLocked = true;
          break;
        case 3: // Oleskan Pasta Termal
          sound.playPasteSquish();
          next.thermalPasteApplied = true;
          break;
        case 4: // Pasang Cooler
          sound.playSnap();
          next.coolerMounted = true;
          break;
        case 5: // Kencangkan Baut Cooler
          sound.playScrewdriverRatchet();
          next.coolerScrewsTightened = true;
          break;
        case 6: // Pasang RAM 1 & 2 (Uji Dorong Klip Ganda / Dual-Click)
          if (prev.ramPushStage === 'none') {
            // First push: Klip Atas Mengunci -> RAM Menancap Sebelah
            sound.playRamClickFirst();
            next.ramSlot2Installed = true;
            next.ramSlot4Installed = true;
            next.ramPushStage = 'first_click';
            next.ramPartiallySeated = true;
            next.currentStepIndex = stepIdx; // Tetap di langkah 6 untuk dorongan kedua
            setAlertMessage({
              type: 'wrong_tool',
              text: 'Uji Dorong RAM (Klik 1): Klip atas terkunci, namun RAM MASIH MENANCAP SEBELAH! Tekan ujung bawah hingga berbunyi KLIK KEDUA (Dual-Click) agar komputer tidak gagal booting!',
              id: now,
            });
            setShakeButton(true);
            setTimeout(() => setShakeButton(false), 350);
          } else if (prev.ramPushStage === 'first_click') {
            // Second push: Klip Bawah Mengunci -> Dual Click Selesai!
            sound.playRamClickSecond();
            next.ramPushStage = 'dual_clicked';
            next.ramPartiallySeated = false;
            next.currentStepIndex = nextIdx;
            setAlertMessage({
              type: 'spam',
              text: 'Klik Ganda (Dual-Click) Berhasil! Kedua klip slot DIMM 2 & 4 otomatis terdorong dan mengunci mantap.',
              id: now,
            });
            // Change camera to chassis for Phase 2
            setActiveCameraPreset('case');
          }
          break;
        case 7: // Buka Tempered Glass
          sound.playClick();
          next.caseGlassOpen = true;
          break;
        case 8: // Pasang I/O Shield
          sound.playSnap();
          next.ioShieldInstalled = true;
          break;
        case 9: // Pasang Standoffs
          sound.playScrewdriverRatchet();
          next.standoffsInstalled = true;
          break;
        case 10: // Pasang Motherboard ke Casing
          sound.playSnap();
          next.moboPlacedInCase = true;
          break;
        case 11: // Kencangkan Baut Motherboard
          sound.playScrewdriverRatchet();
          next.moboScrewsTightened = true;
          break;
        case 12: // Pasang PSU
          sound.playSnap();
          next.psuMounted = true;
          break;
        case 13: // Kencangkan Baut PSU
          sound.playScrewdriverRatchet();
          next.psuScrewsTightened = true;
          break;
        case 14: // Pasang SSD M.2
          sound.playSnap();
          next.m2SsdInstalled = true;
          break;
        case 15: // Kencangkan Baut SSD M.2
          sound.playScrewdriverRatchet();
          next.m2ScrewTightened = true;
          break;
        case 16: // Lepas PCIe Bracket
          sound.playScrewdriverRatchet();
          next.pciBracketRemoved = true;
          break;
        case 17: // Pasang GPU
          sound.playSnap();
          next.gpuInstalled = true;
          break;
        case 18: // Kencangkan Baut GPU
          sound.playScrewdriverRatchet();
          next.gpuScrewTightened = true;
          break;
        case 19: // Colok 24-Pin
          sound.playSnap();
          next.cableMobo24PinConnected = true;
          break;
        case 20: // Colok CPU 8-Pin
          sound.playSnap();
          next.cableCpu8PinConnected = true;
          break;
        case 21: // Colok GPU PCIe
          sound.playSnap();
          next.cableGpuPcieConnected = true;
          break;
        case 22: // Colok Front Panel
          sound.playSnap();
          next.cableFrontPanelConnected = true;
          break;
        case 23: // Tutup Kaca Casing
          sound.playClick();
          next.caseGlassOpen = false;
          next.caseGlassClosed = true;
          setActiveCameraPreset('monitor');
          break;
        case 24: // Tekan Tombol Power & POST Test
          triggerPowerOn();
          break;
      }

      return next;
    });
  }, [assemblyState.currentStepIndex, selectedTool, triggerPowerOn]);

  // Rotate CPU Orientation (Pin 1 Golden Triangle Alignment)
  const handleRotateCpu = useCallback(() => {
    sound.playClick();
    setAssemblyState((prev) => {
      const nextDeg = ((prev.cpuOrientation + 90) % 360) as 0 | 90 | 180 | 270;
      if (nextDeg === 0) {
        sound.playSnap();
        setAlertMessage({
          type: 'spam',
          text: 'Orientasi Pin 1 Sempurna ✓! Sudut segitiga emas pada prosesor telah sejajar tepat dengan tanda panah soket LGA/AM (0°).',
          id: Date.now(),
        });
      } else {
        setAlertMessage({
          type: 'wrong_tool',
          text: `Orientasi CPU ${nextDeg}°: Tanda segitiga emas belum cocok dengan tanda panah soket (Wajib 0°). Putar CPU hingga sejajar!`,
          id: Date.now(),
        });
      }
      return {
        ...prev,
        cpuOrientation: nextDeg,
      };
    });
  }, []);

  // Handle target miss from 3D Precision Bounding Box & Pulsing Marker
  const handleTargetMiss = useCallback(
    (info: { stepTitle: string; targetName: string; distancePixels: number; clientX: number; clientY: number }) => {
      sound.playTargetMiss();
      setShakeButton(true);
      setTimeout(() => setShakeButton(false), 350);

      const curStep = ASSEMBLY_STEPS[assemblyState.currentStepIndex] || ASSEMBLY_STEPS[0];
      const mistakeLog = `[Langkah ${curStep.stepNumber}: ${curStep.title}] Salah sasaran! Klik melenceng di luar area penanda presisi "${info.targetName}" (${info.distancePixels}px).`;

      setAssemblyState((prev) => ({
        ...prev,
        sopMistakes: prev.mode === 'exam' ? [...prev.sopMistakes, mistakeLog] : prev.sopMistakes,
      }));

      setAlertMessage({
        type: 'target_miss',
        text: `Salah Sasaran (${info.distancePixels}px melenceng)! Klik jatuh di luar area target. Arahkan kursor tepat ke titik penanda berkedip (pulsing marker) pada "${info.targetName}" untuk memasangnya secara presisi!`,
        id: Date.now(),
      });
    },
    [assemblyState.currentStepIndex]
  );

  // Quick fix for troubleshoot mode
  const handleFixFault = (field: keyof AssemblyState) => {
    sound.playSnap();
    setAssemblyState((prev) => {
      const updated: AssemblyState = { ...prev, [field]: true };
      if (field === 'ramSlot2Installed' || field === 'ramSlot4Installed') {
        updated.ramSlot2Installed = true;
        updated.ramSlot4Installed = true;
        updated.ramPartiallySeated = false;
        updated.ramPushStage = 'dual_clicked';
      }
      return updated;
    });
    setTimeout(() => {
      triggerPowerOn();
    }, 400);
  };

  // Reset Assembly to beginning
  const handleReset = () => {
    sound.stopFanHum();
    sound.playClick();
    setAssemblyState({
      ...INITIAL_ASSEMBLY_STATE,
      startTime: Date.now(),
      selectedScenarioId: selectedScenario.id,
      mode: assemblyState.mode,
    });
    setActiveCameraPreset('bench');
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (inTitleScreen) {
        if (e.code === 'Space' || e.code === 'Enter') {
          setInTitleScreen(false);
          sound.playClick();
        }
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        executeNextAction();
      } else if (e.key === '1') {
        setActiveCameraPreset('bench');
      } else if (e.key === '2') {
        setActiveCameraPreset('case');
      } else if (e.key === '3') {
        setActiveCameraPreset('monitor');
      } else if (e.key === '4') {
        setActiveCameraPreset('free');
      } else if (e.key.toLowerCase() === 'g' || e.key.toLowerCase() === 'p') {
        setCursorMode((prev) => (prev === 'orbit' ? 'pan' : 'orbit'));
      } else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        controlsAPIRef.current?.pan(-0.2, 0);
      } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        controlsAPIRef.current?.pan(0.2, 0);
      } else if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') {
        controlsAPIRef.current?.pan(0, 0.15);
      } else if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') {
        controlsAPIRef.current?.pan(0, -0.15);
      } else if (e.key === '+' || e.key === '=') {
        controlsAPIRef.current?.zoom(1);
      } else if (e.key === '-' || e.key === '_') {
        controlsAPIRef.current?.zoom(-1);
      } else if (e.key.toLowerCase() === 'm') {
        const nextMute = !isMuted;
        setIsMuted(nextMute);
        sound.setMuted(nextMute);
      } else if (e.key === 'Escape') {
        setIsScenarioModalOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inTitleScreen, executeNextAction, isMuted]);

  // Start a specific troubleshooting preset
  const handleStartTroubleshootPreset = (presetId: string) => {
    const preset = TROUBLESHOOT_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    sound.stopFanHum();
    setAssemblyState({
      ...INITIAL_ASSEMBLY_STATE,
      // All items installed EXCEPT the fault!
      cpuInstalled: true,
      cpuLeverLocked: true,
      cpuOrientation: 0,
      thermalPasteApplied: true,
      coolerMounted: true,
      coolerScrewsTightened: true,
      ramSlot2Installed: true,
      ramSlot4Installed: true,
      ramPushStage: 'dual_clicked',
      ramPartiallySeated: false,
      caseGlassOpen: false,
      ioShieldInstalled: true,
      standoffsInstalled: true,
      moboPlacedInCase: true,
      moboScrewsTightened: true,
      psuMounted: true,
      psuScrewsTightened: true,
      m2SsdInstalled: true,
      m2ScrewTightened: true,
      pciBracketRemoved: true,
      gpuInstalled: true,
      gpuScrewTightened: true,
      cableMobo24PinConnected: true,
      cableCpu8PinConnected: true,
      cableGpuPcieConnected: true,
      cableFrontPanelConnected: true,
      caseGlassClosed: true,
      currentStepIndex: ASSEMBLY_STEPS.length - 1,
      currentPhase: 4,
      mode: 'troubleshoot',
      // Inject fault
      ...preset.faultConfig,
    });

    setActiveCameraPreset('monitor');
    setTimeout(() => {
      triggerPowerOn();
    }, 600);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none">
      {/* 3D Viewport Layer with Threshold-Based Click Detection */}
      <div 
        className="absolute inset-0"
        onPointerDown={handle3DMouseDown}
      >
        <Viewport3D
          assemblyState={assemblyState}
          activeCameraPreset={activeCameraPreset}
          cursorMode={cursorMode}
          onControlsReady={(api) => {
            controlsAPIRef.current = api;
          }}
          onTargetMiss={handleTargetMiss}
          onObjectClick={(key, event) => {
            // Compare mouse down timestamp & coordinates with mouse up event
            if (mouseDownRef.current) {
              const startX = mouseDownRef.current.x;
              const startY = mouseDownRef.current.y;
              const startTime = mouseDownRef.current.time;
              mouseDownRef.current = null;

              const endX = event ? event.clientX : startX;
              const endY = event ? event.clientY : startY;
              const endTime = performance.now();

              const movementDelta = Math.hypot(endX - startX, endY - startY);
              const timeDuration = endTime - startTime;

              // If movement delta exceeds 5 pixels or duration exceeds 200ms,
              // treat as a camera drag instead of executeNextAction trigger
              if (movementDelta > 5 || timeDuration > 200) {
                return;
              }
            }

            if (key === 'target_miss') {
              // Miss handled via onTargetMiss
              return;
            }

            if (key === 'power_button') {
              triggerPowerOn();
            } else {
              executeNextAction();
            }
          }}
        />
      </div>

      {/* TITLE SCREEN / HERO LAUNCHER */}
      {inTitleScreen && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-between p-8 bg-slate-950/85 backdrop-blur-md text-white">
          <div className="w-full flex justify-between items-center max-w-5xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-sky-500/30">
                PC
              </div>
              <span className="font-bold tracking-tight text-lg text-slate-200">
                LAB VOKASI TEKNIK KOMPUTER
              </span>
            </div>
            <div className="text-xs font-mono text-slate-400">
              STANDAR SKKNI & SOP INDUSTRI PERAKITAN
            </div>
          </div>

          {/* Centerpiece Title Lockup */}
          <div className="max-w-2xl text-center space-y-5 my-auto">
            {/* Inline SVG Title Lockup */}
            <div className="flex justify-center mb-2">
              <svg className="w-20 h-20 text-sky-400 drop-shadow-[0_0_25px_rgba(56,189,248,0.4)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <rect x="9" y="9" width="6" height="6" />
                <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
              </svg>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              PC Master Sim 3D
            </h1>

            <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-xl mx-auto">
              Media pembelajaran interaktif gamifikasi perakitan komputer mandiri: pahami struktur hardware, aturan kompatibilitas, SOP 4 fase industri, dan uji nyala POST tanpa risiko kerusakan fisik di laboratorium.
            </p>

            {/* Mode selection cards on title screen */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 text-left">
              <div 
                onClick={() => {
                  setAssemblyState((prev) => ({ ...prev, mode: 'tutorial' }));
                  setInTitleScreen(false);
                }}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-sky-500 hover:bg-slate-900 transition-all cursor-pointer group"
              >
                <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 w-fit mb-2 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="font-bold text-sm text-white mb-1">Mode Terpandu</div>
                <div className="text-[11px] text-slate-400">Belajar mandiri dengan petunjuk SOP dan animasi perakitan.</div>
              </div>

              <div 
                onClick={() => {
                  setAssemblyState((prev) => ({ ...prev, mode: 'exam' }));
                  setInTitleScreen(false);
                }}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500 hover:bg-slate-900 transition-all cursor-pointer group"
              >
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 w-fit mb-2 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="font-bold text-sm text-white mb-1">Ujian Praktikum</div>
                <div className="text-[11px] text-slate-400">Ujian tanpa petunjuk, timer aktif, dan cetak rapor evaluasi guru.</div>
              </div>

              <div 
                onClick={() => {
                  handleStartTroubleshootPreset('fault_cpu_power_missing');
                  setInTitleScreen(false);
                }}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-rose-500 hover:bg-slate-900 transition-all cursor-pointer group"
              >
                <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 w-fit mb-2 group-hover:scale-110 transition-transform">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div className="font-bold text-sm text-white mb-1">Troubleshooting</div>
                <div className="text-[11px] text-slate-400">Analisis PC rusak dengan EZ-Debug LED dan kode beep.</div>
              </div>
            </div>

            {/* Start Button */}
            <div className="pt-3">
              <button
                onClick={() => setInTitleScreen(false)}
                className="px-8 py-3.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 active:scale-95 text-white font-bold text-sm rounded-xl shadow-xl shadow-sky-500/30 inline-flex items-center gap-2 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Mulai Simulasi Perakitan</span>
              </button>
            </div>
          </div>

          {/* Control Hint Line */}
          <div className="text-xs text-slate-400 font-mono tracking-wide">
            KONTROL: Drag Mouse untuk Orbit 3D · Spasi / Klik Pasang Komponen · 1-4 Kamera · Esc Menu
          </div>
        </div>
      )}

      {/* IN-GAME HUD & OVERLAYS */}
      {!inTitleScreen && (
        <>
          {/* Top Bar & SOP Guidance */}
          <SOPGuidance
            assemblyState={assemblyState}
            currentStep={currentStep}
            totalSteps={ASSEMBLY_STEPS.length}
            onSelectPhase={(phase) => {
              const targetStep = ASSEMBLY_STEPS.find((s) => s.phase === phase);
              if (targetStep) {
                const idx = ASSEMBLY_STEPS.indexOf(targetStep);
                setAssemblyState((prev) => ({
                  ...prev,
                  currentStepIndex: idx,
                  currentPhase: phase,
                }));
                if (phase === 1) setActiveCameraPreset('bench');
                else if (phase >= 2) setActiveCameraPreset('case');
              }
            }}
            onOpenScenarioModal={() => setIsScenarioModalOpen(true)}
            onOpenTroubleshootModal={() => {
              setAssemblyState((prev) => ({ ...prev, mode: 'troubleshoot' }));
              setIsScenarioModalOpen(true);
            }}
            onOpenHardwareSpecs={() => setIsHardwareModalOpen(true)}
          />

          {/* Anti-Spam, Wrong Tool & Target Miss Floating Alert Toast */}
          {alertMessage && (
            <div 
              key={alertMessage.id}
              className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-40 max-w-lg w-[92%] md:w-auto px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md flex items-center gap-3 transition-all animate-shake ${
                alertMessage.type === 'wrong_tool'
                  ? 'bg-rose-950/95 border-rose-500/80 text-rose-200 ring-2 ring-rose-500/30'
                  : alertMessage.type === 'target_miss'
                  ? 'bg-red-950/95 border-red-500/80 text-red-200 ring-2 ring-red-500/40'
                  : 'bg-amber-950/95 border-amber-500/80 text-amber-200 ring-2 ring-amber-500/30'
              }`}
            >
              {alertMessage.type === 'wrong_tool' ? (
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
              ) : alertMessage.type === 'target_miss' ? (
                <Crosshair className="w-5 h-5 text-red-400 shrink-0 animate-pulse" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              )}
              <div className="text-xs font-semibold leading-relaxed">
                {alertMessage.text}
              </div>
            </div>
          )}

          {/* Bottom Dock Control Overlay */}
          <ControlOverlay
            assemblyState={assemblyState}
            currentStep={currentStep}
            activeCameraPreset={activeCameraPreset}
            onSelectCamera={(preset) => setActiveCameraPreset(preset)}
            onExecuteAction={executeNextAction}
            onReset={handleReset}
            onOpenExamReport={() => setIsExamModalOpen(true)}
            onOpenBIOS={() => setIsPostModalOpen(true)}
            isMuted={isMuted}
            onToggleMute={() => {
              const nextM = !isMuted;
              setIsMuted(nextM);
              sound.setMuted(nextM);
            }}
            selectedTool={selectedTool}
            onSelectTool={(tool) => {
              setSelectedTool(tool);
              // Dismiss wrong_tool warning if user selects the expected tool
              if (alertMessage?.type === 'wrong_tool') {
                const expTool = currentStep.toolRequired || 'hands';
                if (tool === expTool) {
                  setAlertMessage(null);
                }
              }
            }}
            cursorMode={cursorMode}
            onToggleCursorMode={() => setCursorMode((prev) => (prev === 'orbit' ? 'pan' : 'orbit'))}
            onPanCamera={(x, y) => controlsAPIRef.current?.pan(x, y)}
            onZoomCamera={(delta) => controlsAPIRef.current?.zoom(delta)}
            onResetCamera={() => controlsAPIRef.current?.reset()}
            onToggleCaseGlass={() => {
              sound.playClick();
              setAssemblyState((prev) => ({ ...prev, caseGlassOpen: !prev.caseGlassOpen }));
            }}
            cooldownRemaining={cooldownRemaining}
            shakeTool={shakeTool}
            shakeButton={shakeButton}
            onRotateCpu={handleRotateCpu}
          />

          {/* Modals */}
          <POSTScreenModal
            isOpen={isPostModalOpen}
            onClose={() => setIsPostModalOpen(false)}
            assemblyState={assemblyState}
            scenario={selectedScenario}
            onFixFault={handleFixFault}
          />

          <ExamReportModal
            isOpen={isExamModalOpen}
            onClose={() => setIsExamModalOpen(false)}
            assemblyState={assemblyState}
            scenario={selectedScenario}
          />

          <HardwareInspectorModal
            isOpen={isHardwareModalOpen}
            onClose={() => setIsHardwareModalOpen(false)}
            scenario={selectedScenario}
          />

          <ScenarioPickerModal
            isOpen={isScenarioModalOpen}
            onClose={() => setIsScenarioModalOpen(false)}
            selectedScenarioId={selectedScenario.id}
            onSelectScenario={(scen) => setSelectedScenario(scen)}
            activeMode={assemblyState.mode}
            onSelectMode={(mode) => setAssemblyState((prev) => ({ ...prev, mode }))}
            onStartTroubleshootPreset={handleStartTroubleshootPreset}
          />
        </>
      )}
    </div>
  );
}
