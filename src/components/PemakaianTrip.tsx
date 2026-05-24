import React, { useState, useEffect, useMemo, useId } from 'react';
import { 
  Compass, 
  MapPin, 
  Plus, 
  Trash2, 
  ChevronRight, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  UserCheck, 
  Users, 
  Backpack, 
  Search, 
  Sparkles, 
  Camera, 
  QrCode, 
  Printer, 
  Download, 
  AlertCircle, 
  X, 
  Lock, 
  Settings, 
  Check, 
  Edit, 
  Map,
  MoveLeft,
  Smartphone,
  CheckSquare
} from 'lucide-react';
import { InventoryItem, CrewAssignment, ExpeditionTrip, ExpeditionCrew, PlannedLogisticsItem, CrewDistributionItem, AppConfig } from '../types';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';

// Import our newly created modular substeps
import TripDashboard from './TripDashboard';
import TripOverviewStep1 from './TripOverviewStep1';
import PlannedItemsStep3 from './PlannedItemsStep3';
import TripConsumptionStep4 from './TripConsumptionStep4';
import LogisticsDistributionStep4 from './LogisticsDistributionStep4';
import PdfManifestStep5 from './PdfManifestStep5';

interface Props {
  inventory: InventoryItem[];
  userRole?: string;
  config?: AppConfig;
}

// Indonesian month names for date formatter
const INDO_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

function formatDateLocale(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getDate()} ${INDO_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function formatTripDates(dateMulai: string, dateSelesai: string): string {
  if (!dateMulai) return '';
  if (!dateSelesai || dateMulai === dateSelesai) {
    return formatDateLocale(dateMulai);
  }
  const start = new Date(dateMulai);
  const end = new Date(dateSelesai);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return `${dateMulai} s.d ${dateSelesai}`;
  }
  
  const startDay = start.getDate();
  const startMonth = INDO_MONTHS[start.getMonth()];
  const startYear = start.getFullYear();
  
  const endDay = end.getDate();
  const endMonth = INDO_MONTHS[end.getMonth()];
  const endYear = end.getFullYear();
  
  if (startYear !== endYear) {
    return `${startDay} ${startMonth} ${startYear} – ${endDay} ${endMonth} ${endYear}`;
  }
  if (startMonth !== endMonth) {
    return `${startDay} ${startMonth} – ${endDay} ${endMonth} ${startYear}`;
  }
  return `${startDay}–${endDay} ${startMonth} ${startYear}`;
}

