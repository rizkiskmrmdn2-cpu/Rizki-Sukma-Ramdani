import React, { useState, useEffect, useMemo, useId } from 'react';
import { 
  DollarSign, 
  Plus, 
  Trash2, 
  User, 
  TrendingUp, 
  AlertCircle, 
  Coins, 
  Wallet,
  Sparkles,
  Calendar,
  Layers,
  FileCheck2,
  Trash,
  Printer
} from 'lucide-react';
import { ExpeditionTrip, TripBudgetEntry } from '../types';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';

export default function PenganggaranTripPage() {
  const baseId = useId();

  // Firestore trips state
  const [trips, setTrips] = useState<ExpeditionTrip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>('');

  // Local Form state for new budget entry
  const [entryForm, setEntryForm] = useState({
    pic: 'Taqiyyan',
    name: '',
    amount: 50000,
    category: 'Konsumsi',
    notes: ''
  });

  // Load and listen to all available trips
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'expedition_trips'), (snapshot) => {
      const data: ExpeditionTrip[] = [];
      snapshot.forEach((doc) => {
        data.push(doc.data() as ExpeditionTrip);
      });
      // Sort newest trip first
      data.sort((a, b) => b.id.localeCompare(a.id));
      setTrips(data);
      
      // Auto-select the first trip if not chosen yet
      if (data.length > 0 && !selectedTripId) {
        setSelectedTripId(data[0].id);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'expedition_trips');
    });
    return () => unsubscribe();
  }, [selectedTripId]);

  // Read selected trip
  const activeTrip = useMemo(() => {
    return trips.find(t => t.id === selectedTripId) || null;
  }, [trips, selectedTripId]);

  // Read budget entries from active trip or default to empty
  const budgetEntries: TripBudgetEntry[] = useMemo(() => {
    return activeTrip?.budgetEntries || [];
  }, [activeTrip]);

  // List of PICs to create cards for. We want to display Taqiyyan, Haikal, Kiki, and any crew member in the trip
  const picList = useMemo(() => {
    const defaults = ['Taqiyyan', 'Haikal', 'Kiki'];
    if (!activeTrip) return defaults;
    
    // Supplement with crew members' name
    const crewNames = activeTrip.crew.map(c => c.namaKru);
    const combined = [...new Set([...defaults, ...crewNames])];
    return combined;
  }, [activeTrip]);

  // Local editing states
  const [isEditingPagu, setIsEditingPagu] = useState<boolean>(false);
  const [tempPagu, setTempPagu] = useState<number>(0);

  const [editingPicName, setEditingPicName] = useState<string | null>(null);
  const [tempPicAllotment, setTempPicAllotment] = useState<number>(0);

  // Safe fetch budget allocation or fallback
  const getAllotment = (picName: string) => {
    const defaults: Record<string, number> = {
      'Taqiyyan': 750000,
      'Haikal': 500000,
      'Kiki': 600000
    };
    if (activeTrip?.picBudgets && activeTrip.picBudgets[picName] !== undefined) {
      return activeTrip.picBudgets[picName];
    }
    return defaults[picName] || 400000;
  };

  // Calculations for Summary Dashboard
  const summary = useMemo(() => {
    const sumAllotments = picList.reduce((sum, pic) => sum + getAllotment(pic), 0);
    const totalAllotment = activeTrip?.customPagu !== undefined ? activeTrip.customPagu : sumAllotments;
    const totalSpent = budgetEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const selisih = totalAllotment - totalSpent;

    return {
      totalAllotment,
      totalSpent,
      selisih,
      sumAllotments
    };
  }, [activeTrip, budgetEntries, picList]);

  // Category-wise totals for printing rekapitulasi 
  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    budgetEntries.forEach(entry => {
      const cat = entry.category || 'Lainnya';
      totals[cat] = (totals[cat] || 0) + entry.amount;
    });
    return totals;
  }, [budgetEntries]);

  // Printable document renderer (Bypass iframe sandbox structure)
  const handlePrintBudgetSummary = () => {
    try {
      window.print();
    } catch (e) {
      console.warn('Metode pencetakan window.print() langsung dibatasi oleh sandbox iframe:', e);
    }

    if (!activeTrip) return;

    // Sort budget entries by PIC and then by Name to look clean
    const sortedEntries = [...budgetEntries].sort((a, b) => a.pic.localeCompare(b.pic) || a.name.localeCompare(b.name));

    // Calculate PIC rows
    const picReportRowsHtml = picList.map((picName, index) => {
      const picSpentEntries = budgetEntries.filter(entry => entry.pic === picName);
      const allotment = getAllotment(picName);
      const spent = picSpentEntries.reduce((sum, entry) => sum + entry.amount, 0);
      const balance = allotment - spent;
      const pctValue = allotment > 0 ? ((spent / allotment) * 100).toFixed(1) : '0';
      const pctStr = `${pctValue}%`;
      const balanceColor = balance >= 0 ? 'text-teal-800 font-bold' : 'text-rose-700 font-bold';

      return `
        <tr class="border-b border-slate-200">
          <td class="p-2.5 text-center font-mono">${index + 1}</td>
          <td class="p-2.5 font-bold text-slate-900">${picName}</td>
          <td class="p-2.5 text-right font-mono">${formatIDR(allotment)}</td>
          <td class="p-2.5 text-right font-mono text-emerald-800 font-semibold">${formatIDR(spent)}</td>
          <td class="p-2.5 text-right font-mono ${balanceColor}">${formatIDR(balance)}</td>
          <td class="p-2.5 text-center">
            <div class="flex items-center justify-center gap-1.5">
              <span class="font-mono text-[10px] font-bold">${pctStr}</span>
              <div class="w-12 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div class="bg-[#11512f] h-full" style="width: ${Math.min(Number(pctValue), 100)}%"></div>
              </div>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Calculate Category rows
    const catReportRowsHtml = (Object.entries(categoryTotals) as [string, number][]).map(([cat, total], index) => {
      const pctSpent = summary.totalSpent > 0 ? ((total / summary.totalSpent) * 100).toFixed(1) : '0';
      return `
        <tr class="border-b border-slate-200">
          <td class="p-2.5 text-center font-mono">${index + 1}</td>
          <td class="p-2.5 font-bold text-slate-800">${cat}</td>
          <td class="p-2.5 text-right font-mono font-semibold text-slate-900">${formatIDR(total)}</td>
          <td class="p-2.5 text-center font-mono font-bold text-emerald-800">${pctSpent}%</td>
        </tr>
      `;
    }).join('');

    // Detailed entries rows
    const detailRowsHtml = sortedEntries.length > 0 ? sortedEntries.map((item, index) => {
      return `
        <tr class="border-b border-slate-200 hover:bg-slate-50/50">
          <td class="p-2 text-center font-mono text-slate-500">${index + 1}</td>
          <td class="p-2 font-bold text-slate-800">${item.pic}</td>
          <td class="p-2 text-slate-900 font-medium">${item.name}</td>
          <td class="p-2"><span class="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[9px] font-semibold uppercase">${item.category}</span></td>
          <td class="p-2 text-right font-mono font-bold text-slate-900">${formatIDR(item.amount)}</td>
          <td class="p-2 text-slate-500 italic text-[10px]">${item.notes || '-'}</td>
        </tr>
      `;
    }).join('') : `
      <tr>
        <td colspan="6" class="p-4 text-center text-slate-400 font-serif italic text-xs">Belum ada rincian belanja lapangan yang dicatat.</td>
      </tr>
    `;

    const fullHtml = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Ringkasan_Anggaran_${activeTrip.namaDestinasi.replace(/\s+/g, '_')}_PT_BARENGIN_TRIP</title>
    <!-- Tailwind CSS v4 CDN setup -->
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@400;700&display=swap');
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
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
<body class="bg-slate-50 min-h-screen py-8 px-4 text-xs font-medium text-slate-700">
    
    <!-- IFRAME SECURITY SANDBOX BYPASSER INSTRUCTION -->
    <div class="no-print max-w-4xl mx-auto mb-6 bg-emerald-50 border border-emerald-200 text-[#11512f] p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
        <div class="space-y-1">
            <h4 class="font-bold text-sm flex items-center">
                <span class="mr-2">🖨️</span> Dokumen Ringkasan Anggaran Siap Cetak
            </h4>
            <p class="text-[11px] text-emerald-800 leading-relaxed max-w-2xl">
                Karena aplikasi berjalan dalam wadah frame aman (Iframe Sandbox), browser memblokir trigger print instan. 
                Silakan cetak dokumen fisik atau simpan sebagai PDF dengan mengeklik <strong>"Cetak Ringkasan"</strong> di samping atau tekan tombol shortcut 
                <kbd class="px-1.5 py-0.5 bg-white border border-emerald-300 rounded font-mono font-bold text-[10px]">Ctrl + P</kbd> / 
                <kbd class="px-1.5 py-0.5 bg-white border border-emerald-300 rounded font-mono font-bold text-[10px]">Cmd + P</kbd> di jendela baru ini.
            </p>
        </div>
        <button onclick="window.print()" class="px-5 py-2.5 bg-[#11512f] hover:bg-emerald-900 text-white text-xs font-extrabold rounded-xl cursor-pointer transition shadow-xs shrink-0 uppercase tracking-wider font-sans">
            Cetak / Simpan PDF
        </button>
    </div>

    <!-- MAIN PRINT LAYOUT CARD -->
    <div class="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 max-w-4xl mx-auto space-y-8 text-slate-800 shadow-none border-0" id="a4-print-document">
        
        <!-- FIRST ROW: OFFICIAL SYSTEM LOGISTICS BRAND HEADER -->
        <div class="flex justify-between items-start border-b-2 border-slate-900 pb-5">
            <div class="space-y-1">
                <span class="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded font-black font-mono uppercase tracking-widest">PT. BARENGIN TRIP OPERASIONAL</span>
                <h1 class="text-lg font-black tracking-wider uppercase text-slate-900 font-serif leading-tight">LAPORAN EVALUASI ANGGARAN LAPANGAN</h1>
                <p class="text-[9.5px] text-slate-500 uppercase tracking-widest font-bold">EXPEDITION FINANCES &middot; FIELD EXPENSES SUMMARY REPORT</p>
            </div>
            <div class="text-right space-y-1">
                <span class="text-[9px] bg-emerald-50 border border-emerald-200 text-[#11512f] px-2 py-0.5 rounded font-black font-mono uppercase">CONFIDENTIAL - LAPANGAN</span>
                <p class="text-[10px] text-slate-500 font-bold mt-1">Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p class="text-[9px] text-slate-400 font-mono">ID Trip: #T-${activeTrip.id.substring(activeTrip.id.length - 6).toUpperCase()}</p>
            </div>
        </div>

        <!-- TRIP INFO HEADER SECTION -->
        <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-[11px] leading-relaxed">
            <div>
                <span class="text-slate-400 font-bold uppercase tracking-wider text-[8.5px] block">Jenis &amp; No. Trip</span>
                <span class="font-extrabold text-slate-900 block font-serif text-xs">${activeTrip.jenisTrip} ${activeTrip.nomorTrip}</span>
            </div>
            <div>
                <span class="text-slate-400 font-bold uppercase tracking-wider text-[8.5px] block">Garis Destinasi</span>
                <span class="font-extrabold text-slate-900 block text-xs">${activeTrip.namaDestinasi}</span>
            </div>
            <div>
                <span class="text-slate-400 font-bold uppercase tracking-wider text-[8.5px] block">Lintasan Jalur</span>
                <span class="font-extrabold text-slate-950 block text-xs">${activeTrip.jalurPendakian || '-'}</span>
            </div>
            <div>
                <span class="text-slate-400 font-bold uppercase tracking-wider text-[8.5px] block">Tanggal Perjalanan</span>
                <span class="font-extrabold text-[#11512f] block text-xs">${activeTrip.tanggalMulai} s.d ${activeTrip.tanggalSelesai}</span>
            </div>
        </div>

        <!-- GENERAL FINANCIAL METRICS PANEL -->
        <div>
            <h3 class="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-2 mb-3">I. RINGKASAN REKAPITULASI KEUANGAN</h3>
            <div class="grid grid-cols-3 gap-4 text-center">
                <div class="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <span class="text-[8.5px] text-slate-500 uppercase tracking-wider font-extrabold block">TOTAL PAGU DIALOKASIKAN</span>
                    <span class="text-sm font-mono font-black text-slate-800 block mt-1">${formatIDR(summary.totalAllotment)}</span>
                    <span class="text-[8px] text-slate-400 mt-0.5 block">Limit budget operasional</span>
                </div>
                <div class="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <span class="text-[8.5px] text-[#11512f] uppercase tracking-wider font-extrabold block">TOTAL REALISASI LAPANGAN</span>
                    <span class="text-sm font-mono font-black text-[#11512f] block mt-1">${formatIDR(summary.totalSpent)}</span>
                    <span class="text-[8px] text-emerald-800 font-semibold mt-0.5 block">Realisasi pembelanjaan</span>
                </div>
                <div class="p-3 rounded-xl border ${summary.selisih >= 0 ? 'border-teal-200 bg-teal-50/25 text-teal-900' : 'border-rose-200 bg-rose-50/25 text-rose-900'}">
                    <span class="text-[8.5px] uppercase tracking-wider font-extrabold block">SISA SALDO ANGGARAN</span>
                    <span class="text-sm font-mono font-black block mt-1">${formatIDR(summary.selisih)}</span>
                    <span class="text-[8px] mt-0.5 block font-bold ${summary.selisih >= 0 ? 'text-teal-700' : 'text-rose-700'}">
                        ${summary.selisih >= 0 ? 'STATUS: SURPLUS (SISA AMAN)' : 'STATUS: OVERBUDGET (DEFISIT)'}
                    </span>
                </div>
            </div>
        </div>

        <!-- PIC & CATEGORIES FLEX PANEL GRID -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            <!-- TABLE 1: PIC ROW BUDGET ALLOCATION -->
            <div class="md:col-span-7 space-y-3">
                <h4 class="text-[10px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1.5">A. DISTRIBUSI ANGGARAN DAN REALISASI PER KRU (PIC)</h4>
                <table class="w-full text-[10.5px] text-left border-collapse">
                    <thead>
                        <tr class="bg-slate-100 border-b-2 border-slate-300">
                            <th class="p-2 text-center w-8 font-bold text-slate-800">No</th>
                            <th class="p-2 font-bold text-slate-800">Nama Kru (PIC)</th>
                            <th class="p-2 text-right font-bold text-slate-800">Pagu Allotment</th>
                            <th class="p-2 text-right font-bold text-slate-800">Realisasi Belanja</th>
                            <th class="p-2 text-right font-bold text-slate-800">Remaining</th>
                            <th class="p-2 text-center font-bold text-slate-800 w-24">Persentase</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${picReportRowsHtml}
                        <tr class="bg-slate-50 font-extrabold border-t-2 border-slate-300">
                            <td colspan="2" class="p-2.5 text-center text-slate-900">Total Akumulasi PIC</td>
                            <td class="p-2.5 text-right font-mono">${formatIDR(summary.sumAllotments)}</td>
                            <td class="p-2.5 text-right font-mono text-emerald-800">${formatIDR(summary.totalSpent)}</td>
                            <td class="p-2.5 text-right font-mono ${summary.sumAllotments - summary.totalSpent >= 0 ? 'text-teal-800' : 'text-rose-700'}">${formatIDR(summary.sumAllotments - summary.totalSpent)}</td>
                            <td class="text-center font-mono p-2.5">${summary.sumAllotments > 0 ? ((summary.totalSpent / summary.sumAllotments) * 100).toFixed(1) : '0'}%</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- TABLE 2: KATEGORI REPORT ALLOCATION -->
            <div class="md:col-span-5 space-y-3">
                <h4 class="text-[10px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1.5">B. REKAPITULASI PENGELUARAN PER KATEGORI</h4>
                <table class="w-full text-[10.5px] text-left border-collapse">
                    <thead>
                        <tr class="bg-slate-100 border-b-2 border-slate-300">
                            <th class="p-2 text-center w-8 font-bold text-slate-800">No</th>
                            <th class="p-2 font-bold text-slate-800">Kategori Biaya</th>
                            <th class="p-2 text-right font-bold text-slate-800">Total Pengeluaran</th>
                            <th class="p-2 text-center font-bold text-slate-800 w-20">Persentase</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${catReportRowsHtml}
                        <tr class="bg-slate-50 font-extrabold border-t-2 border-slate-300">
                            <td colspan="2" class="p-2.5 text-center text-slate-900">Total Seluruh Kategori</td>
                            <td class="p-2.5 text-right font-mono text-emerald-800">${formatIDR(summary.totalSpent)}</td>
                            <td class="p-2.5 text-center font-mono text-emerald-850">100%</td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>

        <!-- DETAILED LEDGER ENTRIES LIST -->
        <div class="space-y-3 pt-4">
            <h3 class="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-2 mb-3">II. RINCIAN BUKU LEDGER BELANJA LAPANGAN</h3>
            <table class="w-full text-[10px] text-left border-collapse">
                <thead>
                    <tr class="bg-slate-100 border-b-2 border-slate-300">
                        <th class="p-2 text-center w-8 font-bold text-slate-800">No</th>
                        <th class="p-2 font-bold text-slate-800 w-24">PIC</th>
                        <th class="p-2 font-bold text-slate-800">Keperluan / Keterangan</th>
                        <th class="p-2 font-bold text-slate-800 w-32">Kategori</th>
                        <th class="p-2 text-right font-bold text-slate-800 w-28">Nominal Belanja</th>
                        <th class="p-2 font-bold text-slate-800">Catatan</th>
                    </tr>
                </thead>
                <tbody>
                    ${detailRowsHtml}
                    <tr class="bg-slate-50 font-extrabold border-t-2 border-slate-300">
                        <td colspan="4" class="p-2.5 text-center text-slate-900">Total Pengeluaran Relevan Tercatat</td>
                        <td class="p-2.5 text-right font-mono text-emerald-800 text-[11px]">${formatIDR(summary.totalSpent)}</td>
                        <td class="p-2"></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- OFFICIAL STAMP SIGNEE FOOTER -->
        <div class="grid grid-cols-2 gap-8 text-center pt-10 text-[10.5px]">
            <div class="space-y-16 flex flex-col justify-between">
                <div>
                    <p class="text-slate-400 font-bold uppercase tracking-wider text-[8.5px]">DILAPORKAN OLEH (P.I.C LAPANGAN)</p>
                </div>
                <div class="space-y-1">
                    <p class="font-extrabold text-slate-800 underline uppercase">${activeTrip.crew && activeTrip.crew[1] ? activeTrip.crew[1].namaKru : 'Haikal'}</p>
                    <p class="text-[9px] text-slate-400 font-mono">ADMINISTRASI LOGISTIK LAPANGAN</p>
                </div>
            </div>
            <div class="space-y-16 flex flex-col justify-between">
                <div>
                    <p class="text-slate-400 font-bold uppercase tracking-wider text-[8.5px]">MENGETAHUI (LEADER / VERIFIKATOR)</p>
                </div>
                <div class="space-y-1">
                    <p class="font-extrabold text-slate-800 underline uppercase">${activeTrip.crew && activeTrip.crew[0] ? activeTrip.crew[0].namaKru : 'Taqiyyan'}</p>
                    <p class="text-[9px] text-slate-400 font-mono">TOUR LEADER / UTAMA OPERASIONAL</p>
                </div>
            </div>
        </div>

    </div>

    <script>
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
    link.download = `ringkasan_anggaran_${activeTrip.namaDestinasi.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_PRINT.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Save the trip with modified budgets to firestore
  const saveTripBudget = async (updatedEntries: TripBudgetEntry[]) => {
    if (!activeTrip) return;
    try {
      await setDoc(doc(db, 'expedition_trips', activeTrip.id), {
        ...activeTrip,
        budgetEntries: updatedEntries
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `expedition_trips/${activeTrip.id}`);
    }
  };

  // Save PIC budgets map to Firestore
  const savePicBudgets = async (updatedBudgets: Record<string, number>) => {
    if (!activeTrip) return;
    try {
      await setDoc(doc(db, 'expedition_trips', activeTrip.id), {
        ...activeTrip,
        picBudgets: updatedBudgets
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `expedition_trips/${activeTrip.id}`);
    }
  };

  // Save custom overall PAGU to Firestore
  const saveCustomPagu = async (newPagu: number) => {
    if (!activeTrip) return;
    try {
      await setDoc(doc(db, 'expedition_trips', activeTrip.id), {
        ...activeTrip,
        customPagu: newPagu
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `expedition_trips/${activeTrip.id}`);
    }
  };

  const handleSavePagu = () => {
    saveCustomPagu(tempPagu);
    setIsEditingPagu(false);
  };

  const handleResetPagu = async () => {
    if (!activeTrip) return;
    try {
      const updatedTrip = { ...activeTrip };
      delete updatedTrip.customPagu;
      await setDoc(doc(db, 'expedition_trips', activeTrip.id), updatedTrip);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `expedition_trips/${activeTrip.id}`);
    }
  };

  const handleSavePicAllotment = (picName: string) => {
    const currentBudgets = activeTrip?.picBudgets || {};
    const updatedBudgets = {
      ...currentBudgets,
      [picName]: tempPicAllotment
    };
    savePicBudgets(updatedBudgets);
    setEditingPicName(null);
  };

  // Add fresh expense entry
  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTrip || !entryForm.name || !entryForm.amount) return;

    const newEntry: TripBudgetEntry = {
      id: `bgt-${Date.now()}`,
      pic: entryForm.pic,
      name: entryForm.name,
      amount: Number(entryForm.amount) || 0,
      category: entryForm.category,
      notes: entryForm.notes
    };

    saveTripBudget([...budgetEntries, newEntry]);
    setEntryForm(prev => ({ ...prev, name: '', notes: '' }));
  };

  // Remove budget entry
  const handleRemoveEntry = (id: string) => {
    const updated = budgetEntries.filter(entry => entry.id !== id);
    saveTripBudget(updated);
  };

  // Pre-seed mock values for standard trip expenditures to show incredible immediate value
  const seedDefaultBudgetEntries = () => {
    if (!activeTrip) return;
    const defaultEntries: TripBudgetEntry[] = [
      { id: `bgt-1-${Date.now()}`, pic: 'Taqiyyan', name: 'Tiket Masuk Simaksi Swarga', amount: 350000, category: 'Simaksi & Perizinan', notes: 'Untuk 10 orang pendaki' },
      { id: `bgt-2-${Date.now()}`, pic: 'Taqiyyan', name: 'Logistik Sayuran Basah Pasar Pagi', amount: 120000, category: 'Konsumsi', notes: 'Bayam, wortel, kol, kentang' },
      { id: `bgt-3-${Date.now()}`, pic: 'Haikal', name: 'Bumbu Dapur, Telur & Sosis Ayam', amount: 215000, category: 'Konsumsi', notes: 'Protein sarapan pagi' },
      { id: `bgt-4-${Date.now()}`, pic: 'Haikal', name: 'Obat P3K Tambahan & Oksigen Canister', amount: 95000, category: 'P3K & Obat', notes: 'Stok darurat pos bayangan' },
      { id: `bgt-5-${Date.now()}`, pic: 'Kiki', name: 'Pengisian Gas Portable Canister (7 Pcs)', amount: 105000, category: 'Peralatan & Gas', notes: 'Refill gas Dhaulagiri' },
      { id: `bgt-6-${Date.now()}`, pic: 'Kiki', name: 'Premium Beras Pandan Wangi 5kg', amount: 80000, category: 'Konsumsi', notes: 'Beli di agen beras' }
    ];

    saveTripBudget(defaultEntries);
  };

  // Indonesian currency formatting
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="space-y-6">

      {/* TRIP SELECTOR DROPDOWN ON TOP */}
      <div className="bg-white border border-slate-150 rounded-2xl p-4 shadow-3xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-0.5 text-center sm:text-left text-xs font-semibold">
          <span className="text-[9px] font-black uppercase tracking-widest text-[#11512f] font-mono">PEMILIHAN WORKSPACE BIAYA</span>
          <h2 className="text-sm font-black text-slate-800">Evaluasi Anggaran Pengeluaran Lapangan</h2>
        </div>

        <select
          value={selectedTripId}
          onChange={(e) => setSelectedTripId(e.target.value)}
          className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold focus:outline-none focus:border-[#11512f] transition text-center sm:text-left"
        >
          {trips.length > 0 ? (
            trips.map(t => (
              <option key={t.id} value={t.id}>
                {t.jenisTrip} {t.nomorTrip}: {t.namaDestinasi} ({t.tanggalMulai})
              </option>
            ))
          ) : (
            <option value="">Belum ada trip terdaftar</option>
          )}
        </select>
      </div>

      {activeTrip ? (
        <>
          {/* ======================================================== */}
          {/* TOP SUMMARY BAR */}
          {/* ======================================================== */}
          <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="space-y-0.5 text-xs font-bold leading-tight">
                <span className="text-[9px] font-mono text-emerald-800 uppercase tracking-widest block">RINGKASAN CASH FLOW EKSPEDISI</span>
                <h1 className="text-base sm:text-lg font-serif font-black text-slate-900 leading-snug">
                  Evaluasi Budget: {activeTrip.jenisTrip} {activeTrip.nomorTrip} - {activeTrip.namaDestinasi}
                </h1>
                <p className="text-[10px] text-slate-400 font-medium font-sans">
                  Garis Perjalanan: {activeTrip.tanggalMulai} s.d {activeTrip.tanggalSelesai} &middot; Lintasan {activeTrip.jalurPendakian}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {budgetEntries.length === 0 && (
                  <button
                    type="button"
                    onClick={seedDefaultBudgetEntries}
                    className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#11512f] border border-emerald-200 rounded-lg text-[10px] font-black cursor-pointer transition uppercase tracking-wider shrink-0"
                  >
                    Load Draf Biaya Trip
                  </button>
                )}

                <button
                  type="button"
                  onClick={handlePrintBudgetSummary}
                  className="px-3.5 py-1.5 bg-[#11512f] hover:bg-emerald-900 text-white border-0 rounded-lg text-[10px] font-black cursor-pointer transition uppercase tracking-wider shrink-0 flex items-center justify-center space-x-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Ringkasan Anggaran</span>
                </button>
              </div>
            </div>

            {/* MODERN GRID METRICS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Allocated Allotment */}
              <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 relative">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Total Anggaran Dialokasikan (Pagu)</span>
                
                {isEditingPagu ? (
                  <div className="mt-1 flex items-center space-x-1.5">
                    <span className="text-xs font-mono font-bold text-slate-400">Rp</span>
                    <input
                      type="number"
                      value={tempPagu}
                      onChange={(e) => setTempPagu(Number(e.target.value) || 0)}
                      className="px-2 py-1 border border-[#11512f] rounded-lg text-sm font-mono font-black text-slate-800 focus:outline-none w-32 bg-white"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSavePagu();
                        else if (e.key === 'Escape') setIsEditingPagu(false);
                      }}
                      onBlur={handleSavePagu}
                    />
                    <button
                      type="button"
                      onClick={handleSavePagu}
                      className="p-1 bg-emerald-100 text-emerald-800 rounded hover:bg-emerald-200 transition cursor-pointer"
                      title="Simpan Pagu"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingPagu(false)}
                      className="p-1 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition cursor-pointer"
                      title="Batal"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-base font-mono font-black text-slate-805 block">
                      {formatIDR(summary.totalAllotment)}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setTempPagu(summary.totalAllotment);
                        setIsEditingPagu(true);
                      }}
                      className="p-1 rounded text-[#11512f] hover:bg-emerald-50 cursor-pointer transition flex items-center justify-center"
                      title="Klik untuk mengubah pagu anggaran trip"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-[#11512f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    
                    {activeTrip?.customPagu !== undefined && (
                      <button
                        type="button"
                        onClick={handleResetPagu}
                        className="text-[8px] text-slate-400 hover:text-[#11512f] underline font-mono cursor-pointer"
                        title="Revert back to sum of PIC allotments"
                      >
                        Reset Ke Akumulasi
                      </button>
                    )}
                  </div>
                )}
                
                <span className="text-[8.5px] text-slate-400 mt-1 block">
                  {activeTrip?.customPagu !== undefined ? (
                    <span className="text-emerald-700 font-bold">✓ Kustom pagu aktif (Akumulasi Kru: {formatIDR(summary.sumAllotments)})</span>
                  ) : (
                    <span>Akumulasi limit anggaran para PIC</span>
                  )}
                </span>
              </div>

              {/* Realized Spent */}
              <div className="p-4 rounded-xl border border-emerald-150 bg-emerald-50/30">
                <span className="text-[9px] font-bold text-[#11512f] uppercase tracking-wider block">Total Realisasi Pengeluaran</span>
                <span className="text-base font-mono font-black text-[#11512f] block mt-1">{formatIDR(summary.totalSpent)}</span>
                <span className="text-[8.5px] text-emerald-700 font-medium mt-1 block">Tercatat {budgetEntries.length} pengeluaran lapangan</span>
              </div>

              {/* Selisih Balance */}
              <div className="p-4 rounded-xl border border-slate-205 bg-slate-50/50">
                <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block">Sisa Selisih Anggaran (Sisa Saldo)</span>
                <span className={`text-base font-mono font-black block mt-1 ${summary.selisih >= 0 ? 'text-teal-700' : 'text-rose-600'}`}>
                  {formatIDR(summary.selisih)}
                </span>
                <span className="text-[8.5px] text-slate-400 mt-1 block">
                  {summary.selisih >= 0 ? 'Surplus anggaran (Sisa aman)' : 'Overbudget! Kurang anggaran!!'}
                </span>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* TWO PANEL CONTENT: LEFT ADD EXPENSE, RIGHT SUMMARY PIC CARDS */}
          {/* ======================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-xs text-slate-705 font-medium">
            
            {/* LEFT COLUMN: ADD ENTRY FORM */}
            <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-2xs lg:col-span-4 space-y-4">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center">
                <TrendingUp className="w-4 h-4 text-[#11512f] mr-1.5" />
                <span>Pencatatan Biaya</span>
              </h3>

              <form onSubmit={handleAddEntry} className="space-y-4 font-bold text-slate-700">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">PIC Pembelanja *</label>
                  <select
                    value={entryForm.pic}
                    onChange={(e) => setEntryForm(prev => ({ ...prev, pic: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:border-[#11512f] focus:bg-white transition"
                  >
                    {picList.map(picName => (
                      <option key={picName} value={picName}>{picName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nama Barang / Keperluan *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Tiket Masuk Simaksi"
                    value={entryForm.name}
                    onChange={(e) => setEntryForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:border-[#11512f] focus:bg-white transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Kategori Biaya</label>
                    <select
                      value={entryForm.category}
                      onChange={(e) => setEntryForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:border-[#11512f] transition"
                    >
                      <option value="Konsumsi">Konsumsi</option>
                      <option value="Transportasi">Transportasi</option>
                      <option value="Simaksi & Perizinan">Simaksi &amp; Perizinan</option>
                      <option value="Peralatan & Gas">Peralatan &amp; Gas</option>
                      <option value="P3K & Obat">P3K &amp; Obat</option>
                      <option value="Sewa Alat">Sewa Alat</option>
                      <option value="Uang Saku Porter">Uang Saku Porter</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nominal (Rupiah) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={entryForm.amount}
                      onChange={(e) => setEntryForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:border-[#11512f] focus:bg-white transition text-center font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Catatan Tambahan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Bukti nota disimpan oleh Haikal"
                    value={entryForm.notes}
                    onChange={(e) => setEntryForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:border-[#11512f]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-[#11512f] hover:bg-emerald-900 border-0 rounded-lg text-white font-extrabold cursor-pointer flex items-center justify-center space-x-1 transition text-xs shadow-sm uppercase font-sans py-2.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Catat Pengeluaran</span>
                </button>
              </form>
            </div>

            {/* RIGHT COLUMN: EVERY PIC DISPLAY CARDS AS COMMANDED BY THE USER */}
            <div className="lg:col-span-8 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-bold">
                {picList.map((picName) => {
                  // Filter out this PIC's individual expenditures
                  const picSpentEntries = budgetEntries.filter(entry => entry.pic === picName);
                  const picTotalAllotment = getAllotment(picName);
                  const picTotalSpent = picSpentEntries.reduce((sum, entry) => sum + entry.amount, 0);
                  const picSelisih = picTotalAllotment - picTotalSpent;

                  return (
                    <div 
                      key={picName} 
                      className="bg-white border border-slate-150 rounded-2xl p-4.5 shadow-2xs flex flex-col justify-between space-y-4"
                    >
                      {/* CARD HEADER WITH PIC NAME AND STATS */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <h4 className="font-black text-slate-900 text-xs flex items-center uppercase tracking-wide">
                            <User className="w-4 h-4 text-[#11512f] mr-1" />
                            <span>{picName}</span>
                          </h4>
                          
                          {editingPicName === picName ? (
                            <div className="flex items-center space-x-1">
                              <span className="text-[9px] text-slate-400 font-mono">Rp</span>
                              <input
                                type="number"
                                value={tempPicAllotment}
                                onChange={(e) => setTempPicAllotment(Number(e.target.value) || 0)}
                                className="w-20 px-1 py-0.5 border border-[#11512f] rounded text-[10px] font-mono font-black text-slate-800 bg-white"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSavePicAllotment(picName);
                                  } else if (e.key === 'Escape') {
                                    setEditingPicName(null);
                                  }
                                }}
                                onBlur={() => handleSavePicAllotment(picName)}
                              />
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPicName(picName);
                                setTempPicAllotment(picTotalAllotment);
                              }}
                              className="text-[9px] font-mono text-[#11512f] hover:text-emerald-950 font-black cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded transition flex items-center gap-0.5"
                              title="Edit alokasi anggaran kru ini"
                            >
                              <span>Alloc: {formatIDR(picTotalAllotment)}</span>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 text-[#11512f]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                          )}
                        </div>

                        {/* Card mini-stats bar */}
                        <div className="grid grid-cols-2 gap-2 text-[10px] tracking-tight leading-normal uppercase">
                          <div className="p-2 bg-slate-50 border rounded-xl">
                            <span className="text-[8px] text-slate-400 block font-mono">Belanja Lapangan</span>
                            <span className="font-mono font-black text-slate-800 block">{formatIDR(picTotalSpent)}</span>
                          </div>
                          <div className={`p-2 border rounded-xl ${picSelisih >= 0 ? 'bg-emerald-50/50 border-emerald-100 text-teal-850' : 'bg-rose-50/55 border-rose-100 text-rose-800'}`}>
                            <span className="text-[8px] text-slate-400 block font-mono">Sisa Saldo</span>
                            <span className="font-mono font-black block">{formatIDR(picSelisih)}</span>
                          </div>
                        </div>
                      </div>

                      {/* EXPENDITURES LIST IN CARD WITH VERTICAL BOXES FOR HP SCANNING */}
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-0.5">
                        {picSpentEntries.length > 0 ? (
                          picSpentEntries.map((item) => (
                            <div 
                              key={item.id} 
                              className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl leading-snug flex items-center justify-between gap-2 text-[10.5px] font-bold"
                            >
                              <div className="space-y-0.5">
                                <span className="font-extrabold text-slate-800 block leading-tight">{item.name}</span>
                                <div className="text-[8.5px] text-slate-400 font-mono tracking-wider flex items-center space-x-1.5 uppercase font-medium">
                                  <span className="bg-slate-200 px-1 py-0.2 rounded-sm">{item.category}</span>
                                  {item.notes && <span className="truncate max-w-44">• {item.notes}</span>}
                                </div>
                              </div>

                              <div className="flex items-center space-x-2 shrink-0">
                                <span className="font-mono font-extrabold text-slate-800 text-[10.5px]">
                                  {formatIDR(item.amount)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveEntry(item.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer rounded transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6 text-[10px] text-slate-400 font-mono italic">Belum ada pengeluaran tercatat untuk {picName}.</div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </>
      ) : (
        <div className="text-center py-16 bg-white border border-dashed rounded-2xl text-slate-400 space-y-3 flex flex-col items-center justify-center">
          <AlertCircle className="w-10 h-10 text-slate-300" />
          <div className="space-y-0.5">
            <span className="font-black text-xs text-slate-705">Workspace Kosong</span>
            <p className="text-[10px] font-bold max-w-sm">Daftarkan draf perjalanan atau hub logistik di menu "Pemakaian Trip" terlebih dahulu sebelum mengakses penganggaran ekspedisi.</p>
          </div>
        </div>
      )}

    </div>
  );
}
