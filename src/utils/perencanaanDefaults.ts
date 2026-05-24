import { Participant, TimelineRow, SafetyRiskItem, EmergencyScenarioItem, EmergencyContactItem, TripCrewRoleAssignment, TripPlan } from '../types';

export const getDefaultParticipants = (): Participant[] => [
  {
    id: 'p-1',
    namaLengkap: 'Farhan Adi Pratama',
    gender: 'Pria',
    usia: 28,
    whatsapp: '081234567890',
    daruratNo: '081199998888',
    meetingPoint: 'Basecamp Semanggi',
    alamat: 'Jakarta Selatan',
    kondisiKhusus: 'Tidak Ada / Sehat Walafiat',
    tingkatFisik: 'Tinggi',
    pengalamanPendakian: '3x Naik Gunung (Merbabu, Gede, Prau)',
    gearCriticalChecklist: 'Sleeping Bag, Jakat Bulu, Headlamp, Sepatu Gunung, Trekking Pole',
    statusKehadiran: 'Hadir',
    catatanKru: 'Dapat membantu menyapu jalur bersama asisten guide atau sweeping di tengah.',
    golonganDarah: 'O',
    riwayatPenyakit: 'Maag ringan (kondisional)',
    alergi: 'Udang/Seafood',
    obatPribadi: 'Antasida',
    emergencyContactName: 'Bambang Pratama',
    relasiEmergencyContact: 'Ayah Kandung'
  },
  {
    id: 'p-2',
    namaLengkap: 'Rizki Sukma Ramadhan',
    gender: 'Pria',
    usia: 35,
    whatsapp: '082187654321',
    daruratNo: '082155556666',
    meetingPoint: 'KFC Stasiun Tugu',
    alamat: 'Yogyakarta',
    kondisiKhusus: 'Maag Akut, Vertigo jika dehidrasi',
    tingkatFisik: 'Sedang',
    pengalamanPendakian: '1x Naik Gunung (Andong)',
    gearCriticalChecklist: 'Jaket Tebal, Raincoat, Matras Tiup, Senter Cadangan',
    statusKehadiran: 'Hadir',
    catatanKru: 'Perlu monitoring ketat terhadap asupan air minum harian dan waktu makan.',
    golonganDarah: 'A',
    riwayatPenyakit: 'Maag Akut, Vertigo',
    alergi: 'Kacang Tanah',
    obatPribadi: 'Promag, Betaserc',
    emergencyContactName: 'Siti Rahayu',
    relasiEmergencyContact: 'Istri'
  },
  {
    id: 'p-3',
    namaLengkap: 'Amelia Amanda Putri',
    gender: 'Wanita',
    usia: 24,
    whatsapp: '085712345678',
    daruratNo: '085733334444',
    meetingPoint: 'Basecamp Semanggi',
    alamat: 'Tangerang',
    kondisiKhusus: 'Asma Ringan (Bawa Inhaler mandiri)',
    tingkatFisik: 'Rendah',
    pengalamanPendakian: 'Belum Pernah (First Timer)',
    gearCriticalChecklist: 'Sepatu Trekking lengkap, Jaket Gunung Tebal, Personal First-Aid',
    statusKehadiran: 'Hadir',
    catatanKru: 'High attention participant! Tempatkan di barisan depan pas di belakang Leader utama.',
    golonganDarah: 'B',
    riwayatPenyakit: 'Asma Ringan',
    alergi: 'Udara Dingin Ekstrem (Alergi Dingin/Gatal)',
    obatPribadi: 'Venting Inhaler, Cetirizine',
    emergencyContactName: 'Hendrawan Putri',
    relasiEmergencyContact: 'Ayah'
  },
  {
    id: 'p-4',
    namaLengkap: 'Budi Santoso Purwito',
    gender: 'Pria',
    usia: 51,
    whatsapp: '081398765432',
    daruratNo: '081322221111',
    meetingPoint: 'Basecamp Semanggi',
    alamat: 'Depok',
    kondisiKhusus: 'Hipertensi Ringan (Terkontrol dengan obat)',
    tingkatFisik: 'Sedang',
    pengalamanPendakian: '5x Naik Gunung (Gede, Semeru, Welirang, Sumbing)',
    gearCriticalChecklist: 'Trekking pole sepasang, knee support pelindung lutut',
    statusKehadiran: 'Hadir',
    catatanKru: 'Memiliki pengalaman baik, namun lutut kanan agak rawan saat menuruni kemiringan tajam.',
    golonganDarah: 'AB',
    riwayatPenyakit: 'Hipertensi, Cedera Lutut Ringan',
    alergi: 'Tidak Ada',
    obatPribadi: 'Amlodipine 5mg, Ibuprofen',
    emergencyContactName: 'Yuni Santoso',
    relasiEmergencyContact: 'Anak Sulung'
  },
  {
    id: 'p-5',
    namaLengkap: 'Siti Rahma Sari',
    gender: 'Wanita',
    usia: 26,
    whatsapp: '089911223344',
    daruratNo: '089955667788',
    meetingPoint: 'Lokasi Basecamp Gunung',
    alamat: 'Bandung',
    kondisiKhusus: 'Fisik kuat tapi sering cemas berlebih (Anxiety)',
    tingkatFisik: 'Tinggi',
    pengalamanPendakian: '2x Naik Gunung (Papandayan, Cikuray)',
    gearCriticalChecklist: 'Raincoat Goretech, Sleeping bag premium, obat penenang ringan',
    statusKehadiran: 'Belum Hadir',
    catatanKru: 'Trekking pace stabil, namun perlu didampingi saat summit di kegelapan dini hari.',
    golonganDarah: 'O',
    riwayatPenyakit: 'Kecemasan Berlebih (Anxiety/Panic Attack)',
    alergi: 'Debu tebal',
    obatPribadi: 'Meds pribadi penenang dari dokter',
    emergencyContactName: 'Rahmat Hidayat',
    relasiEmergencyContact: 'Kakak Kandung'
  }
];

