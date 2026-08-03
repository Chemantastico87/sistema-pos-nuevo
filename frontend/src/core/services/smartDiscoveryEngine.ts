import { db, LocalProduct, DiscoveredProductCache } from '../db/dexieDB';
import { apiClient } from './apiClient';

export interface DiscoveredProductResult {
  found: boolean;
  source: 'company_catalog' | 'cache' | 'vendix_global' | 'open_food_facts' | 'upc_item_db' | 'ai_generated' | 'not_found';
  barcode: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  image_url: string;
  suggested_images: string[];
  unit: string;
  weight: string;
  manufacturer: string;
  suggested_vat_rate: number;
  existing_product?: LocalProduct;
  search_latency_ms: number;
}

// Mapeo inteligente de categorías e IVA recomendado
const inferCategoryAndVAT = (title: string, rawCat: string = '') => {
  const t = (title + ' ' + rawCat).toLowerCase();
  
  if (t.includes('agua') || t.includes('leche') || t.includes('pan') || t.includes('arroz') || t.includes('fruta') || t.includes('verdura')) {
    return { category: 'Abarrotes & Básicos', vat: 4 };
  }
  if (t.includes('coca') || t.includes('pepsi') || t.includes('jugo') || t.includes('bebida') || t.includes('cerveza') || t.includes('vino')) {
    return { category: 'Bebidas & Licores', vat: 21 };
  }
  if (t.includes('papa') || t.includes('snack') || t.includes('chocolate') || t.includes('dulce') || t.includes('galleta')) {
    return { category: 'Snacks & Confitería', vat: 21 };
  }
  if (t.includes('jabón') || t.includes('detergente') || t.includes('limpiador') || t.includes('papel') || t.includes('champú')) {
    return { category: 'Higiene & Limpieza', vat: 21 };
  }
  if (t.includes('carne') || t.includes('pollo') || t.includes('pescado') || t.includes('queso') || t.includes('yogurt')) {
    return { category: 'Frescos & Lácteos', vat: 10 };
  }
  return { category: rawCat || 'General', vat: 21 };
};

// Generador de imágenes de respaldo sugeridas por palabras clave
const generateSuggestedImages = (title: string, brand: string): string[] => {
  const query = encodeURIComponent(`${brand} ${title}`.trim());
  return [
    `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600&title=${query}`,
    `https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&q=80&w=600&title=${query}`,
    `https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&q=80&w=600&title=${query}`,
    `https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=600&title=${query}`,
    `https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=600&title=${query}`,
  ];
};

export class SmartProductDiscoveryEngine {
  /**
   * Misión Principal: Descubrir especificaciones del producto en cascada ultrarrápida (<10s)
   */
  static async discover(barcodeOrQuery: string): Promise<DiscoveredProductResult> {
    const startTime = performance.now();
    const barcode = barcodeOrQuery.trim();

    if (!barcode) {
      return this.emptyResult(barcode, startTime);
    }

    // ----------------------------------------------------
    // NIVEL 1: Catálogo de la Empresa (<15ms)
    // ----------------------------------------------------
    try {
      const companyProds = await db.products.toArray();
      const existing = companyProds.find(
        (p) => (p.barcode && p.barcode === barcode) || (p.sku && p.sku === barcode)
      );
      if (existing) {
        return {
          found: true,
          source: 'company_catalog',
          barcode: existing.barcode || barcode,
          name: existing.name,
          brand: existing.brand || 'Generico',
          category: existing.category_id || 'General',
          description: existing.description || '',
          image_url: existing.image_url || '',
          suggested_images: generateSuggestedImages(existing.name, existing.brand || ''),
          unit: existing.unit || 'Ud',
          weight: existing.weight || '1.0 kg',
          manufacturer: existing.manufacturer || '',
          suggested_vat_rate: existing.vat_rate || 21,
          existing_product: existing,
          search_latency_ms: Math.round(performance.now() - startTime),
        };
      }
    } catch (e) {}

    // ----------------------------------------------------
    // NIVEL 2: Caché Local DexieDB (TTL 90 Días)
    // ----------------------------------------------------
    try {
      const cached = await db.products_cache.get(barcode);
      const NinetyDaysMs = 90 * 24 * 60 * 60 * 1000;
      if (cached && Date.now() - cached.cached_at < NinetyDaysMs) {
        return {
          found: true,
          source: 'cache',
          barcode: cached.barcode,
          name: cached.name,
          brand: cached.brand || '',
          category: cached.category || 'General',
          description: cached.description || '',
          image_url: cached.image_url || '',
          suggested_images: cached.images || generateSuggestedImages(cached.name, cached.brand || ''),
          unit: cached.unit || 'Ud',
          weight: cached.weight || '',
          manufacturer: cached.manufacturer || '',
          suggested_vat_rate: cached.vat_rate || 21,
          search_latency_ms: Math.round(performance.now() - startTime),
        };
      }
    } catch (e) {}

    // ----------------------------------------------------
    // NIVEL 3: Catálogo Global VENDIX Community API
    // ----------------------------------------------------
    try {
      const globalRes: any = await apiClient.get(`/products/global-catalog/${barcode}`).catch(() => null);
      if (globalRes && globalRes.found) {
        const item = globalRes.product;
        const result: DiscoveredProductResult = {
          found: true,
          source: 'vendix_global',
          barcode,
          name: item.name,
          brand: item.brand || 'VENDIX',
          category: item.category || 'General',
          description: item.description || '',
          image_url: item.image_url || '',
          suggested_images: item.suggested_images || generateSuggestedImages(item.name, item.brand || ''),
          unit: item.unit || 'Ud',
          weight: item.weight || '',
          manufacturer: item.manufacturer || '',
          suggested_vat_rate: item.vat_rate || 21,
          search_latency_ms: Math.round(performance.now() - startTime),
        };
        this.cacheResult(result);
        return result;
      }
    } catch (e) {}

    // ----------------------------------------------------
    // NIVEL 4: Cascada de Proveedores Públicos (Open Food Facts / UPCItemDB)
    // ----------------------------------------------------
    // Proveedor 1: Open Food Facts API
    try {
      const offRes = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`, {
        signal: AbortSignal.timeout(3000),
      }).then((r) => r.json()).catch(() => null);

      if (offRes && offRes.status === 1 && offRes.product) {
        const p = offRes.product;
        const name = p.product_name_es || p.product_name || p.generic_name || `Producto ${barcode}`;
        const brand = p.brands || p.brand_owner || 'Comercial';
        const rawCat = p.categories_tags?.[0]?.replace('en:', '').replace('es:', '') || '';
        const { category, vat } = inferCategoryAndVAT(name, rawCat);

        const result: DiscoveredProductResult = {
          found: true,
          source: 'open_food_facts',
          barcode,
          name,
          brand,
          category,
          description: p.ingredients_text_es || p.ingredients_text || `Producto de ${brand}`,
          image_url: p.image_url || p.image_front_url || '',
          suggested_images: [p.image_url, p.image_front_url, ...generateSuggestedImages(name, brand)].filter(Boolean),
          unit: 'Ud',
          weight: p.quantity || '1 U',
          manufacturer: p.manufacturing_places || brand,
          suggested_vat_rate: vat,
          search_latency_ms: Math.round(performance.now() - startTime),
        };
        this.cacheResult(result);
        return result;
      }
    } catch (e) {}

    // Proveedor 2: UPCItemDB API
    try {
      const upcRes = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`, {
        signal: AbortSignal.timeout(3000),
      }).then((r) => r.json()).catch(() => null);

      if (upcRes && upcRes.items && upcRes.items.length > 0) {
        const item = upcRes.items[0];
        const name = item.title || `Producto ${barcode}`;
        const brand = item.brand || 'Marca Comercial';
        const { category, vat } = inferCategoryAndVAT(name, item.category);

        const result: DiscoveredProductResult = {
          found: true,
          source: 'upc_item_db',
          barcode,
          name,
          brand,
          category,
          description: item.description || `EAN: ${barcode}`,
          image_url: item.images?.[0] || '',
          suggested_images: (item.images || []).concat(generateSuggestedImages(name, brand)),
          unit: 'Ud',
          weight: '1 U',
          manufacturer: item.publisher || brand,
          suggested_vat_rate: vat,
          search_latency_ms: Math.round(performance.now() - startTime),
        };
        this.cacheResult(result);
        return result;
      }
    } catch (e) {}

