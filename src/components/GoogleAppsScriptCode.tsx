import { useState, useId } from 'react';
import { Copy, Check, Download, FileCode, Code, Eye, HelpCircle } from 'lucide-react';
import { indexHtmlContent } from './IndexHtmlContent';

interface Props {
  spreadsheetUrl: string;
  driveFolderUrl: string;
}

export default function GoogleAppsScriptCode({ spreadsheetUrl, driveFolderUrl }: Props) {
  const baseId = useId();
  const [copiedGs, setCopiedGs] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState<'gs' | 'html'>('gs');

  const handleCopy = (code: string, type: 'gs' | 'html') => {
    navigator.clipboard.writeText(code);
    if (type === 'gs') {
      setCopiedGs(true);
      setTimeout(() => setCopiedGs(false), 2000);
    } else {
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2000);
    }
  };

  const handleDownload = (filename: string, text: string) => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Extract ID Drive Folder dari URL
  const getDriveFolderId = (url: string) => {
    try {
      if (!url) return '1g5COcgVXWqbGXpRyB0lLLp3bL2vyM-Tb';
      const match = url.match(/folders\/([a-zA-Z0-9-_]+)/);
      return match ? match[1] : '1g5COcgVXWqbGXpRyB0lLLp3bL2vyM-Tb';
    } catch {
      return '1g5COcgVXWqbGXpRyB0lLLp3bL2vyM-Tb';
    }
  };

  // Extract ID Spreadsheet dari URL
  const getSpreadsheetId = (url: string) => {
    try {
      if (!url) return '1dLkbeEVKGltlfcEY9gjECOw_R8tVqyZtKvogyQDfRIM';
      const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
      return match ? match[1] : '1dLkbeEVKGltlfcEY9gjECOw_R8tVqyZtKvogyQDfRIM';
    } catch {
      return '1dLkbeEVKGltlfcEY9gjECOw_R8tVqyZtKvogyQDfRIM';
    }
  };

  const spreadsheetId = getSpreadsheetId(spreadsheetUrl);
  const folderId = getDriveFolderId(driveFolderUrl);

  const codeGs = `/**
 * ====================================================================
 * Code.gs - Code Server-Side Apps Script
 * Sistem Manajemen Inventaris PT. Barengin Trip
 * ====================================================================
 * Deskripsi: Handler utama koneksi Google Spreadsheet, Google Drive
 * untuk upload file, kalkulasi depresiasi kustom, dan servis Web App.
 * 
 * Pengaturan Spreadsheet ID dan Folder ID Drive:
 * Diambil secara dinamis dari konstanta di bawah ini.
 */

var SPREADSHEET_ID = "${spreadsheetId}";
var DRIVE_FOLDER_ID = "${folderId}";

// 1. Inisialisasi Database Spreadsheet Awal
// Jalankan fungsi ini pertama kali di editor Google Apps Script Anda!
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('PT. Barengin Trip')
    .addItem('⚙️ Inisialisasi Database', 'inisialisasiDatabase')
    .addToUi();
}

function inisialisasiDatabase() {
  try {
    getSheetByName("Inventaris");
    getSheetByName("Log");
    getSheetByName("Configuration");
    Logger.log("Inisialisasi Berhasil! Seluruh Tab ('Inventaris', 'Log', 'Configuration') dan header default telah terbuat.");
    return "Database Google Sheets berhasil dibuat dan dikonfigurasi.";
  } catch(e) {
    Logger.log("Error inisialisasiDatabase: " + e.message);
    throw new Error("Gagal menginisialisasi database: " + e.message);
  }
}

// 2. Inisialisasi Servis Web App
function doGet(e) {
  var template = HtmlService.createTemplateFromFile('Index');
  template.spreadsheetUrl = "https://docs.google.com/spreadsheets/d/" + SPREADSHEET_ID;
  template.driveFolderUrl = "https://drive.google.com/drive/folders/" + DRIVE_FOLDER_ID;
  
  return template.evaluate()
      .setTitle("Inventaris PT. Barengin Trip")
      .setSandboxMode(HtmlService.SandboxMode.IFRAME)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Helper untuk menyambung ke sheet, buat otomatis jika belum ada sheet-nya
function getSheetByName(name) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    // Tambah header default berdasarkan nama sheet
    if (name === "Inventaris") {
      sheet.appendRow([
        "ID Barang", "Kode Barang", "Nama Barang", "Merk", "Seri", "Ukuran", 
        "Berat", "Kuantitas", "Harga Pembelian", "Status Barang", 
        "Kondisi Barang", "Penanganan", "Tempat Penyimpanan", 
        "Tanggal Pembelian", "Foto Barang", "Kategori Barang", "Keterangan"
      ]);
    } else if (name === "Log") {
      sheet.appendRow([
        "ID Log", "Tanggal Log", "Jenis Aktivitas", "ID Barang", "Nama Barang", 
        "Jumlah", "Pemakai", "Divisi", "Keterangan", "Kondisi Keluar", 
        "Kondisi Kembali", "Status Pengembalian", "PIC"
      ]);
    } else if (name === "Configuration") {
      sheet.appendRow(["Key", "Value"]);
      sheet.appendRow(["companyName", "PT. Barengin Trip Operasional"]);
      sheet.appendRow(["address", "Jl. Pemuda No. 42, Bantul, D.I. Yogyakarta"]);
      sheet.appendRow(["contact", "+62 812-3456-7890"]);
      sheet.appendRow(["picName", "Rizki S. (Kepala Logistik)"]);
      sheet.appendRow(["logoUrl", "https://i.ibb.co/L97r2vL/logo-barengin.png"]);
    }
  }
  return sheet;
}

// 2. AMBIL DATA INVENTARIS + KALKULASI DEPRESIASI OTOMATIS
function getInventory() {
  try {
    var sheet = getSheetByName("Inventaris");
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];
    
    var headers = data[0];
    var items = [];
    var today = new Date();
    
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var item = {};
      for (var j = 0; j < headers.length; j++) {
        var key = toCamelCase(headers[j]);
        var val = row[j];
        
        // Format tanggal agar seragam ISO String
        if (val instanceof Date) {
          val = val.toISOString().split('T')[0];
        }
        item[key] = val;
      }
      
      // Hitung Depresiasi On-The-Fly (2% per bulan)
      var hargaBeli = Number(item.hargaPembelian) || 0;
      var tglBeli = item.tanggalPembelian ? new Date(item.tanggalPembelian) : null;
      var months = 0;
      
      if (tglBeli && !isNaN(tglBeli.getTime())) {
        months = (today.getFullYear() - tglBeli.getFullYear()) * 12 + (today.getMonth() - tglBeli.getMonth());
        if (months < 0) months = 0;
      }
      
      var deprRate = 0.02 * months;
      var nilaiDepr = hargaBeli * deprRate;
      var nilaiSaatIni = Math.max(0, hargaBeli - nilaiDepr);
      
      item.nilaiDepresiasi = Math.round(nilaiDepr);
      item.nilaiSaatIni = Math.round(nilaiSaatIni);
      item.bulanDepresiasi = months;
      
      items.push(item);
    }
    return items;
  } catch(err) {
    Logger.log("Error getInventory: " + err.message);
    throw new Error("Gagal mengambil data inventaris: " + err.message);
  }
}

// 3. TAMBAH ATAU EDIT INVENTARIS
function saveInventoryItem(item) {
  try {
    var sheet = getSheetByName("Inventaris");
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    
    // Konversi object item ke baris array sesuai urutan header
    var rowValues = [];
    
    // Validasi atau Buat ID otomatis
    if (!item.id) {
      var lastIdNum = 0;
      if (data.length > 1) {
        for (var i = 1; i < data.length; i++) {
          var curId = String(data[i][0]); // Kolom pertama (ID Barang)
          var match = curId.match(/BT-ID-(\\d+)/);
          if (match) {
            var num = parseInt(match[1], 10);
            if (num > lastIdNum) lastIdNum = num;
          }
        }
      }
      item.id = "BT-ID-" + String(lastIdNum + 1).padStart(3, '0');
    }
    
    // Cari baris apakah barang sudah ada (Edit mode)
    var rowIndex = -1;
    if (data.length > 1) {
      for (var i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(item.id)) {
          rowIndex = i + 1; // 1-indexed baris spreadsheet
          break;
        }
      }
    }
    
    // Susun array value berdasarkan header spreadsheet secara tepat
    for (var j = 0; j < headers.length; j++) {
      var key = toCamelCase(headers[j]);
      var value = item[key];
      
      if (value === undefined || value === null) {
        value = "";
      }
      
      // Pastikan kuantitas dan harga dalam numerik
      if (key === "kuantitas" || key === "hargaPembelian") {
        value = Number(value) || 0;
      }
      
      rowValues.push(value);
    }
    
    if (rowIndex !== -1) {
      // Update baris lama
      sheet.getRange(rowIndex, 1, 1, rowValues.length).setValues([rowValues]);
    } else {
      // Append baris baru
      sheet.appendRow(rowValues);
    }
    
    return { success: true, item: item };
  } catch(err) {
    Logger.log("Error saveInventoryItem: " + err.message);
    throw new Error("Gagal menyimpan barang: " + err.message);
  }
}

// 4. HAPUS BARANG INVENTARIS
function deleteInventoryItem(id) {
  try {
    var sheet = getSheetByName("Inventaris");
    var data = sheet.getDataRange().getValues();
    
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(id)) {
        sheet.deleteRow(i + 1);
        return { success: true, id: id };
      }
    }
    throw new Error("Barang dengan ID " + id + " tidak ditemukan.");
  } catch(err) {
    throw new Error("Gagal menghapus barang: " + err.message);
  }
}

// 5. GET LOG AKTIVITAS (KELUAR - MASUK BARANG)
function getLogs() {
  try {
    var sheet = getSheetByName("Log");
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];
    
    var headers = data[0];
    var logs = [];
    
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var log = {};
      for (var j = 0; j < headers.length; j++) {
        var key = toCamelCase(headers[j]);
        var val = row[j];
        if (val instanceof Date) {
          // Format tanggal log cantik
          val = val.toISOString().replace('T', ' ').substring(0, 16);
        }
        log[key] = val;
      }
      logs.push(log);
    }
    // Urutkan log terbaru di paling atas
    return logs.reverse();
  } catch(err) {
    Logger.log("Error getLogs: " + err.message);
    throw new Error("Gagal mengambil log aktivitas: " + err.message);
  }
}

// 6. SIMPAN LOG AKTIVITAS + UPDATE STOK BARANG OTOMATIS
function saveLogItem(log) {
  try {
    var logSheet = getSheetByName("Log");
    var invSheet = getSheetByName("Inventaris");
    var invData = invSheet.getDataRange().getValues();
    
    // Cari barang berdasarkan ID
    var barisBarang = -1;
    var stokSaatIni = 0;
    var statusSaatIni = "Ready";
    
    if (invData.length > 1) {
      for (var i = 1; i < invData.length; i++) {
        if (String(invData[i][0]) === String(log.idBarang)) {
          barisBarang = i + 1; // 1-indexed
          stokSaatIni = Number(invData[i][7]) || 0; // Kolom 8 (Kuantitas)
          statusSaatIni = invData[i][9]; // Kolom 10 (Status)
          break;
        }
      }
    }
    
    if (barisBarang === -1) {
      throw new Error("Barang untuk log ini tidak ditemukan di database.");
    }
    
    // Buat ID Log baru jika belum ada
    if (!log.id) {
      var lastLogId = 0;
      var logData = logSheet.getDataRange().getValues();
      if (logData.length > 1) {
        for (var i = 1; i < logData.length; i++) {
          var curLogId = String(logData[i][0]);
          var match = curLogId.match(/LOG-(\\d+)/);
          if (match) {
            var num = parseInt(match[1], 10);
            if (num > lastLogId) lastLogId = num;
          }
        }
      }
      log.id = "LOG-" + String(lastLogId + 1).padStart(3, '0');
    }
    
    if (!log.tanggal) {
      log.tanggal = new Date().toISOString();
    }
    
    // UPDATE STOK BARANG DAN STATUS BERDASARKAN AKTIVITAS
    var jumlahMutasi = Number(log.jumlah) || 0;
    var stokBaru = stokSaatIni;
    var statusBaru = statusSaatIni;
    
    // Aturan Pengurangan / Penambahan Stok
    // Jika pengembalian barang, maka stok bertambah kembali
    if (log.statusPengembalian === "Sudah Kembali") {
      stokBaru = stokSaatIni + jumlahMutasi;
      statusBaru = "Ready";
    } else {
      // Jika aktivitas keluar awal
      if (["Pemakaian Trip", "Penyewaan Barang", "Pemakaian Pribadi Internal"].indexOf(log.jenisAktivitas) !== -1) {
        stokBaru = Math.max(0, stokSaatIni - jumlahMutasi);
        statusBaru = "Pemakaian";
      } else if (log.jenisAktivitas === "Dijual") {
        stokBaru = Math.max(0, stokSaatIni - jumlahMutasi);
        statusBaru = "Ready";
      } else if (log.jenisAktivitas === "Reparasi") {
        statusBaru = "Perbaikan";
      } else if (log.jenisAktivitas === "Perawatan") {
        statusBaru = "Perawatan";
      }
    }
    
    // Simpan Update ke Inventaris
    invSheet.getRange(barisBarang, 8).setValue(stokBaru); // Kolom J (Kuantitas)
    invSheet.getRange(barisBarang, 10).setValue(statusBaru); // Kolom J (Status Barang)
    
    // Simpan Log ke sheet Log aktivitas
    var logHeaders = logSheet.getDataRange().getValues()[0];
    var logValues = [];
    
    for (var k = 0; k < logHeaders.length; k++) {
      var key = toCamelCase(logHeaders[k]);
      var val = log[key];
      if (val === undefined || val === null) val = "";
      if (key === "jumlah") val = Number(val) || 0;
      logValues.push(val);
    }
    
    logSheet.appendRow(logValues);
    return { success: true, log: log, stokBaru: stokBaru, statusBaru: statusBaru };
    
  } catch(err) {
    Logger.log("Error saveLogItem: " + err.message);
    throw new Error("Gagal mencatat log keluar-masuk: " + err.message);
  }
}

// 7. UPLOAD FOTO BARANG KE GOOGLE DRIVE
function uploadFileToDrive(base64Data, fileName, mimeType) {
  try {
    var rawData = Utilities.base64Decode(base64Data.split(",")[1]);
    var blob = Utilities.newBlob(rawData, mimeType, fileName);
    
    // Buka folder Drive
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    var file = folder.createFile(blob);
    
    // Set izin agar file dapat dlihat oleh semua orang yang memiliki link
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    var url = file.getUrl();
    // Konversi link view menjadi link direct stream thumbnail yang aman
    var directUrl = "https://lh3.googleusercontent.com/d/" + file.getId() + "=s300";
    
    return {
      success: true,
      fileId: file.getId(),
      url: url,
      directUrl: directUrl
    };
  } catch(err) {
    Logger.log("Error uploadFileToDrive: " + err.message);
    throw new Error("Gagal mengupload foto ke Google Drive: " + err.message);
  }
}

// 8. GET & SAVE CONFIGURATION
function getAppConfig() {
  try {
    var sheet = getSheetByName("Configuration");
    var values = sheet.getDataRange().getValues();
    var config = {};
    for (var i = 1; i < values.length; i++) {
      config[values[i][0]] = values[i][1];
    }
    return config;
  } catch(err) {
    return {
      companyName: "PT. Barengin Trip Operasional",
      address: "Jl. Pemuda No. 42, Bantul, D.I. Yogyakarta",
      contact: "+62 812-3456-7890",
      picName: "Rizki S.",
      logoUrl: "https://i.ibb.co/L97r2vL/logo-barengin.png"
    };
  }
}

function saveAppConfig(config) {
  try {
    var sheet = getSheetByName("Configuration");
    sheet.clear();
    sheet.appendRow(["Key", "Value"]);
    for (var key in config) {
      sheet.appendRow([key, config[key]]);
    }
    return { success: true, config: config };
  } catch(err) {
    throw new Error("Gagal menyimpan konfigurasi: " + err.message);
  }
}

// Core Helper: Konversi Spaced String Header ke camelCase
function toCamelCase(str) {
  var s = str.trim()
             .replace(/[^a-zA-Z0-9 ]/g, "")
             .toLowerCase()
             .replace(/_([a-z])/g, function (g) { return g[1].toUpperCase(); });
  
  // Custom mapping untuk header spesifik Bahasa Indonesia ke model camelCase kita
  var maps = {
    "id barang": "id",
    "id log": "id",
    "tanggal log": "tanggal",
    "tanggal": "tanggal",
    "jenis aktivitas": "jenisAktivitas",
    "nama barang": "namaBarang",
    "kode barang": "kodeBarang",
    "kuantitas": "kuantitas",
    "harga pembelian": "hargaPembelian",
    "status barang": "statusBarang",
    "kondisi barang": "kondisiBarang",
    "tempat penyimpanan": "tempatPenyimpanan",
    "tanggal pembelian": "tanggalPembelian",
    "foto barang": "fotoBarang",
    "kategori barang": "kategoriBarang",
    "kondisi keluar": "kondisiKeluar",
    "kondisi kembali": "kondisiKembali",
    "status pengembalian": "statusPengembalian",
    "idbarang": "idBarang"
  };
  
  var lower = s.toLowerCase();
  if (maps[lower]) return maps[lower];
  
  return s.replace(/(?:^\\w|[A-Z]|\\b\\w)/g, function(word, index) {
    return index === 0 ? word.toLowerCase() : word.toUpperCase();
  }).replace(/\\s+/g, '');
}
`;

  return (
    <div id="google-apps-script-code-section" className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs">
        <div className="md:flex md:items-center md:justify-between border-b border-slate-100 pb-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-50 rounded-xl">
              <FileCode className="h-6 w-6 text-[#11512f]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Source Code Google Apps Script</h1>
              <p className="text-sm text-slate-500">
                Gunakan file di bawah ini untuk deploy langsung ke Google Sheets Anda tanpa server eksternal.
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <button
              id={`tab-code-${baseId}`}
              onClick={() => setActiveCodeTab('gs')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeCodeTab === 'gs'
                  ? 'bg-[#11512f] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <FileCode className="h-4 w-4 inline mr-2" />
              Code.gs
            </button>
            <button
              id={`tab-code-${baseId}`}
              onClick={() => setActiveCodeTab('html')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeCodeTab === 'html'
                  ? 'bg-[#11512f] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Code className="h-4 w-4 inline mr-2" />
              Index.html
            </button>
          </div>
        </div>

        {activeCodeTab === 'gs' ? (
          <div>
            <div className="flex justify-between items-center bg-slate-800 text-slate-300 px-4 py-2 rounded-t-xl text-xs font-mono">
              <span>Code.gs - Server Engine</span>
              <div className="flex items-center space-x-3">
                <button
                  id={`btn-copy-${baseId}`}
                  onClick={() => handleCopy(codeGs, 'gs')}
                  className="flex items-center hover:text-white space-x-1 cursor-pointer"
                >
                  {copiedGs ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Salin Kode</span>
                    </>
                  )}
                </button>
                <button
                  id={`btn-dl-${baseId}`}
                  onClick={() => handleDownload('Code.gs', codeGs)}
                  className="flex items-center hover:text-white space-x-1 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
            <pre className="p-4 bg-slate-900 text-slate-100 rounded-b-xl overflow-x-auto text-xs font-mono max-h-96 leading-relaxed">
              <code>{codeGs}</code>
            </pre>
            <div className="mt-3 text-xs text-slate-500 bg-amber-50 border border-amber-100 p-3 rounded-lg flex items-start space-x-2">
              <span className="text-amber-500 font-bold">💡 NOTE:</span>
              <span>
                Kode di atas sudah di-generate secara personal dengan <strong>Spreadsheet ID ({spreadsheetId})</strong> dan <strong>Drive Folder ID ({folderId})</strong> Anda. Anda tidak perlu repot menggantinya secara manual!
              </span>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center bg-slate-800 text-slate-300 px-4 py-2 rounded-t-xl text-xs font-mono">
              <span>Index.html - Client UI</span>
              <div className="flex items-center space-x-3">
                <button
                  id={`btn-copy-html-${baseId}`}
                  onClick={() => handleCopy(indexHtmlContent, 'html')}
                  className="flex items-center hover:text-white space-x-1 cursor-pointer"
                >
                  {copiedHtml ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Salin Kode HTML</span>
                    </>
                  )}
                </button>
                <button
                  id={`btn-dl-html-${baseId}`}
                  onClick={() => handleDownload('Index.html', indexHtmlContent)}
                  className="flex items-center hover:text-white space-x-1 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download HTML</span>
                </button>
              </div>
            </div>
            <pre className="p-4 bg-slate-900 text-slate-100 rounded-b-xl overflow-x-auto text-xs font-mono max-h-96 leading-relaxed">
              <code>{indexHtmlContent.substring(0, 5000)}...{"\n"}/* Baris kode selanjutnya di-download secara penuh via tombol Download HTML di atas */</code>
            </pre>
            <div className="mt-3 text-xs text-slate-500 bg-amber-50 border border-amber-100 p-3 rounded-lg flex items-start space-x-2">
              <span className="text-amber-500 font-bold">💡 NOTE:</span>
              <span>
                File <code>Index.html</code> lengkap berkapasitas penuh di atas (termasuk loader login, layout, dashboard mobile responsive, database table, dan log mutasi) dapat disalin atau diunduh secara instan untuk disisipkan ke Google Apps Script Editor Anda.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
