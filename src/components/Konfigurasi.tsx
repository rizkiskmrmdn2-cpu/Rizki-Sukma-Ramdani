import React, { useState, useId } from 'react';
import { Settings, Save, Check, RefreshCw, Database, FolderPlus, Building, Compass, Trash2, AlertTriangle } from 'lucide-react';
import { AppConfig } from '../types';

interface Props {
  config: AppConfig;
  onSaveConfig: (newConfig: AppConfig) => void;
  onResetAllData?: () => void;
}

export default function Konfigurasi({ config, onSaveConfig, onResetAllData }: Props) {
  const baseId = useId();
  const [formData, setFormData] = useState<AppConfig>({ ...config });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-xs">
        <div className="border-b border-slate-100 pb-4 mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-50 rounded-xl text-[#11512f]">
              <Settings className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Konfigurasi Sistem Utama</h1>
              <p className="text-xs text-slate-500">
                Atur informasi perusahaan, logo tracker, PIC utama, dan ID Google Sheet/Drive Anda di sini.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Nama Perusahaan */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center">
                <Building className="h-3.5 w-3.5 mr-1.5 text-[#11512f]" />
                Nama Perusahaan / Komunitas *
              </label>
              <input
                id={`conf-company-${baseId}`}
                type="text"
                name="companyName"
                required
                value={formData.companyName}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#11512f] focus:bg-white transition"
                placeholder="PT. Barengin Trip Operasional"
              />
            </div>

            {/* Nama PIC Operasional */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center">
                <Compass className="h-3.5 w-3.5 mr-1.5 text-[#11512f]" />
                Kepala Operasional (PIC Gudang) *
              </label>
              <input
                id={`conf-pic-${baseId}`}
                type="text"
                name="picName"
                required
                value={formData.picName}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#11512f] focus:bg-white transition"
                placeholder="Rizki S. (Kepala Logistik)"
              />
            </div>

            {/* Nama Direktur Utama */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center">
                <Compass className="h-3.5 w-3.5 mr-1.5 text-[#11512f]" />
                Direktur Utama *
              </label>
              <input
                id={`conf-director-${baseId}`}
                type="text"
                name="directorName"
                required
                value={formData.directorName}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#11512f] focus:bg-white transition"
                placeholder="Dafi Al-Wahid (Direktur Utama)"
              />
            </div>

            {/* Logo Instansi */}
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Logo Instansi / Logo Komunitas (Google Drive / lbb Direct Link)
              </label>
              <input
                id={`conf-logo-${baseId}`}
                type="text"
                name="logoUrl"
                value={formData.logoUrl}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#11512f] focus:bg-white transition"
                placeholder="https://drive.google.com/file/d/1zey39LeJHJnSpUVg1XvBDopB_kwlZkOd/view"
              />
            </div>

            {/* Alamat */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Alamat Instansi / Basecamp Utama</label>
              <textarea
                id={`conf-address-${baseId}`}
                name="address"
                rows={2}
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#11512f] focus:bg-white transition"
                placeholder="Jl. Pemuda No. 42, Bantul, D.I. Yogyakarta"
              />
            </div>

            {/* Kontak */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">No. Kontak / Telepon Operasional</label>
              <input
                id={`conf-contact-${baseId}`}
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#11512f] focus:bg-white transition"
                placeholder="+62 812-3456-7890"
              />
            </div>

            {/* Spreadsheet URL */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center">
                <Database className="h-3.5 w-3.5 mr-1.5 text-[#11512f]" />
                Google Spreadsheet Database URL *
              </label>
              <input
                id={`conf-ss-${baseId}`}
                type="text"
                name="spreadsheetUrl"
                required
                value={formData.spreadsheetUrl}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#11512f] focus:bg-white transition"
                placeholder="https://docs.google.com/spreadsheets/d/your-id-here"
              />
            </div>

            {/* Google Drive Folder URL */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center">
                <FolderPlus className="h-3.5 w-3.5 mr-1.5 text-[#11512f]" />
                Folder Upload Foto Google Drive URL *
              </label>
              <input
                id={`conf-drive-${baseId}`}
                type="text"
                name="driveFolderUrl"
                required
                value={formData.driveFolderUrl}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#11512f] focus:bg-white transition"
                placeholder="https://drive.google.com/drive/folders/your-folder-id"
              />
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-5 mt-4">
            <div className="text-[10px] text-slate-400 font-semibold leading-relaxed">
              *Pengaturan Google Spreadsheet &amp; Drive akan mengupdate generator kode Code.gs Anda secara dinamis.
            </div>
            
            <button
              id={`btn-save-config-${baseId}`}
              type="submit"
              className="px-5 py-2.5 bg-[#11512f] hover:bg-emerald-800 text-white font-bold rounded-lg flex items-center space-x-2 transition cursor-pointer shadow-xs"
            >
              {savedSuccess ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Konfigurasi Disimpan!</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Simpan Konfigurasi</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {onResetAllData && (
        <div className="bg-white rounded-xl border border-rose-100 p-6 shadow-xs">
          <div className="border-b border-rose-50 pb-4 mb-5">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-rose-50 rounded-xl text-rose-700">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">Manajemen Data &amp; Reset</h2>
                <p className="text-xs text-slate-500">
                  Bersihkan data simulasi bawaan agar Anda bisa meregistrasi inventaris dan mencatat log operasional riil mulai dari nol.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-rose-50 border border-rose-100 rounded-lg p-4 mb-5 flex items-start space-x-3 text-xs">
            <AlertTriangle className="h-5 w-5 text-rose-700 shrink-0 mt-0.5" />
            <div className="text-rose-900 leading-relaxed font-medium">
              <strong className="font-bold">Peringatan Keras:</strong> Tindakan ini akan menghapus seluruh data barang inventaris serta histori log transaksi keluar-masuk yang saat ini tersimpan di browser Anda secara permanen. Pastikan Anda telah menyinkronkan data penting jika diperlukan.
            </div>
          </div>

          <div className="flex items-center justify-between col-span-1 border-t border-slate-50 pt-4 mt-3">
            <div className="text-[10px] text-slate-400 font-semibold">
              Sistem akan otomatis me-refresh dengan tabel data kosong siap isi.
            </div>

            {!showConfirmReset ? (
              <button
                id="btn-trigger-reset"
                type="button"
                onClick={() => setShowConfirmReset(true)}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg flex items-center space-x-2 transition cursor-pointer text-xs"
              >
                <Trash2 className="h-4 w-4" />
                <span>Hapus Semua Data Contoh (Mulai Dari 0)</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  id="btn-cancel-reset"
                  type="button"
                  onClick={() => setShowConfirmReset(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition cursor-pointer text-xs"
                >
                  Batal
                </button>
                <button
                  id="btn-confirm-reset"
                  type="button"
                  onClick={() => {
                    onResetAllData();
                    setShowConfirmReset(false);
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg flex items-center space-x-2 transition cursor-pointer shadow-xs text-xs animate-pulse"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Ya, Hapus Semua Secara Permanen</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
