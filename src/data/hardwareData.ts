import { AssemblyStep, HardwareScenario, HardwareItem } from '../types/pc';

export const ASSEMBLY_STEPS: AssemblyStep[] = [
  // FASE 1: Meja Kerja (Mainboard Preparation)
  {
    id: 'step_cpu_lever_open',
    phase: 1,
    phaseTitle: 'Fase 1: Preparasi Motherboard (Di Luar Casing)',
    stepNumber: 1,
    title: 'Buka Tuas Soket CPU',
    instruction: 'Buka tuas pengait (retention lever) soket CPU dan angkat pelat penutup (load plate).',
    sopWarning: 'SOP Wajib: Lakukan perakitan motherboard awal di atas mat antistatis atau kotak motherboard, jangan di atas karpet berbulu atau kantong antistatis konduktif!',
    toolRequired: 'hands',
    targetSlot: 'cpu_socket_lever'
  },
  {
    id: 'step_cpu_install',
    phase: 1,
    phaseTitle: 'Fase 1: Preparasi Motherboard (Di Luar Casing)',
    stepNumber: 2,
    title: 'Pasang Prosesor (CPU & Orientasi Pin 1)',
    instruction: 'Posisikan CPU sejajar dengan soket. Cocokkan tanda sudut segitiga emas (Pin 1) pada prosesor dengan tanda panah di sudut soket LGA/AM motherboard.',
    sopWarning: 'PERHATIAN KRITIS: Jangan menekan paksa CPU! CPU harus jatuh dengan lembut karena gravitasi (Zero Insertion Force / ZIF). Jika orientasi terbalik, tuas pengait tidak bisa dikunci demi melindungi pin soket.',
    toolRequired: 'hands',
    targetSlot: 'cpu_socket'
  },
  {
    id: 'step_cpu_lever_lock',
    phase: 1,
    phaseTitle: 'Fase 1: Preparasi Motherboard (Di Luar Casing)',
    stepNumber: 3,
    title: 'Kunci Tuas Pengait Soket CPU',
    instruction: 'Pastikan segitiga emas telah cocok dengan tanda panah soket, lalu tutup load plate dan tekan tuas pengait hingga terselip di klip penahan logam.',
    sopWarning: 'Pengaman Fisik: Jika posisi CPU terbalik, tuas pengait akan macet dan menolak dikunci! Putar orientasi CPU hingga sejajar sempurna (0°).',
    toolRequired: 'hands',
    targetSlot: 'cpu_socket_lever'
  },
  {
    id: 'step_thermal_paste',
    phase: 1,
    phaseTitle: 'Fase 1: Preparasi Motherboard (Di Luar Casing)',
    stepNumber: 4,
    title: 'Oleskan Pasta Termal (Thermal Compound)',
    instruction: 'Aplikasikan pasta termal seukuran biji jagung / kacang polong (pea-sized dot) tepat di bagian tengah pelindung panas (IHS) CPU.',
    sopWarning: 'Jangan mengoleskan terlalu banyak pasta termal karena dapat meluber ke sirkuit motherboard dan menyebabkan korsleting!',
    toolRequired: 'thermal_paste',
    targetSlot: 'cpu_ihs'
  },
  {
    id: 'step_cooler_mount',
    phase: 1,
    phaseTitle: 'Fase 1: Preparasi Motherboard (Di Luar Casing)',
    stepNumber: 5,
    title: 'Pasang Heatsink CPU Cooler',
    instruction: 'Letakkan CPU Cooler tegak lurus di atas prosesor agar pasta termal tersebar merata.',
    sopWarning: 'Pastikan lapisan plastik pelindung dasar tembaga cooler (peel sticker) telah dilepas sebelum dipasang!',
    toolRequired: 'hands',
    targetSlot: 'cpu_cooler_mount'
  },
  {
    id: 'step_cooler_screws',
    phase: 1,
    phaseTitle: 'Fase 1: Preparasi Motherboard (Di Luar Casing)',
    stepNumber: 6,
    title: 'Kencangkan Baut CPU Cooler',
    instruction: 'Gunakan obeng presisi untuk mengencangkan 4 baut cooler secara menyilang (diagonal X pattern).',
    sopWarning: 'Kencangkan baut secara bertahap dalam pola diagonal agar tekanan permukaan pendingin merata di atas chip CPU.',
    toolRequired: 'screwdriver',
    targetSlot: 'cooler_screws'
  },
  {
    id: 'step_ram_install',
    phase: 1,
    phaseTitle: 'Fase 1: Preparasi Motherboard (Di Luar Casing)',
    stepNumber: 7,
    title: 'Pasang Modul RAM (Uji Dorong Klip Ganda)',
    instruction: 'Buka klip pengunci DIMM Slot 2 & Slot 4. Cocokkan lekukan (notch) modul RAM dan tekan kedua ujungnya hingga berbunyi "klik ganda" (dual-click).',
    sopWarning: 'Uji Dorong RAM: Siswa harus memastikan klip pengunci di kedua ujung slot otomatis terdorong dan berbunyi klik ganda. Jika hanya menancap sebelah, saat dites nanti komputer akan gagal booting!',
    toolRequired: 'hands',
    targetSlot: 'ram_slots'
  },

  // FASE 2: Sasis & Motherboard Mounting
  {
    id: 'step_case_open',
    phase: 2,
    phaseTitle: 'Fase 2: Sasis & Motherboard Mounting',
    stepNumber: 8,
    title: 'Buka Panel Samping Casing (Tempered Glass)',
    instruction: 'Lepas baut panel samping casing dan simpan panel kaca di tempat datar yang aman.',
    sopWarning: 'Jangan meletakkan tempered glass langsung di atas lantai keramik karena tegangan termal dapat menyebabkan kaca pecah!',
    toolRequired: 'hands',
    targetSlot: 'case_side_panel'
  },
  {
    id: 'step_io_shield',
    phase: 2,
    phaseTitle: 'Fase 2: Sasis & Motherboard Mounting',
    stepNumber: 9,
    title: 'Pasang Pelat I/O Shield',
    instruction: 'Pasang pelat logam I/O Shield dari bagian dalam casing ke arah luar hingga keempat sudutnya mengunci mantap.',
    sopWarning: 'Hati-hati dengan tepi logam I/O Shield yang tajam. Jika motherboard memiliki integrated I/O shield, lewati langkah ini.',
    toolRequired: 'hands',
    targetSlot: 'case_io_slot'
  },
  {
    id: 'step_standoffs',
    phase: 2,
    phaseTitle: 'Fase 2: Sasis & Motherboard Mounting',
    stepNumber: 10,
    title: 'Pasang Standoff / Spacer Motherboard',
    instruction: 'Pasang baut standoff kuningan pada motherboard tray sesuai dengan ukuran form factor (ATX: 9 titik standoff).',
    sopWarning: 'BAHAYA KORSLETING: Jangan memasang standoff di titik yang tidak memiliki lubang baut pada motherboard karena dapat menyentuh jalur PCB dan memicu konsleting fatal!',
    toolRequired: 'screwdriver',
    targetSlot: 'case_standoffs'
  },
  {
    id: 'step_mobo_place',
    phase: 2,
    phaseTitle: 'Fase 2: Sasis & Motherboard Mounting',
    stepNumber: 11,
    title: 'Masukkan Motherboard ke Casing',
    instruction: 'Pegang heatsink motherboard dan masukkan secara miring agar port belakang masuk pas ke lubang I/O shield, lalu rebahkan di atas standoff.',
    sopWarning: 'Pegang motherboard hanya pada bagian tepi PCB atau heatsink aluminium, hindari menyentuh komponen kapasitor kecil.',
    toolRequired: 'hands',
    targetSlot: 'case_mobo_tray'
  },
  {
    id: 'step_mobo_screws',
    phase: 2,
    phaseTitle: 'Fase 2: Sasis & Motherboard Mounting',
    stepNumber: 12,
    title: 'Kencangkan Baut Motherboard',
    instruction: 'Kencangkan baut motherboard pada seluruh titik standoff dengan torsi secukupnya (jangan terlalu kencang).',
    sopWarning: 'Gunakan baut berulir halus khusus standoff. Mengencangkan baut terlalu keras dapat meretakkan lapisan tembaga multi-layer PCB.',
    toolRequired: 'screwdriver',
    targetSlot: 'mobo_screws'
  },

  // FASE 3: Power Supply & Storage
  {
    id: 'step_psu_mount',
    phase: 3,
    phaseTitle: 'Fase 3: Power Supply & Storage',
    stepNumber: 13,
    title: 'Pasang Power Supply Unit (PSU)',
    instruction: 'Masukkan unit PSU ke dalam kompartemen PSU shroud bawah dengan orientasi kipas menghadap ke ventilasi debu dasar sasis.',
    sopWarning: 'Orientasi Kipas: Menghadap ke bawah (jika lantai casing memiliki filter debu) agar menarik udara dingin dari luar sasis secara terisolasi.',
    toolRequired: 'hands',
    targetSlot: 'psu_bay'
  },
  {
    id: 'step_psu_screws',
    phase: 3,
    phaseTitle: 'Fase 3: Power Supply & Storage',
    stepNumber: 14,
    title: 'Kencangkan 4 Baut Sasis PSU',
    instruction: 'Kencangkan 4 baut sasis heksagonal standar pada bagian belakang unit catu daya.',
    sopWarning: 'Pastikan sakelar I/O pada PSU berada pada posisi "O" (OFF) selama proses perakitan kabel.',
    toolRequired: 'screwdriver',
    targetSlot: 'psu_screws'
  },
  {
    id: 'step_storage_install',
    phase: 3,
    phaseTitle: 'Fase 3: Power Supply & Storage',
    stepNumber: 15,
    title: 'Pasang SSD M.2 NVMe',
    instruction: 'Masukkan SSD M.2 dengan sudut kemiringan 30 derajat ke slot M.2 pertama (Gen 4/5 langsung ke CPU), lalu tekan perlahan ke bawah.',
    sopWarning: 'Slot M.2 teratas biasanya terhubung langsung ke jalur PCIe prosesor tanpa melalui chipset, memberikan latency terendah.',
    toolRequired: 'hands',
    targetSlot: 'm2_slot'
  },
  {
    id: 'step_storage_screw',
    phase: 3,
    phaseTitle: 'Fase 3: Power Supply & Storage',
    stepNumber: 16,
    title: 'Kencangkan Baut Penahan SSD M.2 / Heatsink',
    instruction: 'Gunakan obeng presisi untuk mengencangkan baut kecil M.2 atau pasang kembali pelindung heatsink M.2 motherboard.',
    sopWarning: 'Hati-hati dengan baut mini M.2 agar tidak jatuh dan terselip di bawah sirkuit motherboard.',
    toolRequired: 'screwdriver',
    targetSlot: 'm2_screw'
  },

  // FASE 4: Ekspansi & Pengkabelan (Expansion & Cabling)
  {
    id: 'step_pci_bracket',
    phase: 4,
    phaseTitle: 'Fase 4: Ekspansi & Pengkabelan',
    stepNumber: 17,
    title: 'Lepas Penutup Slot PCIe Belakang',
    instruction: 'Buka dan lepas 2 pelat penutup slot ekspansi casing yang sejajar dengan slot PCIe x16 utama.',
    sopWarning: 'Lepas penutup slot sebelum memasang GPU agar kartu grafis dapat masuk bebas tanpa tergores.',
    toolRequired: 'screwdriver',
    targetSlot: 'pci_brackets'
  },
  {
    id: 'step_gpu_install',
    phase: 4,
    phaseTitle: 'Fase 4: Ekspansi & Pengkabelan',
    stepNumber: 18,
    title: 'Pasang Kartu Grafis (GPU)',
    instruction: 'Sejajarkan konektor PCIe x16 GPU dengan slot teratas motherboard, dorong kuat hingga klip pengunci PCIe berbunyi klik.',
    sopWarning: 'Pastikan klip pengait PCIe di ujung kanan slot terbuka sebelum mendorong kartu grafis masuk.',
    toolRequired: 'hands',
    targetSlot: 'pcie_slot'
  },
  {
    id: 'step_gpu_screw',
    phase: 4,
    phaseTitle: 'Fase 4: Ekspansi & Pengkabelan',
    stepNumber: 19,
    title: 'Kencangkan Baut Braket GPU',
    instruction: 'Kencangkan 2 baut sasis pada braket logam GPU untuk mencegah GPU melorot (GPU sag) dan merusak slot PCIe.',
    sopWarning: 'Baut braket menahan bobot heatsink GPU yang berat agar konektor PCIe tidak bengkok saat dipindahkan.',
    toolRequired: 'screwdriver',
    targetSlot: 'gpu_screws'
  },
  {
    id: 'step_cable_24pin',
    phase: 4,
    phaseTitle: 'Fase 4: Ekspansi & Pengkabelan',
    stepNumber: 20,
    title: 'Colok Kabel Daya ATX 24-Pin',
    instruction: 'Tarik kabel daya utama 24-pin melalui grommet kabel samping dan colokkan ke port 24-pin motherboard hingga klip plastik mengunci.',
    sopWarning: 'Konektor 24-pin memiliki kait plastik pengunci. Pastikan kait tersebut terpasang rapat tanpa celah!',
    toolRequired: 'cable',
    targetSlot: 'atx_24pin_port'
  },
  {
    id: 'step_cable_cpu8pin',
    phase: 4,
    phaseTitle: 'Fase 4: Ekspansi & Pengkabelan',
    stepNumber: 21,
    title: 'Colok Kabel Daya CPU 8-Pin (EPS 12V)',
    instruction: 'Arahkan kabel CPU EPS 8-pin (atau 4+4 pin) melalui lubang sudut kiri atas sasis dan colokkan ke soket CPU power.',
    sopWarning: 'KESALAHAN FATAL UMUM: Jangan tertukar antara kabel CPU 8-pin (EPS) dengan kabel PCIe 8-pin GPU! Keduanya memiliki polaritas pinout berbeda.',
    toolRequired: 'cable',
    targetSlot: 'cpu_8pin_port'
  },
  {
    id: 'step_cable_gpu',
    phase: 4,
    phaseTitle: 'Fase 4: Ekspansi & Pengkabelan',
    stepNumber: 22,
    title: 'Colok Kabel Daya PCIe GPU',
    instruction: 'Colokkan kabel daya PCIe 8-pin (atau 6+2 pin) dari PSU langsung ke konektor daya kartu grafis.',
    sopWarning: 'Pastikan konektor menancap penuh. Konektor GPU yang longgar dapat memicu kenaikan suhu lokal dan melelehkan soket.',
    toolRequired: 'cable',
    targetSlot: 'gpu_power_port'
  },
  {
    id: 'step_cable_frontpanel',
    phase: 4,
    phaseTitle: 'Fase 4: Ekspansi & Pengkabelan',
    stepNumber: 23,
    title: 'Colok Kabel Front Panel (Power Switch)',
    instruction: 'Hubungkan kabel konektor Power Switch (PWR_SW), Reset Switch, dan LED dari sasis ke pin header Front Panel di sudut kanan bawah motherboard.',
    sopWarning: 'Periksa buku manual motherboard untuk polaritas pin (+ / -). Pin Power SW tidak memiliki polaritas khusus, namun LED memiliki kutub positif dan negatif.',
    toolRequired: 'cable',
    targetSlot: 'front_panel_header'
  },
  {
    id: 'step_case_close',
    phase: 4,
    phaseTitle: 'Fase 4: Ekspansi & Pengkabelan',
    stepNumber: 24,
    title: 'Tutup & Kencangkan Panel Tempered Glass',
    instruction: 'Rapikan kabel-kabel di bagian belakang, pasang kembali panel kaca samping sasis dan kencangkan baut tangan (thumbscrews).',
    sopWarning: 'Pastikan tidak ada bilah kabel yang terhimpit atau terjepit rangka logam sasis sebelum menutup panel.',
    toolRequired: 'hands',
    targetSlot: 'case_side_panel'
  },
  {
    id: 'step_post_power',
    phase: 4,
    phaseTitle: 'Fase 4: Pengujian & Validasi Nyala (POST)',
    stepNumber: 25,
    title: 'Tekan Tombol Power & Lakukan Uji POST',
    instruction: 'Nyalakan sakelar PSU, lalu tekan tombol Power pada sasis casing untuk memulai proses Power-On Self-Test (POST) pada monitor laboratorium.',
    sopWarning: 'Amati indikator Debug LED motherboard (CPU, DRAM, VGA, BOOT) serta dengarkan kode beep untuk memastikan seluruh subsistem hardware lolos POST.',
    toolRequired: 'hands',
    targetSlot: 'case_power_button'
  }
];

