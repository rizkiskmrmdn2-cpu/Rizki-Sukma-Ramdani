import React, { useState, useMemo, useId } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Edit, 
  Trash2, 
  Eye, 
  X, 
  Upload, 
  HelpCircle,
  PackageCheck,
  RefreshCw,
  DollarSign
} from 'lucide-react';
import { InventoryItem } from '../types';
import { calculateDepreciation, formatRupiah, getProductImage } from '../utils';

interface Props {
  inventory: InventoryItem[];
  onSaveItem: (item: Partial<InventoryItem>) => void;
  onDeleteItem: (id: string) => void;
  picName: string;
}

const CATEGORIES = [
  'Kemah', 'Elektronik', 'Trekking', 'Alat Masak dan Minum', 
  'Bahan Baku Konsumsi', 'Perlengkapan Habis Pakai', 'Dokumentasi', 'P3K', 'Obat-obatan'
];

export default function DatabaseInventaris({ inventory, onSaveItem, onDeleteItem, picName }: Props) {
  const baseId = useId();
  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedStatus, setSelectedStatus] = useState<string>('Semua');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [viewingItem, setViewingItem] = useState<InventoryItem | null>(null);
  const [zoomImage, setZoomImage] = useState<{ url: string; title: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    kodeBarang: '',
    namaBarang: '',
    merk: '',
    seri: '',
    ukuran: '',
    berat: '',
    kuantitas: 1,
    hargaPembelian: 0,
    hargaSewaBarang: 0,
    statusBarang: 'Ready',
    kondisiBarang: 'Baik',
    penanganan: 'Tidak',
    tempatPenyimpanan: '',
    tanggalPembelian: new Date().toISOString().split('T')[0],
    fotoBarang: '',
    kategoriBarang: 'Kemah',
    keterangan: ''
  });

  // Filter & Search Logic
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchSearch = 
        item.namaBarang.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.kodeBarang.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.merk.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchCategory = selectedCategory === 'Semua' || item.kategoriBarang === selectedCategory;
      const matchStatus = selectedStatus === 'Semua' || item.statusBarang === selectedStatus;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [inventory, searchTerm, selectedCategory, selectedStatus]);

  // Paginated Data
  const paginatedInventory = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredInventory.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredInventory, currentPage]);

  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);

  // Handlers
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      kodeBarang: '',
      namaBarang: '',
      merk: '',
      seri: '',
      ukuran: '',
      berat: '',
      kuantitas: 1,
      hargaPembelian: 0,
      hargaSewaBarang: 0,
      statusBarang: 'Ready',
      kondisiBarang: 'Baru',
      penanganan: 'Tidak',
      tempatPenyimpanan: '',
      tanggalPembelian: new Date().toISOString().split('T')[0],
      fotoBarang: '',
      kategoriBarang: 'Kemah',
      keterangan: ''
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsFormOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ['kuantitas', 'hargaPembelian', 'hargaSewaBarang'].includes(name) ? Number(value) : value
    }));
  };

  const handleImageUploaded = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, fotoBarang: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveItem(formData);
    setIsFormOpen(false);
  };

  const generateAutoCode = () => {
    const catCode = formData.kategoriBarang?.substring(0, 3).toUpperCase() || 'GEN';
    const randCode = String(Math.floor(Math.random() * 900) + 100);
    const itemMerk = formData.merk ? formData.merk.substring(0, 3).toUpperCase() : 'BT';
    setFormData((prev) => ({
      ...prev,
      kodeBarang: `BT-${catCode}-${itemMerk}-${randCode}`
    }));
  };

  return (
    <div className="space-y-6">
      {/* Search and Action Bar */}
      <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              id={`search-input-${baseId}`}
              type="text"
              placeholder="Cari berdasarkan nama barang, kode, atau merk..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#11512f] focus:bg-white transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Category */}
            <div className="flex items-center space-x-1 px-3 py-2 bg-slate-100 hover:bg-slate-200/50 rounded-lg transition">
              <Filter className="h-3.5 w-3.5 text-slate-500" />
              <select
                id={`filter-category-${baseId}`}
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent border-0 text-xs font-bold text-slate-700 focus:outline-hidden"
              >
                <option value="Semua">Semua Kategori</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Filter Status */}
            <div className="flex items-center space-x-1 px-3 py-2 bg-slate-100 hover:bg-slate-200/50 rounded-lg transition">
              <PackageCheck className="h-3.5 w-3.5 text-slate-500" />
              <select
                id={`filter-status-${baseId}`}
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent border-0 text-xs font-bold text-slate-700 focus:outline-hidden"
              >
                <option value="Semua">Semua Status</option>
                <option value="Ready">Ready</option>
                <option value="Pemakaian">Pemakaian</option>
                <option value="Perbaikan">Perbaikan</option>
                <option value="Perawatan">Perawatan</option>
              </select>
            </div>

            {/* Reset Filters Trigger */}
            {(selectedCategory !== 'Semua' || selectedStatus !== 'Semua' || searchTerm !== '') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('Semua');
                  setSelectedStatus('Semua');
                  setCurrentPage(1);
                }}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-all cursor-pointer border border-rose-200"
              >
                <X className="h-3.5 w-3.5" />
                <span>Hapus Filter</span>
              </button>
            )}

            {/* Add Button */}
            <button
              id={`btn-add-item-${baseId}`}
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-[#11512f] hover:bg-emerald-800 text-white text-xs font-bold rounded-lg flex items-center space-x-2 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Barang</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Database Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
        {paginatedInventory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/70 text-slate-500 uppercase text-[9px] tracking-wider font-bold border-b border-slate-100">
                  <th className="py-3 px-4">Foto / ID</th>
                  <th className="py-3 px-4">Detail Barang</th>
                  <th className="py-3 px-4">Penempatan</th>
                  <th className="py-3 px-4 text-center">Stok</th>
                  <th className="py-3 px-4">Kondisi & Penanganan</th>
                  <th className="py-3 px-4">Financial Saat Ini</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {paginatedInventory.map((item) => {
                  const { nilaiSaatIni } = calculateDepreciation(item.hargaPembelian, item.tanggalPembelian);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/40 animate-in fade-in duration-150">
                      {/* Photo and ID */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3.5">
                          <button
                            type="button"
                            onClick={() => setZoomImage({ url: getProductImage(item), title: item.namaBarang })}
                            className="relative group cursor-zoom-in focus:outline-hidden"
                            title="Klik untuk memperbesar foto"
                          >
                            <img
                              src={getProductImage(item)}
                              alt={item.namaBarang}
                              referrerPolicy="no-referrer"
                              className="w-12 h-12 object-cover rounded-lg border border-slate-100 transition duration-200 group-hover:scale-105 group-hover:brightness-95 shadow-xs"
                            />
                            <div className="absolute inset-0 bg-black/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[7px] text-white font-bold uppercase tracking-wider">
                              Zoom
                            </div>
                          </button>
                          <div>
                            <span className="block font-bold text-[#11512f]">{item.id}</span>
                            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{item.kodeBarang}</span>
                          </div>
                        </div>
                      </td>

                      {/* Detail Barang */}
                      <td className="py-3 px-4">
                        <div>
                          <div className="flex items-center flex-wrap gap-1.5">
                            <span className="block text-slate-800 font-bold text-xs">{item.namaBarang}</span>
                            {(item as any).isOfflineDraft && (
                              <span className="inline-block px-1.5 py-0.2 bg-amber-50 text-amber-700 text-[8px] rounded border border-amber-200 uppercase font-black tracking-wider animate-pulse">
                                Offline Draft
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            {item.merk} {item.seri ? `• ${item.seri}` : ''} {item.ukuran ? `• Ukuran: ${item.ukuran}` : ''}
                          </span>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            <span className="inline-block px-1.5 py-0.5 bg-sky-50 text-sky-700 text-[9px] rounded-full font-bold">
                              {item.kategoriBarang}
                            </span>
                            {item.hargaSewaBarang && item.hargaSewaBarang > 0 ? (
                              <span className="inline-block px-1.5 py-0.5 bg-emerald-50 text-emerald-850 text-[9px] rounded-full font-bold border border-emerald-100">
                                Sewa: {formatRupiah(item.hargaSewaBarang)}/hari
                              </span>
                            ) : (
                              <span className="inline-block px-1.5 py-0.5 bg-slate-50 text-slate-500 text-[9px] rounded-full font-bold">
                                Non-Sewa / Internal
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Penempatan */}
                      <td className="py-3 px-4">
                        <div className="text-slate-600 truncate max-w-36">{item.tempatPenyimpanan || 'Basecamp'}</div>
                        <div className="text-[10px] text-slate-400 mt-1">{item.tanggalPembelian}</div>
                      </td>

                      {/* Stok & Status */}
                      <td className="py-3 px-4 text-center">
                        <div className="text-sm font-bold text-slate-800">{item.kuantitas}</div>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold mt-1.5 ${
                          item.statusBarang === 'Ready'
                            ? 'bg-emerald-50 text-emerald-700'
                            : item.statusBarang === 'Pemakaian'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}>
                          {item.statusBarang}
                        </span>
                      </td>

                      {/* Kondisi & Penanganan */}
                      <td className="py-3 px-4">
                        <div className="text-slate-700 text-xs">{item.kondisiBarang}</div>
                        <div className="text-[10px] text-slate-400 mt-1 leading-none">Penanganan: {item.penanganan}</div>
                      </td>

                      {/* Financial */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-700">{formatRupiah(item.hargaPembelian)}</div>
                        <div className="text-[10px] text-emerald-600 mt-1">Net: {formatRupiah(nilaiSaatIni)}</div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            id={`btn-view-${item.id}-${baseId}`}
                            onClick={() => setViewingItem(item)}
                            className="p-1 px-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition"
                            title="Detail"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            id={`btn-edit-${item.id}-${baseId}`}
                            onClick={() => handleOpenEdit(item)}
                            className="p-1 px-1.5 rounded-md hover:bg-slate-150 text-slate-500 hover:text-emerald-700 transition"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            id={`btn-delete-${item.id}-${baseId}`}
                            onClick={() => {
                              let confirmDelete = true;
                              try {
                                confirmDelete = window.confirm(`Hapus barang ${item.namaBarang}?`);
                              } catch (err) {
                                confirmDelete = true;
                              }
                              if (confirmDelete) {
                                onDeleteItem(item.id);
                              }
                            }}
                            className="p-1 px-1.5 rounded-md hover:bg-rose-50 text-rose-500 hover:text-rose-700 transition"
                            title="Hapus"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400">
            <RefreshCw className="h-10 w-10 mx-auto text-slate-200 mb-2.5 animate-spin-slow" />
            <p className="text-xs font-semibold">Tidak ditemukan hasil pencarian</p>
            <p className="text-[10px] mt-0.5">Ubah pencarian atau bersihkan filter di atas.</p>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="bg-slate-50/50 px-4 py-3 border-t border-slate-100 flex items-center justify-between">
            <div className="text-[11px] text-slate-500 font-semibold">
              Menampilkan {Math.min(filteredInventory.length, (currentPage - 1) * itemsPerPage + 1)}-
              {Math.min(filteredInventory.length, currentPage * itemsPerPage)} dari {filteredInventory.length} barang
            </div>
            <div className="flex items-center space-x-1">
              <button
                id={`btn-page-prev-${baseId}`}
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
                id={`btn-page-next-${baseId}`}
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

      {/* DETAIL MODAL POPUP */}
      {viewingItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              id={`close-detail-${baseId}`}
              onClick={() => setViewingItem(null)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="p-6">
              <div className="flex items-start space-x-4">
                <img
                  src={getProductImage(viewingItem)}
                  alt={viewingItem.namaBarang}
                  referrerPolicy="no-referrer"
                  className="w-24 h-24 object-cover rounded-xl border border-slate-150"
                />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 font-mono tracking-widest uppercase">{viewingItem.kodeBarang}</span>
                  <h3 className="text-lg font-bold text-slate-800 leading-snug mt-1">{viewingItem.namaBarang}</h3>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="px-2 py-0.5 bg-emerald-50 text-[#11512f] text-[9px] font-bold rounded-full">
                      Kondisi: {viewingItem.kondisiBarang}
                    </span>
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                      viewingItem.statusBarang === 'Ready' ? 'bg-teal-50 text-teal-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      Status: {viewingItem.statusBarang}
                    </span>
                  </div>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 gap-y-3.5 gap-x-5 mt-6 border-t border-slate-100 pt-4 text-xs">
                <div>
                  <span className="block text-slate-400 font-bold text-[9px] uppercase tracking-wider">Merk &amp; Seri</span>
                  <span className="font-semibold text-slate-800">{viewingItem.merk} {viewingItem.seri ? `(${viewingItem.seri})` : '-'}</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-bold text-[9px] uppercase tracking-wider">Kategori</span>
                  <span className="font-semibold text-slate-800">{viewingItem.kategoriBarang}</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-bold text-[9px] uppercase tracking-wider">Ukuran &amp; Berat</span>
                  <span className="font-semibold text-slate-800">{viewingItem.ukuran || '-'} / {viewingItem.berat || '-'}</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-bold text-[9px] uppercase tracking-wider">Jumlah Tersedia</span>
                  <span className="font-bold text-slate-800">{viewingItem.kuantitas} pcs</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-bold text-[9px] uppercase tracking-wider">Harga Beli</span>
                  <span className="font-bold text-slate-800">{formatRupiah(viewingItem.hargaPembelian)}</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-bold text-[9px] uppercase tracking-wider">Nilai Buku Net</span>
                  <span className="font-bold text-emerald-700">
                    {formatRupiah(calculateDepreciation(viewingItem.hargaPembelian, viewingItem.tanggalPembelian).nilaiSaatIni)}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="block text-slate-400 font-bold text-[9px] uppercase tracking-wider">Gudang Penyimpanan</span>
                  <span className="font-semibold text-slate-800">{viewingItem.tempatPenyimpanan || 'Basecamp Logistik'}</span>
                </div>
                <div className="col-span-2">
                  <span className="block text-slate-400 font-bold text-[9px] uppercase tracking-wider">Keterangan / Memo</span>
                  <p className="font-semibold text-slate-600 leading-relaxed mt-1">{viewingItem.keterangan || 'Tidak ada catatan.'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL POPUP */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              id={`close-form-${baseId}`}
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition"
            >
              <X className="h-5 w-5" />
            </button>
            
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center space-x-2">
                <span>{editingItem ? 'Edit Barang Inventaris' : 'Tambah Barang Baru'}</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nama Barang */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nama Barang *</label>
                  <input
                    id={`form-nama-${baseId}`}
                    type="text"
                    name="namaBarang"
                    required
                    value={formData.namaBarang}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#11512f] focus:bg-white transition"
                    placeholder="Contoh: Lampu Tenda Led"
                  />
                </div>

                {/* Kategori */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Kategori *</label>
                  <select
                    id={`form-kategori-${baseId}`}
                    name="kategoriBarang"
                    value={formData.kategoriBarang}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#11512f] focus:bg-white transition"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Kode Barang */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Kode Barang *</label>
                  <div className="flex space-x-2">
                    <input
                      id={`form-kode-${baseId}`}
                      type="text"
                      name="kodeBarang"
                      required
                      value={formData.kodeBarang}
                      onChange={handleFormChange}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#11512f] focus:bg-white transition"
                      placeholder="BT-KMH-CR-001"
                    />
                    <button
                      id={`btn-autocode-${baseId}`}
                      type="button"
                      onClick={generateAutoCode}
                      className="px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold rounded-lg transition"
                    >
                      Bantu Code
                    </button>
                  </div>
                </div>

                {/* Merk */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Merk *</label>
                  <input
                    id={`form-merk-${baseId}`}
                    type="text"
                    name="merk"
                    required
                    value={formData.merk}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#11512f] focus:bg-white transition"
                    placeholder="Contoh: Eiger, Consina"
                  />
                </div>

                {/* Seri */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Seri Model</label>
                  <input
                    id={`form-seri-${baseId}`}
                    type="text"
                    name="seri"
                    value={formData.seri}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#11512f] focus:bg-white transition"
                    placeholder="Contoh: Guardian 4P"
                  />
                </div>

                {/* Ukuran */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Ukuran / Kapasitas</label>
                  <input
                    id={`form-ukuran-${baseId}`}
                    type="text"
                    name="ukuran"
                    value={formData.ukuran}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#11512f] focus:bg-white transition"
                    placeholder="Contoh: 60 Liter, Double"
                  />
                </div>

                {/* Berat */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Berat / Massal (kg)</label>
                  <input
                    id={`form-berat-${baseId}`}
                    type="text"
                    name="berat"
                    value={formData.berat}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#11512f] focus:bg-white transition"
                    placeholder="Contoh: 1.5 kg"
                  />
                </div>

                {/* Kuantitas */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Kuantitas Total *</label>
                  <input
                    id={`form-kuantitas-${baseId}`}
                    type="number"
                    name="kuantitas"
                    required
                    min="1"
                    value={formData.kuantitas}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#11512f] focus:bg-white transition"
                  />
                </div>

                {/* Harga Pembelian */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Harga Pembelian (Rp) *</label>
                  <input
                    id={`form-harga-${baseId}`}
                    type="number"
                    name="hargaPembelian"
                    required
                    min="0"
                    value={formData.hargaPembelian}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#11512f] focus:bg-white transition"
                  />
                </div>

                {/* Harga Sewa Barang */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Harga Sewa Barang (Rp / Hari)</label>
                  <input
                    id={`form-sewa-${baseId}`}
                    type="number"
                    name="hargaSewaBarang"
                    min="0"
                    value={formData.hargaSewaBarang || 0}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#11512f] focus:bg-white transition"
                    placeholder="Contoh: 35000"
                  />
                </div>

                {/* Tanggal Pembelian */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tanggal Pembelian *</label>
                  <input
                    id={`form-tanggal-${baseId}`}
                    type="date"
                    name="tanggalPembelian"
                    required
                    value={formData.tanggalPembelian}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#11512f] focus:bg-white transition"
                  />
                </div>

                {/* Temp Penyimpanan */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tempat Penyimpanan</label>
                  <input
                    id={`form-tempat-${baseId}`}
                    type="text"
                    name="tempatPenyimpanan"
                    value={formData.tempatPenyimpanan}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#11512f] focus:bg-white transition"
                    placeholder="Rak 2, Lemari Kaca, dll"
                  />
                </div>

                {/* Upload Foto */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Foto Barang (Upload / Base64)</label>
                  <div className="flex items-center space-x-2">
                    <label className="flex flex-col items-center justify-center p-2.5 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-350 rounded-lg cursor-pointer flex-1">
                      <div className="flex items-center space-x-2">
                        <Upload className="h-4 w-4 text-[#11512f]" />
                        <span className="text-[10px] font-semibold text-slate-650">Pilih Foto</span>
                      </div>
                      <input
                        id={`upload-file-${baseId}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUploaded}
                      />
                    </label>
                    {formData.fotoBarang && (
                      <img
                        src={formData.fotoBarang}
                        alt="Preview"
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 object-cover rounded-lg border"
                      />
                    )}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Status Barang</label>
                  <select
                    id={`form-status-${baseId}`}
                    name="statusBarang"
                    value={formData.statusBarang}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#11512f] focus:bg-white transition"
                  >
                    <option value="Ready">Ready</option>
                    <option value="Pemakaian">Pemakaian</option>
                    <option value="Perbaikan">Perbaikan</option>
                    <option value="Perawatan">Perawatan</option>
                  </select>
                </div>

                {/* Kondisi */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Kondisi Barang</label>
                  <select
                    id={`form-kondisi-${baseId}`}
                    name="kondisiBarang"
                    value={formData.kondisiBarang}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#11512f] focus:bg-white transition"
                  >
                    <option value="Baru">Baru</option>
                    <option value="Baik">Baik (Normal)</option>
                    <option value="Rusak Ringan">Rusak Ringan</option>
                    <option value="Tidak Dapat Dipakai">Sangat Rusak / Lapuk</option>
                  </select>
                </div>

                {/* Penanganan */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Upaya Penanganan</label>
                  <select
                    id={`form-penanganan-${baseId}`}
                    name="penanganan"
                    value={formData.penanganan}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#11512f] focus:bg-white transition"
                  >
                    <option value="Tidak">Tidak Ada</option>
                    <option value="Perbaikan">Perbaikan Intensif</option>
                    <option value="Perawatan">Perawatan / Cuci khusus</option>
                  </select>
                </div>

                {/* Keterangan */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Catatan Keterangan</label>
                  <textarea
                    id={`form-ket-${baseId}`}
                    name="keterangan"
                    rows={2}
                    value={formData.keterangan}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#11512f] focus:bg-white transition"
                    placeholder="Catatan pengerjaan lapangan, pembuat, warna, atau detail spesifik."
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  id={`btn-cancel-form-${baseId}`}
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-650 text-xs font-bold rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  id={`btn-save-form-${baseId}`}
                  type="submit"
                  className="px-5 py-2 bg-[#11512f] hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition"
                >
                  {editingItem ? 'Simpan Perubahan' : 'Simpan Barang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PHOTO ZOOM MODAL POPUP */}
      {zoomImage && (
        <div 
          className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 cursor-zoom-out"
          onClick={() => setZoomImage(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              id={`btn-close-zoom-${baseId}`}
              onClick={() => setZoomImage(null)}
              className="absolute top-3 right-3 p-1.5 bg-slate-900/60 hover:bg-slate-900/80 rounded-full text-white transition z-10 cursor-pointer"
              title="Tutup Pratinjau"
            >
              <X className="h-4.5 w-4.5" />
            </button>
            <div className="p-1.5 bg-slate-950 flex items-center justify-center min-h-64">
              <img 
                src={zoomImage.url} 
                alt={zoomImage.title} 
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-800">{zoomImage.title}</h4>
                <p className="text-[10px] text-slate-400 font-semibold font-mono">B-LOGISTIK PHOTO PREVIEW</p>
              </div>
              <span className="text-[10px] text-[#11512f] font-bold">PT. Barengin Trip</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
