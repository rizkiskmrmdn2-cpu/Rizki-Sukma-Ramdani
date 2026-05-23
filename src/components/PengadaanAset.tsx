import React, { useState, useEffect, useMemo, useId } from 'react';
import { 
  Briefcase, 
  TrendingUp, 
  Coins, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Plus, 
  Trash2, 
  Layers, 
  Building2, 
  Sparkles, 
  ShoppingBag,
  HelpCircle,
  BarChart4,
  Check,
  ChevronRight
} from 'lucide-react';
import { InventoryItem } from '../types';
import { formatRupiah } from '../utils';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';

export interface ProcurementItem {
  id: string;
  namaBarang: string;
  kategori: 'Peralatan Gunung' | 'Logistik Konsumsi' | 'Peralatan Basecamp' | 'Dokumentasi' | 'Safety & Rescue' | 'Elektronik' | 'Medis' | 'Lainnya';
  tujuan: string;
  jumlah: number;
  estimasiHarga: number;
  prioritas: 'Rendah' | 'Sedang' | 'Tinggi' | 'Mendesak';
  status: 'Wishlist' | 'Menunggu Persetujuan' | 'Disetujui' | 'Sedang Dibeli' | 'Sudah Dibeli' | 'Ditunda';
  vendor: string;
  catatan: string;
  tanggalPengajuan: string;
}

interface Props {
  inventory: InventoryItem[];
  onAddInventarisItem?: (item: any) => void;
  userRole: string;
}

