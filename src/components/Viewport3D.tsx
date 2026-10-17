import React, { useEffect, useRef, useCallback, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { buildCompletePCWorld, ProceduralPCSceneObjects } from '../utils/proceduralModels';
import { AssemblyState } from '../types/pc';
import { ASSEMBLY_STEPS } from '../data/hardwareData';
import { getTargetLocation } from '../utils/assemblyTargetPositions';

export type CursorMode = 'orbit' | 'pan';

interface Viewport3DProps {
  assemblyState: AssemblyState;
  activeCameraPreset: 'bench' | 'case' | 'monitor' | 'free';
  cursorMode?: CursorMode;
  onObjectClick?: (objectKey: string, event?: PointerEvent | MouseEvent) => void;
  onTargetMiss?: (info: { stepTitle: string; targetName: string; distancePixels: number; clientX: number; clientY: number }) => void;
  onPostAnimationComplete?: () => void;
  onControlsReady?: (controlsAPI: {
    pan: (x: number, y: number) => void;
    zoom: (delta: number) => void;
    reset: () => void;
  }) => void;
}

export const Viewport3D: React.FC<Viewport3DProps> = ({
  assemblyState,
  activeCameraPreset,
  cursorMode = 'orbit',
  onObjectClick,
  onTargetMiss,
  onControlsReady,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const sceneObjectsRef = useRef<ProceduralPCSceneObjects | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const pointerRef = useRef<THREE.Vector2>(new THREE.Vector2());

  // Screen space 2D HUD projection state
  const [reticleHUD, setReticleHUD] = useState<{
    x: number;
    y: number;
    visible: boolean;
    targetName: string;
    isHovered: boolean;
  }>({
    x: 0,
    y: 0,
    visible: false,
    targetName: '',
    isHovered: false,
  });

  // Track latest assemblyState and mouse screen pos for 60fps render loop
  const assemblyStateRef = useRef<AssemblyState>(assemblyState);
  useEffect(() => {
    assemblyStateRef.current = assemblyState;
  }, [assemblyState]);

  const lastPointerScreenPos = useRef<{ x: number; y: number }>({ x: -999, y: -999 });

  // Sync isPowerOn ref so render loop always has latest state
  const isPowerOnRef = useRef<boolean>(assemblyState.isPowerOn);
  useEffect(() => {
    isPowerOnRef.current = assemblyState.isPowerOn;
  }, [assemblyState.isPowerOn]);

  // Dedicated standalone glide transition for camera presets (isolated from animate loop)
  const glideCameraTo = useCallback((targetPos: THREE.Vector3, targetLookAt: THREE.Vector3) => {
    if (!cameraRef.current || !controlsRef.current) return;
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    const startPos = camera.position.clone();
    const startTarget = controls.target.clone();
    const startTime = performance.now();
    const duration = 550; // ms

    let isGlideActive = true;
    const cancelGlide = () => {
      isGlideActive = false;
      controls.removeEventListener('start', cancelGlide);
    };
    controls.addEventListener('start', cancelGlide);

    const step = (now: number) => {
      if (!isGlideActive) return;
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Smooth cubic ease out
      const ease = 1 - Math.pow(1 - progress, 3);

      camera.position.lerpVectors(startPos, targetPos, ease);
      controls.target.lerpVectors(startTarget, targetLookAt, ease);
      controls.update();

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        cancelGlide();
      }
    };

    requestAnimationFrame(step);
  }, []);

  // Preset camera positions
  useEffect(() => {
    if (activeCameraPreset === 'bench') {
      glideCameraTo(new THREE.Vector3(-0.85, 0.95, 0.45), new THREE.Vector3(-0.85, 0.1, 0.05));
    } else if (activeCameraPreset === 'case') {
      glideCameraTo(new THREE.Vector3(0.7, 0.75, 1.2), new THREE.Vector3(0.7, 0.45, 0));
    } else if (activeCameraPreset === 'monitor') {
      glideCameraTo(new THREE.Vector3(-0.85, 0.45, -0.2), new THREE.Vector3(-0.85, 0.45, -0.85));
    } else if (activeCameraPreset === 'free') {
      glideCameraTo(new THREE.Vector3(0, 1.4, 2.2), new THREE.Vector3(0, 0.3, 0));
    }
  }, [activeCameraPreset, glideCameraTo]);

  // Update cursor mode (Orbit vs Pan) on OrbitControls
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    if (cursorMode === 'pan') {
      // In Pan Mode: Left click PANS (geser), Right click ROTATES
      controls.mouseButtons = {
        LEFT: THREE.MOUSE.PAN,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.ROTATE,
      };
      controls.touches = {
        ONE: THREE.TOUCH.PAN,
        TWO: THREE.TOUCH.DOLLY_PAN,
      };
    } else {
      // In Orbit Mode: Left click ROTATES (putar 360°), Right click PANS (geser)
      controls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN,
      };
      controls.touches = {
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN,
      };
    }
  }, [cursorMode]);

  // Update 3D Component Placements and States based on AssemblyState
  useEffect(() => {
    const objs = sceneObjectsRef.current;
    if (!objs) return;

    // CPU Lever animation
    if (assemblyState.cpuLeverOpen) {
      objs.cpuLever.rotation.x = -Math.PI / 2.8;
      objs.cpuLever.position.y = 0.06;
    } else {
      objs.cpuLever.rotation.x = 0;
      objs.cpuLever.position.y = 0.012;
    }

    // CPU placement and orientation rotation
    objs.cpuMesh.rotation.y = (assemblyState.cpuOrientation * Math.PI) / 180;
    if (assemblyState.cpuInstalled) {
      objs.cpuMesh.position.set(-0.06, 0.016, -0.06);
      objs.motherboardGroup.add(objs.cpuMesh);
    } else {
      objs.cpuMesh.position.set(-1.18, 0.07, -0.15);
      objs.rootGroup.add(objs.cpuMesh);
    }

    // Thermal Paste visibility
    objs.thermalPasteBlob.visible = assemblyState.thermalPasteApplied;
    if (assemblyState.thermalPasteApplied) {
      objs.thermalPasteBlob.position.set(-0.06, 0.022, -0.06);
    }

    // CPU Cooler placement
    if (assemblyState.coolerMounted) {
      objs.coolerGroup.position.set(-0.06, 0.024, -0.06);
      objs.motherboardGroup.add(objs.coolerGroup);
    } else {
      objs.coolerGroup.position.set(-1.18, 0.065, 0.18);
      objs.rootGroup.add(objs.coolerGroup);
    }

    // RAM Stick 1 (Slot 2)
    if (assemblyState.ramSlot2Installed) {
      if (assemblyState.ramPartiallySeated) {
        // Tilted half-seated RAM (Menancap Sebelah)
        objs.ramStick1.position.set(0.148, 0.042, -0.06);
        objs.ramStick1.rotation.set(0, 0, -0.07);
      } else {
        objs.ramStick1.position.set(0.148, 0.035, -0.06);
        objs.ramStick1.rotation.set(0, 0, 0);
      }
      objs.motherboardGroup.add(objs.ramStick1);
    } else {
      objs.ramStick1.position.set(-1.18, 0.08, -0.32);
      objs.ramStick1.rotation.set(0, 0, 0);
      objs.rootGroup.add(objs.ramStick1);
    }

    // RAM Stick 2 (Slot 4)
    if (assemblyState.ramSlot4Installed) {
      if (assemblyState.ramPartiallySeated) {
        // Tilted half-seated RAM (Menancap Sebelah)
        objs.ramStick2.position.set(0.204, 0.042, -0.06);
        objs.ramStick2.rotation.set(0, 0, -0.07);
      } else {
        objs.ramStick2.position.set(0.204, 0.035, -0.06);
        objs.ramStick2.rotation.set(0, 0, 0);
      }
      objs.motherboardGroup.add(objs.ramStick2);
    } else {
      objs.ramStick2.position.set(-1.18, 0.08, -0.42);
      objs.ramStick2.rotation.set(0, 0, 0);
      objs.rootGroup.add(objs.ramStick2);
    }

    // M.2 NVMe SSD placement
    if (assemblyState.m2SsdInstalled) {
      objs.m2SsdGroup.position.set(-0.06, 0.018, 0.08);
      objs.motherboardGroup.add(objs.m2SsdGroup);
    } else {
      objs.m2SsdGroup.position.set(-1.18, 0.07, 0.35);
      objs.rootGroup.add(objs.m2SsdGroup);
    }

    // Chassis Panel open/closed
    objs.caseGlassPanel.visible = !assemblyState.caseGlassOpen;

    // I/O Shield in case
    objs.ioShieldMesh.visible = assemblyState.ioShieldInstalled;

    // Standoffs in case
    objs.standoffGroup.visible = assemblyState.standoffsInstalled;

    // Motherboard in case or on workbench
    if (assemblyState.moboPlacedInCase) {
      objs.motherboardGroup.position.set(0.53, 0.55, 0);
      objs.motherboardGroup.rotation.z = -Math.PI / 2;
      objs.moboScrewsGroup.visible = assemblyState.moboScrewsTightened;
    } else {
      objs.motherboardGroup.position.set(-0.85, 0.065, 0.05);
      objs.motherboardGroup.rotation.z = 0;
      objs.moboScrewsGroup.visible = false;
    }

    // PSU in case or workbench
    if (assemblyState.psuMounted) {
      objs.psuGroup.position.set(0.6, 0.11, -0.22);
      objs.psuGroup.rotation.y = 0;
    } else {
      objs.psuGroup.position.set(0.05, 0.08, 0.8);
      objs.psuGroup.rotation.y = 0;
    }

    // GPU in case PCIe slot or workbench
    if (assemblyState.gpuInstalled) {
      if (assemblyState.moboPlacedInCase) {
        objs.gpuGroup.position.set(0.68, 0.49, 0.06);
        objs.gpuGroup.rotation.set(0, 0, 0);
      } else {
        objs.gpuGroup.position.set(-0.06, 0.08, 0.12);
      }
    } else {
      objs.gpuGroup.position.set(-0.2, 0.08, 0.8);
    }

    // Cables visibility
    objs.cable24Pin.visible = assemblyState.cableMobo24PinConnected && assemblyState.moboPlacedInCase;
    objs.cableCpu8Pin.visible = assemblyState.cableCpu8PinConnected && assemblyState.moboPlacedInCase;
    objs.cableGpuPcie.visible = assemblyState.cableGpuPcieConnected && assemblyState.gpuInstalled;
    objs.cableFrontPanel.visible = assemblyState.cableFrontPanelConnected && assemblyState.moboPlacedInCase;

    // Debug LEDs update
    const updateLed = (mesh: THREE.Mesh, active: boolean, colorHex: number) => {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (active) {
        mat.color.setHex(colorHex);
        mat.emissive.setHex(colorHex);
        mat.emissiveIntensity = 2.0;
      } else {
        mat.color.setHex(0x1e293b);
        mat.emissive.setHex(0x000000);
        mat.emissiveIntensity = 0;
      }
    };

    updateLed(objs.debugLedCpu, assemblyState.debugLeds.cpu, 0xef4444);
    updateLed(objs.debugLedDram, assemblyState.debugLeds.dram, 0xeab308);
    updateLed(objs.debugLedVga, assemblyState.debugLeds.vga, 0xffffff);
    updateLed(objs.debugLedBoot, assemblyState.debugLeds.boot, 0x22c55e);

    // Power button LED glow
    const pwrMat = objs.powerButtonMesh.material as THREE.MeshStandardMaterial;
    if (assemblyState.isPowerOn) {
      pwrMat.emissive.setHex(0x38bdf8);
      pwrMat.emissiveIntensity = 1.2;
    } else {
      pwrMat.emissive.setHex(0x0284c7);
      pwrMat.emissiveIntensity = 0.2;
    }
  }, [assemblyState]);

  // Monitor Canvas rendering loop / state
  const renderMonitorScreen = useCallback(() => {
    const objs = sceneObjectsRef.current;
    if (!objs) return;

    const ctx = objs.monitorCanvasCtx;
    const w = 1024;
    const h = 576;

    if (!assemblyState.isPowerOn) {
      ctx.fillStyle = '#05070c';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#475569';
      ctx.font = '22px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('MONITOR LABORATORIUM VOKASI', w / 2, h / 2 - 20);
      ctx.font = '16px "JetBrains Mono", monospace';
      ctx.fillText('[ STANDBY: TIDAK ADA SINYAL / HDMI 1 ]', w / 2, h / 2 + 25);
      objs.monitorTexture.needsUpdate = true;
      return;
    }

    if (assemblyState.postState === 'powering_up') {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#f8fafc';
      ctx.font = '20px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('American Megatrends UEFI BIOS 2026', 40, 60);
      ctx.fillText('Initializing hardware subsystem...', 40, 100);
      ctx.fillText('> Checking CPU microcode... [OK]', 40, 140);
      ctx.fillText('> Initializing Memory Dual-Channel Bus...', 40, 180);
      objs.monitorTexture.needsUpdate = true;
      return;
    }

    if (assemblyState.postState === 'post_error') {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = '#ef4444';
      ctx.fillRect(0, 0, w, 50);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('POST HARDWARE FAULT DETECTED // TROUBLESHOOTING', 40, 34);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 20px "JetBrains Mono", monospace';
      ctx.fillText(`KESALAHAN: ${assemblyState.errorMessage || 'Kegagalan Inisialisasi Perangkat Keras'}`, 40, 120);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '17px "JetBrains Mono", monospace';
      ctx.fillText(`Solusi SOP: ${assemblyState.errorSolution || 'Periksa kembali indikator Debug LED motherboard.'}`, 40, 170);

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(40, 230, 944, 180);
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(40, 230, 944, 180);

      ctx.fillStyle = '#f8fafc';
      ctx.font = '16px "JetBrains Mono", monospace';
      ctx.fillText('STATUS EZ-DEBUG LED MOTHERBOARD:', 60, 270);

      const leds = [
        { name: 'CPU', active: assemblyState.debugLeds.cpu, color: '#ef4444', desc: 'Power / Pinout Issue' },
        { name: 'DRAM', active: assemblyState.debugLeds.dram, color: '#eab308', desc: 'Memory Not Seated' },
        { name: 'VGA', active: assemblyState.debugLeds.vga, color: '#ffffff', desc: 'GPU PCIe Power' },
        { name: 'BOOT', active: assemblyState.debugLeds.boot, color: '#22c55e', desc: 'Storage Device' },
      ];

      leds.forEach((l, idx) => {
        const x = 70 + idx * 220;
        ctx.fillStyle = l.active ? l.color : '#475569';
        ctx.beginPath();
        ctx.arc(x, 330, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px "JetBrains Mono", monospace';
        ctx.fillText(l.name, x + 24, 336);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px "JetBrains Mono", monospace';
        ctx.fillText(l.active ? 'FAIL' : 'PASS', x + 24, 360);
      });

      ctx.fillStyle = '#f59e0b';
      ctx.font = '16px "JetBrains Mono", monospace';
      ctx.fillText('Gunakan obeng & perkakas untuk memperbaiki komponen yang bermasalah.', 40, 470);

      objs.monitorTexture.needsUpdate = true;
      return;
    }

    if (assemblyState.postState === 'post_success') {
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, w, h);

      const hGrad = ctx.createLinearGradient(0, 0, w, 0);
      hGrad.addColorStop(0, '#1e293b');
      hGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = hGrad;
      ctx.fillRect(0, 0, w, 64);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 24px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('UEFI BIOS UTILITY // PRO-LAB EZ-MODE', 36, 42);

      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 16px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText('STATUS: POST 100% SUKSES', w - 40, 42);

      ctx.fillStyle = '#111827';
      ctx.fillRect(36, 84, 460, 220);
      ctx.strokeStyle = '#1e293b';
      ctx.strokeRect(36, 84, 460, 220);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 16px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('CPU & MEMORY INFORMATION', 54, 116);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px "JetBrains Mono", monospace';
      ctx.fillText('Model      : AMD Ryzen 5 7600 (6-Core, 12-Threads)', 54, 150);
      ctx.fillText('Base Clock : 3.80 GHz (Turbo 5.10 GHz)', 54, 180);
      ctx.fillText('Total RAM  : 16384 MB (16GB Dual-Channel DDR5)', 54, 210);
      ctx.fillText('Memory Bus : 5600 MT/s [EXPO Profile 1 Active]', 54, 240);
      ctx.fillText('PCIe Slot  : Gen 5.0 x16 Link Running at x16', 54, 270);

      ctx.fillStyle = '#111827';
      ctx.fillRect(528, 84, 460, 220);
      ctx.strokeStyle = '#1e293b';
      ctx.strokeRect(528, 84, 460, 220);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 16px "JetBrains Mono", monospace';
      ctx.fillText('HARDWARE HEALTH & TELEMETRY', 546, 116);

      const temp = Math.round(assemblyState.cpuTemperature);
      ctx.fillStyle = temp > 80 ? '#ef4444' : temp > 60 ? '#f59e0b' : '#22c55e';
      ctx.font = 'bold 36px "JetBrains Mono", monospace';
      ctx.fillText(`${temp}°C`, 546, 170);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px "JetBrains Mono", monospace';
      ctx.fillText('CPU Core Temperature (Normal: 35-45°C)', 650, 160);
      ctx.fillText('CPU Fan Speed: 1420 RPM [PWM Optimal]', 546, 210);
      ctx.fillText('Chassis Exhaust: 1100 RPM', 546, 240);
      ctx.fillText('Voltages : +12V: 12.08V | +5V: 5.02V | +3.3V: 3.31V', 546, 270);

      ctx.fillStyle = '#111827';
      ctx.fillRect(36, 324, 952, 130);
      ctx.strokeStyle = '#1e293b';
      ctx.strokeRect(36, 324, 952, 130);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 16px "JetBrains Mono", monospace';
      ctx.fillText('BOOT PRIORITY & STORAGE DEVICES', 54, 356);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px "JetBrains Mono", monospace';
      ctx.fillText('Drive 1: NVMe M.2 Kingston KC3000 1024GB (PCIe 4.0 x4) - Boot Master [Windows 11 Education]', 54, 390);
      ctx.fillText('SATA   : Tidak terdeteksi (Slot Kosong)', 54, 420);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 16px "JetBrains Mono", monospace';
      ctx.fillText('Selamat! Perakitan Komputer Memenuhi Seluruh Standar SOP Vokasi & Industri.', 36, 490);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px "JetBrains Mono", monospace';
      ctx.fillText('Tekan F10 untuk Simpan & Boot OS | Buka Rapor Evaluasi Guru untuk melihat nilai kelulusan.', 36, 520);

      objs.monitorTexture.needsUpdate = true;
    }
  }, [assemblyState]);

  useEffect(() => {
    renderMonitorScreen();
  }, [renderMonitorScreen]);

  // Three.js Mount Lifecycle
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x070a11);
    scene.fog = new THREE.FogExp2(0x070a11, 0.08);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.05, 50);
    camera.position.set(-0.85, 1.1, 0.45);
    cameraRef.current = camera;

    // Renderer
    const isHeadless = navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent);
    const renderer = new THREE.WebGLRenderer({ antialias: !isHeadless, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isHeadless;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // Studio Environment Map via RoomEnvironment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Studio 3-Point Lighting Rig
    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.2);
    keyLight.position.set(2, 4, 3);
    keyLight.castShadow = !isHeadless;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 10;
    keyLight.shadow.camera.left = -2;
    keyLight.shadow.camera.right = 2;
    keyLight.shadow.camera.top = 2;
    keyLight.shadow.camera.bottom = -2;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x1e293b, 1.0);
    scene.add(hemiLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.5);
    rimLight.position.set(-3, 3, -2);
    scene.add(rimLight);

    // Build All Procedural PC Objects
    const pcWorld = buildCompletePCWorld();
    sceneObjectsRef.current = pcWorld;
    scene.add(pcWorld.rootGroup);

    // Orbit Controls with 100% Free Orbit & Pan
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = true;
    controls.screenSpacePanning = true; // Natural 2D screen panning
    controls.panSpeed = 1.2;
    controls.rotateSpeed = 0.9;
    controls.zoomSpeed = 1.2;
    controls.maxPolarAngle = Math.PI * 0.95; // Allow viewing from all angles
    controls.minDistance = 0.15;
    controls.maxDistance = 8.0;
    controls.target.set(-0.85, 0.1, 0.05);

    // Configure mouse and touch button bindings based on cursorMode
    if (cursorMode === 'pan') {
      controls.mouseButtons = {
        LEFT: THREE.MOUSE.PAN,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.ROTATE,
      };
      controls.touches = {
        ONE: THREE.TOUCH.PAN,
        TWO: THREE.TOUCH.DOLLY_PAN,
      };
    } else {
      controls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN,
      };
      controls.touches = {
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN,
      };
    }

    controlsRef.current = controls;

    // Expose programmatic pan and zoom controls API
    if (onControlsReady) {
      onControlsReady({
        pan: (deltaX: number, deltaY: number) => {
          const v = new THREE.Vector3(deltaX, deltaY, 0);
          v.applyQuaternion(camera.quaternion);
          camera.position.add(v);
          controls.target.add(v);
          controls.update();
        },
        zoom: (delta: number) => {
          const factor = delta > 0 ? 0.85 : 1.15;
          const offset = camera.position.clone().sub(controls.target);
          offset.multiplyScalar(factor);
          camera.position.copy(controls.target).add(offset);
          controls.update();
        },
        reset: () => {
          glideCameraTo(new THREE.Vector3(-0.85, 0.95, 0.45), new THREE.Vector3(-0.85, 0.1, 0.05));
        },
      });
    }

    // 15. Create Pulsing Target Guide Indicator (Marker Panduan Visual Presisi)
    const indicatorGroup = new THREE.Group();

    // Outer Pulsing Torus Ring
    const pulseRingGeom = new THREE.TorusGeometry(0.044, 0.0035, 16, 32);
    const pulseRingMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xfacc15,
      emissiveIntensity: 2.2,
      roughness: 0.2,
    });
    const pulseRing = new THREE.Mesh(pulseRingGeom, pulseRingMat);
    pulseRing.rotation.x = Math.PI / 2;
    indicatorGroup.add(pulseRing);

    // Outer Segmented High-Tech Bracket Ring
    const outerBracketGeom = new THREE.RingGeometry(0.052, 0.058, 32);
    const outerBracketMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const outerBracket = new THREE.Mesh(outerBracketGeom, outerBracketMat);
    outerBracket.rotation.x = Math.PI / 2;
    indicatorGroup.add(outerBracket);

    // Inner Glowing Center Dot / Sphere
    const beaconDotGeom = new THREE.SphereGeometry(0.012, 16, 16);
    const beaconDotMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x38bdf8,
      emissiveIntensity: 3.0,
    });
    const beaconDot = new THREE.Mesh(beaconDotGeom, beaconDotMat);
    beaconDot.position.y = 0.006;
    indicatorGroup.add(beaconDot);

    // Inverted Target Pointer Cone (floating downward towards coordinate)
    const pointerArrowGeom = new THREE.ConeGeometry(0.014, 0.034, 16);
    const pointerArrowMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xfacc15,
      emissiveIntensity: 2.0,
    });
    const pointerArrow = new THREE.Mesh(pointerArrowGeom, pointerArrowMat);
    pointerArrow.rotation.x = Math.PI; // point downward
    pointerArrow.position.y = 0.055;
    indicatorGroup.add(pointerArrow);

    // Subtle PointLight casting glowing aura on surrounding hardware
    const targetLight = new THREE.PointLight(0xfacc15, 1.4, 0.45);
    targetLight.position.y = 0.025;
    indicatorGroup.add(targetLight);

    // Invisible Raycast Target Collider
    const colliderGeom = new THREE.SphereGeometry(0.075, 8, 8);
    const colliderMat = new THREE.MeshBasicMaterial({ visible: false });
    const targetCollider = new THREE.Mesh(colliderGeom, colliderMat);
    targetCollider.userData.isTargetCollider = true;
    indicatorGroup.add(targetCollider);

    scene.add(indicatorGroup);

    // Pre-warm shaders
    renderer.compile(scene, camera);

    // Animation loop (completely free of any camera pulling or lerping)
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.05);

      // OrbitControls controls camera freely without interference
      controls.update();

      // Fan spinning when PC is powered on
      if (pcWorld && isPowerOnRef.current) {
        pcWorld.coolerFanBlades.rotation.z += delta * 25.0;
        pcWorld.caseExhaustFan.rotation.z += delta * 20.0;
        pcWorld.gpuFanBlades.rotation.x += delta * 22.0;
      }

      // Animate pulsing target guide indicator
      const time = clock.getElapsedTime();
      const pulse = Math.sin(time * 5.5) * 0.15 + 1.0;
      pulseRing.scale.set(pulse, pulse, pulse);
      pulseRing.rotation.z += delta * 1.6;
      outerBracket.rotation.z -= delta * 1.1;
      pointerArrow.position.y = 0.055 + Math.sin(time * 6.0) * 0.008;
      beaconDot.scale.setScalar(0.9 + Math.sin(time * 7.0) * 0.2);

      // Position target guide indicator for current active step
      const curStepIdx = assemblyStateRef.current.currentStepIndex;
      const curStep = ASSEMBLY_STEPS[curStepIdx] || ASSEMBLY_STEPS[0];
      const isAssemblyActive = !assemblyStateRef.current.isPowerOn || assemblyStateRef.current.postState === 'post_error';

      if (isAssemblyActive && curStep && pcWorld) {
        indicatorGroup.visible = true;
        const targetInfo = getTargetLocation(curStep.id, pcWorld, assemblyStateRef.current);
        indicatorGroup.position.copy(targetInfo.pos);
        indicatorGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), targetInfo.normal);

        // Screen space projection for 2D floating HUD
        if (container) {
          const proj = targetInfo.pos.clone().project(camera);
          if (proj.z < 1) {
            const scrX = ((proj.x + 1) / 2) * container.clientWidth;
            const scrY = ((-proj.y + 1) / 2) * container.clientHeight;
            const distToCursor = Math.hypot(
              lastPointerScreenPos.current.x - scrX,
              lastPointerScreenPos.current.y - scrY
            );
            const isHovered = distToCursor <= 45;

            setReticleHUD({
              x: scrX,
              y: scrY,
              visible: true,
              targetName: targetInfo.name,
              isHovered,
            });
          } else {
            setReticleHUD((prev) => (prev.visible ? { ...prev, visible: false } : prev));
          }
        }
      } else {
        indicatorGroup.visible = false;
        setReticleHUD((prev) => (prev.visible ? { ...prev, visible: false } : prev));
      }

      renderer.render(scene, camera);
    };

    animate();

    // Window Resize Handler
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      cameraRef.current.aspect = newW / newH;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    // Robust Camera Drag vs Quick Click differentiation
    let isMouseDown = false;
    let pointerDownPos = { x: 0, y: 0, time: 0 };
    let hasDragged = false;
    let isCameraManipulating = false;

    // OrbitControls event tracking: whenever user orbits or pans, flag as camera manipulation
    const onControlsStart = () => {
      isCameraManipulating = true;
      hasDragged = true;
    };
    const onControlsChange = () => {
      if (isMouseDown) {
        isCameraManipulating = true;
        hasDragged = true;
      }
    };
    const onControlsEnd = () => {
      // Keep flag briefly active to prevent trailing pointerup from triggering
      setTimeout(() => {
        isCameraManipulating = false;
      }, 100);
    };

    controls.addEventListener('start', onControlsStart);
    controls.addEventListener('change', onControlsChange);
    controls.addEventListener('end', onControlsEnd);

    const handlePointerDown = (event: PointerEvent) => {
      // Only respond to main button (left click) or primary touch
      if (event.button !== 0) return;
      isMouseDown = true;
      hasDragged = false;
      isCameraManipulating = false;
      pointerDownPos = { x: event.clientX, y: event.clientY, time: performance.now() };
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (container) {
        const rect = container.getBoundingClientRect();
        lastPointerScreenPos.current = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        };
      }
      if (!isMouseDown) return;
      const moveDist = Math.hypot(event.clientX - pointerDownPos.x, event.clientY - pointerDownPos.y);
      if (moveDist > 3.5) {
        hasDragged = true;
      }
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (!isMouseDown) return;
      isMouseDown = false;

      const dist = Math.hypot(event.clientX - pointerDownPos.x, event.clientY - pointerDownPos.y);
      const duration = performance.now() - pointerDownPos.time;

      // STRICT CHECK: If user moved mouse > 5px, held for > 200ms (sustained drag),
      // or if OrbitControls registered camera manipulation, THIS IS A DRAG, NOT A CLICK!
      if (hasDragged || isCameraManipulating || dist > 5 || duration > 200) {
        return;
      }

      // GENUINE QUICK CLICK: Check precision bounding box & target tolerance
      if (!container || !cameraRef.current || !sceneRef.current) return;
      const rect = container.getBoundingClientRect();
      pointerRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointerRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(pointerRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects(scene.children, true);

      const curStepIdx = assemblyStateRef.current.currentStepIndex;
      const curStep = ASSEMBLY_STEPS[curStepIdx] || ASSEMBLY_STEPS[0];
      const targetInfo = getTargetLocation(curStep.id, pcWorld, assemblyStateRef.current);

      // Project target coordinate to 2D screen pixels
      const projected = targetInfo.pos.clone().project(cameraRef.current);
      const isFacingCamera = projected.z < 1;
      const targetScreenX = ((projected.x + 1) / 2) * rect.width + rect.left;
      const targetScreenY = ((-projected.y + 1) / 2) * rect.height + rect.top;
      const pixelDist = Math.hypot(event.clientX - targetScreenX, event.clientY - targetScreenY);

      const hitPoint = intersects.length > 0 ? intersects[0].point : null;
      const dist3D = hitPoint ? hitPoint.distanceTo(targetInfo.pos) : 999;

      // Check if click hit the indicator collider itself or power button
      const hitTargetCollider = intersects.some((i) => 
        i.object === targetCollider ||
        i.object === pulseRing ||
        i.object === beaconDot ||
        i.object === pointerArrow ||
        (curStep.id === 'step_post_power' && i.object === pcWorld.powerButtonMesh)
      );

      const hitPowerButton = intersects.length > 0 && intersects[0].object === pcWorld.powerButtonMesh;

      // Precision bounding box check:
      // Must be within pixel tolerance (e.g. <= 28px) OR within 3D tolerance sphere OR direct collider hit
      const isPrecisionHit = hitTargetCollider || (isFacingCamera && pixelDist <= targetInfo.pixelTolerance) || dist3D <= targetInfo.tolerance3D;

      if (isPrecisionHit) {
        // Flash indicator emerald green on precision hit
        pulseRingMat.color.setHex(0x10b981);
        pulseRingMat.emissive.setHex(0x10b981);
        targetLight.color.setHex(0x10b981);
        setTimeout(() => {
          pulseRingMat.color.setHex(0xfacc15);
          pulseRingMat.emissive.setHex(0xfacc15);
          targetLight.color.setHex(0xfacc15);
        }, 400);

        if (hitPowerButton || curStep.id === 'step_post_power') {
          if (onObjectClick) onObjectClick('power_button', event);
        } else {
          let foundKey = 'workbench';
          if (intersects.length > 0) {
            intersects[0].object.traverseAncestors((parent) => {
              if (parent === pcWorld.cpuMesh) foundKey = 'cpu';
              if (parent === pcWorld.cpuSocketGroup) foundKey = 'cpu_socket';
              if (parent === pcWorld.coolerGroup) foundKey = 'cooler';
              if (parent === pcWorld.ramStick1 || parent === pcWorld.ramStick2) foundKey = 'ram';
              if (parent === pcWorld.m2SsdGroup) foundKey = 'm2';
              if (parent === pcWorld.gpuGroup) foundKey = 'gpu';
              if (parent === pcWorld.psuGroup) foundKey = 'psu';
              if (parent === pcWorld.caseGroup) foundKey = 'case';
            });
          }
          if (onObjectClick) onObjectClick(foundKey, event);
        }
      } else {
        // Click was outside target coordinate (Salah Sasaran)
        // Flash indicator warning red
        pulseRingMat.color.setHex(0xef4444);
        pulseRingMat.emissive.setHex(0xef4444);
        targetLight.color.setHex(0xef4444);
        setTimeout(() => {
          pulseRingMat.color.setHex(0xfacc15);
          pulseRingMat.emissive.setHex(0xfacc15);
          targetLight.color.setHex(0xfacc15);
        }, 450);

        if (onTargetMiss) {
          onTargetMiss({
            stepTitle: curStep.title,
            targetName: targetInfo.name,
            distancePixels: Math.round(pixelDist),
            clientX: event.clientX,
            clientY: event.clientY,
          });
        } else if (onObjectClick) {
          onObjectClick('target_miss', event);
        }
      }
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      controls.removeEventListener('start', onControlsStart);
      controls.removeEventListener('change', onControlsChange);
      controls.removeEventListener('end', onControlsEnd);
      controls.dispose();
      renderer.dispose();
      if (domElement.parentElement) {
        domElement.parentElement.removeChild(domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={`w-full h-full relative outline-none overflow-hidden select-none ${
        cursorMode === 'pan' ? 'cursor-move' : 'cursor-grab active:cursor-grabbing'
      }`}
    >
      {/* Dynamic 3D Projected Screen Reticle Overlay */}
      {reticleHUD.visible && (
        <div 
          className="pointer-events-none absolute z-20 flex flex-col items-center -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
          style={{ left: `${reticleHUD.x}px`, top: `${reticleHUD.y}px` }}
        >
          {/* Animated HUD Crosshair Ring */}
          <div className={`relative flex items-center justify-center transition-all ${
            reticleHUD.isHovered ? 'scale-110' : 'scale-100'
          }`}>
            {/* Outer pulsing ring */}
            <div className={`w-11 h-11 rounded-full border-2 border-dashed ${
              reticleHUD.isHovered
                ? 'border-emerald-400 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                : 'border-amber-400/80 bg-amber-500/5 shadow-[0_0_10px_rgba(250,204,21,0.3)] animate-pulse'
            }`} />
            
            {/* Center Reticle Dot */}
            <div className={`absolute w-2 h-2 rounded-full ${
              reticleHUD.isHovered ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
            }`} />
          </div>

          {/* Floating HUD Target Badge */}
          <div className={`mt-2 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold tracking-wider backdrop-blur-md border shadow-lg whitespace-nowrap transition-all ${
            reticleHUD.isHovered
              ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-300 ring-1 ring-emerald-400/40'
              : 'bg-slate-950/85 border-amber-500/50 text-amber-300'
          }`}>
            {reticleHUD.isHovered ? '🎯 TARGET TERKUNCI (KLIK DI SINI)' : `📍 ${reticleHUD.targetName}`}
          </div>
        </div>
      )}
    </div>
  );
};
