import * as THREE from 'three';
import { ProceduralPCSceneObjects } from './proceduralModels';
import { AssemblyState } from '../types/pc';

export interface TargetLocationInfo {
  pos: THREE.Vector3;
  name: string;
  normal: THREE.Vector3;
  tolerance3D: number;
  pixelTolerance: number;
}

/**
 * Calculates the exact global 3D world coordinates and bounding tolerance
 * for each active assembly step, dynamically adapting to whether the motherboard
 * is on the workbench or mounted inside the casing.
 */
export function getTargetLocation(
  stepId: string,
  pcWorld: ProceduralPCSceneObjects,
  assemblyState: AssemblyState
): TargetLocationInfo {
  const pos = new THREE.Vector3();
  const normal = new THREE.Vector3(0, 1, 0); // Default up-vector
  let name = 'Titik Pemasangan Komponen';
  let tolerance3D = 0.12;
  let pixelTolerance = 30;

  switch (stepId) {
    // --- FASE 1: Preparasi Motherboard (Meja Kerja) ---
    case 'step_cpu_lever_open':
      pcWorld.cpuLever.getWorldPosition(pos);
      pos.y += 0.015;
      name = 'Tuas Pengait Soket CPU';
      tolerance3D = 0.10;
      pixelTolerance = 28;
      break;

    case 'step_cpu_install':
      pcWorld.cpuSocketGroup.getWorldPosition(pos);
      pos.y += 0.025;
      name = 'Soket CPU ZIF (Pin 1 Segitiga Emas)';
      tolerance3D = 0.11;
      pixelTolerance = 30;
      break;

    case 'step_cpu_lever_lock':
      pcWorld.cpuLever.getWorldPosition(pos);
      pos.y += 0.015;
      name = 'Kait Pengunci Tuas CPU';
      tolerance3D = 0.10;
      pixelTolerance = 28;
      break;

    case 'step_thermal_paste':
      pcWorld.cpuSocketGroup.getWorldPosition(pos);
      pos.y += 0.035;
      name = 'Tengah Pelindung Panas (IHS) CPU';
      tolerance3D = 0.09;
      pixelTolerance = 26;
      break;

    case 'step_cooler_mount':
      pcWorld.cpuSocketGroup.getWorldPosition(pos);
      pos.y += 0.085;
      name = 'Dudukan Bracket CPU Cooler';
      tolerance3D = 0.13;
      pixelTolerance = 35;
      break;

    case 'step_cooler_screws':
      pcWorld.cpuSocketGroup.getWorldPosition(pos);
      pos.y += 0.095;
      name = 'Baut Penahan Silang Cooler';
      tolerance3D = 0.12;
      pixelTolerance = 32;
      break;

    case 'step_ram_install':
      if (assemblyState.ramPushStage === 'first_click') {
        // Ujung bawah RAM (Klip Bawah untuk Dual-Click feedback)
        pos.set(0.176, 0.045, 0.10);
        pcWorld.motherboardGroup.localToWorld(pos);
        name = 'Ujung Bawah Slot RAM (Dorong Klip Kedua)';
        tolerance3D = 0.11;
        pixelTolerance = 28;
      } else {
        // Slot RAM DIMM 2 & 4
        pos.set(0.176, 0.045, -0.06);
        pcWorld.motherboardGroup.localToWorld(pos);
        name = 'Slot Memori RAM DIMM 2 & 4';
        tolerance3D = 0.12;
        pixelTolerance = 32;
      }
      break;

    // --- FASE 2: Sasis & Motherboard Mounting ---
    case 'step_case_open':
      pos.set(0.24, 0.55, 0.25);
      pcWorld.caseGroup.localToWorld(pos);
      normal.set(1, 0, 0);
      name = 'Baut & Panel Kaca Tempered Glass';
      tolerance3D = 0.16;
      pixelTolerance = 40;
      break;

    case 'step_io_shield':
      pos.set(-0.18, 0.62, -0.39);
      pcWorld.caseGroup.localToWorld(pos);
      normal.set(0, 0, -1);
      name = 'Cutout Pelat I/O Shield Belakang Casing';
      tolerance3D = 0.12;
      pixelTolerance = 30;
      break;

    case 'step_standoffs':
      pos.set(-0.17, 0.55, 0.02);
      pcWorld.caseGroup.localToWorld(pos);
      normal.set(1, 0, 0);
      name = 'Titik Dudukan Standoff Kuningan Motherboard';
      tolerance3D = 0.14;
      pixelTolerance = 35;
      break;

    case 'step_mobo_place':
      pos.set(-0.17, 0.55, 0.02);
      pcWorld.caseGroup.localToWorld(pos);
      normal.set(1, 0, 0);
      name = 'Tray Sasis Motherboard';
      tolerance3D = 0.16;
      pixelTolerance = 40;
      break;

    case 'step_mobo_screws':
      pos.set(-0.17, 0.55, 0.02);
      pcWorld.caseGroup.localToWorld(pos);
      normal.set(1, 0, 0);
      name = 'Baut Pengencang Motherboard ke Standoff';
      tolerance3D = 0.13;
      pixelTolerance = 32;
      break;

    // --- FASE 3: Power Supply & Storage ---
    case 'step_psu_mount':
      pos.set(0.05, 0.11, -0.22);
      pcWorld.caseGroup.localToWorld(pos);
      name = 'Kompartemen Bawah PSU Shroud';
      tolerance3D = 0.15;
      pixelTolerance = 38;
      break;

    case 'step_psu_screws':
      pos.set(-0.19, 0.11, -0.22);
      pcWorld.caseGroup.localToWorld(pos);
      normal.set(-1, 0, 0);
      name = '4 Baut Belakang Sasis PSU';
      tolerance3D = 0.13;
      pixelTolerance = 32;
      break;

    case 'step_storage_install':
      pos.set(-0.06, 0.022, 0.05);
      pcWorld.motherboardGroup.localToWorld(pos);
      name = 'Slot M.2 NVMe PCIe SSD';
      tolerance3D = 0.10;
      pixelTolerance = 28;
      break;

    case 'step_storage_screw':
      pos.set(-0.06, 0.022, 0.14);
      pcWorld.motherboardGroup.localToWorld(pos);
      name = 'Baut Penahan M.2 NVMe';
      tolerance3D = 0.09;
      pixelTolerance = 26;
      break;

    // --- FASE 4: Ekspansi & Pengkabelan ---
    case 'step_pci_bracket':
      pos.set(-0.18, 0.49, 0.06);
      pcWorld.caseGroup.localToWorld(pos);
      normal.set(-1, 0, 0);
      name = 'Pelat Braket Ekspansi PCIe Casing';
      tolerance3D = 0.12;
      pixelTolerance = 30;
      break;

    case 'step_gpu_install':
      pos.set(-0.06, 0.025, 0.12);
      pcWorld.motherboardGroup.localToWorld(pos);
      name = 'Slot PCIe 5.0 x16 Utama GPU';
      tolerance3D = 0.14;
      pixelTolerance = 35;
      break;

    case 'step_gpu_screw':
      pos.set(-0.18, 0.49, -0.14);
      pcWorld.caseGroup.localToWorld(pos);
      normal.set(-1, 0, 0);
      name = 'Baut Braket Pengunci GPU';
      tolerance3D = 0.11;
      pixelTolerance = 28;
      break;

    case 'step_cable_24pin':
      pos.set(0.32, 0.028, 0.08);
      pcWorld.motherboardGroup.localToWorld(pos);
      name = 'Port Catu Daya ATX 24-Pin';
      tolerance3D = 0.11;
      pixelTolerance = 28;
      break;

    case 'step_cable_cpu8pin':
      pos.set(-0.25, 0.028, -0.22);
      pcWorld.motherboardGroup.localToWorld(pos);
      name = 'Soket Daya CPU 8-Pin (EPS 12V)';
      tolerance3D = 0.11;
      pixelTolerance = 28;
      break;

    case 'step_cable_gpu':
      if (assemblyState.gpuInstalled) {
        pos.set(0.04, 0.06, 0.12);
        pcWorld.gpuGroup.localToWorld(pos);
      } else {
        pos.set(0.74, 0.42, 0.05);
      }
      name = 'Konektor Daya PCIe 8-Pin GPU';
      tolerance3D = 0.12;
      pixelTolerance = 30;
      break;

    case 'step_cable_frontpanel':
      pos.set(0.32, 0.025, 0.22);
      pcWorld.motherboardGroup.localToWorld(pos);
      name = 'Pin Header Front Panel (PWR_SW)';
      tolerance3D = 0.10;
      pixelTolerance = 28;
      break;

    case 'step_case_close':
      pos.set(0.24, 0.55, 0.25);
      pcWorld.caseGroup.localToWorld(pos);
      normal.set(1, 0, 0);
      name = 'Panel Kaca Tempered Glass Casing';
      tolerance3D = 0.16;
      pixelTolerance = 40;
      break;

    case 'step_post_power':
      pcWorld.powerButtonMesh.getWorldPosition(pos);
      normal.set(0, 0, 1);
      name = 'Tombol Daya (Power Button) Casing';
      tolerance3D = 0.10;
      pixelTolerance = 28;
      break;

    default:
      pcWorld.motherboardGroup.getWorldPosition(pos);
      name = 'Komponen PC';
      tolerance3D = 0.15;
      pixelTolerance = 35;
      break;
  }

  return { pos, name, normal, tolerance3D, pixelTolerance };
}