export default function PengadaanAset({ inventory, onAddInventarisItem, userRole }: Props) {
  const baseId = useId();

  // Local state for Procurement loaded and synced live via Firestore
  const [items, setItems] = useState<ProcurementItem[]>([]);

  const [filterKategori, setFilterKategori] = useState<string>('Semua');
  const [filterPrioritas, setFilterPrioritas] = useState<string>('Semua');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    namaBarang: '',
    kategori: 'Peralatan Gunung' as any,
    tujuan: '',
    jumlah: 1,
    estimasiHarga: 0,
    prioritas: 'Sedang' as any,
    status: 'Menunggu Persetujuan' as any,
    vendor: '',
    catatan: ''
  });

  // Firestore real-time synchronization
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'procurements'), (snapshot) => {
      const data: ProcurementItem[] = [];
      snapshot.forEach((d) => {
        data.push(d.data() as ProcurementItem);
      });
      // Sort procurements newest first (PRC- timestamp or Date.now)
      data.sort((a, b) => b.id.localeCompare(a.id));
      setItems(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'procurements');
    });

    return () => unsubscribe();
  }, []);

  // Compute stats
  const stats = useMemo(() => {
    let totalAnggaranSemua = 0;
    let totalAnggaranSelesai = 0;
    let totalSelesaiCount = 0;
    let prioritasTinggiCount = 0;
    let estimasiAsetBaruVal = 0;

    const categorySummary: { [key: string]: number } = {
      'Peralatan Gunung': 0,
      'Logistik Konsumsi': 0,
      'Peralatan Basecamp': 0,
      'Dokumentasi': 0,
      'Safety & Rescue': 0,
      'Elektronik': 0,
      'Medis': 0,
      'Lainnya': 0
    };

    items.forEach((it) => {
      const subtotal = it.estimasiHarga * it.jumlah;
      totalAnggaranSemua += subtotal;

      categorySummary[it.kategori] += subtotal;

      if (it.status === 'Sudah Dibeli') {
        totalAnggaranSelesai += subtotal;
        totalSelesaiCount++;
      } else if (it.status !== 'Ditunda') {
        estimasiAsetBaruVal += subtotal;
      }

      if (it.prioritas === 'Tinggi' || it.prioritas === 'Mendesak') {
        if (it.status !== 'Sudah Dibeli' && it.status !== 'Ditunda') {
          prioritasTinggiCount++;
        }
      }
    });

    return {
      totalAnggaranSemua,
      totalAnggaranSelesai,
      totalSelesaiCount,
      prioritasTinggiCount,
      estimasiAsetBaruVal,
      categorySummary
    };
  }, [items]);

  // Automated Needs & Recommendation Analysis
  const smartRecommendations = useMemo(() => {
    const list: string[] = [];

    // 1. Analyze Inventory low weights or quantities
    const lowStockGears = inventory.filter(it => it.kuantitas <= 2);
    if (lowStockGears.length > 0) {
      list.push(`Stok kritis terdeteksi: Terdapat ${lowStockGears.length} barang di gudang dengan sisa stok ≤ 2. Segera rencanakan pengisian ulang.`);
    }

    // 2. Specific trip constraints recommendation
    const totalTendas = inventory.filter(it => it.namaBarang.toLowerCase().includes('tenda') || it.kategoriBarang === 'Kemah')
      .reduce((sum, it) => sum + it.kuantitas, 0);
    const readyTendas = inventory.filter(it => (it.namaBarang.toLowerCase().includes('tenda') || it.kategoriBarang === 'Kemah') && it.statusBarang === 'Ready')
      .reduce((sum, it) => sum + it.kuantitas, 0);

    if (totalTendas < 8) {
      list.push('Berdasarkan kapasitas operasional high-season: Total tenda berkapasitas 4 orang kurang aman jika melayani lebih dari 2 trip paralel (> 20 orang peserta). Disarankan memesan minimum 4 unit tenda baru.');
    } else if (readyTendas <= 2) {
      list.push('Stok tenda di gudang saat ini sebagian besar sedang terpakai trip lapangan. Segera lakukan review status pengembalian barang atau ajukan back-up.');
    }

    // 3. Electronic Safety items recommendation
    const totalHandyTalky = inventory.filter(it => it.namaBarang.toLowerCase().includes('ht') || it.namaBarang.toLowerCase().includes('talky') || it.namaBarang.toLowerCase().includes('komunikasi'))
      .reduce((sum, it) => sum + it.kuantitas, 0);
    if (totalHandyTalky < 5) {
      list.push('Safety Standard Alert: Jumlah Handy Talky (HT) aktif di inventaris kurang dari 5 unit. Demi kelaikan keselamatan kru, disarankan memiliki HT cadangan yang memadai.');
    }

    // 4. Medicine or P3K consumption rate
    const p3kItems = inventory.filter(it => it.kategoriBarang === 'P3K' || it.kategoriBarang === 'Obat-obatan');
    const totalP3K = p3kItems.reduce((sum, it) => sum + it.kuantitas, 0);
    if (totalP3K < 4) {
      list.push('Persediaan obat-obatan (P3K) berada di bawah batas rekomendasi (minimum 4 box standard medis). Ajukan restock obat habis pakai lapangan bulanan.');
    }

    // Default Fallbacks
    if (list.length === 0) {
      list.push('Gudang dalam kondisi kuantitatif prima. Semua logistik trip dan peralatan keselamatan berada di atas ambang batas kritis.');
    }

    return list;
  }, [inventory]);

  // Handle Form Submits
  const handleCreateProcurement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaBarang || formData.estimasiHarga <= 0) {
      alert('Isi nama barang dan harga estimasi secara valid!');
      return;
    }

    const newItem: ProcurementItem = {
      id: `PRC-${Date.now()}`,
      namaBarang: formData.namaBarang,
      kategori: formData.kategori,
      tujuan: formData.tujuan,
      jumlah: Number(formData.jumlah),
      estimasiHarga: Number(formData.estimasiHarga),
      prioritas: formData.prioritas,
      status: formData.status,
      vendor: formData.vendor || 'Belum Ditentukan',
      catatan: formData.catatan,
      tanggalPengajuan: new Date().toISOString().split('T')[0]
    };

    try {
      await setDoc(doc(db, 'procurements', newItem.id), newItem);
      setShowAddForm(false);
      setFormData({
        namaBarang: '',
        kategori: 'Peralatan Gunung',
        tujuan: '',
        jumlah: 1,
        estimasiHarga: 0,
        prioritas: 'Sedang',
        status: 'Menunggu Persetujuan',
        vendor: '',
        catatan: ''
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `procurements/${newItem.id}`);
    }
  };

  const handleDeleteProcurement = async (id: string) => {
    let confirmDelete = true;
    try {
      confirmDelete = window.confirm('Apakah Anda yakin ingin menghapus perencanaan pengadaan barang ini?');
    } catch (e) {
      // In sandbox/iframe environment where confirm is blocked, proceed with deletion directly
      confirmDelete = true;
    }
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, 'procurements', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `procurements/${id}`);
      }
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: ProcurementItem['status']) => {
    try {
      await updateDoc(doc(db, 'procurements', id), { status: newStatus });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `procurements/${id}`);
    }
  };

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((it) => {
      const matchCat = filterKategori === 'Semua' || it.kategori === filterKategori;
      const matchPrio = filterPrioritas === 'Semua' || it.prioritas === filterPrioritas;
      const matchStat = filterStatus === 'Semua' || it.status === filterStatus;
      return matchCat && matchPrio && matchStat;
    });
  }, [items, filterKategori, filterPrioritas, filterStatus]);

  // Check RBAC permissions
  const canModify = userRole === 'Kepala Logistik' || userRole === 'Super Admin' || userRole === 'Administrator' || userRole === 'rizki' || userRole === 'barengintrip';

  return (
    <div className="space-y-6">
      {/* Welcome & Overview Banner */}
      <div className="relative bg-[#0a311c] text-white rounded-2xl p-6 md:p-8 overflow-hidden border border-emerald-950 shadow-md">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center space-x-2 bg-emerald-800/60 text-emerald-100 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
            <Briefcase className="h-3 w-3 text-emerald-300" />
            <span>Operational Assets &amp; Procurement Management</span>
          </div>
          <h1 className="text-xl md:text-2.5xl font-black tracking-tight leading-none text-white">
            Pengadaan &amp; Perencanaan Aset Ekspedisi
          </h1>
          <p className="text-xs text-emerald-100/80 leading-relaxed font-semibold">
            Rencanakan anggaran kebutuhan logistik grup, ajukan wishlist peralatan ekspedisi, pantau persetujuan prioritas, dan automasi restock alat Basecamp PT. Barengin Trip.
          </p>
        </div>
      </div>

      {/* PROCUREMENT STATS CHIPS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Estimasi Aset Baru */}
        <div className="bg-white rounded-xl border border-slate-150 p-4 shadow-2xs flex items-center space-x-3.5">
          <div className="p-3 bg-emerald-50 text-[#11512f] rounded-xl font-bold shrink-0">
            <Coins className="h-5 w-5" />
          </div>
          <div className="overflow-hidden">
            <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider truncate">Kebutuhan Anggaran</p>
            <h3 className="text-sm font-black text-slate-800 truncate">{formatRupiah(stats.estimasiAsetBaruVal)}</h3>
            <p className="text-[9px] text-slate-400 leading-none">Wishlist beredar</p>
          </div>
        </div>

        {/* Pengadaan Selesai */}
        <div className="bg-white rounded-xl border border-slate-150 p-4 shadow-2xs flex items-center space-x-3.5">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl font-bold shrink-0">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Pengadaan Selesai</p>
            <h3 className="text-sm font-black text-slate-800">{stats.totalSelesaiCount} / {items.length} Barang</h3>
            <p className="text-[9px] text-[#10b981] font-bold">Terealisasi dengan mulus</p>
          </div>
        </div>

        {/* Prioritas Mendesak */}
        <div className="bg-white rounded-xl border border-slate-150 p-4 shadow-2xs flex items-center space-x-3.5">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl font-bold shrink-0">
            <AlertCircle className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Antrean High-Priority</p>
            <h3 className="text-sm font-black text-rose-700">{stats.prioritasTinggiCount} Item Aktif</h3>
            <p className="text-[9px] text-slate-400 font-semibold">Memerlukan persetujuan segera</p>
          </div>
        </div>

        {/* Total Anggaran Selesai / Terealisasi */}
        <div className="bg-white rounded-xl border border-slate-150 p-4 shadow-2xs flex items-center space-x-3.5">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl font-bold shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div className="overflow-hidden">
            <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider truncate">Anggaran Terealisasi</p>
            <h3 className="text-sm font-black text-slate-800 truncate">{formatRupiah(stats.totalAnggaranSelesai)}</h3>
            <p className="text-[9px] text-slate-400 leading-none">Dari nilai total {formatRupiah(stats.totalAnggaranSemua)}</p>
          </div>
        </div>
      </div>

      {/* CORE GRID: ANALYTICS REC & BUDGET PROGRESS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: BUDGET BY CATEGORIES */}
        <div className="bg-white border border-slate-150 rounded-xl p-5 shadow-2xs lg:col-span-5 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <BarChart4 className="h-5 w-5 text-[#11512f]" />
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Distribusi Anggaran Aset</span>
          </div>

          <div className="space-y-3 pt-1">
            {Object.keys(stats.categorySummary).map((catName) => {
              const catCost = stats.categorySummary[catName];
              const pct = stats.totalAnggaranSemua > 0 ? (catCost / stats.totalAnggaranSemua) * 100 : 0;
              return (
                <div key={catName} className="space-y-1.5 text-xs text-slate-705">
                  <div className="flex justify-between font-bold text-slate-700 leading-none text-[11px]">
                    <span className="truncate max-w-[180px]">{catName}</span>
                    <span className="shrink-0">{formatRupiah(catCost)} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-slate-50 border border-slate-100 rounded-full h-2 overflow-hidden shadow-2xs">
                    <div 
                      className="bg-[#11512f] h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: SMART RECOM & DATA ANALYTICS */}
        <div className="bg-white border border-slate-150 rounded-xl p-5 shadow-2xs lg:col-span-7 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Sparkles className="h-5 w-5 text-emerald-600 animate-spin-slow" />
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Analisa Cerdas Kebutuhan Logistik</span>
          </div>

          <div className="bg-emerald-50/55 rounded-xl border border-emerald-100/60 p-4 space-y-3.5">
            <h4 className="text-[11px] font-bold text-[#11512f] uppercase tracking-wider font-mono flex items-center space-x-1.5 leading-none">
              <span>● Smart Operational Insight (Rekomendasi)</span>
            </h4>

            <div className="space-y-2.5">
              {smartRecommendations.map((recText, idx) => (
                <div key={idx} className="flex items-start space-x-2.5 text-[11px] text-slate-700 leading-relaxed font-semibold">
                  <div className="h-2 w-2 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0" />
                  <p>{recText}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-1.5 text-[10px] text-slate-400 font-bold p-1 italic leading-relaxed">
            <HelpCircle className="h-3 w-3 inline mr-1 self-center" />
            <span>Sistem menganalisa database logistik, ketersediaan alat, dan riwayat trip untuk merekomendasikan volume cadangan secara prediktif demi nihil kendala di gunung.</span>
          </div>
        </div>
      </div>

      {/* PROCUREMENTS MANAGEMENT PANEL */}
      <div className="bg-white border border-slate-150 rounded-xl p-5 shadow-2xs space-y-4">
        {/* Actions header bar with filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-105 pb-4">
          <div className="space-y-0.5">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-1 px-1">
              <ShoppingBag className="h-4.5 w-4.5 inline text-[#11512f] mr-1" />
              <span>Daftar Pengajuan Anggaran &amp; Aset</span>
            </span>
            <p className="text-[9px] text-slate-400 font-bold px-1">Mengendalikan {filteredItems.length} item pengadaan terfilter</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-slate-500">
            {/* Filter Category */}
            <div className="flex items-center space-x-1 bg-slate-50 px-2.5 py-1 text-xs border border-slate-150 rounded-lg">
              <span>Kategori:</span>
              <select 
                value={filterKategori} 
                onChange={(e) => setFilterKategori(e.target.value)}
                className="bg-transparent border-0 py-0.5 px-1 pr-4 focus:ring-0 focus:outline-hidden font-bold text-slate-700/85"
              >
                <option value="Semua">Semua</option>
                <option value="Peralatan Gunung">Peralatan Gunung</option>
                <option value="Logistik Konsumsi">Logistik Konsumsi</option>
                <option value="Peralatan Basecamp">Peralatan Basecamp</option>
                <option value="Dokumentasi">Dokumentasi</option>
                <option value="Safety & Rescue">Safety & Rescue</option>
                <option value="Elektronik">Elektronik</option>
                <option value="Medis">Medis</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            {/* Filter Prioritas */}
            <div className="flex items-center space-x-1 bg-slate-50 px-2.5 py-1 text-xs border border-slate-150 rounded-lg">
              <span>Prioritas:</span>
              <select 
                value={filterPrioritas} 
                onChange={(e) => setFilterPrioritas(e.target.value)}
                className="bg-transparent border-0 py-0.5 px-1 pr-4 focus:ring-0 focus:outline-hidden font-bold text-slate-700/85"
              >
                <option value="Semua">Semua</option>
                <option value="Rendah">Rendah</option>
                <option value="Sedang">Sedang</option>
                <option value="Tinggi">Tinggi</option>
                <option value="Mendesak">Mendesak</option>
              </select>
            </div>

            {/* Filter Status */}
            <div className="flex items-center space-x-1 bg-slate-50 px-2.5 py-1 text-xs border border-slate-150 rounded-lg">
              <span>Status:</span>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-transparent border-0 py-0.5 px-1 pr-4 focus:ring-0 focus:outline-hidden font-bold text-slate-700/85"
              >
                <option value="Semua">Semua</option>
                <option value="Wishlist">Wishlist</option>
                <option value="Menunggu Persetujuan">Menunggu Persetujuan</option>
                <option value="Disetujui">Disetujui</option>
                <option value="Sedang Dibeli">Sedang Dibeli</option>
                <option value="Sudah Dibeli">Sudah Dibeli</option>
                <option value="Ditunda">Ditunda</option>
              </select>
            </div>

            {/* Action button Add Wishlist */}
            {canModify && (
              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-3 py-1.5 bg-[#11512f] hover:bg-emerald-800 text-white border-0 rounded-lg cursor-pointer transition font-extrabold flex items-center space-x-1 uppercase text-[10px] shadow-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Ajukan Pengadaan</span>
              </button>
            )}
          </div>
        </div>

        {/* INPUT FORM (COLLAPSIBLE) */}
        {showAddForm && (
          <form onSubmit={handleCreateProcurement} className="bg-slate-50 p-4 border border-slate-150 rounded-xl text-xs space-y-3 pt-4">
            <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wider font-mono">+ Form Pengajuan Anggaran</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-550 uppercase tracking-wider mb-1">Nama Barang *</label>
                <input
                  type="text"
                  required
                  placeholder="Cth: Flysheet Waterproof 3x4"
                  value={formData.namaBarang}
                  onChange={(e) => setFormData(prev => ({ ...prev, namaBarang: e.target.value }))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#11512f]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-550 uppercase tracking-wider mb-1">Kategori Logistik *</label>
                <select
                  value={formData.kategori}
                  onChange={(e) => setFormData(prev => ({ ...prev, kategori: e.target.value as any }))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#11512f]"
                >
                  <option value="Peralatan Gunung">Peralatan Gunung</option>
                  <option value="Logistik Konsumsi">Logistik Konsumsi</option>
                  <option value="Peralatan Basecamp">Peralatan Basecamp</option>
                  <option value="Dokumentasi">Dokumentasi</option>
                  <option value="Safety & Rescue">Safety & Rescue</option>
                  <option value="Elektronik">Elektronik</option>
                  <option value="Medis">Medis</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-550 uppercase tracking-wider mb-1">Toko / Vendor Rekomendasi</label>
                <input
                  type="text"
                  placeholder="Cth: Eiger-Store Official / Tokopedia"
                  value={formData.vendor}
                  onChange={(e) => setFormData(prev => ({ ...prev, vendor: e.target.value }))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#11512f]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-550 uppercase tracking-wider mb-1">Kuantitas Qty *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.jumlah}
                  onChange={(e) => setFormData(prev => ({ ...prev, jumlah: Number(e.target.value) }))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#11512f] text-center"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-550 uppercase tracking-wider mb-1">Estimasi Harga Satuan *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1000"
                  value={formData.estimasiHarga}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimasiHarga: Number(e.target.value) }))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#11512f] text-right font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-550 uppercase tracking-wider mb-1">Prioritas *</label>
                <select
                  value={formData.prioritas}
                  onChange={(e) => setFormData(prev => ({ ...prev, prioritas: e.target.value as any }))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#11512f]"
                >
                  <option value="Rendah">Rendah</option>
                  <option value="Sedang">Sedang</option>
                  <option value="Tinggi">Tinggi</option>
                  <option value="Mendesak">Mendesak</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-550 uppercase tracking-wider mb-1">Status Awal *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#11512f]"
                >
                  <option value="Wishlist">Wishlist</option>
                  <option value="Menunggu Persetujuan">Menunggu Persetujuan</option>
                  <option value="Disetujui">Disetujui</option>
                  <option value="Sedang Dibeli">Sedang Dibeli</option>
                  <option value="Sudah Dibeli">Sudah Dibeli</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-550 uppercase tracking-wider mb-1">Tujuan Penggunaan *</label>
                <input
                  type="text"
                  required
                  placeholder="Mengapa barang ini mendesak dibeli?"
                  value={formData.tujuan}
                  onChange={(e) => setFormData(prev => ({ ...prev, tujuan: e.target.value }))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#11512f]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-550 uppercase tracking-wider mb-1">Catatan Tambahan Keputusan</label>
                <input
                  type="text"
                  placeholder="Cth: Cari seri hijau, koordinasikan dengan tim keuangan"
                  value={formData.catatan}
                  onChange={(e) => setFormData(prev => ({ ...prev, catatan: e.target.value }))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#11512f]"
                />
              </div>
            </div>

            <div className="flex justify-end items-center space-x-2.5 pt-2 border-t border-slate-200">
              <button
                type="button"
                className="px-4 py-2 bg-white hover:bg-slate-100 rounded-lg font-bold border border-slate-200 cursor-pointer text-slate-700 transition"
                onClick={() => setShowAddForm(false)}
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#11512f] hover:bg-emerald-800 text-white rounded-lg font-bold border-0 cursor-pointer transition shadow-sm"
              >
                Simpan Usulan
              </button>
            </div>
          </form>
        )}

        {/* WISHLIST DATA GRID LIST */}
        {filteredItems.length > 0 ? (
          <div className="overflow-x-auto border border-slate-150 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[9px] font-bold tracking-wider divide-y divide-slate-100">
                <tr>
                  <th className="px-4 py-3">Barang &amp; Kategori</th>
                  <th className="px-4 py-3">Tujuan &amp; Info Usulan</th>
                  <th className="px-4 py-3 text-center">Prioritas</th>
                  <th className="px-4 py-3 text-center">Kuantitas</th>
                  <th className="px-4 py-3 text-right font-mono">Harga Satuan</th>
                  <th className="px-4 py-3 text-right font-mono">Estimasi Total</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  {canModify && <th className="px-4 py-3 text-center">Kelola Status / Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white font-semibold">
                {filteredItems.map((it) => {
                  const estTotal = it.estimasiHarga * it.jumlah;
                  return (
                    <tr key={it.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-4 py-3 text-slate-800">
                        <div className="font-bold text-slate-800">{it.namaBarang}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{it.kategori} (ID: {it.id})</div>
                      </td>
                      <td className="px-4 py-3 text-slate-650 font-normal leading-relaxed max-w-sm">
                        <p>{it.tujuan}</p>
                        <div className="text-[9px] font-mono text-slate-400 mt-1 flex items-center space-x-2">
                          <span>Vendor: <span className="text-slate-600 font-extrabold">{it.vendor}</span></span>
                          <span>• Dibuat: {it.tanggalPengajuan}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                          it.prioritas === 'Mendesak' ? 'bg-rose-550 text-rose-700 bg-rose-50 border border-rose-100' :
                          it.prioritas === 'Tinggi' ? 'bg-orange-550 text-orange-700 bg-orange-50 border border-orange-100' :
                          it.prioritas === 'Sedang' ? 'bg-amber-550 text-amber-700 bg-amber-50 border border-amber-100' :
                          'bg-slate-100 text-slate-600 border border-slate-150'
                        }`}>
                          {it.prioritas}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-slate-800">
                        {it.jumlah} unit
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-850">
                        {formatRupiah(it.estimasiHarga)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-[#11512f] font-black">
                        {formatRupiah(estTotal)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${
                          it.status === 'Sudah Dibeli' ? 'bg-teal-50 text-teal-700 border border-teal-100' :
                          it.status === 'Sedang Dibeli' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          it.status === 'Disetujui' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' :
                          it.status === 'Ditunda' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                          it.status === 'Menunggu Persetujuan' ? 'bg-yellow-50 text-yellow-700 border border-yellow-100 font-bold' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {it.status}
                        </span>
                      </td>

                      {canModify && (
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center space-x-1.5 shrink-0">
                            {/* Fast status adjustment */}
                            <select
                              value={it.status}
                              onChange={(e) => handleUpdateStatus(it.id, e.target.value as any)}
                              className="px-1.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-[10.5px] font-bold focus:outline-hidden text-slate-700 focus:border-[#11512f]"
                            >
                              <option value="Wishlist">Wishlist</option>
                              <option value="Menunggu Persetujuan">Persetujuan</option>
                              <option value="Disetujui">Disetujui</option>
                              <option value="Sedang Dibeli">Dibeli</option>
                              <option value="Sudah Dibeli">Sudah Dibeli</option>
                              <option value="Ditunda">Ditunda</option>
                            </select>

                            <button
                              type="button"
                              onClick={() => handleDeleteProcurement(it.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 border-0 cursor-pointer"
                              title="Hapus Usulan"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-slate-400 space-y-2">
            <ShoppingBag className="h-8 w-8 mx-auto text-slate-300" />
            <div className="space-y-0.5">
              <p className="text-xs font-bold font-mono">Belum Ada Wishlist Anggaran Terfilter</p>
              <p className="text-[10px]">Coba cari dengan kategori, prioritas, atau status yang berbeda.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
