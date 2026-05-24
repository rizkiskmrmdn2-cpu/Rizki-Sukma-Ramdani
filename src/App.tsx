import React, { useState, useEffect, useMemo } from 'react';
import { 
  Lock, 
  MapPin, 
  Compass, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  HelpCircle,
  FileCode,
  Sparkles,
  Info,
  Wifi,
  WifiOff,
  CloudLightning,
  RefreshCw
} from 'lucide-react';
import { InventoryItem, ActivityLog, AppConfig, ActiveSession } from './types';
import { initialInventory, initialLogs, defaultAppConfig } from './utils';
import { db, handleFirestoreError, OperationType } from './firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { 
  getOfflineInventory, 
  getOfflineLogs, 
  getSyncQueue, 
  saveInventoryOffline, 
  deleteInventoryOffline, 
  saveLogOffline, 
  addToSyncQueue, 
  syncOfflineDataWithFirestore 
} from './utils/offlineDb';

// Import Modular Components
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import DatabaseInventaris from './components/DatabaseInventaris';
import LogKeluarMasuk from './components/LogKeluarMasuk';
import PemakaianTrip from './components/PemakaianTrip';
import PerencanaanTripPage from './components/PerencanaanTripPage';
import PenganggaranTripPage from './components/PenganggaranTripPage';
import PengadaanAset from './components/PengadaanAset';
import Laporan from './components/Laporan';
import Konfigurasi from './components/Konfigurasi';
import GoogleAppsScriptCode from './components/GoogleAppsScriptCode';
import PanduanDeploy from './components/PanduanDeploy';

