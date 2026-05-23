import { useId } from 'react';
import { HelpCircle, Table, FolderOpen, Cloud, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function PanduanDeploy() {
  return (
    <div className="space-y-6">
      <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 bg-emerald-100 rounded-lg text-[#11512f]">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Panduan Sinkronisasi & Deployment Lengkap</h2>
            <p className="text-sm text-slate-500">
              Ikuti langkah-langkah di bawah ini untuk mengaktifkan database Google Sheets Anda sendiri secara gratis.
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Step 1 */}
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600">Langkah 1</span>
              <Table className="h-6 w-6 text-amber-500" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-2">Setup Google Spreadsheet</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Buat Spreadsheet baru di Akun Google Anda, lalu buat 3 lembar sheet kosong dengan nama eksak:
            </p>
            <ul className="space-y-1 bg-slate-50 p-3 rounded-lg text-xs text-slate-600 font-mono mb-4">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                <span>Inventaris</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                <span>Log</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                <span>Configuration</span>
              </li>
            </ul>
            <p className="text-xs text-slate-400">
              *Letakkan nama ini pada tab sheet di pojok kiri bawah spreadsheet Anda.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600">Langkah 2</span>
              <FolderOpen className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-2">Setting Permission Google Drive</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Gunakan Google Drive untuk menyimpan file foto inventaris.
            </p>
            <ol className="space-y-2 bg-slate-50 p-3 rounded-lg text-xs text-slate-600 mb-4 list-decimal list-inside leading-relaxed">
              <li>Buat folder baru bernama <strong>"Foto Inventaris PT. Barengin Trip"</strong>.</li>
              <li>Klik kanan folder, pilih <strong>Bagikan (Share)</strong>.</li>
              <li>Ubah akses umum menjadi <strong>"Siapa saja yang memiliki link" (Anyone with link)</strong> sebagai <strong>Viewer (Pengakses)</strong>.</li>
            </ol>
            <p className="text-xs text-slate-400 leading-relaxed">
              *Ini diperlukan agar kru lapangan dapat mengunggah file foto mereka dan menampilkannya di aplikasi web.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600">Langkah 3</span>
              <Cloud className="h-6 w-6 text-emerald-500" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-2">Publish & Deploy Web App</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Gabungkan file Code.gs dan Index.html ke dalam Google Apps Script.
            </p>
            <ol className="space-y-1.5 bg-slate-50 p-3 rounded-lg text-xs text-slate-600 mb-4 list-decimal list-inside leading-relaxed">
              <li>Di Spreadsheet, klik <strong>Ekstensi (Extensions)</strong> &gt; <strong>Apps Script</strong>.</li>
              <li>Salin isi <code>Code.gs</code> ke editor skrip.</li>
              <li>Buat file HTML baru bernama <code>Index.html</code>, lalu salin isi kode Index HTML.</li>
              <li>Klik tombol <strong>Terapkan (Deploy)</strong> &gt; <strong>Penerapan baru (New deployment)</strong>.</li>
              <li>Pilih jenis <strong>Aplikasi Web (Web App)</strong>.</li>
              <li>Setel akses: <strong>Siapa saja (Anyone)</strong>, jalankan sebagai <strong>Saya (Me)</strong>.</li>
            </ol>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 text-xs text-amber-850 leading-relaxed space-y-2">
        <h4 className="font-bold text-sm text-slate-800 flex items-center">
          <span className="mr-2">💡</span> Mengapa menggunakan Google Sheets sebagai basis data?
        </h4>
        <p>
          Arsitektur nirlaba (serverless) ini memotong biaya server hosting bulanan hingga Rp 0. Data tersimpan di cloud terproteksi milik Google Drive perusahaan Anda, aman, real-time, dan mudah diedit langsung oleh direktur operasional/manajer di kantor secara kolaboratif menggunakan aplikasi Google Sheets resmi di handphone.
        </p>
      </div>
    </div>
  );
}
