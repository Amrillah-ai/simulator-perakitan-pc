import * as THREE from 'three';

// Procedural texture generators using HTML5 canvas
export function createESDMatTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // ESD Blue Mat Background
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, 1024, 1024);

  // Subtle grid
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  const step = 64;
  for (let x = 0; x <= 1024; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1024);
    ctx.stroke();
  }
  for (let y = 0; y <= 1024; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  // Accent measurements and antistatic warning text
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 4;
  ctx.strokeRect(32, 32, 1024 - 64, 1024 - 64);

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 20px "JetBrains Mono", monospace';
  ctx.fillText('ESD SAFE WORKBENCH // 10^6 - 10^9 OHMS/SQ', 48, 68);
  ctx.fillText('SOP LAB STANDAR: GUNAKAN GELANG ANTISTATIS & OBENG PRESISI', 48, 990);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export function createMotherboardPCBTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Dark matte PCB
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 1024, 1024);

  // Gold circuit traces
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.5;

  for (let i = 0; i < 40; i++) {
    const startX = 200 + Math.random() * 600;
    const startY = 200 + Math.random() * 600;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX + (Math.random() - 0.5) * 120, startY + (Math.random() - 0.5) * 120);
    ctx.lineTo(startX + (Math.random() - 0.5) * 200, startY + (Math.random() - 0.5) * 200);
    ctx.stroke();
  }

  ctx.globalAlpha = 1.0;
  // Silkscreen markings
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 16px "JetBrains Mono", monospace';
  ctx.fillText('PRO-SERIES B650 / LGA1700 LAB EDITION', 40, 60);
  ctx.fillText('PCIe 5.0 x16 STEEL ARMOR', 120, 680);
  ctx.fillText('DIMM_A1  DIMM_A2  DIMM_B1  DIMM_B2 (FIRST)', 660, 240);
  ctx.fillText('CPU_FAN1', 480, 140);
  ctx.fillText('M.2_1 PCIe NVMe GEN 4/5', 380, 620);
  ctx.fillText('FRONT_PANEL: [PWR_SW] [RESET] [HDD_LED]', 720, 960);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createCpuIHSTexture(modelName: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Brushed nickel IHS plate
  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, '#e2e8f0');
  grad.addColorStop(0.5, '#cbd5e1');
  grad.addColorStop(1, '#94a3b8');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Border bevel
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 12;
  ctx.strokeRect(10, 10, 492, 492);

  // Laser engraved text
  ctx.fillStyle = '#334155';
  ctx.font = 'bold 28px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('PROCESSOR CORE', 256, 160);
  ctx.font = 'bold 24px "JetBrains Mono", monospace';
  ctx.fillText(modelName.slice(0, 24), 256, 210);
  ctx.font = '18px "JetBrains Mono", monospace';
  ctx.fillText('MALAYSIA // SPEED 5.1GHz', 256, 260);
  ctx.fillText('LGA / AM5 ARCHITECTURE', 256, 300);

  // Pin 1 Gold Triangle at bottom-left corner
  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.moveTo(25, 485);
  ctx.lineTo(85, 485);
  ctx.lineTo(25, 425);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#ca8a04';
  ctx.lineWidth = 3;
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 3D Object Assembly Procedural Builders
export interface ProceduralPCSceneObjects {
  rootGroup: THREE.Group;
  workbenchGroup: THREE.Group;
  motherboardGroup: THREE.Group;
  cpuSocketGroup: THREE.Group;
  cpuLever: THREE.Mesh;
  cpuMesh: THREE.Group;
  thermalPasteBlob: THREE.Mesh;
  coolerGroup: THREE.Group;
  coolerFanBlades: THREE.Group;
  ramStick1: THREE.Group;
  ramStick2: THREE.Group;
  caseGroup: THREE.Group;
  caseGlassPanel: THREE.Mesh;
  caseExhaustFan: THREE.Group;
  ioShieldMesh: THREE.Mesh;
  standoffGroup: THREE.Group;
  moboScrewsGroup: THREE.Group;
  psuGroup: THREE.Group;
  psuFanBlades: THREE.Group;
  m2SsdGroup: THREE.Group;
  gpuGroup: THREE.Group;
  gpuFanBlades: THREE.Group;
  cable24Pin: THREE.Mesh;
  cableCpu8Pin: THREE.Mesh;
  cableGpuPcie: THREE.Mesh;
  cableFrontPanel: THREE.Mesh;
  debugLedCpu: THREE.Mesh;
  debugLedDram: THREE.Mesh;
  debugLedVga: THREE.Mesh;
  debugLedBoot: THREE.Mesh;
  powerButtonMesh: THREE.Mesh;
  monitorGroup: THREE.Group;
  monitorScreenMesh: THREE.Mesh;
  monitorCanvas: HTMLCanvasElement;
  monitorCanvasCtx: CanvasRenderingContext2D;
  monitorTexture: THREE.CanvasTexture;
}

