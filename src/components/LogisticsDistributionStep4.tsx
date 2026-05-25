import React, { useState, useMemo, useId } from 'react';
import { 
  Plus, 
  Trash2, 
  QrCode, 
  Camera, 
  Compass, 
  User, 
  Users, 
  Backpack, 
  Sparkles, 
  AlertTriangle, 
  Search, 
  Check, 
  X,
  Smartphone,
  CheckCircle2
} from 'lucide-react';
import { ExpeditionCrew, PlannedLogisticsItem, CrewDistributionItem, InventoryItem } from '../types';

interface Props {
  crew: ExpeditionCrew[];
  plannedItems: PlannedLogisticsItem[];
  distributions: CrewDistributionItem[];
  inventory: InventoryItem[];
  onAddDistribution: (kruId: string, idBarang: string, jumlah: number) => void;
  onRemoveDistribution: (distId: string) => void;
}

export default function LogisticsDistributionStep4({
  crew,
  plannedItems,
  distributions,
  inventory,
  onAddDistribution,
  onRemoveDistribution
}: Props) {
  const baseId = useId();
  
  // State for SIMULATED CAMERA BARCODE DISPATCHER
  const [showScanner, setShowScanner] = useState(false);
  const [scannerTargetCrewId, setScannerTargetCrewId] = useState<string>(crew[0]?.id || '');
  const [scannedFeedback, setScannedFeedback] = useState<string | null>(null);
  
  // Local state for quick assignment selections
  const [quickAddForm, setQuickAddForm] = useState<{ [kruId: string]: { idBarang: string; qty: number } }>({});

  // Parse weight string helper
  const parseWeightToKg = (weightStr: string): number => {
    try {
      const numeric = parseFloat(weightStr.toLowerCase().replace(/[^0-9.]/g, '')) || 0;
      if (weightStr.toLowerCase().includes('gr') || weightStr.toLowerCase().includes('gram')) {
        return parseFloat((numeric / 1000).toFixed(2));
      }
      return parseFloat(numeric.toFixed(1));
    } catch {
      return 1.0;
    }
  };

  // Compute stats per crew member
  const crewCargoStats = useMemo(() => {
    const stats: { [kruId: string]: { weight: number; count: number; items: any[] } } = {};
    
    crew.forEach((c) => {
      stats[c.id] = { weight: 0, count: 0, items: [] };
    });

    distributions.forEach((d) => {
      if (!stats[d.kruId]) return;

      const pItem = plannedItems.find((p) => p.idBarang === d.idBarang);
      if (pItem) {
        const itemWeight = parseWeightToKg(pItem.beratBarang);
        const addedW = parseFloat((itemWeight * d.jumlah).toFixed(2));
        stats[d.kruId].weight += addedW;
        stats[d.kruId].count += d.jumlah;
        stats[d.kruId].items.push({
          distId: d.id,
          idBarang: d.idBarang,
          nama: pItem.namaBarang,
          jumlah: d.jumlah,
          beratTotal: addedW
        });
      }
    });

    return stats;
  }, [crew, plannedItems, distributions]);

  // Handle Dispatch of items from simulated barcode scanning picker
  const handleSimulateScanItem = (idBarang: string) => {
    const targetItem = plannedItems.find(p => p.idBarang === idBarang);
    if (!targetItem) {
      alert('Peralatan belum direncanakan pada trip ini. Daftarkan di Step Kebutuhan Barang lebih awal!');
      return;
    }
    
    // Add item to distribution
    onAddDistribution(scannerTargetCrewId, idBarang, 1);
    
    // Play feedback tone simulation
    setScannedFeedback(`SUKSES: "${targetItem.namaBarang}" dialokasikan ke personel.`);
    setTimeout(() => {
      setScannedFeedback(null);
    }, 2500);
  };

  const handleUpdateQuickSelectField = (kruId: string, field: string, value: any) => {
    setQuickAddForm(prev => ({
      ...prev,
      [kruId]: {
        ...(prev[kruId] || { idBarang: '', qty: 1 }),
        [field]: value
      }
    }));
  };

  const handleQuickAddSubmit = (kruId: string, e: React.FormEvent) => {
    e.preventDefault();
    const currentForm = quickAddForm[kruId];
    if (!currentForm || !currentForm.idBarang) {
      alert('Silakan pilih logistik yang valid!');
      return;
    }
    
    onAddDistribution(kruId, currentForm.idBarang, Number(currentForm.qty));
    // Reset selection select
    handleUpdateQuickSelectField(kruId, 'idBarang', '');
  };

  return (
    <div className="space-y-6 text-xs font-semibold text-slate-705">
      {/* SCANNING QUICK DISPATCH HUB BANNER */}
      <div className="bg-white border border-slate-150 p-4.5 rounded-xl shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center">
            <QrCode className="h-5 w-5 text-[#11512f] mr-2 inline" />
            <span>Asisten Pemindaian &amp; QR Lapangan</span>
          </span>
          <p className="text-slate-500 font-semibold leading-relaxed">
            Percepat pembagian logistik di lapangan trail menggunakan barcode tags untuk meminimalkan beban input manual tim ekspedisi.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (crew.length === 0) {
              alert('Daftarkan minimal 1 personel kru di Step Struktur Kru untuk mengaktifkan pemindaian!');
              return;
            }
            setShowScanner(true);
          }}
          className="px-4.5 py-2.5 bg-[#11512f] hover:bg-emerald-800 text-white rounded-lg border-0 cursor-pointer font-extrabold flex items-center space-x-1 uppercase text-[10.5px] shadow-sm ml-auto md:ml-0"
        >
          <Camera className="h-4.5 w-4.5 shrink-0" />
          <span>Buka Pemindai Barcode (Simulation)</span>
        </button>
      </div>

      {/* COMPACT CAMERA QR SIMULATOR WORKSPACE */}
      {showScanner && (
        <div className="bg-slate-950 text-white rounded-2xl p-6 border border-slate-850 relative space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <button
            type="button"
            className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-full transition text-slate-400 hover:text-white border-0 cursor-pointer"
            onClick={() => setShowScanner(false)}
          >
            <X className="h-5 w-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-slate-350">
            {/* LASER VIEW FINDER FRAME */}
            <div className="md:col-span-4 relative h-48 bg-black border-2 border-emerald-500 rounded-xl overflow-hidden shadow-inner flex flex-col items-center justify-center">
              {/* Pulsing Green Frame corners */}
              <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
              <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
              <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
              <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
              
              {/* MOVING RED LASER LINE PANEL */}
              <div className="absolute left-0 right-0 h-0.5 bg-rose-550 border-t border-rose-500 shadow-rose-500 animate-slide-scan top-1/2 z-10" />

              <div className="text-center text-[10px] text-slate-500 space-y-1 z-0">
                <QrCode className="h-10 w-10 mx-auto text-emerald-500 opacity-60 animate-pulse" />
                <span className="block font-mono font-bold">MENSIMULASI LENSA AKTIF</span>
              </div>
            </div>

            {/* SCANNING CONFIG DISPATCH CARD */}
            <div className="md:col-span-8 flex flex-col justify-between space-y-4">
              <div className="space-y-3.5">
                <div className="space-y-1">
                  <h4 className="text-sm font-extrabold text-[#ffffff] font-mono">Panel Simulasi Pemindaian Barcode / RFID Tag</h4>
                  <p className="text-[10px] text-slate-405 leading-relaxed font-semibold">Tentukan personil tujuan lalu klik salah satu emulasi tag di bawah untuk mensimulasikan alat terbaca sensor laser:</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9.5px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pilih Target Pengangkut *</label>
                    <select
                      value={scannerTargetCrewId}
                      onChange={(e) => setScannerTargetCrewId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-hidden"
                    >
                      {crew.map(c => (
                        <option key={c.id} value={c.id}>{c.namaKru} ({c.role})</option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-4 flex flex-col justify-center">
                    {scannedFeedback ? (
                      <div className="p-2 bg-emerald-900/40 border border-emerald-800 text-emerald-300 rounded-lg text-[10px] font-bold flex items-center space-x-1.5 animate-pulse">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>{scannedFeedback}</span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono italic">Menunggu trigger sinyal scanning...</span>
                    )}
                  </div>
                </div>
              </div>

              {/* QUICK CLICK EMULATOR SHORTCUT DIGITS */}
              <div className="space-y-1.5 pt-2 border-t border-slate-900">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Trigger Sinyal Item Kode (Sesuai Rencana):</span>
                <div className="flex flex-wrap gap-2 pt-0.5">
                  {plannedItems.length > 0 ? (
                    plannedItems.map(p => (
                      <button
                        key={p.idBarang}
                        type="button"
                        onClick={() => handleSimulateScanItem(p.idBarang)}
                        className="bg-slate-800 hover:bg-emerald-800 hover:text-white px-3 py-1.5 rounded-lg text-[9.5px] font-bold border-0 transition text-slate-100 cursor-pointer text-left flex items-center space-x-1"
                      >
                        <span>[Scan] {p.namaBarang}</span>
                      </button>
                    ))
                  ) : (
                    <span className="text-[10px] text-zinc-500 italic block">Daftar kebutuhan alat kosong. Masukan rencana alat pada Step 3 terlebih dahulu.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DRIVER ROW: CREW GRID DISTRIBUTION DECK */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-6 lg:gap-8">
        {crew.map((c) => {
          const stats = crewCargoStats[c.id] || { weight: 0, count: 0, items: [] };
          const loadPercentage = Math.min(100, (stats.weight / c.kapasitasBebanMax) * 100);
          const isOverloaded = stats.weight > c.kapasitasBebanMax;
          const currentQuickDist = quickAddForm[c.id] || { idBarang: '', qty: 1 };

          // Unassigned options for quick select from planning
          const eligibleSelectionItems = plannedItems.filter(p => !stats.items.some(k => k.idBarang === p.idBarang));

          return (
            <div 
              key={c.id} 
              className="bg-white border border-slate-150 rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between space-y-5 hover:shadow-md hover:border-slate-200 transition-all duration-300"
            >
              
              <div className="space-y-4">
                {/* Header detail with responsive vertical/horizontal placement */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-2">
                  <div className="space-y-1 sm:max-w-[70%]">
                    <span className="inline-block bg-[#11512f]/10 text-[#11512f] px-2.5 py-0.5 rounded-md text-[9px] uppercase tracking-wider font-extrabold">{c.role}</span>
                    <h4 className="text-sm font-black text-slate-805 font-serif leading-tight mt-1">{c.namaKru}</h4>
                    {c.nomorHp && (
                      <div className="flex items-center text-[9px] text-slate-400 tracking-wider">
                        <Smartphone className="h-3 w-3 mr-1 inline" />
                        <span>{c.nomorHp}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-[7.5px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Beban Cargo</span>
                    <span className={`text-[12px] font-black font-mono leading-none ${isOverloaded ? 'text-rose-600 animate-pulse' : 'text-[#11512f]'}`}>
                      {stats.weight.toFixed(1)} kg <span className="text-[9px] text-slate-400 font-normal">/{c.kapasitasBebanMax}kg</span>
                    </span>
                  </div>
                </div>

                {/* Progress load Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex shadow-2xs">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        isOverloaded ? 'bg-rose-600 animate-pulse' :
                        loadPercentage >= 80 ? 'bg-amber-500' :
                        'bg-[#11512f]'
                      }`}
                      style={{ width: `${loadPercentage}%` }}
                    />
                  </div>

                  {isOverloaded && (
                    <div className="p-2 bg-rose-50 border border-rose-100 text-rose-700 font-bold rounded-lg animate-bounce text-[9.5px] flex items-center space-x-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                      <span>Kelebihan Kapasitas Bagasi Personel!</span>
                    </div>
                  )}
                </div>

                {/* LIST OF DISTRIBUTED LOGISTICS ITEMS */}
                <div className="pt-3.5 border-t border-slate-100 space-y-2 min-h-[110px] max-h-52 overflow-y-auto pr-1">
                  {stats.items.length > 0 ? (
                    stats.items.map((it) => (
                      <div key={it.distId} className="flex justify-between items-center bg-slate-50 hover:bg-slate-100/70 p-2 px-2.5 rounded-lg border border-slate-100 text-[11px] transition-all">
                        <span className="max-w-[140px] truncate block font-bold text-slate-700">{it.nama}</span>
                        
                        <div className="flex items-center space-x-2 font-mono">
                          <span className="text-slate-850 font-black shrink-0">{it.jumlah} pcs</span>
                          <span className="text-[10px] text-slate-400 font-bold">({it.beratTotal.toFixed(1)}kg)</span>
                          
                          <button
                            type="button"
                            onClick={() => onRemoveDistribution(it.distId)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded border-0 transition-all cursor-pointer"
                            title="Batalkan Item"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-300 font-medium italic text-[10.5px]">
                      Kargo bagasi belum terisi
                    </div>
                  )}
                </div>
              </div>

              {/* QUICK FORM ASSIGNER IN CARD FOOTER with generous spacing */}
              <form onSubmit={(e) => handleQuickAddSubmit(c.id, e)} className="pt-3 border-t border-slate-100 flex items-center space-x-2">
                <select
                  value={currentQuickDist.idBarang}
                  onChange={(e) => handleUpdateQuickSelectField(c.id, 'idBarang', e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-[11px] font-semibold text-slate-700 w-full focus:ring-1 focus:ring-[#11512f] focus:outline-hidden"
                >
                  <option value="">+ Bagikan Peralatan</option>
                  {eligibleSelectionItems.map(p => (
                    <option key={p.idBarang} value={p.idBarang}>{p.namaBarang}</option>
                  ))}
                </select>

                {currentQuickDist.idBarang && (
                  <>
                    <input
                      type="number"
                      required
                      min="1"
                      value={currentQuickDist.qty}
                      onChange={(e) => handleUpdateQuickSelectField(c.id, 'qty', e.target.value)}
                      className="w-10 p-2 text-center bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-[11px] focus:outline-hidden"
                    />
                    <button
                      type="submit"
                      className="p-2 bg-[#11512f] text-white border-0 hover:bg-emerald-800 rounded-lg cursor-pointer transition-all shrink-0"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  </>
                )}
              </form>

            </div>
          );
        })}
      </div>
    </div>
  );
}