export const HARDWARE_SCENARIOS: HardwareScenario[] = [
  {
    id: 'scenario_esports',
    name: 'PC Gaming E-Sports (AMD AM5 + RTX)',
    targetUser: 'Komputer Praktikum Rekomendasi Vokasi Multimedia / Game Dev',
    budgetEst: 'Rp 14.500.000',
    description: 'Konfigurasi bertenaga tinggi untuk kompetisi gaming & animasi 3D modern menggunakan arsitektur soket AMD AM5 dan RAM DDR5 kecepatan tinggi.',
    totalTdp: 450,
    components: {
      cpu: {
        id: 'cpu_r5_7600',
        name: 'AMD Ryzen 5 7600 (6-Core 12-Thread, 5.1GHz)',
        category: 'cpu',
        socket: 'AM5',
        tdp: 65,
        description: 'Prosesor generasi Zen 4 dengan grafis terintegrasi RDNA 2 dan efisiensi daya luar biasa.',
        sopNotes: 'Soket AM5 menggunakan pin LGA pada motherboard. Pastikan segitiga emas di sudut CPU menghadap penanda soket.',
        specs: { Arsitektur: 'Zen 4 (5nm)', Soket: 'AM5 (LGA1718)', Cache: '32MB L3', TDP: '65 Watt' }
      },
      motherboard: {
        id: 'mobo_b650_gaming',
        name: 'ASRock B650 Pro RS (Socket AM5, DDR5)',
        category: 'motherboard',
        supportedSocket: 'AM5',
        supportedMemory: 'DDR5',
        description: 'Motherboard ATX tangguh dengan 14-phase VRM, slot PCIe 5.0 M.2, dan 4x Debug Diagnostic LED terintegrasi.',
        sopNotes: 'Memiliki 4 slot DIMM DDR5. Untuk konfigurasi 2 keping RAM, gunakan slot DDR5_A2 dan DDR5_B2.',
        specs: { FormFactor: 'ATX', Soket: 'AM5', RAM: '4x DDR5 Up to 6400MHz', Storage: '3x M.2 NVMe' }
      },
      ram: {
        id: 'ram_ddr5_16gb',
        name: 'Corsair Vengeance RGB 16GB (2x8GB) DDR5-5600MHz',
        category: 'ram',
        memoryType: 'DDR5',
        description: 'Dua keping modul memori DDR5 berkecepatan tinggi dengan aluminium heatspreader dan profil AMD EXPO.',
        sopNotes: 'DDR5 memiliki letak notch yang berbeda dari DDR4 dan tidak kompatibel secara fisik.',
        specs: { Kapasitas: '16GB (2x 8GB)', Frekuensi: '5600 MT/s', Saluran: 'Dual-Channel (128-bit)', Voltase: '1.25V' }
      },
      cooler: {
        id: 'cooler_deepcool_ak400',
        name: 'DeepCool AK400 Digital Tower Air Cooler',
        category: 'cooler',
        maxCoolingTdp: 220,
        description: 'Pendingin menara dengan 4 pipa kalor tembaga nickel-plated dan kipas FDB hening 120mm.',
        sopNotes: 'Lepas stiker plastik pelindung di dasar heatsink sebelum mengoles pasta termal!',
        specs: { Tipe: 'Tower Air Cooler', PipaPanas: '4x 6mm Copper', Kipas: '120mm PWM', KapasitasTDP: '220W' }
      },
      gpu: {
        id: 'gpu_rtx_4060',
        name: 'NVIDIA GeForce RTX 4060 8GB GDDR6',
        category: 'gpu',
        tdp: 115,
        description: 'Kartu grafis arsitektur Ada Lovelace dengan teknologi DLSS 3 Frame Generation dan efisiensi daya tinggi.',
        sopNotes: 'Memerlukan 1x kabel daya PCIe 8-pin. Pastikan terpasang di slot PCIe x16 paling atas.',
        specs: { VRAM: '8GB GDDR6', BusWidth: '128-bit', Konektor: '1x 8-pin PCIe', RekomendasiPSU: '550W' }
      },
      storage: {
        id: 'ssd_m2_1tb',
        name: 'Kingston KC3000 PCIe 4.0 NVMe M.2 1TB',
        category: 'storage',
        description: 'Media penyimpanan ultra-cepat dengan kecepatan baca hingga 7000 MB/s untuk loading instan.',
        sopNotes: 'Pasang heatsink pelindung M.2 bawaan motherboard untuk mencegah throttling termal saat transfer file berat.',
        specs: { Antarmuka: 'PCIe 4.0 x4 NVMe', KecepatanBaca: '7.000 MB/s', KecepatanTulis: '6.000 MB/s', Kapasitas: '1TB' }
      },
      psu: {
        id: 'psu_650w_gold',
        name: 'Cooler Master MWE 650W 80+ Gold V2',
        category: 'psu',
        wattage: 650,
        description: 'Unit catu daya efisiensi tinggi bersertifikasi 80 Plus Gold dengan kapasitor tahan panas industri.',
        sopNotes: 'Daya 650W sangat aman untuk total konsumsi daya sistem ~300W, memberikan efisiensi puncak pada kurva beban 50%.',
        specs: { Daya: '650 Watt', Efisiensi: '80 Plus Gold (90%)', Proteksi: 'OVP/OPP/SCP/UVP/OTP', Kipas: '120mm HDB' }
      }
    }
  },
  {
    id: 'scenario_school_lab',
    name: 'PC Lab Komputer & Administrasi Sekolah (Intel LGA1700)',
    targetUser: 'Komputer Standar Laboratorium Komputer TKJ / Rekayasa Perangkat Lunak',
    budgetEst: 'Rp 6.800.000',
    description: 'PC efisien dan stabil untuk kebutuhan pengetikan, pemrograman dasar, dan simulasi jaringan sekolah.',
    totalTdp: 240,
    components: {
      cpu: {
        id: 'cpu_i3_12100',
        name: 'Intel Core i3-12100 (4-Core 8-Thread, 4.3GHz)',
        category: 'cpu',
        socket: 'LGA1700',
        tdp: 60,
        description: 'Prosesor 4-core performa tinggi arsitektur Alder Lake dengan grafis terintegrasi Intel UHD 730.',
        sopNotes: 'Soket LGA1700 berbentuk persegi panjang. Pasang dengan menyelaraskan notch di kedua sisi CPU.',
        specs: { Arsitektur: 'Alder Lake (Intel 7)', Soket: 'LGA1700', Cache: '12MB L3', TDP: '60 Watt' }
      },
      motherboard: {
        id: 'mobo_h610_m',
        name: 'MSI PRO H610M-E (Socket LGA1700, DDR4)',
        category: 'motherboard',
        supportedSocket: 'LGA1700',
        supportedMemory: 'DDR4',
        description: 'Motherboard hemat dan andal dengan slot PCIe 4.0 baja berlapis dan fitur EZ Debug LED.',
        sopNotes: 'Motherboard ini hanya mendukung modul RAM DDR4. Memiliki 2 slot DIMM.',
        specs: { FormFactor: 'Micro-ATX', Soket: 'LGA1700', RAM: '2x DDR4 Up to 3200MHz', Storage: '1x M.2 NVMe' }
      },
      ram: {
        id: 'ram_ddr4_16gb',
        name: 'Kingston Fury Beast 16GB (2x8GB) DDR4-3200MHz',
        category: 'ram',
        memoryType: 'DDR4',
        description: 'Memori DDR4 hemat daya dengan latency rendah CL16 dan heatsink hitam bergaya ramping.',
        sopNotes: 'Pastikan klip pengunci slot DIMM terbuka sebelum memasukkan modul DDR4.',
        specs: { Kapasitas: '16GB (2x 8GB)', Frekuensi: '3200 MHz', Saluran: 'Dual-Channel', Voltase: '1.35V' }
      },
      cooler: {
        id: 'cooler_intel_stock',
        name: 'Intel Laminar RM1 Stock Cooler',
        category: 'cooler',
        maxCoolingTdp: 85,
        description: 'Pendingin bawaan Intel dengan mekanisme push-pin pengunci cepat dan pasta termal pre-applied.',
        sopNotes: 'Tekan push-pin secara diagonal hingga mengunci dengan bunyi klik pada lubang motherboard.',
        specs: { Tipe: 'Top-Down Push Pin', Material: 'Aluminium Billet', Kipas: '90mm PWM', KapasitasTDP: '85W' }
      },
      gpu: {
        id: 'gpu_igpu_uhd',
        name: 'Intel UHD Graphics 730 (Integrated iGPU)',
        category: 'gpu',
        tdp: 15,
        description: 'Unit pengolah grafis terintegrasi di dalam prosesor Intel, hemat daya dan mencukupi untuk monitor lab.',
        sopNotes: 'iGPU menggunakan memori sistem terbagi (shared RAM). Kabel HDMI langsung dicolokkan ke motherboard.',
        specs: { Tipe: 'Integrated GPU', Frekuensi: '1.40 GHz', DukunganLayar: 'HDMI 2.1 & DisplayPort', Daya: 'Terintegrasi di CPU' }
      },
      storage: {
        id: 'ssd_m2_500gb',
        name: 'Crucial P3 500GB PCIe 3.0 NVMe M.2',
        category: 'storage',
        description: 'Penyimpanan NVMe 500GB tahan banting untuk boot OS instan dalam waktu kurang dari 8 detik.',
        sopNotes: 'Kencangkan baut penahan M.2 dengan obeng magnetik kecil.',
        specs: { Antarmuka: 'PCIe 3.0 x4', KecepatanBaca: '3.500 MB/s', KecepatanTulis: '1.900 MB/s', Kapasitas: '500GB' }
      },
      psu: {
        id: 'psu_450w_bronze',
        name: 'FSP HV PRO 450W 80+ Bronze',
        category: 'psu',
        wattage: 450,
        description: 'Catu daya efisiensi tinggi standar lab dengan proteksi lonjakan tegangan PLN terpadu.',
        sopNotes: 'Pastikan kabel 24-pin dan CPU 8-pin terpasang sempurna.',
        specs: { Daya: '450 Watt', Efisiensi: '80 Plus Bronze (85%)', Proteksi: 'OVP/OPP/SCP', Kipas: '120mm Sleeve' }
      }
    }
  },
  {
    id: 'scenario_workstation',
    name: 'PC Workstation 3D & AI Rendering (Intel i7 + RTX 4070 Ti)',
    targetUser: 'Komputer Praktikum Kelas Tinggi Animasi 3D & Pemodelan Arsitektur',
    budgetEst: 'Rp 32.000.000',
    description: 'Monster komputasi untuk simulasi fisika 3D, rendering Blender, dan pelatihan model machine learning.',
    totalTdp: 680,
    components: {
      cpu: {
        id: 'cpu_i7_14700k',
        name: 'Intel Core i7-14700K (20-Core 28-Thread, 5.6GHz)',
        category: 'cpu',
        socket: 'LGA1700',
        tdp: 253,
        description: 'Prosesor 20 inti (8 Performance-cores + 12 Efficient-cores) bertenaga monster untuk multi-tasking tanpa henti.',
        sopNotes: 'Memiliki daya puncak hingga 253 Watt! Wajib menggunakan pendingin AIO cair atau pendingin udara ganda berkualitas tinggi.',
        specs: { Arsitektur: 'Raptor Lake Refresh', Soket: 'LGA1700', Inti: '20 Cores (8P + 12E)', TDPPuncak: '253 Watt' }
      },
      motherboard: {
        id: 'mobo_z790_pro',
        name: 'MSI MAG Z790 Tomahawk WiFi (Socket LGA1700, DDR5)',
        category: 'motherboard',
        supportedSocket: 'LGA1700',
        supportedMemory: 'DDR5',
        description: 'Motherboard kelas atas dengan 16+1+1 Mirrored Power Arrangement dan heatsink pendingin VRM berbobot 1.2kg.',
        sopNotes: 'Mendukung kecepatan DDR5 hingga 7200+ MHz serta dilengkapi tombol Flash BIOS terpisah.',
        specs: { FormFactor: 'ATX', Soket: 'LGA1700', RAM: '4x DDR5 Up to 7200MHz', Fitur: 'WiFi 6E + 2.5G LAN' }
      },
      ram: {
        id: 'ram_ddr5_32gb',
        name: 'G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5-6000MHz',
        category: 'ram',
        memoryType: 'DDR5',
        description: 'Memori berperforma tinggi dengan IC terpilih untuk stabilitas render berat berjam-jam.',
        sopNotes: 'Pasang pada slot DDR5_2 dan DDR5_4 untuk stabilitas profil XMP 3.0.',
        specs: { Kapasitas: '32GB (2x 16GB)', Frekuensi: '6000 MT/s', Timings: 'CL30-38-38-96', Voltase: '1.35V' }
      },
      cooler: {
        id: 'cooler_aio_360',
        name: 'Liquid Cooler 240mm Dual-Fan ARGB',
        category: 'cooler',
        maxCoolingTdp: 300,
        description: 'Sistem pendingin cair tertutup (All-In-One Liquid Cooler) dengan radiator 240mm dan pompa berkecepatan 3100 RPM.',
        sopNotes: 'Pasang waterblock tepat di atas prosesor setelah pasta termal teroles. Kencangkan baut ibu jari dengan pola silang.',
        specs: { Tipe: 'AIO Liquid Cooler', Radiator: '240mm Aluminium', Pompa: '3100 RPM Low-Noise', KapasitasTDP: '300W' }
      },
      gpu: {
        id: 'gpu_rtx_4070ti',
        name: 'NVIDIA GeForce RTX 4070 Ti 12GB GDDR6X',
        category: 'gpu',
        tdp: 285,
        description: 'Akselerator visual kelas profesional dengan 7680 CUDA cores dan tensor cores generasi ke-4.',
        sopNotes: 'Wajib menggunakan adapter kabel daya 12VHPWR 16-pin atau 2x kabel PCIe 8-pin terpisah.',
        specs: { VRAM: '12GB GDDR6X', MemoryBus: '192-bit', Konektor: '12VHPWR (16-Pin)', RekomendasiPSU: '750W' }
      },
      storage: {
        id: 'ssd_m2_2tb',
        name: 'Samsung 990 PRO 2TB PCIe 4.0 NVMe M.2',
        category: 'storage',
        description: 'SSD kasta tertinggi industri dengan kecepatan baca acak 1.400.000 IOPS untuk database dan proyek CAD besar.',
        sopNotes: 'Pasang heatsink pelindung M.2 Shield Frozr bawaan motherboard untuk mencegah panas berlebih.',
        specs: { Antarmuka: 'PCIe 4.0 x4', KecepatanBaca: '7.450 MB/s', KecepatanTulis: '6.900 MB/s', Kapasitas: '2TB' }
      },
      psu: {
        id: 'psu_850w_gold',
        name: 'Corsair RM850x 850W 80+ Gold Fully Modular',
        category: 'psu',
        wattage: 850,
        description: 'Catu daya fully modular dengan kapasitor industri Jepang 105°C dan mode pendinginan Zero-RPM pada beban rendah.',
        sopNotes: 'Hubungkan hanya kabel-kabel modular yang dibutuhkan untuk menjaga aliran sirkulasi udara sasis tetap bersih.',
        specs: { Daya: '850 Watt', Efisiensi: '80 Plus Gold', TipeKabel: 'Fully Modular', Garansi: '10 Tahun Industri' }
      }
    }
  }
];