export const getDefaultTimeline = (): TimelineRow[] => [
  { id: 't-1', jam: '05.00 - 06.00', aktivitas: 'Kumpul Peserta & Registrasi', lokasi: 'Meeting Point Utama BARENGIN TRIP', pic: 'Tour Leader', catatan: 'Verifikasi kehadiran, pembagian souvenir, screening fisik, cek tensi peserta' },
  { id: 't-2', jam: '06.00 - 08.30', aktivitas: 'Perjalanan ke Basecamp Pendakian', lokasi: 'Tol, Jalan Trans-Kabupaten', pic: 'Driver & Kru', catatan: 'Menggunakan Toyota HiAce / ELF, pembagian konsumsi snack pagi' },
  { id: 't-3', jam: '08.30 - 09.30', aktivitas: 'Registrasi Simaksi & Repacking', lokasi: 'Basecamp Resmi Gunung', pic: 'Assistant Guide', catatan: 'Pemeriksaan tiket, repacking logistik tim ke porter, peregangan fisik bersama kawan' },
  { id: 't-4', jam: '09.30 - 12.00', aktivitas: 'Trekking Tahap I (Start - Pos 2)', lokasi: 'Pintu Rimba menuju Jalur Hutan', pic: 'Leader / Porter', catatan: 'Pace diatur lambat-stabil (tanjakan pembuka), briefing break 5 menit tiap pos' },
  { id: 't-5', jam: '12.00 - 13.00', aktivitas: 'Break Makan Siang Lapangan', lokasi: 'Pos 2 Bayangan / Shelter', pic: 'Kru Lapangan', catatan: 'Pembagian nasi box bergizi katering lapangan, pengisian ulang jerigen air minum' },
  { id: 't-6', jam: '13.00 - 16.30', aktivitas: 'Trekking Tahap II (Pos 2 - Camp Area)', lokasi: 'Hutan Gunung Atas', pic: 'Sweeper', catatan: 'Menjaga rombongan belakang agar tetap rapat, monitoring peserta fisik rendah (Amelia/Budi)' },
  { id: 't-7', jam: '16.30 - 18.00', aktivitas: 'Setup Campsite & Distribusi Tenda', lokasi: 'Campsite Area Utama', pic: 'Porter & Kru', catatan: 'Tenda dipasang menghadap searah angin, pembagian kantong sampah, welcome drink hangat' },
  { id: 't-8', jam: '18.00 - 20.30', aktivitas: 'Makan Malam & Briefing Summit Attack', lokasi: 'Tenda Makan Bersama/Campsite', pic: 'Tour Leader', catatan: 'Makan malam hangat, evaluasi fisik peserta, safety talk khusus taktis pendakian puncak' },
  { id: 't-9', jam: '20.30 - 02.00', aktivitas: 'Waktu Istirahat Wajib / Sleeping', lokasi: 'Tenda Masing-masing', pic: 'Seluruh Rombongan', catatan: 'Disiplin silent mode, matikan lampu badai, jaga kehangatan dalam sleeping bag' },
  { id: 't-10', jam: '02.00 - 02.30', aktivitas: 'Morning Wake-up & Supper Hangat', lokasi: 'Campsite Area', pic: 'Kru Masak', catatan: 'Pembagian teh manis hangat kental, biskuit jahe sebagai booster energi awal' },
  { id: 't-11', jam: '02.30 - 03.00', aktivitas: 'Technical Briefing & Doa Bersama', lokasi: 'Campsite Area', pic: 'Tour Leader', catatan: 'Memastikan semua membawa jaket tebal, sarung tangan, air minum, obat pribadi, do’a' },
  { id: 't-12', jam: '03.00 - 06.00', aktivitas: 'Summit Attack (Tanjakan Puncak)', lokasi: 'Jalur Pasir, Kerikil, Batuan', pic: 'TL & Sweeper', catatan: 'Pace super disiplin, rombongan diapit ketat, pendampingan ekstra bagi peserta rentan' },
  { id: 't-13', jam: '06.00 - 07.30', aktivitas: 'Dokumentasi & Syukur di Puncak', lokasi: 'Puncak Gunung Agung', pic: 'Dokumentasi', catatan: 'Foto ekspedisi bersama bendera sponsor/komunitas, koordinasi waktu turun sebelum badai' },
  { id: 't-14', jam: '07.30 - 09.00', aktivitas: 'Trekking Turun ke Campsite Area', lokasi: 'Jalur Kemiringan Puncak', pic: 'Kru Lapangan', catatan: 'Lutut rawan! Selalu pijak pijakan solid, dilarang berlari sekencang mungkin' },
  { id: 't-15', jam: '09.00 - 11.00', aktivitas: 'Makan Pagi Besar & Packing Campsite', lokasi: 'Campsite Area', pic: 'Kru & Porter', catatan: 'Pemberian sarapan padat gizi, jemur tenda sebentar, cleanup area dari sampah (No Trace!)' },
  { id: 't-16', jam: '11.00 - 14.30', aktivitas: 'Descent Trekking Turun ke Basecamp', lokasi: 'Hutan Menengah / Pintu Rimba', pic: 'Sweeper', catatan: 'Rapatkan barisan, monitoring dehidrasi dan kram otot tungkai bawah' },
  { id: 't-17', jam: '14.30 - 16.00', aktivitas: 'Debriefing Layanan & Evaluasi', lokasi: 'Basecamp Resmi Gunung', pic: 'Tour Leader', catatan: 'Pemberian piagam simbolis, makan siang penutup, serah terima sampah, persiapan mobilisasii' }
];

