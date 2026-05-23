export interface InventoryItem {
  id: string; // ID otomatis (cth: "BT-ID-001")
  kodeBarang: string;
  namaBarang: string;
  merk: string;
  seri: string;
  ukuran: string;
  berat: string;
  kuantitas: number;
  hargaPembelian: number;
  statusBarang: 'Ready' | 'Pemakaian' | 'Perbaikan' | 'Perawatan';
  kondisiBarang: 'Baru' | 'Baik' | 'Rusak Ringan' | 'Tidak Dapat Dipakai';
  penanganan: 'Tidak' | 'Perbaikan' | 'Perawatan';
  tempatPenyimpanan: string;
  tanggalPembelian: string; // YYYY-MM-DD
  fotoBarang: string; // Drive URL / Base64 / Placeholder
  kategoriBarang: 'Kemah' | 'Elektronik' | 'Trekking' | 'Alat Masak dan Minum' | 'Bahan Baku Konsumsi' | 'Perlengkapan Habis Pakai' | 'Dokumentasi' | 'P3K' | 'Obat-obatan';
  keterangan: string;
  hargaSewaBarang?: number;
}

export interface ActivityLog {
  id: string; // ID Log otomatis (cth: "LOG-001")
  tanggal: string; // YYYY-MM-DD HH:mm
  jenisAktivitas: 'Pemakaian Trip' | 'Penyewaan Barang' | 'Pemakaian Pribadi Internal' | 'Dijual' | 'Reparasi' | 'Perawatan';
  idBarang: string;
  namaBarang: string;
  jumlah: number;
  pemakai: string;
  divisi: string;
  keterangan: string;
  kondisiKeluar: 'Baru' | 'Baik' | 'Rusak Ringan' | 'Tidak Dapat Dipakai';
  kondisiKembali?: 'Baru' | 'Baik' | 'Rusak Ringan' | 'Tidak Dapat Dipakai';
  statusPengembalian: 'Belum Kembali' | 'Sudah Kembali' | 'Tidak Kembali (Hilang)';
  pic: string;
}

export interface CrewAssignment {
  id: string;
  idBarang: string;
  namaBarang: string;
  jumlah: number;
  kruName: string;
  kruRole: 'Pendamping Depan' | 'Pendamping Tengah' | 'Pendamping Belakang' | 'Porter Barengin' | 'Porter Lokal';
  isCheckedOut: boolean;
  isReturned: boolean;
}

export interface ExpeditionCrew {
  id: string;
  namaKru: string;
  role: 'Tour Leader' | 'Assistant Guide' | 'Porter Barengin' | 'Porter Lokal' | 'Dokumentasi' | 'Anggota';
  nomorHp: string;
  kapasitasBebanMax: number; // in kg
}

export interface PlannedLogisticsItem {
  idBarang: string;
  namaBarang: string;
  jumlahDigunakan: number;
  beratBarang: string; // e.g., '3.2 kg'
}

export interface CrewDistributionItem {
  id: string;
  kruId: string;
  idBarang: string;
  jumlah: number;
}

export interface ExpeditionTrip {
  id: string;
  jenisTrip: 'Open Trip' | 'Private Trip' | 'Outing' | 'Corporate Trip';
  nomorTrip: string;
  namaDestinasi: string;
  jalurPendakian: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  status: 'Draft' | 'Persiapan' | 'Siap Berangkat' | 'On Trip' | 'Returning' | 'Selesai';
  crew: ExpeditionCrew[];
  plannedItems: PlannedLogisticsItem[];
  distributions: CrewDistributionItem[];
  damageReport?: Array<{
    idBarang: string;
    namaBarang: string;
    jumlahRusak: number;
    kondisi: 'Aman' | 'Rusak Ringan' | 'Rusak Berat' | 'Hilang' | 'Basah' | 'Maintenance';
    catatan: string;
    foto?: string;
  }>;
}

export interface AppConfig {
  companyName: string;
  address: string;
  contact: string;
  logoUrl: string;
  picName: string;
  directorName: string;
  spreadsheetUrl: string;
  driveFolderUrl: string;
}

export interface ActiveSession {
  username: string;
  name: string;
  role: string;
}
