import React, { useState } from 'react';
import { Sparkles, Database, Zap, RefreshCw, Trash2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { db } from '../../core/db/dexieDB';

export const SmartDiscoverySettings: React.FC = () => {
  const [aiEnabled, setAiEnabled] = useState(
    localStorage.getItem('vendix_discovery_ai') !== 'false'
  );
  const [globalCatalogEnabled, setGlobalCatalogEnabled] = useState(
    localStorage.getItem('vendix_discovery_global') !== 'false'
  );
  const [imageSearchEnabled, setImageSearchEnabled] = useState(
    localStorage.getItem('vendix_discovery_images') !== 'false'
  );
  const [autoShare, setAutoShare] = useState(
    localStorage.getItem('vendix_discovery_autoshare') === 'true'
  );
  const [ttlDays, setTtlDays] = useState(
    localStorage.getItem('vendix_discovery_ttl') || '90'
  );

  const [notice, setNotice] = useState<string | null>(null);

  const handleSave = () => {
    localStorage.setItem('vendix_discovery_ai', aiEnabled.toString());
    localStorage.setItem('vendix_discovery_global', globalCatalogEnabled.toString());
    localStorage.setItem('vendix_discovery_images', imageSearchEnabled.toString());
    localStorage.setItem('vendix_discovery_autoshare', autoShare.toString());
    localStorage.setItem('vendix_discovery_ttl', ttlDays);

    setNotice('✅ Configuración de VENDIX Smart Product Discovery guardada correctamente.');
    setTimeout(() => setNotice(null), 5000);
  };

  const handleClearCache = async () => {
    try {
      await db.products_cache.clear();
      setNotice('🧹 Caché local de descubrimiento borrada con éxito.');
      setTimeout(() => setNotice(null), 5000);
    } catch (e) {
      alert('Error limpiando la caché');
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-xs font-sans">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900">
              VENDIX Smart Product Discovery Engine
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Configuración de búsqueda autónoma, IA, caché local e integración comunitaria.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-2xl bg-indigo-600 text-white font-extrabold text-xs shadow-md shadow-indigo-600/30 hover:bg-indigo-700 cursor-pointer"
        >
          Guardar Ajustes
        </button>
      </div>

      {notice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      <div className="space-y-4 text-xs text-slate-700">
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div>
            <span className="font-bold text-slate-900 block">Motor de IA para Auto-Completado</span>
            <span className="text-[11px] text-slate-500">Infiere marca, categoría, peso, unidad e IVA si el código es parcial.</span>
          </div>
          <input
            type="checkbox"
            checked={aiEnabled}
            onChange={(e) => setAiEnabled(e.target.checked)}
            className="w-4 h-4 rounded text-indigo-600"
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div>
            <span className="font-bold text-slate-900 block">Catálogo Global VENDIX Community</span>
            <span className="text-[11px] text-slate-500">Consulta y comparte fichas genéricas de productos comunitarios.</span>
          </div>
          <input
            type="checkbox"
            checked={globalCatalogEnabled}
            onChange={(e) => setGlobalCatalogEnabled(e.target.checked)}
            className="w-4 h-4 rounded text-indigo-600"
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div>
            <span className="font-bold text-slate-900 block">Búsqueda Automática de Imágenes de Alta Calidad</span>
            <span className="text-[11px] text-slate-500">Descarga y optimiza 5 alternativas de imágenes por producto.</span>
          </div>
          <input
            type="checkbox"
            checked={imageSearchEnabled}
            onChange={(e) => setImageSearchEnabled(e.target.checked)}
            className="w-4 h-4 rounded text-indigo-600"
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div>
            <span className="font-bold text-slate-900 block">Compartir Productos Automáticamente</span>
            <span className="text-[11px] text-slate-500">Envía metadatos genéricos a la comunidad al crear un producto nuevo.</span>
          </div>
          <input
            type="checkbox"
            checked={autoShare}
            onChange={(e) => setAutoShare(e.target.checked)}
            className="w-4 h-4 rounded text-indigo-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="font-bold text-slate-900 block mb-1">Tiempo de Vida en Caché (TTL)</span>
            <select
              value={ttlDays}
              onChange={(e) => setTtlDays(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
            >
              <option value="30">30 Días</option>
              <option value="90">90 Días (Recomendado)</option>
              <option value="180">180 Días</option>
            </select>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 block">Limpieza de Caché Local</span>
              <span className="text-[11px] text-slate-500">Libera espacio local de búsquedas.</span>
            </div>
            <button
              onClick={handleClearCache}
              className="px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 font-bold hover:bg-rose-100 flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Vaciar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