export const getDefaultSafetyRisks = (): SafetyRiskItem[] => [
  { id: 'sr-1', potensiRisiko: 'Hujan Lebat / Badai Petir di Jalur Pendakian', mitigasi: 'Membagikan Poncho/Raincoat berkualitas di pintu rimba, wajib mengenakan pakaian quick-dry, tidak boleh berada di tempat terbuka saat badai, koordinasi shelter alternatif terdekat.', levelRisiko: 'High', keputusanOperasional: 'Jika petir dan angin membahayakan jalur terbuka, wajib hentikan pergerakan di vegetasi rapat terbawah.' },
  { id: 'sr-2', potensiRisiko: 'Serangan Hipotermia (Kedinginan Ekstrem)', mitigasi: 'Melarang penggunaan pakaian berbahan katun/jeans, memastikan sleeping bag & thermal blanket mencukupi, sedia kompor darurat & air panas di tas TL, pembagian madu/biskuit energi harian.', levelRisiko: 'Critical', keputusanOperasional: 'Lakukan evakuasi instan menggunakan thermal bag, ganti baju basah korban, peluk dengan sleeping bag hangat, berikan asupan cairan gula hangat hangat.' },
  { id: 'sr-3', potensiRisiko: 'Keseleo, Cedera Sendi, Luka Robek di Jalur', mitigasi: 'Wajib menggunakan sepatu outdoor bergerigi/grip tebal, membagikan minimal satu trekking pole bagi yang menderita kram/kekurangan keseimbangan, kru dibekali kinesiology tape, elastis perban, kompres es.', levelRisiko: 'Medium', keputusanOperasional: 'Kurangi beban ransel korban, balut fiksasi kencang dengan perban elastis, bantu pacing paling lambat, atau sewakan porter gendong jika tidak sanggup melangkah.' },
  { id: 'sr-4', potensiRisiko: 'Dehidrasi Berat atau Kram Otot Tungkai Ganas', mitigasi: 'Pemeriksaan stok air di basecamp (minimal 3 Liter per kepala), pembagian suplemen oralit/isotonik cair sebelum menanjak, istirahat peregangan otot rutin.', levelRisiko: 'Medium', keputusanOperasional: 'TL berhak menyuruh minum isotonik berkala, oles balsem penghangat, pijat refleksi ringan di tumpuan otot kram.' },
  { id: 'sr-5', potensiRisiko: 'Tersesat / Terpisah Dari Rombongan Utama', mitigasi: 'Pembagian kru di depan (Navigator/Leader) dan belakang (Sweeper/Asisten Guide). Memberi kode peluit keras di persimpangan bercabang, dilarang memisahkan diri tanpa izin.', levelRisiko: 'High', keputusanOperasional: 'Kru sweeper dilarang mendahului rombongan paling lambat. Bila terpisah, korban wajib diam di tempat yang tampak, bunyikan peluit berulang.' }
];

