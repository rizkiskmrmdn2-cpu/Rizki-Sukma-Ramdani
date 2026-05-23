import React, { useState, useMemo, useId } from 'react';
import { 
  Compass, 
  Map, 
  CheckCircle, 
  UserCheck, 
  Sliders, 
  Plus, 
  Trash2, 
  ChevronRight, 
  Calendar, 
  AlertTriangle,
  Search,
  AlertCircle
} from 'lucide-react';
import { ExpeditionTrip, InventoryItem } from '../types';

interface Props {
  trips: ExpeditionTrip[];
  inventory: InventoryItem[];
  onSelectTrip: (id: string) => void;
  onDeleteTrip: (id: string, e: React.MouseEvent) => void;
  onCreateTrip: (tripData: any) => void;
  newTripData: any;
  setNewTripData: React.Dispatch<React.SetStateAction<any>>;
  generatedTripTitle: string;
  userRole: string;
}

export default function TripDashboard({
  trips,
  inventory,
  onSelectTrip,
  onDeleteTrip,
  onCreateTrip,
  newTripData,
  setNewTripData,
  generatedTripTitle,
  userRole
}: Props) {
  const baseId = useId();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Semua' | 'Aktif' | 'Selesai' | 'Draft'>('Semua');

  // Check permissions for creation
  const canCreate = userRole !== 'Crew';

  // Metrics across all trips
  const metrics = useMemo(() => {
    const totalCount = trips.length;
    const activeCount = trips.filter(t => ['Persiapan', 'Siap Berangkat', 'On Trip', 'Returning'].includes(t.status)).length;
    const completedCount = trips.filter(t => t.status === 'Selesai').length;
    const totalCrewAssignment = trips.reduce((sum, t) => sum + t.crew.length, 0);

    // Determine low stock dependencies in system (< 5 units for medical/consumable/habis pakai)
    const lowStockTrips = inventory.filter(it => 
      ['Bahan Baku Konsumsi', 'Perlengkapan Habis Pakai', 'Obat-obatan'].includes(it.kategoriBarang) && it.kuantitas <= 4
    ).slice(0, 3);

    // Collect all elements with damaged status report
    const damageOrLossReports: Array<{ tripName: string; item: string; qty: number; kondisi: string }> = [];
    trips.forEach(t => {
      if (t.damageReport && t.damageReport.length > 0) {
        t.damageReport.forEach(rep => {
          if (rep.kondisi !== 'Aman') {
            damageOrLossReports.push({
              tripName: `${t.jenisTrip} ${t.nomorTrip} - ${t.namaDestinasi}`,
              item: rep.namaBarang,
              qty: rep.jumlahRusak,
              kondisi: rep.kondisi
            });
          }
        });
      }
    });

    return {
      totalCount,
      activeCount,
      completedCount,
      totalCrewAssignment,
      lowStockTrips,
      damageOrLossReports
    };
  }, [trips, inventory]);

  // Handle local form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateTrip(newTripData);
  };

  // Filtered lists of trips based on search and status tabs
  const filteredTrips = useMemo(() => {
    return trips.filter(t => {
      const matchSearch = t.namaDestinasi.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.nomorTrip.includes(searchTerm) ||
                          t.jalurPendakian.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchSearch) return false;

      if (statusFilter === 'Aktif') {
        return ['Persiapan', 'Siap Berangkat', 'On Trip', 'Returning'].includes(t.status);
      }
      if (statusFilter === 'Selesai') {
        return t.status === 'Selesai';
      }
      if (statusFilter === 'Draft') {
        return t.status === 'Draft';
      }
      
      return true; // Semua
    });
  }, [trips, searchTerm, statusFilter]);

  // Utility to parse weight
  const parseWeightToKg = (weightStr: string): number => {
    try {
      const numeric = parseFloat(weightStr.toLowerCase().replace(/[^0-9.]/g, '')) || 0;
      if (weightStr.toLowerCase().includes('gr') || weightStr.toLowerCase().includes('gram')) {
        return parseFloat((numeric / 1000).toFixed(2));
      }
      return parseFloat(numeric.toFixed(1));
    } catch {
      return 1.0;
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Operasional Header */}
      <div className="relative bg-[#11512f] text-white rounded-2xl p-6 md:p-8 overflow-hidden shadow-xs border border-emerald-800">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center space-x-2 bg-emerald-800/60 text-emerald-100 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
            <Compass className="h-3 w-3 text-emerald-300 animate-spin-slow" />
            <span>Operational Expedition Logistics Management System</span>
          </div>
          <h1 className="text-2xl md:text-3.5xl font-black tracking-tight leading-none text-white">
            Trip Expedition Hub
          </h1>
          <p className="text-xs md:text-sm text-emerald-150 leading-relaxed font-semibold">
            Rencanakan beban operasional logistik pendakian, susun kepengurusan kru pimpinan, seimbangkan beban bagasi, dan pantau status pemulangan alat secara real-time.
          </p>
        </div>
        
        <img 
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80" 
          alt="Mountains" 
          className="absolute right-0 top-0 bottom-0 w-1/3 object-cover opacity-15 hidden md:block pointer-events-none rounded-r-2xl"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* WARNINGS & EMERGENCY LOGISTICS CHIPS */}
      {(metrics.lowStockTrips.length > 0 || metrics.damageOrLossReports.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Low Stock Warning */}
          {metrics.lowStockTrips.length > 0 && (
            <div className="bg-amber-50/75 border border-amber-200/60 rounded-xl p-4 flex items-start space-x-3 text-xs text-amber-800">
              <AlertTriangle className="h-5 w-5 text-amber-655 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-extrabold uppercase text-[9px] tracking-wider block font-mono">Peringatan Kebutuhan Bahan Penunjang</span>
                <p className="font-semibold leading-relaxed">Persediaan medis/bahan konsumtif habis pakai menipis di basecamp:</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {metrics.lowStockTrips.map(it => (
                    <span key={it.id} className="bg-amber-100 px-2 py-0.5 rounded-sm font-bold text-[10px]">
                      {it.namaBarang} (Sisa {it.kuantitas} pcs)
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Damage report warnings */}
          {metrics.damageOrLossReports.length > 0 && (
            <div className="bg-rose-50/75 border border-rose-200/60 rounded-xl p-4 flex items-start space-x-3 text-xs text-rose-800">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-extrabold uppercase text-[9px] tracking-wider block font-mono">Laporan Kerusakan &amp; Kehilangan Terakhir</span>
                <p className="font-semibold leading-relaxed">Terdapat kerusakan dari pengembalian logistik trip pendakian sebelumnya:</p>
                <div className="space-y-1 pt-1 font-mono text-[9px] font-bold">
                  {metrics.damageOrLossReports.slice(0, 2).map((rep, idx) => (
                    <div key={idx} className="bg-rose-100/60 p-1 rounded-sm">
                      ❌ {rep.item} ({rep.qty} pcs) status: <span className="text-rose-700 font-extrabold">{rep.kondisi}</span> di {rep.tripName}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STATS CHIPS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-150 p-4 shadow-2xs flex items-center space-x-3.5">
          <div className="p-3 bg-emerald-50 text-[#11512f] rounded-xl shrink-0 font-bold">
            <Map className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Ekspedisi</p>
            <h3 className="text-sm font-black text-slate-800">{metrics.totalCount} Trip</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-150 p-4 shadow-2xs flex items-center space-x-3.5">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0 font-bold">
            <Compass className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Sedang Berjalan</p>
            <h3 className="text-sm font-black text-slate-800">{metrics.activeCount} Pelaksanaan</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-150 p-4 shadow-2xs flex items-center space-x-3.5">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl shrink-0 font-bold">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Selesai Ekspedisi</p>
            <h3 className="text-sm font-black text-slate-800">{metrics.completedCount} Selesai</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-150 p-4 shadow-2xs flex items-center space-x-3.5">
          <div className="p-3 bg-[#e8f5ed] text-[#11512f] rounded-xl shrink-0 font-bold">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Crew Ditugaskan</p>
            <h3 className="text-sm font-black text-slate-800">
              {metrics.totalCrewAssignment} Personel
            </h3>
          </div>
        </div>
      </div>

      {/* FILTER & TRIP DECK TAB GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: CREATE NEW TRIP FORM CARD */}
        {canCreate ? (
          <div className="bg-white rounded-xl border border-slate-150 p-5 shadow-2xs lg:col-span-4 h-fit">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 mb-4">
              <Sliders className="h-5 w-5 text-[#11512f]" />
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Inisiasi Trip Baru</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Jenis Layanan Trip *</label>
                <select
                  id={`jenis-trip-${baseId}`}
                  value={newTripData.jenisTrip}
                  onChange={(e) => setNewTripData((prev: any) => ({ ...prev, jenisTrip: e.target.value as any }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#11512f] focus:bg-white transition"
                >
                  <option value="Open Trip">Open Trip</option>
                  <option value="Private Trip">Private Trip</option>
                  <option value="Outing">Outing (Komunitas/Sekolah)</option>
                  <option value="Corporate Trip">Corporate Trip (Instansi/Perusahaan)</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">No. Trip *</label>
                  <input
                    id={`nomor-trip-${baseId}`}
                    type="text"
                    required
                    maxLength={5}
                    placeholder="Cth: 20"
                    value={newTripData.nomorTrip}
                    onChange={(e) => setNewTripData((prev: any) => ({ ...prev, nomorTrip: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#11512f] focus:bg-white transition text-center"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nama Destinasi *</label>
                  <input
                    id={`destinasi-${baseId}`}
                    type="text"
                    required
                    placeholder="Contoh: Gunung Sumbing"
                    value={newTripData.namaDestinasi}
                    onChange={(e) => setNewTripData((prev: any) => ({ ...prev, namaDestinasi: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#11512f] focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Jalur / Basecamp</label>
                <input
                  id={`jalur-${baseId}`}
                  type="text"
                  placeholder="Contoh: Garung / Dukuh Seman"
                  value={newTripData.jalurPendakian}
                  onChange={(e) => setNewTripData((prev: any) => ({ ...prev, jalurPendakian: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#11512f] focus:bg-white transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Mulai *</label>
                  <input
                    id={`mulai-${baseId}`}
                    type="date"
                    required
                    value={newTripData.tanggalMulai}
                    onChange={(e) => setNewTripData((prev: any) => ({ ...prev, tanggalMulai: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#11512f] focus:bg-white transition text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Selesai</label>
                  <input
                    id={`selesai-${baseId}`}
                    type="date"
                    value={newTripData.tanggalSelesai}
                    onChange={(e) => setNewTripData((prev: any) => ({ ...prev, tanggalSelesai: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#11512f] focus:bg-white transition text-center"
                  />
                </div>
              </div>

              {/* Autonom Penamaan Preview */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-450 font-mono">Real-Time Title Format:</span>
                <p className="text-[10px] font-extrabold text-[#11512f] font-serif leading-relaxed line-clamp-2">
                  {generatedTripTitle || 'Lengkapi form untuk melihat judul trip...'}
                </p>
              </div>

              <button
                id={`btn-create-trip-${baseId}`}
                type="submit"
                className="w-full py-2.5 bg-[#11512f] hover:bg-emerald-800 text-white font-bold rounded-lg transition-all border-0 flex items-center justify-center space-x-2 cursor-pointer shadow-xs font-sans text-xs"
              >
                <Plus className="h-4 w-4" />
                <span>Buat Rencana Trip</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-150 p-5 shadow-2xs lg:col-span-4 h-fit text-center space-y-3">
            <Lock className="h-8 w-8 text-slate-400 mx-auto" />
            <h4 className="text-xs font-bold text-slate-700">Akses Terbatas</h4>
            <p className="text-[10.5px] text-slate-400 font-semibold">Tingkat akun Anda ({userRole}) hanya diperbolehkan untuk melakukan pemantauan beban logistik trip.</p>
          </div>
        )}

        {/* RIGHT: LIST OF REGISTERED EXPEDITIONS WITH SEARCH */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 gap-3">
            <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 border border-slate-150 rounded-xl max-w-xs w-full text-xs font-bold">
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Cari destinasi / trip no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-0 focus:outline-hidden focus:ring-0 w-full text-xs font-bold text-slate-700 placeholder-slate-400"
              />
            </div>

            <div className="flex items-center space-x-1.5 text-[10px] font-bold">
              <span className="text-slate-400">Status:</span>
              {(['Semua', 'Aktif', 'Selesai', 'Draft'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setStatusFilter(opt)}
                  className={`px-3 py-1.5 border border-0 rounded-lg cursor-pointer font-extrabold ${
                    statusFilter === opt 
                      ? 'bg-[#11512f] text-white shadow-2xs' 
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-500'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {filteredTrips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTrips.map((trip) => {
                // Calculate baggage distributed
                let totalW = 0;
                let totalCount = 0;
                trip.distributions.forEach((d) => {
                  const pItem = trip.plannedItems.find((p) => p.idBarang === d.idBarang);
                  if (pItem) {
                    const itemWeight = parseWeightToKg(pItem.beratBarang);
                    totalW += (itemWeight * d.jumlah);
                    totalCount += d.jumlah;
                  }
                });

                return (
                  <div 
                    key={trip.id}
                    onClick={() => onSelectTrip(trip.id)}
                    className="bg-white border border-slate-150 rounded-xl p-4.5 hover:shadow-md hover:border-[#11512f]/45 transition duration-200 cursor-pointer flex flex-col justify-between space-y-4 group relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-[#11512f]/40 group-hover:bg-[#11512f]" />
                    
                    <div className="space-y-2 pl-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                          trip.jenisTrip === 'Open Trip' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          trip.jenisTrip === 'Private Trip' ? 'bg-sky-50 text-sky-700 border border-sky-100' :
                          trip.jenisTrip === 'Outing' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          'bg-purple-50 text-purple-700 border border-purple-100'
                        }`}>
                          {trip.jenisTrip}
                        </span>

                        <span className={`text-[9.5px] font-black px-2 py-0.5 rounded-md ${
                          trip.status === 'Selesai' ? 'bg-teal-50 text-teal-700 border border-teal-100' :
                          trip.status === 'On Trip' ? 'bg-emerald-600 text-white' :
                          trip.status === 'Returning' ? 'bg-amber-400 text-slate-900 font-extrabold mr-1.5 animate-pulse' :
                          trip.status === 'Persiapan' ? 'bg-blue-50 text-blue-700 border border-blue-105' :
                          trip.status === 'Siap Berangkat' ? 'bg-indigo-50 text-indigo-700 border border-indigo-105' :
                          'bg-slate-100 text-slate-500 font-bold'
                        }`}>
                          {trip.status}
                        </span>
                      </div>

                      <h4 className="text-xs font-serif font-black text-slate-800 leading-snug group-hover:text-[#11512f] transition-colors">
                        {trip.jenisTrip} {trip.nomorTrip}. {trip.namaDestinasi} via {trip.jalurPendakian}
                      </h4>

                      <div className="flex items-center text-[10px] text-slate-400 font-bold space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>Mulai {trip.tanggalMulai}</span>
                      </div>
                    </div>

                    <div className="bg-slate-50/80 group-hover:bg-slate-50 border border-slate-100/50 rounded-lg p-2.5 grid grid-cols-3 gap-1 text-[10px] text-center font-bold pl-1.5">
                      <div>
                        <span className="block text-slate-400 font-normal uppercase text-[8px] tracking-wider mb-0.5">Struktur Kru</span>
                        <span className="text-slate-705 font-black">{trip.crew.length} Orang</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 font-normal uppercase text-[8px] tracking-wider mb-0.5">Item Barang</span>
                        <span className="text-[#11512f] font-black">{trip.plannedItems.length} Jenis</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 font-normal uppercase text-[8px] tracking-wider mb-0.5">Cargo Beban</span>
                        <span className="text-[#11512f] font-black">{totalW.toFixed(1)} kg</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100/60 text-xs text-slate-400">
                      <span className="font-bold underline text-[#11512f]/85 hover:text-[#11512f] text-[11px] inline-flex items-center space-x-1">
                        <span>Workspace Logistik</span>
                        <ChevronRight className="h-3.5 w-3.5 inline" />
                      </span>
                      
                      {canCreate && (
                        <button
                          type="button"
                          onClick={(e) => onDeleteTrip(trip.id, e)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition hover:bg-rose-50 cursor-pointer border-0"
                          title="Hapus Rencana Trip"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 border border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-400 space-y-3">
              <Compass className="h-10 w-10 mx-auto text-slate-200 animate-pulse" />
              <div className="space-y-0.5">
                <p className="text-xs font-bold">Belum Ada Trip Terdaftar</p>
                <p className="text-[10px]">Silakan buat rencana trip ekspedisi pertama Anda di sebelah kiri.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
