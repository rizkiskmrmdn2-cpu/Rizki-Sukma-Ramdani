import { InventoryItem, ActivityLog, AppConfig } from './types';

// Hitung depresiasi (2% per bulan)
export function calculateDepreciation(hargaPembelian: number, tanggalPembelian: string): { nilaiDepresiasi: number; nilaiSaatIni: number; bulan: number } {
  if (!tanggalPembelian) {
    return { nilaiDepresiasi: 0, nilaiSaatIni: hargaPembelian, bulan: 0 };
  }

  const pDate = new Date(tanggalPembelian);
  const today = new Date('2026-05-22'); // Gunakan tanggal referensi sistem saat ini
  
  // Hitung selisih bulan
  let months = (today.getFullYear() - pDate.getFullYear()) * 12 + (today.getMonth() - pDate.getMonth());
  if (months < 0) months = 0;

  const totalDeprRate = 0.02 * months; // 2% per bulan
  const nilaiDepresiasi = hargaPembelian * totalDeprRate;
  const nilaiSaatIni = Math.max(0, hargaPembelian - nilaiDepresiasi);

  return {
    nilaiDepresiasi: parseFloat(nilaiDepresiasi.toFixed(2)),
    nilaiSaatIni: parseFloat(nilaiSaatIni.toFixed(2)),
    bulan: months
  };
}

// Format Rupiah
export function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

// Generate ID Barang Otomatis
export function generateItemId(index: number): string {
  return `BT-ID-${String(index).padStart(3, '0')}`;
}

// Penanganan awal untuk upload atau render foto
// Jika url dimulai dengan drive.google.com/file, kita proxy atau tunjukkan thumbnail jika bisa
// Namun secara visual kita sediakan fallback icon/placeholder outdoor yang menawan
export function getProductImage(item: InventoryItem): string {
  if (item.fotoBarang && item.fotoBarang.startsWith('http')) {
    return item.fotoBarang;
  }
  
  // Default image placeholders based on categories
  const categoryImages: { [key: string]: string } = {
    'Kemah': 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=300&q=80',
    'Elektronik': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80',
    'Trekking': 'https://images.unsplash.com/photo-1520111756473-de4666a7885b?auto=format&fit=crop&w=300&q=80',
    'Alat Masak dan Minum': 'https://images.unsplash.com/photo-1547825407-2d060104b7f8?auto=format&fit=crop&w=300&q=80',
    'Bahan Baku Konsumsi': 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=300&q=80',
    'Perlengkapan Habis Pakai': 'https://images.unsplash.com/photo-1584263343329-32699b940047?auto=format&fit=crop&w=300&q=80',
    'Dokumentasi': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=300&q=80',
    'P3K': 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=300&q=80',
    'Obat-obatan': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=300&q=80'
  };

  return categoryImages[item.kategoriBarang] || 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=300&q=80';
}

// Initial Mock Inventory
export const initialInventory: InventoryItem[] = [
  {
    id: "BT-ID-001",
    kodeBarang: "BT-KMH-001",
    namaBarang: "Tenda Dome Consina Magnum 4",
    merk: "Consina",
    seri: "Magnum 4",
    ukuran: "Kapasitas 4 Orang",
    berat: "3.2 kg",
    kuantitas: 8,
    hargaPembelian: 850000,
    statusBarang: "Ready",
    kondisiBarang: "Baik",
    penanganan: "Tidak",
    tempatPenyimpanan: "Rak Barat A",
    tanggalPembelian: "2025-10-15",
    fotoBarang: "",
    kategoriBarang: "Kemah",
    keterangan: "Perlengkapan andalan untuk trip Merbabu.",
    hargaSewaBarang: 35000
  },
  {
    id: "BT-ID-002",
    kodeBarang: "BT-ELK-002",
    namaBarang: "HT Baofeng UV-5R Dual Band",
    merk: "Baofeng",
    seri: "UV-5R",
    ukuran: "- ",
    berat: "250 g",
    kuantitas: 12,
    hargaPembelian: 320000,
    statusBarang: "Pemakaian",
    kondisiBarang: "Baik",
    penanganan: "Tidak",
    tempatPenyimpanan: "Lemari Tengah",
    tanggalPembelian: "2025-05-20",
    fotoBarang: "",
    kategoriBarang: "Elektronik",
    keterangan: "Komunikasi logistik kru.",
    hargaSewaBarang: 15000
  },
  {
    id: "BT-ID-003",
    kodeBarang: "BT-TRK-003",
    namaBarang: "Carrier Eiger Equator 65L",
    merk: "Eiger",
    seri: "Equator 65",
    ukuran: "65 Liter",
    berat: "1.8 kg",
    kuantitas: 4,
    hargaPembelian: 1600000,
    statusBarang: "Perbaikan",
    kondisiBarang: "Rusak Ringan",
    penanganan: "Perbaikan",
    tempatPenyimpanan: "Rak Gantung",
    tanggalPembelian: "2026-01-10",
    fotoBarang: "",
    kategoriBarang: "Trekking",
    keterangan: "Resleting utama sobek.",
    hargaSewaBarang: 25000
  }
];

// Initial Mock Logs
export const initialLogs: ActivityLog[] = [
  {
    id: "LOG-001",
    tanggal: "2026-05-22 09:30",
    jenisAktivitas: "Pemakaian Trip",
    idBarang: "BT-ID-002",
    namaBarang: "HT Baofeng UV-5R Dual Band",
    jumlah: 4,
    pemakai: "Wayan S.",
    divisi: "Kru Outdoor",
    keterangan: "Logistik komunikasi lapangan Merbabu.",
    kondisiKeluar: "Baik",
    kondisiKembali: "Baik",
    statusPengembalian: "Belum Kembali",
    pic: "Rizki S."
  }
];

// Default App Config
export const defaultAppConfig: AppConfig = {
  companyName: 'PT. Barengin Trip Operasional',
  address: 'Jl. Pemuda No. 42, Bantul, D.I. Yogyakarta',
  contact: '+62 812-3456-7890 (CS Barengin)',
  logoUrl: 'https://lh3.googleusercontent.com/d/1C-scCTu7H2eOa-ZtDhak1JcbRhTNCCIb',
  picName: 'Rizki S. (Kepala Logistik Operasional)',
  directorName: 'Dafi Al-Wahid (Direktur Utama)',
  spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/195wX5dJP4UlJQg_zdmpPYahml4l_HlZKH6fdw3mIwIo/edit?gid=1685526565#gid=1685526565',
  driveFolderUrl: 'https://drive.google.com/drive/folders/17J7Vf49RDsJRsPCUCEITFnrxEFQ_mXOr?hl=id'
};