export const getDefaultEmergencyScenarios = (): EmergencyScenarioItem[] => [
  { id: 'es-1', kategori: 'Trekking', skenario: 'Ada Peserta Pingsan / Drop Karena Kelelahan Berat atau Kram Perut Akut', alurTindakan: '1. Amankan korban di area datar, teduhkan dari terik mathari atau hujan. \n2. TL/Asisten cek denyut nadi dan kesadaran, berikan oksigen portabel secepatnya. \n3. Hangatkan badan dan longgarkan ikat pinggang / kelengkapan kencang. \n4. Berikan madu cair jika sadar penuh. \n5. Jika kondisi stagnan tidak membaik, siapkan tandu darurat untuk evakuasi ke basecamp.', pic: 'Asisten Guide & Sweeper', kontakDarurat: 'Ranger Basecamp' },
  { id: 'es-2', kategori: 'Camp Area', skenario: 'Badai Angin Mengakibatkan Tenda Robek & Perlengkapan Basah Kuyup', alurTindakan: '1. Pindahkan peserta terimbas ke tenda komunal barengin atau tenda kru yang aman. \n2. Gunakan flysheet darurat/poncho untuk membungkus bagian tenda sobek. \n3. Sediakan sleeping bag kering cadangan, baju thermal kering untuk korban dingin. \n4. Nyalakan kompor gas ganda di teras tenda luar untuk merebus air panas instan.', pic: 'Porter Barengin & Dokumentasi', kontakDarurat: 'Tim Logistik Basecamp' },
  { id: 'es-3', kategori: 'Meeting Point', skenario: 'Peserta Tiba dengan Kondisi Fisik Sakit Demam Tinggi Baru Berlangsung Semalam', alurTindakan: '1. Lakukan cek suhu tubuh menggunakan termometer infrared non-kontak. \n2. Konsultasi langsung dengan peserta dan pihak keluarga mengenai riwayat sakit medisnya. \n3. Sarankan membatalkan trip demi keselamatan nyawa (Berlaku skema refund parsial sesuai policy Barengin). \n4. TL menunjuk kru untuk membantu kepulangan peserta dengan transportasi lokal.', pic: 'Tour Leader', kontakDarurat: 'Klinik Terdekat / Puskesmas' }
];