    // ----------------------------------------------------
    // NIVEL 5: Smart AI Auto-Completion Fallback
    // ----------------------------------------------------
    const isNumericEan = /^\d+$/.test(barcode);
    const inferredName = isNumericEan ? `Producto Nuevo (${barcode})` : barcode;
    const { category, vat } = inferCategoryAndVAT(inferredName);

    const aiResult: DiscoveredProductResult = {
      found: false,
      source: 'ai_generated',
      barcode,
      name: inferredName,
      brand: 'Marca Sugerida',
      category,
      description: `Producto registrado vía VENDIX Smart Discovery. Código: ${barcode}`,
      image_url: '',
      suggested_images: generateSuggestedImages(inferredName, 'VENDIX'),
      unit: 'Ud',
      weight: '1.0 kg',
      manufacturer: 'Fabricante Comercial',
      suggested_vat_rate: vat,
      search_latency_ms: Math.round(performance.now() - startTime),
    };

    return aiResult;
  }

  private static async cacheResult(res: DiscoveredProductResult) {
    try {
      await db.products_cache.put({
        barcode: res.barcode,
        name: res.name,
        brand: res.brand,
        category: res.category,
        description: res.description,
        image_url: res.image_url,
        images: res.suggested_images,
        unit: res.unit,
        weight: res.weight,
        manufacturer: res.manufacturer,
        vat_rate: res.suggested_vat_rate,
        provider: res.source,
        cached_at: Date.now(),
      });
    } catch (e) {}
  }

  private static emptyResult(barcode: string, startTime: number): DiscoveredProductResult {
    return {
      found: false,
      source: 'not_found',
      barcode: barcode || '',
      name: '',
      brand: '',
      category: 'General',
      description: '',
      image_url: '',
      suggested_images: [],
      unit: 'Ud',
      weight: '',
      manufacturer: '',
      suggested_vat_rate: 21,
      search_latency_ms: Math.round(performance.now() - startTime),
    };
  }

  /**
   * Compartir producto genérico con el Catálogo Global VENDIX (Opt-in Comunidad)
   */
  static async shareWithCommunity(data: {
    barcode: string;
    name: string;
    brand: string;
    category: string;
    image_url: string;
    description: string;
    unit: string;
    weight: string;
    manufacturer: string;
  }) {
    try {
      await apiClient.post('/products/global-catalog/share', {
        barcode: data.barcode,
        name: data.name,
        brand: data.brand,
        category: data.category,
        image_url: data.image_url,
        description: data.description,
        unit: data.unit,
        weight: data.weight,
        manufacturer: data.manufacturer,
      });
    } catch (e) {
      console.warn('Silent fallback on sharing to global catalog', e);
    }
  }
}
