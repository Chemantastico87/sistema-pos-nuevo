import Dexie, { Table } from 'dexie';

export interface LocalProduct {
  id: string;
  company_id: string;
  name: string;
  price: number;
  cost_price: number;
  stock: number;
  barcode?: string;
  sku?: string;
  category_id?: string;
}

export interface LocalCustomer {
  id: string;
  company_id: string;
  name: string;
  phone?: string;
  points: number;
}

export interface SyncQueueItem {
  id?: number;
  offline_sale_id: string;
  payload: any;
  created_at: number;
  status: 'pending' | 'syncing' | 'error';
}

export class POSDatabase extends Dexie {
  products!: Table<LocalProduct>;
  customers!: Table<LocalCustomer>;
  sync_queue!: Table<SyncQueueItem>;

  constructor() {
    super('POS_SaaS_DexieDB');
    this.version(1).stores({
      products: 'id, name, barcode, sku, company_id',
      customers: 'id, name, phone, company_id',
      sync_queue: '++id, offline_sale_id, status, created_at'
    });
  }
}

export const db = new POSDatabase();