export const getDefaultContacts = (): EmergencyContactItem[] => [
  { id: 'c-1', kategori: 'Basecamp', nama: 'Sekretariat Basecamp Utama (Ranger)', kontak: '0852-4433-2211', alamat: 'Dusun Lereng Gunung No.15' },
  { id: 'c-2', kategori: 'SAR', nama: 'SAR Operasional Regional Lapangan', kontak: '0812-7890-1122', alamat: 'Mako SAR Sektor Lereng Utara' },
  { id: 'c-3', kategori: 'Basarnas', nama: 'Kantor Basarnas Pusat / Pos Wilayah', kontak: '115 (Emergency Line)', alamat: 'Jl. Raya Bandara Udara Nasional' },
  { id: 'c-4', kategori: 'Rumah Sakit', nama: 'RSUD Kabupaten Penanganan Utama', kontak: '0274-887766 ext 118', alamat: 'Jl. Pemuda No. 88 Pusat Kota' },
  { id: 'c-5', kategori: 'Polisi', nama: 'Polsek Sektor Gunung Terdekat', kontak: '110 / 0274-123456', alamat: 'Jl. Bhayangkara No. 4, Kecamatan Gunung' },
  { id: 'c-6', kategori: 'Driver', nama: 'Pak Budi (Armada Transport B Barengin)', kontak: '0818-4444-5555', alamat: 'Garasi Mobil Barengin Jateng' }
];

