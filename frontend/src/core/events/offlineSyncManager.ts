import { db, SyncQueueItem } from '../db/dexieDB';
import { apiClient } from '../services/apiClient';

export const syncOfflineSales = async (): Promise<number> => {
  if (!navigator.onLine) return 0;
  
  const pendingItems = await db.sync_queue.where('status').equals('pending').toArray();
  if (pendingItems.length === 0) return 0;

  let syncedCount = 0;
  for (const item of pendingItems) {
    try {
      await db.sync_queue.update(item.id!, { status: 'syncing' });
      await apiClient.post('/pos/checkout', item.payload);
      await db.sync_queue.delete(item.id!);
      syncedCount++;
    } catch (error) {
      console.error(`Error sincronizando venta offline ${item.offline_sale_id}:`, error);
      await db.sync_queue.update(item.id!, { status: 'error' });
    }
  }

  return syncedCount;
};

// Escuchar cambios de estado de red
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('🌐 Conexión restablecida. Iniciando sincronización offline...');
    syncOfflineSales();
  });
}
