import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles, QrCode, CheckCircle2, Image as ImageIcon, ShieldCheck,
  Zap, Package, ArrowRight, Share2, Layers, AlertCircle, RefreshCw, X
} from 'lucide-react';
import { db, LocalProduct } from '../../core/db/dexieDB';
import { useSettingsStore } from '../../core/store/settingsStore';
import { useTranslation } from '../../core/store/languageStore';
import { SmartProductDiscoveryEngine, DiscoveredProductResult } from '../../core/services/smartDiscoveryEngine';

interface SmartProductDiscoveryModalProps {
  initialBarcode?: string;
  onClose: () => void;
  onProductCreated: (product: LocalProduct) => void;
}

export const SmartProductDiscoveryModal: React.FC<SmartProductDiscoveryModalProps> = ({
  initialBarcode = '',
  onClose,
  onProductCreated,
}) => {
  const { t } = useTranslation();
  const { currencySymbol } = useSettingsStore();

  const [barcode, setBarcode] = useState(initialBarcode);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveryResult, setDiscoveryResult] = useState<DiscoveredProductResult | null>(null);

  // 6 Campos Visibles del Formulario Final
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('General');
  const [price, setPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [stock, setStock] = useState('50');

  // Opt-in Compartir con Comunidad VENDIX
  const [shareCommunity, setShareCommunity] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const priceInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialBarcode.trim()) {
      runDiscovery(initialBarcode.trim());
    }
  }, [initialBarcode]);

  const runDiscovery = async (codeToSearch: string) => {
    if (!codeToSearch.trim()) return;
    setIsDiscovering(true);
    try {
      const res = await SmartProductDiscoveryEngine.discover(codeToSearch.trim());
      setDiscoveryResult(res);

      // Auto-rellenar campos
      setName(res.name);
      setBrand(res.brand || 'Comercial');
      setCategory(res.category || 'General');
      setImageUrl(res.image_url || res.suggested_images[0] || '');

      // Enfocar automáticamente el precio de venta para tardar <10 segundos
      setTimeout(() => {
        priceInputRef.current?.focus();
      }, 200);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleBarcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setBarcode(val);
    if (val.length >= 8) {
      runDiscovery(val);
    }
  };

  const handleGenerateEan = () => {
    const randomEan = '770' + Math.floor(100000000 + Math.random() * 900000000).toString();
    setBarcode(randomEan);
    runDiscovery(randomEan);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;
    setIsSaving(true);

    try {
      const priceVal = parseFloat(price) || 0;
      const parsedCost = costPrice.trim() !== '' ? parseFloat(costPrice) : null;
      const vatVal = discoveryResult?.suggested_vat_rate || 21;

      const newProduct: LocalProduct = {
        id: `prod_${Date.now()}`,
        company_id: 'c1',
        name,
        price: priceVal,
        cost_price: parsedCost,
        stock: parseFloat(stock) || 0,
        barcode: barcode || `770${Date.now().toString().slice(-9)}`,
        sku: barcode || `SKU-${Date.now().toString().slice(-6)}`,
        brand,
        category_id: category,
        description: discoveryResult?.description || `${name} - EAN: ${barcode}`,
        image_url: imageUrl,
        unit: discoveryResult?.unit || 'Ud',
        weight: discoveryResult?.weight || '1 U',
        vat_rate: vatVal,
        manufacturer: discoveryResult?.manufacturer || brand,
        created_at: new Date().toISOString(),
      };

      // 1. Guardar en DexieDB Local
      await db.products.add(newProduct);

      // 2. Compartir con la Comunidad VENDIX si opt-in activo (solamente metadata genérica)
      if (shareCommunity && barcode) {
        SmartProductDiscoveryEngine.shareWithCommunity({
          barcode,
          name: newProduct.name,
          brand: newProduct.brand || 'Comercial',
          category: newProduct.category_id || 'General',
          image_url: newProduct.image_url || '',
          description: newProduct.description || '',
          unit: newProduct.unit || 'Ud',
          weight: newProduct.weight || '',
          manufacturer: newProduct.manufacturer || '',
        });
      }

      onProductCreated(newProduct);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error guardando producto');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 font-sans overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-scaleIn my-auto">
        
        {/* CABECERA VENDIX SMART DISCOVERY ENGINE */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-4 sm:p-6 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 sm:right-5 sm:top-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2 pr-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-black text-base sm:text-lg text-white font-heading">
                  VENDIX Smart Product Discovery Engine
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-black uppercase">
                  v5.0 AI
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Alta ultra-rápida de producto en &lt;10 segundos. Escanea el código e ingresa el precio.
              </p>
            </div>
          </div>

          {/* BUSCADOR / LECTOR DE CÓDIGO DE BARRAS */}
          <div className="mt-3 sm:mt-4 relative">
            <input
              type="text"
              placeholder="Escanear código de barras EAN/UPC o presione escáner..."
              value={barcode}
              onChange={handleBarcodeChange}
              className="w-full bg-slate-950/80 border border-indigo-500/50 rounded-2xl pl-10 pr-28 py-3 text-xs text-white font-mono font-bold outline-none focus:border-indigo-400 shadow-inner"
            />
            <QrCode className="w-4 h-4 absolute left-3.5 top-3.5 text-indigo-400" />
            <button
              type="button"
              onClick={handleGenerateEan}
              className="absolute right-2 top-2 px-2.5 py-1.5 bg-indigo-600/40 hover:bg-indigo-600/70 border border-indigo-400/40 rounded-xl text-indigo-200 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <Zap className="w-3 h-3 text-amber-300" /> EAN-13
            </button>
          </div>
        </div>

        {/* STATUS BADGE LATENCIA Y FUENTE */}
        {discoveryResult && (
          <div className="px-4 sm:px-6 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${discoveryResult.found ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className="font-bold text-slate-700">
                Fuente: <span className="uppercase text-indigo-600">{discoveryResult.source}</span>
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono font-bold">
              <span>⚡ Latencia:</span>
              <span className="text-emerald-600">{discoveryResult.search_latency_ms}ms</span>
            </div>
          </div>
        )}

        {/* FORMULARIO FINAL SIMPLIFICADO (6 CAMPOS VISIBLES) */}
        <form onSubmit={handleCreateProduct} className="p-4 sm:p-6 space-y-4 font-sans overflow-y-auto flex-1">
          {/* 1. NOMBRE DEL PRODUCTO */}
          <div>
            <label className="text-xs font-extrabold text-slate-800 block mb-1">
              1. Nombre del Producto *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Coca Cola Zero 500ml"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-bold outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>

          {/* 2. SELECCIÓN DE IMAGEN (AUTO-DESCARGADA + 5 SUGERENCIAS) */}
          <div>
            <label className="text-xs font-extrabold text-slate-800 block mb-1">
              2. Imagen Sugerida (Haz clic para seleccionar)
            </label>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden shrink-0 flex items-center justify-center">
                {imageUrl ? (
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Package className="w-8 h-8 text-slate-300" />
                )}
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {(discoveryResult?.suggested_images || []).slice(0, 5).map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setImageUrl(img);
                      setSelectedImageIndex(idx);
                    }}
                    className={`w-12 h-12 rounded-xl border overflow-hidden shrink-0 cursor-pointer transition-all ${
                      imageUrl === img ? 'border-2 border-indigo-600 ring-2 ring-indigo-500/20 scale-105' : 'border-slate-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Opción ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3 Y 4. MARCA Y CATEGORÍA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="text-xs font-extrabold text-slate-800 block mb-1">
                3. Marca
              </label>
              <input
                type="text"
                placeholder="Marca comercial"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-800 font-semibold outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-extrabold text-slate-800 block mb-1">
                4. Categoría
              </label>
              <input
                type="text"
                placeholder="Categoría"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-800 font-semibold outline-none"
              />
            </div>
          </div>

          {/* PRECIO VENTA (OBLIGATORIO), PRECIO COMPRA (OPCIONAL) & STOCK INICIAL (OPCIONAL) */}
          <div className="space-y-3 p-3.5 sm:p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-black text-indigo-900 block mb-1">
                  Precio Venta ({currencySymbol}) *
                </label>
                <input
                  ref={priceInputRef}
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00 *"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-white border-2 border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-900 font-black outline-none shadow-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Precio Compra (Opcional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Opcional"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Stock Inicial (Opcional)
                </label>
                <input
                  type="number"
                  placeholder="50"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold outline-none"
                />
              </div>
            </div>

            {/* AVISO DISCRETO SI PRECIO DE COMPRA ESTÁ VACÍO */}
            {costPrice.trim() === '' && (
              <p className="text-[11px] text-amber-800 bg-amber-50/90 border border-amber-200/80 p-2 rounded-xl flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Este producto aún no tiene precio de compra. Puedes añadirlo más adelante para obtener estadísticas de beneficio.</span>
              </p>
            )}
          </div>

          {/* CATÁLOGO GLOBAL VENDIX SHARE CHECKBOX */}
          <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium">
              <input
                type="checkbox"
                checked={shareCommunity}
                onChange={(e) => setShareCommunity(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Compartir datos genéricos con la Comunidad VENDIX</span>
            </label>
            <span className="text-[10px] text-slate-400 font-bold">🔒 Sin datos de precios/empresa</span>
          </div>

          {/* BOTÓN PRINCIPAL ÚNICO DE CREACIÓN */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isSaving || isDiscovering}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isSaving ? 'Guardando...' : '⚡ Crear Producto'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
