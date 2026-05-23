import React, { useState, useMemo, useId } from 'react';
import { 
  Package, 
  Map, 
  Wrench, 
  ShowerHead, 
  AlertTriangle, 
  Coins, 
  TrendingDown, 
  Clock, 
  Compass,
  ArrowRightLeft,
  Store,
  Check
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { InventoryItem, ActivityLog } from '../types';
import { calculateDepreciation, formatRupiah } from '../utils';

interface Props {
  inventory: InventoryItem[];
  logs: ActivityLog[];
  onReturnItem: (logId: string, kondisiKembali: 'Baru' | 'Baik' | 'Rusak Ringan' | 'Tidak Dapat Dipakai') => void;
}

export default function Dashboard({ inventory, logs, onReturnItem }: Props) {
  const baseId = useId();
  const [returnLogId, setReturnLogId] = useState<string | null>(null);
  const [kondisiKembali, setKondisiKembali] = useState<'Baru' | 'Baik' | 'Rusak Ringan' | 'Tidak Dapat Dipakai'>('Baik');

  // Hitung stats utama secara presisi berdasarkan inventory dan logs saat ini
  const stats = useMemo(() => {
    let totalItemsValue = 0;
    let totalDeprValue = 0;
    let totalDistinctItems = inventory.length;
    let totalQty = 0;
    let readyQty = 0;
    let tripQty = 0;
    let rentQty = 0;
    let repairQty = 0;
    let maintenanceQty = 0;
    let criticalStockCount = 0;

    inventory.forEach((item) => {
      const { nilaiDepresiasi } = calculateDepreciation(item.hargaPembelian, item.tanggalPembelian);
      const itemQty = item.kuantitas;
      
      totalQty += itemQty;
      totalItemsValue += item.hargaPembelian * itemQty;
      totalDeprValue += nilaiDepresiasi * itemQty;

      // Status-based counting
      if (item.statusBarang === 'Ready') {
        readyQty += itemQty;
      } else if (item.statusBarang === 'Pemakaian') {
        tripQty += itemQty;
      } else if (item.statusBarang === 'Perbaikan') {
        repairQty += itemQty;
      } else if (item.statusBarang === 'Perawatan') {
        maintenanceQty += itemQty;
      }

      // Kebutuhan maintenance / reparasi dari kolom penanganan
      if (item.penanganan === 'Perbaikan') {
        // jika belum terhitung secara status
        if (item.statusBarang !== 'Perbaikan') repairQty += 1;
      } else if (item.penanganan === 'Perawatan') {
        if (item.statusBarang !== 'Perawatan') maintenanceQty += 1;
      }

      // Kritis habis pakai hampir habis (Kuantitas <= 5 untuk penunjang/konsumsi/habis pakai)
      if (['Bahan Baku Konsumsi', 'Perlengkapan Habis Pakai', 'Obat-obatan'].includes(item.kategoriBarang) && itemQty <= 5) {
        criticalStockCount++;
      }
    });

    // Hitung disewakan & hilang dari logs
    let lostQty = 0;
    logs.forEach((log) => {
      if (log.jenisAktivitas === 'Penyewaan Barang' && log.statusPengembalian === 'Belum Kembali') {
        rentQty += log.jumlah;
      }
      if (log.statusPengembalian === 'Tidak Kembali (Hilang)') {
        lostQty += log.jumlah;
      }
    });

    return {
      totalDistinctItems,
      totalQty,
      readyQty,
      tripQty,
      rentQty,
      lostQty,
      repairQty,
      maintenanceQty,
      criticalStockCount,
      totalItemsValue,
      totalDeprValue,
      currentNetValue: Math.max(0, totalItemsValue - totalDeprValue)
    };
  }, [inventory, logs]);

  // Siapkan data untuk grafik kategori (recharts)
  const categoryChartData = useMemo(() => {
    const categories: { [key: string]: number } = {};
    inventory.forEach((item) => {
      categories[item.kategoriBarang] = (categories[item.kategoriBarang] || 0) + item.kuantitas;
    });

    return Object.keys(categories).map((cat) => ({
      name: cat,
      jumlah: categories[cat]
    }));
  }, [inventory]);

  // Siapkan data untuk grafik penggunaan barang (Ready, Pakai, Rawat, Rusak)
  const statusChartData = useMemo(() => {
    return [
      { name: 'Ready (Basecamp)', value: stats.readyQty, color: '#10b981' },
      { name: 'Dipakai Trip', value: stats.tripQty, color: '#f59e0b' },
      { name: 'Disewakan', value: stats.rentQty, color: '#3b82f6' },
      { name: 'Perawatan/Cuci', value: stats.maintenanceQty, color: '#06b6d4' },
      { name: 'Direparasi', value: stats.repairQty, color: '#ec4899' },
      { name: 'Hilang', value: stats.lostQty, color: '#ef4444' }
    ].filter((item) => item.value > 0);
  }, [stats]);

  // Barang yang belum kembali
  const itemsNotReturned = useMemo(() => {
    return logs.filter((log) => log.statusPengembalian === 'Belum Kembali').slice(0, 5);
  }, [logs]);

  // Pengembalian handle
  const handleReturnSubmit = (e: React.FormEvent, logId: string) => {
    e.preventDefault();
    onReturnItem(logId, kondisiKembali);
    setReturnLogId(null);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#11512f] to-[#15673d] rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <span className="px-3 py-1 bg-emerald-800/60 rounded-full text-xs font-semibold tracking-wider uppercase text-emerald-100">
            Kru Lapangan Dashboard
          </span>
          <h1 className="text-2xl font-bold tracking-tight mt-2.5">Selamat Datang di Portal Inventaris</h1>
          <p className="text-sm text-emerald-100/90 max-w-xl mt-1.5 font-medium leading-relaxed">
            Kelola perlengkapan outdoor, pantau persediaan trip, dan kalkulasi depresiasi aset PT. Barengin Trip secara real-time.
          </p>
        </div>
        <img 
          src="https://lh3.googleusercontent.com/d/1C-scCTu7H2eOa-ZtDhak1JcbRhTNCCIb" 
          alt="" 
          className="absolute right-6 -bottom-8 w-48 h-48 object-contain opacity-15 pointer-events-none" 
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Grid Kartu Statistik */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Aset */}
        <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-xs flex items-center space-x-3.5">
          <div className="p-3 bg-emerald-50 rounded-xl text-[#11512f]">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Aset</p>
            <h3 className="text-lg font-bold text-slate-800">{stats.totalQty} <span className="text-xs font-normal text-slate-400">pcs</span></h3>
            <p className="text-[10px] text-slate-400 leading-none">{stats.totalDistinctItems} Jenis Barang</p>
          </div>
        </div>

        {/* Di Basecamp */}
        <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-xs flex items-center space-x-3.5">
          <div className="p-3 bg-teal-50 rounded-xl text-teal-600">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Ready Basecamp</p>
            <h3 className="text-lg font-bold text-slate-800">{stats.readyQty} <span className="text-xs font-normal text-slate-400">pcs</span></h3>
            <p className="text-[10px] text-[#10b981] font-semibold">Tersedia dipacking</p>
          </div>
        </div>

        {/* Dipakai Trip */}
        <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-xs flex items-center space-x-3.5">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <Map className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Dipakai Trip</p>
            <h3 className="text-lg font-bold text-slate-800">{stats.tripQty} <span className="text-xs font-normal text-slate-400">pcs</span></h3>
            <p className="text-[10px] text-amber-500 font-semibold">{stats.rentQty} disewakan</p>
          </div>
        </div>

        {/* Hilang / Rusak */}
        <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-xs flex items-center space-x-3.5">
          <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Hilang / Rusak</p>
            <h3 className="text-lg font-bold text-slate-800">{stats.lostQty} <span className="text-xs font-normal text-slate-400">pcs</span></h3>
            <p className="text-[10px] text-rose-500 font-semibold">{stats.repairQty} dalam reparasi</p>
          </div>
        </div>

        {/* Perawatan / Cuci */}
        <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-xs flex items-center space-x-3.5 col-span-2 lg:col-span-1">
          <div className="p-3 bg-cyan-50 rounded-xl text-cyan-600">
            <ShowerHead className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Perawatan / Cuci</p>
            <h3 className="text-lg font-bold text-slate-800">{stats.maintenanceQty} <span className="text-xs font-normal text-slate-400">pcs</span></h3>
            <p className="text-[10px] text-cyan-500 font-semibold">Sedang dicuci/kering</p>
          </div>
        </div>
      </div>

      {/* Nilai Financial Aset */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Total Nilai */}
        <div className="bg-[#11512f]/5 border border-[#11512f]/10 rounded-xl p-4 flex items-center space-x-4">
          <div className="p-3 bg-[#11512f]/10 text-[#11512f] rounded-xl">
            <Coins className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Nilai Pembelian</p>
            <h3 className="text-lg font-bold text-slate-800">{formatRupiah(stats.totalItemsValue)}</h3>
          </div>
        </div>

        {/* Depresiasi */}
        <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-4 flex items-center space-x-4">
          <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
            <TrendingDown className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Apresiasi Depresiasi (2%/Bulan)</p>
            <h3 className="text-lg font-bold text-rose-700">-{formatRupiah(stats.totalDeprValue)}</h3>
          </div>
        </div>

        {/* Nilai saat ini */}
        <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 flex items-center space-x-4 col-span-2 md:col-span-1">
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
            <Coins className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Nilai Aset Saat Ini (Net)</p>
            <h3 className="text-lg font-bold text-emerald-800">{formatRupiah(stats.currentNetValue)}</h3>
          </div>
        </div>
      </div>

      {/* Chart & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Grafik Kategori */}
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs lg:col-span-8">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center space-x-2">
            <span>Grafik Stok Berdasarkan Kategori Barang</span>
          </h3>
          <div className="h-72">
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 9 }} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                    labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                    itemStyle={{ color: '#10b981' }}
                  />
                  <Bar dataKey="jumlah" fill="#11512f" radius={[4, 4, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400 text-xs">Belum ada data visualisasi</div>
            )}
          </div>
        </div>

        {/* Ringkasan Distribusi & Habis Pakai Kritis */}
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs lg:col-span-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-3 block">Distribusi Fisik Barang</h3>
            <div className="space-y-2.5">
              {statusChartData.map((st, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: st.color }} />
                    <span className="text-xs text-slate-600 font-medium">{st.name}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-800">{st.value} pcs</span>
                </div>
              ))}
            </div>
          </div>

          {stats.criticalStockCount > 0 && (
            <div className="bg-rose-50 border border-rose-100 rounded-lg p-3.5 mt-4">
              <div className="flex items-start space-x-2.5">
                <AlertTriangle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-rose-800">Barang Habis Pakai Menipis</h4>
                  <p className="text-[10px] text-rose-600 leading-relaxed mt-1">
                    Ada <strong>{stats.criticalStockCount} item</strong> penunjang trip (seperti gas canister, obat, bekal) yang jumlahnya di bawah 5 pcs. Segera lakukan restock logistik.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Barang Belum Kembali dari Trip (Realtime Monitor) */}
      <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Menunggu Pengembalian Barang &amp; Alat</h3>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">Log fisik barang dipinjam kru trip atau disewa customer.</p>
          </div>
          <span className="px-2.5 py-1 bg-[#11512f]/10 text-[#11512f] rounded-lg text-xs font-bold font-mono">
            {itemsNotReturned.length} Pinjaman Aktif
          </span>
        </div>

        {itemsNotReturned.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase text-[9px] tracking-wider font-bold">
                  <th className="py-2.5 px-4 rounded-l-lg">ID Log / Tanggal</th>
                  <th className="py-2.5 px-4Name">Nama Barang</th>
                  <th className="py-2.5 px-4 text-center">Jumlah</th>
                  <th className="py-2.5 px-4">Peminjam / Divisi</th>
                  <th className="py-2.5 px-4">PIC Gudang</th>
                  <th className="py-2.5 px-4 text-right rounded-r-lg">Aksi Pengembalian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {itemsNotReturned.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-700">{log.id}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{log.tanggal}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-semibold mr-1.5">{log.idBarang}</span>
                      <span className="text-slate-800 font-semibold">{log.namaBarang}</span>
                    </td>
                    <td className="py-3 px-4 text-center text-[#11512f] font-bold">{log.jumlah} pcs</td>
                    <td className="py-3 px-4">
                      <div className="text-slate-700">{log.pemakai}</div>
                      <div className="text-[10px] text-slate-400">{log.divisi}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-600">{log.pic}</td>
                    <td className="py-3 px-4 text-right">
                      {returnLogId === log.id ? (
                        <form onSubmit={(e) => handleReturnSubmit(e, log.id)} className="flex items-center justify-end space-x-2">
                          <select
                            id={`kondisi-kembali-${baseId}`}
                            value={kondisiKembali}
                            onChange={(e: any) => setKondisiKembali(e.target.value)}
                            className="bg-white border border-slate-200 rounded px-1.5 py-1 text-[11px] focus:outline-hidden"
                          >
                            <option value="Baru">Kondisi: Baru</option>
                            <option value="Baik">Kondisi: Baik</option>
                            <option value="Rusak Ringan">Rusak Ringan</option>
                            <option value="Tidak Dapat Dipakai">Hancur / Rusak</option>
                          </select>
                          <button
                            id={`submit-return-${baseId}`}
                            type="submit"
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold shadow-xs cursor-pointer"
                          >
                            Simpan
                          </button>
                        </form>
                      ) : (
                        <button
                          id={`init-return-${baseId}`}
                          onClick={() => {
                            setReturnLogId(log.id);
                            setKondisiKembali('Baik');
                          }}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#11512f] hover:text-emerald-800 rounded-lg text-[10px] font-bold transition flex items-center float-right cursor-pointer"
                        >
                          <Check className="h-3 w-3 mr-1" /> Kembalikan Alat
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-slate-400">
            <Clock className="h-8 w-8 mx-auto mb-2.5 text-slate-300" />
            <p className="text-xs font-semibold">Semua barang aman di basecamp!</p>
            <p className="text-[10px] mt-0.5">Tidak ada laporan pinjaman aktif yang belum dikembalikan.</p>
          </div>
        )}
      </div>

      {/* Activity Logs Terkini */}
      <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 mb-3.5">Histori Aktivitas Inventaris Terkini</h3>
        <div className="space-y-3">
          {logs.slice(0, 5).map((log, index) => (
            <div key={log.id || index} className="flex items-start justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
              <div className="flex items-start space-x-3.5">
                <span className={`p-1.5 rounded-lg mt-0.5 flex-shrink-0 ${
                  log.statusPengembalian === 'Sudah Kembali'
                    ? 'bg-emerald-50 text-emerald-600'
                    : log.jenisAktivitas === 'Pemakaian Trip'
                    ? 'bg-amber-50 text-amber-600'
                    : 'bg-indigo-50 text-indigo-600'
                }`}>
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-800 leading-none">
                    {log.jenisAktivitas} - {log.namaBarang} ({log.jumlah} pcs)
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                    Divisi: {log.divisi} &bull; Oleh: {log.pemakai} &bull; Keterangan: {log.keterangan || '-'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                  log.statusPengembalian === 'Sudah Kembali'
                    ? 'bg-emerald-100/50 text-emerald-700'
                    : log.statusPengembalian === 'Tidak Kembali (Hilang)'
                    ? 'bg-rose-100/50 text-rose-700'
                    : 'bg-amber-100/50 text-amber-700 font-semibold'
                }`}>
                  {log.statusPengembalian}
                </span>
                <p className="text-[9px] text-slate-400 mt-1 font-semibold">{log.tanggal}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
