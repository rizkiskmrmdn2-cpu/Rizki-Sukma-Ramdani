import React, { useState, useMemo } from 'react';
import { 
  Compass, 
  MapPin, 
  Calendar, 
  Briefcase, 
  CheckCircle, 
  AlertTriangle, 
  Activity, 
  FileText, 
  ShieldAlert, 
  Camera, 
  ListTodo,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { ExpeditionTrip, InventoryItem } from '../types';

interface Props {
  activeTrip: ExpeditionTrip;
  inventory: InventoryItem[];
  onUpdateStatus: (status: ExpeditionTrip['status']) => void;
  onSaveDamageReport: (report: any[]) => void;
  userRole: string;
}

export default function TripOverviewStep1({
  activeTrip,
  inventory,
  onUpdateStatus,
  onSaveDamageReport,
  userRole
}: Props) {
  // Return Checklist Form state
  const [returnForm, setReturnForm] = useState<Array<{
    idBarang: string;
    namaBarang: string;
    jumlahRusak: number;
    kondisi: 'Aman' | 'Rusak Ringan' | 'Rusak Berat' | 'Hilang' | 'Basah' | 'Maintenance';
    catatan: string;
    showCamSim: boolean;
    tempPhoto: string;
  }>>(() => {
    // If damage report already exists, populate from it; else populate from unique plannedItems
    if (activeTrip.damageReport && activeTrip.damageReport.length > 0) {
      return activeTrip.damageReport.map(rep => ({
        idBarang: rep.idBarang,
        namaBarang: rep.namaBarang,
        jumlahRusak: rep.jumlahRusak,
        kondisi: rep.kondisi,
        catatan: rep.catatan,
        showCamSim: false,
        tempPhoto: rep.foto || ''
      }));
    }

    return activeTrip.plannedItems.map(p => ({
      idBarang: p.idBarang,
      namaBarang: p.namaBarang,
      jumlahRusak: p.jumlahDigunakan,
      kondisi: 'Aman',
      catatan: '',
      showCamSim: false,
      tempPhoto: ''
    }));
  });

  const [returnSaved, setReturnSaved] = useState(false);

  // Compute status metrics
  const { progressPercentage, statusLabel, bgGradient, progressColor } = useMemo(() => {
    switch (activeTrip.status) {
      case 'Draft':
        return { progressPercentage: 15, statusLabel: 'Dalam Perancangan Alat', bgGradient: 'from-slate-50 to-slate-100', progressColor: 'bg-slate-400' };
      case 'Persiapan':
        return { progressPercentage: 35, statusLabel: 'Pengumpulan & Pengepakan Logistik', bgGradient: 'from-blue-50/50 to-blue-50', progressColor: 'bg-blue-600' };
      case 'Siap Berangkat':
        return { progressPercentage: 55, statusLabel: 'Final Check & Loading Bagasi', bgGradient: 'from-indigo-50/50 to-indigo-50', progressColor: 'bg-indigo-600' };
      case 'On Trip':
        return { progressPercentage: 80, statusLabel: 'Menuju & Berada di Lapangan Ekspedisi', bgGradient: 'from-emerald-50/40 to-emerald-50/80', progressColor: 'bg-emerald-600' };
      case 'Returning':
        return { progressPercentage: 90, statusLabel: 'Trip Selesai, Proses Pemulangan & Review Alat', bgGradient: 'from-amber-50/45 to-amber-50/90', progressColor: 'bg-amber-500' };
      case 'Selesai':
        return { progressPercentage: 100, statusLabel: 'Selesai Checklist & Masuk Gudang Kembali', bgGradient: 'from-teal-5ff/30 to-teal-50', progressColor: 'bg-teal-600' };
      default:
        return { progressPercentage: 0, statusLabel: 'Unknown', bgGradient: 'from-slate-50 to-slate-100', progressColor: 'bg-slate-500' };
    }
  }, [activeTrip.status]);

  // Handle saving the checked damage reports
  const handleSubmitReturnChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveDamageReport(returnForm.map(f => ({
      idBarang: f.idBarang,
      namaBarang: f.namaBarang,
      jumlahRusak: f.jumlahRusak,
      kondisi: f.kondisi,
      catatan: f.catatan,
      foto: f.tempPhoto
    })));
    setReturnSaved(true);
    setTimeout(() => setReturnSaved(false), 3000);
  };

  const handleUpdateItemField = (idBarang: string, field: string, value: any) => {
    setReturnForm(prev => prev.map(f => f.idBarang === idBarang ? { ...f, [field]: value } : f));
  };

  // Trigger simulated snapshot generator
  const triggerCameraSimulation = (idBarang: string) => {
    const fallbackImage = `https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=80&q=80`;
    handleUpdateItemField(idBarang, 'tempPhoto', fallbackImage);
    handleUpdateItemField(idBarang, 'showCamSim', true);
    setTimeout(() => {
      handleUpdateItemField(idBarang, 'showCamSim', false);
    }, 1500);
  };

  // Check roles permissions
  const canUpdateStatus = userRole === 'Head of Logistics' || userRole === 'Super Admin' || userRole === 'rizki' || userRole === 'barengintrip' || userRole === 'Tour Leader';

  return (
    <div className="space-y-6">
      {/* HEADER PROGRESS BAR */}
      <div className={`border border-slate-150 rounded-xl p-5 bg-gradient-to-r shadow-2xs ${bgGradient} space-y-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs font-bold text-slate-500">
          <div className="space-y-1">
            <h3 className="text-[#11512f] font-black text-xs uppercase tracking-wider flex items-center">
              <Activity className="h-4.5 w-4.5 mr-1 text-[#11512f] inline animate-pulse" />
              <span>Garis Progress Kesiapan Trip</span>
            </h3>
            <p className="text-slate-700 font-extrabold text-[11px]">Rencana Status: <span className="text-[#11512f] font-black">{activeTrip.status}</span> &bull; {statusLabel}</p>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Penyelesaian: {progressPercentage}%</span>
        </div>

        {/* Real Visual Segment bar */}
        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden shadow-inner flex">
          <div 
            className={`${progressColor} h-full rounded-full transition-all duration-700`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* THREE LAYOUT COLUMNS: CONTROLS & CHECKOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
        
        {/* STATUS FLOW CONFIGURATORS */}
        <div className="bg-white border border-slate-150 rounded-xl p-5 shadow-2xs lg:col-span-4 space-y-4 h-fit">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Compass className="h-5 w-5 text-[#11512f]" />
            <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">Alur Kontrol Status Operasional</span>
          </div>

          {canUpdateStatus ? (
            <div className="space-y-2 pt-1 font-bold">
              {(['Draft', 'Persiapan', 'Siap Berangkat', 'On Trip', 'Returning', 'Selesai'] as const).map((statusValue) => {
                const isSelected = activeTrip.status === statusValue;
                return (
                  <button
                    key={statusValue}
                    type="button"
                    onClick={() => onUpdateStatus(statusValue)}
                    className={`w-full text-left px-3.5 py-2 rounded-lg border cursor-pointer transition flex items-center justify-between text-[11px] ${
                      isSelected 
                        ? 'bg-[#11512f] border-emerald-900 text-white font-extrabold shadow-xs' 
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-605 border-slate-200'
                    }`}
                  >
                    <span>{statusValue}</span>
                    {isSelected && <CheckCircle className="h-4 w-4 text-emerald-300" />}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="bg-rose-50 border border-rose-100 text-rose-800 rounded-xl p-4 space-y-2">
              <ShieldAlert className="h-5 w-5 text-rose-500" />
              <p className="font-semibold leading-relaxed">Penyetelan status trip terkunci karena akun Anda ({userRole}) tidak memiliki izin eksekusi lapangan.</p>
            </div>
          )}
        </div>

        {/* LOGISTICS CHECKOUT PENGEMBALIAN BARANG (RETURN CHECKLIST) */}
        {['Returning', 'Selesai'].includes(activeTrip.status) ? (
          <div className="bg-white border border-slate-150 rounded-xl p-5 shadow-2xs lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <ListTodo className="h-5 w-5 text-emerald-600 animate-pulse" />
                <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">Review Pengecekan &amp; Pengembalian Alat Basecamp</span>
              </div>
              
              <span className="bg-amber-100 text-amber-800 font-mono font-bold text-[9px] uppercase px-2 py-0.5 rounded-md">
                Fitur Pengembalian Aktif
              </span>
            </div>

            <form onSubmit={handleSubmitReturnChecklist} className="space-y-4 pt-1 font-semibold">
              <div className="space-y-3.5 divide-y divide-slate-100">
                {returnForm.map((item, index) => {
                  return (
                    <div key={item.idBarang} className="pt-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 font-semibold text-slate-705">
                      <div className="space-y-1">
                        <span className="font-black text-slate-800 text-[11px]">{item.namaBarang}</span>
                        <div className="text-[9px] text-slate-400 font-mono">ID: {item.idBarang} &bull; Dipinjam: {activeTrip.plannedItems[index]?.jumlahDigunakan || 1} unit</div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0">
                        {/* Selector kondisi */}
                        <div className="flex items-center space-x-1">
                          <span className="text-[9px] font-bold text-slate-400">Kondisi:</span>
                          <select
                            value={item.kondisi}
                            onChange={(e) => handleUpdateItemField(item.idBarang, 'kondisi', e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-md py-1 px-1.5 font-bold text-[10px] text-slate-705 focus:outline-hidden"
                          >
                            <option value="Aman">🟢 Aman / Utuh</option>
                            <option value="Rusak Ringan">⚠️ Rusak Ringan</option>
                            <option value="Rusak Berat">❌ Rusak Berat</option>
                            <option value="Hilang">🔴 Tidak Kembali (Hilang)</option>
                            <option value="Basah">💧 Basah/Kotor</option>
                            <option value="Maintenance">🔧 Perlunya Servis</option>
                          </select>
                        </div>

                        {/* Qty rusak if applicable */}
                        {item.kondisi !== 'Aman' && (
                          <div className="flex items-center space-x-1">
                            <span className="text-[9px] font-bold text-slate-400">Jumlah:</span>
                            <input
                              type="number"
                              min="1"
                              max={activeTrip.plannedItems[index]?.jumlahDigunakan || 99}
                              value={item.jumlahRusak}
                              onChange={(e) => handleUpdateItemField(item.idBarang, 'jumlahRusak', Number(e.target.value))}
                              className="w-10 text-center py-0.5 border border-slate-200 rounded bg-slate-50 font-mono font-bold text-[10px]"
                            />
                          </div>
                        )}

                        {/* Text note notes */}
                        <input
                          type="text"
                          placeholder="Catatan kendala..."
                          value={item.catatan}
                          onChange={(e) => handleUpdateItemField(item.idBarang, 'catatan', e.target.value)}
                          className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-[10px] focus:outline-hidden"
                        />

                        {/* Camera Simulator */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => triggerCameraSimulation(item.idBarang)}
                            className={`p-1 text-slate-450 hover:text-[#11512f] hover:bg-slate-100 rounded-md border-0 cursor-pointer ${
                              item.tempPhoto ? 'text-emerald-700' : ''
                            }`}
                            title="Foto Bukti Kerusakan"
                          >
                            <Camera className="h-4.5 w-4.5" />
                          </button>
                          
                          {item.showCamSim && (
                            <span className="absolute bottom-6 right-0 bg-slate-900 text-white text-[8px] p-1 font-mono rounded-sm whitespace-nowrap z-30 animate-pulse">
                              📸 Mengambil Foto...
                            </span>
                          )}

                          {item.tempPhoto && !item.showCamSim && (
                            <div className="absolute bottom-6 right-0 border-2 border-emerald-600 bg-white p-1 rounded-sm shadow-md z-30">
                              <img src={item.tempPhoto} className="h-6 w-6 object-cover" alt="Sim" referrerPolicy="no-referrer" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {returnSaved && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl font-bold flex items-center space-x-2">
                  <CheckCircle className="h-4.5 w-4.5 text-emerald-600" />
                  <span>Cek pengembalian logistics berhasil disinkronisasi ke server utama!</span>
                </div>
              )}

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  className="px-4.5 py-2 bg-[#11512f] hover:bg-emerald-800 text-white rounded-lg border-0 cursor-pointer font-bold space-x-1 shadow-xs flex items-center"
                >
                  <RefreshCw className="h-3.5 w-3.5 animate-spin-slow inline mr-1" />
                  <span>Selesaikan Checklist Pengembalian</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-8 lg:col-span-8 flex flex-col items-center justify-center text-center space-y-2 text-slate-400">
            <ListTodo className="h-8 w-8 text-slate-300" />
            <h4 className="text-xs font-bold text-slate-700">Checklist Pengembalian Belum Aktif</h4>
            <p className="text-[10.5px] max-w-sm font-semibold">Prosedur checklists status pengembalian barang dan laporan kerusakan/kehilangan otomatis terbuka ketika status trip dirubah menjadi <span className="text-[#11512f] font-bold">Returning</span> atau <span className="text-[#11512f] font-bold">Selesai</span>.</p>
          </div>
        )}

      </div>
    </div>
  );
}
