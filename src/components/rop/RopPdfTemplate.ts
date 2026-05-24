import { ExpeditionTrip, TripPlan } from '../../types';

export const generateRopHtml = (
  trip: ExpeditionTrip,
  plan: TripPlan,
  formatIDR: (v: number) => string,
  crewCargoStats: Record<string, { weight: number; count: number; items: any[] }>
): string => {
  // Sort participants by physical level or name
  const sortedParticipants = [...(plan.pesertaList || [])];
  
  // Calculate stats for physical level
  const totalP = sortedParticipants.length;
  const countTinggi = sortedParticipants.filter(p => p.tingkatFisik === 'Tinggi').length;
  const countSedang = sortedParticipants.filter(p => p.tingkatFisik === 'Sedang').length;
  const countRendah = sortedParticipants.filter(p => p.tingkatFisik === 'Rendah').length;

  const pctTinggi = totalP > 0 ? ((countTinggi / totalP) * 100).toFixed(0) : '0';
  const pctSedang = totalP > 0 ? ((countSedang / totalP) * 100).toFixed(0) : '0';
  const pctRendah = totalP > 0 ? ((countRendah / totalP) * 100).toFixed(0) : '0';

  // Warnings for risks alert
  const hasRiskAlert = (p: any) => {
    const medical = (p.kondisiKhusus || p.riwayatPenyakit || '').toLowerCase();
    return medical.includes('asma') || 
           medical.includes('hipertensi') || 
           medical.includes('maag') || 
           medical.includes('cedera') || 
           medical.includes('vertigo') || 
           medical.includes('hipotermia') || 
           medical.includes('anxiety') ||
           medical.includes('panik') ||
           medical.includes('alergi');
  };

  const priorityParticipants = sortedParticipants.filter(p => 
    p.tingkatFisik === 'Rendah' || 
    p.pengalamanPendakian.toLowerCase().includes('belum') || 
    p.pengalamanPendakian.toLowerCase().includes('first') || 
    p.usia > 50 || 
    hasRiskAlert(p)
  );

  // Grouping Trekking Team 1, 2, 3
  const team1 = sortedParticipants.filter(p => p.tingkatFisik === 'Tinggi' && !hasRiskAlert(p));
  const team2 = sortedParticipants.filter(p => p.tingkatFisik === 'Sedang' && !hasRiskAlert(p));
  const team3 = sortedParticipants.filter(p => p.tingkatFisik === 'Rendah' || hasRiskAlert(p));

  // Generate Participants Rows
  const participantRowsHtml = sortedParticipants.map((p, idx) => {
    const badgeColor = p.tingkatFisik === 'Tinggi' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                       p.tingkatFisik === 'Sedang' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                       'bg-rose-100 text-rose-800 border-rose-300';

    const riskBadge = hasRiskAlert(p) ? `
      <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-red-100 text-red-800 border border-red-300 uppercase animate-pulse">
        ⚠️ RISK ALERT
      </span>
    ` : '';

    return `
      <tr class="border-b border-slate-200 text-[10px] leading-snug">
        <td class="p-2 text-center font-mono font-bold">${idx + 1}</td>
        <td class="p-2 font-black text-slate-900">
          <div>${p.namaLengkap}</div>
          <div class="text-[8px] text-slate-500 font-normal">Age: ${p.usia} yrs &middot; ${p.gender}</div>
        </td>
        <td class="p-2 font-mono text-[9.5px]">
          <div>WA: ${p.whatsapp}</div>
          <div class="text-slate-500 text-[8.5px]">EMG: ${p.daruratNo}</div>
        </td>
        <td class="p-2 text-slate-700">${p.meetingPoint}</td>
        <td class="p-2">
          <span class="inline-block px-2 py-0.5 rounded-full border text-[8.5px] font-black ${badgeColor}">
            ${p.tingkatFisik}
          </span>
          <div class="mt-1">${p.pengalamanPendakian}</div>
        </td>
        <td class="p-2">
          ${riskBadge}
          <div class="text-[9px] text-[#2c3e50] font-medium leading-relaxed">${p.kondisiKhusus || '-'}</div>
        </td>
        <td class="p-2 text-slate-500 italic text-[9px]">${p.catatanKru || '-'}</td>
      </tr>
    `;
  }).join('');

  // Priority Cards
  const priorityCardsHtml = priorityParticipants.map(p => {
    let reason = [];
    if (p.tingkatFisik === 'Rendah') reason.push('Tingkat fisik RENDAH');
    if (p.usia > 50) reason.push('Usia senior (>50 th)');
    if (p.pengalamanPendakian.toLowerCase().includes('belum') || p.pengalamanPendakian.toLowerCase().includes('first')) reason.push('Pendaki pemula (First Timer)');
    if (hasRiskAlert(p)) reason.push('Alert medis aktif');
    
    return `
      <div class="p-3 bg-red-50/50 border border-red-200 rounded-xl space-y-1">
        <div class="flex items-center justify-between">
          <span class="font-black text-slate-900 font-serif text-xs">${p.namaLengkap}</span>
          <span class="px-1.5 py-0.5 bg-rose-600 text-white rounded text-[8px] font-black uppercase">HIGH ATTENTION</span>
        </div>
        <div class="text-[9px] text-rose-800 leading-relaxed font-bold">
          ⚠️ Alasan: ${reason.join(', ')}
        </div>
        <div class="text-[9.5px] text-slate-600">
          <strong>Rekomendasi Pendampingan:</strong> Tempatkan dekat Leader, wajib monitoring hidrasi berkala, tidak disarankan pace cepat.
        </div>
      </div>
    `;
  }).join('');

  // Structure assignments rows
  const structureRowsHtml = (plan.timStruktur || []).map((t, idx) => {
    return `
      <tr class="border-b border-slate-200">
        <td class="p-2 text-center font-mono font-bold">${idx + 1}</td>
        <td class="p-2 font-black text-[#11512f]">${t.namaKru}</td>
        <td class="p-2 font-extrabold text-slate-800">${t.role}</td>
        <td class="p-2 text-slate-600">${t.tanggungJawab}</td>
      </tr>
    `;
  }).join('');

  // Timeline Rows
  const timelineRowsHtml = (plan.timeline || []).map((t, idx) => {
    return `
      <tr class="border-b border-slate-200 text-[9.5px]">
        <td class="p-2 text-center font-mono font-bold">${idx + 1}</td>
        <td class="p-2 font-bold font-mono text-[#11512f]">${t.jam}</td>
        <td class="p-2 font-extrabold text-slate-900">${t.aktivitas}</td>
        <td class="p-2 text-slate-700">${t.lokasi}</td>
        <td class="p-2 font-bold text-slate-800">${t.pic}</td>
        <td class="p-2 text-slate-500 italic font-medium">${t.catatan || '-'}</td>
      </tr>
    `;
  }).join('');

  // Checklist Logistik rows
  const checklistItemsHtml = (trip.plannedItems || []).map((item, idx) => {
    const isChecked = plan.logistikChecklist?.[item.idBarang] ? '✓' : '';
    const checkBg = plan.logistikChecklist?.[item.idBarang] ? 'bg-emerald-50 text-emerald-800 font-bold' : '';
    return `
      <tr class="border-b border-slate-200 text-[10px] ${checkBg}">
        <td class="p-2 text-center font-mono">${idx + 1}</td>
        <td class="p-2 font-bold text-slate-800">${item.namaBarang}</td>
        <td class="p-2 font-bold font-mono text-center">${item.jumlahDigunakan}</td>
        <td class="p-2 font-mono text-center">${item.beratBarang || '0 kg'}</td>
        <td class="p-2 text-center">
          <div class="inline-flex w-4 h-4 border border-slate-400 items-center justify-center font-bold text-emerald-700 font-mono text-xs rounded">
            ${isChecked}
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Distribution payload rows
  const distributionRowsHtml = Object.entries(crewCargoStats).map(([kruId, stats], index) => {
    const crewMember = trip.crew.find(c => c.id === kruId);
    if (!crewMember) return '';
    const loadPercentage = Math.min(100, (stats.weight / crewMember.kapasitasBebanMax) * 100).toFixed(0);
    const overloadText = stats.weight > crewMember.kapasitasBebanMax ? '(OVERLOAD)' : '';
    const barColor = stats.weight > crewMember.kapasitasBebanMax ? 'bg-rose-600' : 'bg-[#11512f]';

    const itemsListStr = stats.items.map(item => `${item.namaBarang} (${item.jumlah})`).join(', ') || 'Nihil load kargo';

    return `
      <tr class="border-b border-slate-200 text-[10px]">
        <td class="p-2.5 text-center font-mono font-bold">${index + 1}</td>
        <td class="p-2.5">
          <div class="font-black text-slate-900">${crewMember.namaKru}</div>
          <div class="text-[8px] text-slate-500 font-black tracking-widest">${crewMember.role.toUpperCase()}</div>
        </td>
        <td class="p-2.5 text-slate-600 text-[9px] leading-relaxed max-w-sm font-medium">
          ${itemsListStr}
        </td>
        <td class="p-2.5 text-center font-mono font-bold text-slate-900">
          ${stats.weight.toFixed(1)} kg <span class="text-[8px] text-slate-400 font-normal">/ ${crewMember.kapasitasBebanMax}kg</span>
        </td>
        <td class="p-2.5 text-center">
          <div class="flex items-center justify-center gap-1.5 ml-2">
            <span class="font-mono text-[9px] font-bold text-slate-800">${loadPercentage}% ${overloadText}</span>
            <div class="w-14 bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div class="${barColor} h-full" style="width: ${loadPercentage}%"></div>
            </div>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Risks rows
  const riskRowsHtml = (plan.safetyRisks || []).map((r, idx) => {
    let riskBg = 'bg-slate-100 text-slate-800';
    if (r.levelRisiko === 'Critical') riskBg = 'bg-rose-600 text-white font-bold';
    else if (r.levelRisiko === 'High') riskBg = 'bg-rose-100 text-rose-800 font-bold';
    else if (r.levelRisiko === 'Medium') riskBg = 'bg-amber-100 text-amber-800 font-bold';

    return `
      <tr class="border-b border-slate-200 text-[9.5px]">
        <td class="p-2 text-center font-mono font-bold">${idx + 1}</td>
        <td class="p-2 font-black text-slate-900 leading-snug">${r.potensiRisiko}</td>
        <td class="p-2 font-bold text-center">
          <span class="px-2 py-0.5 rounded border text-[8px] ${riskBg}">
            ${r.levelRisiko}
          </span>
        </td>
        <td class="p-2 text-slate-700 leading-normal font-medium">${r.mitigasi}</td>
        <td class="p-2 text-rose-900 italic font-semibold leading-normal">${r.keputusanOperasional}</td>
      </tr>
    `;
  }).join('');

  // Scenarios rows
  const scenarioRowsHtml = (plan.emergencyScenarios || []).map((e, idx) => {
    return `
      <tr class="border-b border-slate-200 text-[10px]">
        <td class="p-2.5 text-center font-mono font-bold">${idx + 1}</td>
        <td class="p-2.5">
          <span class="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 border text-[8px] font-black text-slate-700 uppercase rounded">
            ${e.kategori}
          </span>
        </td>
        <td class="p-2.5 font-bold text-slate-900">${e.skenario}</td>
        <td class="p-2.5 text-slate-700 text-[9px] leading-relaxed font-semibold whitespace-pre-line">${e.alurTindakan}</td>
        <td class="p-2.5 font-bold text-slate-900 text-center">${e.pic}</td>
        <td class="p-2.5 font-mono text-slate-600 text-center text-[9px]">${e.kontakDarurat}</td>
      </tr>
    `;
  }).join('');

  // Emergency contact list rows
  const contactRowsHtml = (plan.kontakPentingList || []).map((c, idx) => {
    return `
      <tr class="border-b border-slate-200">
        <td class="p-2 text-center font-mono font-bold">${idx + 1}</td>
        <td class="p-2 font-bold text-slate-900">${c.kategori}</td>
        <td class="p-2 font-extrabold text-[#11512f]">${c.nama}</td>
        <td class="p-2 font-mono font-bold text-slate-900">${c.kontak}</td>
        <td class="p-2 text-slate-500 font-medium text-[9px]">${c.alamat || '-'}</td>
      </tr>
    `;
  }).join('');

  // Return full layout html string
  return `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>ROP_Operational_Plan_${trip.namaDestinasi.replace(/\s+/g, '_')}</title>
    <!-- Tailwind CSS v3 CDN Setup -->
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=JetBrains+Mono:wght@400;500;700&display=swap');
        
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: #ededed;
        }

        /* Explicit A4 Page Size Break Rules */
        .page-break {
            page-break-before: always;
            break-before: page;
        }

        .a4-page {
            width: 210mm;
            min-height: 297mm;
            padding: 18mm 15mm;
            margin: 0 auto 10mm auto;
            background: white;
            box-shadow: 0 4px 10px rgba(0,0,0,0.06);
            border-radius: 4px;
            position: relative;
            box-sizing: border-box;
            display: flex;
            flex-col: col;
            justify-content: space-between;
        }

        @media print {
            body {
                background-color: white !important;
                padding: 0 !important;
                margin: 0 !important;
            }
            .no-print {
                display: none !important;
            }
            .a4-page {
                width: 100% !important;
                min-height: 100% !important;
                padding: 10mm 10mm !important;
                margin: 0 !important;
                box-shadow: none !important;
                border-radius: 0 !important;
                page-break-after: always;
                break-after: page;
            }
        }
    </style>
</head>
<body class="text-[10.5px] leading-relaxed text-slate-700">

    <!-- TOP CONTROL FLOATING PANEL FOR PRINTING OUT OF CANVAS -->
    <div class="no-print bg-amber-50 border-b border-amber-200 text-amber-900 py-3 px-4 sticky top-0 z-50 shadow-md">
        <div class="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-3">
                <span class="text-xl">🖨️</span>
                <div>
                    <h3 class="font-extrabold text-xs">Run Operational Plan (ROP) Berhasil Terbentuk!</h3>
                    <p class="text-[9.5px] text-amber-800 font-medium">Gunakan tombol cetak di samping untuk menyimpan sebagai PDF dokumen resmi kru lapangan.</p>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <button onclick="window.print()" class="px-5 py-2 bg-[#11512f] hover:bg-emerald-900 text-white font-black rounded-lg cursor-pointer transition text-[10px] uppercase tracking-wider">
                    Cetak / Simpan PDF
                </button>
            </div>
        </div>
    </div>


    <!-- ========================================== -->
    <!-- PAGE 1: COVER LAYOUT                       -->
    <!-- ========================================== -->
    <div class="a4-page flex flex-col justify-between" id="page-cover" style="background-color: #faf9f6; border: 1px solid #e2e8f0;">
        <div></div>
        
        <!-- COVER HEADER CONTENT -->
        <div class="text-center space-y-10 py-6">
            <div class="space-y-4">
                <h1 class="text-3xl font-black tracking-widest text-[#11512f] font-sans block uppercase">
                    ${plan.coverTitle || 'RUN OF PROGRAM'}
                </h1>
                <p class="text-[11px] text-slate-600 tracking-wider font-extrabold uppercase bg-emerald-50 border border-emerald-200 rounded-lg inline-block px-4 py-1.5 font-mono">
                    ${plan.coverSubtitle || `${trip.jenisTrip?.toUpperCase() || 'OPEN'} TRIP NO. ${trip.nomorTrip || 'T-XXX'} PENDAKIAN GUNUNG`}
                </p>
            </div>

            <div class="space-y-2 mt-4 text-xs font-bold text-slate-800 leading-normal">
                <p class="text-[13px] text-slate-900 font-serif">Gunung ${trip.namaDestinasi} Via ${trip.jalurPendakian || '-'}</p>
                <p class="font-mono text-[11px] text-emerald-800">${plan.durasiTrip || '2 Hari 1 Malam'}</p>
                <p class="text-slate-500 font-semibold text-[10px]">Tanggal: ${trip.tanggalMulai} s.d ${trip.tanggalSelesai}</p>
            </div>

            <!-- LOGO: BARENGIN PIN-TREE EMBLEM -->
            <div class="py-4">
                <img 
                    src="https://docs.google.com/uc?export=download&id=1u2IZPXPerRN5sEJME9G8Quxkq791_52n" 
                    alt="Barengintrip logo" 
                    class="h-44 mx-auto object-contain" 
                    referrerpolicy="no-referrer"
                />
            </div>
        </div>

        <!-- COVER BOTTOM INSCRIPTION -->
        <div class="text-center font-bold tracking-wider text-[9px] text-slate-500 border-t border-slate-200 pt-6 uppercase space-y-1">
            <p>Panduan Operasional Kru Lapangan</p>
            <p class="text-[8px] text-slate-400 font-mono font-normal">Untuk Briefing &amp; Hari-H Kegiatan &middot; Hak Cipta Dilindungi &middot; PT Barengin Trip</p>
        </div>
    </div>


    <!-- ========================================== -->
    <!-- PAGE 2: INFORMASI OPERASIONAL & TIM STRUCT -->
    <!-- ========================================== -->
    <div class="a4-page page-break flex flex-col justify-between" id="page-info-struktur">
        <div class="space-y-6">
            <!-- HEADER LOGISTICS -->
            <div class="flex justify-between items-center border-b border-slate-300 pb-3">
                <span class="text-[8px] font-mono bg-[#11512f] text-white px-2 py-0.5 rounded font-black tracking-widest uppercase">SECTION 1 &amp; Section 3</span>
                <span class="text-[9px] text-slate-400 font-mono">DOKUMEN ROP LAPANGAN</span>
            </div>

            <!-- SECTION 1: DETAILED FIELD OPERATIONAL INFO -->
            <div class="space-y-3">
                <h2 class="text-xs font-black tracking-widest text-slate-900 uppercase border-l-4 border-[#11512f] pl-2">I. INFORMASI OPERASIONAL TIM LAPANGAN</h2>
                <div class="grid grid-cols-2 gap-x-6 gap-y-3 bg-slate-50 border border-slate-200 rounded-xl p-4 text-[10px]">
                    <div>
                        <span class="text-slate-400 font-black block text-[8px] uppercase">Nama &amp; Nomor Trip</span>
                        <span class="font-extrabold text-[#11512f];">${trip.jenisTrip} - ${trip.namaDestinasi} (#${trip.nomorTrip})</span>
                    </div>
                    <div>
                        <span class="text-slate-400 font-black block text-[8px] uppercase">Lintasan Jalur Resmi</span>
                        <span class="font-bold text-slate-800">${trip.jalurPendakian || '-'} - Gunung ${trip.namaDestinasi}</span>
                    </div>
                    <div>
                        <span class="text-slate-400 font-black block text-[8px] uppercase">Garis Tanggal Ekspedisi</span>
                        <span class="font-bold text-slate-800">${trip.tanggalMulai} s.d ${trip.tanggalSelesai} (${plan.durasiTrip || '2 Hari 1 Malam'})</span>
                    </div>
                    <div>
                        <span class="text-slate-400 font-black block text-[8px] uppercase">Meeting Point Registrasi</span>
                        <span class="font-bold text-slate-800">${plan.meetingPoint || '-'}</span>
                    </div>
                    <div>
                        <span class="text-slate-400 font-black block text-[8px] uppercase">Armada Transportasi &amp; Driver</span>
                        <span class="font-bold text-slate-800">${plan.armada || '-'} &middot; Driver: ${plan.driver || '-'}</span>
                    </div>
                    <div>
                        <span class="text-slate-400 font-black block text-[8px] uppercase">Jumlah Kru &amp; Peserta Lapangan</span>
                        <span class="font-bold text-slate-800">${trip.crew?.length || 0} Kru Terdaftar &amp; ${totalP} Peserta Aktif</span>
                    </div>
                    <div>
                        <span class="text-slate-400 font-black block text-[8px] uppercase">Estimasi Cuaca &amp; Iklim BMKG</span>
                        <span class="font-bold text-slate-800">${plan.estimasiCuaca || '-'}</span>
                    </div>
                    <div>
                        <span class="text-slate-400 font-black block text-[8px] uppercase">Status Keaktifan Ekologi Gunung</span>
                        <span class="font-bold text-emerald-800 font-extrabold">${plan.statusGunung || 'Normal - Aman Pendakian'}</span>
                    </div>
                </div>
            </div>

            <!-- SECTION 3: STRUKTUR OPERASIONAL KRU -->
            <div class="space-y-3 pt-4">
                <h2 class="text-xs font-black tracking-widest text-slate-900 uppercase border-l-4 border-[#11512f] pl-2">II. STRUKTUR DAN DISTRIBUSI PERAN KRU OPERASIONAL</h2>
                <table class="w-full text-left border-collapse text-[9.5px]">
                    <thead>
                        <tr class="bg-slate-100 border-b-2 border-slate-300 font-bold text-slate-800">
                            <th class="p-2 text-center w-8">No</th>
                            <th class="p-2 w-40">Nama Kru Operasional</th>
                            <th class="p-2 w-32">Role Lapangan</th>
                            <th class="p-2">Uraian Tugas &amp; Tanggung Jawab Lapangan</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${structureRowsHtml || `<tr><td colspan="4" class="p-4 text-center text-slate-400">Belum ada penugasan terstruktur.</td></tr>`}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- FOOTER -->
        <div class="text-right text-[8px] text-slate-400 font-mono border-t border-slate-100 pt-2 flex justify-between uppercase">
            <span>BARENGIN TRIP LOGISTICS</span>
            <span>Halaman 2 / 7</span>
        </div>
    </div>


    <!-- ========================================== -->
    <!-- PAGE 3: PARTICIPANT MONITORING SYSTEM      -->
    <!-- ========================================== -->
    <div class="a4-page page-break flex flex-col justify-between" id="page-participants">
        <div class="space-y-5">
            <!-- HEADER LOGISTICS -->
            <div class="flex justify-between items-center border-b border-slate-300 pb-3">
                <span class="text-[8px] font-mono bg-[#11512f] text-white px-2 py-0.5 rounded font-black tracking-widest uppercase">SECTION 2 - Operational Participant Monitoring</span>
                <span class="text-[9px] text-slate-400 font-mono">DOKUMEN ROP LAPANGAN</span>
            </div>

            <!-- SECTION 2 SUMMARY BADGES / ANALYTICS -->
            <div class="grid grid-cols-4 gap-4">
                <div class="p-2.5 bg-slate-50 border rounded-xl text-center">
                    <span class="text-slate-400 text-[8px] font-black uppercase tracking-wider block">Total Peserta</span>
                    <span class="text-sm font-mono font-black text-slate-800">${totalP} Jiwa</span>
                </div>
                <div class="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-center">
                    <span class="text-[8px] font-black uppercase tracking-wider block text-slate-500">FISIK TINGGI</span>
                    <span class="text-sm font-mono font-black text-emerald-800">${countTinggi} (${pctTinggi}%)</span>
                </div>
                <div class="p-2.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-center">
                    <span class="text-[8px] font-black uppercase tracking-wider block text-slate-400">FISIK SEDANG</span>
                    <span class="text-sm font-mono font-black text-amber-800">${countSedang} (${pctSedang}%)</span>
                </div>
                <div class="p-2.5 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl text-center animate-pulse">
                    <span class="text-[8px] font-black uppercase tracking-wider block text-slate-500">RISIKO TINGGI / RENDAH</span>
                    <span class="text-sm font-mono font-black text-rose-800">${countRendah} (${pctRendah}%)</span>
                </div>
            </div>

            <div class="space-y-2">
                <h2 class="text-xs font-black tracking-widest text-slate-900 uppercase border-l-4 border-[#11512f] pl-2">III. DAFTAR INDIVIDU &amp; MEDICAL ALERT PESERTA</h2>
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-slate-100 border-b-2 border-slate-350 text-slate-800 font-bold text-[9px] uppercase">
                            <th class="p-1.5 text-center w-8">No</th>
                            <th class="p-1.5">Nama Lengkap &amp; Profil</th>
                            <th class="p-1.5">Kontak &amp; Emergency</th>
                            <th class="p-1.5 w-28">Meeting Point</th>
                            <th class="p-1.5">Kondisi Fisik / Pengalaman</th>
                            <th class="p-1.5 w-32">Kondisi Khusus / Riwayat</th>
                            <th class="p-1.5">Catatan Lapangan</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${participantRowsHtml || `<tr><td colspan="7" class="p-4 text-center text-slate-400">Belum ada data peserta pendakian.</td></tr>`}
                    </tbody>
                </table>
            </div>

            <!-- TREKKING TEAMS GROUP RECOMMENDATIONS -->
            <div class="grid grid-cols-3 gap-3 pt-1">
                <div class="p-2.5 border border-emerald-300 bg-emerald-50/25 rounded-xl space-y-1">
                    <span class="text-[8px] font-black text-emerald-800 tracking-wider block">TEAM 1: FAST PACE (TL ATTACHED)</span>
                    <p class="text-[9px] font-bold text-slate-800 leading-tight">
                        ${team1.length > 0 ? team1.map(p => p.namaLengkap).join(', ') : 'Tidak ada'}
                    </p>
                    <p class="text-[7.5px] text-slate-400 italic">Pacing cepat, stamina kuat, minim pengawasan khusus.</p>
                </div>
                <div class="p-2.5 border border-amber-300 bg-amber-50/25 rounded-xl space-y-1">
                    <span class="text-[8px] font-black text-amber-800 tracking-wider block">TEAM 2: NORMAL PACE (MID GROUND)</span>
                    <p class="text-[9px] font-bold text-slate-800 leading-tight">
                        ${team2.length > 0 ? team2.map(p => p.namaLengkap).join(', ') : 'Tidak ada'}
                    </p>
                    <p class="text-[7.5px] text-slate-400 italic">Kecepatan sedang standar, monitor berkala.</p>
                </div>
                <div class="p-2.5 border border-rose-300 bg-rose-50/25 rounded-xl space-y-1">
                    <span class="text-[8px] font-black text-rose-800 tracking-wider block">TEAM 3: SLOW PACE (SWEEPER LOCKED)</span>
                    <p class="text-[9px] font-bold text-slate-800 leading-tight">
                        ${team3.length > 0 ? team3.map(p => p.namaLengkap).join(', ') : 'Tidak ada'}
                    </p>
                    <p class="text-[7.5px] text-slate-400 italic">Diberi jatah istirahat ekstra, monitor medis &amp; kram ketat.</p>
                </div>
            </div>

            <!-- HIGH ATTENTION HIGHLIGHTS -->
            <div class="space-y-2 pt-2">
                <h3 class="text-[9px] font-black tracking-widest text-[#11512f] uppercase">RISK LEVEL ATTACHMENTS (HIGH PRIORITY CLIENTS)</h3>
                <div class="grid grid-cols-2 gap-3">
                    ${priorityCardsHtml || '<div class="col-span-2 text-center text-slate-400 text-[8.5px]">Tidak ada peserta kategori prioritas khusus. All safe.</div>'}
                </div>
            </div>
        </div>

        <!-- FOOTER -->
        <div class="text-right text-[8px] text-slate-400 font-mono border-t border-slate-100 pt-2 flex justify-between uppercase">
            <span>BARENGIN TRIP LOGISTICS</span>
            <span>Halaman 3 / 7</span>
        </div>
    </div>


    <!-- ========================================== -->
    <!-- PAGE 4: ROUTE TIMELINE & LOGISTICS         -->
    <!-- ========================================== -->
    <div class="a4-page page-break flex flex-col justify-between" id="page-timeline-logistik">
        <div class="space-y-6">
            <!-- HEADER LOGISTICS -->
            <div class="flex justify-between items-center border-b border-slate-300 pb-3">
                <span class="text-[8px] font-mono bg-[#11512f] text-white px-2 py-0.5 rounded font-black tracking-widest uppercase">SECTION 4 &amp; Section 5</span>
                <span class="text-[9px] text-slate-400 font-mono">DOKUMEN ROP LAPANGAN</span>
            </div>

            <!-- SECTION 4: ROUTE TIMELINE -->
            <div class="space-y-3">
                <h2 class="text-xs font-black tracking-widest text-slate-900 uppercase border-l-4 border-[#11512f] pl-2">IV. JADWAL TIMELINE &amp; RUNDOWN OPERASIONAL</h2>
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-slate-100 border-b-2 border-slate-300 font-bold text-slate-800">
                            <th class="p-1.5 text-center w-8">No</th>
                            <th class="p-1.5 w-24">Alokasi Waktu</th>
                            <th class="p-1.5">Rincian Kegiatan / Rundown</th>
                            <th class="p-1.5">Lokasi / Sektor</th>
                            <th class="p-1.5 w-18 text-center">P.I.C</th>
                            <th class="p-1.5">Catatan Teknis Lapangan</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${timelineRowsHtml || `<tr><td colspan="6" class="p-4 text-center text-slate-400">Belum ada rundown perjalanan yang dijadwalkan.</td></tr>`}
                    </tbody>
                </table>
            </div>

            <!-- SECTION 5: CHECKLIST LOGISTIK SINKRON -->
            <div class="space-y-3 pt-2">
                <h2 class="text-xs font-black tracking-widest text-slate-900 uppercase border-l-4 border-[#11512f] pl-2">V. CHECKLIST KONTROL LOGISTIK &amp; PERLENGKAPAN UTAMA TIM</h2>
                <table class="w-full text-left border-collapse text-[9px]">
                    <thead>
                        <tr class="bg-slate-100 border-b-2 border-slate-300 text-slate-800 font-bold">
                            <th class="p-2 text-center w-8">No</th>
                            <th class="p-2">Nama Barang Logistik Operasional</th>
                            <th class="p-2 text-center w-16">Qty Digunakan</th>
                            <th class="p-2 text-center w-20">Berat Total Satuan</th>
                            <th class="p-2 text-center w-16">Checklist Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${checklistItemsHtml || `<tr><td colspan="5" class="p-4 text-center text-slate-400 font-mono">Belum ada barang terdaftar dari draft item terpilih.</td></tr>`}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- FOOTER -->
        <div class="text-right text-[8px] text-slate-400 font-mono border-t border-slate-100 pt-2 flex justify-between uppercase">
            <span>BARENGIN TRIP LOGISTICS</span>
            <span>Halaman 4 / 7</span>
        </div>
    </div>


    <!-- ========================================== -->
    <!-- PAGE 5: CARGO LOAD DISTRIBUTION & CODES    -->
    <!-- ========================================== -->
    <div class="a4-page page-break flex flex-col justify-between" id="page-loads-sop">
        <div class="space-y-6">
            <!-- HEADER LOGISTICS -->
            <div class="flex justify-between items-center border-b border-slate-300 pb-3">
                <span class="text-[8px] font-mono bg-[#11512f] text-white px-2 py-0.5 rounded font-black tracking-widest uppercase">SECTION 6 &amp; Section 7</span>
                <span class="text-[9px] text-slate-400 font-mono">DOKUMEN ROP LAPANGAN</span>
            </div>

            <!-- SECTION 6: THE DETAILED CARGO WEIGHT PER PORT/CREW -->
            <div class="space-y-3">
                <h2 class="text-xs font-black tracking-widest text-slate-900 uppercase border-l-4 border-[#11512f] pl-2">VI. MANIFEST DISTRIBUSI BEBAN BEBAN KRU (CARGO LOG)</h2>
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-slate-100 border-b-2 border-slate-300 font-bold text-slate-800">
                            <th class="p-2 text-center w-8">No</th>
                            <th class="p-2 w-36">Nama Kru Lapangan (Cargo Carrier)</th>
                            <th class="p-2">Manifest Daftar Barang Yang Dipikul</th>
                            <th class="p-2 text-center w-28">Beban Kumulatif Aktif</th>
                            <th class="p-2 text-center w-28">Rasio Persentase Batas</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${distributionRowsHtml || `<tr><td colspan="5" class="p-4 text-center text-slate-400 font-mono">Tidak ada beban cargo yang didistribusikan ke Kru untuk trip ini.</td></tr>`}
                    </tbody>
                </table>
            </div>

            <!-- SECTION 7: SOP LAPANGAN OUTDOOR -->
            <div class="space-y-4 pt-3">
                <h2 class="text-xs font-black tracking-widest text-slate-900 uppercase border-l-4 border-[#11512f] pl-2">VII. STANDARD OPERATING PROCEDURE (SOP) OPERASIONAL LAPANGAN</h2>
                <div class="space-y-3 text-[10px] leading-relaxed">
                    <div class="p-2 border border-slate-200 rounded-lg">
                        <strong class="text-[#11512f] uppercase text-[9px] block">A. PROTOKOL BRIEFING &amp; CO-CHECKLIST SEBELUM MENANJAK</strong>
                        <p class="mt-1 text-slate-600 whitespace-pre-line text-[9px]">${plan.sopBriefing || '-'}</p>
                    </div>
                    <div class="p-2 border border-slate-200 rounded-lg">
                        <strong class="text-[#11512f] uppercase text-[9px] block">B. PROTOKOL SAAT MENDAKI (TREKKING DISCIPLINE)</strong>
                        <p class="mt-1 text-slate-600 whitespace-pre-line text-[9px]">${plan.sopTrekking || '-'}</p>
                    </div>
                    <div class="p-2 border border-slate-200 rounded-lg">
                        <strong class="text-[#11512f] uppercase text-[9px] block">C. PROTOKOL KETAT SEKTOR PERKEMAHAN (CAMPSITE MANAGEMENT)</strong>
                        <p class="mt-1 text-slate-600 whitespace-pre-line text-[9px]">${plan.sopCamp || '-'}</p>
                    </div>
                    <div class="p-2 border border-slate-200 rounded-lg">
                        <strong class="text-[#11512f] uppercase text-[9px] block">D. PROHIBITIONS BARRIER (LARANGAN MUTLAK)</strong>
                        <p class="mt-1 text-slate-905 font-bold whitespace-pre-line text-[9px]">${plan.sopLarangan || '-'}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- FOOTER -->
        <div class="text-right text-[8px] text-slate-400 font-mono border-t border-slate-100 pt-2 flex justify-between uppercase">
            <span>BARENGIN TRIP LOGISTICS</span>
            <span>Halaman 5 / 7</span>
        </div>
    </div>


    <!-- ========================================== -->
    <!-- PAGE 6: RISK ASSESSMENT & EMGs            -->
    <!-- ========================================== -->
    <div class="a4-page page-break flex flex-col justify-between" id="page-risk-management">
        <div class="space-y-6">
            <!-- HEADER LOGISTICS -->
            <div class="flex justify-between items-center border-b border-slate-300 pb-3">
                <span class="text-[8px] font-mono bg-[#11512f] text-white px-2 py-0.5 rounded font-black tracking-widest uppercase">SECTION 8 &amp; Section 9</span>
                <span class="text-[9px] text-slate-400 font-mono">DOKUMEN ROP LAPANGAN</span>
            </div>

            <!-- SECTION 8: SAFETY & RISK MATRIX -->
            <div class="space-y-3">
                <h2 class="text-xs font-black tracking-widest text-[#11512f] uppercase border-l-4 border-rose-600 pl-2">VIII. MATRIKS ANALISIS MITIGASI RISIKO SAFETY LAPANGAN</h2>
                <table class="w-full text-left border-collapse text-[9px]">
                    <thead>
                        <tr class="bg-slate-100 border-b-2 border-slate-350 text-slate-800 font-bold">
                            <th class="p-2 text-center w-8">No</th>
                            <th class="p-2 w-44">Uraian Potensi Risiko Buruk</th>
                            <th class="p-2 text-center w-20">Level Risiko</th>
                            <th class="p-2">Taktikal Rencana Mitigasi Pencegahan</th>
                            <th class="p-2 w-48">Keputusan Terakhir TL (Tindakan Instan)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${riskRowsHtml || `<tr><td colspan="5" class="p-4 text-center text-slate-400">Belum mendefinisikan mitigasi risiko.</td></tr>`}
                    </tbody>
                </table>
            </div>

            <!-- SECTION 9: EMERGENCY ACTIONS SCENARIOS -->
            <div class="space-y-2 pt-2">
                <h2 class="text-xs font-black tracking-widest text-[#11512f] uppercase border-l-4 border-rose-600 pl-2">IX. ALUR TINDAKAN SKENARIO EMERGENCY &amp; CRISIS CENTER</h2>
                <table class="w-full text-left border-collapse text-[9.5px]">
                    <thead>
                        <tr class="bg-slate-100 border-b-2 border-slate-300 text-slate-800 font-bold">
                            <th class="p-2 text-center w-8">No</th>
                            <th class="p-2 w-24">Sektor</th>
                            <th class="p-2 w-44">Kronologis Skenario Kritis</th>
                            <th class="p-2">Alur Tindakan Penyelamatan Tim</th>
                            <th class="p-2 text-center w-20">PIC</th>
                            <th class="p-2 text-center w-24">Kontak Segera</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${scenarioRowsHtml || `<tr><td colspan="6" class="p-4 text-center text-slate-400">Belum mendaftarkan skenario darurat.</td></tr>`}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- FOOTER -->
        <div class="text-right text-[8px] text-slate-400 font-mono border-t border-slate-100 pt-2 flex justify-between uppercase">
            <span>BARENGIN TRIP LOGISTICS</span>
            <span>Halaman 6 / 7</span>
        </div>
    </div>


    <!-- ========================================== -->
    <!-- PAGE 7: EVACUATION, PLAN B, AND CONTACTS   -->
    <!-- ========================================== -->
    <div class="a4-page page-break flex flex-col justify-between" id="page-evacuation-contacts">
        <div class="space-y-5">
            <!-- HEADER LOGISTICS -->
            <div class="flex justify-between items-center border-b border-slate-300 pb-3">
                <span class="text-[8px] font-mono bg-[#11512f] text-white px-2 py-0.5 rounded font-black tracking-widest uppercase">SECTION 10, 11, 12, 13</span>
                <span class="text-[9px] text-slate-400 font-mono">DOKUMEN ROP LAPANGAN</span>
            </div>

            <!-- GRID FOR EVAC & PLAN B -->
            <div class="grid grid-cols-2 gap-4">
                <!-- SECTION 10: EVACUATION PLAN -->
                <div class="p-2.5 border border-slate-200 rounded-lg space-y-2 text-[9.5px]">
                    <strong class="text-xs font-black text-[#11512f] uppercase block">X. RENCANA EVAKUASI KHUSUS</strong>
                    <div>
                        <span class="font-bold text-slate-500 text-[8px] uppercase block">Jalur Evakuasi Darurat</span>
                        <p class="font-semibold text-slate-800">${plan.evakuasiPath || '-'}</p>
                    </div>
                    <div>
                        <span class="font-bold text-slate-500 text-[8px] uppercase block">Titik Shelter Istirahat</span>
                        <p class="font-semibold text-slate-800">${plan.evakuasiShelter || '-'}</p>
                    </div>
                    <div class="grid grid-cols-2 gap-2 mt-1">
                        <div>
                            <span class="font-bold text-slate-500 text-[8px] uppercase block">Hospital Terdekat</span>
                            <p class="font-semibold text-rose-800">${plan.evakuasiHospital || '-'}</p>
                        </div>
                        <div>
                            <span class="font-bold text-slate-500 text-[8px] uppercase block">Transportasi Siaga</span>
                            <p class="font-semibold text-slate-800">${plan.evakuasiTransport || '-'}</p>
                        </div>
                    </div>
                </div>

                <!-- SECTION 12: PLAN B & CONTINGENCY -->
                <div class="p-2.5 border border-slate-200 rounded-lg space-y-2 text-[9.5px]">
                    <strong class="text-xs font-black text-[#11512f] uppercase block">XI. PLAN B &amp; CONTINGENCY SCHEMES</strong>
                    <div>
                        <span class="font-bold text-slate-500 text-[8px] uppercase block">Jalur Alternatif</span>
                        <p class="text-slate-600 font-semibold">${plan.planBAlternatif || '-'}</p>
                    </div>
                    <div>
                        <span class="font-bold text-slate-500 text-[8px] uppercase block">Fallback saat Cuaca Ganas</span>
                        <p class="text-slate-600 font-semibold">${plan.planBFallback || '-'}</p>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <span class="font-bold text-slate-500 text-[8px] uppercase block">Jika Delay Meeting Point</span>
                            <p class="text-slate-600 font-semibold">${plan.planBDelay || '-'}</p>
                        </div>
                        <div>
                            <span class="font-bold text-slate-500 text-[8px] uppercase block">Skema Pembatalan Total</span>
                            <p class="text-rose-900 font-semibold">${plan.planBCancel || '-'}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- SECTION 13: MOUNTAIN NOTES -->
            <div class="p-3 bg-emerald-50/20 border border-emerald-200 rounded-lg text-[9.5px] space-y-2">
                <strong class="text-xs font-black text-[#11512f] uppercase block">XII. CATATAN TEKNIS KARAKTERISTIK GUNUNG (MOUNTAIN NOTES)</strong>
                <div class="grid grid-cols-4 gap-4 text-[9px] leading-relaxed">
                    <div>
                        <strong class="text-slate-400 block text-[8px] uppercase">Ketinggian Zona</strong>
                        <p class="font-bold text-slate-800">${plan.gunungKetinggian || '-'}</p>
                    </div>
                    <div>
                        <strong class="text-slate-400 block text-[8px] uppercase">Suhu Extr. Malam</strong>
                        <p class="font-bold text-slate-800">${plan.gunungSuhu || '-'}</p>
                    </div>
                    <div>
                        <strong class="text-slate-400 block text-[8px] uppercase">Zona Sumber Air</strong>
                        <p class="font-bold text-emerald-800 font-extrabold">${plan.gunungSumberAir || '-'}</p>
                    </div>
                    <div>
                        <strong class="text-slate-400 block text-[8px] uppercase">Regulasi Permit</strong>
                        <p class="font-bold text-slate-800">${plan.gunungPermit || '-'}</p>
                    </div>
                </div>
            </div>

            <!-- SECTION 11: EMERGENCY CONTACTS -->
            <div class="space-y-2 pt-1">
                <h2 class="text-xs font-black tracking-widest text-[#11512f] uppercase border-l-4 border-[#11512f] pl-2">XIII. DIREKTORI ALAMAT &amp; TELEPON DARURAT PENTING</h2>
                <table class="w-full text-left border-collapse text-[9px]">
                    <thead>
                        <tr class="bg-slate-100 border-b-2 border-slate-300 text-slate-800 font-bold">
                            <th class="p-1.5 text-center w-8">No</th>
                            <th class="p-1.5 w-24">Kategori Kontak</th>
                            <th class="p-1.5">Instansi / Personel</th>
                            <th class="p-1.5 w-36">Nomor Telepon Siaga</th>
                            <th class="p-1.5">Alamat / Koordinat</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${contactRowsHtml}
                    </tbody>
                </table>
            </div>

            <!-- SIGN AREA -->
            <div class="grid grid-cols-2 gap-4 text-center text-[9px] pt-4 leading-normal font-semibold">
                <div class="flex flex-col justify-between h-20">
                    <p class="text-slate-400 font-black">LEADER PELAKSANA LAPANGAN (P.I.C)</p>
                    <p class="font-black text-slate-900 border-b border-slate-400 w-40 mx-auto uppercase pb-1">${trip.crew && trip.crew[0] ? trip.crew[0].namaKru : 'Tour Leader'}</p>
                </div>
                <div class="flex flex-col justify-between h-20">
                    <p class="text-slate-400 font-black">SATELLITE VERIFIED OPERATOR</p>
                    <p class="font-black text-[#11512f] border-b border-slate-400 w-40 mx-auto uppercase pb-1">BARENGIN TIM LOGISTIK</p>
                </div>
            </div>
        </div>

        <!-- FOOTER -->
        <div class="text-right text-[8px] text-slate-400 font-mono border-t border-slate-100 pt-2 flex justify-between uppercase">
            <span>BARENGIN TRIP LOGISTICS &middot; END OF DOKUMEN ROP</span>
            <span>Halaman 7 / 7</span>
        </div>
    </div>


    <script>
        // Automatic triggering dialog print-out once resource is prepared
        window.addEventListener('load', () => {
            setTimeout(() => {
                window.print();
            }, 800);
        });
    </script>
</body>
</html>
  `;
};
