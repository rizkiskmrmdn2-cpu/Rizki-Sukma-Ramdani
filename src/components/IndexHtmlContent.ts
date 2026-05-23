// This file contains the complete copypasteable HTML content for Index.html on Google Apps Script Web App
export const indexHtmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inventaris PT. Barengin Trip</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: { sans: ['"Plus Jakarta Sans"', 'sans-serif'], mono: ['"JetBrains Mono"', 'monospace'] },
          colors: { brand: { 50: '#f0fdf4', 100: '#dcfce7', 500: '#11512f', 600: '#14673d', 800: '#0c3821', 900: '#072415' } }
        }
      }
    }
  </script>
  <style>
    body { font-family: "Plus Jakarta Sans", sans-serif; background-color: #f8fafc; }
    .glass { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.3); }
    @media print {
      body { background-color: #ffffff !important; color: #000000 !important; }
      #sidebar-navigation, #top-bar, .no-print, button, .modal { display: none !important; }
      #main-content { margin: 0 !important; padding: 0 !important; width: 100% !important; }
      #a4-print-document { border: none !important; box-shadow: none !important; padding: 0 !important; width: 100% !important; }
    }
  </style>
</head>
<body class="text-slate-800 antialiased min-h-screen flex flex-col">

  <!-- TOAST NOTIFICATION -->
  <div id="toast" class="fixed bottom-5 right-5 z-55 hidden transform transition-all duration-300 max-w-sm p-4 bg-white rounded-xl shadow-2xl border border-slate-100 flex items-start space-x-3 text-xs font-bold">
    <i id="toast-icon" class="fa-solid fa-circle-check text-emerald-600 text-lg mt-0.5"></i>
    <span id="toast-message" class="text-slate-700 flex-1">Aksi berhasil!</span>
  </div>

  <!-- LOGIN PANEL -->
  <div id="login-section" class="fixed inset-0 z-50 flex items-center justify-center bg-cover bg-center" style="background-image: linear-gradient(rgba(17, 81, 47, 0.8), rgba(7, 36, 21, 0.95)), url('https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1200&q=80')">
    <div class="w-full max-w-md p-4">
      <div class="glass rounded-3xl p-8 shadow-2xl text-center space-y-6">
        <div class="flex flex-col items-center">
          <div class="w-16 h-16 bg-white rounded-full p-3 shadow-md flex items-center justify-center mb-3">
            <i class="fa-solid fa-compass text-2xl text-brand-500 animate-pulse"></i>
          </div>
          <h1 class="text-xl font-extrabold text-brand-900 tracking-tight">PT. Barengin Trip</h1>
          <p class="text-[9px] text-brand-600 font-bold uppercase tracking-wider mt-1">Sistem Manajemen Inventaris</p>
        </div>
        <form id="login-form" onsubmit="handleLoginSubmit(event)" class="space-y-4 text-left text-xs">
          <div id="login-error" class="hidden p-3 bg-red-50 border border-red-100 rounded-xl text-red-650 font-bold flex items-center">
            <i class="fa-solid fa-circle-exclamation mr-2"></i> Username atau Password salah!
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Username</label>
            <input id="username" type="text" required class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-brand-500 focus:bg-white transition" placeholder="Cth: barengintrip">
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Sandi Password</label>
            <input id="password" type="password" required class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-brand-500 focus:bg-white transition" placeholder="Cth: barengterus">
          </div>
          <button type="submit" class="w-full py-2.5 bg-brand-500 hover:bg-brand-650 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer">
            Masuk Aplikasi <i class="fa-solid fa-right-to-bracket ml-1.5"></i>
          </button>
        </form>
        <div class="text-[9px] text-slate-405 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 leading-relaxed font-semibold">
          Akun Demo: <b>barengintrip</b> / s: <b>barengterus</b> ATAU <b>rizki</b> / s: <b>040101</b>
        </div>
      </div>
    </div>
  </div>

  <!-- APPLICATION WORKSPACE -->
  <div id="app-workspace" class="hidden flex-1 flex flex-col md:flex-row">
    
    <!-- Sidebar Navigation -->
    <aside id="sidebar-navigation" class="w-64 bg-brand-900 text-white flex flex-col border-r border-brand-800 shrink-0 no-print">
      <div class="p-5 border-b border-brand-800 flex flex-col items-center text-center">
        <i class="fa-solid fa-compass text-3xl text-emerald-400 mb-2"></i>
        <h2 id="sidemenu-comp-title" class="text-xs font-extrabold tracking-wider bg-brand-800/65 py-1 px-3 rounded-md text-slate-100">PT. BARENGIN TRIP</h2>
        <p class="text-[8px] text-brand-100 uppercase tracking-widest font-mono mt-1">BASECAMP LOGISTIK</p>
      </div>
      <nav class="flex-1 p-3 space-y-1">
        <button onclick="switchTab('dashboard')" class="tab-btn active w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-xs font-bold transition hover:bg-brand-800 text-slate-300">
          <i class="fa-solid fa-chart-line w-4 text-center"></i> <span>Dashboard</span>
        </button>
        <button onclick="switchTab('inventaris')" class="tab-btn w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-xs font-bold transition hover:bg-brand-800 text-slate-300">
          <i class="fa-solid fa-cubes w-4 text-center"></i> <span>Database Inventaris</span>
        </button>
        <button onclick="switchTab('mutasi')" class="tab-btn w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-xs font-bold transition hover:bg-brand-800 text-slate-300">
          <i class="fa-solid fa-arrow-right-arrow-left w-4 text-center"></i> <span>Keluar - Masuk</span>
        </button>
        <button onclick="switchTab('trip')" class="tab-btn w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-xs font-bold transition hover:bg-brand-800 text-slate-300">
          <i class="fa-solid fa-mountain-sun w-4 text-center"></i> <span>Checklist Trip</span>
        </button>
        <button onclick="switchTab('laporan')" class="tab-btn w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-xs font-bold transition hover:bg-brand-800 text-slate-300">
          <i class="fa-solid fa-file-invoice w-4 text-center"></i> <span>Laporan A4 &amp; CSV</span>
        </button>
        <button onclick="switchTab('konfigurasi')" class="tab-btn w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-xs font-bold transition hover:bg-brand-800 text-slate-300">
          <i class="fa-solid fa-sliders w-4 text-center"></i> <span>Konfigurasi</span>
        </button>
      </nav>
      <!-- User profile -->
      <div class="p-4 border-t border-brand-800 bg-brand-950/20 text-xs flex items-center space-x-2.5 text-slate-305">
        <div class="h-8 w-8 bg-[#11512f] text-white flex items-center justify-center font-bold rounded-full border border-brand-100" id="user-initial">B</div>
        <div class="flex-1 min-w-0">
          <p id="user-title" class="font-bold text-slate-100 truncate">Kepala Gudang</p>
          <button onclick="handleLogout()" class="text-[9px] text-[#22c55e] font-bold hover:text-red-400 cursor-pointer block">Keluar <i class="fa-solid fa-sign-out"></i></button>
        </div>
      </div>
    </aside>

    <!-- Content Workspace -->
    <main id="main-content" class="flex-1 flex flex-col min-w-0 min-h-screen">
      <!-- Top header strip -->
      <header id="top-bar" class="h-16 border-b border-slate-100 bg-white shadow-sm flex items-center justify-between px-6 shrink-0 no-print">
        <h2 class="text-xs font-extrabold text-[#11512f] tracking-widest uppercase flex items-center">
          <i class="fa-solid fa-circle-check text-emerald-500 animate-pulse mr-2"></i> CLOUD DATABASE LINKED
        </h2>
        <span class="text-[10px] font-mono text-slate-400 font-bold bg-slate-50 px-2 py-1 rounded">PT. BARENGIN TRIP SYSTEM</span>
      </header>

      <div class="p-5 flex-1 overflow-y-auto space-y-6">

        <!-- DASHBOARD TAB -->
        <section id="pane-dashboard" class="pane-content space-y-6">
          <div class="bg-gradient-to-r from-[#11512f] to-emerald-850 text-white p-6 rounded-3xl shadow-md relative overflow-hidden">
            <h1 class="text-xl font-extrabold">Selamat Datang, Operator PT. Barengin Trip!</h1>
            <p class="text-xs text-brand-50 max-w-xl mt-1.5 leading-relaxed">Kelola logistik trip outbound, catat keluar masuk barang secara real-time, serta pantau penyusutan nilai buku asset di basecamp.</p>
            <i class="fa-solid fa-compass absolute right-5 -bottom-5 text-8xl text-emerald-900/15"></i>
          </div>

          <!-- Stats row -->
          <div class="grid grid-cols-2 md:grid-cols-5 gap-3.5">
            <div class="bg-white p-4 border border-slate-100 rounded-2xl flex items-center space-x-3 shadow-xs">
              <div class="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl"><i class="fa-solid fa-cubes text-sm"></i></div>
              <div><span class="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest">Total Jenis</span><span id="stat-total" class="text-sm font-black">0</span></div>
            </div>
            <div class="bg-white p-4 border border-slate-100 rounded-2xl flex items-center space-x-3 shadow-xs">
              <div class="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><i class="fa-solid fa-boxes-stacked text-sm"></i></div>
              <div><span class="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest">Aset Fisik</span><span id="stat-qty" class="text-sm font-black">0 Pcs</span></div>
            </div>
            <div class="bg-white p-4 border border-slate-100 rounded-2xl flex items-center space-x-3 shadow-xs">
              <div class="p-2.5 bg-orange-50 text-orange-600 rounded-xl"><i class="fa-solid fa-mountain text-sm"></i></div>
              <div><span class="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest">Sedang Trip</span><span id="stat-trip" class="text-sm font-black">0 Pcs</span></div>
            </div>
            <div class="bg-white p-4 border border-slate-100 rounded-2xl flex items-center space-x-3 shadow-xs">
              <div class="p-2.5 bg-rose-50 text-rose-500 rounded-xl"><i class="fa-solid fa-hammer text-sm"></i></div>
              <div><span class="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest">Reparasi</span><span id="stat-reparasi" class="text-sm font-black">0 Pcs</span></div>
            </div>
            <div class="bg-white p-4 border border-slate-100 rounded-2xl col-span-2 md:col-span-1 flex items-center space-x-3 shadow-xs">
              <div class="p-2.5 bg-violet-50 text-violet-600 rounded-xl"><i class="fa-solid fa-coins text-sm"></i></div>
              <div><span class="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest">Nilai Buku Net</span><span id="stat-val" class="text-xs font-black truncate max-w-[110px] block">Rp0</span></div>
            </div>
          </div>

          <!-- Pending Returns Table -->
          <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <h3 class="text-xs font-black uppercase text-slate-705 tracking-wider flex items-center">
              <i class="fa-solid fa-clock text-amber-500 mr-2 animate-pulse"></i> Daftar Pemakaian Aktif / Belum Kembali
            </h3>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="bg-slate-50 text-[9px] text-[#11512f] font-bold border-b border-slate-100 uppercase tracking-wide">
                    <th class="py-2.5 px-3">Log ID &amp; Tanggal</th>
                    <th class="py-2.5 px-3">Nama Alat</th>
                    <th class="py-2.5 px-3">Jumlah</th>
                    <th class="py-2.5 px-3">Pemakai / Divisi</th>
                    <th class="py-2.5 px-3">Keperluan</th>
                    <th class="py-2.5 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody id="dashboard-borrow-body" class="divide-y divide-slate-100 font-medium">
                  <tr><td colspan="6" class="py-6 text-center text-slate-400 text-xs">Seluruh log pengembalian telah selesai!</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- DATABASE INVENTARIS TAB -->
        <section id="pane-inventaris" class="pane-content hidden space-y-4">
          <div class="bg-white p-4 border border-slate-100 rounded-2xl shadow-xs md:flex md:items-center justify-between gap-4">
            <div class="flex-1 flex gap-2">
              <input id="inv-search" type="text" oninput="renderInventaris()" placeholder="Cari nama barang, kode, merk..." class="flex-1 max-w-sm px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-500">
              <select id="inv-cat-filter" onchange="renderInventaris()" class="px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold focus:outline-none">
                <option value="Semua">Semua Kategori</option>
                <option value="Kemah">Kemah</option>
                <option value="Elektronik">Elektronik</option>
                <option value="Trekking">Trekking</option>
                <option value="Alat Masak dan Minum">Alat Masak &amp; Minum</option>
                <option value="Bahan Baku Konsumsi">Bahan Baku Konsumsi</option>
                <option value="P3K">P3K / Obat</option>
              </select>
            </div>
            <button onclick="openInventoryModal()" class="px-4 py-2 bg-brand-500 hover:bg-brand-650 text-white font-bold rounded-xl text-xs shadow-md transition whitespace-nowrap cursor-pointer">
              <i class="fa-solid fa-plus mr-1"></i> Tambah Barang
            </button>
          </div>

          <div class="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="bg-slate-50 border-b border-slate-100 text-[#11512f] text-[9px] tracking-wider uppercase font-bold">
                    <th class="py-3 px-4">Foto</th>
                    <th class="py-3 px-4">Nama Alat &amp; Kode</th>
                    <th class="py-3 px-4">Merk &amp; Spesifikasi</th>
                    <th class="py-3 px-4 text-center">Stok Gudang</th>
                    <th class="py-3 px-4">Status &amp; Penyimpanan</th>
                    <th class="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody id="inventory-table-body" class="divide-y divide-slate-100 font-medium"></tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- KELUAR - MASUK MUTASI LOGS TAB -->
        <section id="pane-mutasi" class="pane-content hidden space-y-4">
          <div class="bg-white p-4 border border-slate-100 rounded-2xl shadow-xs flex flex-wrap md:items-center justify-between gap-3">
            <div class="flex items-center space-x-2">
              <input id="mut-search" type="text" oninput="renderLogs()" placeholder="Cari nama pemakai, PIC..." class="px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-500">
              <select id="mut-type-filter" onchange="renderLogs()" class="px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold focus:outline-none">
                <option value="Semua">Semua Aktivitas</option>
                <option value="Pemakaian Trip">Pemakaian Trip</option>
                <option value="Reparasi">Dalam Perbaikan</option>
                <option value="Keluar">Belum Kembali</option>
                <option value="Kembali">Sudah Kembali</option>
              </select>
            </div>
            <button onclick="openMutasiiModal()" class="px-4 py-2 bg-pink-700 hover:bg-pink-800 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer">
              <i class="fa-solid fa-shuffle mr-1"></i> Catat Mutasi Baru
            </button>
          </div>

          <div class="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="bg-slate-50 border-b border-slate-100 text-[#11512f] text-[9px] tracking-wider uppercase font-bold">
                    <th class="py-3 px-4">ID &amp; Tanggal</th>
                    <th class="py-3 px-4">Jenis Aktivitas</th>
                    <th class="py-3 px-4">Barang</th>
                    <th class="py-3 px-4 text-center">Jumlah</th>
                    <th class="py-3 px-4">Pemakai / Penyerah</th>
                    <th class="py-3 px-4">Status Pengembalian</th>
                    <th class="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody id="logs-table-body" class="divide-y divide-slate-100 font-medium"></tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- PACKING CHECKLIST TRIP TAB -->
        <section id="pane-trip" class="pane-content hidden space-y-4">
          <div class="bg-white p-5 border border-slate-100 rounded-xl shadow-xs space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-sm font-extrabold text-[#11512f]">Checklist Persiapan Perlengkapan Lapangan / Trip</h2>
                <p class="text-[10px] text-slate-500">Tick dan cetak daftar sebagai tanda terima logistik kru pendakian.</p>
              </div>
              <button onclick="window.print()" class="px-3.5 py-1.5 bg-[#11512f] text-white text-[10px] font-bold rounded-lg cursor-pointer">
                <i class="fa-solid fa-print"></i> Cetak Checklist
              </button>
            </div>
            <div id="trip-checklist-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div>
          </div>
        </section>

        <!-- LAPORAN A4 PRINTING TAB -->
        <section id="pane-laporan" class="pane-content hidden space-y-6">
          <div class="bg-white p-4 border border-slate-100 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div class="flex flex-wrap gap-1">
              <button onclick="setLaporanType('inventaris')" class="lap-tab active px-3 py-1.5 rounded-lg text-[10px] font-black transition cursor-pointer bg-[#11512f] text-white">Inventaris Aset</button>
              <button onclick="setLaporanType('hilang')" class="lap-tab px-3 py-1.5 rounded-lg text-[10px] font-black transition cursor-pointer bg-slate-50 text-slate-600">Hilang / Pengurangan</button>
              <button onclick="setLaporanType('reparasi')" class="lap-tab px-3 py-1.5 rounded-lg text-[10px] font-black transition cursor-pointer bg-slate-50 text-slate-600">Proses Reparasi</button>
              <button onclick="setLaporanType('trip')" class="lap-tab px-3 py-1.5 rounded-lg text-[10px] font-black transition cursor-pointer bg-slate-50 text-slate-600">Pemakaian Lapangan</button>
              <button onclick="setLaporanType('depresiasi')" class="lap-tab px-3 py-1.5 rounded-lg text-[10px] font-black transition cursor-pointer bg-slate-50 text-slate-600">Depresiasi 2%</button>
            </div>
            <div class="flex items-center space-x-2">
              <button onclick="exportLaporanCSV()" class="px-3.5 py-1.5 border border-slate-200 text-xs font-bold rounded-lg hover:bg-slate-50 cursor-pointer">Export CSV</button>
              <button onclick="window.print()" class="px-3.5 py-1.5 bg-[#11512f] text-white text-xs font-bold rounded-lg cursor-pointer">Cetak PDF / A4</button>
            </div>
          </div>

          <!-- A4 Document Layout Container -->
          <div id="a4-print-document" class="bg-white border rounded-2xl p-8 max-w-4xl mx-auto shadow-md text-slate-800">
            <div class="flex items-start justify-between border-b-2 border-slate-800 pb-4 mb-6">
              <div class="flex items-center space-x-4">
                <div class="w-14 h-14 bg-white border rounded-full flex items-center justify-center overflow-hidden p-0">
                  <img id="report-comp-logo" src="https://lh3.googleusercontent.com/d/1C-scCTu7H2eOa-ZtDhak1JcbRhTNCCIb" class="w-full h-full object-cover" onerror="this.src='https://docs.google.com/uc?export=view&id=1C-scCTu7H2eOa-ZtDhak1JcbRhTNCCIb'">
                </div>
                <div>
                  <h2 id="report-comp-name" class="text-lg font-black text-slate-900">PT. BARENGIN TRIP</h2>
                  <p id="report-comp-addr" class="text-[9px] text-slate-500 leading-tight">Alamat Gudang Operasional Basecamp &bull; ID: 2026</p>
                </div>
              </div>
              <div class="text-right text-xs leading-tight">
                <h3 class="font-extrabold text-slate-900 uppercase">LAPORAN MANAJEMEN LOGISTIK</h3>
                <span id="report-label" class="inline-block px-2 py-0.5 bg-brand-100 text-[8px] font-bold text-brand-900 rounded mt-1 uppercase">Inventaris</span>
                <p class="text-[9px] text-slate-400 mt-2 font-bold">Dicetak: 22 Mei 2026</p>
              </div>
            </div>

            <!-- Report Body -->
            <div id="report-table-pane" class="min-h-[350px]"></div>

            <!-- Signature space -->
            <div class="mt-12 grid grid-cols-2 gap-8 text-center text-[10px] pt-8 border-t border-slate-100">
              <div>
                <p class="text-slate-400 uppercase font-bold">Dilaporkan Oleh:</p>
                <p id="report-pic-name" class="font-bold text-slate-800 mt-12">Rizki S. (Kepala Logistik)</p>
                <div class="border-b border-slate-300 w-36 mx-auto mt-0.5"></div>
                <p class="text-[9px] text-slate-400 mt-0.5 font-semibold">PIC Gudang Logistik</p>
              </div>
              <div>
                <p class="text-slate-400 uppercase font-bold">Disetujui Oleh:</p>
                <p class="font-bold text-slate-800 mt-12">Dafi Al-Wahid / Direktur</p>
                <div class="border-b border-slate-300 w-36 mx-auto mt-0.5"></div>
                <p class="text-[9px] text-slate-400 mt-0.5 font-semibold">Direktur Utama</p>
              </div>
            </div>
          </div>
        </section>

        <!-- CONFIGURATION TAB -->
        <section id="pane-konfigurasi" class="pane-content hidden bg-white rounded-2xl border p-5 space-y-4">
          <h2 class="text-base font-extrabold text-slate-800">Ubah Konfigurasi Data Perusahaan</h2>
          <form id="config-form" onsubmit="handleConfigSave(event)" class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label class="block font-bold text-slate-550 mb-1">Nama Perusahaan / Komunitas</label>
              <input id="cfg-comp-name" type="text" class="w-full px-3 py-2 bg-slate-50 border rounded-xl" required>
            </div>
            <div>
              <label class="block font-bold text-slate-550 mb-1">Kepala Operasional (PIC Gudang)</label>
              <input id="cfg-pic" type="text" class="w-full px-3 py-2 bg-slate-50 border rounded-xl" required>
            </div>
            <div class="md:col-span-2">
              <label class="block font-bold text-slate-550 mb-1">Alamat Gudang / Kantor</label>
              <input id="cfg-address" type="text" class="w-full px-3 py-2 bg-slate-50 border rounded-xl" required>
            </div>
            <div>
              <label class="block font-bold text-slate-550 mb-1">No Kontak Operasional</label>
              <input id="cfg-contact" type="text" class="w-full px-3 py-2 bg-slate-50 border rounded-xl" required>
            </div>
            <div>
              <label class="block font-bold text-slate-550 mb-1">Logo URL Komunitas</label>
              <input id="cfg-logo" type="text" class="w-full px-3 py-2 bg-slate-50 border rounded-xl">
            </div>
            <button type="submit" class="md:col-span-2 w-full py-2.5 bg-[#11512f] hover:bg-emerald-850 text-white font-bold rounded-xl cursor-pointer">
              Simpan Konfigurasi <i class="fa-solid fa-save ml-1"></i>
            </button>
          </form>
        </section>

      </div>
    </main>
  </div>

  <!-- INVENTORY FORM MODAL -->
  <div id="inv-modal" class="fixed inset-0 bg-black/50 z-50 hidden flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between border-b pb-3">
        <h3 id="inv-modal-title" class="text-sm font-extrabold text-[#11512f]">Isi Formulir Barang</h3>
        <button onclick="closeInventoryModal()" class="text-slate-400 hover:text-slate-600"><i class="fa-solid fa-x"></i></button>
      </div>
      <form id="inv-form" onsubmit="handleInventorySubmit(event)" class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <input id="form-inv-id" type="hidden">
        <div>
          <label class="block font-bold text-slate-500 mb-1">Kode Barang *</label>
          <input id="form-inv-kode" type="text" required placeholder="Cth: BT-KMH-001" class="w-full px-3 py-2 bg-slate-50 border rounded-xl">
        </div>
        <div>
          <label class="block font-bold text-slate-500 mb-1">Nama Barang *</label>
          <input id="form-inv-name" type="text" required placeholder="Tenda Consina..." class="w-full px-3 py-2 bg-slate-50 border rounded-xl">
        </div>
        <div>
          <label class="block font-bold text-slate-500 mb-1">Merk *</label>
          <input id="form-inv-merk" type="text" required placeholder="Cth: Consina / Eiger" class="w-full px-3 py-2 bg-slate-50 border rounded-xl">
        </div>
        <div>
          <label class="block font-bold text-slate-500 mb-1">Kategori Barang *</label>
          <select id="form-inv-cat" class="w-full px-3 py-2 bg-slate-50 border rounded-xl">
            <option value="Kemah">Kemah</option>
            <option value="Elektronik">Elektronik</option>
            <option value="Trekking">Trekking</option>
            <option value="Alat Masak dan Minum">Alat Masak dan Minum</option>
            <option value="Bahan Baku Konsumsi">Bahan Baku Konsumsi</option>
            <option value="P3K">P3K</option>
          </select>
        </div>
        <div>
          <label class="block font-bold text-slate-500 mb-1">Kuantitas Stok Awal (pcs) *</label>
          <input id="form-inv-qty" type="number" required min="1" class="w-full px-3 py-2 bg-slate-50 border rounded-xl">
        </div>
        <div>
          <label class="block font-bold text-slate-500 mb-1">Harga Pembelian (Rupiah) *</label>
          <input id="form-inv-price" type="number" required class="w-full px-3 py-2 bg-slate-50 border rounded-xl">
        </div>
        <div>
          <label class="block font-bold text-slate-500 mb-1">Tempat Penyimpanan Gudang *</label>
          <input id="form-inv-storage" type="text" required placeholder="Cth: Rak Tenda A, Lemari Kaca..." class="w-full px-3 py-2 bg-slate-50 border rounded-xl">
        </div>
        <div>
          <label class="block font-bold text-slate-500 mb-1">Tanggal Pembelian *</label>
          <input id="form-inv-date" type="date" required class="w-full px-3 py-2 bg-slate-50 border rounded-xl">
        </div>
        <div>
          <label class="block font-bold text-slate-500 mb-1">Status Barang</label>
          <select id="form-inv-status" class="w-full px-3 py-2 bg-slate-50 border rounded-xl">
            <option value="Ready">Ready</option>
            <option value="Pemakaian">Pemakaian</option>
            <option value="Perbaikan">Perbaikan</option>
            <option value="Perawatan">Perawatan</option>
          </select>
        </div>
        <div>
          <label class="block font-bold text-slate-500 mb-1">Kondisi Barang</label>
          <select id="form-inv-condition" class="w-full px-3 py-2 bg-slate-50 border rounded-xl">
            <option value="Baru">Baru</option>
            <option value="Baik">Baik</option>
            <option value="Rusak Ringan">Rusak Ringan</option>
            <option value="Tidak Dapat Dipakai">Tidak Dapat Dipakai</option>
          </select>
        </div>
        <div class="md:col-span-2">
          <label class="block font-bold text-slate-500 mb-1">Keterangan Tambahan / Detail Alat</label>
          <input id="form-inv-note" type="text" placeholder="Detail model, tipe, seri..." class="w-full px-3 py-2 bg-slate-50 border rounded-xl">
        </div>
        <!-- Foto Upload base64 -->
        <div class="md:col-span-2">
          <label class="block font-bold text-slate-500 mb-1">Pilih Foto Alat (Opsional ke Drive)</label>
          <input id="form-inv-file" type="file" accept="image/*" class="w-full text-[10px]" onchange="encodeFotoBase64(event)">
          <input id="form-inv-foto-base64" type="hidden">
        </div>
        <button type="submit" class="md:col-span-2 w-full py-3 bg-[#11512f] text-white font-bold rounded-xl cursor-pointer">Simpan Item Barang</button>
      </form>
    </div>
  </div>

  <!-- MUTASI LOG NEW FORM MODAL -->
  <div id="mut-modal" class="fixed inset-0 bg-black/50 z-50 hidden flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
      <div class="flex items-center justify-between border-b pb-3">
        <h3 class="text-sm font-extrabold text-[#11512f]">Catat Mutasi / Keluar Masuk</h3>
        <button onclick="closeMutasiiModal()" class="text-slate-400 hover:text-slate-600"><i class="fa-solid fa-x"></i></button>
      </div>
      <form id="mut-form" onsubmit="handleMutasiiSubmit(event)" class="space-y-3.5 text-xs">
        <div>
          <label class="block font-bold text-slate-500 mb-1">Pilih Alat / Barang</label>
          <select id="form-mut-idbar" class="w-full px-3 py-2 bg-slate-50 border rounded-xl" required></select>
        </div>
        <div>
          <label class="block font-bold text-slate-500 mb-1">Jenis Aktivitas</label>
          <select id="form-mut-type" class="w-full px-3 py-2 bg-slate-50 border rounded-xl" onchange="adjustMutasiiFields()">
            <option value="Pemakaian Trip">Pemakaian Trip</option>
            <option value="Penyewaan Barang">Penyewaan Barang</option>
            <option value="Reparasi">Dalam Perbaikan (Reparasi)</option>
            <option value="Perawatan">Perawatan (Maintenance)</option>
            <option value="Dijual">Dijual (Aset Disposed)</option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-500 mb-1">Jumlah Alat</label>
            <input id="form-mut-qty" type="number" value="1" min="1" required class="w-full px-3 py-2 bg-slate-50 border rounded-xl">
          </div>
          <div>
            <label class="block font-bold text-slate-500 mb-1">Kondisi Alat Keluar</label>
            <select id="form-mut-cond" class="w-full px-3 py-2 bg-slate-50 border rounded-xl">
              <option value="Baik">Baik</option>
              <option value="Baru">Baru</option>
              <option value="Rusak Ringan">Rusak Ringan</option>
            </select>
          </div>
        </div>
        <div id="mut-person-group" class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-500 mb-1">Nama Pemakai</label>
            <input id="form-mut-user" type="text" value="Kru Outbound" class="w-full px-3 py-2 bg-slate-50 border rounded-xl">
          </div>
          <div>
            <label class="block font-bold text-slate-500 mb-1">Divisi / Tim</label>
            <input id="form-mut-div" type="text" value="Lapangan" class="w-full px-3 py-2 bg-slate-50 border rounded-xl">
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-500 mb-1">PIC Gudang Logistik</label>
            <input id="form-mut-pic" type="text" value="Rizki S. (Logistik)" class="w-full px-3 py-2 bg-slate-50 border rounded-xl" required>
          </div>
          <div>
            <label class="block font-bold text-slate-500 mb-1">Status Kembali Awal</label>
            <select id="form-mut-return" class="w-full px-3 py-2 bg-slate-50 border rounded-xl">
              <option value="Belum Kembali">Belum Kembali</option>
              <option value="Sudah Kembali">Sudah Kembali</option>
              <option value="Tidak Kembali (Hilang)">Tidak Kembali (Hilang)</option>
            </select>
          </div>
        </div>
        <div>
          <label class="block font-bold text-slate-500 mb-1">Keterangan / Catatan Trip</label>
          <input id="form-mut-note" type="text" placeholder="Cth: Paket Merbabu, reparasi dinamo" class="w-full px-3 py-2 bg-slate-50 border rounded-xl">
        </div>
        <button type="submit" class="w-full py-3 bg-pink-705 text-white font-bold rounded-xl cursor-pointer">Catat Mutasi &amp; Sync Stok</button>
      </form>
    </div>
  </div>

  <!-- RETURN MODAL ACTION -->
  <div id="return-modal" class="fixed inset-0 bg-black/50 z-50 hidden flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
      <div class="flex items-center justify-between border-b pb-2">
        <h3 class="text-sm font-extrabold text-[#11512f]">Form Kelengkapan Pengembalian</h3>
        <button onclick="closeReturnModal()" class="text-slate-400"><i class="fa-solid fa-x"></i></button>
      </div>
      <form id="return-form" onsubmit="handleReturnSubmit(event)" class="space-y-4 text-xs">
        <input id="form-ret-log-id" type="hidden">
        <div>
          <label class="block font-bold text-slate-650 mb-1">Kondisi Alat Saat Kembali</label>
          <select id="form-ret-condition" class="w-full px-3 py-2 bg-slate-50 border rounded-xl">
            <option value="Baik">Baik (Sesuai Standar)</option>
            <option value="Baru">Sangat Baik (Seperti Baru)</option>
            <option value="Rusak Ringan">Rusak Ringan</option>
            <option value="Tidak Dapat Dipakai">Rusak Berat (Hilang/Rusak Permanen)</option>
          </select>
        </div>
        <div class="text-[10px] text-slate-400 bg-emerald-50/50 p-2.5 rounded-lg border">
          Mengembalikan barang akan otomatis memulihkan sisa stok kuantitas aman di database.
        </div>
        <button type="submit" class="w-full py-2.5 bg-brand-500 text-white font-extrabold rounded-lg">Konfirmasi Kembali</button>
      </form>
    </div>
  </div>

  <script>
    // INITIAL SYSTEM STATES fallback to localstorage or synced with google sheet
    var inventory = [];
    var logs = [];
    var config = {
      companyName: "PT. Barengin Trip Operasional",
      address: "Jl. Pemuda No. 42 Bantul, D.I. Yogyakarta",
      contact: "+62 812-3456-7890",
      picName: "Rizki S. (Kepala Logistik)",
      logoUrl: ""
    };
    var activeLaporanType = "inventaris";

    // FALLBACK SEED MOCK DATA
    var fallbackInv = [
      { id: "BT-ID-001", kodeBarang: "BT-KMH-001", namaBarang: "Tenda Dome Consina Magnum 4", merk: "Consina", seri: "Magnum 4", kuantitas: 8, hargaPembelian: 850000, statusBarang: "Ready", kondisiBarang: "Baik", tempatPenyimpanan: "Rak Barat A", tanggalPembelian: "2025-10-15", kategoriBarang: "Kemah", keterangan: "Perlengkapan andalan untuk trip Merbabu." },
      { id: "BT-ID-002", kodeBarang: "BT-ELK-002", namaBarang: "HT Baofeng UV-5R Dual Band", merk: "Baofeng", seri: "UV-5R", kuantitas: 12, hargaPembelian: 320000, statusBarang: "Pemakaian", kondisiBarang: "Baik", tempatPenyimpanan: "Lemari Tengah", tanggalPembelian: "2025-05-20", kategoriBarang: "Elektronik", keterangan: "Komunikasi logistik kru." },
      { id: "BT-ID-003", kodeBarang: "BT-TRK-003", namaBarang: "Carrier Eiger Equator 65L", merk: "Eiger", seri: "Equator 65", kuantitas: 4, hargaPembelian: 1600000, statusBarang: "Perbaikan", kondisiBarang: "Rusak Ringan", tempatPenyimpanan: "Rak Gantung", tanggalPembelian: "2026-01-10", kategoriBarang: "Trekking", keterangan: "Resleting utama sobek." }
    ];
    var fallbackLogs = [
      { id: "LOG-001", tanggal: "2026-05-22 09:30", jenisAktivitas: "Pemakaian Trip", idBarang: "BT-ID-002", namaBarang: "HT Baofeng UV-5R Dual Band", jumlah: 4, pemakai: "Wayan S.", divisi: "Kru Outdoor", statusPengembalian: "Belum Kembali", pic: "Rizki S." }
    ];

    window.onload = function() {
      // LOADER INITIALIZATION
      loadDataFromSource();
    };

    function loadDataFromSource() {
      if (window.google && google.script && google.script.run) {
        // Apps Script Connection
        google.script.run.withSuccessHandler(function(res) {
          inventory = res || [];
          if (inventory.length === 0) inventory = fallbackInv;
          triggerRenderAll();
        }).getInventory();

        google.script.run.withSuccessHandler(function(res) {
          logs = res || [];
          if (logs.length === 0) logs = fallbackLogs;
          triggerRenderAll();
        }).getLogs();

        google.script.run.withSuccessHandler(function(res) {
          if (res) {
            config = res;
            updateConfigInputs();
          }
        }).getAppConfig();
      } else {
        // Local fallback
        var locInv = localStorage.getItem("bt_inv");
        var locLogs = localStorage.getItem("bt_logs");
        var locCfg = localStorage.getItem("bt_cfg");

        inventory = locInv ? JSON.parse(locInv) : fallbackInv;
        logs = locLogs ? JSON.parse(locLogs) : fallbackLogs;
        if (locCfg) config = JSON.parse(locCfg);

        triggerRenderAll();
        updateConfigInputs();
      }
    }

    function triggerRenderAll() {
      updateDashboardStats();
      renderInventaris();
      renderLogs();
      renderTripChecklist();
      renderLaporanDocument();
      populateDropdowns();
    }

    function updateDashboardStats() {
      document.getElementById("stat-total").innerText = inventory.length;
      var totalQty = 0;
      for (var a = 0; a < inventory.length; a++) {
        totalQty += (Number(inventory[a].kuantitas) || 0);
      }
      document.getElementById("stat-qty").innerText = totalQty + " Pcs";

      var tripQty = 0;
      for (var b = 0; b < logs.length; b++) {
        if (logs[b].statusPengembalian === "Belum Kembali" && logs[b].jenisAktivitas === "Pemakaian Trip") {
          tripQty += (Number(logs[b].jumlah) || 0);
        }
      }
      document.getElementById("stat-trip").innerText = tripQty + " Pcs";

      var repQty = 0;
      for (var c = 0; c < inventory.length; c++) {
        if (inventory[c].statusBarang === "Perbaikan") {
          repQty++;
        }
      }
      document.getElementById("stat-reparasi").innerText = repQty + " Jenis";

      var totalVal = 0;
      for (var d = 0; d < inventory.length; d++) {
        var months = calculateMonths(inventory[d].tanggalPembelian);
        var deprRate = 0.02 * months;
        var depr = inventory[d].hargaPembelian * deprRate;
        totalVal += Math.max(0, inventory[d].hargaPembelian - depr);
      }
      document.getElementById("stat-val").innerText = formatRupiah(totalVal);

      // Render Borrow / Usage Log list
      var tbody = document.getElementById("dashboard-borrow-body");
      tbody.innerHTML = "";
      var filterBorrows = [];
      for (var e = 0; e < logs.length; e++) {
        if (logs[e].statusPengembalian === "Belum Kembali") {
          filterBorrows.push(logs[e]);
        }
      }
      
      if (filterBorrows.length === 0) {
        tbody.innerHTML = "<tr><td colspan=\\"6\\" class=\\"py-6 text-center text-slate-405 text-xs\\">Seluruh log pengembalian ter-rekap aman!</td></tr>";
        return;
      }

      for (var f = 0; f < filterBorrows.length; f++) {
        var row = filterBorrows[f];
        tbody.innerHTML += 
          "<tr class=\\"hover:bg-slate-50/50\\">" +
            "<td class=\\"py-2.5 px-3\\">" +
              "<span class=\\"block font-bold text-red-650\\">" + row.id + "</span>" +
              "<span class=\\"text-[9px] text-slate-404 font-mono\\">" + row.tanggal + "</span>" +
            "</td>" +
            "<td class=\\"py-2.5 px-3 font-semibold text-slate-700\\">" + row.namaBarang + "</td>" +
            "<td class=\\"py-2.5 px-3 font-bold text-slate-800\\">" + row.jumlah + " pcs</td>" +
            "<td class=\\"py-2.5 px-3\\">" + row.pemakai + " (" + row.divisi + ")</td>" +
            "<td class=\\"py-2.5 px-3 italic\\">" + (row.keterangan || "-") + "</td>" +
            "<td class=\\"py-2.5 px-3 text-right\\">" +
              "<button onclick=\\"openReturnModal('" + row.id + "')\\" class=\\"px-3 py-1 bg-[#11512f] text-white hover:bg-emerald-850 text-[10px] font-bold rounded-lg cursor-pointer\\">" +
                "Sudah Kembali <i class=\\"fa-solid fa-check\\"></i>" +
              "</button>" +
            "</td>" +
          "</tr>";
      }
    }

    function renderInventaris() {
      var parent = document.getElementById("inventory-table-body");
      parent.innerHTML = "";
      var search = document.getElementById("inv-search").value.toLowerCase();
      var cat = document.getElementById("inv-cat-filter").value;

      var filtered = [];
      for (var x = 0; x < inventory.length; x++) {
        var i = inventory[x];
        var matchSearch = [i.namaBarang, i.kodeBarang, i.merk, i.id].some(function(f) {
          return String(f).toLowerCase().indexOf(search) !== -1;
        });
        var matchCat = cat === "Semua" || i.kategoriBarang === cat;
        if (matchSearch && matchCat) {
          filtered.push(i);
        }
      }

      if (filtered.length === 0) {
        parent.innerHTML = "<tr><td colspan=\\"6\\" class=\\"py-10 text-center text-slate-400\\">Tidak ada barang inventaris sesuai filter pencarian.</td></tr>";
        return;
      }

      for (var y = 0; y < filtered.length; y++) {
        var item = filtered[y];
        var thumb = item.fotoBarang || "https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=80&q=80";
        var statusCol = item.statusBarang === "Ready" ? "bg-emerald-100 text-emerald-800" : (item.statusBarang === "Perbaikan" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800");
        
        parent.innerHTML += 
          "<tr class=\\"hover:bg-slate-50/20\\">" +
            "<td class=\\"py-2.5 px-4\\">" +
              "<img src=\\"" + thumb + "\\" class=\\"w-10 h-10 rounded-lg object-cover border\\" onerror=\\"this.src='https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=80&q=80'\\">" +
            "</td>" +
            "<td class=\\"py-2.5 px-4\\">" +
              "<span class=\\"block font-bold text-slate-900\\">" + item.namaBarang + "</span>" +
              "<span class=\\"text-[9px] text-slate-403 font-mono\\">" + item.id + " | " + item.kodeBarang + "</span>" +
            "</td>" +
            "<td class=\\"py-2.5 px-4\\">" +
              "<span class=\\"font-semibold text-slate-705 block\\">" + item.merk + "</span>" +
              "<span class=\\"text-[9px] text-[#11512f] font-mono\\">" + item.kategoriBarang + "</span>" +
            "</td>" +
            "<td class=\\"py-2.5 px-4 text-center font-black text-slate-800\\">" + item.kuantitas + " pcs</td>" +
            "<td class=\\"py-2.5 px-4 text-xs font-semibold\\">" +
              "<span class=\\"px-2 py-0.5 rounded text-[9px] font-bold " + statusCol + "\\">" + item.statusBarang + "</span>" +
              "<span class=\\"block text-[10px] text-slate-400 mt-1\\">" + item.tempatPenyimpanan + "</span>" +
            "</td>" +
            "<td class=\\"py-2.5 px-4 text-right space-x-1.5\\">" +
              "<button onclick=\\"editInventoryItem('" + item.id + "')\\" class=\\"p-1 px-2.5 bg-slate-50 border text-slate-600 rounded-lg hover:text-[#11512f] hover:bg-emerald-50 cursor-pointer text-[10px] font-bold\\"><i class=\\"fa-solid fa-pencil\\"></i></button>" +
              "<button onclick=\\"deleteInventoryItem('" + item.id + "')\\" class=\\"p-1 px-2.5 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-100 cursor-pointer text-[10px] font-bold\\"><i class=\\"fa-solid fa-trash\\"></i></button>" +
            "</td>" +
          "</tr>";
      }
    }

    function renderLogs() {
      var parent = document.getElementById("logs-table-body");
      parent.innerHTML = "";
      var search = document.getElementById("mut-search").value.toLowerCase();
      var type = document.getElementById("mut-type-filter").value;

      var filtered = [];
      for (var z = 0; z < logs.length; z++) {
        var log = logs[z];
        var matchSearch = [log.pemakai, log.pic, log.namaBarang, log.id].some(function(f) {
          return String(f).toLowerCase().indexOf(search) !== -1;
        });
        var matchType = type === "Semua" || 
                        (type === "Keluar" && log.statusPengembalian === "Belum Kembali") || 
                        (type === "Kembali" && log.statusPengembalian === "Sudah Kembali") || 
                        log.jenisAktivitas === type;
        if (matchSearch && matchType) {
          filtered.push(log);
        }
      }

      if (filtered.length === 0) {
        parent.innerHTML = "<tr><td colspan=\\"7\\" class=\\"py-10 text-center text-slate-400\\">Tidak ada log mutasi keluar masuk.</td></tr>";
        return;
      }

      for (var w = 0; w < filtered.length; w++) {
        var l = filtered[w];
        var retBadge = l.statusPengembalian === "Sudah Kembali" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800";
        var actionCol = l.statusPengembalian === "Belum Kembali" ? 
          "<button onclick=\\"openReturnModal('" + l.id + "')\\" class=\\"px-2 py-1 bg-[#11512f] hover:bg-[#0c3821] text-white rounded text-[9px] font-bold cursor-pointer\\">Kembalikan</button>" : 
          "<span class=\\"text-slate-400 font-mono text-[9px]\\">- Selesai</span>";

        parent.innerHTML += 
          "<tr class=\\"hover:bg-slate-50/20\\">" +
            "<td class=\\"py-2.5 px-4\\">" +
              "<span class=\\"font-bold text-[#11512f]\\">" + l.id + "</span>" +
              "<span class=\\"block text-[9px] text-slate-401 font-mono\\">" + l.tanggal + "</span>" +
            "</td>" +
            "<td class=\\"py-2.5 px-4 font-bold text-slate-600 text-[10px] uppercase\\">" + l.jenisAktivitas + "</td>" +
            "<td class=\\"py-2.5 px-4\\">" +
              "<span class=\\"font-bold block\\">" + l.namaBarang + "</span>" +
              "<span class=\\"text-[9px] text-slate-400 font-mono\\">Barang ID: " + l.idBarang + "</span>" +
            "</td>" +
            "<td class=\\"py-2.5 px-4 text-center font-black\\">" + l.jumlah + " pcs</td>" +
            "<td class=\\"py-2.5 px-4\\">" +
              "<span class=\\"font-semibold block\\">" + l.pemakai + " (" + l.divisi + ")</span>" +
              "<span class=\\"text-[9.5px] text-slate-450 italic\\">PIC: " + l.pic + "</span>" +
            "</td>" +
            "<td class=\\"py-2.5 px-4 text-xs font-semibold\\">" +
              "<span class=\\"px-2 py-0.5 rounded text-[9px] font-bold " + retBadge + "\\">" + l.statusPengembalian + "</span>" +
            "</td>" +
            "<td class=\\"py-2.5 px-4 text-right\\">" + actionCol + "</td>" +
          "</tr>";
      }
    }

    function renderTripChecklist() {
      var container = document.getElementById("trip-checklist-container");
      container.innerHTML = "";
      
      var categories = [];
      for (var m = 0; m < inventory.length; m++) {
        var category = inventory[m].kategoriBarang;
        if (categories.indexOf(category) === -1) {
          categories.push(category);
        }
      }

      for (var n = 0; n < categories.length; n++) {
        var catName = categories[n];
        var itemsHTML = "";

        for (var o = 0; o < inventory.length; o++) {
          var item = inventory[o];
          if (item.kategoriBarang === catName && item.kuantitas > 0) {
            itemsHTML += 
              "<label class=\\"flex items-start space-x-2.5 py-1.5 border-b border-slate-50 text-[10.5px] font-semibold cursor-pointer\\">" +
                "<input type=\\"checkbox\\" class=\\"rounded border-slate-300 text-emerald-600 mt-0.5 focus:ring-emerald-500 w-3.5 h-3.5\\">" +
                "<span>" + item.namaBarang + " <span class=\\"text-slate-401 font-bold font-mono\\">(" + item.kuantitas + " Pcs)</span></span>" +
              "</label>";
          }
        }

        if (itemsHTML) {
          container.innerHTML += 
            "<div class=\\"p-4 bg-slate-50 rounded-xl space-y-2 border\\">" +
              "<h4 class=\\"text-[10px] font-black uppercase text-[#11512f] border-b pb-1 flex items-center justify-between\\">" +
                "<span>Category: " + catName + "</span>" +
                "<i class=\\"fa-solid fa-backpack text-slate-400\\"></i>" +
              "</h4>" +
              "<div class=\\"space-y-1\\">" + itemsHTML + "</div>" +
            "</div>";
        }
      }
    }

    function renderLaporanDocument() {
      var parent = document.getElementById("report-table-pane");
      parent.innerHTML = "";

      document.getElementById("report-label").innerText = activeLaporanType;
      document.getElementById("report-comp-name").innerText = config.companyName.toUpperCase();
      document.getElementById("report-comp-addr").innerText = config.address + " | Kontak: " + config.contact;
      document.getElementById("report-pic-name").innerText = config.picName;

      var tableHTML = "";
      if (activeLaporanType === "inventaris") {
        tableHTML = 
          "<table class=\\"w-full text-left text-[10px] border-collapse\\">" +
            "<thead>" +
              "<tr class=\\"border-b bg-slate-100 text-slate-600 font-bold uppercase py-1\\">" +
                "<th class=\\"py-2 px-2\\">ID</th>" +
                "<th class=\\"py-2 px-2\\">Kode</th>" +
                "<th class=\\"py-2 px-2\\">Nama Barang</th>" +
                "<th class=\\"py-2 px-2\\">Kategori</th>" +
                "<th class=\\"py-2 px-2 text-center\\">Stok</th>" +
                "<th class=\\"py-2 px-2\\">Harga Beli</th>" +
                "<th class=\\"py-2 px-2\\">Kondisi</th>" +
              "</tr>" +
            "</thead>" +
            "<tbody>";
            
        for (var i = 0; i < inventory.length; i++) {
          var item = inventory[i];
          tableHTML += 
            "<tr class=\\"border-b\\">" +
              "<td class=\\"py-1 px-2 font-bold text-slate-700\\">" + item.id + "</td>" +
              "<td class=\\"py-1 px-2 font-mono\\">" + item.kodeBarang + "</td>" +
              "<td class=\\"py-1 px-2 font-bold\\">" + item.namaBarang + " (" + item.merk + ")</td>" +
              "<td class=\\"py-1 px-2\\">" + item.kategoriBarang + "</td>" +
              "<td class=\\"py-1 px-2 text-center font-bold\\">" + item.kuantitas + " pcs</td>" +
              "<td class=\\"py-1 px-2\\">" + formatRupiah(item.hargaPembelian) + "</td>" +
              "<td class=\\"py-1 px-2\\">" + item.kondisiBarang + "</td>" +
            "</tr>";
        }
        tableHTML += "</tbody></table>";
        
      } else if (activeLaporanType === "hilang") {
        var filterHilang = [];
        for (var h = 0; h < logs.length; h++) {
          if (logs[h].statusPengembalian.indexOf("Hilang") !== -1) {
            filterHilang.push(logs[h]);
          }
        }

        if (filterHilang.length === 0) {
          tableHTML = "<p class=\\"py-10 text-center text-slate-400\\">Tidak ada pengembalian alat hilang/rusak total.</p>";
        } else {
          tableHTML = 
            "<table class=\\"w-full text-left text-[10px] border-collapse\\">" +
              "<thead>" +
                "<tr class=\\"border-b bg-slate-100 text-slate-600\\">" +
                  "<th class=\\"py-2 px-2\\">ID Log</th>" +
                  "<th class=\\"py-2 px-2\\">Tanggal</th>" +
                  "<th class=\\"py-2 px-2\\">Barang</th>" +
                  "<th class=\\"py-2 px-2 text-center\\">Qty</th>" +
                  "<th class=\\"py-2 px-2\\">Kru / Divisi</th>" +
                  "<th class=\\"py-2 px-2\\">Keterangan</th>" +
                "</tr>" +
              "</thead>" +
              "<tbody>";
              
          for (var hl = 0; hl < filterHilang.length; hl++) {
            var logItem = filterHilang[hl];
            tableHTML += 
              "<tr class=\\"border-b\\">" +
                "<td class=\\"py-1.5 px-2 font-bold text-red-603\\">" + logItem.id + "</td>" +
                "<td class=\\"py-1.5 px-2\\">" + logItem.tanggal + "</td>" +
                "<td class=\\"py-1.5 px-2\\"><b>" + logItem.namaBarang + "</b></td>" +
                "<td class=\\"py-1.5 px-2 text-center font-bold\\">" + logItem.jumlah + "</td>" +
                "<td class=\\"py-1.5 px-2\\">" + logItem.pemakai + " (" + logItem.divisi + ")</td>" +
                "<td class=\\"py-1.5 px-2\\">" + (logItem.keterangan || "-") + "</td>" +
              "</tr>";
          }
          tableHTML += "</tbody></table>";
        }
        
      } else if (activeLaporanType === "reparasi") {
        var filterRep = [];
        for (var r = 0; r < inventory.length; r++) {
          if (inventory[r].statusBarang === "Perbaikan") {
            filterRep.push(inventory[r]);
          }
        }

        if (filterRep.length === 0) {
          tableHTML = "<p class=\\"py-10 text-center text-slate-400\\">Tidak ada barang yang sedang direparasi.</p>";
        } else {
          tableHTML = 
            "<table class=\\"w-full text-left text-[10px] border-collapse\\">" +
              "<thead>" +
                "<tr class=\\"border-b bg-slate-100 text-slate-600\\">" +
                  "<th class=\\"py-2 px-2\\">ID</th>" +
                  "<th class=\\"py-2 px-2\\">Nama Barang</th>" +
                  "<th class=\\"py-2 px-2\\">Kondisi Fisik</th>" +
                  "<th class=\\"py-2 px-2\\">Lokasi Servis</th>" +
                  "<th class=\\"py-2 px-2\\">Merek</th>" +
                "</tr>" +
              "</thead>" +
              "<tbody>";
              
          for (var rp = 0; rp < filterRep.length; rp++) {
            var itemRep = filterRep[rp];
            tableHTML += 
              "<tr class=\\"border-b\\">" +
                "<td class=\\"py-1.5 px-2 font-bold\\">" + itemRep.id + "</td>" +
                "<td class=\\"py-1.5 px-2 font-bold\\">" + itemRep.namaBarang + "</td>" +
                "<td class=\\"py-1.5 px-2 text-rose-600 font-bold\\">" + itemRep.kondisiBarang + "</td>" +
                "<td class=\\"py-1.5 px-2\\">" + itemRep.tempatPenyimpanan + "</td>" +
                "<td class=\\"py-1.5 px-2\\">" + itemRep.merk + "</td>" +
              "</tr>";
          }
          tableHTML += "</tbody></table>";
        }
        
      } else if (activeLaporanType === "trip") {
        var filterTrip = [];
        for (var tCount = 0; tCount < logs.length; tCount++) {
          if (logs[tCount].jenisAktivitas === "Pemakaian Trip") {
            filterTrip.push(logs[tCount]);
          }
        }

        if (filterTrip.length === 0) {
          tableHTML = "<p class=\\"py-10 text-center text-slate-400\\">Tidak ada log aktivitas pemakaian lapangan.</p>";
        } else {
          tableHTML = 
            "<table class=\\"w-full text-left text-[10px] border-collapse\\">" +
              "<thead>" +
                "<tr class=\\"border-b bg-slate-100 text-slate-600\\">" +
                  "<th class=\\"py-2 px-2\\">Log ID</th>" +
                  "<th class=\\"py-2 px-2\\">Tanggal</th>" +
                  "<th class=\\"py-2 px-2\\">Barang</th>" +
                  "<th class=\\"py-2 px-2 text-center\\">Jumlah</th>" +
                  "<th class=\\"py-2 px-2\\">Kru Lapangan</th>" +
                  "<th class=\\"py-2 px-2\\">Status</th>" +
                "</tr>" +
              "</thead>" +
              "<tbody>";
              
          for (var ftp = 0; ftp < filterTrip.length; ftp++) {
            var logTrip = filterTrip[ftp];
            tableHTML += 
              "<tr class=\\"border-b\\">" +
                "<td class=\\"py-1.5 px-2 font-bold\\">" + logTrip.id + "</td>" +
                "<td class=\\"py-1.5 px-2\\">" + logTrip.tanggal + "</td>" +
                "<td class=\\"py-1.5 px-2 font-semibold\\">" + logTrip.namaBarang + "</td>" +
                "<td class=\\"py-1.5 px-2 text-center font-bold\\">" + logTrip.jumlah + "</td>" +
                "<td class=\\"py-1.5 px-2\\">" + logTrip.pemakai + " (" + logTrip.divisi + ")</td>" +
                "<td class=\\"py-1.5 px-2 font-bold\\">" + logTrip.statusPengembalian + "</td>" +
              "</tr>";
          }
          tableHTML += "</tbody></table>";
        }
        
      } else if (activeLaporanType === "depresiasi") {
        tableHTML = 
          "<table class=\\"w-full text-left text-[10px] border-collapse\\">" +
            "<thead>" +
              "<tr class=\\"border-b bg-slate-100 text-slate-600\\">" +
                "<th class=\\"py-2 px-2\\">ID</th>" +
                "<th class=\\"py-2 px-2\\">Nama Barang</th>" +
                "<th class=\\"py-2 px-2\\">Tgl Pembelian</th>" +
                "<th class=\\"py-2 px-2\\">Masa Pakai (Bulan)</th>" +
                "<th class=\\"py-2 px-2\\">Harga Beli</th>" +
                "<th class=\\"py-2 px-2\\">Akumulasi Penyusutan</th>" +
                "<th class=\\"py-2 px-2\\">Nilai Saat Ini</th>" +
              "</tr>" +
            "</thead>" +
            "<tbody>";
            
        for (var dCount = 0; dCount < inventory.length; dCount++) {
          var itemDepr = inventory[dCount];
          var m = calculateMonths(itemDepr.tanggalPembelian);
          var rate = 0.02 * m;
          var depr = itemDepr.hargaPembelian * rate;
          var curVal = Math.max(0, itemDepr.hargaPembelian - depr);
          
          tableHTML += 
            "<tr class=\\"border-b\\">" +
              "<td class=\\"py-1 px-2 font-bold text-slate-600\\">" + itemDepr.id + "</td>" +
              "<td class=\\"py-1 px-2 font-bold\\">" + itemDepr.namaBarang + "</td>" +
              "<td class=\\"py-1 px-2\\">" + itemDepr.tanggalPembelian + "</td>" +
              "<td class=\\"py-1 px-2 text-center\\">" + m + " bln</td>" +
              "<td class=\\"py-1 px-2 font-semibold\\">" + formatRupiah(itemDepr.hargaPembelian) + "</td>" +
              "<td class=\\"py-1 px-2 text-rose-600\\">-" + formatRupiah(depr) + "</td>" +
              "<td class=\\"py-1 px-2 text-emerald-800 font-extrabold\\">" + formatRupiah(curVal) + "</td>" +
            "</tr>";
        }
        tableHTML += "</tbody></table>";
      }

      parent.innerHTML = tableHTML;
    }

    function setLaporanType(type) {
      activeLaporanType = type;
      var buttons = document.querySelectorAll(".lap-tab");
      for (var k = 0; k < buttons.length; k++) {
        buttons[k].className = "lap-tab px-3 py-1.5 rounded-lg text-[10px] font-black transition cursor-pointer bg-slate-50 text-slate-600";
      }
      
      var labelSearch = type === "inventaris" ? "inventaris" : (type === "reparasi" ? "proses" : (type === "trip" ? "lapangan" : (type === "depresiasi" ? "depresiasi" : "hilang")));
      
      for (var l = 0; l < buttons.length; l++) {
        if (buttons[l].innerText.toLowerCase().indexOf(labelSearch) !== -1) {
          buttons[l].className = "lap-tab px-3 py-1.5 rounded-lg text-[10px] font-black transition cursor-pointer bg-[#11512f] text-white";
        }
      }
      renderLaporanDocument();
    }

    function populateDropdowns() {
      var parent = document.getElementById("form-mut-idbar");
      parent.innerHTML = "";
      for (var i = 0; i < inventory.length; i++) {
        var item = inventory[i];
        parent.innerHTML += "<option value=\\"" + item.id + "\\">" + item.namaBarang + " (Stok: " + item.kuantitas + " Pcs)</option>";
      }
    }

    function updateConfigInputs() {
      document.getElementById("cfg-comp-name").value = config.companyName;
      document.getElementById("cfg-pic").value = config.picName;
      document.getElementById("cfg-address").value = config.address;
      document.getElementById("cfg-contact").value = config.contact;
      document.getElementById("cfg-logo").value = config.logoUrl;
      document.getElementById("sidemenu-comp-title").innerText = config.companyName.toUpperCase();
    }

    // AUTHENTICATION LOGIC
    function handleLoginSubmit(e) {
      e.preventDefault();
      var user = document.getElementById("username").value.trim().toLowerCase();
      var pass = document.getElementById("password").value;

      var matched = (user === "barengintrip" && pass === "barengterus") || (user === "rizki" && pass === "040101");
      if (matched) {
        document.getElementById("login-section").classList.add("hidden");
        document.getElementById("app-workspace").classList.remove("hidden");
        
        var initial = user[0].toUpperCase();
        document.getElementById("user-initial").innerText = initial;
        document.getElementById("user-title").innerText = user === "rizki" ? "Rizki (Kepala Logistik)" : "Barengin Admin Ops";
        showToast("Login berhasil! Memuat database logistik...", "success");
      } else {
        document.getElementById("login-error").classList.remove("hidden");
        setTimeout(function() {
          document.getElementById("login-error").classList.add("hidden");
        }, 4000);
      }
    }

    function handleLogout() {
      document.getElementById("app-workspace").classList.add("hidden");
      document.getElementById("login-section").classList.remove("hidden");
      document.getElementById("username").value = "";
      document.getElementById("password").value = "";
      showToast("Anda telah keluar dari sistem logistik.", "info");
    }

    // MODAL TRIGGERS
    function openInventoryModal() {
      document.getElementById("form-inv-id").value = "";
      document.getElementById("inv-form").reset();
      document.getElementById("inv-modal-title").innerText = "Tambah Alat Inventaris Baru";
      document.getElementById("inv-modal").classList.remove("hidden");
    }
    function closeInventoryModal() {
      document.getElementById("inv-modal").classList.add("hidden");
    }
    
    function openMutasiiModal() {
      document.getElementById("mut-form").reset();
      populateDropdowns();
      document.getElementById("mut-modal").classList.remove("hidden");
    }
    function closeMutasiiModal() {
      document.getElementById("mut-modal").classList.add("hidden");
    }

    function openReturnModal(logId) {
      document.getElementById("form-ret-log-id").value = logId;
      document.getElementById("return-modal").classList.remove("hidden");
    }
    function closeReturnModal() {
      document.getElementById("return-modal").classList.add("hidden");
    }

    // BASE64 CONVERTER
    function encodeFotoBase64(e) {
      var file = e.target.files[0];
      if (!file) return;
      var r = new FileReader();
      r.onload = function(evt) {
        document.getElementById("form-inv-foto-base64").value = evt.target.result;
      };
      r.readAsDataURL(file);
    }

    // CORE INVENTORY OPERATIONS (CUD)
    function handleInventorySubmit(e) {
      e.preventDefault();
      
      var id = document.getElementById("form-inv-id").value;
      var name = document.getElementById("form-inv-name").value;
      var price = Number(document.getElementById("form-inv-price").value) || 0;
      var qty = Number(document.getElementById("form-inv-qty").value) || 0;

      var item = {
        id: id || null,
        kodeBarang: document.getElementById("form-inv-kode").value,
        namaBarang: name,
        merk: document.getElementById("form-inv-merk").value,
        kategoriBarang: document.getElementById("form-inv-cat").value,
        kuantitas: qty,
        hargaPembelian: price,
        tempatPenyimpanan: document.getElementById("form-inv-storage").value,
        tanggalPembelian: document.getElementById("form-inv-date").value,
        statusBarang: document.getElementById("form-inv-status").value,
        kondisiBarang: document.getElementById("form-inv-condition").value,
        keterangan: document.getElementById("form-inv-note").value,
        fotoBarang: document.getElementById("form-inv-foto-base64").value || ""
      };

      if (window.google && google.script && google.script.run) {
        // Apps Script upload
        var base64 = document.getElementById("form-inv-foto-base64").value;
        if (base64) {
          showToast("Mengunggah foto dan menyimpan barang...");
          google.script.run.withSuccessHandler(function(uploadResult) {
            item.fotoBarang = uploadResult.directUrl;
            saveItemToServer(item);
          }).uploadFileToDrive(base64, "foto_" + name.replace(/\\s+/g, "_") + ".png", "image/png");
        } else {
          saveItemToServer(item);
        }
      } else {
        // Local simulation
        if (item.id) {
          var idx = -1;
          for (var k = 0; k < inventory.length; k++) {
            if (inventory[k].id === item.id) {
              idx = k;
              break;
            }
          }
          if (idx !== -1) inventory[idx] = item;
        } else {
          item.id = "BT-ID-" + String(inventory.length + 1).padStart(3, "0");
          inventory.push(item);
        }
        localStorage.setItem("bt_inv", JSON.stringify(inventory));
        showToast("Barang '" + name + "' berhasil disimpan ke Local Storage!", "success");
        closeInventoryModal();
        triggerRenderAll();
      }
    }

    function saveItemToServer(item) {
      google.script.run.withSuccessHandler(function() {
        showToast("Aset '" + item.namaBarang + "' berhasil disimpan ke Google Sheets!", "success");
        closeInventoryModal();
        loadDataFromSource();
      }).saveInventoryItem(item);
    }

    function editInventoryItem(id) {
      var item = null;
      for (var i = 0; i < inventory.length; i++) {
        if (inventory[i].id === id) {
          item = inventory[i];
          break;
        }
      }
      if (!item) return;

      document.getElementById("form-inv-id").value = item.id;
      document.getElementById("form-inv-kode").value = item.kodeBarang;
      document.getElementById("form-inv-name").value = item.namaBarang;
      document.getElementById("form-inv-merk").value = item.merk;
      document.getElementById("form-inv-cat").value = item.kategoriBarang;
      document.getElementById("form-inv-qty").value = item.kuantitas;
      document.getElementById("form-inv-price").value = item.hargaPembelian;
      document.getElementById("form-inv-storage").value = item.tempatPenyimpanan;
      document.getElementById("form-inv-date").value = item.tanggalPembelian;
      document.getElementById("form-inv-status").value = item.statusBarang;
      document.getElementById("form-inv-condition").value = item.kondisiBarang;
      document.getElementById("form-inv-note").value = item.keterangan || "";
      document.getElementById("form-inv-foto-base64").value = item.fotoBarang || "";

      document.getElementById("inv-modal-title").innerText = "Edit Barang: " + item.namaBarang;
      document.getElementById("inv-modal").classList.remove("hidden");
    }

    function deleteInventoryItem(id) {
      var confirmDelete = true;
      try {
        confirmDelete = confirm("Hapus barang dengan ID " + id + " dari database?");
      } catch (e) {
        confirmDelete = true;
      }
      if (!confirmDelete) return;

      if (window.google && google.script && google.script.run) {
        google.script.run.withSuccessHandler(function() {
          showToast("Aset berhasil dihapus dari Google Sheets.", "info");
          loadDataFromSource();
        }).deleteInventoryItem(id);
      } else {
        var temp = [];
        for (var i = 0; i < inventory.length; i++) {
          if (inventory[i].id !== id) {
            temp.push(inventory[i]);
          }
        }
        inventory = temp;
        localStorage.setItem("bt_inv", JSON.stringify(inventory));
        showToast("Aset terhapus secara lokal.", "info");
        triggerRenderAll();
      }
    }

    // MUTASII ACTIONS (KELUAR - MASUK)
    function handleMutasiiSubmit(e) {
      e.preventDefault();
      var idBar = document.getElementById("form-mut-idbar").value;
      
      var matched = null;
      for (var x = 0; x < inventory.length; x++) {
        if (inventory[x].id === idBar) {
          matched = inventory[x];
          break;
        }
      }
      if (!matched) return;

      var log = {
        jenisAktivitas: document.getElementById("form-mut-type").value,
        idBarang: idBar,
        namaBarang: matched.namaBarang,
        jumlah: Number(document.getElementById("form-mut-qty").value) || 1,
        pemakai: document.getElementById("form-mut-user").value,
        divisi: document.getElementById("form-mut-div").value,
        kondisiKeluar: document.getElementById("form-mut-cond").value,
        kondisiKembali: "-",
        statusPengembalian: document.getElementById("form-mut-return").value,
        pic: document.getElementById("form-mut-pic").value,
        keterangan: document.getElementById("form-mut-note").value
      };

      if (window.google && google.script && google.script.run) {
        google.script.run.withSuccessHandler(function() {
          showToast("Log mutasi berhasil ditambahkan!", "success");
          closeMutasiiModal();
          loadDataFromSource();
        }).saveLogItem(log);
      } else {
        // Local simulation
        log.id = "LOG-" + String(logs.length + 1).padStart(3, "0");
        var t = new Date();
        log.tanggal = t.getFullYear() + "-" + String(t.getMonth()+1).padStart(2,"0") + "-" + String(t.getDate()).padStart(2,"0") + " " + String(t.getHours()).padStart(2, "0") + ":" + String(t.getMinutes()).padStart(2,"0");

        logs.unshift(log);
        localStorage.setItem("bt_logs", JSON.stringify(logs));

        // Update local stock directly
        var targetItem = null;
        for (var key = 0; key < inventory.length; key++) {
          if (inventory[key].id === log.idBarang) {
            targetItem = inventory[key];
            break;
          }
        }
        
        if (targetItem) {
          if (log.statusPengembalian === "Belum Kembali") {
            targetItem.kuantitas = Math.max(0, targetItem.kuantitas - log.jumlah);
          }
          localStorage.setItem("bt_inv", JSON.stringify(inventory));
        }

        showToast("Log tersimpan lokal dan sisa stok dikalkulasikan.", "success");
        closeMutasiiModal();
        triggerRenderAll();
      }
    }

    function handleReturnSubmit(e) {
      e.preventDefault();
      var logId = document.getElementById("form-ret-log-id").value;
      var condition = document.getElementById("form-ret-condition").value;

      var logItem = null;
      for (var i = 0; i < logs.length; i++) {
        if (logs[i].id === logId) {
          logItem = logs[i];
          break;
        }
      }

      if (window.google && google.script && google.script.run) {
        // server implementation
        if (logItem) {
          logItem.statusPengembalian = "Sudah Kembali";
          logItem.kondisiKembali = condition;
          google.script.run.withSuccessHandler(function() {
            showToast("Barang berhasil dikembalikan!", "success");
            closeReturnModal();
            loadDataFromSource();
          }).saveLogItem(logItem);
        }
      } else {
        // local implementation
        if (logItem) {
          logItem.statusPengembalian = "Sudah Kembali";
          logItem.kondisiKembali = condition;
          
          var targetItem = null;
          for (var x = 0; x < inventory.length; x++) {
            if (inventory[x].id === logItem.idBarang) {
              targetItem = inventory[x];
              break;
            }
          }
          
          if (targetItem) {
            targetItem.kuantitas += logItem.jumlah;
            targetItem.kondisiBarang = condition;
          }
          localStorage.setItem("bt_logs", JSON.stringify(logs));
          localStorage.setItem("bt_inv", JSON.stringify(inventory));

          showToast("Retur sukses tersimpan secara lokal.", "success");
          closeReturnModal();
          triggerRenderAll();
        }
      }
    }

    function handleConfigSave(e) {
      e.preventDefault();
      config = {
        companyName: document.getElementById("cfg-comp-name").value,
        address: document.getElementById("cfg-address").value,
        contact: document.getElementById("cfg-contact").value,
        picName: document.getElementById("cfg-pic").value,
        logoUrl: document.getElementById("cfg-logo").value
      };

      if (window.google && google.script && google.script.run) {
        google.script.run.withSuccessHandler(function() {
          showToast("Konfigurasi disimpan di Google Spreadsheet!", "success");
          loadDataFromSource();
        }).saveAppConfig(config);
      } else {
        localStorage.setItem("bt_cfg", JSON.stringify(config));
        showToast("Konfigurasi tersimpan secara lokal.", "success");
        triggerRenderAll();
      }
    }

    // VIEW TAB CONTROL SWITCH
    function switchTab(tabId) {
      var panes = document.querySelectorAll(".pane-content");
      for (var f = 0; f < panes.length; f++) {
        panes[f].classList.add("hidden");
      }
      document.getElementById("pane-" + tabId).classList.remove("hidden");

      var buttons = document.querySelectorAll(".tab-btn");
      for (var g = 0; g < buttons.length; g++) {
        buttons[g].className = "tab-btn w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-xs font-bold transition hover:bg-brand-800 text-slate-300";
      }

      // Highlight active button
      for (var h = 0; h < buttons.length; h++) {
        var clickAttr = buttons[h].getAttribute("onclick") || "";
        if (clickAttr.indexOf(tabId) !== -1) {
          buttons[h].className = "tab-btn active w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-xs font-bold transition bg-brand-500 text-white";
        }
      }
    }

    // CSV export download generator
    function exportLaporanCSV() {
      var csv = "data:text/csv;charset=utf-8,";
      if (activeLaporanType === "inventaris") {
        csv += "ID,Kode,Nama,Merk,Kuantitas,Harga Beli,Kondisi\\r\\n";
        for (var i = 0; i < inventory.length; i++) {
          var item = inventory[i];
          csv += '\\"' + item.id + '\\",\\"' + item.kodeBarang + '\\",\\"' + item.namaBarang + '\\",\\"' + item.merk + '\\",' + item.kuantitas + "," + item.hargaPembelian + ",\\"" + item.kondisiBarang + '\\"\\r\\n';
        }
      } else {
        csv += "ID,Tanggal,Nama,Jumlah,Status\\r\\n";
        for (var j = 0; j < logs.length; j++) {
          var log = logs[j];
          csv += '\\"' + log.id + '\\",\\"' + log.tanggal + '\\",\\"' + log.namaBarang + '\\",' + log.jumlah + ",\\"" + log.statusPengembalian + '\\"\\r\\n';
        }
      }
      var uri = encodeURI(csv);
      var link = document.createElement("a");
      link.href = uri;
      link.download = "laporan_" + activeLaporanType + ".csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    // NOTIFICATION ENGINE HELPERS
    function showToast(msg, type) {
      if (!type) type = "success";
      var toast = document.getElementById("toast");
      var message = document.getElementById("toast-message");
      var icon = document.getElementById("toast-icon");

      message.innerText = msg;
      if (type === "success") {
        icon.className = "fa-solid fa-circle-check text-emerald-600 text-lg mt-0.5";
      } else {
        icon.className = "fa-solid fa-info-circle text-sky-500 text-lg mt-0.5";
      }
      
      toast.classList.remove("hidden");
      setTimeout(function() {
        toast.classList.add("hidden");
      }, 3500);
    }

    function calculateMonths(dateStr) {
      if (!dateStr) return 0;
      var pDate = new Date(dateStr);
      var today = new Date("2026-05-22");
      var m = (today.getFullYear() - pDate.getFullYear()) * 12 + (today.getMonth() - pDate.getMonth());
      return m < 0 ? 0 : m;
    }

    function formatRupiah(v) {
      return "Rp" + Number(v).toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }

    function adjustMutasiiFields() {
      // Automatic hide/show division if reparasi or maintenance
      var activity = document.getElementById("form-mut-type").value;
      if (activity === "Reparasi" || activity === "Perawatan") {
        document.getElementById("form-mut-user").value = "Teknisi Logistik";
        document.getElementById("form-mut-div").value = "Maintenance";
        document.getElementById("mut-person-group").className = "grid grid-cols-2 gap-3 opacity-50";
      } else {
        document.getElementById("form-mut-user").value = "Kru Outbound";
        document.getElementById("form-mut-div").value = "Lapangan";
        document.getElementById("mut-person-group").className = "grid grid-cols-2 gap-3";
      }
    }
  </script>
</body>
</html>`;
export default indexHtmlContent;
