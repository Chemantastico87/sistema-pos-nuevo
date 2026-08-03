import Dexie, { Table } from 'dexie';

export interface LocalProduct {
  id: string;
  company_id: string;
  name: string;
  price: number;
  cost_price?: number | null;
  stock: number;
  barcode?: string;
  sku?: string;
  category_id?: string;
  brand?: string;
  description?: string;
  image_url?: string;
  unit?: string;
  weight?: string;
  vat_rate?: number;
  manufacturer?: string;
  supplier?: string;
  origin?: string;
  created_at?: string;
}

export interface CostHistoryRecord {
  id?: number;
  product_id: string;
  product_name: string;
  previous_cost?: number | null;
  new_cost: number;
  user: string;
  date_time: string;
  reason?: string;
}

export interface DiscoveredProductCache {
  barcode: string;
  name: string;
  brand?: string;
  category?: string;
  description?: string;
  image_url?: string;
  images?: string[];
  unit?: string;
  weight?: string;
  manufacturer?: string;
  vat_rate?: number;
  provider: string;
  cached_at: number;
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
  products_cache!: Table<DiscoveredProductCache>;
  cost_history!: Table<CostHistoryRecord>;
  customers!: Table<LocalCustomer>;
  sync_queue!: Table<SyncQueueItem>;

  constructor() {
    super('POS_SaaS_DexieDB');
    this.version(3).stores({
      products: 'id, name, barcode, sku, company_id',
      products_cache: 'barcode, name, provider, cached_at',
      cost_history: '++id, product_id, date_time',
      customers: 'id, name, phone, company_id',
      sync_queue: '++id, offline_sale_id, status, created_at'
    });
  }
}

export const db = new POSDatabase();