export default function App() {
  // 1. Core States
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Persistence States
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [config, setConfig] = useState<AppConfig>(defaultAppConfig);

  // Offline-First Tracking States
  const [offlineInventory, setOfflineInventory] = useState<InventoryItem[]>([]);
  const [offlineLogs, setOfflineLogs] = useState<ActivityLog[]>([]);
  const [syncQueue, setSyncQueue] = useState<any[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Authentication Fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Load and listen to Firestore real-time snapshots
  useEffect(() => {
    // 1. Sync inventory
    const unsubscribeInv = onSnapshot(collection(db, 'inventory'), (snapshot) => {
      if (snapshot.empty) {
        setInventory([]);
      } else {
        const data: InventoryItem[] = [];
        snapshot.forEach((d) => {
          const item = d.data() as InventoryItem;
          if (item.id !== 'BT-ID-001' && item.id !== 'BT-ID-002' && item.id !== 'BT-ID-003') {
            data.push(item);
          } else {
            // Delete historical default seed items from database
            deleteDoc(doc(db, 'inventory', item.id)).catch(() => {});
          }
        });
        // Sort items by original ID numeric value
        data.sort((a, b) => {
          const numA = parseInt(a.id.replace('BT-ID-', ''), 10);
          const numB = parseInt(b.id.replace('BT-ID-', ''), 10);
          return numA - numB;
        });
        setInventory(data);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'inventory');
    });

    // 2. Sync mutation logs
    const unsubscribeLogs = onSnapshot(collection(db, 'logs'), (snapshot) => {
      if (snapshot.empty) {
        setLogs([]);
      } else {
        const data: ActivityLog[] = [];
        snapshot.forEach((d) => {
          const log = d.data() as ActivityLog;
          if (log.id !== 'LOG-001') {
            data.push(log);
          } else {
            // Delete historical default seed logs from database
            deleteDoc(doc(db, 'logs', log.id)).catch(() => {});
          }
        });
        // Sort newest logs first
        data.sort((a, b) => b.tanggal.localeCompare(a.tanggal) || b.id.localeCompare(a.id));
        setLogs(data);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'logs');
    });

    // 3. Sync singleton configuration doc
    const unsubscribeConfig = onSnapshot(doc(db, 'config', 'settings'), (docSnap) => {
      if (!docSnap.exists()) {
        setDoc(doc(db, 'config', 'settings'), defaultAppConfig).catch((err) => {
          console.error('Error seeding config: ', err);
        });
      } else {
        setConfig(docSnap.data() as AppConfig);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'config/settings');
    });

    // 4. Sync browser-local user session
    const storedSession = localStorage.getItem('bt_session');
    if (storedSession) {
      try {
        setSession(JSON.parse(storedSession));
      } catch (e) {
        console.error('Error loading session:', e);
      }
    }

    return () => {
      unsubscribeInv();
      unsubscribeLogs();
      unsubscribeConfig();
    };
  }, []);

  // Show dynamic notification helper
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load local off-grid datasets
  const loadOfflineData = async () => {
    try {
      const offInv = await getOfflineInventory();
      const offLogs = await getOfflineLogs();
      const queue = await getSyncQueue();
      setOfflineInventory(offInv);
      setOfflineLogs(offLogs);
      setSyncQueue(queue);
    } catch (err) {
      console.warn('Gagal memuat basis data offline (IndexedDB):', err);
    }
  };

  // Connection monitoring and background synchronizer
  useEffect(() => {
    loadOfflineData();

    const handleConnectionOnline = async () => {
      setIsOnline(true);
      showToast('Koneksi internet terdeteksi kembali! Memulai sinkronisasi otomatis...', 'info');
      
      const successCount = await syncOfflineDataWithFirestore(
        () => {}, 
        (msg, type) => showToast(msg, type)
      );
      
      if (successCount > 0) {
        showToast(`${successCount} pembaruan logistik berhasil disinkronkan ke cloud database.`, 'success');
      }
      
      loadOfflineData();
    };

    const handleConnectionOffline = () => {
      setIsOnline(false);
      showToast('Aplikasi beralih ke Mode Offline. Input data tetap dapat dilakukan dengan aman.', 'info');
    };

    window.addEventListener('online', handleConnectionOnline);
    window.addEventListener('offline', handleConnectionOffline);

    // Passive loop scheduler to retry synchronizing tasks every 12 seconds if navigator is online
    const interval = setInterval(async () => {
      if (navigator.onLine && syncQueue.length > 0) {
        try {
          const synced = await syncOfflineDataWithFirestore(
            () => {},
            (msg, type) => showToast(msg, type)
          );
          if (synced > 0) {
            loadOfflineData();
          }
        } catch (e) {
          console.error('[Background AutoSync Loop Failure]', e);
        }
      }
    }, 12000);

    return () => {
      window.removeEventListener('online', handleConnectionOnline);
      window.removeEventListener('offline', handleConnectionOffline);
      clearInterval(interval);
    };
  }, [syncQueue.length]);

  // Merge Firestore data with local offline storage modifications
  const displayedInventory = useMemo(() => {
    const merged = [...inventory];
    
    // Inject any offline items/updates
    offlineInventory.forEach((offItem) => {
      const idx = merged.findIndex((x) => x.id === offItem.id);
      if (idx !== -1) {
        merged[idx] = { ...offItem, isOfflineDraft: true } as any;
      } else {
        merged.push({ ...offItem, isOfflineDraft: true } as any);
      }
    });

    // Remove deleted items if their deletion is currently pending in queue
    syncQueue.forEach((task) => {
      if (task.type === 'DELETE_ITEM') {
        const idToDelete = task.payload as string;
        const idx = merged.findIndex((x) => x.id === idToDelete);
        if (idx !== -1) {
          merged.splice(idx, 1);
        }
      }
    });

    // Sort items by numeric ID value
    return merged.sort((a, b) => {
      const numA = parseInt(a.id.replace('BT-ID-', ''), 10);
      const numB = parseInt(b.id.replace('BT-ID-', ''), 10);
      return numA - numB;
    });
  }, [inventory, offlineInventory, syncQueue]);

  const displayedLogs = useMemo(() => {
    const merged = [...logs];
    
    // Inject offline logs
    offlineLogs.forEach((offLog) => {
      const idx = merged.findIndex((x) => x.id === offLog.id);
      if (idx !== -1) {
        merged[idx] = { ...offLog, isOfflineDraft: true } as any;
      } else {
        merged.push({ ...offLog, isOfflineDraft: true } as any);
      }
    });

    // Sort newest logs first
    return merged.sort((a, b) => b.tanggal.localeCompare(a.tanggal) || b.id.localeCompare(a.id));
  }, [logs, offlineLogs]);

  // 2. Authentication Logic
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Hardcoded credentials with mapped business roles as requested for RBAC
    const users: { [key: string]: { name: string; pass: string; role: string } } = {
      'barengintrip': { name: 'Barengin Admin Ops', pass: 'barengterus', role: 'Super Admin' },
      'rizki': { name: 'Rizki S. (Kepala Logistik)', pass: '040101', role: 'Head of Logistics' },
      'operasional': { name: 'Ops Staff (Alat & Lapangan)', pass: 'ops123', role: 'Operasional' },
      'tourleader': { name: 'TL Dani (Tour Leader)', pass: 'tl123', role: 'Tour Leader' },
      'crew': { name: 'Anggota Crew Aris', pass: 'crew123', role: 'Crew' }
    };

    const userObj = users[username.trim().toLowerCase()];
    if (userObj && userObj.pass === password) {
      const activeSession: ActiveSession = {
        username: username.trim().toLowerCase(),
        name: userObj.name,
        role: userObj.role
      };

      setSession(activeSession);
      localStorage.setItem('bt_session', JSON.stringify(activeSession));
      setLoginError('');
      showToast(`Selamat datang kembali, ${activeSession.name}!`, 'success');
    } else {
      setLoginError('Username atau password salah. Silakan coba lagi.');
    }
  };

  const handleLogout = () => {
    setSession(null);
    localStorage.removeItem('bt_session');
    setUsername('');
    setPassword('');
    showToast('Berhasil keluar dari aplikasi.', 'info');
  };

  // 3. Database CUD Handlers
  const handleSaveItem = async (itemData: Partial<InventoryItem>) => {
    let itemId = itemData.id;
    if (!itemId) {
      // Add Mode
      let maxNum = 0;
      displayedInventory.forEach((item) => {
        const num = parseInt(item.id.replace('BT-ID-', ''), 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      });
      const nextIdNum = maxNum + 1;
      itemId = `BT-ID-${String(nextIdNum).padStart(3, '0')}`;
    }

    const newItem = {
      ...itemData,
      id: itemId
    } as InventoryItem;

    if (!navigator.onLine) {
      try {
        await saveInventoryOffline(newItem);
        await addToSyncQueue({ type: 'SAVE_ITEM', payload: newItem });
        showToast(`[OFFLINE] Barang "${newItem.namaBarang}" disimpan secara lokal (antrean sinkronisasi).`, 'info');
        loadOfflineData();
      } catch (err) {
        showToast('Gagal memproses penyimpanan offline', 'error');
      }
      return;
    }

    try {
      await setDoc(doc(db, 'inventory', itemId), newItem);
      showToast(`Barang "${newItem.namaBarang}" berhasil disimpan!`);
    } catch (err) {
      console.warn('Network write failed, caching offline', err);
      try {
        await saveInventoryOffline(newItem);
        await addToSyncQueue({ type: 'SAVE_ITEM', payload: newItem });
        showToast(`Koneksi lambat. Barang "${newItem.namaBarang}" disimpan lokal & masuk antrean sinkronisasi.`, 'info');
        loadOfflineData();
      } catch (offlineErr) {
        handleFirestoreError(err, OperationType.WRITE, `inventory/${itemId}`);
      }
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!navigator.onLine) {
      try {
        await deleteInventoryOffline(id);
        await addToSyncQueue({ type: 'DELETE_ITEM', payload: id });
        showToast(`[OFFLINE] Barang dengan ID ${id} ditandai hapus dan akan disinkronkan nanti.`, 'info');
        loadOfflineData();
      } catch (err) {
        showToast('Gagal memproses penghapusan offline', 'error');
      }
      return;
    }

    try {
      await deleteDoc(doc(db, 'inventory', id));
      showToast(`Barang dengan ID ${id} berhasil dihapus dari database.`, 'info');
    } catch (err) {
      console.warn('Network deletion failed, queuing offline', err);
      try {
        await deleteInventoryOffline(id);
        await addToSyncQueue({ type: 'DELETE_ITEM', payload: id });
        showToast(`Koneksi lambat. Penghapusan ID ${id} dikoordinasi offline.`, 'info');
        loadOfflineData();
      } catch (offlineErr) {
        handleFirestoreError(err, OperationType.DELETE, `inventory/${id}`);
      }
    }
  };

  const handleAddLog = async (logData: Partial<ActivityLog>) => {
    let maxIdNum = 0;
    displayedLogs.forEach((log) => {
      const num = parseInt(log.id.replace('LOG-', ''), 10);
      if (!isNaN(num) && num > maxIdNum) maxIdNum = num;
    });

    const nextLogId = `LOG-${String(maxIdNum + 1).padStart(3, '0')}`;
    const dateFormatted = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const newLog: ActivityLog = {
      ...logData,
      id: nextLogId,
      tanggal: dateFormatted
    } as ActivityLog;

    // Update stok barang di database
    const itemToUpdate = displayedInventory.find(item => item.id === logData.idBarang);
    let updatedItem: InventoryItem | undefined = undefined;
    
    if (itemToUpdate) {
      const qtyMutasi = logData.jumlah || 1;
      let newQty = itemToUpdate.kuantitas;
      let newStatus = itemToUpdate.statusBarang;

      if (logData.statusPengembalian === 'Belum Kembali') {
        if (['Pemakaian Trip', 'Penyewaan Barang', 'Pemakaian Pribadi Internal'].includes(logData.jenisAktivitas || '')) {
          newQty = Math.max(0, itemToUpdate.kuantitas - qtyMutasi);
          newStatus = 'Pemakaian';
        } else if (logData.jenisAktivitas === 'Dijual') {
          newQty = Math.max(0, itemToUpdate.kuantitas - qtyMutasi);
          newStatus = 'Ready';
        } else if (logData.jenisAktivitas === 'Reparasi') {
          newStatus = 'Perbaikan';
        } else if (logData.jenisAktivitas === 'Perawatan') {
          newStatus = 'Perawatan';
        }
      }

      updatedItem = {
        ...itemToUpdate,
        kuantitas: newQty,
        statusBarang: newStatus
      };
    }

    if (!navigator.onLine) {
      try {
        await saveLogOffline(newLog);
        if (updatedItem) {
          await saveInventoryOffline(updatedItem);
        }
        await addToSyncQueue({
          type: 'ADD_LOG',
          payload: { log: newLog, updatedItem }
        });
        showToast(`[OFFLINE] Aktivitas ${logData.jenisAktivitas} dicatat secara lokal.`, 'info');
        loadOfflineData();
      } catch (err) {
        showToast('Gagal memproses pencatatan aktivitas offline', 'error');
      }
      return;
    }

    if (updatedItem) {
      try {
        await setDoc(doc(db, 'inventory', updatedItem.id), updatedItem);
      } catch (err) {
        console.warn('Failed item qty sync, fallback both to offline', err);
        try {
          await saveLogOffline(newLog);
          await saveInventoryOffline(updatedItem);
          await addToSyncQueue({
            type: 'ADD_LOG',
            payload: { log: newLog, updatedItem }
          });
          showToast(`Koneksi tak stabil. Data mutasi ${logData.jenisAktivitas} dicadangkan offline.`, 'info');
          loadOfflineData();
          return;
        } catch (offlineErr) {
          handleFirestoreError(err, OperationType.WRITE, `inventory/${updatedItem.id}`);
        }
      }
    }

    try {
      await setDoc(doc(db, 'logs', nextLogId), newLog);
      showToast(`Aktivitas ${logData.jenisAktivitas} berhasil dicatat dan stok disinkronisasi.`);
    } catch (err) {
      console.warn('Failed log sync, fallback log to offline', err);
      try {
        await saveLogOffline(newLog);
        await addToSyncQueue({
          type: 'ADD_LOG',
          payload: { log: newLog, updatedItem }
        });
        showToast(`Koneksi terganggu. Log aktivitas ${logData.jenisAktivitas} disimpan offline.`, 'info');
        loadOfflineData();
      } catch (offlineErr) {
        handleFirestoreError(err, OperationType.WRITE, `logs/${nextLogId}`);
      }
    }
  };

  const handleReturnItem = async (logId: string, kondisiKembali: 'Baru' | 'Baik' | 'Rusak Ringan' | 'Tidak Dapat Dipakai') => {
    const logToReturn = displayedLogs.find((log) => log.id === logId);
    if (!logToReturn || logToReturn.statusPengembalian === 'Sudah Kembali') return;

    const updatedLog: ActivityLog = {
      ...logToReturn,
      statusPengembalian: 'Sudah Kembali' as const,
      kondisiKembali,
      tanggal: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    const itemToUpdate = displayedInventory.find(item => item.id === logToReturn.idBarang);
    let updatedItem: InventoryItem | undefined = undefined;
    if (itemToUpdate) {
      updatedItem = {
        ...itemToUpdate,
        kuantitas: itemToUpdate.kuantitas + logToReturn.jumlah,
        statusBarang: 'Ready' as const,
        kondisiBarang: kondisiKembali
      };
    }

    if (!navigator.onLine) {
      try {
        await saveLogOffline(updatedLog);
        if (updatedItem) {
          await saveInventoryOffline(updatedItem);
        }
        await addToSyncQueue({
          type: 'RETURN_ITEM',
          payload: { log: updatedLog, updatedItem }
        });
        showToast(`[OFFLINE] Pengembalian dicatat secara lokal.`, 'info');
        loadOfflineData();
      } catch (err) {
        showToast('Gagal memproses pengembalian offline', 'error');
      }
      return;
    }

    if (updatedItem) {
      try {
        await setDoc(doc(db, 'inventory', updatedItem.id), updatedItem);
      } catch (err) {
        console.warn('Failed return item update, fell back to offline queue', err);
        try {
          await saveLogOffline(updatedLog);
          await saveInventoryOffline(updatedItem);
          await addToSyncQueue({
            type: 'RETURN_ITEM',
            payload: { log: updatedLog, updatedItem }
          });
          loadOfflineData();
          return;
        } catch (offlineErr) {}
      }
    }

    try {
      await setDoc(doc(db, 'logs', logId), updatedLog);
      showToast(`Barang "${logToReturn.namaBarang}" sebanyak ${logToReturn.jumlah} pcs berhasil dikembalikan ke Basecamp.`, 'success');
    } catch (err) {
      console.warn('Failed return log update, fell back to offline queue', err);
      try {
        await saveLogOffline(updatedLog);
        if (updatedItem) await saveInventoryOffline(updatedItem);
        await addToSyncQueue({
          type: 'RETURN_ITEM',
          payload: { log: updatedLog, updatedItem }
        });
        loadOfflineData();
      } catch (offlineErr) {
        handleFirestoreError(err, OperationType.WRITE, `logs/${logId}`);
      }
    }
  };

  const handleSaveConfig = async (newConfig: AppConfig) => {
    try {
      await setDoc(doc(db, 'config', 'settings'), newConfig);
      showToast('Konfigurasi instansi berhasil disimpan.');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'config/settings');
    }
  };

  const handleResetAllData = async () => {
    try {
      // Delete all inventories
      for (const item of inventory) {
        await deleteDoc(doc(db, 'inventory', item.id));
      }
      // Delete all logs
      for (const log of logs) {
        await deleteDoc(doc(db, 'logs', log.id));
      }
      // Also delete config
      await deleteDoc(doc(db, 'config', 'settings'));

      showToast('Semua data contoh berhasil dihapus. Sistem sekarang bersih 100% dari nol!', 'success');
      setTimeout(() => {
         window.location.reload();
      }, 1000);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'bulk-reset');
    }
  };

  // Render Login Frame jika belum login
  if (!session) {
    return (
      <main id="login-viewport" className="min-h-screen flex items-center justify-center bg-radial from-emerald-950 to-slate-950 relative p-4">
        {/* Dynamic ambient background image simulating outdoor warehouse gear */}
        <div 
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-35" 
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1200&q=80')` }}
        />

        <div className="relative w-full max-w-md z-15 bg-white/95 rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Brand Logo */}
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border border-emerald-100 shadow-md overflow-hidden p-0">
              <img 
                src={config.logoUrl || 'https://lh3.googleusercontent.com/d/1C-scCTu7H2eOa-ZtDhak1JcbRhTNCCIb'} 
                alt="Logo" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = 'https://lh3.googleusercontent.com/d/1C-scCTu7H2eOa-ZtDhak1JcbRhTNCCIb';
                }}
              />
            </div>

            <div>
              <h1 className="text-xl font-extrabold text-slate-850 tracking-tight">Operasional BARENGIN TRIP</h1>
              <p className="text-[10px] font-bold text-[#11512f] uppercase tracking-wider mt-1.5">Sistem Manajemen Inventaris</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="w-full text-left space-y-4 text-xs">
              {loginError && (
                <div id="login-alert-msg" className="p-3 bg-rose-50 border border-rose-100/60 rounded-xl text-rose-700 font-semibold flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-rose-500 mt-0.5 flex-shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Username Lapangan</label>
                <input
                  id="login-username-input"
                  type="text"
                  required
                  placeholder="Cth: barengintrip"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-hidden focus:border-[#11512f] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Password Sandi</label>
                <input
                  id="login-password-input"
                  type="password"
                  required
                  placeholder="Cth: barengterus"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-hidden focus:border-[#11512f] focus:bg-white transition"
                />
              </div>

              <button
                id="btn-login-submit"
                type="submit"
                className="w-full py-2.5 bg-[#11512f] hover:bg-emerald-800 text-white font-bold rounded-xl transition cursor-pointer shadow-md text-center inline-block"
              >
                Masuk Sistem <Lock className="h-3.5 w-3.5 inline ml-1.5 mb-0.5" />
              </button>
            </form>

            <div className="w-full text-left space-y-2 mt-4">
              <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Akses Cepat Penguji (RBAC Simulasi)</span>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-705">
                <button
                  type="button"
                  onClick={() => { setUsername('rizki'); setPassword('040101'); }}
                  className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 p-1.5 rounded-lg text-left font-bold text-[#11512f] text-[9.5px]"
                >
                  Head of Logistics <span className="block text-[8px] font-normal text-slate-400">rizki / 040101</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setUsername('barengintrip'); setPassword('barengterus'); }}
                  className="bg-teal-50 hover:bg-teal-100 border border-teal-100 p-1.5 rounded-lg text-left font-bold text-teal-800 text-[9.5px]"
                >
                  Super Admin <span className="block text-[8px] font-normal text-slate-400">barengintrip / barengterus</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setUsername('tourleader'); setPassword('tl123'); }}
                  className="bg-amber-50 hover:bg-amber-100 border border-amber-100 p-1.5 rounded-lg text-left font-bold text-amber-800 text-[9.5px]"
                >
                  Tour Leader <span className="block text-[8px] font-normal text-slate-400">tourleader / tl123</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setUsername('crew'); setPassword('crew123'); }}
                  className="bg-slate-100 hover:bg-slate-200 border border-slate-250 p-1.5 rounded-lg text-left font-bold text-slate-700 text-[9.5px]"
                >
                  Crew Lapangan <span className="block text-[8px] font-normal text-slate-400">crew / crew123</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Render Utama Dashboard Sesudah Login Sukses
  return (
    <div id="full-app-container" className="min-h-screen bg-slate-50/40 text-slate-700 font-sans flex flex-col md:flex-row">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-55 max-w-sm p-4 rounded-xl shadow-xl flex items-start space-x-3 text-xs font-bold border animate-in fade-in slide-in-from-bottom-4 duration-300 bg-white border-slate-100">
          {toast.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <Info className="h-5 w-5 text-sky-500 flex-shrink-0 mt-0.5" />
          )}
          <span className="text-slate-750 flex-1">{toast.message}</span>
        </div>
      )}

      {/* Modern Sidebar left */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        config={config}
        session={session}
        onLogout={handleLogout}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Right Canvas */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Top bar header */}
        <header className="no-print h-16 border-b border-slate-100 bg-white/80 backdrop-blur-xs px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-white border border-emerald-100 p-0 shadow-xs shrink-0">
              <img 
                src={config.logoUrl || 'https://lh3.googleusercontent.com/d/1C-scCTu7H2eOa-ZtDhak1JcbRhTNCCIb'} 
                alt="Logo" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = 'https://lh3.googleusercontent.com/d/1C-scCTu7H2eOa-ZtDhak1JcbRhTNCCIb';
                }}
              />
            </div>
            <span className="text-xs font-extrabold tracking-wider text-[#11512f] uppercase">PT. BARENGIN TRIP LOGISTIK</span>
          </div>
          
          <div className="text-[10px] font-mono font-bold flex items-center space-x-3.5 select-none">
            {/* Sync Queue Status */}
            {syncQueue.length > 0 && (
              <span className="bg-amber-50 text-amber-805 px-2.5 py-1 rounded-md border border-amber-200/60 flex items-center space-x-1.5 animate-pulse shrink-0">
                <RefreshCw className="h-3 w-3 animate-spin text-amber-600" />
                <span className="hidden sm:inline">Sync Antrean ({syncQueue.length})</span>
                <span className="sm:hidden">Draft ({syncQueue.length})</span>
              </span>
            )}

            {/* Connection Status indicator */}
            {isOnline ? (
              <span className="bg-emerald-50 text-emerald-800 px-2.5 py-1.0 rounded-md border border-emerald-100 flex items-center space-x-1 shrink-0">
                <Wifi className="h-3 w-3 text-emerald-600 shrink-0" />
                <span>ONLINE</span>
              </span>
            ) : (
              <span className="bg-rose-50 text-rose-800 px-2.5 py-1.0 rounded-md border border-rose-200 flex items-center space-x-1 animate-pulse shrink-0">
                <WifiOff className="h-3 w-3 text-rose-650 shrink-0" />
                <span>OFFLINE MODE</span>
              </span>
            )}

            <span className="bg-emerald-50 text-[#11512f] px-2.5 py-1 rounded-md border border-emerald-100 hidden md:inline shrink-0">
              ● Serverless Google Sheet Sync
            </span>
          </div>
        </header>

        {/* Dynamic Tab Workspace panels */}
        <main className="p-6 flex-1 max-w-6xl w-full mx-auto pb-12">
          {activeTab === 'dashboard' && (
            <Dashboard 
              inventory={displayedInventory} 
              logs={displayedLogs} 
              onReturnItem={handleReturnItem} 
            />
          )}

          {activeTab === 'inventaris' && (
            <DatabaseInventaris 
              inventory={displayedInventory} 
              onSaveItem={handleSaveItem} 
              onDeleteItem={handleDeleteItem} 
              picName={config.picName} 
            />
          )}

          {activeTab === 'mutasi' && (
            <LogKeluarMasuk 
              inventory={displayedInventory} 
              logs={displayedLogs} 
              onAddLog={handleAddLog} 
              onReturnItem={handleReturnItem} 
              picName={config.picName} 
            />
          )}

          {activeTab === 'packing' && (
            <PemakaianTrip 
              inventory={displayedInventory} 
              userRole={session?.role || ''}
              config={config}
            />
          )}

          {activeTab === 'perencanaan' && (
            <PerencanaanTripPage />
          )}

          {activeTab === 'anggaran' && (
            <PenganggaranTripPage />
          )}

          {activeTab === 'pengadaan' && (
            <PengadaanAset 
              inventory={displayedInventory}
              onAddInventarisItem={handleSaveItem}
              userRole={session?.role || ''}
            />
          )}

          {activeTab === 'laporan' && (
            <Laporan 
              inventory={displayedInventory} 
              logs={displayedLogs} 
              config={config} 
            />
          )}

          {activeTab === 'config' && (
            <Konfigurasi 
              config={config} 
              onSaveConfig={handleSaveConfig} 
              onResetAllData={handleResetAllData}
            />
          )}

          {activeTab === 'code' && (
            <div className="space-y-8">
              <GoogleAppsScriptCode 
                spreadsheetUrl={config.spreadsheetUrl} 
                driveFolderUrl={config.driveFolderUrl} 
              />
              <PanduanDeploy />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