export const getDefaultSops = () => ({
  sopBriefing: `1. Kumpul tepat waktu: Kru dan peserta wajib hadir 1 jam sebelum keberangkatan di Meeting Point.
2. Kehadiran fisik: Lakukan pengisian absensi peserta, cek suhu tubuh, tensi darah darurat, dan serah terima medical form asli.
3. Repacking Logistik: Pastikan bahan makanan segar dibungkus aman, air minum utama 3L terisi penuh, sampah plastik dikelupas dari tempatnya sebelum naik.
4. Doa bersama: Semua wajib dipimpin berdoa memohon keselamatan ekspedisi kepada Tuhan Yang Maha Esa.`,
  
  sopTrekking: `1. Disiplin Barisan: Leader utama berada paling depan menentukan arah dan pace. Sweeper handal mengunci barisan belakang dan dilarang mendahului peserta lambat.
2. Hiking Pace: Pace trekking disesuaikan dengan kondisi peserta terlambat (Amelia/Budi). Istirahat jalan 5 menit dilakukan setiap 45 menit mendaki.
3. Disiplin Sampah: Permen, puntung rokok, bungkus makanan kecil WAJIB dimasukkan kantong saku celana atau kantong khusus. Dilarang membuang sekecil apapun di sekeliling hutan.
4. Komunikasi Suara: Saling berseru pelan antar pos atau membunyikan peluit jika terpisah kabut tebal.`,
  
  sopCamp: `1. Manajemen Tenda: Tenda didirikan di lahan rata yang terbebas dari lintasan air mengalir apabila hujan deras. Pasang pasak dengan kencang dan arahkan pintu membelakangi arah hembusan angin.
2. Sanitasi & Toilet: Pembuatan lubang buang air (cat-hole) berjarak minimal 50 meter dari badan sungai atau campsite aktif, lalu ditutup timbunan tanah tebal kembali.
3. Urusan Dapur Gizi: Kompor menyala hanya boleh diletakkan di teras tenda yang berventilasi udara. Sediakan asupan gizi piring panas siap santap bergantian kru-peserta.
4. Matikan Api Unggun: Pastikan bara padam sepenuhnya disiram air dingin sebelum rombongan tidur.`,
  
  sopSafety: `1. Pakaian Siap Hujan: Raincoat wajib berada di saku atas tas carrier agar mudah diambil cepat tanpa membongkar isi tas.
2. Thermal Warmer: Sedia emergency blanket di tas daypack masing-masing kru operasional.
3. P3K Mandiri: Kru membawa survival kit gawat darurat (perban, suter, madu sachet, obat asma inhaler cadangan, obat hipertensi, paracetamol).
4. Larangan ego: Puncak adalah bonus keselamatan nyawa kembali pulang ke keluarga tercinta adalah tujuan nomor satu.`,
  
  sopLarangan: `1. Dilarang memetik bunga edelweiss, kantong semar, anggrek, atau flora fauna dilindungi lainnya.
2. Dilarang membuat grafiti coretan di bebatuan alam, plang penunjuk arah pos, atau batang pohon rimbun.
3. Dilarang bertutur kata kasar, berteriak-teriak tidak berfaedah yang bisa memecah konsentrasi pendakian atau melanggar kearifan lokal.
4. Dilarang memisahkan diri sendirian dari rombongan jalur utama tanpa pemberitahuan kru pendamping sweeper.`
});

export const getFallbackPlanTemplate = () => ({
  planBAlternatif: 'Apabila jalur pendakian utama ditutup karena cuaca buruk atau rekomendasi PVMBG, kami akan mengalihkan lintasan ke jalur sekunder yang telah disetujui, atau memindahkan destinasi ke Gunung alternatif terdekat yang selevel risikonya (misal: Alih jalur Merbabu via Selo dialihkan via Suwanting atau alih destinasi Gunung Gede dialihkan ke Gunung Pangrango).',
  planBDelay: 'Jika terjadi penundaan di meeting point karena armada terkendala atau kemacetan lalu lintas, jadwal keberangkatan disesuaikan mundur maksimal 2 jam. Kru akan mempercepat proses makan siang lapangan serta memangkas waktu briefing di basecamp.',
  planBFallback: 'Apabila terjadi hujan petir sangat ekstrem saat summit attack sebelum menjangkau batas vegetasi, rombongan wajib diperintahkan berbalik arah dan turun kembali ke campsite. Keselamatan peserta diletakkan di atas pencapaian puncak.',
  planBCuaca: 'Monitoring prakiraan BMKG harian dilakukan tiap pukul 06.00 dan 18.00 oleh Tour Leader menggunakan HP satelit atau internet basecamp. Jika potensi hujan badai berturut-turut di atas 90%, durasi camp dikompresi menjadi satu malam saja.',
  planBCancel: 'Jika gunung dinyatakan SIAGA atau meletus tiba-tiba atau jalur ditutup total seketika porak-poranda, trip dibatalkan demi keselamatan bersama. Peserta dipulangkan ke meeting point awal dengan skema pengembalian kompensasi logistik sisa.'
});

