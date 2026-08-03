import { db, SyncQueueItem } from '../db/dexieDB';
import { apiClient } from '../services/apiClient';

let isSyncing = false;

export const syncOfflineSales = async (): Promise<number> => {
  if (typeof window === 'undefined' || !navigator.onLine || isSyncing) return 0;
  
  isSyncing = true;
  try {
    const pendingItems = await db.sync_queue.where('status').equals('pending').toArray();
    if (pendingItems.length === 0) {
      isSyncing = false;
      return 0;
    }

    let syncedCount = 0;
    for (const item of pendingItems) {
      try {
        await db.sync_queue.update(item.id!, { status: 'syncing' });
        await apiClient.post('/pos/checkout', item.payload);
        await db.sync_queue.delete(item.id!);
        syncedCount++;
      } catch (error) {
        console.error(`Error sincronizando venta offline ${item.offline_sale_id}:`, error);
        await db.sync_queue.update(item.id!, { status: 'pending' });
      }
    }

    if (syncedCount > 0 && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('vendix:offline-sync-complete', { detail: { count: syncedCount } }));
    }

    return syncedCount;
  } finally {
    isSyncing = false;
  }
};

// Escuchar cambios de estado de red y reintentar automáticamente
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('🌐 Conexión restablecida. Sincronizando datos automáticamente...');
    syncOfflineSales();
  });

  // Bucle de sincronización en segundo plano cada 15 segundos
  setInterval(() => {
    if (navigator.onLine) {
      syncOfflineSales();
    }
  }, 15000);
}
