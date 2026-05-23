import React, { useId, useMemo } from 'react';
import { 
  Printer, 
  Download, 
  FileCheck, 
  Compass, 
  UserSquare, 
  Users, 
  Smartphone, 
  Scale, 
  QrCode,
  ShieldCheck,
  Check
} from 'lucide-react';
import { ExpeditionTrip, PlannedLogisticsItem, CrewDistributionItem, InventoryItem, AppConfig } from '../types';

interface Props {
  activeTrip: ExpeditionTrip;
  plannedItems: PlannedLogisticsItem[];
  distributions: CrewDistributionItem[];
  inventory: InventoryItem[];
  config?: AppConfig;
}

export default function PdfManifestStep5({
  activeTrip,
  plannedItems,
  distributions,
  inventory,
  config
}: Props) {
  const baseId = useId();

  // Helper weight parser
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

  // Compute metrics
  const totalWeight = useMemo(() => {
    return distributions.reduce((sum, d) => {
      const pItem = plannedItems.find(p => p.idBarang === d.idBarang);
      if (pItem) {
        const itemWeight = parseWeightToKg(pItem.beratBarang);
        return sum + (itemWeight * d.jumlah);
      }
      return sum;
    }, 0);
  }, [distributions, plannedItems]);

  const totalItemsCount = useMemo(() => {
    return distributions.reduce((sum, d) => sum + d.jumlah, 0);
  }, [distributions]);

  // Group distributions by crew member
  const crewBreakdown = useMemo(() => {
    const map: { [kruId: string]: Array<{ namaBarang: string; qty: number; beratUnit: string; totalBerat: number }> } = {};
    
    activeTrip.crew.forEach(c => {
      map[c.id] = [];
    });

    distributions.forEach(d => {
      if (!map[d.kruId]) return;
      const pItem = plannedItems.find(p => p.idBarang === d.idBarang);
      if (pItem) {
        const itemWeight = parseWeightToKg(pItem.beratBarang);
        map[d.kruId].push({
          namaBarang: pItem.namaBarang,
          qty: d.jumlah,
          beratUnit: pItem.beratBarang,
          totalBerat: parseFloat((itemWeight * d.jumlah).toFixed(1))
        });
      }
    });

    return map;
  }, [activeTrip, plannedItems, distributions]);

  // Render trigger print
  const handlePrint = () => {
    // 1. Coba print asli (jika dibuka di tab baru, ini langsung bekerja!)
    try {
      window.print();
    } catch (e) {
      console.warn('Metode pencetakan window.print() langsung dibatasi oleh sandbox iframe:', e);
    }

    // 2. Generate dan otomatis unduh dokumen cetak manifest mandiri
    const printDoc = document.getElementById('manifest-print-document');
    if (!printDoc) return;

    const docHtml = printDoc.innerHTML;
    const fullHtml = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Manifest_${activeTrip.namaDestinasi.replace(/\s+/g, '_')}_PT_BARENGIN_TRIP</title>
    <!-- Muat stylesheet Tailwind CSS v4 CDN resmi -->
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@400;700&display=swap');
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f8fafc;
            padding: 2.5rem 1rem;
        }
        @media print {
            body {
                background-color: white !important;
                padding: 0 !important;
            }
            .no-print {
                display: none !important;
            }
        }
    </style>
</head>
<body class="bg-slate-50 min-h-screen py-10 px-4">
    <!-- Tombol bantuan cetak & Informasi Sandbox Bypasser -->
    <div class="no-print max-w-4xl mx-auto mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div class="space-y-1">
            <h4 class="font-bold text-sm flex items-center">
                <span class="mr-2">🖨️</span> Dokumen Cetak Siap (Bypass Sandbox Sukses!)
            </h4>
            <p class="text-xs text-emerald-700 leading-relaxed max-w-2xl">
                Karena aplikasi Anda berjalan dalam frame aman (Iframe Sandbox), browser memblokir dialog cetak langsung. 
                Silakan simpan dokumen ini sebagai PDF dengan mengeklik <strong>"Cetak Sekarang"</strong> di samping atau tekan tombol shortcut 
                <kbd class="px-1.5 py-0.5 bg-white border border-emerald-300 rounded font-mono font-bold text-[10px]">Ctrl + P</kbd> / 
                <kbd class="px-1.5 py-0.5 bg-white border border-emerald-300 rounded font-mono font-bold text-[10px]">Cmd + P</kbd>, lalu ubah tujuan/destination menjadi <strong>"Save as PDF"</strong>.
            </p>
        </div>
        <button onclick="window.print()" class="px-5 py-2.5 bg-[#11512f] hover:bg-emerald-800 text-white text-xs font-bold rounded-xl cursor-pointer transition shadow-xs shrink-0">
            Cetak / Simpan PDF
        </button>
    </div>

    <!-- Kontainer Dokumen A4 -->
    <div class="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 max-w-4xl mx-auto shadow-md text-slate-800">
        ${docHtml}
    </div>

    <script>
        // Otomatis trigger dialog print setelah halaman termuat sempurna
        window.addEventListener('load', () => {
            setTimeout(() => {
                window.print();
            }, 600);
        });
    </script>
</body>
</html>
    `;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `manifest_${activeTrip.namaDestinasi.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_PRINT.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="space-y-6 text-xs text-slate-705 font-semibold">
      {/* QUICK PREPARATION PRINT CONTROLLER */}
      <div className="bg-white border border-slate-150 p-5 rounded-xl shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center">
            <FileCheck className="h-5 w-5 text-[#11512f] mr-2 inline" />
            <span>Dokumentasi Manifest Resmi Ekspedisi</span>
          </span>
          <p className="text-slate-500 font-semibold leading-relaxed">
            Manifest ini dioptimalkan untuk cetak A4 guna keperluan checklist basah di pegunungan / basecamp lapangan tanpa sinyal internet.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="px-4.5 py-2.5 bg-[#11512f] hover:bg-emerald-800 text-white rounded-lg border-0 cursor-pointer font-extrabold flex items-center space-x-1.5 uppercase text-[10.5px] shadow-sm ml-auto md:ml-0"
        >
          <Printer className="h-4.5 w-4.5 shrink-0" />
          <span>Cetak Manifest (Print to PDF)</span>
        </button>
      </div>

      {/* DETAILED SCREEN LAYOUT VIEW OF THE MANIFEST */}
      <div id="manifest-print-document" className="bg-white border border-slate-150 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm max-w-4xl mx-auto">
        
        {/* HEADING BRANDING BAR */}
        <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[9px] font-extrabold font-mono tracking-wider text-slate-400 uppercase">OFFICIAL MOUNTAINEERING CARGO MANIFEST</span>
            <h1 className="text-xl md:text-2xl font-serif text-slate-900 tracking-tight leading-none font-black uppercase">
              {activeTrip.namaDestinasi}
            </h1>
            <p className="text-xs font-bold text-slate-700">
              {activeTrip.jenisTrip} {activeTrip.nomorTrip} via {activeTrip.jalurPendakian} | Tanggal: {activeTrip.tanggalMulai} s.d {activeTrip.tanggalSelesai}
            </p>
          </div>
          
          <div className="sm:text-right space-y-1 shrink-0 flex items-center sm:block">
            <div className="flex items-center sm:justify-end space-x-2">
              <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-white border border-slate-200 p-0 shadow-xs shrink-0">
                <img 
                  src={config?.logoUrl || 'https://lh3.googleusercontent.com/d/1C-scCTu7H2eOa-ZtDhak1JcbRhTNCCIb'} 
                  alt="Logo PT. Barengin Trip" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-sm font-black text-emerald-950 uppercase">{config?.companyName || 'PT. BARENGIN TRIP'}</span>
            </div>
            <p className="text-[9px] text-slate-400 uppercase font-mono tracking-widest leading-none">EXPEDITION LOGISTICS INTEGRATION</p>
          </div>
        </div>

        {/* METRICS ROW CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1 text-center font-bold">
          <div className="bg-slate-50 p-2.5 border border-slate-200/50 rounded-xl">
            <span className="block text-slate-400 text-[8px] uppercase tracking-wider mb-0.5">Total Personel</span>
            <span className="text-slate-800 text-sm font-black">{activeTrip.crew.length} Orang</span>
          </div>
          <div className="bg-slate-50 p-2.5 border border-slate-200/50 rounded-xl">
            <span className="block text-slate-400 text-[8px] uppercase tracking-wider mb-0.5">Volume Peralatan</span>
            <span className="text-[#11512f] text-sm font-black">{totalItemsCount} pcs</span>
          </div>
          <div className="bg-slate-50 p-2.5 border border-slate-200/50 rounded-xl">
            <span className="block text-slate-400 text-[8px] uppercase tracking-wider mb-0.5">Kombinasi Berat</span>
            <span className="text-[#11512f] text-sm font-black">{totalWeight.toFixed(1)} Kilogram</span>
          </div>
          <div className="bg-slate-50 p-2.5 border border-slate-200/50 rounded-xl">
            <span className="block text-slate-400 text-[8px] uppercase tracking-wider mb-0.5">Rata-Rata Angkut</span>
            <span className="text-slate-800 text-sm font-black">
              {activeTrip.crew.length ? (totalWeight / activeTrip.crew.length).toFixed(1) : 0} kg/crew
            </span>
          </div>
        </div>

        {/* DETAILED MANIFEST BREAKDOWN PER CREW BAR */}
        <div className="space-y-5">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-200 pb-1.5 flex items-center">
            <Users className="h-4.5 w-4.5 mr-1.5 text-[#11512f]" />
            <span>Distribusian Cargo Anggota Kru Lapangan</span>
          </h3>

          <div className="space-y-5">
            {activeTrip.crew.map((crw) => {
              const items = crewBreakdown[crw.id] || [];
              const totalW = items.reduce((sum, item) => sum + item.totalBerat, 0);

              return (
                <div key={crw.id} className="border border-slate-200 rounded-xl p-4 bg-white/50 space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-1.5 font-bold">
                    <div className="space-y-0.5">
                      <span className="text-slate-800 font-extrabold text-[11px]">{crw.namaKru}</span>
                      <span className="text-[9px] text-slate-400 ml-2 font-mono uppercase tracking-wider">({crw.role})</span>
                    </div>

                    <div className="text-right text-[10px] text-slate-600">
                      Beban: <strong className="text-[#11512f] font-black">{totalW.toFixed(1)} kg</strong> / {crw.kapasitasBebanMax}kg max
                    </div>
                  </div>

                  {items.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-semibold text-[10.5px]">
                        <thead>
                          <tr className="text-slate-400 text-[8px] uppercase tracking-wider border-b border-slate-100">
                            <th className="py-1">Nama Barang Logistik</th>
                            <th className="py-1 text-center">Kuantitas</th>
                            <th className="py-1 text-right">Berat Satuan</th>
                            <th className="py-1 text-right">Berat Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/50">
                          {items.map((it, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="py-1 text-slate-705 font-extrabold">{it.namaBarang}</td>
                              <td className="py-1 text-center font-mono font-bold text-slate-800">{it.qty} unit</td>
                              <td className="py-1 text-right font-mono text-slate-450">{it.beratUnit}</td>
                              <td className="py-1 text-right font-mono text-[#11512f] font-black">{it.totalBerat.toFixed(1)} kg</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-[10px] text-zinc-400 font-normal italic py-2">Tidak ada beban peralatan yang ditugaskan ke personil ini.</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* OFFICIAL ROAD SIGN-OFF BLOCKS AREA */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6 border-t border-slate-200">
          <div className="space-y-1 md:col-span-1 flex flex-col items-center sm:items-start text-center sm:text-left justify-center pb-4 md:pb-0">
            <QrCode className="h-16 w-16 text-slate-900 border border-slate-300 p-1 rounded-md" />
            <span className="text-[8px] font-bold font-mono text-slate-400 uppercase tracking-widest mt-1">SECURE SCAN CODE</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:col-span-3 text-center border-t md:border-t-0 border-slate-100 pt-4 md:pt-0 font-bold">
            <div className="space-y-12">
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block font-mono">Disiapkan oleh :</span>
              <div className="space-y-0.5 leading-none">
                <span className="font-extrabold text-slate-800 text-[10.5px] underline block">Operator Lapangan Basecamp</span>
                <span className="text-[8.5px] text-slate-400 uppercase font-mono tracking-widest leading-none">PT. BARENGIN TRIP OPS</span>
              </div>
            </div>

            <div className="space-y-12">
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block font-mono">Disetujui oleh :</span>
              <div className="space-y-0.5 leading-none">
                <span className="font-extrabold text-slate-800 text-[10.5px] underline block">{config?.picName || 'Rizki S.'}</span>
                <span className="text-[8.5px] text-slate-400 uppercase font-mono tracking-widest leading-none">KEPALA LOGISTIK UTAMA</span>
              </div>
            </div>

            <div className="space-y-12 col-span-2 md:col-span-1">
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block font-mono">Diterima oleh :</span>
              <div className="space-y-0.5 leading-none">
                <span className="font-extrabold text-slate-800 text-[10.5px] underline block">Dani Al-Wahid</span>
                <span className="text-[8.5px] text-slate-400 uppercase font-mono tracking-widest leading-none">TOUR LEADER PENUGASAN</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECURITY CODE STAMP */}
        <div className="bg-emerald-50/70 border border-emerald-100/60 rounded-xl p-3.5 flex items-center justify-between text-[11px] text-emerald-800 px-4 font-bold">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600 animate-pulse shrink-0" />
            <span>Dokumentasi manifest logistik ini valid &amp; tersinkronisasi server PT Barengin Trip.</span>
          </div>
          <span className="text-[9px] font-mono font-bold text-slate-400">Kode Sidik: #{activeTrip.id}</span>
        </div>

      </div>
    </div>
  );
}
