import { useState, useMemo, useId, FormEvent, ChangeEvent } from 'react';
import { 
  ArrowRightLeft, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Check, 
  AlertCircle, 
  TrendingUp, 
  ShieldCheck, 
  UserPlus, 
  Tag,
  Compass,
  ChevronLeft,
  ChevronRight,
  X,
  Trash2,
  Eye,
  Edit2
} from 'lucide-react';
import { InventoryItem, ActivityLog } from '../types';

interface Props {
  inventory: InventoryItem[];
  logs: ActivityLog[];
  onAddLog: (newLog: Partial<ActivityLog>) => void;
  onReturnItem: (logId: string, kondisiKembali: 'Baru' | 'Baik' | 'Rusak Ringan' | 'Tidak Dapat Dipakai') => void;
  picName: string;
  userRole?: string;
  onDeleteLog?: (logId: string) => void;
  onEditLog?: (updatedLog: ActivityLog) => void;
}

const CATEGORIES = [
  'Kemah', 'Elektronik', 'Trekking', 'Alat Masak dan Minum', 
  'Bahan Baku Konsumsi', 'Perlengkapan Habis Pakai', 'Dokumentasi', 'P3K', 'Obat-obatan'
];

export default function LogKeluarMasuk({ inventory, logs, onAddLog, onReturnItem, picName, userRole, onDeleteLog, onEditLog }: Props) {
  const baseId = useId();
  const [deletingLogId, setDeletingLogId] = useState<string | null>(null);
  const [viewingLogId, setViewingLogId] = useState<string | null>(null);
  const [editingLog, setEditingLog] = useState<ActivityLog | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<string>('Semua');
  const [isLogFormOpen, setIsLogFormOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // New return-item UX states
  const [returningLogId, setReturningLogId] = useState<string | null>(null);
  const [kondisiKembali, setKondisiKembali] = useState<'Baru' | 'Baik' | 'Rusak Ringan' | 'Tidak Dapat Dipakai'>('Baik');

  // Selected item log for returning info
  const logBeingReturned = useMemo(() => {
    return logs.find((l) => l.id === returningLogId);
  }, [logs, returningLogId]);

  // Selected item log for detail viewing
  const logBeingViewed = useMemo(() => {
    return logs.find((l) => l.id === viewingLogId);
  }, [logs, viewingLogId]);

  // New Log State
  const [logForm, setLogForm] = useState<Partial<ActivityLog>>({
    jenisAktivitas: 'Pemakaian Trip',
    idBarang: '',
    jumlah: 1,
    pemakai: '',
    divisi: 'Operasional Lapangan',
    keterangan: '',
    kondisiKeluar: 'Baik',
    statusPengembalian: 'Belum Kembali',
    pic: picName
  });

  // Selected item info for limits check
  const selectedItemForLog = useMemo(() => {
    return inventory.find((i) => i.id === logForm.idBarang);
  }, [inventory, logForm.idBarang]);

  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLogForm((prev) => ({
      ...prev,
      [name]: name === 'jumlah' ? Number(value) : value
    }));
  };

  // Auto-fill nama barang based on selected idBarang
  const handleItemSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const matched = inventory.find((it) => it.id === id);
    setLogForm((prev) => ({
      ...prev,
      idBarang: id,
      namaBarang: matched ? matched.namaBarang : '',
      kondisiKeluar: matched ? matched.kondisiBarang : 'Baik'
    }));
  };

  const handleSubmitLog = (e: FormEvent) => {
    e.preventDefault();
    
    // Validasi stok
    if (selectedItemForLog && ['Pemakaian Trip', 'Penyewaan Barang', 'Pemakaian Pribadi Internal', 'Dijual'].includes(logForm.jenisAktivitas || '')) {
      if ((logForm.jumlah || 0) > selectedItemForLog.kuantitas) {
        alert(`Gagal mencatat! Stok "${selectedItemForLog.namaBarang}" yang tersedia hanya ${selectedItemForLog.kuantitas} pcs.`);
        return;
      }
    }

    onAddLog(logForm);
    setIsLogFormOpen(false);
    // Reset
    setLogForm({
      jenisAktivitas: 'Pemakaian Trip',
      idBarang: '',
      jumlah: 1,
      pemakai: '',
      divisi: 'Operasional Lapangan',
      keterangan: '',
      kondisiKeluar: 'Baik',
      statusPengembalian: 'Belum Kembali',
      pic: picName
    });
  };

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchSearch = 
        log.namaBarang.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.pemakai.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.id.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchActivity = selectedActivity === 'Semua' || log.jenisAktivitas === selectedActivity;

      return matchSearch && matchActivity;
    });
  }, [logs, searchTerm, selectedActivity]);

  // Paginated Logs
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLogs, currentPage]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Search and Log Trigger bar */}
      <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              id={`log-search-${baseId}`}
              type="text"
              placeholder="Cari logs berdasarkan nama barang, pemakai, atau kode log..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#11512f] focus:bg-white transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 px-3 py-2 bg-slate-100 hover:bg-slate-200/50 rounded-lg transition">
              <Filter className="h-3.5 w-3.5 text-slate-500" />
              <select
                id={`activity-filter-${baseId}`}
                value={selectedActivity}
                onChange={(e) => {
                  setSelectedActivity(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent border-0 text-xs font-bold text-slate-700 focus:outline-hidden"
              >
                <option value="Semua">Semua Aktivitas</option>
                <option value="Pemakaian Trip">Pemakaian Trip</option>
                <option value="Penyewaan Barang">Penyewaan Barang</option>
                <option value="Pemakaian Pribadi Internal">Pemakaian Internal</option>
                <option value="Dijual">Dijual</option>
                <option value="Reparasi">Reparasi</option>
                <option value="Perawatan">Perawatan</option>
              </select>
            </div>

            {/* Reset Filters Trigger */}
            {(selectedActivity !== 'Semua' || searchTerm !== '') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedActivity('Semua');
                  setCurrentPage(1);
                }}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-all cursor-pointer border border-rose-200"
              >
                <X className="h-3.5 w-3.5" />
                <span>Hapus Filter</span>
              </button>
            )}

            <button
              id={`btn-open-log-${baseId}`}
              onClick={() => setIsLogFormOpen(true)}
              className="px-4 py-2 bg-[#11512f] hover:bg-emerald-800 text-white text-xs font-bold rounded-lg flex items-center space-x-2 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Log Barang Keluar - Masuk</span>
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
        {paginatedLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase text-[9px] tracking-wider font-bold border-b border-slate-100">
                  <th className="py-3.5 px-4">ID Log / Tanggal</th>
                  <th className="py-3.5 px-4">Nama Barang</th>
                  <th className="py-3.5 px-4 text-center">Jumlah</th>
                  <th className="py-3.5 px-4">Pemakai / Divisi</th>
                  <th className="py-3.5 px-4">Kondisi Keluar / Masuk</th>
                  <th className="py-3.5 px-4">Pengembalian</th>
                  <th className="py-3.5 px-4">PIC Gudang</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {paginatedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/40 animate-in fade-in duration-150">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{log.id}</div>
                      <div className="text-[10px] text-slate-400 mt-1">{log.tanggal}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-semibold">{log.namaBarang}</div>
                      <div className="flex flex-wrap gap-1.5 items-center mt-1">
                        <div className="text-[10px] text-slate-450 font-semibold">Jenis: {log.jenisAktivitas}</div>
                        {(log as any).isOfflineDraft && (
                          <span className="inline-block px-1.5 py-0.2 bg-amber-50 text-amber-700 text-[8px] rounded border border-amber-200 uppercase font-black tracking-wider animate-pulse font-sans">
                            Offline Sync Pending
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-xs font-bold text-[#11512f]">{log.jumlah} pcs</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-700">{log.pemakai}</div>
                      <div className="text-[10px] text-slate-400">{log.divisi}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>Kondisi Keluar: <span className="font-semibold text-slate-800">{log.kondisiKeluar}</span></div>
                      {log.kondisiKembali && (
                        <div className="mt-1 text-[10px] text-emerald-600">
                          Kembali: <span className="font-bold">{log.kondisiKembali}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        log.statusPengembalian === 'Sudah Kembali'
                          ? 'bg-emerald-50 text-emerald-700'
                          : log.statusPengembalian === 'Tidak Kembali (Hilang)'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {log.statusPengembalian}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-600">{log.pic}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* Detail Action */}
                        <button
                          type="button"
                          onClick={() => setViewingLogId(log.id)}
                          className="inline-flex items-center space-x-1.5 px-2 py-1.5 bg-blue-50 hover:bg-blue-150 text-blue-700 text-[10px] uppercase tracking-wider font-bold rounded-lg transition-all hover:shadow-xs active:scale-95 cursor-pointer border border-blue-200 font-sans shrink-0"
                          title="Lihat Detail Log"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Detail</span>
                        </button>

                        {/* Edit Action */}
                        {userRole === 'Super Admin' && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingLog({ ...log });
                            }}
                            className="inline-flex items-center space-x-1.5 px-2 py-1.5 bg-amber-50 hover:bg-amber-150 text-amber-700 text-[10px] uppercase tracking-wider font-bold rounded-lg transition-all hover:shadow-xs active:scale-95 cursor-pointer border border-amber-200 font-sans shrink-0"
                            title="Edit Log Mutasi"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                            <span>Edit</span>
                          </button>
                        )}

                        {/* M. Kembali Action */}
                        {log.statusPengembalian === 'Belum Kembali' && (
                          <button
                            type="button"
                            onClick={() => {
                              setKondisiKembali(log.kondisiKeluar || 'Baik');
                              setReturningLogId(log.id);
                            }}
                            className="inline-flex items-center space-x-1.5 px-2 py-1.5 bg-[#11512f] hover:bg-emerald-800 text-white text-[10px] uppercase tracking-wider font-bold rounded-lg transition-all hover:shadow-xs active:scale-95 cursor-pointer border-0 font-sans shrink-0"
                            title="Tandai Sudah Kembali"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Kembali</span>
                          </button>
                        )}
                        
                        {/* Delete Action */}
                        {userRole === 'Super Admin' && onDeleteLog && (
                          <button
                            type="button"
                            onClick={() => setDeletingLogId(log.id)}
                            className="inline-flex items-center space-x-1.5 px-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] uppercase tracking-wider font-bold rounded-lg transition-all hover:shadow-xs active:scale-95 cursor-pointer border border-rose-200 font-sans shrink-0"
                            title="Hapus Log"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Hapus</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400">
            <ArrowRightLeft className="h-10 w-10 mx-auto text-slate-200 mb-2.5 animate-pulse" />
            <p className="text-xs font-semibold">Belum ada pencatatan aktivitas</p>
            <p className="text-[10px] mt-0.5">Semua data keluar masuk barang akan diarsipkan di sini.</p>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="bg-slate-50/50 px-4 py-3 border-t border-slate-100 flex items-center justify-between">
            <div className="text-[11px] text-slate-500 font-semibold">
              Menampilkan {Math.min(filteredLogs.length, (currentPage - 1) * itemsPerPage + 1)}-
              {Math.min(filteredLogs.length, currentPage * itemsPerPage)} dari {filteredLogs.length} log
            </div>
            <div className="flex items-center space-x-1">
              <button
                id={`btn-log-page-prev-${baseId}`}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-50 text-slate-500"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-bold text-slate-700 px-2">
                Halaman {currentPage} dari {totalPages}
              </span>
              <button
                id={`btn-log-page-next-${baseId}`}
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-50 text-slate-500"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE LOG MODAL POPUP */}
      {isLogFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in zoom-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 relative shadow-2xl">
            <button
              id={`close-log-form-${baseId}`}
              onClick={() => setIsLogFormOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition"
            >
              <X className="h-5 w-5" />
            </button>
            
            <form onSubmit={handleSubmitLog} className="space-y-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center space-x-2">
                <ArrowRightLeft className="h-5 w-5 text-[#11512f]" />
                <span>Log Mutasi Barang Baru</span>
              </h3>

              <div className="grid grid-cols-1 gap-3.5 text-xs">
                {/* Aktivitas */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-550 uppercase tracking-widest mb-1">Jenis Mutasi *</label>
                  <select
                    id={`form-log-aktivitas-${baseId}`}
                    name="jenisAktivitas"
                    value={logForm.jenisAktivitas}
                    onChange={(e: any) => {
                      const value = e.target.value;
                      let statusPengembalian: 'Belum Kembali' | 'Sudah Kembali' | 'Tidak Kembali (Hilang)' = 'Belum Kembali';
                      if (['Dijual'].includes(value)) {
                        statusPengembalian = 'Sudah Kembali'; // ga perlu kembali karena terjual
                      }
                      setLogForm((prev) => ({
                        ...prev,
                        jenisAktivitas: value,
                        statusPengembalian
                      }));
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#11512f] focus:bg-white transition"
                  >
                    <option value="Pemakaian Trip">Pemakaian Trip</option>
                    <option value="Penyewaan Barang">Penyewaan Barang (Sewa)</option>
                    <option value="Pemakaian Pribadi Internal">Pemakaian Pribadi / Internal</option>
                    <option value="Dijual">Dijual (Keluar Permanen)</option>
                    <option value="Reparasi">Reparasi (Perbaikan)</option>
                    <option value="Perawatan">Perawatan (Laundry/Cuci)</option>
                  </select>
                </div>

                {/* Pilih Barang */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-555 uppercase tracking-widest mb-1 font-mono">PILIH BARANG DARI DATABASE *</label>
                  <select
                    id={`form-log-barang-${baseId}`}
                    required
                    value={logForm.idBarang}
                    onChange={handleItemSelect}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#11512f] focus:bg-white transition"
                  >
                    <option value="">Pilih barang...</option>
                    {inventory.map((it) => (
                      <option key={it.id} value={it.id}>
                        [{it.id}] {it.namaBarang} (Stok: {it.kuantitas})
                      </option>
                    ))}
                  </select>
                  {selectedItemForLog && (
                    <p className="text-[10px] text-[#11512f] mt-1 font-semibold">
                      Tersedia: {selectedItemForLog.kuantitas} pcs | Kondisi saat ini: {selectedItemForLog.kondisiBarang}
                    </p>
                  )}
                </div>

                {/* Jumlah & Kondisi Keluar */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Jumlah Keluar (pcs) *</label>
                    <input
                      id={`form-log-qty-${baseId}`}
                      type="number"
                      name="jumlah"
                      required
                      min="1"
                      placeholder="qty"
                      value={logForm.jumlah}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#11512f] focus:bg-white transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Kondisi Keluar</label>
                    <select
                      id={`form-log-kondisikeluar-${baseId}`}
                      name="kondisiKeluar"
                      value={logForm.kondisiKeluar}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#11512f] focus:bg-white transition"
                    >
                      <option value="Baru">Baru</option>
                      <option value="Baik">Baik</option>
                      <option value="Rusak Ringan">Rusak Ringan</option>
                      <option value="Tidak Dapat Dipakai">Tidak Dapat Dipakai</option>
                    </select>
                  </div>
                </div>

                {/* Pemakai & Divisi */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nama Pemakai *</label>
                    <input
                      id={`form-log-user-${baseId}`}
                      type="text"
                      name="pemakai"
                      required
                      value={logForm.pemakai}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#11512f] focus:bg-white transition"
                      placeholder="Cth: Guide Dafi, Porter Anto"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Divisi Pemakai</label>
                    <select
                      id={`form-log-divisi-${baseId}`}
                      name="divisi"
                      value={logForm.divisi}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 bg-[#f8fafc] border border-slate-200 rounded-lg text-[11px] font-semibold focus:outline-hidden focus:border-[#11512f] focus:bg-white transition"
                    >
                      <option value="Operasional Lapangan">Operasional Lapangan</option>
                      <option value="Logistik">Logistik &amp; Gudang</option>
                      <option value="Pemandu Wisata">Pemandu / Guides</option>
                      <option value="Pribadi / Internal">Pribadi Internal</option>
                      <option value="Dokumentasi">Dokumentasi Crew</option>
                      <option value="Medis / P3K">Medis Crew</option>
                    </select>
                  </div>
                </div>

                {/* Status Pengembalian */}
                {['Pemakaian Trip', 'Penyewaan Barang', 'Pemakaian Pribadi Internal'].includes(logForm.jenisAktivitas || '') && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-550 uppercase tracking-widest mb-1">Alur Pengembalian</label>
                    <select
                      id={`form-log-return-${baseId}`}
                      name="statusPengembalian"
                      value={logForm.statusPengembalian}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#11512f] focus:bg-white transition"
                    >
                      <option value="Belum Kembali">Belum Kembali (Dipinjam Sementara)</option>
                      <option value="Sudah Kembali">Langsung Kembali (Arsip Mutasi)</option>
                    </select>
                  </div>
                )}

                {/* Keterangan */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Keterangan Tambahan</label>
                  <textarea
                    id={`form-log-keterangan-${baseId}`}
                    name="keterangan"
                    rows={2}
                    value={logForm.keterangan || ''}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#11512f] focus:bg-white transition"
                    placeholder="Tulis detail trip (cth: Trip Merbabu 3 Hari)"
                  />
                </div>
              </div>

              {/* Action */}
              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  id={`btn-cancel-log-${baseId}`}
                  type="button"
                  onClick={() => setIsLogFormOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  id={`btn-submit-log-${baseId}`}
                  type="submit"
                  className="px-5 py-2 bg-[#11512f] hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition shadow-sm cursor-pointer"
                >
                  Konfirmasi Mutasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RETURN LOG MODAL POPUP */}
      {returningLogId && logBeingReturned && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
          onClick={() => setReturningLogId(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setReturningLogId(null)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition cursor-pointer z-10"
              title="Tutup"
            >
              <X className="h-4.5 w-4.5" />
            </button>
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-2 text-[#11512f]">
                <ArrowRightLeft className="h-5 w-5" />
                <h3 className="text-sm font-bold text-slate-850">Konfirmasi Pengembalian Barang</h3>
              </div>
              
              <div className="bg-slate-50/80 rounded-xl p-3.5 space-y-2 border border-slate-100">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400 font-semibold">Nama Barang:</span>
                  <span className="text-slate-800 font-bold">{logBeingReturned.namaBarang}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400 font-semibold">Jumlah Keluar:</span>
                  <span className="text-[#11512f] font-bold">{logBeingReturned.jumlah} pcs</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400 font-semibold">Pemakai:</span>
                  <span className="text-slate-800 font-bold">{logBeingReturned.pemakai} ({logBeingReturned.divisi})</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400 font-semibold">Kondisi Keluar:</span>
                  <span className="text-slate-800 font-bold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-sm">{logBeingReturned.kondisiKeluar}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kondisi Barang Saat Pengembalian *</label>
                <select
                  value={kondisiKembali}
                  onChange={(e) => setKondisiKembali(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-250 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#11512f] focus:bg-white transition"
                >
                  <option value="Baru">Baru - Tanpa Keausan</option>
                  <option value="Baik">Baik - Layak Pakai Langsung</option>
                  <option value="Rusak Ringan">Rusak Ringan - Perlu Cuci / Servis Kecil</option>
                  <option value="Tidak Dapat Dipakai">Tidak Dapat Dipakai - Rusak Total/Ganti Baru</option>
                </select>
              </div>

              <div className="text-[10px] text-slate-400">
                * Menekan tombol "Simpan Pengembalian" otomatis memperbarui database logistik, menambah kuantitas stok ter-gudang, serta me-reset status penanganan barang di database inventaris.
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReturningLogId(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onReturnItem(logBeingReturned.id, kondisiKembali);
                    setReturningLogId(null);
                  }}
                  className="px-5 py-2 bg-[#11512f] hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition hover:shadow-xs cursor-pointer font-sans"
                >
                  Simpan Pengembalian
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingLogId && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
          onClick={() => setDeletingLogId(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setDeletingLogId(null)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition cursor-pointer z-10"
              title="Tutup"
            >
              <X className="h-4.5 w-4.5" />
            </button>
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-2 text-rose-600">
                <AlertCircle className="h-5 w-5 animate-bounce" />
                <h3 className="text-sm font-black text-rose-950 uppercase tracking-wide">Hapus Log Mutasi</h3>
              </div>
              
              <p className="text-xs text-slate-600 leading-relaxed">
                Apakah Anda yakin ingin menghapus catatan log ini? Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
              </p>

              {(() => {
                const logToDelete = logs.find(l => l.id === deletingLogId);
                if (!logToDelete) return null;
                return (
                  <div className="bg-rose-50/80 rounded-xl p-3.5 space-y-2 border border-rose-100">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500 font-semibold">ID Log / Tanggal:</span>
                      <span className="text-slate-800 font-bold">{logToDelete.id} ({logToDelete.tanggal})</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500 font-semibold">Nama Barang:</span>
                      <span className="text-slate-800 font-bold">{logToDelete.namaBarang}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500 font-semibold">Jumlah:</span>
                      <span className="text-rose-700 font-bold">{logToDelete.jumlah} pcs ({logToDelete.jenisAktivitas})</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500 font-semibold">Pemakai:</span>
                      <span className="text-slate-800 font-bold">{logToDelete.pemakai} ({logToDelete.divisi})</span>
                    </div>
                  </div>
                );
              })()}

              <div className="text-[10px] text-slate-400">
                * Menghapus log ini tidak akan mengubah kuantitas stok barang secara otomatis. Hanya riwayat pencatatan keluar-masuk ini saja yang akan dihapus dari sistem arsip database.
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeletingLogId(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition cursor-pointer font-sans"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onDeleteLog) onDeleteLog(deletingLogId);
                    setDeletingLogId(null);
                  }}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition hover:shadow-xs cursor-pointer font-sans"
                >
                  Hapus Permanen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW/DETAIL LOG MODAL */}
      {viewingLogId && logBeingViewed && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
          onClick={() => setViewingLogId(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setViewingLogId(null)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition cursor-pointer z-10"
              title="Tutup"
            >
              <X className="h-4.5 w-4.5" />
            </button>
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-2 text-blue-600">
                <Eye className="h-5 w-5" />
                <h3 className="text-sm font-black text-blue-950 uppercase tracking-wide">Detail Riwayat Mutasi Barang</h3>
              </div>

              <div className="border border-slate-100 rounded-xl divide-y divide-slate-150 overflow-hidden text-xs">
                <div className="grid grid-cols-3 p-3 bg-slate-50/50">
                  <span className="text-slate-500 font-semibold">ID Transaksi / Log</span>
                  <span className="col-span-2 font-bold text-slate-800">{logBeingViewed.id}</span>
                </div>
                <div className="grid grid-cols-3 p-3">
                  <span className="text-slate-500 font-semibold">Tanggal Log</span>
                  <span className="col-span-2 font-bold text-slate-800">{logBeingViewed.tanggal}</span>
                </div>
                <div className="grid grid-cols-3 p-3 bg-slate-50/50">
                  <span className="text-slate-500 font-semibold">Jenis Mutasi</span>
                  <span className="col-span-2 font-semibold text-[#11512f]">{logBeingViewed.jenisAktivitas}</span>
                </div>
                <div className="grid grid-cols-3 p-3">
                  <span className="text-slate-500 font-semibold">Nama Barang (ID)</span>
                  <span className="col-span-2 font-bold text-slate-800">{logBeingViewed.namaBarang} <span className="font-mono text-slate-400 text-[10px]">({logBeingViewed.idBarang})</span></span>
                </div>
                <div className="grid grid-cols-3 p-3 bg-slate-50/50">
                  <span className="text-slate-500 font-semibold">Jumlah</span>
                  <span className="col-span-2 font-bold text-emerald-800">{logBeingViewed.jumlah} pcs</span>
                </div>
                <div className="grid grid-cols-3 p-3">
                  <span className="text-slate-500 font-semibold">Pemakai / Divisi</span>
                  <span className="col-span-2 font-bold text-slate-800">{logBeingViewed.pemakai} <span className="text-slate-400 font-normal">({logBeingViewed.divisi})</span></span>
                </div>
                <div className="grid grid-cols-3 p-3 bg-slate-50/50">
                  <span className="text-slate-500 font-semibold">Kondisi Keluar</span>
                  <span className="col-span-2 font-semibold text-slate-800">{logBeingViewed.kondisiKeluar}</span>
                </div>
                <div className="grid grid-cols-3 p-3">
                  <span className="text-slate-500 font-semibold">Status Pengembalian</span>
                  <span className={`col-span-2 inline-block max-w-max px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    logBeingViewed.statusPengembalian === 'Sudah Kembali'
                      ? 'bg-emerald-50 text-emerald-700'
                      : logBeingViewed.statusPengembalian === 'Tidak Kembali (Hilang)'
                      ? 'bg-rose-50 text-rose-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {logBeingViewed.statusPengembalian}
                  </span>
                </div>
                {logBeingViewed.kondisiKembali && (
                  <div className="grid grid-cols-3 p-3 bg-slate-50/50">
                    <span className="text-slate-500 font-semibold">Kondisi Kembali</span>
                    <span className="col-span-2 font-bold text-emerald-700">{logBeingViewed.kondisiKembali}</span>
                  </div>
                )}
                <div className="grid grid-cols-3 p-3">
                  <span className="text-slate-500 font-semibold">PIC Gudang</span>
                  <span className="col-span-2 font-bold text-slate-800">{logBeingViewed.pic}</span>
                </div>
                <div className="grid grid-cols-3 p-3 bg-slate-50/50">
                  <span className="text-slate-500 font-semibold">Keterangan</span>
                  <span className="col-span-2 text-slate-600 font-semibold leading-relaxed">{logBeingViewed.keterangan || <span className="text-slate-350 italic">- Tidak ada -</span>}</span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setViewingLogId(null)}
                  className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT LOG MODAL */}
      {editingLog && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in zoom-in duration-200"
          onClick={() => setEditingLog(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-lg w-full p-6 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setEditingLog(null)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition cursor-pointer z-10"
              title="Tutup"
            >
              <X className="h-5 w-5" />
            </button>
            
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (onEditLog) {
                  onEditLog(editingLog);
                }
                setEditingLog(null);
              }} 
              className="space-y-4"
            >
              <h3 className="text-base font-bold text-slate-800 flex items-center space-x-2">
                <Edit2 className="h-5 w-5 text-amber-600" />
                <span>Edit Data Mutasi [{editingLog.id}]</span>
              </h3>

              <div className="grid grid-cols-1 gap-3.5 text-xs">
                {/* Jenis Mutasi */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-550 uppercase mb-1">Jenis Mutasi *</label>
                  <select
                    value={editingLog.jenisAktivitas}
                    onChange={(e) => setEditingLog({...editingLog, jenisAktivitas: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-amber-500 focus:bg-white transition"
                  >
                    <option value="Pemakaian Trip">Pemakaian Trip</option>
                    <option value="Penyewaan Barang">Penyewaan Barang (Sewa)</option>
                    <option value="Pemakaian Pribadi Internal">Pemakaian Pribadi / Internal</option>
                    <option value="Dijual">Dijual (Keluar Permanen)</option>
                    <option value="Reparasi">Reparasi (Perbaikan)</option>
                    <option value="Perawatan">Perawatan (Laundry/Cuci)</option>
                  </select>
                </div>

                {/* Nama Barang */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nama Barang</label>
                  <input
                    type="text"
                    value={editingLog.namaBarang}
                    onChange={(e) => setEditingLog({...editingLog, namaBarang: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-amber-500 focus:bg-white transition"
                  />
                </div>

                {/* Jumlah & Kondisi Keluar */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Jumlah Mutasi (pcs) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={editingLog.jumlah}
                      onChange={(e) => setEditingLog({...editingLog, jumlah: Number(e.target.value)})}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-amber-500 focus:bg-white transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Kondisi Keluar</label>
                    <select
                      value={editingLog.kondisiKeluar || 'Baik'}
                      onChange={(e) => setEditingLog({...editingLog, kondisiKeluar: e.target.value as any})}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-amber-500 focus:bg-white transition"
                    >
                      <option value="Baru">Baru</option>
                      <option value="Baik">Baik</option>
                      <option value="Rusak Ringan">Rusak Ringan</option>
                      <option value="Tidak Dapat Dipakai">Tidak Dapat Dipakai</option>
                    </select>
                  </div>
                </div>

                {/* Pemakai & Divisi */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nama Pemakai *</label>
                    <input
                      type="text"
                      required
                      value={editingLog.pemakai}
                      onChange={(e) => setEditingLog({...editingLog, pemakai: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-amber-500 focus:bg-white transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Divisi Pemakai</label>
                    <select
                      value={editingLog.divisi || 'Operasional Lapangan'}
                      onChange={(e) => setEditingLog({...editingLog, divisi: e.target.value})}
                      className="w-full px-3 py-2 bg-[#f8fafc] border border-slate-200 rounded-lg text-[11px] font-semibold focus:outline-hidden focus:border-amber-500 focus:bg-white transition"
                    >
                      <option value="Operasional Lapangan">Operasional Lapangan</option>
                      <option value="Logistik">Logistik &amp; Gudang</option>
                      <option value="Pemandu Wisata">Pemandu / Guides</option>
                      <option value="Pribadi / Internal">Pribadi Internal</option>
                      <option value="Dokumentasi">Dokumentasi Crew</option>
                      <option value="Medis / P3K">Medis Crew</option>
                    </select>
                  </div>
                </div>

                {/* Alur Pengembalian */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Status Pengembalian</label>
                    <select
                      value={editingLog.statusPengembalian}
                      onChange={(e) => setEditingLog({...editingLog, statusPengembalian: e.target.value as any})}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-amber-500 focus:bg-white transition"
                    >
                      <option value="Belum Kembali">Belum Kembali</option>
                      <option value="Sudah Kembali">Sudah Kembali</option>
                      <option value="Tidak Kembali (Hilang)">Tidak Kembali (Hilang)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Kondisi Kembali</label>
                    <select
                      value={editingLog.kondisiKembali || ''}
                      onChange={(e) => setEditingLog({...editingLog, kondisiKembali: e.target.value as any})}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-amber-500 focus:bg-white transition"
                    >
                      <option value="">- Belum Kembali -</option>
                      <option value="Baru">Baru</option>
                      <option value="Baik">Baik</option>
                      <option value="Rusak Ringan">Rusak Ringan</option>
                      <option value="Tidak Dapat Dipakai">Tidak Dapat Dipakai</option>
                    </select>
                  </div>
                </div>

                {/* PIC Gudang */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">PIC Gudang</label>
                  <input
                    type="text"
                    required
                    value={editingLog.pic}
                    onChange={(e) => setEditingLog({...editingLog, pic: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-amber-500 focus:bg-white transition"
                  />
                </div>

                {/* Keterangan */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Keterangan Tambahan</label>
                  <textarea
                    rows={2}
                    value={editingLog.keterangan || ''}
                    onChange={(e) => setEditingLog({...editingLog, keterangan: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-amber-500 focus:bg-white transition"
                    placeholder="Tulis detail tambahan..."
                  />
                </div>
              </div>

              {/* Action */}
              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingLog(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition shadow-sm cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
