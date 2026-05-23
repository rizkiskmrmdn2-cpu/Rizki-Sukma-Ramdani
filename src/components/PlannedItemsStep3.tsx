import React, { useState, useMemo, useId } from 'react';
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  Search, 
  Layers, 
  Compass, 
  Backpack, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { PlannedLogisticsItem, InventoryItem } from '../types';

interface Props {
  plannedItems: PlannedLogisticsItem[];
  inventory: InventoryItem[];
  onAddPlannedItem: (idBarang: string, qty: number) => void;
  onRemovePlannedItem: (idBarang: string) => void;
  onUpdateQty: (idBarang: string, increment: boolean) => void;
  onLoadTemplate: (templateItems: Array<{ idBarang: string; namaBarang: string; qty: number; berat: string }>) => void;
}

export default function PlannedItemsStep3({
  plannedItems,
  inventory,
  onAddPlannedItem,
  onRemovePlannedItem,
  onUpdateQty,
  onLoadTemplate
}: Props) {
  const baseId = useId();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('Semua');

  // Load standard template presets
  const templates = [
    {
      name: 'Trekking Ringan (Andong/Ungaran 1-2Hari)',
      desc: 'Cocok untuk wisata pendakian santai, minim rintangan logistik berat.',
      color: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      items: [
        { idBarang: 'BT-ID-001', namaBarang: 'Tenda Dome Consina Magnum 4', qty: 2, berat: '3.2 kg' },
        { idBarang: 'BT-ID-006', namaBarang: 'Kompor Camping Portable Kovar', qty: 2, berat: '0.4 kg' },
        { idBarang: 'BT-ID-007', namaBarang: 'Nesting DS-308 Camping Set', qty: 2, berat: '0.8 kg' }
      ]
    },
    {
      name: 'Ekspedisi Sedang (Sumbing/Sindoro/Merbabu 3 Hari)',
      desc: 'Standar tim lapangan Barengin Trip, didukung mitigasi safety memadai.',
      color: 'bg-indigo-50 border-indigo-250 text-indigo-800',
      items: [
        { idBarang: 'BT-ID-001', namaBarang: 'Tenda Dome Consina Magnum 4', qty: 5, berat: '3.2 kg' },
        { idBarang: 'BT-ID-003', namaBarang: 'HT Baofeng UV-5R Dual Band', qty: 4, berat: '0.25 kg' },
        { idBarang: 'BT-ID-006', namaBarang: 'Kompor Camping Portable Kovar', qty: 4, berat: '0.4 kg' },
        { idBarang: 'BT-ID-007', namaBarang: 'Nesting DS-308 Camping Set', qty: 3, berat: '0.8 kg' }
      ]
    },
    {
      name: 'Trans-Rinjani Heavy Expedition (4-5 Hari)',
      desc: 'Skala komersial berat, kru logistik wajib membawa spare komunikasi & tenda tebal.',
      color: 'bg-amber-50 border-amber-250 text-amber-800',
      items: [
        { idBarang: 'BT-ID-001', namaBarang: 'Tenda Dome Consina Magnum 4', qty: 8, berat: '3.2 kg' },
        { idBarang: 'BT-ID-003', namaBarang: 'HT Baofeng UV-5R Dual Band', qty: 6, berat: '0.25 kg' },
        { idBarang: 'BT-ID-006', namaBarang: 'Kompor Camping Portable Kovar', qty: 6, berat: '0.4 kg' },
        { idBarang: 'BT-ID-007', namaBarang: 'Nesting DS-308 Camping Set', qty: 5, berat: '0.8 kg' }
      ]
    }
  ];

  // Filter items in basecamp shelf
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchSearch = item.namaBarang.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedKategori === 'Semua' || item.kategoriBarang === selectedKategori;
      return matchSearch && matchCat && item.kuantitas > 0;
    });
  }, [inventory, searchTerm, selectedKategori]);

  return (
    <div className="space-y-6 text-xs">
      {/* EXSTREMELY HELPFUL AUTO RECOMMEND PRESET BAR */}
      <div className="bg-white border border-slate-150 p-5 rounded-xl shadow-2xs space-y-3.5">
        <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-wider font-mono flex items-center">
          <Sparkles className="h-4.5 w-4.5 text-emerald-600 mr-2" />
          <span>Sistem Rekomendasi Kebutuhan Otomatis (Auto-Template)</span>
        </h3>
        
        <p className="text-slate-500 font-semibold leading-relaxed leading-none">
          Hapus keraguan perencanaan logistik Anda. Muat template peralatan utama PT. Barengin Trip berdasarkan intensitas penugasan lapangan:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1.5 font-bold">
          {templates.map((tpl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onLoadTemplate(tpl.items)}
              className={`border p-4 rounded-xl text-left cursor-pointer transition hover:shadow-md ${tpl.color} space-y-2 flex flex-col justify-between`}
            >
              <div className="space-y-1">
                <span className="text-[10.5px] font-black block font-serif leading-snug">{tpl.name}</span>
                <p className="text-[9.5px] text-slate-450 font-normal leading-relaxed">{tpl.desc}</p>
              </div>

              <div className="text-[10px] font-mono text-slate-500 bg-white/60 p-1.5 rounded-md mt-2 flex items-center justify-between">
                <span>Total logistik:</span>
                <span className="font-extrabold">{tpl.items.length} Kelompok Alat</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COMP: BASECAMP SHELF PICKER */}
        <div className="bg-white border border-slate-150 p-5 rounded-xl shadow-2xs lg:col-span-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 gap-2">
            <span className="text-xs font-black text-slate-850 uppercase tracking-wider">Rak Gudang / Tersedia Di Basecamp</span>
            
            <select
              value={selectedKategori}
              onChange={(e) => setSelectedKategori(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg p-1 text-[10.5px] font-bold text-slate-600 focus:outline-hidden"
            >
              <option value="Semua">Semua Rak</option>
              <option value="Kemah">🏕️ Kemah</option>
              <option value="Elektronik">📡 Elektronik</option>
              <option value="Trekking">🥾 Trekking</option>
              <option value="Alat Masak dan Minum">🍳 Alat Masak</option>
              <option value="P3K">🩹 P3K</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold leading-none">
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Cari alat di rak basecamp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-0 focus:outline-hidden w-full text-xs font-semibold placeholder-slate-400 text-slate-700"
            />
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {filteredInventory.length > 0 ? (
              filteredInventory.map((item) => {
                const isAlreadyAdded = plannedItems.some(p => p.idBarang === item.id);
                return (
                  <div key={item.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between font-bold text-slate-705 text-[11px] leading-relaxed">
                    <div className="space-y-0.5">
                      <span className="font-extrabold text-slate-800 text-[11.5px]">{item.namaBarang}</span>
                      <div className="text-[9px] text-slate-405 font-mono">ID: {item.id} &bull; Berat: {item.berat} &bull; Gudang: <span className="text-slate-600 font-extrabold">{item.kuantitas} pcs</span></div>
                    </div>

                    <button
                      type="button"
                      disabled={isAlreadyAdded}
                      onClick={() => onAddPlannedItem(item.id, 1)}
                      className={`px-3 py-1 bg-[#11512f] hover:bg-emerald-800 text-white rounded-lg border-0 cursor-pointer text-[10px] font-extrabold flex items-center space-x-1 uppercase shadow-2xs ${
                        isAlreadyAdded ? 'opacity-40 cursor-not-allowed bg-slate-200 text-slate-400' : ''
                      }`}
                    >
                      <span>{isAlreadyAdded ? 'Ditambahkan' : 'Sediakan'}</span>
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-slate-300">
                <AlertCircle className="h-6 w-6 mx-auto mb-1 text-slate-200" />
                <span className="text-[10px] font-mono">Tidak ada peralatan yang sesuai</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COMP: ADDED PLANNED LIST */}
        <div className="bg-white border border-slate-150 p-5 rounded-xl shadow-2xs lg:col-span-6 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <span className="text-xs font-black text-slate-850 uppercase tracking-wider">Perencanaan Peralatan Terpilih</span>
            <span className="text-[10px] font-mono text-[#11512f] font-bold">Total: {plannedItems.length} Jenis</span>
          </div>

          {plannedItems.length > 0 ? (
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {plannedItems.map((item) => (
                <div key={item.idBarang} className="p-3 bg-slate-50 border border-slate-200/50 rounded-xl flex items-center justify-between font-bold text-slate-705 leading-relaxed">
                  <div className="space-y-0.5 shrink-0 max-w-[200px]">
                    <span className="font-extrabold text-slate-800 text-[11.5px] line-clamp-1">{item.namaBarang}</span>
                    <div className="text-[9px] text-slate-400 font-mono">ID: {item.idBarang} &bull; Satuan {item.beratBarang}</div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    {/* Qty edit togglers */}
                    <div className="flex items-center space-x-1.5 bg-white border border-slate-200 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => onUpdateQty(item.idBarang, false)}
                        className="w-5 h-5 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-600 rounded border-0 cursor-pointer font-bold"
                      >
                        -
                      </button>
                      <span className="text-[11.5px] font-mono text-slate-800 font-black w-6 text-center">{item.jumlahDigunakan}</span>
                      <button
                        type="button"
                        onClick={() => onUpdateQty(item.idBarang, true)}
                        className="w-5 h-5 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-600 rounded border-0 cursor-pointer font-bold"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemovePlannedItem(item.idBarang)}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 rounded-lg text-rose-600 border-0 cursor-pointer"
                      title="Batalkan Rencana"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border border-dashed border-slate-150 rounded-xl bg-slate-50 text-slate-400 space-y-2 flex flex-col items-center justify-center">
              <Backpack className="h-8 w-8 text-slate-300" />
              <div className="space-y-0.5">
                <p className="text-xs font-extrabold">Alat Belum Ditentukan</p>
                <p className="text-[10px]">Pilih beberapa logistik di sebelah kiri atau muat preset rekomendasi otomatis diatas.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