export default function PemakaianTrip({ inventory, userRole = 'Super Admin', config }: Props) {
  const baseId = useId();

  // Firestore state
  const [trips, setTrips] = useState<ExpeditionTrip[]>([]);

  const [activeTripId, setActiveTripId] = useState<string | null>(() => {
    return localStorage.getItem('bt_active_trip_id') || null;
  });

  const [activeStep, setActiveStep] = useState<number>(1); // 1: Status & Checklist, 2: Kru, 3: Peralatan, 4: Distribusi, 5: Manifest

  // 1. Load and listen from Firestore instead of localStorage
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'expedition_trips'), (snapshot) => {
      const data: ExpeditionTrip[] = [];
      snapshot.forEach((doc) => {
        data.push(doc.data() as ExpeditionTrip);
      });
      // Sort newest trip first
      data.sort((a, b) => b.id.localeCompare(a.id));
      setTrips(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'expedition_trips');
    });
    return () => unsubscribe();
  }, []);

  // Save specific trip directly to Firestore
  const saveTripToFirestore = async (trip: ExpeditionTrip) => {
    try {
      await setDoc(doc(db, 'expedition_trips', trip.id), trip);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `expedition_trips/${trip.id}`);
    }
  };

  const deleteTripFromFirestore = async (tripId: string) => {
    try {
      await deleteDoc(doc(db, 'expedition_trips', tripId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `expedition_trips/${tripId}`);
    }
  };

  useEffect(() => {
    if (activeTripId) {
      localStorage.setItem('bt_active_trip_id', activeTripId);
    } else {
      localStorage.removeItem('bt_active_trip_id');
    }
  }, [activeTripId]);

  const activeTrip = useMemo(() => {
    return trips.find((t) => t.id === activeTripId) || null;
  }, [trips, activeTripId]);

  // Handle active status update
  const handleUpdateStatus = (val: ExpeditionTrip['status']) => {
    if (!activeTrip) return;
    saveTripToFirestore({ ...activeTrip, status: val });
  };

  // Handle saving return checklist
  const handleSaveDamageReport = (rep: any[]) => {
    if (!activeTrip) return;
    saveTripToFirestore({ ...activeTrip, damageReport: rep });
  };

  // NEW TRIP FORM INGEST DATA
  const [newTripData, setNewTripData] = useState({
    jenisTrip: 'Open Trip' as 'Open Trip' | 'Private Trip' | 'Outing' | 'Corporate Trip',
    nomorTrip: '19',
    namaDestinasi: '',
    jalurPendakian: '',
    tanggalMulai: '',
    tanggalSelesai: ''
  });

  const generatedTripTitle = useMemo(() => {
    const dates = formatTripDates(newTripData.tanggalMulai, newTripData.tanggalSelesai);
    const datePart = dates ? ` ${dates}` : '';
    const jPart = newTripData.jalurPendakian ? ` via ${newTripData.jalurPendakian}` : '';
    const dPart = newTripData.namaDestinasi ? `. ${newTripData.namaDestinasi}` : '';
    return `${newTripData.jenisTrip} ${newTripData.nomorTrip}${dPart}${jPart}${datePart}`;
  }, [newTripData]);

  const handleCreateTrip = (data: typeof newTripData) => {
    const newTrip: ExpeditionTrip = {
      id: `TRIP-${Date.now()}`,
      jenisTrip: data.jenisTrip,
      nomorTrip: data.nomorTrip,
      namaDestinasi: data.namaDestinasi,
      jalurPendakian: data.jalurPendakian,
      tanggalMulai: data.tanggalMulai,
      tanggalSelesai: data.tanggalSelesai || data.tanggalMulai,
      status: 'Draft',
      crew: [],
      plannedItems: [],
      distributions: []
    };

    saveTripToFirestore(newTrip);
    setActiveTripId(newTrip.id);
    setActiveStep(1); // Nav straight to step 1
  };

  const handleDeleteTrip = (tripId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let confirmDelete = true;
    try {
      confirmDelete = window.confirm('Apakah Anda yakin ingin menghapus rencana trip operasional ini secara permanen?');
    } catch (err) {
      // In sandbox/iframe, confirm is blocked, proceed with deletion directly
      confirmDelete = true;
    }
    if (confirmDelete) {
      deleteTripFromFirestore(tripId);
      if (activeTripId === tripId) {
        setActiveTripId(null);
      }
    }
  };

  // ----------------------------------------------------
  // STEP 2: REGISTER CREW MEMBERS LOGIC
  // ----------------------------------------------------
  const [crewForm, setCrewForm] = useState<Partial<ExpeditionCrew>>({
    namaKru: '',
    role: 'Porter Barengin',
    nomorHp: '',
    kapasitasBebanMax: 20
  });
  const [editingCrewId, setEditingCrewId] = useState<string | null>(null);

  const handleAddOrUpdateCrew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTrip || !crewForm.namaKru) return;

    let updatedCrew;
    if (editingCrewId) {
      updatedCrew = activeTrip.crew.map((c) =>
        c.id === editingCrewId
          ? {
              ...c,
              namaKru: crewForm.namaKru!,
              role: crewForm.role as any,
              nomorHp: crewForm.nomorHp || '',
              kapasitasBebanMax: Number(crewForm.kapasitasBebanMax || 20)
            }
          : c
      );
      setEditingCrewId(null);
    } else {
      const newCrew: ExpeditionCrew = {
        id: `CRW-${Date.now()}`,
        namaKru: crewForm.namaKru,
        role: (crewForm.role || 'Porter Barengin') as any,
        nomorHp: crewForm.nomorHp || '',
        kapasitasBebanMax: Number(crewForm.kapasitasBebanMax || 20)
      };
      updatedCrew = [...activeTrip.crew, newCrew];
    }

    saveTripToFirestore({ ...activeTrip, crew: updatedCrew });

    setCrewForm({
      namaKru: '',
      role: 'Porter Barengin',
      nomorHp: '',
      kapasitasBebanMax: 20
    });
  };

  const handleEditCrew = (c: ExpeditionCrew) => {
    setCrewForm(c);
    setEditingCrewId(c.id);
  };

  const handleDeleteCrew = (crewId: string) => {
    if (!activeTrip) return;
    saveTripToFirestore({
      ...activeTrip,
      crew: activeTrip.crew.filter((c) => c.id !== crewId),
      distributions: activeTrip.distributions.filter((d) => d.kruId !== crewId)
    });
  };

  // ----------------------------------------------------
  // STEP 3: EQUIPMENT PLANNING BRIDGE
  // ----------------------------------------------------
  const handleAddPlannedItem = (idBarang: string, qty: number) => {
    if (!activeTrip) return;
    const invItem = inventory.find(i => i.id === idBarang);
    if (!invItem) return;

    saveTripToFirestore({
      ...activeTrip,
      plannedItems: [...activeTrip.plannedItems, {
        idBarang,
        namaBarang: invItem.namaBarang,
        jumlahDigunakan: qty,
        beratBarang: invItem.berat
      }]
    });
  };

  const handleRemovePlannedItem = (idBarang: string) => {
    if (!activeTrip) return;
    saveTripToFirestore({
      ...activeTrip,
      plannedItems: activeTrip.plannedItems.filter((p) => p.idBarang !== idBarang),
      distributions: activeTrip.distributions.filter((d) => d.idBarang !== idBarang)
    });
  };

  const handleUpdatePlannedQty = (idBarang: string, increment: boolean) => {
    if (!activeTrip) return;
    saveTripToFirestore({
      ...activeTrip,
      plannedItems: activeTrip.plannedItems.map((p) => {
        if (p.idBarang === idBarang) {
          const targetQty = increment ? p.jumlahDigunakan + 1 : p.jumlahDigunakan - 1;
          return { ...p, jumlahDigunakan: Math.max(1, targetQty) };
        }
        return p;
      })
    });
  };

  const handleLoadTemplate = (items: any[]) => {
    if (!activeTrip) return;
    saveTripToFirestore({
      ...activeTrip,
      plannedItems: items
    });
  };

  // ----------------------------------------------------
  // STEP 4: CARGO DISTRIBUTION BRIDGE
  // ----------------------------------------------------
  const handleAddDistribution = (kruId: string, idBarang: string, jumlah: number) => {
    if (!activeTrip) return;
    
    // Check if already assigned
    const existing = activeTrip.distributions.find((d) => d.kruId === kruId && d.idBarang === idBarang);
    let updatedDistributions;
    if (existing) {
      updatedDistributions = activeTrip.distributions.map((d) =>
        d.kruId === kruId && d.idBarang === idBarang
          ? { ...d, jumlah: d.jumlah + jumlah }
          : d
      );
    } else {
      updatedDistributions = [...activeTrip.distributions, {
        id: `DIST-${Date.now()}`,
        kruId,
        idBarang,
        jumlah
      }];
    }

    saveTripToFirestore({
      ...activeTrip,
      distributions: updatedDistributions
    });
  };

  const handleRemoveDistributionItem = (distId: string) => {
    if (!activeTrip) return;
    saveTripToFirestore({
      ...activeTrip,
      distributions: activeTrip.distributions.filter((d) => d.id !== distId)
    });
  };

  // Parser helper
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

  // Render dashboard when activeTripId is null
  if (!activeTrip) {
    return (
      <TripDashboard
        trips={trips}
        inventory={inventory}
        onSelectTrip={setActiveTripId}
        onDeleteTrip={handleDeleteTrip}
        onCreateTrip={handleCreateTrip}
        newTripData={newTripData}
        setNewTripData={setNewTripData}
        generatedTripTitle={generatedTripTitle}
        userRole={userRole}
      />
    );
  }

  // Common calculated values for selected workspace
  const activeIntervalStr = formatTripDates(activeTrip.tanggalMulai, activeTrip.tanggalSelesai);
  const activeFullTitle = `${activeTrip.jenisTrip} ${activeTrip.nomorTrip}. ${activeTrip.namaDestinasi} via ${activeTrip.jalurPendakian} (${activeIntervalStr})`;

  // Calculate total distributed weight
  let totalBWeight = 0;
  let totalBCount = 0;
  activeTrip.distributions.forEach((d) => {
    const pl = activeTrip.plannedItems.find((p) => p.idBarang === d.idBarang);
    if (pl) {
      totalBWeight += (parseWeightToKg(pl.beratBarang) * d.jumlah);
      totalBCount += d.jumlah;
    }
  });

  return (
    <div className="space-y-6">
      
      {/* EXTREME BRANDED SELECTED TRIP HEADER WORKSPACE */}
      <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-2xs space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-3.5">
          <button
            type="button"
            onClick={() => setActiveTripId(null)}
            className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-150 rounded-xl cursor-pointer text-xs font-bold font-sans text-slate-600 flex items-center space-x-1 uppercase tracking-wider"
          >
            <MoveLeft className="h-4 w-4 text-slate-500 shrink-0" />
            <span>KEMBALI KE HUB TRIP</span>
          </button>

          <span className={`text-[10px] font-black px-3.5 py-1 rounded-sm uppercase tracking-widest ${
            activeTrip.status === 'Selesai' ? 'bg-teal-50 text-teal-700 border border-teal-150' :
            activeTrip.status === 'On Trip' ? 'bg-emerald-600 text-white font-extrabold shadow-sm' :
            activeTrip.status === 'Returning' ? 'bg-amber-450 text-slate-900 font-extrabold animate-pulse shadow-sm' :
            'bg-slate-100 text-slate-500 font-bold border border-slate-200'
          }`}>
            STATUS: {activeTrip.status}
          </span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1 text-xs">
            <span className="text-[9px] font-black uppercase text-emerald-850 font-mono tracking-widest block">WORKSPACE LOGISTIK AKTIF</span>
            <h1 className="text-base sm:text-lg font-serif tracking-tight text-slate-900 leading-snug font-black">
              {activeFullTitle}
            </h1>
            <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-[10.5px] text-slate-450 font-bold">
              <span className="flex items-center text-slate-700">
                <MapPin className="h-3.5 w-3.5 mr-1 text-emerald-700" />
                Destinasi: {activeTrip.namaDestinasi} ({activeTrip.jalurPendakian})
              </span>
              <span>&middot;</span>
              <span className="flex items-center text-slate-700">
                <Calendar className="h-3.5 w-3.5 mr-1 text-emerald-700" />
                Garis Tanggal: {activeIntervalStr}
              </span>
            </div>
          </div>

          {/* Beban Ringkasan Banner */}
          <div className="bg-slate-50/70 border border-slate-150/50 rounded-xl p-3.5 flex items-center space-x-3 max-w-xs shrink-0 font-bold text-xs pl-4 pr-6 leading-tight">
            <div className="p-2 bg-[#11512f]/10 text-[#11512f] rounded-lg">
              <Backpack className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[8px] tracking-wider text-slate-400 uppercase font-mono">Beban Bagasi Terbagi</span>
              <h4 className="text-xs font-black text-slate-900 font-mono">{totalBWeight.toFixed(1)} kg <span className="font-normal text-[9px] text-slate-450">/{totalBCount} unit</span></h4>
            </div>
          </div>
        </div>

        {/* SECURE STEP TIMELINE SELECTOR */}
        <div className="pt-2">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-1.5 p-1 bg-slate-50 border border-slate-205/50 rounded-xl text-center text-[10px] font-bold leading-none select-none">
            
            <button
              onClick={() => setActiveStep(1)}
              className={`py-2.5 px-1 rounded-lg border border-0 cursor-pointer flex flex-col sm:flex-row items-center justify-center sm:space-x-1.5 transition ${
                activeStep === 1 ? 'bg-white text-[#11512f] shadow-2xs font-extrabold border-slate-200' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-mono mb-1 sm:mb-0 ${activeStep === 1 ? 'bg-[#11512f] text-white' : 'bg-slate-200 text-slate-650'}`}>1</span>
              <span>Trip Info &amp; Status</span>
            </button>

            <button
              onClick={() => setActiveStep(2)}
              className={`py-2.5 px-1 rounded-lg border border-0 cursor-pointer flex flex-col sm:flex-row items-center justify-center sm:space-x-1.5 transition ${
                activeStep === 2 ? 'bg-white text-[#11512f] shadow-2xs font-extrabold border-slate-200' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-mono mb-1 sm:mb-0 ${activeStep === 2 ? 'bg-[#11512f] text-white' : 'bg-slate-200 text-slate-650'}`}>2</span>
              <span>Struktur Kru</span>
            </button>

            <button
              onClick={() => setActiveStep(3)}
              className={`py-2.5 px-1 rounded-lg border border-0 cursor-pointer flex flex-col sm:flex-row items-center justify-center sm:space-x-1.5 transition ${
                activeStep === 3 ? 'bg-white text-[#11512f] shadow-2xs font-extrabold border-slate-200' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-mono mb-1 sm:mb-0 ${activeStep === 3 ? 'bg-[#11512f] text-white' : 'bg-slate-200 text-slate-650'}`}>3</span>
              <span>Kebutuhan Alat</span>
            </button>

            <button
              onClick={() => setActiveStep(4)}
              className={`py-2.5 px-1 rounded-lg border border-0 cursor-pointer flex flex-col sm:flex-row items-center justify-center sm:space-x-1.5 transition ${
                activeStep === 4 ? 'bg-white text-[#11512f] shadow-2xs font-extrabold border-slate-200' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-mono mb-1 sm:mb-0 ${activeStep === 4 ? 'bg-[#11512f] text-white' : 'bg-slate-200 text-slate-650'}`}>4</span>
              <span>Kebutuhan Konsumsi</span>
            </button>

            <button
              onClick={() => setActiveStep(5)}
              className={`py-2.5 px-1 rounded-lg border border-0 cursor-pointer flex flex-col sm:flex-row items-center justify-center sm:space-x-1.5 transition ${
                activeStep === 5 ? 'bg-white text-[#11512f] shadow-2xs font-extrabold border-slate-200' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-mono mb-1 sm:mb-0 ${activeStep === 5 ? 'bg-[#11512f] text-white' : 'bg-slate-200 text-slate-650'}`}>5</span>
              <span>Distribusi Cargo</span>
            </button>

            <button
              onClick={() => setActiveStep(6)}
              className={`py-2.5 px-1 rounded-lg border border-0 cursor-pointer flex flex-col sm:flex-row items-center justify-center sm:space-x-1.5 transition ${
                activeStep === 6 ? 'bg-white text-[#11512f] shadow-2xs font-extrabold border-slate-200' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-mono mb-1 sm:mb-0 ${activeStep === 6 ? 'bg-[#11512f] text-white' : 'bg-slate-200 text-slate-650'}`}>6</span>
              <span>Cetak Manifest</span>
            </button>

          </div>
        </div>

      </div>

      {/* RENDER DYNAMIC STEPS PANEL SUB-COMPONENTS */}

      {/* STEP 1: Status Flow & Returns */}
      {activeStep === 1 && (
        <TripOverviewStep1
          activeTrip={activeTrip}
          inventory={inventory}
          onUpdateStatus={handleUpdateStatus}
          onSaveDamageReport={handleSaveDamageReport}
          userRole={userRole}
        />
      )}

      {/* STEP 2: Input Struktur Kru (Direct Implementation for UI layout richness) */}
      {activeStep === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs text-slate-705 font-semibold">
          {/* Create form */}
          {userRole !== 'Crew' ? (
            <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-2xs lg:col-span-4 h-fit space-y-4">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center">
                <UserCheck className="h-4.5 w-4.5 text-[#11512f] mr-1.5" />
                <span>{editingCrewId ? 'Edit Register Personel' : 'Tambah Personel Kru'}</span>
              </h3>

              <form onSubmit={handleAddOrUpdateCrew} className="space-y-4 font-semibold text-slate-707">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nama Personel Kru *</label>
                  <input
                    id={`crew-name-${baseId}`}
                    type="text"
                    required
                    placeholder="Contoh: Rian Wisnu"
                    value={crewForm.namaKru || ''}
                    onChange={(e) => setCrewForm(prev => ({ ...prev, namaKru: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#11512f] focus:bg-white transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Peran Ekspedisi *</label>
                    <select
                      id={`crew-role-${baseId}`}
                      value={crewForm.role || 'Porter Barengin'}
                      onChange={(e) => setCrewForm(prev => ({ ...prev, role: e.target.value as any }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#11512f] focus:bg-white transition"
                    >
                      <option value="Tour Leader">Tour Leader</option>
                      <option value="Assistant Guide">Assistant Guide</option>
                      <option value="Porter Barengin">Porter Barengin</option>
                      <option value="Porter Lokal">Porter Lokal</option>
                      <option value="Dokumentasi">Dokumentasi</option>
                      <option value="Anggota">Anggota Trip</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Max Cap (kg) *</label>
                    <input
                      id={`crew-cap-${baseId}`}
                      type="number"
                      required
                      min="5"
                      max="40"
                      value={crewForm.kapasitasBebanMax || 20}
                      onChange={(e) => setCrewForm(prev => ({ ...prev, kapasitasBebanMax: Number(e.target.value) }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#11512f] focus:bg-white transition text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nomor WhatsApp Hp</label>
                  <input
                    id={`crew-phone-${baseId}`}
                    type="text"
                    placeholder="Contoh: 081234567890"
                    value={crewForm.nomorHp || ''}
                    onChange={(e) => setCrewForm(prev => ({ ...prev, nomorHp: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#11512f] focus:bg-white transition"
                  />
                </div>

                <button
                  id={`btn-save-crew-${baseId}`}
                  type="submit"
                  className="w-full py-2 bg-[#11512f] hover:bg-emerald-800 text-white font-bold rounded-lg border-0 cursor-pointer flex items-center justify-center space-x-1 shadow-2xs font-sans"
                >
                  <Plus className="h-4 w-4" />
                  <span>{editingCrewId ? 'Simpan Perubahan' : 'Daftarkan Personel'}</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-2xs lg:col-span-4 h-fit text-center space-y-3">
              <Lock className="h-8 w-8 text-slate-300 mx-auto" />
              <h4 className="text-xs font-bold text-slate-705">Akses Terkunci</h4>
              <p className="text-[10px] leading-relaxed text-slate-400">Akun Anda ({userRole}) hanya diperbolehkan mengamati manifes logistik.</p>
            </div>
          )}

          {/* List display crew */}
          <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-2xs lg:col-span-8 space-y-4">
            <h3 className="text-xs font-black text-slate-855 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center justify-between">
              <span className="flex items-center">
                <Users className="h-4.5 w-4.5 text-[#11512f] mr-1.5" />
                <span>Susunan Struktur Pimpinan &amp; Porter Lapangan</span>
              </span>
              <span className="text-[10px] font-mono text-[#11512f] font-bold">Terdaftar: {activeTrip.crew.length} Crew</span>
            </h3>

            {activeTrip.crew.length > 0 ? (
              <div className="space-y-3.5 divide-y divide-slate-100/60 pb-1 max-h-96 overflow-y-auto pr-1">
                {activeTrip.crew.map((c, index) => {
                  // Local weight sum
                  let curW = 0;
                  activeTrip.distributions.forEach(d => {
                    if (d.kruId === c.id) {
                      const pl = activeTrip.plannedItems.find(p => p.idBarang === d.idBarang);
                      if (pl) curW += (parseWeightToKg(pl.beratBarang) * d.jumlah);
                    }
                  });

                  return (
                    <div key={index} className={`flex flex-col sm:flex-row sm:items-center sm:justify-between pt-3.5 gap-4 font-semibold text-slate-702 ${index === 0 ? 'pt-0 border-t-0' : ''}`}>
                      <div className="space-y-0.5">
                        <span className="font-extrabold text-[#11512f] text-[11.5px]">{c.namaKru}</span>
                        <div className="text-[9.5px] text-slate-400 font-mono flex items-center space-x-2">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded-sm text-[8.5px] text-slate-600 font-bold uppercase">{c.role}</span>
                          {c.nomorHp && <span>&bull; {c.nomorHp}</span>}
                        </div>
                      </div>

                      <div className="flex items-center space-x-5 font-bold text-[10.5px]">
                        <div>
                          <span className="block text-slate-400 text-[8px] uppercase tracking-wider font-mono">Payload Limit</span>
                          <span className="text-slate-800 font-black">{curW.toFixed(1)} / {c.kapasitasBebanMax} kg</span>
                        </div>

                        {userRole !== 'Crew' && (
                          <div className="flex items-center space-x-1.5 pt-1">
                            <button
                              type="button"
                              onClick={() => handleEditCrew(c)}
                              className="p-1 text-slate-400 hover:text-slate-820 rounded hover:bg-slate-50 border border-0 cursor-pointer"
                              title="Sunting data"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCrew(c.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 border border-0 cursor-pointer"
                              title="Hapus pimpinan"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 border border-dashed border-slate-150 bg-slate-50/60 rounded-xl text-slate-400 space-y-2 flex flex-col items-center justify-center">
                <Users className="h-8 w-8 text-slate-305" />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold">Kru Belum Terdaftar</span>
                  <span className="text-[10px]">Silakan daftarkan Tour Leader, Porter, atau asisten lapangan anda di sebelah kiri.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 3: Kebutuhan Alat (Peralatan per trip) */}
      {activeStep === 3 && (
        <PlannedItemsStep3
          plannedItems={activeTrip.plannedItems}
          inventory={inventory}
          onAddPlannedItem={handleAddPlannedItem}
          onRemovePlannedItem={handleRemovePlannedItem}
          onUpdateQty={handleUpdatePlannedQty}
          onLoadTemplate={handleLoadTemplate}
        />
      )}

      {/* STEP 4: Kebutuhan Konsumsi (Perencanaan logistik makan) */}
      {activeStep === 4 && (
        <TripConsumptionStep4
          activeTrip={activeTrip}
          onUpdateTrip={saveTripToFirestore}
          crew={activeTrip.crew}
        />
      )}

      {/* STEP 5: Distribusi Logistik Berbasis Card & QR Scanner Simulator */}
      {activeStep === 5 && (
        <LogisticsDistributionStep4
          crew={activeTrip.crew}
          plannedItems={activeTrip.plannedItems}
          distributions={activeTrip.distributions}
          inventory={inventory}
          onAddDistribution={handleAddDistribution}
          onRemoveDistribution={handleRemoveDistributionItem}
        />
      )}

      {/* STEP 6: Cetak PDF Manifest */}
      {activeStep === 6 && (
        <PdfManifestStep5
          activeTrip={activeTrip}
          plannedItems={activeTrip.plannedItems}
          distributions={activeTrip.distributions}
          inventory={inventory}
          config={config}
        />
      )}

    </div>
  );
}