export function buildCompletePCWorld(): ProceduralPCSceneObjects {
  const rootGroup = new THREE.Group();

  // Materials Library (PBR High Fidelity)
  const pcbMaterial = new THREE.MeshStandardMaterial({
    map: createMotherboardPCBTexture(),
    roughness: 0.4,
    metalness: 0.1,
  });

  const aluminumMaterial = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.25,
    metalness: 0.85,
  });

  const blackAluminumMaterial = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.35,
    metalness: 0.7,
  });

  const goldPinsMaterial = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.2,
    metalness: 0.95,
  });

  const copperHeatpipeMaterial = new THREE.MeshStandardMaterial({
    color: 0xb45309,
    roughness: 0.25,
    metalness: 0.9,
  });

  const plasticBlackMaterial = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.6,
    metalness: 0.1,
  });

  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x334155,
    transparent: true,
    opacity: 0.38,
    roughness: 0.05,
    metalness: 0.1,
    transmission: 0.9,
    thickness: 0.5,
    depthWrite: false,
  });

  // 1. WORKBENCH with ESD Mat
  const workbenchGroup = new THREE.Group();
  
  // Wooden / Metal Desk
  const deskGeom = new THREE.BoxGeometry(4.2, 0.15, 2.6);
  const deskMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6, metalness: 0.2 });
  const deskMesh = new THREE.Mesh(deskGeom, deskMat);
  deskMesh.position.y = -0.075;
  deskMesh.receiveShadow = true;
  workbenchGroup.add(deskMesh);

  // ESD Mat on Desk
  const esdGeom = new THREE.PlaneGeometry(3.6, 2.2);
  const esdMat = new THREE.MeshStandardMaterial({
    map: createESDMatTexture(),
    roughness: 0.55,
    metalness: 0.05,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1
  });
  const esdMesh = new THREE.Mesh(esdGeom, esdMat);
  esdMesh.rotation.x = -Math.PI / 2;
  esdMesh.position.y = 0.002;
  esdMesh.receiveShadow = true;
  workbenchGroup.add(esdMesh);

  // Grounding Stud on corner
  const studGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.015, 16);
  const studMesh = new THREE.Mesh(studGeom, goldPinsMaterial);
  studMesh.position.set(-1.6, 0.01, -0.9);
  workbenchGroup.add(studMesh);

  // Antistatic Mat Motherboard Box (Preparation Stand) on workbench left
  const moboBoxGeom = new THREE.BoxGeometry(0.9, 0.06, 0.75);
  const moboBoxMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5, metalness: 0.1 });
  const moboBoxMesh = new THREE.Mesh(moboBoxGeom, moboBoxMat);
  moboBoxMesh.position.set(-0.85, 0.03, 0.05);
  moboBoxMesh.castShadow = true;
  moboBoxMesh.receiveShadow = true;
  workbenchGroup.add(moboBoxMesh);

  rootGroup.add(workbenchGroup);

  // 2. MOTHERBOARD (ATX Form Factor: 0.7m x 0.6m scaled)
  const motherboardGroup = new THREE.Group();
  // Starts on the workbench mobo box
  motherboardGroup.position.set(-0.85, 0.065, 0.05);

  // PCB Base
  const pcbGeom = new THREE.BoxGeometry(0.72, 0.016, 0.58);
  const pcbMesh = new THREE.Mesh(pcbGeom, pcbMaterial);
  pcbMesh.castShadow = true;
  pcbMesh.receiveShadow = true;
  motherboardGroup.add(pcbMesh);

  // VRM Heatsinks (Top and Left of CPU socket)
  const vrmTopGeom = new THREE.BoxGeometry(0.24, 0.055, 0.06);
  const vrmTopMesh = new THREE.Mesh(vrmTopGeom, blackAluminumMaterial);
  vrmTopMesh.position.set(-0.06, 0.035, -0.21);
  vrmTopMesh.castShadow = true;
  motherboardGroup.add(vrmTopMesh);

  const vrmLeftGeom = new THREE.BoxGeometry(0.07, 0.065, 0.28);
  const vrmLeftMesh = new THREE.Mesh(vrmLeftGeom, blackAluminumMaterial);
  vrmLeftMesh.position.set(-0.25, 0.04, -0.06);
  vrmLeftMesh.castShadow = true;
  motherboardGroup.add(vrmLeftMesh);

  // Rear I/O Shield Block (metal ports housing)
  const ioBlockGeom = new THREE.BoxGeometry(0.08, 0.075, 0.35);
  const ioBlockMesh = new THREE.Mesh(ioBlockGeom, aluminumMaterial);
  ioBlockMesh.position.set(-0.32, 0.045, -0.08);
  ioBlockMesh.castShadow = true;
  motherboardGroup.add(ioBlockMesh);

  // Chipset Heatsink (Bottom Right)
  const chipsetGeom = new THREE.BoxGeometry(0.14, 0.035, 0.14);
  const chipsetMesh = new THREE.Mesh(chipsetGeom, blackAluminumMaterial);
  chipsetMesh.position.set(0.22, 0.025, 0.15);
  chipsetMesh.castShadow = true;
  motherboardGroup.add(chipsetMesh);

  // 3. CPU SOCKET (LGA/AM) & LEVER
  const cpuSocketGroup = new THREE.Group();
  cpuSocketGroup.position.set(-0.06, 0.008, -0.06);

  // Socket Plastic Base
  const socketBaseGeom = new THREE.BoxGeometry(0.18, 0.01, 0.18);
  const socketBaseMesh = new THREE.Mesh(socketBaseGeom, plasticBlackMaterial);
  cpuSocketGroup.add(socketBaseMesh);

  // Socket Gold Contact Pins Array (Subtle texture or gold plane)
  const pinsPlaneGeom = new THREE.PlaneGeometry(0.14, 0.14);
  const pinsPlaneMesh = new THREE.Mesh(pinsPlaneGeom, goldPinsMaterial);
  pinsPlaneMesh.rotation.x = -Math.PI / 2;
  pinsPlaneMesh.position.y = 0.006;
  cpuSocketGroup.add(pinsPlaneMesh);

  // Metal Socket Outer Bracket
  const bracketGeom = new THREE.BoxGeometry(0.19, 0.008, 0.19);
  const bracketMesh = new THREE.Mesh(bracketGeom, aluminumMaterial);
  bracketMesh.position.y = 0.004;
  cpuSocketGroup.add(bracketMesh);

  // Pin 1 Gold Arrow / Triangle Marker on Socket Corner (Alignment Guide)
  const socketTriangleShape = new THREE.Shape();
  socketTriangleShape.moveTo(0, 0);
  socketTriangleShape.lineTo(0.025, 0);
  socketTriangleShape.lineTo(0, 0.025);
  socketTriangleShape.closePath();
  const socketTriangleGeom = new THREE.ShapeGeometry(socketTriangleShape);
  const socketTriangleMesh = new THREE.Mesh(socketTriangleGeom, goldPinsMaterial);
  socketTriangleMesh.rotation.x = -Math.PI / 2;
  socketTriangleMesh.position.set(-0.08, 0.009, 0.055);
  cpuSocketGroup.add(socketTriangleMesh);

  // Hinged Retention Lever
  const leverBarGeom = new THREE.CylinderGeometry(0.003, 0.003, 0.18, 12);
  const cpuLever = new THREE.Mesh(leverBarGeom, aluminumMaterial);
  cpuLever.rotation.z = Math.PI / 2;
  cpuLever.position.set(0.1, 0.012, 0); // Along right side of socket
  cpuSocketGroup.add(cpuLever);

  motherboardGroup.add(cpuSocketGroup);

  // 4. CPU PROCESSOR OBJECT (detachable / positioned)
  const cpuMesh = new THREE.Group();
  // CPU Green/Gold Substrate PCB
  const cpuSubstrateGeom = new THREE.BoxGeometry(0.13, 0.004, 0.13);
  const cpuSubstrateMesh = new THREE.Mesh(cpuSubstrateGeom, goldPinsMaterial);
  cpuMesh.add(cpuSubstrateMesh);

  // CPU Metallic IHS (Integrated Heat Spreader) with laser texture
  const cpuIhsGeom = new THREE.BoxGeometry(0.11, 0.008, 0.11);
  const cpuIhsMat = new THREE.MeshStandardMaterial({
    map: createCpuIHSTexture('AMD RYZEN 5 7600'),
    roughness: 0.3,
    metalness: 0.85,
  });
  const cpuIhsMesh = new THREE.Mesh(cpuIhsGeom, cpuIhsMat);
  cpuIhsMesh.position.y = 0.006;
  cpuIhsMesh.castShadow = true;
  cpuMesh.add(cpuIhsMesh);

  // Initially positioned next to motherboard on workbench ready to be picked
  cpuMesh.position.set(-1.18, 0.07, -0.15);
  rootGroup.add(cpuMesh);

  // 5. THERMAL PASTE BLOB (appears when applied)
  const pasteGeom = new THREE.SphereGeometry(0.022, 16, 12);
  const pasteMat = new THREE.MeshStandardMaterial({
    color: 0x64748b, // Grey thermal compound
    roughness: 0.2,
    metalness: 0.3,
  });
  const thermalPasteBlob = new THREE.Mesh(pasteGeom, pasteMat);
  thermalPasteBlob.scale.set(1.4, 0.3, 1.4);
  thermalPasteBlob.visible = false;
  motherboardGroup.add(thermalPasteBlob);

  // 6. CPU COOLER (Tower Heatsink + Copper Pipes + Fan Blades)
  const coolerGroup = new THREE.Group();
  // Copper contact base plate
  const coolerBaseGeom = new THREE.BoxGeometry(0.13, 0.015, 0.13);
  const coolerBaseMesh = new THREE.Mesh(coolerBaseGeom, copperHeatpipeMaterial);
  coolerGroup.add(coolerBaseMesh);

  // 4 Copper Heatpipes
  for (let i = -1; i <= 1; i += 0.66) {
    const pipeGeom = new THREE.CylinderGeometry(0.006, 0.006, 0.25, 12);
    const pipeMesh = new THREE.Mesh(pipeGeom, copperHeatpipeMaterial);
    pipeMesh.position.set(i * 0.045, 0.12, 0);
    coolerGroup.add(pipeMesh);
  }

  // Aluminum Cooling Fin Stack (Composite layered look)
  const finStackGeom = new THREE.BoxGeometry(0.14, 0.18, 0.1);
  const finStackMesh = new THREE.Mesh(finStackGeom, aluminumMaterial);
  finStackMesh.position.y = 0.12;
  finStackMesh.castShadow = true;
  coolerGroup.add(finStackMesh);

  // 120mm Fan Frame
  const fanFrameGeom = new THREE.BoxGeometry(0.14, 0.14, 0.028);
  const fanFrameMesh = new THREE.Mesh(fanFrameGeom, plasticBlackMaterial);
  fanFrameMesh.position.set(0, 0.12, 0.065);
  coolerGroup.add(fanFrameMesh);

  // Rotating Fan Blades
  const coolerFanBlades = new THREE.Group();
  coolerFanBlades.position.set(0, 0.12, 0.075);
  const fanHubGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.015, 16);
  fanHubGeom.rotateX(Math.PI / 2);
  const fanHubMesh = new THREE.Mesh(fanHubGeom, plasticBlackMaterial);
  coolerFanBlades.add(fanHubMesh);

  for (let b = 0; b < 7; b++) {
    const bladeGeom = new THREE.BoxGeometry(0.012, 0.045, 0.003);
    const bladeMesh = new THREE.Mesh(bladeGeom, plasticBlackMaterial);
    const angle = (b * Math.PI * 2) / 7;
    bladeMesh.position.set(Math.cos(angle) * 0.035, Math.sin(angle) * 0.035, 0);
    bladeMesh.rotation.z = angle + 0.35;
    coolerFanBlades.add(bladeMesh);
  }
  coolerGroup.add(coolerFanBlades);

  // 4 Cooler Mounting Screws / Brackets
  const screwPos = [
    [-0.07, 0.01, -0.07],
    [0.07, 0.01, -0.07],
    [-0.07, 0.01, 0.07],
    [0.07, 0.01, 0.07],
  ];
  screwPos.forEach(([x, y, z]) => {
    const screwG = new THREE.CylinderGeometry(0.006, 0.006, 0.02, 8);
    const screwM = new THREE.Mesh(screwG, aluminumMaterial);
    screwM.position.set(x, y, z);
    coolerGroup.add(screwM);
  });

  // Initially positioned on workbench right
  coolerGroup.position.set(-1.18, 0.065, 0.18);
  rootGroup.add(coolerGroup);

  // 7. RAM SLOTS & MODULES (Dual Channel DIMM 2 & 4)
  // 4 RAM DIMM Sockets on Motherboard
  for (let s = 0; s < 4; s++) {
    const slotX = 0.12 + s * 0.028;
    const ramSocketGeom = new THREE.BoxGeometry(0.014, 0.018, 0.32);
    const ramSocketMesh = new THREE.Mesh(ramSocketGeom, plasticBlackMaterial);
    ramSocketMesh.position.set(slotX, 0.015, -0.06);
    motherboardGroup.add(ramSocketMesh);

    // End latch clips
    const latch1 = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.024, 0.016), blackAluminumMaterial);
    latch1.position.set(slotX, 0.02, -0.22);
    motherboardGroup.add(latch1);

    const latch2 = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.024, 0.016), blackAluminumMaterial);
    latch2.position.set(slotX, 0.02, 0.1);
    motherboardGroup.add(latch2);
  }

  // RAM Stick 1 Helper function
  function createRamStick(name: string): THREE.Group {
    const group = new THREE.Group();
    // PCB
    const ramPcbGeom = new THREE.BoxGeometry(0.004, 0.045, 0.28);
    const ramPcbMesh = new THREE.Mesh(ramPcbGeom, pcbMaterial);
    group.add(ramPcbMesh);

    // Metal Heatspreader
    const spreaderGeom = new THREE.BoxGeometry(0.007, 0.048, 0.275);
    const spreaderMesh = new THREE.Mesh(spreaderGeom, blackAluminumMaterial);
    spreaderMesh.position.y = 0.004;
    group.add(spreaderMesh);

    // RGB Top Diffuser Bar
    const rgbGeom = new THREE.BoxGeometry(0.008, 0.008, 0.27);
    const rgbMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      roughness: 0.1,
    });
    const rgbMesh = new THREE.Mesh(rgbGeom, rgbMat);
    rgbMesh.position.y = 0.03;
    group.add(rgbMesh);

    return group;
  }

  const ramStick1 = createRamStick('RAM_1');
  ramStick1.position.set(-1.18, 0.08, -0.32);
  rootGroup.add(ramStick1);

  const ramStick2 = createRamStick('RAM_2');
  ramStick2.position.set(-1.18, 0.08, -0.42);
  rootGroup.add(ramStick2);

  // 8. STORAGE (M.2 NVMe SSD)
  const m2SsdGroup = new THREE.Group();
  const m2PcbGeom = new THREE.BoxGeometry(0.05, 0.003, 0.16);
  const m2PcbMesh = new THREE.Mesh(m2PcbGeom, pcbMaterial);
  m2SsdGroup.add(m2PcbMesh);

  // NAND Flash Chips & Controller
  for (let c = 0; c < 2; c++) {
    const chipGeom = new THREE.BoxGeometry(0.038, 0.004, 0.045);
    const chipMesh = new THREE.Mesh(chipGeom, plasticBlackMaterial);
    chipMesh.position.set(0, 0.003, -0.04 + c * 0.055);
    m2SsdGroup.add(chipMesh);
  }
  // Metallic Thermal Label
  const labelGeom = new THREE.BoxGeometry(0.042, 0.005, 0.12);
  const labelMesh = new THREE.Mesh(labelGeom, aluminumMaterial);
  labelMesh.position.set(0, 0.003, 0.01);
  m2SsdGroup.add(labelMesh);

  m2SsdGroup.position.set(-1.18, 0.07, 0.35);
  rootGroup.add(m2SsdGroup);

  // 9. MOTHERBOARD EXPANSION SLOTS (PCIe x16) & DEBUG LEDS
  // PCIe Slot 1 (Top PCIe 5.0 x16 Steel Reinforced)
  const pcie1Geom = new THREE.BoxGeometry(0.018, 0.02, 0.32);
  const pcie1Mesh = new THREE.Mesh(pcie1Geom, aluminumMaterial);
  pcie1Mesh.position.set(-0.06, 0.016, 0.12);
  motherboardGroup.add(pcie1Mesh);

  // PCIe Slot 2
  const pcie2Geom = new THREE.BoxGeometry(0.016, 0.018, 0.3);
  const pcie2Mesh = new THREE.Mesh(pcie2Geom, plasticBlackMaterial);
  pcie2Mesh.position.set(-0.06, 0.015, 0.22);
  motherboardGroup.add(pcie2Mesh);

  // M.2 Slot on Motherboard
  const m2SlotGeom = new THREE.BoxGeometry(0.06, 0.012, 0.018);
  const m2SlotMesh = new THREE.Mesh(m2SlotGeom, blackAluminumMaterial);
  m2SlotMesh.position.set(-0.06, 0.012, 0.04);
  motherboardGroup.add(m2SlotMesh);

  // 4 Motherboard EZ-Debug LEDs (CPU, DRAM, VGA, BOOT)
  const ledGeom = new THREE.BoxGeometry(0.008, 0.006, 0.008);

  const ledMatCpu = new THREE.MeshStandardMaterial({ color: 0x334155, emissive: 0x000000 });
  const debugLedCpu = new THREE.Mesh(ledGeom, ledMatCpu);
  debugLedCpu.position.set(0.3, 0.014, -0.2);
  motherboardGroup.add(debugLedCpu);

  const ledMatDram = new THREE.MeshStandardMaterial({ color: 0x334155, emissive: 0x000000 });
  const debugLedDram = new THREE.Mesh(ledGeom, ledMatDram);
  debugLedDram.position.set(0.3, 0.014, -0.185);
  motherboardGroup.add(debugLedDram);

  const ledMatVga = new THREE.MeshStandardMaterial({ color: 0x334155, emissive: 0x000000 });
  const debugLedVga = new THREE.Mesh(ledGeom, ledMatVga);
  debugLedVga.position.set(0.3, 0.014, -0.17);
  motherboardGroup.add(debugLedVga);

  const ledMatBoot = new THREE.MeshStandardMaterial({ color: 0x334155, emissive: 0x000000 });
  const debugLedBoot = new THREE.Mesh(ledGeom, ledMatBoot);
  debugLedBoot.position.set(0.3, 0.014, -0.155);
  motherboardGroup.add(debugLedBoot);

  // 24-Pin ATX Socket on Motherboard
  const atxSocketGeom = new THREE.BoxGeometry(0.024, 0.026, 0.16);
  const atxSocketMesh = new THREE.Mesh(atxSocketGeom, plasticBlackMaterial);
  atxSocketMesh.position.set(0.32, 0.018, -0.05);
  motherboardGroup.add(atxSocketMesh);

  // 8-Pin CPU EPS Socket (Top Left)
  const cpuSocketPowerGeom = new THREE.BoxGeometry(0.045, 0.025, 0.024);
  const cpuSocketPowerMesh = new THREE.Mesh(cpuSocketPowerGeom, plasticBlackMaterial);
  cpuSocketPowerMesh.position.set(-0.25, 0.018, -0.24);
  motherboardGroup.add(cpuSocketPowerMesh);

  rootGroup.add(motherboardGroup);

  // 10. PC CHASSIS / CASE (Mid-Tower ATX: positioned on the right side of workbench)
  const caseGroup = new THREE.Group();
  caseGroup.position.set(0.7, 0.02, 0);

  const caseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.6 });

  // Chassis Main Frame (Hollowed feel with open side)
  // Back Wall
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.9, 0.8), caseMat);
  backWall.position.set(-0.24, 0.45, 0);
  caseGroup.add(backWall);

  // Rear Wall (with I/O cutouts, expansion slots & 120mm exhaust fan)
  const rearWall = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.9, 0.02), caseMat);
  rearWall.position.set(0, 0.45, -0.4);
  caseGroup.add(rearWall);

  // Front Wall (with mesh)
  const frontWall = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.9, 0.02), caseMat);
  frontWall.position.set(0, 0.45, 0.4);
  caseGroup.add(frontWall);

  // Top Wall (Radiator / Exhaust vent)
  const topWall = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.02, 0.8), caseMat);
  topWall.position.set(0, 0.9, 0);
  caseGroup.add(topWall);

  // Bottom Base
  const bottomWall = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.03, 0.8), caseMat);
  bottomWall.position.set(0, 0.015, 0);
  caseGroup.add(bottomWall);

  // PSU Shroud Chamber (Lower tunnel: 0.48 x 0.22 x 0.8)
  const psuShroudGeom = new THREE.BoxGeometry(0.46, 0.22, 0.78);
  const psuShroudMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6, metalness: 0.4 });
  const psuShroudMesh = new THREE.Mesh(psuShroudGeom, psuShroudMat);
  psuShroudMesh.position.set(0, 0.11, 0);
  caseGroup.add(psuShroudMesh);

  // Motherboard Tray (interior metal plate where standoffs screw in)
  const moboTrayGeom = new THREE.BoxGeometry(0.015, 0.65, 0.74);
  const moboTrayMesh = new THREE.Mesh(moboTrayGeom, caseMat);
  moboTrayMesh.position.set(-0.18, 0.55, 0);
  caseGroup.add(moboTrayMesh);

  // 120mm Rear Exhaust Fan
  const caseExhaustFan = new THREE.Group();
  caseExhaustFan.position.set(-0.05, 0.65, -0.38);
  const exFanFrame = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.025), plasticBlackMaterial);
  caseExhaustFan.add(exFanFrame);
  const exBlades = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.015, 12), plasticBlackMaterial);
  caseExhaustFan.add(exBlades);
  caseGroup.add(caseExhaustFan);

  // Front Panel Power Button
  const powerBtnGeom = new THREE.CylinderGeometry(0.015, 0.015, 0.012, 16);
  const powerBtnMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.4,
    roughness: 0.2,
  });
  const powerButtonMesh = new THREE.Mesh(powerBtnGeom, powerBtnMat);
  powerButtonMesh.rotation.x = Math.PI / 2;
  powerButtonMesh.position.set(0.18, 0.88, 0.41);
  caseGroup.add(powerButtonMesh);

  // I/O Shield Mesh (mounts in rear cutout)
  const ioShieldGeom = new THREE.BoxGeometry(0.01, 0.16, 0.05);
  const ioShieldMesh = new THREE.Mesh(ioShieldGeom, aluminumMaterial);
  ioShieldMesh.position.set(-0.18, 0.62, -0.39);
  ioShieldMesh.visible = false;
  caseGroup.add(ioShieldMesh);

  // Standoffs Group (brass spacers on motherboard tray)
  const standoffGroup = new THREE.Group();
  const standoffPos = [
    [-0.17, 0.78, -0.22],
    [-0.17, 0.78, 0.02],
    [-0.17, 0.78, 0.25],
    [-0.17, 0.55, -0.22],
    [-0.17, 0.55, 0.02],
    [-0.17, 0.55, 0.25],
    [-0.17, 0.32, -0.22],
    [-0.17, 0.32, 0.02],
    [-0.17, 0.32, 0.25],
  ];
  standoffPos.forEach(([x, y, z]) => {
    const sG = new THREE.CylinderGeometry(0.007, 0.007, 0.018, 8);
    sG.rotateZ(Math.PI / 2);
    const sM = new THREE.Mesh(sG, goldPinsMaterial);
    sM.position.set(x, y, z);
    standoffGroup.add(sM);
  });
  standoffGroup.visible = false;
  caseGroup.add(standoffGroup);

  // Motherboard Screws Group (tightened to standoffs)
  const moboScrewsGroup = new THREE.Group();
  standoffPos.forEach(([x, y, z]) => {
    const scrG = new THREE.CylinderGeometry(0.009, 0.009, 0.006, 8);
    scrG.rotateZ(Math.PI / 2);
    const scrM = new THREE.Mesh(scrG, aluminumMaterial);
    scrM.position.set(x + 0.015, y, z);
    moboScrewsGroup.add(scrM);
  });
  moboScrewsGroup.visible = false;
  caseGroup.add(moboScrewsGroup);

  // Tempered Glass Side Panel (Right side: opens/swings or slides)
  const glassGeom = new THREE.BoxGeometry(0.01, 0.88, 0.78);
  const caseGlassPanel = new THREE.Mesh(glassGeom, glassMaterial);
  caseGlassPanel.position.set(0.24, 0.45, 0);
  caseGlassPanel.castShadow = true;
  caseGroup.add(caseGlassPanel);

  rootGroup.add(caseGroup);

  // 11. POWER SUPPLY UNIT (PSU)
  const psuGroup = new THREE.Group();
  const psuBodyGeom = new THREE.BoxGeometry(0.18, 0.16, 0.22);
  const psuBodyMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.6 });
  const psuBodyMesh = new THREE.Mesh(psuBodyGeom, psuBodyMat);
  psuGroup.add(psuBodyMesh);

  // PSU 120mm Intake Fan Grill
  const psuFanBlades = new THREE.Group();
  psuFanBlades.position.set(0, -0.078, 0);
  const psuGrillGeom = new THREE.CylinderGeometry(0.065, 0.065, 0.005, 16);
  const psuGrillMesh = new THREE.Mesh(psuGrillGeom, aluminumMaterial);
  psuFanBlades.add(psuGrillMesh);
  psuGroup.add(psuFanBlades);

  // Positioned on workbench next to case ready to be installed
  psuGroup.position.set(0.05, 0.08, 0.8);
  rootGroup.add(psuGroup);

  // 12. GRAPHICS CARD (GPU: RTX 4060 / 4070 Dual Fan)
  const gpuGroup = new THREE.Group();
  // GPU PCB
  const gpuPcbGeom = new THREE.BoxGeometry(0.012, 0.14, 0.38);
  const gpuPcbMesh = new THREE.Mesh(gpuPcbGeom, pcbMaterial);
  gpuGroup.add(gpuPcbMesh);

  // GPU Heatsink & Metal Backplate
  const gpuShroudGeom = new THREE.BoxGeometry(0.055, 0.135, 0.37);
  const gpuShroudMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.7 });
  const gpuShroudMesh = new THREE.Mesh(gpuShroudGeom, gpuShroudMat);
  gpuShroudMesh.position.set(0.03, 0, 0);
  gpuShroudMesh.castShadow = true;
  gpuGroup.add(gpuShroudMesh);

  // Dual Fans
  const gpuFanBlades = new THREE.Group();
  [-0.09, 0.09].forEach((zOffset) => {
    const fanRing = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.012, 16), plasticBlackMaterial);
    fanRing.rotateZ(Math.PI / 2);
    fanRing.position.set(0.058, 0, zOffset);
    gpuFanBlades.add(fanRing);
  });
  gpuGroup.add(gpuFanBlades);

  // Rear PCI Bracket
  const pciBracketGeom = new THREE.BoxGeometry(0.016, 0.17, 0.035);
  const pciBracketMesh = new THREE.Mesh(pciBracketGeom, aluminumMaterial);
  pciBracketMesh.position.set(0.01, 0.01, -0.2);
  gpuGroup.add(pciBracketMesh);

  // Positioned on workbench
  gpuGroup.position.set(-0.2, 0.08, 0.8);
  rootGroup.add(gpuGroup);

  // 13. CABLES (Spline tube meshes)
  const cableMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.7, metalness: 0.1 });

  // 24-Pin ATX Cable
  const curve24Pin = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.55, 0.12, 0.15),
    new THREE.Vector3(0.68, 0.28, 0.18),
    new THREE.Vector3(0.62, 0.52, -0.05),
  ]);
  const cable24Pin = new THREE.Mesh(new THREE.TubeGeometry(curve24Pin, 20, 0.014, 8, false), cableMat);
  cable24Pin.visible = false;
  rootGroup.add(cable24Pin);

  // CPU 8-Pin EPS Cable
  const curveCpu8 = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.55, 0.12, -0.15),
    new THREE.Vector3(0.52, 0.45, -0.28),
    new THREE.Vector3(0.54, 0.76, -0.25),
  ]);
  const cableCpu8Pin = new THREE.Mesh(new THREE.TubeGeometry(curveCpu8, 20, 0.009, 8, false), cableMat);
  cableCpu8Pin.visible = false;
  rootGroup.add(cableCpu8Pin);

  // GPU PCIe Cable
  const curveGpu = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.6, 0.12, 0.1),
    new THREE.Vector3(0.72, 0.32, 0.12),
    new THREE.Vector3(0.74, 0.42, 0.05),
  ]);
  const cableGpuPcie = new THREE.Mesh(new THREE.TubeGeometry(curveGpu, 20, 0.01, 8, false), cableMat);
  cableGpuPcie.visible = false;
  rootGroup.add(cableGpuPcie);

  // Front Panel Ribbon
  const curveFp = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.85, 0.85, 0.35),
    new THREE.Vector3(0.78, 0.45, 0.32),
    new THREE.Vector3(0.68, 0.25, 0.24),
  ]);
  const cableFrontPanel = new THREE.Mesh(new THREE.TubeGeometry(curveFp, 20, 0.006, 6, false), cableMat);
  cableFrontPanel.visible = false;
  rootGroup.add(cableFrontPanel);

  // 14. VIRTUAL DESK MONITOR (Displays POST and BIOS screen!)
  const monitorGroup = new THREE.Group();
  monitorGroup.position.set(-0.85, 0.45, -0.85);

  // Stand Base & Neck
  const standBase = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.02, 0.25), blackAluminumMaterial);
  standBase.position.y = -0.44;
  monitorGroup.add(standBase);

  const standNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.45, 12), blackAluminumMaterial);
  standNeck.position.set(0, -0.22, -0.05);
  monitorGroup.add(standNeck);

  // Monitor Bezel Frame (24-inch widescreen 16:9)
  const bezelGeom = new THREE.BoxGeometry(0.96, 0.58, 0.035);
  const bezelMesh = new THREE.Mesh(bezelGeom, blackAluminumMaterial);
  bezelMesh.castShadow = true;
  monitorGroup.add(bezelMesh);

  // Monitor Display Screen Canvas
  const monitorCanvas = document.createElement('canvas');
  monitorCanvas.width = 1024;
  monitorCanvas.height = 576;
  const monitorCanvasCtx = monitorCanvas.getContext('2d')!;

  // Initial standby screen
  monitorCanvasCtx.fillStyle = '#05070c';
  monitorCanvasCtx.fillRect(0, 0, 1024, 576);
  monitorCanvasCtx.fillStyle = '#64748b';
  monitorCanvasCtx.font = '24px "JetBrains Mono", monospace';
  monitorCanvasCtx.textAlign = 'center';
  monitorCanvasCtx.fillText('MONITOR LABORATORIUM VOKASI', 512, 260);
  monitorCanvasCtx.font = '18px "JetBrains Mono", monospace';
  monitorCanvasCtx.fillText('[ STANDBY: NO SIGNAL / HDMI INPUT 1 ]', 512, 310);

  const monitorTexture = new THREE.CanvasTexture(monitorCanvas);
  monitorTexture.colorSpace = THREE.SRGBColorSpace;

  const screenGeom = new THREE.PlaneGeometry(0.92, 0.54);
  const screenMat = new THREE.MeshBasicMaterial({
    map: monitorTexture,
  });
  const monitorScreenMesh = new THREE.Mesh(screenGeom, screenMat);
  monitorScreenMesh.position.set(0, 0, 0.019);
  monitorGroup.add(monitorScreenMesh);

  rootGroup.add(monitorGroup);

  return {
    rootGroup,
    workbenchGroup,
    motherboardGroup,
    cpuSocketGroup,
    cpuLever,
    cpuMesh,
    thermalPasteBlob,
    coolerGroup,
    coolerFanBlades,
    ramStick1,
    ramStick2,
    caseGroup,
    caseGlassPanel,
    caseExhaustFan,
    ioShieldMesh,
    standoffGroup,
    moboScrewsGroup,
    psuGroup,
    psuFanBlades,
    m2SsdGroup,
    gpuGroup,
    gpuFanBlades,
    cable24Pin,
    cableCpu8Pin,
    cableGpuPcie,
    cableFrontPanel,
    debugLedCpu,
    debugLedDram,
    debugLedVga,
    debugLedBoot,
    powerButtonMesh,
    monitorGroup,
    monitorScreenMesh,
    monitorCanvas,
    monitorCanvasCtx,
    monitorTexture,
  };
}
