import React, { useState } from 'react';
import { X, Cpu, HardDrive, Box, HelpCircle } from 'lucide-react';
import { HardwareScenario, HardwareItem } from '../types/pc';

interface HardwareInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: HardwareScenario;
}

export const HardwareInspectorModal: React.FC<HardwareInspectorModalProps> = ({
  isOpen,
  onClose,
  scenario,
}) => {
  const [selectedCat, setSelectedCat] = useState<'cpu' | 'motherboard' | 'ram' | 'cooler' | 'gpu' | 'storage' | 'psu'>('cpu');

  if (!isOpen) return null;

  const currentItem: HardwareItem = scenario.components[selectedCat];

  const categories = [
    { key: 'cpu' as const, label: 'Prosesor (CPU)' },
    { key: 'motherboard' as const, label: 'Motherboard' },
    { key: 'ram' as const, label: 'Memori (RAM)' },
    { key: 'cooler' as const, label: 'CPU Cooler' },
    { key: 'gpu' as const, label: 'Kartu Grafis (GPU)' },
    { key: 'storage' as const, label: 'SSD NVMe' },
    { key: 'psu' as const, label: 'Catu Daya (PSU)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Anatomi Hardware & Edukasi Kompatibilitas
              </h3>
              <p className="text-xs text-slate-400">
                Pelajari struktur fisik komponen, penanda pin, notch, dan aturan kompatibilitas industri
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Nav */}
        <div className="flex items-center gap-1.5 px-6 py-2.5 bg-slate-900/60 border-b border-slate-800 overflow-x-auto">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setSelectedCat(c.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCat === c.key
                  ? 'bg-sky-500 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-sky-400 font-bold block mb-1">
              KOMPONEN TERPILIH
            </span>
            <h2 className="text-xl font-bold text-white mb-2">
              {currentItem.name}
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              {currentItem.description}
            </p>
          </div>

          {/* SOP Notes Box */}
          <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-300">
            <div className="font-bold flex items-center gap-1.5 mb-1 text-white">
              <HelpCircle className="w-4 h-4 text-sky-400" />
              <span>Panduan SOP Perakitan Mandiri:</span>
            </div>
            <p className="leading-relaxed">
              {currentItem.sopNotes}
            </p>
          </div>

          {/* Technical Specs Table */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Spesifikasi Teknis
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
              {Object.entries(currentItem.specs).map(([key, val]) => (
                <div
                  key={key}
                  className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 flex justify-between"
                >
                  <span className="text-slate-400">{key}:</span>
                  <span className="text-white font-semibold">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 bg-slate-900 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
