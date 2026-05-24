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
export const initialInventory: InventoryItem[] = [];

// Initial Mock Logs
export const initialLogs: ActivityLog[] = [];

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
