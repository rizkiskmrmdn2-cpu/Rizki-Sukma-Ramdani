import { useState, useMemo, useId } from 'react';
import { 
  Printer, 
  Table, 
  Download, 
  FileCheck, 
  TrendingDown, 
  AlertTriangle, 
  Wrench, 
  Compass, 
  CheckSquare,
  Sparkles,
  RefreshCw,
  Coins
} from 'lucide-react';
import { InventoryItem, ActivityLog, AppConfig } from '../types';
import { calculateDepreciation, formatRupiah } from '../utils';

interface Props {
  inventory: InventoryItem[];
  logs: ActivityLog[];
  config: AppConfig;
}

type ReportType = 'inventaris' | 'hilang' | 'reparasi' | 'pemakaian-trip' | 'depresiasi';

export default function Laporan({ inventory, logs, config }: Props) {
  const baseId = useId();
  const [activeReport, setActiveReport] = useState<ReportType>('inventaris');

  // Hitung data laporan secara dinamis
  const reportData = useMemo(() => {
    const listInventaris = inventory;
    
    const listHilang = logs.filter((log) => log.statusPengembalian === 'Tidak Kembali (Hilang)');
    
    const listReparasi = inventory.filter((item) => item.statusBarang === 'Perbaikan' || item.penanganan === 'Perbaikan');
    
    const listPemakaianTrip = logs.filter((log) => log.jenisAktivitas === 'Pemakaian Trip');
    
    const dataDepresiasi = inventory.map((item) => {
      const { nilaiDepresiasi, nilaiSaatIni, bulan } = calculateDepreciation(item.hargaPembelian, item.tanggalPembelian);
      return {
        ...item,
        nilaiDepresiasi,
        nilaiSaatIni,
        bulan
      };
    });

    return {
      inventaris: listInventaris,
      hilang: listHilang,
      reparasi: listReparasi,
      'pemakaian-trip': listPemakaianTrip,
      depresiasi: dataDepresiasi
    };
  }, [inventory, logs]);

  // Handler Print PDF A4 asli dengan Fallback Cerdas untuk Iframe Sandbox
  const handlePrint = () => {
    // 1. Coba print asli (jika dibuka di tab baru, ini langsung bekerja!)
    try {
      window.print();
    } catch (e) {
      console.warn('Metode pencetakan window.print() langsung dibatasi oleh sandbox iframe:', e);
    }
    
    // 2. Generate dan otomatis unduh dokumen cetak mandiri (HTML printer-friendly)
    // Ini adalah solusi bulletproof untuk bypass pembatasan Iframe Sandbox di AI Studio.
    const printDoc = document.getElementById('a4-print-document');
    if (!printDoc) return;
    
    const docHtml = printDoc.innerHTML;
    const fullHtml = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan_${activeReport.toUpperCase()}_PT_BARENGIN_TRIP</title>
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
    link.download = `laporan_${activeReport}_pt_barengin_trip_PRINT.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handler CSV export simulator
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    if (activeReport === 'inventaris') {
      csvContent += 'ID Barang,Kode Barang,Nama Barang,Merk,Kategori,Kuantitas,Harga Beli,Status\r\n';
      reportData.inventaris.forEach((item) => {
        csvContent += `"${item.id}","${item.kodeBarang}","${item.namaBarang}","${item.merk}","${item.kategoriBarang}",${item.kuantitas},${item.hargaPembelian},"${item.statusBarang}"\r\n`;
      });
    } else if (activeReport === 'hilang') {
      csvContent += 'ID Log,Tanggal,Barang,Jumlah,Oleh,Keterangan,PIC\r\n';
      reportData.hilang.forEach((log) => {
        csvContent += `"${log.id}","${log.tanggal}","${log.namaBarang}",${log.jumlah},"${log.pemakai}","${log.keterangan || ''}","${log.pic}"\r\n`;
      });
    } else if (activeReport === 'reparasi') {
      csvContent += 'ID Barang,Nama Barang,Kondisi,Penanganan,Tempat Penyimpanan\r\n';
      reportData.reparasi.forEach((item) => {
        csvContent += `"${item.id}","${item.namaBarang}","${item.kondisiBarang}","${item.penanganan}","${item.tempatPenyimpanan}"\r\n`;
      });
    } else if (activeReport === 'pemakaian-trip') {
      csvContent += 'ID Log,Tanggal,Nama Barang,Jumlah,Pemakai,Divisi,Status Kembali\r\n';
      reportData['pemakaian-trip'].forEach((log) => {
        csvContent += `"${log.id}","${log.tanggal}","${log.namaBarang}",${log.jumlah},"${log.pemakai}","${log.divisi}","${log.statusPengembalian}"\r\n`;
      });
    } else if (activeReport === 'depresiasi') {
      csvContent += 'ID Barang,Nama Barang,Harga Pembelian,Bulan Terlewati,Penyusutan (2%/Bulan),Nilai Buku Sekarang\r\n';
      reportData.depresiasi.forEach((item) => {
        csvContent += `"${item.id}","${item.namaBarang}",${item.hargaPembelian},${item.bulan},${item.nilaiDepresiasi},${item.nilaiSaatIni}\r\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `laporan_${activeReport}_pt_barengin_trip.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Selector Tabs */}
      <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-1.5">
            <button
              id={`tab-rep-inv-${baseId}`}
              onClick={() => setActiveReport('inventaris')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeReport === 'inventaris'
                  ? 'bg-[#11512f] text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileCheck className="h-3.5 w-3.5 inline mr-1.5" />
              Laporan Inventaris
            </button>
            <button
              id={`tab-rep-loss-${baseId}`}
              onClick={() => setActiveReport('hilang')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeReport === 'hilang'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5 inline mr-1.5 text-rose-500" />
              Penyusutan / Hilang
            </button>
            <button
              id={`tab-rep-repair-${baseId}`}
              onClick={() => setActiveReport('reparasi')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeReport === 'reparasi'
                  ? 'bg-[#11512f] text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Wrench className="h-3.5 w-3.5 inline mr-1.5" />
              Laporan Reparasi
            </button>
            <button
              id={`tab-rep-trip-${baseId}`}
              onClick={() => setActiveReport('pemakaian-trip')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeReport === 'pemakaian-trip'
                  ? 'bg-[#11512f] text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <CheckSquare className="h-3.5 w-3.5 inline mr-1.5" />
              Pemakaian Trip
            </button>
            <button
              id={`tab-rep-depr-${baseId}`}
              onClick={() => setActiveReport('depresiasi')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeReport === 'depresiasi'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <TrendingDown className="h-3.5 w-3.5 inline mr-1.5" />
              Laporan Depresiasi
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {/* Export CSV / Spreadsheet */}
            <button
              id={`btn-export-csv-${baseId}`}
              onClick={handleExportCSV}
              className="px-3.5 py-2 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center space-x-1.5 transition cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>

            {/* Print A4 Signoff PDF */}
            <button
              id={`btn-trigger-print-${baseId}`}
              onClick={handlePrint}
              className="px-4 py-2 bg-[#11512f] hover:bg-emerald-800 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Simpan PDF / A4 Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* A4 PRINT LAYOUT CONTAINER */}
      {/* Dilengkapi style media print khusus di index.css agar saat Print browser dijalankan, bagian ini mengokupasi halaman A4 secara presisi */}
      <div 
        id="a4-print-document" 
        className="bg-white border border-slate-150 rounded-2xl p-8 max-w-4xl mx-auto shadow-sm text-slate-800 print:border-0 print:shadow-none print:p-0"
      >
        {/* Dokumen Header */}
        <div className="flex items-start justify-between border-b-2 border-slate-800 pb-5 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white border border-slate-155 rounded-full flex items-center justify-center overflow-hidden p-0">
              <img 
                src={config.logoUrl || 'https://lh3.googleusercontent.com/d/1C-scCTu7H2eOa-ZtDhak1JcbRhTNCCIb'} 
                className="w-full h-full object-cover"
                alt="Logo PT. Barengin Trip"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = 'https://docs.google.com/uc?export=view&id=1C-scCTu7H2eOa-ZtDhak1JcbRhTNCCIb';
                }}
              />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">{config.companyName || 'PT. BARENGIN TRIP'}</h2>
              <p className="text-[10px] text-slate-500 font-semibold max-w-sm mt-0.5 leading-relaxed">
                {config.address || 'Address office'} &bull; Telp: {config.contact || 'No-Contact'}
              </p>
              <p className="text-[9px] text-[#11512f] font-mono tracking-wider mt-1 uppercase font-bold">OPERASIONAL LAPANGAN - BASECAMP GUDANG LOGISTIK</p>
            </div>
          </div>
          
          <div className="text-right text-xs">
            <h4 className="font-bold text-slate-900">LAPORAN OPERASIONAL</h4>
            <span className="inline-block px-2 py-0.5 bg-slate-100 rounded text-[9px] font-bold text-slate-600 mt-1 uppercase">
              Tipe: {activeReport}
            </span>
            <p className="text-[10px] text-slate-400 mt-2">Dicetak: 22 Mei 2026</p>
          </div>
        </div>

        {/* Laporan Tubuh */}
        <div className="min-h-96">
          {activeReport === 'inventaris' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-3 border-b pb-1">Lampiran A: Rekapitulasi Data Inventaris Fisik</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="border-b border-slate-400 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
                      <th className="py-2 px-3">ID Barang</th>
                      <th className="py-2 px-3">Kode Barang</th>
                      <th className="py-2 px-3">Nama Barang / Merk</th>
                      <th className="py-2 px-3">Kategori</th>
                      <th className="py-2 px-3 text-center">Stok</th>
                      <th className="py-2 px-3">Aset Nilai Beli</th>
                      <th className="py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {reportData.inventaris.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/20">
                        <td className="py-2 px-3 font-bold text-[#11512f]">{item.id}</td>
                        <td className="py-2 px-3 font-mono text-[10px]">{item.kodeBarang}</td>
                        <td className="py-2 px-3">
                          <span className="font-semibold block">{item.namaBarang}</span>
                          <span className="text-[9px] text-slate-400">Merk: {item.merk} {item.seri ? `| Seri: ${item.seri}` : ''}</span>
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-650">{item.kategoriBarang}</td>
                        <td className="py-2 px-3 text-center font-bold text-slate-700">{item.kuantitas} pcs</td>
                        <td className="py-2 px-3 font-bold">{formatRupiah(item.hargaPembelian)}</td>
                        <td className="py-2 px-3 font-semibold text-[#11512f]">{item.statusBarang}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeReport === 'hilang' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-3 border-b pb-1">Lampiran B: Laporan Penyusutan &amp; Barang Hilang</h3>
              {reportData.hilang.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="border-b border-slate-400 bg-slate-50 text-slate-600 font-bold">
                        <th className="py-2 px-3">ID Log</th>
                        <th className="py-2 px-3">Tanggal Laporan</th>
                        <th className="py-2 px-3">Barang Hilang / Rusak</th>
                        <th className="py-2 px-3 text-center">Jumlah</th>
                        <th className="py-2 px-3">Divisi / Penanggung Jawab</th>
                        <th className="py-2 px-3">Keterangan Kejadian</th>
                        <th className="py-2 px-3">PIC Gudang</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {reportData.hilang.map((log) => (
                        <tr key={log.id}>
                          <td className="py-2 px-3 font-bold text-rose-600">{log.id}</td>
                          <td className="py-2 px-3">{log.tanggal}</td>
                          <td className="py-2 px-3">
                            <span className="font-semibold">{log.namaBarang}</span>
                            <span className="block text-[9px] text-slate-400 font-mono">ID Barang: {log.idBarang}</span>
                          </td>
                          <td className="py-2 px-3 text-center font-bold text-rose-600">{log.jumlah} pcs</td>
                          <td className="py-2 px-3 font-semibold">{log.pemakai} ({log.divisi})</td>
                          <td className="py-2 px-3 text-slate-550 leading-relaxed font-semibold">{log.keterangan || 'Tidak ada keterangan rincian.'}</td>
                          <td className="py-2 px-3 font-semibold text-slate-600">{log.pic}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10 bg-slate-50 text-slate-400 rounded-lg">
                  Tidak ditemukan laporan kehilangan barang. Seluruh kru menjaga aset dengan sangat baik.
                </div>
              )}
            </div>
          )}

          {activeReport === 'reparasi' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-3 border-b pb-1">Lampiran C: Laporan Aset Dalam Reparasi / Perbaikan</h3>
              {reportData.reparasi.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="border-b border-slate-400 bg-slate-50 text-slate-600 font-bold">
                        <th className="py-2 px-3">ID Barang</th>
                        <th className="py-2 px-3">Kode Barang</th>
                        <th className="py-2 px-3">Nama Alat &amp; Merk</th>
                        <th className="py-2 px-3">Letak Penyimpanan</th>
                        <th className="py-2 px-3">Kondisi Alat</th>
                        <th className="py-2 px-3">Tindakan Penanganan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {reportData.reparasi.map((item) => (
                        <tr key={item.id}>
                          <td className="py-2 px-3 font-bold text-[#11512f]">{item.id}</td>
                          <td className="py-2 px-3 font-mono text-[10px]">{item.kodeBarang}</td>
                          <td className="py-2 px-3">
                            <span className="font-semibold block">{item.namaBarang}</span>
                            <span className="text-[9px] text-slate-400">Model: {item.merk} &bull; Catatan: {item.keterangan || '-'}</span>
                          </td>
                          <td className="py-2 px-3">{item.tempatPenyimpanan || 'Rak Bengkel Basecamp'}</td>
                          <td className="py-2 px-3 text-rose-600 font-bold">{item.kondisiBarang}</td>
                          <td className="py-2 px-3 text-slate-800 font-semibold">{item.penanganan}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10 bg-slate-50 text-slate-400 rounded-lg">
                  Tidak ada alat dalam perbaikan. Semua siap untuk trip!
                </div>
              )}
            </div>
          )}

          {activeReport === 'pemakaian-trip' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-3 border-b pb-1">Lampiran D: Log Riwayat Pemakaian Lapangan &amp; Trip</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="border-b border-slate-400 bg-slate-50 text-slate-600 font-bold text-[10px]">
                      <th className="py-2 px-3">KODE LOG</th>
                      <th className="py-2 px-3">TANGGAL</th>
                      <th className="py-2 px-3">ALAT / BARANG</th>
                      <th className="py-2 px-3 text-center">JUMLAH</th>
                      <th className="py-2 px-3">PEMAKAI / DIVISI</th>
                      <th className="py-2 px-3">STATUS PENGEMBALIAN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {reportData['pemakaian-trip'].map((log) => (
                      <tr key={log.id}>
                        <td className="py-2 px-3 font-bold text-slate-600">{log.id}</td>
                        <td className="py-2 px-3">{log.tanggal}</td>
                        <td className="py-2 px-3">
                          <span className="font-semibold">{log.namaBarang}</span>
                        </td>
                        <td className="py-2 px-3 text-center font-bold text-[#11512f]">{log.jumlah} pcs</td>
                        <td className="py-2 px-3 font-semibold">{log.pemakai} ({log.divisi})</td>
                        <td className="py-2 px-3">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            log.statusPengembalian === 'Sudah Kembali' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                          }`}>
                            {log.statusPengembalian}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeReport === 'depresiasi' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-3 border-b pb-1">Lampiran E: Laporan Penyusutan Depresiasi Finansial</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="border-b border-slate-400 bg-slate-50 text-slate-600 font-bold">
                      <th className="py-2 px-3">ID BARANG</th>
                      <th className="py-2 px-3">NAMA ALAT</th>
                      <th className="py-2 px-3">TANGGAL BELI</th>
                      <th className="py-2 px-3">MASA PAKAI</th>
                      <th className="py-2 px-3">HARGA BELI AWAL</th>
                      <th className="py-2 px-3">PENYUSUTAN TOTAL (2%/BLN)</th>
                      <th className="py-2 px-3">NILAI BUKU SEKARANG</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {reportData.depresiasi.map((item) => (
                      <tr key={item.id}>
                        <td className="py-2 px-3 font-bold text-emerald-700">{item.id}</td>
                        <td className="py-2 px-3 font-semibold">{item.namaBarang}</td>
                        <td className="py-2 px-3">{item.tanggalPembelian}</td>
                        <td className="py-2 px-3 text-center font-semibold text-[#11512f]">{item.bulan} bulan</td>
                        <td className="py-2 px-3 font-bold">{formatRupiah(item.hargaPembelian)}</td>
                        <td className="py-2 px-3 text-rose-600 font-bold">-{formatRupiah(item.nilaiDepresiasi)}</td>
                        <td className="py-2 px-3 text-emerald-800 font-extrabold">{formatRupiah(item.nilaiSaatIni)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Signatures Area */}
        <div className="mt-12 grid grid-cols-2 gap-8 text-center text-xs pt-8 border-t border-slate-200 pb-4">
          <div>
            <p className="text-slate-400 font-semibold uppercase">Diperiksa Oleh:</p>
            <p className="font-bold text-slate-800 mt-14">{config.picName || 'Rizki S. (Kepala Logistik)'}</p>
            <div className="border-t border-slate-350 w-44 mx-auto mt-1" />
            <p className="text-[10px] text-slate-400 mt-1">PIC Operasional Gudang</p>
          </div>
          <div>
            <p className="text-slate-400 font-semibold uppercase">Disetujui Oleh:</p>
            <p className="font-bold text-slate-850 mt-14">{config.directorName || 'Dafi Al-Wahid / Direktur'}</p>
            <div className="border-t border-slate-350 w-44 mx-auto mt-1" />
            <p className="text-[10px] text-slate-400 mt-1">Direktur Utama PT. Barengin Trip</p>
          </div>
        </div>
      </div>
    </div>
  );
}
