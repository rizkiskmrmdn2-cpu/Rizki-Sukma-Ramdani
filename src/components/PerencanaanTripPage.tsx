import { useState, useEffect, useMemo } from 'react';
import { 
  Compass, 
  MapPin, 
  Users, 
  ShieldAlert, 
  Clock, 
  CheckSquare, 
  FileText, 
  AlertTriangle, 
  AlertCircle,
  Siren, 
  Phone, 
  Truck, 
  Cloud, 
  Mountain, 
  Printer, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  RefreshCw, 
  Check, 
  UserPlus, 
  BookOpen, 
  Lightbulb, 
  Smartphone,
  CheckCircle2,
  FileCheck2
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { ExpeditionTrip, Participant, TimelineRow, SafetyRiskItem, EmergencyScenarioItem, EmergencyContactItem, TripCrewRoleAssignment, TripPlan } from '../types';
import { seedTripPlanDraft, getDefaultParticipants, getDefaultTimeline, getDefaultSafetyRisks, getDefaultEmergencyScenarios, getDefaultContacts, getDefaultSops, getFallbackPlanTemplate, getMountainNotesTemplate } from '../utils/perencanaanDefaults';
import { generateRopHtml } from './rop/RopPdfTemplate';

export default function PerencanaanTripPage() {
  const [trips, setTrips] = useState<ExpeditionTrip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [activePlannerSection, setActivePlannerSection] = useState<string>('cover');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Load and listen to trips
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'expedition_trips'), (snapshot) => {
      const data: ExpeditionTrip[] = [];
      snapshot.forEach((doc) => {
        data.push(doc.data() as ExpeditionTrip);
      });
      data.sort((a, b) => b.id.localeCompare(a.id));
      setTrips(data);
      if (data.length > 0 && !selectedTripId) {
        setSelectedTripId(data[0].id);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'expedition_trips');
    });
    return () => unsubscribe();
  }, [selectedTripId]);

  const activeTrip = useMemo(() => {
    return trips.find(t => t.id === selectedTripId) || null;
  }, [trips, selectedTripId]);

  // Read plan or default to empty
  const plan: TripPlan = useMemo(() => {
    return activeTrip?.perencanaan || {};
  }, [activeTrip]);

  // Local state modifiers for real-time edits before saving
  const [localPlan, setLocalPlan] = useState<TripPlan>({});
  
  // Autosave and sync tracking states
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'synced' | 'pending' | 'saving' | 'error'>('synced');

  // Reset local state whenever active trip changes, but only if they correspond to a different trip
  useEffect(() => {
    if (activeTrip) {
      setLocalPlan(activeTrip.perencanaan || {});
      setIsDirty(false);
      setAutoSaveStatus('synced');
    } else {
      setLocalPlan({});
      setIsDirty(false);
      setAutoSaveStatus('synced');
    }
  }, [selectedTripId]); // Trigger reset only when the active trip selection actually shifts

  // Track if local modifications differ from the stored state
  useEffect(() => {
    if (!activeTrip) return;
    const originalPlanString = JSON.stringify(activeTrip.perencanaan || {});
    const localPlanString = JSON.stringify(localPlan);
    
    if (originalPlanString !== localPlanString) {
      setIsDirty(true);
      setAutoSaveStatus('pending');
    } else {
      setIsDirty(false);
      setAutoSaveStatus('synced');
    }
  }, [localPlan, activeTrip?.perencanaan]);

  // Debounced Autosave effect
  useEffect(() => {
    if (!isDirty || !activeTrip) return;

    const delayTimer = setTimeout(async () => {
      setAutoSaveStatus('saving');
      try {
        await setDoc(doc(db, 'expedition_trips', activeTrip.id), {
          ...activeTrip,
          perencanaan: localPlan
        });
        setAutoSaveStatus('synced');
        setIsDirty(false);
      } catch (err) {
        console.error('Autosave failed:', err);
        setAutoSaveStatus('error');
      }
    }, 2000); // 2-second debounce interval

    return () => clearTimeout(delayTimer);
  }, [localPlan, isDirty, activeTrip]);

  // Utility to update any attribute of local planner
  const updateLocalPlan = (field: keyof TripPlan, value: any) => {
    setLocalPlan(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Explicit Save to Firestore database (force-triggered button fallback)
  const handleSavePlanner = async (updatedPlanPayload?: TripPlan) => {
    if (!activeTrip) return;
    setIsSaving(true);
    setAutoSaveStatus('saving');
    const savePayload = updatedPlanPayload || localPlan;
    try {
      await setDoc(doc(db, 'expedition_trips', activeTrip.id), {
        ...activeTrip,
        perencanaan: savePayload
      });
      setIsSaving(false);
      setAutoSaveStatus('synced');
      setIsDirty(false);
    } catch (err) {
      setIsSaving(false);
      setAutoSaveStatus('error');
      handleFirestoreError(err, OperationType.WRITE, `expedition_trips/${activeTrip.id}`);
    }
  };

  // Helper weight parser from distribution logic
  const parseWeightToKg = (weightStr: string): number => {
    if (!weightStr) return 0;
    const numeric = parseFloat(weightStr.toLowerCase().replace(/[^0-9.]/g, '')) || 0;
    if (weightStr.toLowerCase().includes('gr') || weightStr.toLowerCase().includes('gram')) {
      return numeric / 1000;
    }
    return numeric;
  };

  // Helper Cargo stats logic
  const crewCargoStats = useMemo(() => {
    const stats: Record<string, { weight: number; count: number; items: any[] }> = {};
    if (!activeTrip) return stats;

    // Initialize map
    activeTrip.crew.forEach(c => {
      stats[c.id] = { weight: 0, count: 0, items: [] };
    });

    // Populate using activeTrip cargo distributions
    if (activeTrip.distributions) {
      activeTrip.distributions.forEach((d) => {
        if (!stats[d.kruId]) return;
        const linkedItem = activeTrip.plannedItems.find(i => i.idBarang === d.idBarang);
        if (linkedItem) {
          const itemWeight = parseWeightToKg(linkedItem.beratBarang) * d.jumlah;
          stats[d.kruId].weight += itemWeight;
          stats[d.kruId].count += d.jumlah;
          stats[d.kruId].items.push({
            idBarang: d.idBarang,
            namaBarang: linkedItem.namaBarang,
            jumlah: d.jumlah,
            weight: itemWeight
          });
        }
      });
    }
    return stats;
  }, [activeTrip]);

  // Generate complete ROP Plan
  const handleGeneratePlanDraft = () => {
    if (!activeTrip) return;
    const drafted = seedTripPlanDraft(activeTrip);
    setLocalPlan(drafted);
    handleSavePlanner(drafted);
  };

  // Standalone offline-ready HTML printer
  const handleDownloadRopPdf = () => {
    if (!activeTrip || !localPlan) return;
    const formatIDRLocal = (amount: number) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
      }).format(amount);
    };

    const renderedHtml = generateRopHtml(activeTrip, localPlan, formatIDRLocal, crewCargoStats);
    
    // Create downloaded standalone printable document and auto-trigger
    const blob = new Blob([renderedHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rop_${activeTrip.jenisTrip.toLowerCase().replace(/\s+/g, '_')}_${activeTrip.namaDestinasi.toLowerCase().replace(/\s+/g, '_')}_PLAN.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Participant edit forms helpers
  const [newParticipant, setNewParticipant] = useState<Partial<Participant>>({
    namaLengkap: '',
    gender: 'Pria',
    usia: 25,
    whatsapp: '',
    daruratNo: '',
    meetingPoint: '',
    alamat: 'Jakarta',
    kondisiKhusus: 'Tidak Ada',
    tingkatFisik: 'Sedang',
    pengalamanPendakian: 'Pernah naik gunung',
    gearCriticalChecklist: 'Tenda, Carrier, SB, Jaket',
    statusKehadiran: 'Belum Hadir',
    catatanKru: ''
  });

  const handleAddParticipant = () => {
    if (!newParticipant.namaLengkap) return;
    const fresh: Participant = {
      id: `p-${Date.now()}`,
      namaLengkap: newParticipant.namaLengkap,
      gender: newParticipant.gender as 'Pria' | 'Wanita',
      usia: Number(newParticipant.usia) || 25,
      whatsapp: newParticipant.whatsapp || '',
      daruratNo: newParticipant.daruratNo || '',
      meetingPoint: newParticipant.meetingPoint || activeTrip?.namaDestinasi || '',
      alamat: newParticipant.alamat || '',
      kondisiKhusus: newParticipant.kondisiKhusus || 'Tidak ada',
      tingkatFisik: (newParticipant.tingkatFisik || 'Sedang') as 'Rendah' | 'Sedang' | 'Tinggi',
      pengalamanPendakian: newParticipant.pengalamanPendakian || 'No Experience',
      gearCriticalChecklist: newParticipant.gearCriticalChecklist || '',
      statusKehadiran: (newParticipant.statusKehadiran || 'Belum Hadir') as any,
      catatanKru: newParticipant.catatanKru || ''
    };

    const currentList = localPlan.pesertaList || [];
    const updatedList = [...currentList, fresh];
    updateLocalPlan('pesertaList', updatedList);
    
    // Reset form
    setNewParticipant({
      namaLengkap: '',
      gender: 'Pria',
      usia: 25,
      whatsapp: '',
      daruratNo: '',
      meetingPoint: '',
      alamat: 'Jakarta',
      kondisiKhusus: 'Tidak Ada',
      tingkatFisik: 'Sedang',
      pengalamanPendakian: 'Pernah naik gunung',
      gearCriticalChecklist: 'Tenda, Carrier, SB, Jaket',
      statusKehadiran: 'Belum Hadir',
      catatanKru: ''
    });
  };

  const handleRemoveParticipant = (id: string) => {
    const list = localPlan.pesertaList || [];
    updateLocalPlan('pesertaList', list.filter(p => p.id !== id));
  };

  const handleUpdateParticipantPresence = (id: string, status: 'Hadir' | 'Belum Hadir' | 'Bermasalah') => {
    const list = localPlan.pesertaList || [];
    const updated = list.map(p => {
      if (p.id === id) {
        return { ...p, statusKehadiran: status };
      }
      return p;
    });
    updateLocalPlan('pesertaList', updated);
  };

  // Timeline edit helpers
  const [newTimeline, setNewTimeline] = useState<Partial<TimelineRow>>({
    jam: '08.00 - 10.00',
    aktivitas: '',
    lokasi: '',
    pic: 'Tour Leader',
    catatan: ''
  });

  const handleAddTimeline = () => {
    if (!newTimeline.aktivitas) return;
    const fresh: TimelineRow = {
      id: `t-${Date.now()}`,
      jam: newTimeline.jam || '00.00',
      aktivitas: newTimeline.aktivitas,
      lokasi: newTimeline.lokasi || '',
      pic: newTimeline.pic || 'Tour Leader',
      catatan: newTimeline.catatan || ''
    };
    const currentList = localPlan.timeline || [];
    updateLocalPlan('timeline', [...currentList, fresh]);
    setNewTimeline({ jam: '08.00 - 10.00', aktivitas: '', lokasi: '', pic: 'Tour Leader', catatan: '' });
  };

  const handleRemoveTimeline = (id: string) => {
    const list = localPlan.timeline || [];
    updateLocalPlan('timeline', list.filter(t => t.id !== id));
  };

  // Risks edit helpers
  const [newRisk, setNewRisk] = useState<Partial<SafetyRiskItem>>({
    potensiRisiko: '',
    mitigasi: '',
    levelRisiko: 'Medium',
    keputusanOperasional: ''
  });

  const handleAddRisk = () => {
    if (!newRisk.potensiRisiko) return;
    const fresh: SafetyRiskItem = {
      id: `r-${Date.now()}`,
      potensiRisiko: newRisk.potensiRisiko,
      mitigasi: newRisk.mitigasi || '',
      levelRisiko: (newRisk.levelRisiko || 'Medium') as any,
      keputusanOperasional: newRisk.keputusanOperasional || ''
    };
    const currentList = localPlan.safetyRisks || [];
    updateLocalPlan('safetyRisks', [...currentList, fresh]);
    setNewRisk({ potensiRisiko: '', mitigasi: '', levelRisiko: 'Medium', keputusanOperasional: '' });
  };

  const handleRemoveRisk = (id: string) => {
    const list = localPlan.safetyRisks || [];
    updateLocalPlan('safetyRisks', list.filter(r => r.id !== id));
  };

  // Contacts edit helpers
  const [newContact, setNewContact] = useState<Partial<EmergencyContactItem>>({
    kategori: 'Basecamp',
    nama: '',
    kontak: '',
    alamat: ''
  });

  const handleAddContact = () => {
    if (!newContact.nama || !newContact.kontak) return;
    const fresh: EmergencyContactItem = {
      id: `c-${Date.now()}`,
      kategori: (newContact.kategori || 'Basecamp') as any,
      nama: newContact.nama,
      kontak: newContact.kontak,
      alamat: newContact.alamat || ''
    };
    const currentList = localPlan.kontakPentingList || [];
    updateLocalPlan('kontakPentingList', [...currentList, fresh]);
    setNewContact({ kategori: 'Basecamp', nama: '', kontak: '', alamat: '' });
  };

  const handleRemoveContact = (id: string) => {
    const list = localPlan.kontakPentingList || [];
    updateLocalPlan('kontakPentingList', list.filter(c => c.id !== id));
  };

  // Scenarios edit helpers
  const [newScenario, setNewScenario] = useState<Partial<EmergencyScenarioItem>>({
    kategori: 'Trekking',
    skenario: '',
    alurTindakan: '',
    pic: 'Tour Leader',
    kontakDarurat: 'Basecamp Ranger'
  });

  const handleAddScenario = () => {
    if (!newScenario.skenario || !newScenario.alurTindakan) return;
    const fresh: EmergencyScenarioItem = {
      id: `es-${Date.now()}`,
      kategori: (newScenario.kategori || 'Trekking') as any,
      skenario: newScenario.skenario,
      alurTindakan: newScenario.alurTindakan,
      pic: newScenario.pic || 'Tour Leader',
      kontakDarurat: newScenario.kontakDarurat || ''
    };
    const currentList = localPlan.emergencyScenarios || [];
    updateLocalPlan('emergencyScenarios', [...currentList, fresh]);
    setNewScenario({ kategori: 'Trekking', skenario: '', alurTindakan: '', pic: 'Tour Leader', kontakDarurat: 'Basecamp Ranger' });
  };

  const handleRemoveScenario = (id: string) => {
    const list = localPlan.emergencyScenarios || [];
    updateLocalPlan('emergencyScenarios', list.filter(es => es.id !== id));
  };

  // Crew Role assignments initialize or update helper
  const handleUpdateCrewRole = (crewId: string, updatedAssign: Partial<TripCrewRoleAssignment>) => {
    const currentList = localPlan.timStruktur || [];
    const updated = currentList.map(item => {
      if (item.id === crewId || item.namaKru === crewId) {
        return { ...item, ...updatedAssign };
      }
      return item;
    });
    updateLocalPlan('timStruktur', updated);
  };

  // Toggle logistik checklist state
  const handleToggleLogistikItem = (idBarang: string) => {
    const checks = { ...(localPlan.logistikChecklist || {}) };
    checks[idBarang] = !checks[idBarang];
    updateLocalPlan('logistikChecklist', checks);
  };

  // Helper lists of 14 planning categories
  const plannerSteps = [
    { id: 'cover', label: '1. Cover ROP & Subtitle', icon: FileText, valid: !!localPlan.coverTitle },
    { id: 'info', label: '2. Info Operasional Trip', icon: Compass, valid: !!localPlan.meetingPoint },
    { id: 'peserta', label: '3. Data Peserta (POMS)', icon: Users, valid: !!localPlan.pesertaList?.length },
    { id: 'tim', label: '4. Struktur Tim Kru', icon: BookOpen, valid: !!localPlan.timStruktur?.length },
    { id: 'timeline', label: '5. Timeline & Rundown', icon: Clock, valid: !!localPlan.timeline?.length },
    { id: 'logistik', label: '6. Checklist Logistik', icon: CheckSquare, valid: true },
    { id: 'beban', label: '7. Beban Kargo / Kru', icon: Truck, valid: true },
    { id: 'sop', label: '8. SOP Singkat Lapangan', icon: Lightbulb, valid: !!localPlan.sopBriefing },
    { id: 'safety', label: '9. Safety & Risk Mitigasi', icon: ShieldAlert, valid: !!localPlan.safetyRisks?.length },
    { id: 'scenario', label: '10. Skenario Emergency', icon: Siren, valid: !!localPlan.emergencyScenarios?.length },
    { id: 'evakuasi', label: '11. Skema Evakuasi', icon: MapPin, valid: !!localPlan.evakuasiPath },
    { id: 'kontak', label: '12. Kontak Penting', icon: Phone, valid: !!localPlan.kontakPentingList?.length },
    { id: 'planb', label: '13. Plan B & Kontingensi', icon: RefreshCw, valid: !!localPlan.planBAlternatif },
    { id: 'gunung', label: '14. Catatan Gunung', icon: Mountain, valid: !!localPlan.gunungKetinggian }
  ];

  // Shared helper to check medical or condition risk alerts
  const hasRiskAlert = (p: Participant) => {
    const med = (p.kondisiKhusus || p.riwayatPenyakit || '').toLowerCase();
    return med.includes('asma') || med.includes('hipertensi') || med.includes('maag') || med.includes('cedera') || med.includes('vertigo') || med.includes('hipotermia') || med.includes('anxiety') || med.includes('panik') || med.includes('alergi');
  };

  // Derive priority list of participants who need extra monitoring
  const priorityParticipants = useMemo(() => {
    return (localPlan.pesertaList || []).filter(p => 
      p.tingkatFisik === 'Rendah' || 
      p.pengalamanPendakian.toLowerCase().includes('belum') || 
      p.pengalamanPendakian.toLowerCase().includes('first') || 
      p.usia > 50 || 
      hasRiskAlert(p)
    );
  }, [localPlan.pesertaList]);

  // If no trip exist
  if (trips.length === 0) {
    return (
      <div className="flex-1 p-6 md:p-8 flex items-center justify-center min-h-[500px]">
        <div className="text-center max-w-md bg-white border border-slate-200 rounded-2xl p-8 space-y-4 shadow-xs">
          <Compass className="w-12 h-12 text-[#11512f] mx-auto animate-spin" />
          <h2 className="text-base font-black text-slate-800">Menghubungkan ke Database...</h2>
          <p className="text-xs text-slate-500">Mencari records trip aktif di Barengin Trip Logistik.</p>
        </div>
      </div>
    );
  }

  // Detect and flag risk warnings for participants
  const countRiskAlerts = (localPlan.pesertaList || []).reduce((sum, p) => {
    return hasRiskAlert(p) ? sum + 1 : sum;
  }, 0);

  // Auto-derived participant stats
  const totalCount = localPlan.pesertaList?.length || 0;
  const highAttentionCount = priorityParticipants.length;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 relative pb-16">
      
      {/* COMMAND CONTROL STRIP */}
      <div className="no-print bg-white border-b border-slate-200 p-4 sticky top-12 md:top-0 z-20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="bg-emerald-50 text-[#11512f] p-2 rounded-xl border border-emerald-100">
            <Compass className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h1 className="text-sm font-black text-slate-900 uppercase tracking-tight">Perencanaan Trip</h1>
            <p className="text-[10px] text-slate-500 tracking-wider">Digital Expedition Operational Planning System</p>
          </div>
        </div>

        {/* Dynamic selector for active trips */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0">Trip Aktif:</span>
            <select
              value={selectedTripId}
              onChange={(e) => {
                setSelectedTripId(e.target.value);
                setActivePlannerSection('cover');
              }}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 w-full sm:w-60 focus:outline-none focus:border-[#11512f]"
            >
              {trips.map(t => (
                <option key={t.id} value={t.id}>
                  {t.jenisTrip} - {t.namaDestinasi} ({t.nomorTrip})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {/* Elegant Autosave Status Indicators */}
            <div className="hidden sm:flex items-center space-x-2 pr-2 border-r border-slate-200">
              {autoSaveStatus === 'synced' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                  Tersimpan otomatis
                </span>
              )}
              {autoSaveStatus === 'pending' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-55 text-amber-800 border border-amber-200 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
                  Perubahaan draf...
                </span>
              )}
              {autoSaveStatus === 'saving' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-sky-50 text-sky-700 border border-sky-100 animate-bounce">
                  <RefreshCw className="w-2.5 h-2.5 mr-1 animate-spin text-sky-500" />
                  Menyimpan...
                </span>
              )}
              {autoSaveStatus === 'error' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span>
                  Gagal Sinkronisasi
                </span>
              )}
            </div>

            <button
              onClick={() => handleSavePlanner()}
              disabled={isSaving || !activeTrip?.perencanaan}
              className={`px-3 py-1.5 flex items-center justify-center space-x-1 border border-emerald-200 text-[#11512f] bg-emerald-50 rounded-lg text-xs font-bold cursor-pointer hover:bg-emerald-100 transition ${(isSaving || !activeTrip?.perencanaan) ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Simpan perubahan perencanaan ini ke cloud Firestore"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Draf'}</span>
            </button>

            <button
              onClick={handleDownloadRopPdf}
              disabled={!activeTrip?.perencanaan}
              className={`px-3 py-1.5 bg-[#11512f] hover:bg-emerald-900 border-0 text-white rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1 cursor-pointer shadow-subtle ${!activeTrip?.perencanaan ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak ROP PDF</span>
            </button>
          </div>
        </div>
      </div>

      {activeTrip && !activeTrip.perencanaan ? (
        
        /* STATE 1: INITIAL UNGENERATED PLANNED DRAFT BLOCK */
        <div className="p-6 md:p-12 flex-1 flex flex-col items-center justify-center text-center">
          <div className="max-w-xl bg-white border border-slate-200 rounded-3xl p-8 space-y-6 shadow-sm">
            <div className="w-16 h-16 bg-amber-50 text-[#11512f] border border-emerald-100 rounded-full flex items-center justify-center mx-auto shadow-inner animate-pulse">
              <Compass className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#11512f] uppercase bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                Sistem Pemicu Otomatis ROP
              </span>
              <h2 className="text-lg font-black text-slate-800">
                Data Perencanaan ROP Belum Terkonfigurasi
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                Rencana Operasional Lapangan (Run of Program) untuk trip menakjubkan ini (<strong>Gunung {activeTrip.namaDestinasi} via {activeTrip.jalurPendakian || '-'}</strong>) belum disusun.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2 text-[11px] leading-relaxed">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                🚀 Manfaat Sistem Perencanaan Logistik Lapangan:
              </h4>
              <ul className="list-disc leading-normal pl-4 text-slate-600 space-y-1">
                <li>Sinkron otomatis pembagian tugas kru, beban kargo barang bawaan, dan daftar logistik terpakai.</li>
                <li>Rangkuman monitoring medis &amp; tingkat fisik peserta pendakian gunung.</li>
                <li>Mitigasi skenario darurat lapangan khusus dan SOP standardisasi ekspedisi outdoor.</li>
                <li>Ekspor output berupa lembaran ROP PDF formal taktis siap cetak.</li>
              </ul>
            </div>

            <button
              onClick={handleGeneratePlanDraft}
              className="px-6 py-3 bg-[#11512f] hover:bg-emerald-900 border-0 rounded-2xl text-xs font-black text-white uppercase tracking-wider transition-all duration-300 transform active:scale-95 shadow-md flex items-center justify-center space-x-2 mx-auto cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 animate-spin-slow" />
              <span>Buat Draft Operational Planning ROP</span>
            </button>
          </div>
        </div>
      ) : (

        /* STATE 2: INTERACTIVE DUAL COLUMN PLANNED FIELD COMMAND ENGINE */
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-y-auto">
          
          {/* STEPPER INTERNAL NAVIGATION MENU (LEFT) */}
          <div className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-250 shrink-0 md:overflow-y-auto p-4 space-y-2">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-3">Sections Operasional</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-1 gap-1">
              {plannerSteps.map(step => {
                const isSelected = activePlannerSection === step.id;
                const Icon = step.icon;
                return (
                  <button
                    key={step.id}
                    onClick={() => setActivePlannerSection(step.id)}
                    className={`flex items-center text-left space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition cursor-pointer border ${isSelected ? 'bg-gradient-to-r from-emerald-50 to-white text-[#11512f] border-emerald-200 shadow-3xs font-bold pl-4' : 'text-slate-600 border-transparent hover:bg-slate-100 hover:text-slate-900'}`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#11512f]' : 'text-slate-400'}`} />
                    <span className="truncate">{step.label}</span>
                    {step.valid && (
                      <span className="ml-auto text-emerald-600 font-bold text-[9px] shrink-0 font-mono">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* Quick Summary of stats inside sidebar */}
            <div className="p-3.5 bg-emerald-50/40 border border-emerald-100/80 rounded-2xl space-y-2.5 mt-6 hidden md:block">
              <span className="text-[9px] font-mono tracking-widest uppercase font-black text-[#11512f] block leading-none">Command Stats</span>
              <div className="space-y-1.5 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Jumlah Peserta:</span>
                  <span className="font-extrabold text-slate-800">{totalCount} orang</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Kebutuhan Ekstra:</span>
                  <span className="font-extrabold text-rose-700">{highAttentionCount} orang</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pernyataan Medis:</span>
                  <span className="font-extrabold text-rose-600">{countRiskAlerts} alerts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Kru Operasional:</span>
                  <span className="font-extrabold text-slate-800">{activeTrip?.crew?.length || 0} personel</span>
                </div>
              </div>
            </div>
          </div>

          {/* DYNAMIC FORM WORKSPACE RENDER PANEL (RIGHT) */}
          <div className="flex-1 p-4 md:p-6 md:overflow-y-auto space-y-6">

            {/* SECTION 1: COVER HEADER DESIGN */}
            {activePlannerSection === 'cover' && (
              <div className="bg-white border rounded-2xl p-5 md:p-6 space-y-6">
                <div className="border-b pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase">1. Cover ROP &amp; Subtitle</h3>
                    <p className="text-[10px] text-slate-400">Atur teks muka depan dokumen operasional ekspedisi</p>
                  </div>
                  <Smartphone className="w-5 h-5 text-[#11512f]" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Edits */}
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 uppercase font-black">Judul Dokumen (Cover Title)</label>
                      <input
                        type="text"
                        value={localPlan.coverTitle || ''}
                        onChange={(e) => updateLocalPlan('coverTitle', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-xs font-bold text-slate-800 focus:outline-[#11512f] bg-slate-50"
                        placeholder="RUN OF PROGRAM"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 uppercase font-black">Sub-Judul Dokumen (Cover Subtitle)</label>
                      <textarea
                        rows={2}
                        value={localPlan.coverSubtitle || ''}
                        onChange={(e) => updateLocalPlan('coverSubtitle', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-xs font-bold text-slate-800 focus:outline-[#11512f] bg-slate-50"
                        placeholder="OPEN TRIP NO. XXX PENDAKIAN GUNUNG"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 uppercase font-black">Durasi Kegiatan Lapangan</label>
                      <input
                        type="text"
                        value={localPlan.durasiTrip || ''}
                        onChange={(e) => updateLocalPlan('durasiTrip', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-xs font-bold text-slate-800 focus:outline-[#11512f] bg-slate-50"
                        placeholder="2 Hari 1 Malam"
                      />
                    </div>
                  </div>

                  {/* Aesthetic Visual Cover Preview mockup */}
                  <div className="border border-slate-200 rounded-2xl p-4 bg-[#faf9f6] text-center space-y-4 shadow-sm flex flex-col justify-between max-w-sm mx-auto w-full min-h-[320px]">
                    <div className="space-y-1 pt-2">
                      <h4 className="text-xs font-black text-[#11512f] font-sans tracking-widest uppercase">{localPlan.coverTitle || 'RUN OF PROGRAM'}</h4>
                      <p className="text-[7.5px] text-slate-500 font-mono font-bold tracking-tight bg-emerald-50 px-2 py-0.5 rounded-full inline-block border border-emerald-200 max-w-full truncate">{localPlan.coverSubtitle || 'SUBTITLE PREVIEW'}</p>
                    </div>
                    <div className="py-1">
                      <img 
                        src="https://docs.google.com/uc?export=download&id=1u2IZPXPerRN5sEJME9G8Quxkq791_52n" 
                        alt="Barengintrip Logo" 
                        className="h-28 mx-auto object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="text-[7px] text-slate-400 font-mono font-medium uppercase leading-none pb-1.5 border-t pt-1.5 border-slate-200">
                      PT. BARENGIN TRIP OPERATIONAL
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 2: OPERATIONAL INFO */}
            {activePlannerSection === 'info' && (
              <div className="bg-white border rounded-2xl p-5 md:p-6 space-y-6">
                <div className="border-b pb-3">
                  <h3 className="text-sm font-black text-slate-800 uppercase">2. Informasi Operasional Trip</h3>
                  <p className="text-[10px] text-slate-400">Parameter mendasar logistik keberangkatan dan kendaraan pendukung</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-1 sm:col-span-2">
                    <label className="text-[10px] text-slate-500 uppercase font-black">Titik Kumpul Keberangkatan (Meeting Point)</label>
                    <input
                      type="text"
                      value={localPlan.meetingPoint || ''}
                      onChange={(e) => updateLocalPlan('meetingPoint', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-xs font-bold text-slate-800 focus:outline-[#11512f] bg-slate-50"
                      placeholder="Basecamp BARENGIN TRIP, JKT"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 uppercase font-black">Armada Pengantar / Mobil</label>
                    <input
                      type="text"
                      value={localPlan.armada || ''}
                      onChange={(e) => updateLocalPlan('armada', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-xs font-bold text-slate-800 focus:outline-[#11512f] bg-slate-50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 uppercase font-black">Driver Kendaraan</label>
                    <input
                      type="text"
                      value={localPlan.driver || ''}
                      onChange={(e) => updateLocalPlan('driver', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-xs font-bold text-slate-800 focus:outline-[#11512f] bg-slate-50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 uppercase font-black">Estimasi Cuaca (BMKG Lapangan)</label>
                    <input
                      type="text"
                      value={localPlan.estimasiCuaca || ''}
                      onChange={(e) => updateLocalPlan('estimasiCuaca', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-xs font-bold text-slate-800 focus:outline-[#11512f] bg-slate-50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 uppercase font-black">Status Keaktifan/Kelayakan Gunung</label>
                    <input
                      type="text"
                      value={localPlan.statusGunung || ''}
                      onChange={(e) => updateLocalPlan('statusGunung', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-xs font-bold text-[#11512f] focus:outline-[#11512f] bg-slate-50"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 3: DATA PESERTA (POMS) */}
            {activePlannerSection === 'peserta' && (
              <div className="bg-white border rounded-2xl p-5 md:p-6 space-y-6">
                <div className="border-b pb-3">
                  <h3 className="text-sm font-black text-slate-800 uppercase">3. Operational Participant Monitoring System (POMS)</h3>
                  <p className="text-[10px] text-slate-400">Review profil medis, riwayat tracking fisik, obat pribadi, dan trigger risk alert peserta</p>
                </div>

                {/* ALERT HIGHLIGHT CARDS FOR HIGH RISK PRIORITIES */}
                {priorityParticipants.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black text-rose-700 uppercase tracking-widest flex items-center">
                      <AlertCircle className="w-4 h-4 text-rose-600 mr-1.5 animate-pulse" />
                      <span>Peserta Butuh Perhatian Khusus Lapangan ({priorityParticipants.length})</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {priorityParticipants.map(p => {
                        const hasAlert = hasRiskAlert(p);
                        return (
                          <div key={p.id} className="p-3.5 bg-red-50/60 border border-red-200 rounded-xl space-y-2 text-[10.5px]">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-slate-900">{p.namaLengkap}</span>
                              <span className="text-[8px] bg-red-600 text-white font-black px-1.5 py-0.5 rounded uppercase">CRITICAL</span>
                            </div>
                            <div className="text-[9.5px] text-slate-700 space-y-1">
                              {p.tingkatFisik === 'Rendah' && <p>🚨 Fisik: <span className="font-bold text-red-700 uppercase">RENDAH (Pacing depan)</span></p>}
                              {p.usia > 50 && <p>👴 Usia: <span className="font-bold text-rose-800 font-mono">{p.usia} Tahun</span></p>}
                              {hasAlert && <p>⚠️ Alert Medis: <span className="font-bold text-red-700 bg-red-100/80 px-1 py-0.5 rounded text-[8.5px] block mt-0.5 leading-none">{p.kondisiKhusus}</span></p>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* RESPONSIVE TABLE FOR PARTICIPANTS */}
                <div className="overflow-x-auto border rounded-xl">
                  <table className="w-full text-[10px] text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b text-slate-800 font-bold uppercase text-[9px]">
                        <th className="p-2.5 text-center w-8">No</th>
                        <th className="p-2.5">Nama &amp; Kontak</th>
                        <th className="p-2.5">Fisik</th>
                        <th className="p-2.5">Kondisi Khusus / Riwayat</th>
                        <th className="p-2.5">Status Hadir</th>
                        <th className="p-2.5">Catatan Operasional</th>
                        <th className="p-2.5 text-center w-12">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(localPlan.pesertaList || []).map((p, idx) => {
                        const alertMed = hasRiskAlert(p);
                        const badgeColor = p.tingkatFisik === 'Tinggi' ? 'bg-emerald-100 text-emerald-800 border-emerald-305' :
                                           p.tingkatFisik === 'Sedang' ? 'bg-amber-100 text-amber-800 border-amber-305' :
                                           'bg-rose-100 text-rose-800 border-rose-300';
                        return (
                          <tr key={p.id} className="border-b last:border-0 hover:bg-slate-50 pb-2">
                            <td className="p-2.5 text-center font-mono font-bold text-slate-400">{idx + 1}</td>
                            <td className="p-2.5">
                              <div className="font-black text-slate-900">{p.namaLengkap}</div>
                              <div className="text-[8.5px] text-slate-500 font-medium">Usia: {p.usia} &middot; {p.gender}</div>
                              <div className="flex gap-2 mt-1">
                                <a href={`https://wa.me/${p.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="text-[8px] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-1 py-0.5 rounded transition inline-flex items-center gap-0.5">
                                  <Smartphone className="w-2.5 h-2.5 text-emerald-600" />
                                  <span>WhatsApp</span>
                                </a>
                              </div>
                            </td>
                            <td className="p-2.5">
                              <span className="px-1.5 py-0.5 border text-[8px] font-black rounded uppercase inline-block mb-1 text-center leading-none ${badgeColor}">
                                {p.tingkatFisik}
                              </span>
                              <div className="text-[8.5px] text-slate-500 font-semibold">{p.pengalamanPendakian}</div>
                            </td>
                            <td className="p-2.5">
                              {alertMed && (
                                <span className="px-1 py-0.5 bg-red-100 text-red-800 rounded font-black text-[7.5px] block border border-red-200 uppercase w-max tracking-wider mb-1">
                                  ⚠️ RAWAN MEDIS
                                </span>
                              )}
                              <div className="text-slate-850 font-medium">{p.kondisiKhusus || p.riwayatPenyakit || '-'}</div>
                            </td>
                            <td className="p-2.5">
                              <select
                                value={p.statusKehadiran}
                                onChange={(e) => handleUpdateParticipantPresence(p.id, e.target.value as any)}
                                className={`px-1.5 py-0.5 rounded border text-[9px] font-black w-max ${p.statusKehadiran === 'Hadir' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : p.statusKehadiran === 'Bermasalah' ? 'bg-rose-50 text-rose-800 border-rose-300 animate-pulse' : 'bg-slate-100 text-slate-600 border-slate-300'}`}
                              >
                                <option value="Belum Hadir">Belum Hadir</option>
                                <option value="Hadir">Sudah Hadir</option>
                                <option value="Bermasalah">Bermasalah</option>
                              </select>
                            </td>
                            <td className="p-2.5 text-slate-500 italic max-w-xs truncate">{p.catatanKru || '-'}</td>
                            <td className="p-2.5 text-center">
                              <button
                                onClick={() => handleRemoveParticipant(p.id)}
                                className="p-1 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded border border-rose-200 cursor-pointer"
                                title="Hapus Peserta"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {(localPlan.pesertaList || []).length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-6 text-center text-slate-400 italic">Belum ada peserta terdaftar. Tambahkan di bawah.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* ADD PARTICIPANT SUB-FORM */}
                <div className="bg-slate-50 border rounded-xl p-4 space-y-4">
                  <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-1">
                    <UserPlus className="w-4 h-4 text-[#11512f]" />
                    <span>Tambah Peserta Baru Secara Cepat</span>
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="space-y-1 col-span-2">
                      <label className="text-[8.5px] text-slate-400 font-bold uppercase block">Nama Lengkap</label>
                      <input
                        type="text"
                        value={newParticipant.namaLengkap || ''}
                        onChange={(e) => setNewParticipant({ ...newParticipant, namaLengkap: e.target.value })}
                        className="w-full px-2 py-1.5 border rounded-lg text-xs"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="text-[8.5px] text-slate-400 font-bold uppercase block">Gender</label>
                      <select
                        value={newParticipant.gender || 'Pria'}
                        onChange={(e) => setNewParticipant({ ...newParticipant, gender: e.target.value as any })}
                        className="w-full px-2 py-1.5 border rounded-lg text-xs"
                      >
                        <option value="Pria">Pria</option>
                        <option value="Wanita">Wanita</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[8.5px] text-slate-400 font-bold uppercase block">Usia (Tahun)</label>
                      <input
                        type="number"
                        value={newParticipant.usia || 25}
                        onChange={(e) => setNewParticipant({ ...newParticipant, usia: Number(e.target.value) || 25 })}
                        className="w-full px-2 py-1.5 border rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[8.5px] text-slate-400 font-bold uppercase block">Tingkat Fisik</label>
                      <select
                        value={newParticipant.tingkatFisik || 'Sedang'}
                        onChange={(e) => setNewParticipant({ ...newParticipant, tingkatFisik: e.target.value as any })}
                        className="w-full px-2 py-1.5 border rounded-lg text-xs"
                      >
                        <option value="Tinggi">Tinggi</option>
                        <option value="Sedang">Sedang</option>
                        <option value="Rendah">Rendah</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[8.5px] text-slate-400 font-bold uppercase block">WhatsApp No</label>
                      <input
                        type="text"
                        value={newParticipant.whatsapp || ''}
                        onChange={(e) => setNewParticipant({ ...newParticipant, whatsapp: e.target.value })}
                        className="w-full px-2 py-1.5 border rounded-lg text-xs"
                        placeholder="081xxxxx"
                      />
                    </div>
                    <div>
                      <label className="text-[8.5px] text-slate-400 font-bold uppercase block">Emergency No</label>
                      <input
                        type="text"
                        value={newParticipant.daruratNo || ''}
                        onChange={(e) => setNewParticipant({ ...newParticipant, daruratNo: e.target.value })}
                        className="w-full px-2 py-1.5 border rounded-lg text-xs"
                        placeholder="081xxxxx"
                      />
                    </div>
                    <div>
                      <label className="text-[8.5px] text-slate-400 font-bold uppercase block">Meeting Point</label>
                      <input
                        type="text"
                        value={newParticipant.meetingPoint || ''}
                        onChange={(e) => setNewParticipant({ ...newParticipant, meetingPoint: e.target.value })}
                        className="w-full px-2 py-1.5 border rounded-lg text-xs"
                        placeholder="Semanggi"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[8.5px] text-slate-400 font-bold uppercase block">Riwayat Penyakit / Alergi / Kondisi Khusus</label>
                      <input
                        type="text"
                        value={newParticipant.kondisiKhusus || ''}
                        onChange={(e) => setNewParticipant({ ...newParticipant, kondisiKhusus: e.target.value })}
                        className="w-full px-2 py-1.5 border rounded-lg text-xs"
                        placeholder="Asma, Vertigo, dsb."
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[8.5px] text-slate-400 font-bold uppercase block">Pengalaman Gunung / Alat Kritis</label>
                      <input
                        type="text"
                        value={newParticipant.pengalamanPendakian || ''}
                        onChange={(e) => setNewParticipant({ ...newParticipant, pengalamanPendakian: e.target.value })}
                        className="w-full px-2 py-1.5 border rounded-lg text-xs"
                        placeholder="Belum pernah / First Timer"
                      />
                    </div>
                    <div className="col-span-4">
                      <label className="text-[8.5px] text-slate-400 font-bold uppercase block">Catatan Tambahan Kepada Kru Lapangan</label>
                      <textarea
                        rows={1}
                        value={newParticipant.catatanKru || ''}
                        onChange={(e) => setNewParticipant({ ...newParticipant, catatanKru: e.target.value })}
                        className="w-full px-2 py-1.5 border rounded-lg text-xs"
                        placeholder="Tempatkan dekat porter"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddParticipant}
                    className="px-4 py-2 bg-[#11512f] text-white rounded-lg text-xs font-bold hover:bg-emerald-900 transition flex items-center gap-1 mx-auto cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambahkan Peserta</span>
                  </button>
                </div>
              </div>
            )}

            {/* SECTION 4: STRUKTUR OPERASIONAL TIM KRU */}
            {activePlannerSection === 'tim' && (
              <div className="bg-white border rounded-2xl p-5 md:p-6 space-y-6">
                <div className="border-b pb-3">
                  <h3 className="text-sm font-black text-slate-800 uppercase">4. Struktur Tim Kru Lapangan</h3>
                  <p className="text-[10px] text-slate-400">Distribusikan tugas penting pendampingan kepada Tour Leader, Assistant Guide, Sweeper, Porter, dsb.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(localPlan.timStruktur || []).map((t) => {
                    return (
                      <div key={t.id} className="p-4 bg-slate-50 border rounded-xl space-y-3">
                        <div className="flex items-center justify-between border-b pb-2">
                          <div>
                            <span className="text-[8.5px] font-black text-slate-400 uppercase leading-none block">NAMA INDIVIDU</span>
                            <span className="font-extrabold text-[#11512f] text-xs block mt-0.5">{t.namaKru}</span>
                          </div>
                          <div>
                            <span className="text-[8.5px] font-black text-slate-400 uppercase leading-none block">Role Trip</span>
                            <span className="text-[9.5px] px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-bold uppercase inline-block mt-0.5">{t.posisi || 'Crew'}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1 col-span-2">
                            <label className="text-[8.5px] text-slate-450 uppercase font-black">Role ROP (Pembagian Tugas Lapangan)</label>
                            <select
                              value={t.role}
                              onChange={(e) => handleUpdateCrewRole(t.id, { role: e.target.value as any })}
                              className="w-full px-2 py-1 bg-white border rounded text-xs text-slate-800 focus:outline-[#11512f]"
                            >
                              <option value="Navigator">Navigator / Front Guide</option>
                              <option value="Sweeper">Sweeper / Rear Guide</option>
                              <option value="Dokumentasi">Dokumentasi Tim</option>
                              <option value="Porter Barengin">Porter Internal Barengin</option>
                              <option value="Porter Lokal">Porter Lokal Lapangan</option>
                            </select>
                          </div>
                          <div className="space-y-1 col-span-2">
                            <label className="text-[8.5px] text-slate-450 uppercase font-black">Spesifikasi Tanggung Jawab Operasional</label>
                            <textarea
                              rows={2}
                              value={t.tanggungJawab}
                              onChange={(e) => handleUpdateCrewRole(t.id, { tanggungJawab: e.target.value })}
                              className="w-full px-2 py-1.5 bg-white border rounded text-xs text-slate-800 focus:outline-[#11512f]"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {(localPlan.timStruktur || []).length === 0 && (
                    <div className="col-span-2 p-6 text-center text-slate-400 italic">Silakan generate perencanaan tim di draf utama terlebih dahulu.</div>
                  )}
                </div>
              </div>
            )}

            {/* SECTION 5: TIMELINE & RUNDOWN */}
            {activePlannerSection === 'timeline' && (
              <div className="bg-white border rounded-2xl p-5 md:p-6 space-y-6">
                <div className="border-b pb-3">
                  <h3 className="text-sm font-black text-slate-800 uppercase">5. Timeline dan Rundown Operasional</h3>
                  <p className="text-[10px] text-slate-405">Penjadwalan aktivitas briefing, waktu mulai mendaki, breakpoint makan, campsite, dan summit attack</p>
                </div>

                <div className="overflow-x-auto border rounded-xl">
                  <table className="w-full text-[10px] text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b text-slate-800 font-bold uppercase text-[9px]">
                        <th className="p-2 w-8 text-center">No</th>
                        <th className="p-2 w-28">Jam / Waktu</th>
                        <th className="p-2">Aktivitas Kegiatan</th>
                        <th className="p-2">Sektor / Lokasi</th>
                        <th className="p-2 w-24">PIC</th>
                        <th className="p-2">Uraian Catatan Ringkas</th>
                        <th className="p-2 w-10 text-center">Hapus</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(localPlan.timeline || []).map((t, idx) => {
                        return (
                          <tr key={t.id} className="border-b last:border-0 hover:bg-slate-50 text-[9.5px]">
                            <td className="p-2 text-center font-mono font-bold text-slate-400">{idx + 1}</td>
                            <td className="p-2 font-mono font-bold text-[#11512f]">{t.jam}</td>
                            <td className="p-2 font-black text-slate-800">{t.aktivitas}</td>
                            <td className="p-2 font-medium">{t.lokasi}</td>
                            <td className="p-2 font-bold text-slate-700">{t.pic}</td>
                            <td className="p-2 text-slate-500 italic max-w-xs truncate">{t.catatan || '-'}</td>
                            <td className="p-2 text-center">
                              <button
                                onClick={() => handleRemoveTimeline(t.id)}
                                className="p-1 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded cursor-pointer border border-rose-100"
                              >
                                <Trash2 className="w-3" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {(localPlan.timeline || []).length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-6 text-center text-slate-404 italic">Belum ada rundown terjadwal.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* ADD TIMELINE ROW SUB-FORM */}
                <div className="p-4 bg-slate-50 rounded-xl space-y-3 flex flex-wrap gap-3 items-end text-xs">
                  <div className="flex-1 min-w-[120px]">
                    <label className="text-[8.5px] text-slate-400 font-bold uppercase block mb-1">Jam / Waktu</label>
                    <input
                      type="text"
                      value={newTimeline.jam || ''}
                      onChange={(e) => setNewTimeline({ ...newTimeline, jam: e.target.value })}
                      className="px-2 py-1.5 border bg-white rounded-lg w-full text-xs font-bold"
                      placeholder="05.00 - 06.00"
                    />
                  </div>
                  <div className="flex-[2] min-w-[160px]">
                    <label className="text-[8.5px] text-slate-400 font-bold uppercase block mb-1">Aktivitas</label>
                    <input
                      type="text"
                      value={newTimeline.aktivitas || ''}
                      onChange={(e) => setNewTimeline({ ...newTimeline, aktivitas: e.target.value })}
                      className="px-2 py-1.5 border bg-white rounded-lg w-full text-xs font-bold"
                      placeholder="Registrasi & do'a"
                    />
                  </div>
                  <div className="flex-1 min-w-[120px]">
                    <label className="text-[8.5px] text-slate-400 font-bold uppercase block mb-1">Lokasi</label>
                    <input
                      type="text"
                      value={newTimeline.lokasi || ''}
                      onChange={(e) => setNewTimeline({ ...newTimeline, lokasi: e.target.value })}
                      className="px-2 py-1.5 border bg-white rounded-lg w-full text-xs font-bold"
                      placeholder="Meeting point"
                    />
                  </div>
                  <div className="w-28">
                    <label className="text-[8.5px] text-slate-400 font-bold uppercase block mb-1">P.I.C</label>
                    <input
                      type="text"
                      value={newTimeline.pic || ''}
                      onChange={(e) => setNewTimeline({ ...newTimeline, pic: e.target.value })}
                      className="px-2 py-1.5 border bg-white rounded-lg w-full text-xs font-bold"
                      placeholder="Tour Leader"
                    />
                  </div>
                  <div className="flex-[2] min-w-[160px]">
                    <label className="text-[8.5px] text-slate-400 font-bold uppercase block mb-1">Catatan</label>
                    <input
                      type="text"
                      value={newTimeline.catatan || ''}
                      onChange={(e) => setNewTimeline({ ...newTimeline, catatan: e.target.value })}
                      className="px-2 py-1.5 border bg-white rounded-lg w-full text-xs"
                      placeholder="Verifikasi fisik"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTimeline}
                    className="px-4 py-2 bg-[#11512f] text-white rounded-lg font-bold text-xs hover:bg-emerald-900 cursor-pointer"
                  >
                    Tambah
                  </button>
                </div>
              </div>
            )}

            {/* SECTION 6: CHECKLIST LOGISTIK AUTO SINKRON */}
            {activePlannerSection === 'logistik' && (
              <div className="bg-white border rounded-2xl p-5 md:p-6 space-y-6">
                <div className="border-b pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase">6. Checklist Logistik / Kebutuhan Alat</h3>
                    <p className="text-[10px] text-slate-400">Data otomatis disinkronkan dari draf pemakaian barang logistik terpilih</p>
                  </div>
                  <span className="text-[8px] bg-emerald-50 text-emerald-800 font-black border border-emerald-200 px-2 py-0.5 rounded uppercase">Synced</span>
                </div>

                <div className="overflow-x-auto border rounded-xl">
                  <table className="w-full text-[10.5px] text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b text-slate-800 font-bold uppercase text-[9px]">
                        <th className="p-2.5 w-8 text-center">No</th>
                        <th className="p-2.5">Nama Barang Logistik Tim</th>
                        <th className="p-2.5 text-center w-24">Jumlah Digunakan</th>
                        <th className="p-2.5 text-center w-28">Berat Satuan</th>
                        <th className="p-2.5 text-center w-24"> Checklist Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(activeTrip?.plannedItems || []).map((item, idx) => {
                        const isChecked = !!localPlan.logistikChecklist?.[item.idBarang];
                        return (
                          <tr
                            key={item.idBarang}
                            onClick={() => handleToggleLogistikItem(item.idBarang)}
                            className={`border-b last:border-0 hover:bg-slate-50/80 cursor-pointer transition ${isChecked ? 'bg-emerald-50/20 text-emerald-900' : ''}`}
                          >
                            <td className="p-2.5 text-center font-mono font-bold text-slate-400">{idx + 1}</td>
                            <td className="p-2.5 font-bold text-slate-800">{item.namaBarang}</td>
                            <td className="p-2.5 font-mono text-center font-black text-slate-900">{item.jumlahDigunakan} unit</td>
                            <td className="p-2.5 font-mono text-center text-slate-600">{item.beratBarang || '0 kg'}</td>
                            <td className="p-2.5 text-center">
                              <span className={`inline-flex items-center justify-center w-5 h-5 border rounded-lg transition-colors ${isChecked ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-300'}`}>
                                {isChecked && <Check className="w-3.5 h-3.5" />}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      {(activeTrip?.plannedItems || []).length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-slate-400 italic">Belum ada barang di dalam daftar pemakaian barang trip ini.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SECTION 7: CARGO WEIGHT (DISTRIBUTION) */}
            {activePlannerSection === 'beban' && (
              <div className="bg-white border rounded-2xl p-5 md:p-6 space-y-6">
                <div className="border-b pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase">7. Distribusi Beban Kru &amp; Cargo Track</h3>
                    <p className="text-[10px] text-slate-400">Monitoring berat barang bawaan yang dipikul di punggung masing-masing kru</p>
                  </div>
                  <span className="text-[8px] bg-[#11512f] text-white border-0 px-2 py-0.5 rounded font-black tracking-widest uppercase">Live Payload</span>
                </div>

                <div className="overflow-x-auto border rounded-xl">
                  <table className="w-full text-[10.5px] text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b text-slate-800 font-bold uppercase text-[9px]">
                        <th className="p-2.5 w-8 text-center">No</th>
                        <th className="p-2.5 w-40">Identitas Kru Cargo Carrier</th>
                        <th className="p-2.5">Manifest Detail Muatan Pikul</th>
                        <th className="p-2.5 text-center w-28">Jumlah Bawaan</th>
                        <th className="p-2.5 text-center w-32">Total Beban</th>
                        <th className="p-2.5 text-center w-24">Batas Keamanan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeTrip?.crew.map((member, index) => {
                        const stats = crewCargoStats[member.id] || { weight: 0, count: 0, items: [] };
                        const loadPct = Math.min(100, (stats.weight / member.kapasitasBebanMax) * 100);
                        const isOver = stats.weight > member.kapasitasBebanMax;
                        return (
                          <tr key={member.id} className="border-b last:border-0 hover:bg-slate-50 leading-relaxed">
                            <td className="p-2.5 text-center font-mono font-bold text-slate-400">{index + 1}</td>
                            <td className="p-2.5">
                              <div className="font-black text-slate-900">{member.namaKru}</div>
                              <span className="text-[8px] px-1 bg-slate-100 text-slate-650 h font-black rounded uppercase tracking-wider block w-max">{member.role}</span>
                            </td>
                            <td className="p-2.5 text-slate-600 text-[9px]">
                              <div className="max-h-20 overflow-y-auto pr-1 space-y-1">
                                {stats.items.length > 0 ? (
                                  stats.items.map((it, i) => (
                                    <div key={i} className="bg-slate-50 border border-slate-150 rounded px-1.5 py-1 text-[8.5px] leading-tight flex justify-between items-center whitespace-normal break-words">
                                      <span className="font-semibold text-slate-700">{it.namaBarang}</span>
                                      <span className="font-bold text-slate-900 bg-slate-200/70 px-1 rounded ml-1 shrink-0">{it.jumlah}x</span>
                                    </div>
                                  ))
                                ) : (
                                  <span className="text-slate-400 italic block py-0.5">Kosong - nihil muatan logistik</span>
                                )}
                              </div>
                            </td>
                            <td className="p-2.5 text-center font-mono font-bold">{stats.count} item</td>
                            <td className="p-2.5 text-center font-mono font-black text-slate-900">
                              {stats.weight.toFixed(1)} kg <span className="text-[8px] text-slate-400 font-normal">/ {member.kapasitasBebanMax} kg</span>
                            </td>
                            <td className="p-2.5 text-center font-mono">
                              <div className="flex flex-col items-center justify-center text-[9px] font-black">
                                <span className={isOver ? 'text-rose-600 font-extrabold animate-pulse' : 'text-[#11512f]'}>{loadPct.toFixed(0)}%</span>
                                <div className="w-16 bg-slate-200 h-1 rounded overflow-hidden mt-1">
                                  <div className={`h-full ${isOver ? 'bg-rose-600' : 'bg-emerald-600'}`} style={{ width: `${loadPct}%` }}></div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SECTION 8: SOP SINGKAT LAPANGAN */}
            {activePlannerSection === 'sop' && (
              <div className="bg-white border rounded-2xl p-5 md:p-6 space-y-6">
                <div className="border-b pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase">8. SOP Pendakian &amp; Pacing Lapangan</h3>
                    <p className="text-[10px] text-slate-400">Tekstual standardisasi briefing, trekking, campsite, safety, dan larangan</p>
                  </div>
                  <button
                    onClick={() => {
                        const sops = getDefaultSops();
                        updateLocalPlan('sopBriefing', sops.sopBriefing);
                        updateLocalPlan('sopTrekking', sops.sopTrekking);
                        updateLocalPlan('sopCamp', sops.sopCamp);
                        updateLocalPlan('sopSafety', sops.sopSafety);
                        updateLocalPlan('sopLarangan', sops.sopLarangan);
                    }}
                    className="text-[9px] bg-slate-50 hover:bg-slate-100 text-[#11512f] border border-emerald-200 px-3 py-1 rounded-lg transition"
                  >
                    Reset standardisasi Barengin SOP
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 uppercase font-black">A. SOP Briefing &amp; Screening Sebelum Trekking</label>
                    <textarea
                      rows={4}
                      value={localPlan.sopBriefing || ''}
                      onChange={(e) => updateLocalPlan('sopBriefing', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-xs leading-relaxed font-semibold focus:outline-[#11512f] bg-slate-50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 uppercase font-black">B. SOP Pacing &amp; Trekking (Saat Mendaki)</label>
                    <textarea
                      rows={4}
                      value={localPlan.sopTrekking || ''}
                      onChange={(e) => updateLocalPlan('sopTrekking', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-xs leading-relaxed font-semibold focus:outline-[#11512f] bg-slate-50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 uppercase font-black">C. SOP Campsite &amp; Tenda Management</label>
                    <textarea
                      rows={4}
                      value={localPlan.sopCamp || ''}
                      onChange={(e) => updateLocalPlan('sopCamp', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-xs leading-relaxed font-semibold focus:outline-[#11512f] bg-slate-50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 uppercase font-black">D. Safety Talk &amp; Larangan Adat/Lingkungan</label>
                    <textarea
                      rows={4}
                      value={localPlan.sopLarangan || ''}
                      onChange={(e) => updateLocalPlan('sopLarangan', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-xs leading-relaxed text-rose-900 font-extrabold focus:outline-rose-500 bg-rose-50/10"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 9: SAFETY & RISK MANAGEMENT */}
            {activePlannerSection === 'safety' && (
              <div className="bg-white border rounded-2xl p-5 md:p-6 space-y-6">
                <div className="border-b pb-3">
                  <h3 className="text-sm font-black text-slate-800 uppercase">9. Safety &amp; Risk Management</h3>
                  <p className="text-[10px] text-slate-400">Analisis potensi bahaya (hipotermia, hujan, badai, longsor) dan taktis mitigasi tim</p>
                </div>

                <div className="overflow-x-auto border rounded-xl">
                  <table className="w-full text-[10.5px] text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b text-slate-800 font-bold uppercase text-[9px]">
                        <th className="p-2 w-8 text-center">No</th>
                        <th className="p-2 w-44">Bahaya / Potensi Risiko</th>
                        <th className="p-2 text-center w-20">Level</th>
                        <th className="p-2">Taktikal Rencana Mitigasi</th>
                        <th className="p-2">Keputusan Terakhir TL</th>
                        <th className="p-2 w-10 text-center">Hapus</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(localPlan.safetyRisks || []).map((r, idx) => {
                        return (
                          <tr key={r.id} className="border-b last:border-0 hover:bg-slate-50 leading-relaxed text-[9.5px]">
                            <td className="p-2 text-center font-mono font-bold text-slate-400">{idx + 1}</td>
                            <td className="p-2 font-extrabold text-slate-900">{r.potensiRisiko}</td>
                            <td className="p-2 text-center">
                              <span className={`px-2 py-0.5 border text-[8px] rounded font-black uppercase ${r.levelRisiko === 'Critical' ? 'bg-rose-600 text-white' : r.levelRisiko === 'High' ? 'bg-rose-100 text-rose-800 border-rose-300' : r.levelRisiko === 'Medium' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-slate-100 text-slate-600 border-slate-300'}`}>
                                {r.levelRisiko}
                              </span>
                            </td>
                            <td className="p-2 text-slate-600 font-semibold">{r.mitigasi}</td>
                            <td className="p-2 text-rose-900 font-extrabold">{r.keputusanOperasional}</td>
                            <td className="p-2 text-center">
                              <button
                                onClick={() => handleRemoveRisk(r.id)}
                                className="p-1 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded border border-rose-100 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {(localPlan.safetyRisks || []).length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-slate-400 italic">Belum mendaftarkan matriks mitigasi risiko.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* ADD RISK ITEM SUB-FORM */}
                <div className="p-4 bg-slate-50 border rounded-xl space-y-3 text-xs">
                  <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest leading-none">Pendaftaran Bahaya &amp; Risiko Terbaru</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="space-y-1 col-span-2">
                      <label className="text-[8.5px] text-slate-400 font-bold uppercase block">Potensi Risiko</label>
                      <input
                        type="text"
                        value={newRisk.potensiRisiko || ''}
                        onChange={(e) => setNewRisk({ ...newRisk, potensiRisiko: e.target.value })}
                        className="w-full px-2 py-1.5 border bg-white rounded-lg text-xs"
                        placeholder="Hujan angin badai"
                      />
                    </div>
                    <div>
                      <label className="text-[8.5px] text-slate-400 font-bold uppercase block">Level Risiko</label>
                      <select
                        value={newRisk.levelRisiko || 'Medium'}
                        onChange={(e) => setNewRisk({ ...newRisk, levelRisiko: e.target.value as any })}
                        className="w-full px-2 py-1.5 border bg-white rounded-lg text-xs"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="text-[8.5px] text-slate-400 font-bold uppercase block">Tindakan Mitigasi</label>
                      <input
                        type="text"
                        value={newRisk.mitigasi || ''}
                        onChange={(e) => setNewRisk({ ...newRisk, mitigasi: e.target.value })}
                        className="w-full px-2 py-1.5 border bg-white rounded-lg text-xs"
                        placeholder="Pakai raincoat"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[8.5px] text-slate-400 font-bold uppercase block">Keputusan TL (Action)</label>
                      <input
                        type="text"
                        value={newRisk.keputusanOperasional || ''}
                        onChange={(e) => setNewRisk({ ...newRisk, keputusanOperasional: e.target.value })}
                        className="w-full px-2 py-1.5 border bg-white rounded-lg text-xs"
                        placeholder="Hentikan di pos shelter"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddRisk}
                    className="px-4 py-2 bg-[#11512f] text-white rounded-lg text-xs font-bold hover:bg-emerald-900 mx-auto block cursor-pointer"
                  >
                    Tambah Mitigasi
                  </button>
                </div>
              </div>
            )}

            {/* SECTION 10: EMERGENCY ACTIONS SCENARIOS */}
            {activePlannerSection === 'scenario' && (
              <div className="bg-white border rounded-2xl p-5 md:p-6 space-y-6">
                <div className="border-b pb-3">
                  <h3 className="text-sm font-black text-slate-800 uppercase">10. Skenario Penyelamatan Darurat</h3>
                  <p className="text-[10px] text-slate-404">Skema alur koordinasi cepat apabila terjadi masalah kritis pada sektor rute trekking, penginapan basecamp atau kendaraan</p>
                </div>

                <div className="overflow-x-auto border rounded-xl">
                  <table className="w-full text-[10.5px] text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b text-slate-800 font-bold uppercase text-[9px]">
                        <th className="p-2 w-8 text-center">No</th>
                        <th className="p-2 w-28">Kategori Sektor</th>
                        <th className="p-2">Skenario Masalah</th>
                        <th className="p-2">Alur Tindakan Penyelamatan Tim</th>
                        <th className="p-2 w-24 text-center">P.I.C</th>
                        <th className="p-2 w-24 text-center">Kontak</th>
                        <th className="p-2 w-10 text-center font-bold">Hapus</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(localPlan.emergencyScenarios || []).map((es, idx) => {
                        return (
                          <tr key={es.id} className="border-b last:border-0 hover:bg-slate-50 leading-relaxed text-[9.5px]">
                            <td className="p-2.5 text-center font-mono font-bold text-slate-400">{idx + 1}</td>
                            <td className="p-2.5 font-bold uppercase text-[#11512f]">{es.kategori}</td>
                            <td className="p-2.5 font-extrabold text-slate-900">{es.skenario}</td>
                            <td className="p-2.5 text-slate-650 font-semibold whitespace-pre-line text-[9px]">{es.alurTindakan}</td>
                            <td className="p-2.5 font-bold text-slate-800 text-center">{es.pic}</td>
                            <td className="p-2.5 font-mono text-[9px] text-center">{es.kontakDarurat}</td>
                            <td className="p-2.5 text-center">
                              <button
                                onClick={() => handleRemoveScenario(es.id)}
                                className="p-1 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded border border-rose-101 cursor-pointer"
                              >
                                <Trash2 className="w-3" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {(localPlan.emergencyScenarios || []).length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-6 text-center text-slate-400 italic">Belum mendaftarkan skenario darurat.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* ADD SCENARIO ITEM SUB-FORM */}
                <div className="p-4 bg-slate-50 border rounded-xl space-y-3 text-xs">
                  <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest leading-none">Pendaftaran Prosedur Klorologi Baru</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[8.5px] text-slate-400 font-bold uppercase block">Kategori Sektor</label>
                      <select
                        value={newScenario.kategori || 'Trekking'}
                        onChange={(e) => setNewScenario({ ...newScenario, kategori: e.target.value as any })}
                        className="w-full px-2 py-1.5 border bg-white rounded-lg text-xs"
                      >
                        <option value="Meeting Point">Meeting Point</option>
                        <option value="Transportasi">Transportasi</option>
                        <option value="Basecamp">Basecamp</option>
                        <option value="Trekking">Trekking</option>
                        <option value="Camp Area">Camp Area</option>
                      </select>
                    </div>
                    <div className="col-span-3">
                      <label className="text-[8.5px] text-slate-400 font-bold uppercase block">Kronologis Masalah / Skenario</label>
                      <input
                        type="text"
                        value={newScenario.skenario || ''}
                        onChange={(e) => setNewScenario({ ...newScenario, skenario: e.target.value })}
                        className="w-full px-2 py-1.5 border bg-white rounded-lg text-xs font-bold"
                        placeholder="Peserta digigit ular berbisa"
                      />
                    </div>
                    <div className="col-span-4">
                      <label className="text-[8.5px] text-slate-400 font-bold uppercase block">Alur Tindakan Penyelamatan Tim</label>
                      <textarea
                        rows={2}
                        value={newScenario.alurTindakan || ''}
                        onChange={(e) => setNewScenario({ ...newScenario, alurTindakan: e.target.value })}
                        className="w-full px-2 py-1.5 border bg-white rounded-lg text-xs font-semibold"
                        placeholder="1. Ikat tumpuan luka ular... 2. Berikan serum..."
                      />
                    </div>
                    <div>
                      <label className="text-[8.5px] text-slate-400 font-bold uppercase block">P.I.C</label>
                      <input
                        type="text"
                        value={newScenario.pic || ''}
                        onChange={(e) => setNewScenario({ ...newScenario, pic: e.target.value })}
                        className="w-full px-2 py-1.5 border bg-white rounded-lg text-xs"
                        placeholder="Tour Leader"
                      />
                    </div>
                    <div>
                      <label className="text-[8.5px] text-slate-400 font-bold uppercase block">Kontak Segera</label>
                      <input
                        type="text"
                        value={newScenario.kontakDarurat || ''}
                        onChange={(e) => setNewScenario({ ...newScenario, kontakDarurat: e.target.value })}
                        className="w-full px-2 py-1.5 border bg-white rounded-lg text-xs"
                        placeholder="Instansi SAR lokal"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddScenario}
                    className="px-4 py-2 bg-[#11512f] text-white rounded-lg text-xs font-bold hover:bg-emerald-900 mx-auto block cursor-pointer"
                  >
                    Tambah Scenario
                  </button>
                </div>
              </div>
            )}

            {/* SECTION 11: SKEMA EVAKUASI */}
            {activePlannerSection === 'evakuasi' && (
              <div className="bg-white border rounded-2xl p-5 md:p-6 space-y-6">
                <div className="border-b pb-3">
                  <h3 className="text-sm font-black text-slate-800 uppercase">11. Skema Rute Evakuasi Khusus</h3>
                  <p className="text-[10px] text-slate-404">Definisikan lintasan penyelamatan medis tercepat dan titik aman pertolongan darurat</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-1 sm:col-span-2">
                    <label className="text-[10px] text-slate-500 uppercase font-black">Spisifikasi Jalur Evakuasi Darurat</label>
                    <input
                      type="text"
                      value={localPlan.evakuasiPath || ''}
                      onChange={(e) => updateLocalPlan('evakuasiPath', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-xs font-bold text-slate-800 focus:outline-[#11512f] bg-slate-50"
                      placeholder="Jalur lereng selatan via Pos 2 Bayangan menuju Puskesmas Sektor III"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 uppercase font-black">Titik Shelter Istirahat Aman</label>
                    <input
                      type="text"
                      value={localPlan.evakuasiShelter || ''}
                      onChange={(e) => updateLocalPlan('evakuasiShelter', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-xs font-bold text-slate-800 focus:outline-[#11512f] bg-slate-50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 uppercase font-black">Rumah Sakit Terdekat</label>
                    <input
                      type="text"
                      value={localPlan.evakuasiHospital || ''}
                      onChange={(e) => updateLocalPlan('evakuasiHospital', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-xs font-bold text-slate-800 focus:outline-[#11512f] bg-slate-50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 uppercase font-black">Kontak Ranger Basecamp Siaga</label>
                    <input
                      type="text"
                      value={localPlan.evakuasiRanger || ''}
                      onChange={(e) => updateLocalPlan('evakuasiRanger', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-xs font-bold text-slate-800 focus:outline-[#11512f] bg-slate-50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 uppercase font-black">Armada Penyelamatan Khusus Siaga</label>
                    <input
                      type="text"
                      value={localPlan.evakuasiTransport || ''}
                      onChange={(e) => updateLocalPlan('evakuasiTransport', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-xs font-bold text-[#11512f] focus:outline-[#11512f] bg-slate-50"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 12: KONTAK PENTING DIRECTORY */}
            {activePlannerSection === 'kontak' && (
              <div className="bg-white border rounded-2xl p-5 md:p-6 space-y-6">
                <div className="border-b pb-3">
                  <h3 className="text-sm font-black text-slate-800 uppercase">12. Alamat &amp; Telepon Direkotri Penting</h3>
                  <p className="text-[10px] text-slate-400">Kontak SAR, Basarnas, Puskesmas lereng gunung, Polsek, dan CP Operator</p>
                </div>

                <div className="overflow-x-auto border rounded-xl">
                  <table className="w-full text-[10.5px] text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b text-slate-800 font-bold uppercase text-[9px]">
                        <th className="p-2 w-8 text-center">No</th>
                        <th className="p-2 w-28">Kategori Klasifikasi</th>
                        <th className="p-2">Nama Instansi / Personel</th>
                        <th className="p-2">Nomor Telepon Siaga</th>
                        <th className="p-2">Keterangan Alamat / Posko</th>
                        <th className="p-2 w-10 text-center">Hapus</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(localPlan.kontakPentingList || []).map((c, idx) => {
                        return (
                          <tr key={c.id} className="border-b last:border-0 hover:bg-slate-50 text-[9.5px]">
                            <td className="p-2 text-center font-mono font-bold text-slate-400">{idx + 1}</td>
                            <td className="p-2 font-black text-slate-800 uppercase">{c.kategori}</td>
                            <td className="p-2 font-extrabold text-[#11512f]">{c.nama}</td>
                            <td className="p-2 font-mono font-bold font-slate-900">{c.kontak}</td>
                            <td className="p-2 text-slate-550 max-w-xs truncate">{c.alamat || '-'}</td>
                            <td className="p-2 text-center">
                              <button
                                onClick={() => handleRemoveContact(c.id)}
                                className="p-1 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded border border-rose-100 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {(localPlan.kontakPentingList || []).length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-slate-400 italic">Belum mendaftarkan direktori telepon gawat darurat.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* ADD CONTACT ITEM SUB-FORM */}
                <div className="p-4 bg-slate-50 border rounded-xl space-y-3 text-xs">
                  <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest leading-none">Pendaftaran Kontak Baru</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[8.5px] text-slate-400 font-bold uppercase block">Kategori</label>
                      <select
                        value={newContact.kategori || 'Basecamp'}
                        onChange={(e) => setNewContact({ ...newContact, kategori: e.target.value as any })}
                        className="w-full px-2 py-1.5 border bg-white rounded-lg text-xs"
                      >
                        <option value="Basecamp">Basecamp</option>
                        <option value="SAR">SAR</option>
                        <option value="Basarnas">Basarnas</option>
                        <option value="Rumah Sakit">Rumah Sakit</option>
                        <option value="Puskesmas">Puskesmas</option>
                        <option value="Polisi">Polisi</option>
                        <option value="Driver">Driver</option>
                        <option value="Contact Person">Contact Person</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="text-[8.5px] text-slate-400 font-bold uppercase block">Instansi/Personel</label>
                      <input
                        type="text"
                        value={newContact.nama || ''}
                        onChange={(e) => setNewContact({ ...newContact, nama: e.target.value })}
                        className="w-full px-2 py-1.5 border bg-white rounded-lg text-xs font-bold"
                        placeholder="Ranger Sektor 1"
                      />
                    </div>
                    <div>
                      <label className="text-[8.5px] text-slate-400 font-bold uppercase block">No Telepon</label>
                      <input
                        type="text"
                        value={newContact.kontak || ''}
                        onChange={(e) => setNewContact({ ...newContact, kontak: e.target.value })}
                        className="w-full px-2 py-1.5 border bg-white rounded-lg text-xs font-bold font-mono"
                        placeholder="081xxxxx"
                      />
                    </div>
                    <div className="col-span-4">
                      <label className="text-[8.5px] text-slate-400 font-bold uppercase block">Alamat / Koordinat Posko Posko</label>
                      <input
                        type="text"
                        value={newContact.alamat || ''}
                        onChange={(e) => setNewContact({ ...newContact, alamat: e.target.value })}
                        className="w-full px-2 py-1.5 border bg-white rounded-lg text-xs"
                        placeholder="Dusun lereng utara, kecamatan lereng"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddContact}
                    className="px-4 py-2 bg-[#11512f] text-white rounded-lg text-xs font-bold hover:bg-emerald-900 mx-auto block cursor-pointer"
                  >
                    Tambah Direktori
                  </button>
                </div>
              </div>
            )}

            {/* SECTION 13: PLAN B & CONTYNGENCY */}
            {activePlannerSection === 'planb' && (
              <div className="bg-white border rounded-2xl p-5 md:p-6 space-y-6">
                <div className="border-b pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase">13. Plan B &amp; Rencana Kontingensi</h3>
                    <p className="text-[10px] text-slate-400">Atur skema cadangan jika cuaca buruk ekstrem, kemacetan rute jalan, atau status gunung siaga mendadak</p>
                  </div>
                  <button
                    onClick={() => {
                        const defaults = getFallbackPlanTemplate();
                        updateLocalPlan('planBAlternatif', defaults.planBAlternatif);
                        updateLocalPlan('planBDelay', defaults.planBDelay);
                        updateLocalPlan('planBFallback', defaults.planBFallback);
                        updateLocalPlan('planBCuaca', defaults.planBCuaca);
                        updateLocalPlan('planBCancel', defaults.planBCancel);
                    }}
                    className="text-[9px] bg-slate-50 hover:bg-slate-100 text-[#11512f] border border-emerald-250 px-2 rounded-lg py-1 cursor-pointer"
                  >
                    Reset default Plan B
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 uppercase font-black">Garis Alih Jalur Pendakian Alternatif</label>
                    <textarea
                      rows={3}
                      value={localPlan.planBAlternatif || ''}
                      onChange={(e) => updateLocalPlan('planBAlternatif', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-xs leading-relaxed font-semibold focus:outline-[#11512f] bg-slate-50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 uppercase font-black">Skema Penanganan Keterlambatan Waktu Meeting Point (Delay)</label>
                    <textarea
                      rows={3}
                      value={localPlan.planBDelay || ''}
                      onChange={(e) => updateLocalPlan('planBDelay', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-xs leading-relaxed font-semibold focus:outline-[#11512f] bg-slate-50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 uppercase font-black">Fallback Skenario di Campsite (Saat Angin/Badai Mengganas)</label>
                    <textarea
                      rows={3}
                      value={localPlan.planBFallback || ''}
                      onChange={(e) => updateLocalPlan('planBFallback', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-xs leading-relaxed font-semibold focus:outline-[#11512f] bg-slate-50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 uppercase font-black">Skema Pembatalan Total Mendadak (Cancellation Policy Safety)</label>
                    <textarea
                      rows={3}
                      value={localPlan.planBCancel || ''}
                      onChange={(e) => updateLocalPlan('planBCancel', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-xs leading-relaxed text-rose-900 font-extrabold focus:outline-rose-550 bg-rose-50/10"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 14: MOUNTAIN NOTES */}
            {activePlannerSection === 'gunung' && (
              <div className="bg-white border rounded-2xl p-5 md:p-6 space-y-6">
                <div className="border-b pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase">14. Catatan Teknis Gunung (Mountain Notes)</h3>
                    <p className="text-[10px] text-slate-400">Arsip detail geologis, ketinggian mdpl, cuaca malam dingin, dan sumber air alami</p>
                  </div>
                  <button
                    onClick={() => {
                        const defaults = getMountainNotesTemplate();
                        updateLocalPlan('gunungKetinggian', defaults.gunungKetinggian);
                        updateLocalPlan('gunungSuhu', defaults.gunungSuhu);
                        updateLocalPlan('gunungJalur', defaults.gunungJalur);
                        updateLocalPlan('gunungSumberAir', defaults.gunungSumberAir);
                        updateLocalPlan('gunungLarangan', defaults.gunungLarangan);
                        updateLocalPlan('gunungTipsLokal', defaults.gunungTipsLokal);
                        updateLocalPlan('gunungPermit', defaults.gunungPermit);
                    }}
                    className="text-[9px] bg-slate-50 hover:bg-slate-100 text-[#11512f] border border-emerald-250 px-2 rounded px-2 rounded-lg py-1 cursor-pointer"
                  >
                    Reset default Mountain Notes
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 uppercase font-black">Ketinggian Gunung (mdpl)</label>
                    <input
                      type="text"
                      value={localPlan.gunungKetinggian || ''}
                      onChange={(e) => updateLocalPlan('gunungKetinggian', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-xs font-bold text-slate-850 focus:outline-[#11512f] bg-slate-50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 uppercase font-black">Suhu Rata-rata &amp; Extr. Dingin</label>
                    <input
                      type="text"
                      value={localPlan.gunungSuhu || ''}
                      onChange={(e) => updateLocalPlan('gunungSuhu', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-xs font-bold text-slate-850 focus:outline-[#11512f] bg-slate-50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 uppercase font-black"> Karakteristik Jalur &amp; Kemiringan</label>
                    <input
                      type="text"
                      value={localPlan.gunungJalur || ''}
                      onChange={(e) => updateLocalPlan('gunungJalur', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-xs font-bold text-slate-850 focus:outline-[#11512f] bg-slate-50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 uppercase font-black">Lokasi Sumber Air Alami Melimpah</label>
                    <input
                      type="text"
                      value={localPlan.gunungSumberAir || ''}
                      onChange={(e) => updateLocalPlan('gunungSumberAir', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-xs font-bold text-slate-850 focus:outline-[#11512f] bg-slate-50"
                    />
                  </div>

                  <div className="space-y-1.5 col-span-1 sm:col-span-2">
                    <label className="text-[10px] text-slate-500 uppercase font-black">Tips Teknis Pendakian Lokal</label>
                    <textarea
                      rows={3}
                      value={localPlan.gunungTipsLokal || ''}
                      onChange={(e) => updateLocalPlan('gunungTipsLokal', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-xs leading-relaxed font-semibold focus:outline-[#11512f] bg-slate-50"
                    />
                  </div>

                  <div className="space-y-1.5 col-span-1 sm:col-span-2">
                    <label className="text-[10px] text-slate-500 uppercase font-black">Regulasi Permit Masuk / Tiket / Simaksi</label>
                    <textarea
                      rows={3}
                      value={localPlan.gunungPermit || ''}
                      onChange={(e) => updateLocalPlan('gunungPermit', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-xs leading-relaxed font-semibold focus:outline-[#11512f] bg-slate-50"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FLOATING DIRECTORY SAVE TRIGGER BAR */}
      {activeTrip && activeTrip.perencanaan && (
        <div className="no-print fixed bottom-0 left-0 right-0 h-14 bg-[#0a311c] text-white flex items-center justify-between px-6 z-40 border-t border-emerald-950">
          <div className="flex items-center space-x-3 text-[11px]">
            <span className="inline-flex w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></span>
            <span className="font-sans font-medium text-emerald-300">Live Editor Synced with Firebase</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleSavePlanner()}
              disabled={isSaving}
              className={`px-5 py-1.5 bg-[#11512f] border border-emerald-500 border-opacity-40 hover:bg-emerald-900 font-extrabold text-[#ffffff] rounded-lg text-xs tracking-wider uppercase flex items-center justify-center space-x-1.5 cursor-pointer hover:shadow-subtle transition ${isSaving ? 'opacity-50' : ''}`}
            >
              <FileCheck2 className="w-4 h-4 text-emerald-300" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Semua Data Plan ROP'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