export const TROUBLESHOOT_PRESETS = [
  {
    id: 'fault_cpu_power_missing',
    title: 'PC Gagal Boot: Indikator CPU LED Merah',
    scenarioDescription: 'Siswa baru saja menyelesaikan rakitan PC gaming, namun ketika tombol power ditekan, lampu motherboard menyala sebentar lalu mati dan Debug LED merah pada CPU terus menyala. Tidak ada tampilan di layar monitor.',
    faultConfig: {
      cableCpu8PinConnected: false, // kabel CPU 8-pin lepas!
      errorMessage: 'Kabel Daya Tambahan CPU 8-Pin (EPS 12V) belum tercolok!',
      errorSolution: 'Colokkan kabel CPU 8-pin dari power supply ke soket di sudut kiri atas motherboard.',
      debugLed: 'cpu',
      beep: 'cpu_fault'
    }
  },
  {
    id: 'fault_ram_loose',
    title: 'PC Layar Hitam: RAM Menancap Sebelah (DRAM Kuning & Beep)',
    scenarioDescription: 'Kipas casing berputar kencang, namun monitor tetap hitam (No Signal). Motherboard mengeluarkan bunyi beep dan LED indikator DRAM menyala kuning karena modul RAM hanya menancap sebelah (belum klik ganda).',
    faultConfig: {
      ramSlot2Installed: true,
      ramSlot4Installed: true,
      ramPartiallySeated: true,
      ramPushStage: 'first_click' as const,
      errorMessage: 'Modul RAM menancap sebelah! Klip pengunci slot DIMM belum terdorong ganda (dual-click) hingga terkunci rata.',
      errorSolution: 'Buka klip slot RAM, posisikan notch dengan benar, lalu tekan kedua ujung RAM hingga terdengar bunyi klik pengunci ganda.',
      debugLed: 'dram',
      beep: 'ram_fault'
    }
  },
  {
    id: 'fault_thermal_paste_missing',
    title: 'PC Mati Mendadak: Overheating Thermal Shutdown',
    scenarioDescription: 'PC berhasil menyala dan masuk BIOS, namun dalam 15 detik suhu CPU melonjak dari 45°C hingga mencapai 100°C, lalu sistem mati mendadak untuk melindungi chip.',
    faultConfig: {
      thermalPasteApplied: false, // Lupa pasta termal!
      errorMessage: 'Suhu CPU melebihi ambang batas kritis (105°C Thermal Trip)!',
      errorSolution: 'Lepaskan cooler, bersihkan permukaan, lalu aplikasikan pasta termal secara merata sebelum memasang pendingin kembali.',
      debugLed: 'cpu',
      beep: 'none'
    }
  },
  {
    id: 'fault_gpu_power_missing',
    title: 'Peringatan Monitor: "Please Connect PCIe Power Cable"',
    scenarioDescription: 'Monitor menyala namun menampilkan pesan kesalahan dari GPU BIOS: "PLEASE POWER DOWN AND CONNECT THE PCIe POWER CABLE FOR THIS GRAPHICS CARD". Indikator VGA Debug LED menyala putih.',
    faultConfig: {
      cableGpuPcieConnected: false, // Kabel GPU lepas
      errorMessage: 'Kabel daya PCIe 8-pin GPU belum terhubung!',
      errorSolution: 'Colokkan kabel daya PCIe 8-pin dari PSU ke konektor daya di bagian atas kartu grafis.',
      debugLed: 'vga',
      beep: 'gpu_fault'
    }
  }
];