export const getMountainNotesTemplate = () => ({
  gunungKetinggian: '3.142 mdpl (Meter di atas permukaan laut)',
  gunungSuhu: 'Berkisar antara 8°C hingga 16°C (Ekstrem dingin di malam/subuh hari)',
  gunungJalur: 'Didominasi jalur tanah padat berakar basah, lalu disambung jalur kering pasir berbatu di zona gunung terbuka atas.',
  gunungSumberAir: 'Tersedia sumber air alami deras melimpah di dekat Pos 3 (Air sungai jernih mengalir, layak masak setelah direbus)',
  gunungLarangan: 'Dilarang menggunakan sabun/shampoo kimiawi di sungai sumber air, dilarang berkemah persis di bawah pohon rapuh mati, hormatilah adat suku setempat.',
  gunungTipsLokal: 'Gunakan gaiters pelindung pasir untuk mencegah kerikil menyelinap ke dalam sepatu saat melintasi jalur puncak, siapkan kaos kaki wol ganda saat tidur basah.',
  gunungPermit: 'Simaksi pendaftaran online menyertakan fotokopi KTP/Paspor 2 Lembar, Surat Keterangan Sehat dari dokter yang berlaku maksimal 3 hari.'
});

export const seedTripPlanDraft = (trip: any): TripPlan => {
  const defaults = {
    meetingPoint: 'Basecamp Operasional Semanggi BARENGIN TRIP, JKT',
    armada: 'Toyota HiAce Commuter Premium / ELF Long',
    driver: 'Pak Budi Hartono',
    estimasiCuaca: 'Cerah Berawan di pagi hari, potensi kabut tebal sore menjelang malam hari',
    statusGunung: 'Maks. Level I (Normal Aktif) sesuai rilis BMKG & PVMBG',
    durasiTrip: '2 Hari 1 Malam (Ekspedisi Standar)',
    jumlahPeserta: 5,
    pesertaList: getDefaultParticipants(),
    timeline: getDefaultTimeline(),
    safetyRisks: getDefaultSafetyRisks(),
    emergencyScenarios: getDefaultEmergencyScenarios(),
    kontakPentingList: getDefaultContacts(),
    coverTitle: 'RUN OF PROGRAM',
    coverSubtitle: `${trip.jenisTrip?.toUpperCase() || 'OPEN'} TRIP NO. #T-${trip.id.substring(trip.id.length - 6).toUpperCase()} PENDAKIAN GUNUNG`,
    ...getDefaultSops(),
    ...getFallbackPlanTemplate(),
    ...getMountainNotesTemplate()
  };

  // Pre-seed some structure assignment based on real trip crew
  const timStruktur: TripCrewRoleAssignment[] = (trip.crew || []).map((c: any, index: number) => {
    let roleName: any = 'Dokumentasi';
    let responsibilites = 'Tanggung jawab mendokumentasikan keindahan momen trip & fisik peserta.';
    if (index === 0) {
      roleName = 'Navigator';
      responsibilites = 'Tanggung jawab menavigasi jalur pendakian di garis terdepan, mengatur irama pacenya.';
    } else if (index === 1) {
      roleName = 'Sweeper';
      responsibilites = 'Bertanggung jawab menyapu barisan paling akhir, menjaga peserta lambat tetap aman rapat.';
    } else if (c.role === 'Porter Barengin' || c.role === 'Porter Lokal') {
      roleName = c.role;
      responsibilites = 'Membawa logistik tim komunal (tenda sekunder, kompor besar, logistik air & makanan segar).';
    }
    return {
      id: `pcrew-${c.id || index}`,
      namaKru: c.namaKru,
      role: roleName,
      posisi: c.role || 'Kru Pendamping',
      tanggungJawab: responsibilites
    };
  });

  return {
    ...defaults,
    timStruktur
  };
};
