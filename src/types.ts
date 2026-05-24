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
  meals?: TripMeal[];
  ingredients?: TripIngredient[];
  budgetEntries?: TripBudgetEntry[];
  picBudgets?: Record<string, number>;
  customPagu?: number;
  perencanaan?: TripPlan;
  damageReport?: Array<{
    idBarang: string;
    namaBarang: string;
    jumlahRusak: number;
    kondisi: 'Aman' | 'Rusak Ringan' | 'Rusak Berat' | 'Hilang' | 'Basah' | 'Maintenance';
    catatan: string;
    foto?: string;
  }>;
}

export interface Participant {
  id: string;
  namaLengkap: string;
  gender: 'Pria' | 'Wanita';
  usia: number;
  whatsapp: string;
  daruratNo: string;
  meetingPoint: string;
  alamat: string;
  kondisiKhusus: string; // "asma", "vertigo", etc. for Risk Alerts
  tingkatFisik: 'Rendah' | 'Sedang' | 'Tinggi';
  pengalamanPendakian: string;
  gearCriticalChecklist: string;
  statusKehadiran: 'Hadir' | 'Belum Hadir' | 'Bermasalah';
  catatanKru: string;
  golonganDarah?: string;
  riwayatPenyakit?: string;
  alergi?: string;
  obatPribadi?: string;
  emergencyContactName?: string;
  relasiEmergencyContact?: string;
}

export interface TripCrewRoleAssignment {
  id: string;
  namaKru: string;
  role: 'Navigator' | 'Sweeper' | 'Dokumentasi' | 'Porter Barengin' | 'Porter Lokal';
  posisi?: string;
  tanggungJawab: string;
}

export interface TimelineRow {
  id: string;
  jam: string;
  aktivitas: string;
  lokasi: string;
  pic: string;
  catatan: string;
}

export interface SafetyRiskItem {
  id: string;
  potensiRisiko: string;
  mitigasi: string;
  levelRisiko: 'Low' | 'Medium' | 'High' | 'Critical';
  keputusanOperasional: string;
}

export interface EmergencyScenarioItem {
  id: string;
  kategori: 'Meeting Point' | 'Transportasi' | 'Basecamp' | 'Trekking' | 'Camp Area';
  skenario: string;
  alurTindakan: string;
  pic: string;
  kontakDarurat: string;
}

export interface EmergencyContactItem {
  id: string;
  kategori: 'Basecamp' | 'SAR' | 'Basarnas' | 'Rumah Sakit' | 'Puskesmas' | 'Polisi' | 'Driver' | 'Contact Person';
  nama: string;
  kontak: string;
  alamat?: string;
}

export interface TripPlan {
  meetingPoint?: string;
  armada?: string;
  driver?: string;
  estimasiCuaca?: string;
  statusGunung?: string;
  durasiTrip?: string;
  jumlahPeserta?: number;
  pesertaList?: Participant[];
  timStruktur?: TripCrewRoleAssignment[];
  timeline?: TimelineRow[];
  logistikChecklist?: Record<string, boolean>; // idBarang or custom name -> checked status
  sopBriefing?: string;
  sopTrekking?: string;
  sopCamp?: string;
  sopSafety?: string;
  sopLarangan?: string;
  safetyRisks?: SafetyRiskItem[];
  emergencyScenarios?: EmergencyScenarioItem[];
  evakuasiPath?: string;
  evakuasiShelter?: string;
  evakuasiRanger?: string;
  evakuasiHospital?: string;
  evakuasiTransport?: string;
  evakuasiMapUrl?: string; // or base64 map description
  kontakPentingList?: EmergencyContactItem[];
  planBAlternatif?: string;
  planBDelay?: string;
  planBFallback?: string;
  planBCuaca?: string;
  planBCancel?: string;
  gunungKetinggian?: string;
  gunungSuhu?: string;
  gunungJalur?: string;
  gunungSumberAir?: string;
  gunungLarangan?: string;
  gunungTipsLokal?: string;
  gunungPermit?: string;
  coverTitle?: string;
  coverSubtitle?: string;
}

export interface TripBudgetEntry {
  id: string;
  name: string;
  amount: number;
  category: string;
  pic: string;
  notes?: string;
}

export interface TripMeal {
  id: string;
  type: 'Sarapan' | 'Makan Siang' | 'Makan Malam' | 'Snack' | 'Kopi/Minuman';
  name: string;
  portions: number;
  notes: string;
}

export interface TripIngredient {
  id: string;
  name: string;
  category: 'Sayuran' | 'Protein' | 'Bumbu' | 'Minuman' | 'Snack' | 'Gas & Fuel' | 'Bahan Kering' | 'Frozen Food' | 'Lainnya';
  qty: number;
  unit: string;
  estimatedPrice: number;
  isAvailableInBasecamp: boolean;
  pic: string;
  deadline?: string;
  purchaseStatus: 'Belum Dibeli' | 'Sedang Dibeli' | 'Sudah Dibeli';
  notes?: string;
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
