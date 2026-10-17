export type SocketType = 'LGA1700' | 'AM5';
export type MemoryType = 'DDR4' | 'DDR5';
export type FormFactor = 'ATX' | 'Micro-ATX';

export interface HardwareItem {
  id: string;
  name: string;
  category: 'cpu' | 'motherboard' | 'ram' | 'cooler' | 'gpu' | 'storage' | 'psu' | 'case';
  socket?: SocketType;
  supportedSocket?: SocketType;
  memoryType?: MemoryType;
  supportedMemory?: MemoryType;
  tdp?: number;
  maxCoolingTdp?: number;
  wattage?: number;
  description: string;
  sopNotes: string;
  specs: Record<string, string>;
}

export type AssemblyPhase = 1 | 2 | 3 | 4;

export interface AssemblyStep {
  id: string;
  phase: AssemblyPhase;
  phaseTitle: string;
  stepNumber: number;
  title: string;
  instruction: string;
  sopWarning: string;
  toolRequired?: 'hands' | 'thermal_paste' | 'screwdriver' | 'cable';
  targetSlot: string;
}

export interface AssemblyState {
  currentPhase: AssemblyPhase;
  currentStepIndex: number;
  mode: 'tutorial' | 'sandbox' | 'exam' | 'troubleshoot';
  selectedScenarioId: string;
  
  // Phase 1: Motherboard Prep
  cpuInstalled: boolean;
  cpuLeverOpen: boolean;
  cpuLeverLocked: boolean;
  cpuOrientation: 0 | 90 | 180 | 270; // 0 = correct Pin 1 alignment
  thermalPasteApplied: boolean;
  coolerMounted: boolean;
  coolerScrewsTightened: boolean;
  ramSlot2Installed: boolean;
  ramSlot4Installed: boolean;
  ramPushStage: 'none' | 'first_click' | 'dual_clicked';
  ramPartiallySeated: boolean;
  
  // Phase 2: Chassis & Mobo Mounting
  caseGlassOpen: boolean;
  ioShieldInstalled: boolean;
  standoffsInstalled: boolean;
  moboPlacedInCase: boolean;
  moboScrewsTightened: boolean;
  
  // Phase 3: Power & Storage
  psuMounted: boolean;
  psuScrewsTightened: boolean;
  m2SsdInstalled: boolean;
  m2ScrewTightened: boolean;
  
  // Phase 4: Expansion & Cabling
  pciBracketRemoved: boolean;
  gpuInstalled: boolean;
  gpuScrewTightened: boolean;
  cableMobo24PinConnected: boolean;
  cableCpu8PinConnected: boolean;
  cableGpuPcieConnected: boolean;
  cableFrontPanelConnected: boolean;
  caseGlassClosed: boolean;

  // Power & POST Simulation
  isPowerOn: boolean;
  powerButtonPressed: boolean;
  postState: 'off' | 'powering_up' | 'post_success' | 'post_error';
  debugLeds: {
    cpu: boolean;
    dram: boolean;
    vga: boolean;
    boot: boolean;
  };
  beepCode: 'none' | 'success_short' | 'cpu_fault' | 'ram_fault' | 'gpu_fault' | 'power_fault';
  cpuTemperature: number; // Celsius
  errorMessage?: string;
  errorSolution?: string;

  // Scoring & Metrics (Exam Mode)
  startTime: number;
  elapsedSeconds: number;
  sopMistakes: string[];
  correctActionsCount: number;
  studentName: string;
  studentClass: string;
}

export interface HardwareScenario {
  id: string;
  name: string;
  targetUser: string;
  budgetEst: string;
  description: string;
  components: {
    cpu: HardwareItem;
    motherboard: HardwareItem;
    ram: HardwareItem;
    cooler: HardwareItem;
    gpu: HardwareItem;
    storage: HardwareItem;
    psu: HardwareItem;
  };
  totalTdp: number;
}
