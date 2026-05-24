import React, { useState, useId, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Trash,
  Check, 
  AlertTriangle, 
  DollarSign, 
  Calendar, 
  User, 
  Briefcase, 
  Tags, 
  Printer, 
  Download, 
  Eye, 
  Grid,
  Info,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  FileText
} from 'lucide-react';
import { ExpeditionTrip, ExpeditionCrew, TripMeal, TripIngredient } from '../types';

interface Props {
  activeTrip: ExpeditionTrip;
  onUpdateTrip: (trip: ExpeditionTrip) => void;
  crew: ExpeditionCrew[];
}

const CATEGORIES = [
  'Sayuran',
  'Protein',
  'Bumbu',
  'Minuman',
  'Snack',
  'Gas & Fuel',
  'Bahan Kering',
  'Frozen Food',
  'Lainnya'
] as const;

export default function TripConsumptionStep4({ activeTrip, onUpdateTrip, crew }: Props) {
  const baseId = useId();

  // Pick up or fallback meals & ingredients arrays inside our trip data
  const meals: TripMeal[] = activeTrip.meals || [];
  const ingredients: TripIngredient[] = activeTrip.ingredients || [];

  // Local Form state for Meals
  const [mealForm, setMealForm] = useState({
    type: 'Breakfast' as 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Drinks', // will map to Indonesian
    name: '',
    portions: 10,
    notes: ''
  });

  const mealTypeLabels: Record<string, string> = {
    'Breakfast': 'Sarapan',
    'Lunch': 'Makan Siang',
    'Dinner': 'Makan Malam',
    'Snack': 'Camilan / Snack',
    'Drinks': 'Kopi / Minuman'
  };

  // Local Form state for Ingredients
  const [ingForm, setIngForm] = useState({
    name: '',
    category: 'Sayuran' as any,
    qty: 1,
    unit: 'pcs',
    estimatedPrice: 10000,
    isAvailableInBasecamp: false,
    pic: crew[0]?.namaKru || 'Haikal',
    notes: ''
  });

  // Print PDF state views
  const [printDocumentType, setPrintDocumentType] = useState<'full' | 'shopping' | null>(null);

  // Auto-seed typical expedition ingredients if they are blank to delight the user
  const seedDefaultData = () => {
    const demoMeals: TripMeal[] = [
      { id: `m-1-${Date.now()}`, type: 'Makan Malam', name: 'Ayam Suwir Pedas, Tumis Kol & Teh Jahe Hangat', portions: activeTrip.crew.length || 10, notes: 'Disajikan hangat di Pos 3' },
      { id: `m-2-${Date.now()}`, type: 'Sarapan', name: 'Nasi Goreng Gila & Telur Satuan', portions: activeTrip.crew.length || 10, notes: 'Sebelum muncak / summit attack' },
      { id: `m-3-${Date.now()}`, type: 'Makan Siang', name: 'Sop Daging Kalengan & Tempe Goreng Garing', portions: activeTrip.crew.length || 10, notes: 'Setelah muncak kembali ke pos bayangan' },
      { id: `m-4-${Date.now()}`, type: 'Snack', name: 'Pisang Selimut Tepung & Bakwan Sayur Cocol Cabai', portions: activeTrip.crew.length || 10, notes: 'Sembari istirahat sore' },
      { id: `m-5-${Date.now()}`, type: 'Kopi/Minuman', name: 'Kopi Tubruk & Teh Seduh Gula Batu', portions: activeTrip.crew.length || 10, notes: 'Penjaga suhu tubuh malam hari' }
    ];

    const demoIngredients: TripIngredient[] = [
      { id: `i-1-${Date.now()}`, name: 'Beras Ciliwung Premium', category: 'Bahan Kering', qty: 5, unit: 'kg', estimatedPrice: 16000, isAvailableInBasecamp: true, pic: crew[0]?.namaKru || 'Taqiyyan', purchaseStatus: 'Sudah Bedah' as any, notes: 'Stok aman di gudang logistik' },
      { id: `i-2-${Date.now()}`, name: 'Daging Ayam Fillet Fresh', category: 'Protein', qty: 3, unit: 'kg', estimatedPrice: 42000, isAvailableInBasecamp: false, pic: crew[2]?.namaKru || 'Kiki', purchaseStatus: 'Belum Dibeli', notes: 'Beli di pasar induk pasar pagi' },
      { id: `i-3-${Date.now()}`, name: 'Gas Portable Canister 230g', category: 'Gas & Fuel', qty: 10, unit: 'canister', estimatedPrice: 23000, isAvailableInBasecamp: false, pic: crew[2]?.namaKru || 'Kiki', purchaseStatus: 'Belum Dibeli', notes: 'Harus merk Kovea/Dhaulagiri' },
      { id: `i-4-${Date.now()}`, name: 'Tempe Papan Besar', category: 'Protein', qty: 4, unit: 'papan', estimatedPrice: 8000, isAvailableInBasecamp: false, pic: crew[1]?.namaKru || 'Haikal', purchaseStatus: 'Belum Dibeli', notes: 'Potong tipis saat dimasak' },
      { id: `i-5-${Date.now()}`, name: 'Bumbu Racik Sop Sachet', category: 'Bumbu', qty: 10, unit: 'bks', estimatedPrice: 3000, isAvailableInBasecamp: true, pic: crew[1]?.namaKru || 'Haikal', purchaseStatus: 'Sudah Dibeli', notes: 'Gunakan yang praktis ekonomis' },
      { id: `i-6-${Date.now()}`, name: 'Sayur Sop Mentah Campur', category: 'Sayuran', qty: 5, unit: 'bks', estimatedPrice: 7000, isAvailableInBasecamp: false, pic: crew[0]?.namaKru || 'Taqiyyan', purchaseStatus: 'Sedang Dibeli', notes: 'Beli H-1 keberangkatan agar segar' },
      { id: `i-7-${Date.now()}`, name: 'Kopi Bubuk Gunung Merapi', category: 'Minuman', qty: 3, unit: 'bks', estimatedPrice: 15000, isAvailableInBasecamp: true, pic: crew[1]?.namaKru || 'Haikal', purchaseStatus: 'Sudah Dibeli', notes: 'Favorit pendaki malam' },
      { id: `i-8-${Date.now()}`, name: 'Minyak Goreng Sania', category: 'Bumbu', qty: 2, unit: 'liter', estimatedPrice: 18500, isAvailableInBasecamp: true, pic: crew[1]?.namaKru || 'Haikal', purchaseStatus: 'Sudah Dibeli', notes: 'Sisa stok trip 18' }
    ];

    onUpdateTrip({
      ...activeTrip,
      meals: demoMeals,
      ingredients: demoIngredients
    });
  };

  // ----------------------------------------------------
  // MEALS OPERATIONS
  // ----------------------------------------------------
  const handleAddMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealForm.name) return;

    const newMeal: TripMeal = {
      id: `m-${Date.now()}`,
      type: mealTypeLabels[mealForm.type] as any || mealForm.type,
      name: mealForm.name,
      portions: Number(mealForm.portions) || 1,
      notes: mealForm.notes
    };

    onUpdateTrip({
      ...activeTrip,
      meals: [...meals, newMeal]
    });

    setMealForm(prev => ({ ...prev, name: '', notes: '' }));
  };

  const handleRemoveMeal = (id: string) => {
    onUpdateTrip({
      ...activeTrip,
      meals: meals.filter(m => m.id !== id)
    });
  };

  // ----------------------------------------------------
  // INGREDIENTS OPERATIONS
  // ----------------------------------------------------
  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingForm.name) return;

    const newIng: TripIngredient = {
      id: `i-${Date.now()}`,
      name: ingForm.name,
      category: ingForm.category,
      qty: Number(ingForm.qty) || 1,
      unit: ingForm.unit || 'pcs',
      estimatedPrice: Number(ingForm.estimatedPrice) || 0,
      isAvailableInBasecamp: ingForm.isAvailableInBasecamp,
      pic: ingForm.pic,
      purchaseStatus: ingForm.isAvailableInBasecamp ? 'Sudah Dibeli' : 'Belum Dibeli',
      notes: ingForm.notes
    };

    onUpdateTrip({
      ...activeTrip,
      ingredients: [...ingredients, newIng]
    });

    setIngForm(prev => ({
      ...prev,
      name: '',
      qty: 1,
      notes: ''
    }));
  };

  const handleToggleBasecampStatus = (id: string) => {
    const updated = ingredients.map(ing => {
      if (ing.id === id) {
        const nextStatus = !ing.isAvailableInBasecamp;
        return {
          ...ing,
          isAvailableInBasecamp: nextStatus,
          purchaseStatus: nextStatus ? 'Sudah Dibeli' as const : 'Belum Dibeli' as const
        };
      }
      return ing;
    });

    onUpdateTrip({ ...activeTrip, ingredients: updated });
  };

  const handleUpdatePurchaseStatus = (id: string, status: TripIngredient['purchaseStatus']) => {
    const updated = ingredients.map(ing => {
      if (ing.id === id) {
        return { ...ing, purchaseStatus: status };
      }
      return ing;
    });

    onUpdateTrip({ ...activeTrip, ingredients: updated });
  };

  const handleRemoveIngredient = (id: string) => {
    onUpdateTrip({
      ...activeTrip,
      ingredients: ingredients.filter(ing => ing.id !== id)
    });
  };

  // ----------------------------------------------------
  // COST CALCULATIONS & REPORTING
  // ----------------------------------------------------
  const budgetingData = useMemo(() => {
    const totalEstimasi = ingredients.reduce((sum, item) => sum + (item.qty * item.estimatedPrice), 0);
    
    // Realisasi: sum totals of items "Sudah Dibeli" (if they are already bought)
    const totalRealisasi = ingredients.reduce((sum, item) => {
      if (item.purchaseStatus === 'Sudah Dibeli') {
        return sum + (item.qty * item.estimatedPrice);
      }
      return sum;
    }, 0);

    const selisih = totalRealisasi - totalEstimasi;

    // Expenditures category summing
    const categoryTotals: Record<string, number> = {};
    ingredients.forEach(item => {
      categoryTotals[item.category] = (categoryTotals[item.category] || 0) + (item.qty * item.estimatedPrice);
    });

    // Expenditures per PIC summing
    const picTotals: Record<string, number> = {};
    ingredients.forEach(item => {
      if (!item.isAvailableInBasecamp) {
        picTotals[item.pic] = (picTotals[item.pic] || 0) + (item.qty * item.estimatedPrice);
      }
    });

    return {
      totalEstimasi,
      totalRealisasi,
      selisih,
      categoryTotals,
      picTotals
    };
  }, [ingredients]);

  // Shopping / Harus Dibeli filtered list
  const shoppingList = useMemo(() => {
    return ingredients.filter(ing => !ing.isAvailableInBasecamp);
  }, [ingredients]);

  // Basecamp existing items filtered list
  const basecampList = useMemo(() => {
    return ingredients.filter(ing => ing.isAvailableInBasecamp);
  }, [ingredients]);

  // Formatting currency IDR
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  // PRINTING WORKFLOW POPUP TRIGGER
  const triggerPrintWindow = (docType: 'full' | 'shopping') => {
    setPrintDocumentType(docType);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <div className="space-y-6">

      {/* AUTO SEED BUTTON BANNER WHEN DATA IS TOTALLY EMPTY */}
      {meals.length === 0 && ingredients.length === 0 && (
        <div className="bg-emerald-55/65 border border-emerald-250 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <h4 className="text-sm font-black text-[#11512f] uppercase tracking-wider flex items-center">
              <span>🌟 Inisiasi Menu Perbekalan Konsumsi</span>
            </h4>
            <p className="text-slate-650 font-bold">
              Rencana konsumsi trip ini masih kosong. Anda dapat mengklik tombol di sebelah kanan untuk memuat draf perbekalan, menu, dan estimasi belanja standar lapangan dengan satu klik.
            </p>
          </div>
          <button
            type="button"
            onClick={seedDefaultData}
            className="px-5 py-3 bg-[#11512f] hover:bg-emerald-900 border-0 rounded-xl text-white font-extrabold cursor-pointer transition shadow-sm uppercase tracking-wider shrink-0 flex items-center space-x-1"
          >
            <CheckSquare className="w-4 h-4 shrink-0" />
            <span>Load Draf Konsumsi</span>
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 6 — PENGANGGARAN KONSUMSI DASHBOARD */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Estimasi Budget */}
        <div className="bg-emerald-800 text-white rounded-2xl p-4.5 border border-emerald-900 shadow-sm flex items-center space-x-4">
          <div className="w-10 h-10 rounded-full bg-emerald-900/40 flex items-center justify-center text-emerald-200">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-wider block font-bold text-emerald-300">Total Estimasi Konsumsi</span>
            <span className="text-sm sm:text-base font-mono font-black">{formatIDR(budgetingData.totalEstimasi)}</span>
          </div>
        </div>

        {/* Realisasi Belanja */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-3xs flex items-center space-x-4">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#11512f] flex items-center justify-center">
            <Check className="w-5 h-5 font-black" />
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-wider block font-bold text-slate-400">Belanja Terealisasi (Sudah Dibeli)</span>
            <span className="text-sm sm:text-base font-mono font-black text-[#11512f]">{formatIDR(budgetingData.totalRealisasi)}</span>
          </div>
        </div>

        {/* Sisa Anggaran */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-3xs flex items-center space-x-4">
          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-wider block font-bold text-slate-400">Estimasi Belanja Sisa</span>
            <span className="text-sm sm:text-base font-mono font-black text-amber-700">
              {formatIDR(budgetingData.totalEstimasi - budgetingData.totalRealisasi)}
            </span>
          </div>
        </div>
      </div>

      {/* SECONDARY ROW: PIC & CATEGORY BUDGET DISTRIBUTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
        {/* TOTAL PER PIC */}
        <div className="bg-white border border-slate-150 rounded-2xl p-4.5 shadow-3xs space-y-3">
          <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider block border-b border-slate-100 pb-1.5">Alokasi Anggaran Belanja Per PIC</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {Object.keys(budgetingData.picTotals).length > 0 ? (
              Object.entries(budgetingData.picTotals).map(([picName, total]) => (
                <div key={picName} className="p-2.5 bg-slate-50 border border-slate-150 rounded-xl leading-snug">
                  <span className="text-[9.5px] font-extrabold text-[#11512f] block truncate">{picName}</span>
                  <span className="text-[11px] font-mono font-black block text-slate-800 mt-1">{formatIDR(Number(total))}</span>
                  <span className="text-[8px] font-mono text-slate-400 block mt-0.5">Wajib dibelanjakan</span>
                </div>
              ))
            ) : (
              <div className="text-slate-400 py-4 col-span-3 text-center text-[10px]">Semua kebutuhan konsumsi disediakan dari basecamp, atau PIC belum dialokasikan.</div>
            )}
          </div>
        </div>

        {/* TOTAL PER KATEGORI */}
        <div className="bg-white border border-slate-150 rounded-2xl p-4.5 shadow-3xs space-y-3">
          <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider block border-b border-slate-100 pb-1.5">Alokasi Budget Konsumsi Berdasarkan Kategori</span>
          <div className="flex flex-wrap gap-1.5">
            {Object.keys(budgetingData.categoryTotals).length > 0 ? (
              Object.entries(budgetingData.categoryTotals).map(([cat, total]) => (
                <span key={cat} className="px-2 py-1.5 bg-emerald-50 text-[#11512f] border border-emerald-100/65 rounded-lg text-[9.5px] font-bold">
                  {cat}: <span className="font-mono font-black text-slate-800">{formatIDR(Number(total))}</span>
                </span>
              ))
            ) : (
              <div className="text-slate-400 py-4 text-center text-[10px]">Belum ada bahan baku logistik yang dimasukkan ke daftar.</div>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1 — MENU & PERENCANAAN MAKANAN */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs text-slate-705 font-bold">
        
        {/* ADD MENU MEALS COLUMN */}
        <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-2xs lg:col-span-4 h-fit space-y-4">
          <h3 className="text-xs font-black text-slate-850 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center">
            <span className="mr-2">🍽️</span>
            <span>Menu &amp; Penjadwalan Makan</span>
          </h3>

          <form onSubmit={handleAddMeal} className="space-y-4">
            <div>
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Fase Waktu Saji</label>
              <select
                value={mealForm.type}
                onChange={(e) => setMealForm(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:border-[#11512f] focus:bg-white transition"
              >
                <option value="Breakfast">Sarapan (Breakfast)</option>
                <option value="Lunch">Makan Siang (Lunch)</option>
                <option value="Dinner">Makan Malam (Dinner)</option>
                <option value="Snack">Camilan Sela (Snack)</option>
                <option value="Drinks">Kopi / Minuman Hangat</option>
              </select>
            </div>

            <div>
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nama Hidangan / Menu Makanan *</label>
              <input
                type="text"
                required
                placeholder="Contoh: Ayam Suwir & Sayur Sop"
                value={mealForm.name}
                onChange={(e) => setMealForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:border-[#11512f] focus:bg-white transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Kuantitas Porsi Saji</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={mealForm.portions}
                  onChange={(e) => setMealForm(prev => ({ ...prev, portions: Number(e.target.value) }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:border-[#11512f] focus:bg-white transition text-center"
                />
              </div>
              <div className="flex items-end text-[9.5px] text-slate-450 leading-tight">
                Porsi hidangan disesuaikan dengan kuantitas kru di lapangan.
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Catatan Operasional / Lokasi Saji</label>
              <textarea
                placeholder="Cth: Masak di Pos 3 pakai kompor besar"
                rows={2}
                value={mealForm.notes}
                onChange={(e) => setMealForm(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:border-[#11512f] transition"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-[#11512f] hover:bg-emerald-900 border-0 rounded-lg text-white font-extrabold cursor-pointer flex items-center justify-center space-x-1.5 transition text-xs shadow-sm uppercase font-sans py-2.5"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Daftarkan Menu</span>
            </button>
          </form>
        </div>

        {/* LIST DISPLAY OF MEALS LIST */}
        <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-2xs lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
            <h3 className="text-xs font-black text-slate-855 uppercase tracking-wider flex items-center">
              <span>📋 Susunan Perencanaan Menu Makanan Lapangan</span>
            </h3>
            <span className="text-[10px] bg-slate-100 border border-slate-200 px-2.5 py-1 text-slate-600 rounded-lg font-bold">
              Total {meals.length} Jadwal Makan
            </span>
          </div>

          {meals.length > 0 ? (
            <div className="space-y-3.5 divide-y divide-slate-100/60 pr-1 max-h-80 overflow-y-auto">
              {meals.map((meal, index) => (
                <div key={meal.id} className={`flex flex-col sm:flex-row sm:items-start justify-between gap-3 pt-3.5 ${index === 0 ? 'pt-y border-0 mt-0' : ''}`}>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded-md text-[8.5px] font-black uppercase text-white ${
                        meal.type === 'Sarapan' ? 'bg-emerald-700' :
                        meal.type === 'Makan Siang' ? 'bg-indigo-600' :
                        meal.type === 'Makan Malam' ? 'bg-[#0f3c23]' :
                        meal.type === 'Snack' ? 'bg-amber-600' :
                        'bg-rose-700'
                      }`}>
                        {meal.type}
                      </span>
                      <span className="font-extrabold text-[11px] text-slate-800">{meal.name}</span>
                    </div>
                    {meal.notes && (
                      <span className="text-[10px] text-slate-500 font-mono italic block bg-slate-50/50 px-2 py-1 rounded border border-slate-100">
                        💡 Catatan: {meal.notes}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-4 self-end sm:self-center shrink-0">
                    <span className="text-right text-[11px] font-extrabold text-slate-700 border-r border-slate-200 pr-3 font-mono">
                      {meal.portions} Porsi
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMeal(meal.id)}
                      className="p-1 px-1.5 text-slate-450 hover:text-rose-600 hover:bg-rose-50 border border-transparent rounded cursor-pointer transition.transform"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-slate-150 bg-slate-50/40 rounded-xl text-slate-400 space-y-2 flex flex-col items-center justify-center">
              <span>🍽️</span>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-650">Rencana Makan Kosong</span>
                <span className="text-[10px] block font-medium">Gunakan form di sebelah kiri untuk menentukan menu penyuplaian makanan selama pendakian.</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 2 — DAFTAR BAHAN BAKU */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs text-slate-705 font-bold">
        
        {/* FORM INPUT BAHAN BAKU */}
        <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-2xs lg:col-span-4 h-fit space-y-4">
          <h3 className="text-xs font-black text-slate-850 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center">
            <span className="mr-2">🥑</span>
            <span>Daftar Bahan Baku</span>
          </h3>

          <form onSubmit={handleAddIngredient} className="space-y-4">
            <div>
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nama Bahan Baku / Logistic Item *</label>
              <input
                type="text"
                required
                placeholder="Contoh: Daging Ayam Fillet / Sayur Kol"
                value={ingForm.name}
                onChange={(e) => setIngForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:border-[#11512f] focus:bg-white transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Kategori Bahan</label>
                <select
                  value={ingForm.category}
                  onChange={(e) => setIngForm(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:border-[#11512f] transition"
                >
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">PIC Pembelian</label>
                <select
                  value={ingForm.pic}
                  onChange={(e) => setIngForm(prev => ({ ...prev, pic: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:border-[#11512f] transition"
                >
                  {crew.length > 0 ? (
                    crew.map(c => <option key={c.id} value={c.namaKru}>{c.namaKru} ({c.role})</option>)
                  ) : (
                    <>
                      <option value="Haikal">Haikal</option>
                      <option value="Kiki">Kiki</option>
                      <option value="Taqiyyan">Taqiyyan</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Kuantitas</label>
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  required
                  value={ingForm.qty}
                  onChange={(e) => setIngForm(prev => ({ ...prev, qty: Number(e.target.value) }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:border-[#11512f] text-center"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Satuan</label>
                <input
                  type="text"
                  required
                  placeholder="Cth: kg / bks"
                  value={ingForm.unit}
                  onChange={(e) => setIngForm(prev => ({ ...prev, unit: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:border-[#11512f] text-center"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Est. Harga Unit</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={ingForm.estimatedPrice}
                  onChange={(e) => setIngForm(prev => ({ ...prev, estimatedPrice: Number(e.target.value) }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:border-[#11512f] text-center font-mono"
                />
              </div>
            </div>

            {/* CHECKBOX DESIGNED FOR BASECAMP AVAILABILITY STATUS */}
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center space-x-2.5">
              <input
                id={`check-basecamp-avail-${baseId}`}
                type="checkbox"
                checked={ingForm.isAvailableInBasecamp}
                onChange={(e) => setIngForm(prev => ({ ...prev, isAvailableInBasecamp: e.target.checked }))}
                className="w-4 h-4 rounded border-slate-300 text-emerald-700 bg-white focus:ring-emerald-600"
              />
              <div className="space-y-0.5 leading-none">
                <label htmlFor={`check-basecamp-avail-${baseId}`} className="text-[10.5px] font-extrabold text-slate-750 block cursor-pointer">Tersedia di Gudang Basecamp</label>
                <span className="text-[8.5px] text-slate-400 font-medium block">Centang apabila barang ini gratis karena stok inventory sisa ada.</span>
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Catatan Tambahan Belanja</label>
              <input
                type="text"
                placeholder="Cth: Beli di lapak Haji Mahmud biar diskon"
                value={ingForm.notes}
                onChange={(e) => setIngForm(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:border-[#11512f]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-[#11512f] hover:bg-emerald-900 border-0 rounded-lg text-white font-extrabold cursor-pointer flex items-center justify-center space-x-1.5 transition text-xs shadow-sm uppercase font-sans py-2.5"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Daftarkan Bahan Baku</span>
            </button>
          </form>
        </div>

        {/* INGREDIENT LIST DISPLAY AREA */}
        <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-2xs lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
            <h3 className="text-xs font-black text-slate-855 uppercase tracking-wider flex items-center">
              <span>📋 Master Checklist Bahan Baku Konsumsi</span>
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-[9.5px] bg-[#11512f]/10 text-[#11512f] border border-emerald-100 px-2.5 py-1 rounded-lg font-bold">
                {ingredients.length} Bahan Logistik
              </span>
            </div>
          </div>

          {ingredients.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] leading-tight text-slate-650 font-bold">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 text-[8.5px] uppercase tracking-wider font-mono">
                    <th className="pb-2">Nama Bahan / Kategori</th>
                    <th className="pb-2 text-center">Bahan Sedia</th>
                    <th className="pb-2 text-center">Kuantitas</th>
                    <th className="pb-2 text-right">Harga Satuan</th>
                    <th className="pb-2 text-right">Total Est</th>
                    <th className="pb-2 text-center">PIC Pembelian</th>
                    <th className="pb-2 text-center">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/60">
                  {ingredients.map((ing) => (
                    <tr key={ing.id} className="hover:bg-slate-50/60">
                      <td className="py-2.5">
                        <span className="text-slate-800 font-extrabold block text-[11.5px]">{ing.name}</span>
                        <span className="text-[8px] tracking-widest uppercase font-bold text-slate-400 font-mono">{ing.category}</span>
                      </td>

                      <td className="py-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleBasecampStatus(ing.id)}
                          className={`px-2 py-1 rounded-md text-[9px] font-bold inline-block border cursor-pointer ${
                            ing.isAvailableInBasecamp 
                              ? 'bg-emerald-50 text-[#11512f] border-emerald-250/50' 
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {ing.isAvailableInBasecamp ? '✅ Stok Basecamp' : '🛒 Harus Dibeli'}
                        </button>
                      </td>

                      <td className="py-2.5 text-center font-mono text-slate-900">{ing.qty} {ing.unit}</td>

                      <td className="py-2.5 text-right font-mono text-slate-400">{formatIDR(ing.estimatedPrice)}</td>

                      <td className="py-2.5 text-right font-mono text-[#11512f] font-black">
                        {formatIDR(ing.qty * ing.estimatedPrice)}
                      </td>

                      <td className="py-2.5 text-center text-slate-700 font-serif">
                        {ing.isAvailableInBasecamp ? (
                          <span className="text-slate-400">—</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-650 rounded text-[9.5px]">
                            {ing.pic}
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveIngredient(ing.id)}
                          className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1 rounded cursor-pointer transition border border-transparent"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 border border-dashed border-slate-150 bg-slate-50/40 rounded-xl text-slate-400 space-y-2 flex flex-col items-center justify-center">
              <span>🥑</span>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-650">Bahan Baku Konsumsi Kosong</span>
                <span className="text-[10px] block font-medium">Isi kebutuhan logistik perbekalan di samping kiri.</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 4 — DAFTAR BELANJA TRIP (FILTERED OUT BASECAMP ITEMS) */}
      {/* ======================================================== */}
      <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="space-y-0.5">
            <span className="text-[8px] font-black uppercase text-rose-800 tracking-wider block font-mono">REKOMENDASI BELANJA OUTDOOR</span>
            <h3 className="text-xs font-black text-slate-855 uppercase tracking-wider flex items-center">
              <span className="mr-2">🛒</span>
              <span>Daftar Belanja Trip (Harus Dibeli)</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-medium leading-tight">
              Otomatis mendeteksi bahan yang tidak tersedia di basecamp. Ideal untuk layar handphone kru pasar.
            </p>
          </div>

          <div className="flex items-center space-x-1">
            <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] rounded-lg font-black font-mono">
              Sisa Daftar Belanja: {shoppingList.filter(s => s.purchaseStatus !== 'Sudah Dibeli').length} Barang
            </span>
          </div>
        </div>

        {shoppingList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {shoppingList.map((item) => (
              <div 
                key={item.id} 
                className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-3 transition shadow-3xs ${
                  item.purchaseStatus === 'Sudah Dibeli' 
                    ? 'bg-slate-50/55 border-slate-200 opacity-65 grayscale' 
                    : item.purchaseStatus === 'Sedang Dibeli'
                    ? 'bg-amber-50/30 border-amber-205'
                    : 'bg-white border-slate-205 hover:border-slate-350'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2 text-xs">
                    <div>
                      <span className="text-[11.5px] font-extrabold text-slate-800 block leading-tight">{item.name}</span>
                      <span className="text-[8px] tracking-wider uppercase text-slate-400 font-mono font-bold block mt-0.5">{item.category}</span>
                    </div>
                    <span className="text-[11px] font-mono font-black text-slate-700 bg-slate-100 py-0.5 px-2 rounded-md shrink-0">
                      {item.qty} {item.unit}
                    </span>
                  </div>

                  {item.notes && (
                    <p className="text-[9.5px] p-1.5 bg-slate-100 rounded text-slate-500 leading-tight italic font-mono">
                      Catatan: {item.notes}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3 text-xs bg-slate-50/30 p-2 rounded-lg">
                  <div>
                    <span className="text-[8px] text-slate-400 block uppercase font-mono tracking-wider font-extrabold">PIC &amp; Estimasi</span>
                    <span className="font-extrabold text-slate-800 text-[10px] block truncate text-[#11512f]">{item.pic}</span>
                    <span className="text-[10px] font-mono font-black text-slate-700 block mt-0.5">{formatIDR(item.qty * item.estimatedPrice)}</span>
                  </div>

                  <div className="shrink-0">
                    <select
                      value={item.purchaseStatus}
                      onChange={(e) => handleUpdatePurchaseStatus(item.id, e.target.value as any)}
                      className="px-2 py-1 bg-white border border-slate-250 rounded-md text-[9px] font-bold focus:outline-none"
                    >
                      <option value="Belum Dibeli">❌ Belum dibeli</option>
                      <option value="Sedang Dibeli">🚚 Sedang dibeli</option>
                      <option value="Sudah Dibeli">✅ Berhasil dibeli</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-slate-150 bg-slate-50/40 rounded-xl text-slate-400 flex flex-col items-center justify-center">
            <span>🛒</span>
            <span className="text-xs font-bold text-slate-650 mt-1">Daftar Belanja Bersih</span>
            <span className="text-[10px] block">Seluruh bahan logistik sudah tersedia dari stock basecamp atau belum diinputkan.</span>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* SECTION 7 — GENERATE PDF KONSUMSI BUTTON BAR */}
      {/* ======================================================== */}
      <div className="bg-slate-55 border border-slate-200 rounded-2xl p-5 shadow-3xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 font-bold text-xs select-none">
        <div className="space-y-1">
          <span className="text-[9px] font-mono uppercase text-emerald-850 tracking-wider block">CETAK MASTER &amp; SHOPPING PERBEKALAN</span>
          <h4 className="text-xs font-black text-slate-850 uppercase tracking-tight">Kompilasi &amp; Export Dokumen Ekspedisi</h4>
          <p className="text-[10px] text-slate-400 leading-tight font-medium">Unduh draf perencanaan resmi atau cetak secarik daftar belanja untuk ditaruh di genggaman porter.</p>
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end shrink-0">
          {/* Master PDF Button */}
          <button
            type="button"
            onClick={() => triggerPrintWindow('full')}
            className="px-4.5 py-2.5 bg-[#11512f] hover:bg-emerald-800 text-white border-0 rounded-xl font-black cursor-pointer transition shadow-sm flex items-center space-x-1 uppercase text-[10px]"
          >
            <Printer className="w-4 h-4 shrink-0" />
            <span>PDF 1: Master Konsumsi</span>
          </button>

          {/* Shopping PDF Button */}
          <button
            type="button"
            onClick={() => triggerPrintWindow('shopping')}
            className="px-4.5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white border-0 rounded-xl font-black cursor-pointer transition shadow-sm flex items-center space-x-1 uppercase text-[10px]"
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span>PDF 2: Lembar Pasar</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* PRINT-ONLY EMBEDDED SHEETS CONTAINER */}
      {/* ======================================================== */}
      {printDocumentType && (
        <div className="print-document-canvas hidden">
          <div className="bg-white p-8 space-y-6 text-xs text-slate-800 leading-normal" style={{ fontFamily: 'monospace, sans-serif' }}>
            
            {/* BRAND HEADER */}
            <div className="flex justify-between items-center border-b-2 border-slate-900 pb-4">
              <div>
                <h1 className="text-base font-black tracking-wider uppercase text-slate-900">PT. BARENGIN TRIP OPERASIONAL</h1>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">EXPEDITION &middot; LOGISTICS &middot; FIELD PLANNING</p>
              </div>
              <div className="text-right">
                <span className="text-[8px] bg-slate-200 border px-2 py-0.5 rounded font-black font-mono">INTERNAL USE ONLY</span>
                <p className="text-[10px] text-slate-500 font-bold mt-1">Dibuat: {new Date().toLocaleDateString('id-ID')}</p>
              </div>
            </div>

            {/* DOCUMENT TITLE */}
            <div className="space-y-1">
              {printDocumentType === 'full' ? (
                <>
                  <h2 className="text-sm font-black uppercase text-center tracking-widest bg-slate-100 py-1.5 border border-slate-350">
                    LAPORAN PERENCANAAN INDUK KONSUMSI TRIP (MASTER REPORT)
                  </h2>
                  <p className="text-[9.5px] text-center text-slate-500 italic">Berisi daftar menu makanan saji beserta semua ketersediaan bahan logistik PT BARENGIN TRIP.</p>
                </>
              ) : (
                <>
                  <h2 className="text-sm font-black uppercase text-center tracking-widest bg-slate-100 py-1.5 border border-slate-350">
                    DAFTAR BELANJA WAJIB (SHOPPING CHECKLIST DOCK)
                  </h2>
                  <p className="text-[9.5px] text-center text-slate-500 italic">Hanya menampilkan bahan logistik yang tidak tersedia di basecamp dan wajib dibeli di pasar sebelum trip berangkat.</p>
                </>
              )}
            </div>

            {/* TRIP DETAILS TABLE */}
            <div className="bg-slate-50 p-3 border border-slate-200 grid grid-cols-2 gap-4">
              <div>
                <table className="w-full text-left text-[9.5px]">
                  <tbody>
                    <tr>
                      <td className="font-bold text-slate-400 pr-2">Trip Kode</td>
                      <td className="font-black text-slate-800">: {activeTrip.id}</td>
                    </tr>
                    <tr>
                      <td className="font-bold text-slate-400 pr-2">Nama Trip</td>
                      <td className="font-black text-slate-805">: {activeTrip.jenisTrip} {activeTrip.nomorTrip}</td>
                    </tr>
                    <tr>
                      <td className="font-bold text-slate-400 pr-2">Destinasi</td>
                      <td className="font-semibold text-slate-800">: {activeTrip.namaDestinasi} ({activeTrip.jalurPendakian})</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div>
                <table className="w-full text-left text-[9.5px]">
                  <tbody>
                    <tr>
                      <td className="font-bold text-slate-400 pr-2">Garis Tanggal</td>
                      <td className="font-semibold text-slate-800">: {activeTrip.tanggalMulai} s.d {activeTrip.tanggalSelesai}</td>
                    </tr>
                    <tr>
                      <td className="font-bold text-slate-400 pr-2">Jumlah Kru</td>
                      <td className="font-mono font-black text-slate-850">: {activeTrip.crew.length} Orang Terdaftar</td>
                    </tr>
                    <tr>
                      <td className="font-bold text-slate-400 pr-2">Status Log</td>
                      <td className="font-black uppercase tracking-wider text-[#11512f]">: {activeTrip.status}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION 1: MEALS (ONLY IF MASTER) */}
            {printDocumentType === 'full' && (
              <div className="space-y-2">
                <h3 className="text-[10px] font-black uppercase text-slate-800 border-b border-slate-900 pb-1">I. PENJADWALAN MENU SAJI LAPANGAN (MEALS PLAN)</h3>
                <table className="w-full text-left text-[9.5px] border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border border-slate-350 text-[8.5px] uppercase font-bold text-slate-600 font-mono">
                      <th className="p-1 px-2 border border-slate-350">Waktu</th>
                      <th className="p-1 px-2 border border-slate-350">Nama Menu Hidangan</th>
                      <th className="p-1 px-2 border border-slate-350 text-center">Porsi</th>
                      <th className="p-1 px-2 border border-slate-350">Spesifikasi Catatan Tempat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {meals.length > 0 ? (
                      meals.map(m => (
                        <tr key={m.id} className="border border-slate-200">
                          <td className="p-1 px-2 border border-slate-200 font-black">{m.type}</td>
                          <td className="p-1 px-2 border border-slate-200 font-bold">{m.name}</td>
                          <td className="p-1 px-2 border border-slate-200 text-center font-mono font-extrabold">{m.portions}</td>
                          <td className="p-1 px-2 border border-slate-200 text-slate-500 font-mono text-[8.5px]">{m.notes || '—'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-3 text-center text-slate-400">Belum ada makanan yang didaftarkan dalam draf.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* SECTION 2: INGREDIENTS LIST */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-black uppercase text-slate-800 border-b border-slate-900 pb-1">
                {printDocumentType === 'full' 
                  ? 'II. DETAIL DAFTAR MASTER BAHAN BAKU LOGISTIK (CONSOLIDATED LOGISTICS)' 
                  : 'I. DAFTAR BAHAN LOGISTIK WAJIB DIBELI KRU (SHOPPING TABLE)'}
              </h3>

              <table className="w-full text-left text-[9.5px] border-collapse">
                <thead>
                  <tr className="bg-slate-100 border border-slate-350 text-[8.5px] uppercase font-bold text-slate-605 font-mono">
                    {printDocumentType === 'shopping' && <th className="p-1 border border-slate-350 text-center w-8">TICK</th>}
                    <th className="p-1 px-2 border border-slate-350">Nama Barang</th>
                    <th className="p-1 px-2 border border-slate-350">Kategori</th>
                    <th className="p-1 px-2 border border-slate-350 text-center">Jumlah Qty</th>
                    <th className="p-1 px-2 border border-slate-350 text-right">Est. Satuan</th>
                    <th className="p-1 px-2 border border-slate-350 text-right">Est. Total</th>
                    <th className="p-1 px-2 border border-slate-350 text-center">PIC Lapangan</th>
                    {printDocumentType === 'full' && <th className="p-1 px-2 border border-slate-350 text-center">Status Sedia</th>}
                  </tr>
                </thead>
                <tbody>
                  {(printDocumentType === 'full' ? ingredients : shoppingList).length > 0 ? (
                    (printDocumentType === 'full' ? ingredients : shoppingList).map(ing => (
                      <tr key={ing.id} className="border border-slate-200 font-semibold text-slate-750">
                        {printDocumentType === 'shopping' && (
                          <td className="p-1 border border-slate-200 text-center">
                            <div className="w-3.5 h-3.5 border-2 border-slate-900 rounded mx-auto bg-white"></div>
                          </td>
                        )}
                        <td className="p-1 px-2 border border-slate-200 font-extrabold text-slate-900">{ing.name}</td>
                        <td className="p-1 px-2 border border-slate-200 text-[8.5px] tracking-wider uppercase font-mono text-slate-400">{ing.category}</td>
                        <td className="p-1 px-2 border border-slate-200 text-center font-mono font-black text-slate-800">{ing.qty} {ing.unit}</td>
                        <td className="p-1 px-2 border border-slate-200 text-right font-mono text-slate-400">{formatIDR(ing.estimatedPrice)}</td>
                        <td className="p-1 px-2 border border-slate-200 text-right font-mono font-black text-[#11512f]">{formatIDR(ing.qty * ing.estimatedPrice)}</td>
                        <td className="p-1 px-2 border border-slate-200 text-center font-bold text-slate-700">
                          {ing.isAvailableInBasecamp ? 'Basecamp Gudang' : ing.pic}
                        </td>
                        {printDocumentType === 'full' && (
                          <td className="p-1 px-2 border border-slate-200 text-center text-[8.5px]">
                            {ing.isAvailableInBasecamp ? (
                              <span className="font-extrabold text-emerald-800 bg-emerald-50 px-1 border border-emerald-300 rounded">SEDIA DI BASECAMP</span>
                            ) : (
                              <span className="font-bold text-rose-800 bg-rose-50 px-1 border border-rose-300 rounded">HARUS BELANJA</span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={printDocumentType === 'shopping' ? 8 : 7} className="p-3 text-center text-slate-400">Belum ada kebutuhan bahan baku konsumsi yang terdaftar.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* SUMMARY COSTS OF THE DOCUMENT */}
            <div className="bg-slate-50 border border-slate-350 p-4 space-y-2">
              <h4 className="text-[10px] font-black uppercase text-slate-850">Kalkulasi Penganggaran Logistik Konsumsi Trip</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[9.5px]">
                <div>
                  <span className="text-slate-400 block font-mono">TOTAL ESTIMASI BIAYA</span>
                  <span className="text-xs font-black font-mono text-slate-900">
                    {formatIDR(printDocumentType === 'full' ? budgetingData.totalEstimasi : shoppingList.reduce((sum, item) => sum + (item.qty * item.estimatedPrice), 0))}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-mono">TOTAL BARANG HARUS BELANJA</span>
                  <span className="text-xs font-black font-mono text-slate-905">
                    {shoppingList.length} Item Bahan Baku
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-mono font-medium">BARANG TERSEDIA DI BASECAMP</span>
                  <span className="text-xs font-black font-mono text-emerald-800">
                    {basecampList.length} Item Terdistribusi
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-mono">DRAF RESMI DITERBITKAN OLEH</span>
                  <span className="text-[9.5px] font-bold text-slate-700 font-serif leading-none truncate block mt-0.5">
                    PT BARENGIN TRIP OPS
                  </span>
                </div>
              </div>
            </div>

            {/* OFF-ROAD SIGN SIGN-OFF AREAS */}
            <div className="grid grid-cols-3 gap-6 pt-12 border-t border-slate-300 text-center">
              <div className="space-y-12">
                <p className="text-[8.5px] font-bold uppercase text-slate-400 font-mono">Disiapkan Oleh (Ops Staff)</p>
                <div className="leading-none text-[9.5px]">
                  <span className="underline font-bold text-slate-900 block font-sans">......................................</span>
                  <p className="text-[8px] text-slate-400 uppercase font-mono mt-0.5">Staff Lapangan Basecamp</p>
                </div>
              </div>

              <div className="space-y-12">
                <p className="text-[8.5px] font-bold uppercase text-slate-400 font-mono">Disetujui Oleh (PIC Logistik)</p>
                <div className="leading-none text-[9.5px]">
                  <span className="underline font-bold text-slate-900 block font-sans">......................................</span>
                  <p className="text-[8px] text-slate-400 uppercase font-mono mt-0.5">KEPALA LOGISTIK UTAMA</p>
                </div>
              </div>

              <div className="space-y-12">
                <p className="text-[8.5px] font-bold uppercase text-slate-400 font-mono">Diterima Oleh (Tour Leader)</p>
                <div className="leading-none text-[9.5px]">
                  <span className="underline font-bold text-slate-900 block font-sans">......................................</span>
                  <p className="text-[8px] text-slate-400 uppercase font-mono mt-0.5">TOUR LEADER PENUGASAN</p>
                </div>
              </div>
            </div>

            {/* DUAL BUTTON BACK CONTROLS */}
            <div className="no-print pt-6 text-center space-x-3 select-none">
              <button
                type="button"
                onClick={() => setPrintDocumentType(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded cursor-pointer"
              >
                Tutup Tampilan Cetak
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-1.5 bg-[#11512f] text-white font-extrabold rounded cursor-pointer animate-bounce"
              >
                Cetak Skrin (Browser Print)
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
