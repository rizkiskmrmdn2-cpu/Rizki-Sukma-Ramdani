import { db } from '../firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { InventoryItem, ActivityLog } from '../types';

const DB_NAME = 'barengin_offline_db';
const DB_VERSION = 1;

export interface OfflineSyncTask {
  id: string; // Unique timestamp-based ID e.g. "task-1716543210000"
  type: 'SAVE_ITEM' | 'DELETE_ITEM' | 'ADD_LOG' | 'RETURN_ITEM';
  payload: any;
  timestamp: string;
}

// Open IndexedDB Connection
export function initOfflineDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not supported in this browser.'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('offline_inventory')) {
        db.createObjectStore('offline_inventory', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('offline_logs')) {
        db.createObjectStore('offline_logs', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('offline_sync_queue')) {
        db.createObjectStore('offline_sync_queue', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Basic Generic CRUD Wrappers
function performTransaction<T>(
  storeName: string,
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => IDBRequest
): Promise<T> {
  return initOfflineDb().then((db) => {
    return new Promise<T>((resolve, reject) => {
      const transaction = db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);
      const request = callback(store);

      request.onsuccess = () => resolve(request.result as T);
      request.onerror = () => reject(request.error);
    });
  });
}

function getAllFromStore<T>(storeName: string): Promise<T[]> {
  return initOfflineDb().then((db) => {
    return new Promise<T[]>((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result as T[]);
      request.onerror = () => reject(request.error);
    });
  });
}

// ------------------- INVENTORY STORE -------------------
export function saveInventoryOffline(item: InventoryItem): Promise<void> {
  return performTransaction<void>('offline_inventory', 'readwrite', (store) => {
    return store.put(item);
  });
}

export function deleteInventoryOffline(id: string): Promise<void> {
  return performTransaction<void>('offline_inventory', 'readwrite', (store) => {
    return store.delete(id);
  });
}

export function getOfflineInventory(): Promise<InventoryItem[]> {
  return getAllFromStore<InventoryItem>('offline_inventory').catch(() => []);
}

// ---------------------- LOGS STORE ----------------------
export function saveLogOffline(log: ActivityLog): Promise<void> {
  return performTransaction<void>('offline_logs', 'readwrite', (store) => {
    return store.put(log);
  });
}

export function getOfflineLogs(): Promise<ActivityLog[]> {
  return getAllFromStore<ActivityLog>('offline_logs').catch(() => []);
}

// -------------------- SYNC QUEUE STORE --------------------
export function addToSyncQueue(task: Omit<OfflineSyncTask, 'id' | 'timestamp'>): Promise<OfflineSyncTask> {
  const newTask: OfflineSyncTask = {
    ...task,
    id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString()
  };
  return performTransaction<OfflineSyncTask>('offline_sync_queue', 'readwrite', (store) => {
    return store.put(newTask);
  }).then(() => newTask);
}

export function getSyncQueue(): Promise<OfflineSyncTask[]> {
  return getAllFromStore<OfflineSyncTask>('offline_sync_queue').catch(() => []);
}

export function removeFromSyncQueue(id: string): Promise<void> {
  return performTransaction<void>('offline_sync_queue', 'readwrite', (store) => {
    return store.delete(id);
  });
}

export function clearOfflineInventoryItem(id: string): Promise<void> {
  return performTransaction<void>('offline_inventory', 'readwrite', (store) => {
    return store.delete(id);
  });
}

export function clearOfflineLogItem(id: string): Promise<void> {
  return performTransaction<void>('offline_logs', 'readwrite', (store) => {
    return store.delete(id);
  });
}

// Sync execution engine (drains queue item by item)
export async function syncOfflineDataWithFirestore(
  onTaskSynced?: (task: OfflineSyncTask) => void,
  onToastMessage?: (msg: string, type: 'success' | 'info' | 'error') => void
): Promise<number> {
  const queue = await getSyncQueue();
  if (queue.length === 0) return 0;

  let successCount = 0;
  
  // Sort tasks in chronological order so insertions/deletes are consistent
  queue.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  for (const task of queue) {
    try {
      if (task.type === 'SAVE_ITEM') {
        const item = task.payload as InventoryItem;
        await setDoc(doc(db, 'inventory', item.id), item);
        await clearOfflineInventoryItem(item.id);
        if (onToastMessage) onToastMessage(`Sinkronisasi berhasil: Barang "${item.namaBarang}" disimpan online.`, 'success');
      } 
      else if (task.type === 'DELETE_ITEM') {
        const idToDelete = task.payload as string;
        await deleteDoc(doc(db, 'inventory', idToDelete));
        await clearOfflineInventoryItem(idToDelete);
        if (onToastMessage) onToastMessage(`Sinkronisasi berhasil: Barang dengan ID ${idToDelete} diratakan online.`, 'info');
      } 
      else if (task.type === 'ADD_LOG') {
        const { log, updatedItem } = task.payload as { log: ActivityLog; updatedItem?: InventoryItem };
        
        // Save the log
        await setDoc(doc(db, 'logs', log.id), log);
        await clearOfflineLogItem(log.id);

        // Update the item quantity and status if provided
        if (updatedItem) {
          await setDoc(doc(db, 'inventory', updatedItem.id), updatedItem);
          await clearOfflineInventoryItem(updatedItem.id);
        }
        if (onToastMessage) onToastMessage(`Sinkronisasi berhasil: Log mutasi "${log.jenisAktivitas}" telah diunggah.`, 'success');
      }
      else if (task.type === 'RETURN_ITEM') {
        const { log, updatedItem } = task.payload as { log: ActivityLog; updatedItem: InventoryItem };
        await setDoc(doc(db, 'logs', log.id), log);
        await clearOfflineLogItem(log.id);
        
        await setDoc(doc(db, 'inventory', updatedItem.id), updatedItem);
        await clearOfflineInventoryItem(updatedItem.id);
        if (onToastMessage) onToastMessage(`Sinkronisasi berhasil: Pengembalian barang "${updatedItem.namaBarang}" tersimpan online.`, 'success');
      }

      // Remove from queue upon success
      await removeFromSyncQueue(task.id);
      successCount++;
      if (onTaskSynced) onTaskSynced(task);
    } catch (err) {
      console.error('Error syncing queued task: ', task, err);
      // Stop the loop if there's a connectivity/Firestore failure to protect order of operations
      break;
    }
  }

  return successCount;
}
