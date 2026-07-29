import React, { useState } from 'react';
import { Grid, Power, Sparkles, Key, Utensils, Wrench, FileText } from 'lucide-react';

interface PluginItem {
  id: string;
  name: string;
  category: string;
  description: string;
  version: string;
  isEnabled: boolean;
  icon: any;
}

export const PluginsMarketplace: React.FC = () => {
  const [plugins, setPlugins] = useState<PluginItem[]>([
    {
      id: 'plugin_taller',
      name: 'Taller & Servicios Técnicos',
      category: 'Servicios',
      description: 'Gestión de órdenes de trabajo, repuestos y entregas de vehículos o equipos.',
      version: 'v1.2.0',
      isEnabled: true,
      icon: Wrench,
    },
    {
      id: 'plugin_restaurante',
      name: 'Restaurante & Control de Mesas',
      category: 'Gastronomía',
      description: 'Mapa visual de mesas, separación de cuentas y comanderas para cocina.',
      version: 'v2.0.1',
      isEnabled: false,
      icon: Utensils,
    },
    {
      id: 'plugin_ocr',
      name: 'OCR Facturación de Proveedores',
      category: 'Inteligencia Artificial',
      description: 'Carga masiva de facturas mediante escaneo de fotos y visión por computadora.',
      version: 'v1.0.0',
      isEnabled: true,
      icon: FileText,
    },
    {
      id: 'plugin_api_keys',
      name: 'API Pública & Webhooks Client',
      category: 'Integraciones',
      description: 'Generación de API Keys y Webhooks en tiempo real para integraciones de terceros.',
      version: 'v1.5.0',
      isEnabled: true,
      icon: Key,
    },
  ]);

  const togglePlugin = (id: string) => {
    setPlugins((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isEnabled: !p.isEnabled } : p))
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Apps & Plugins Marketplace</h1>
        <p className="text-slate-500 text-sm">Extensión de funcionalidades con arquitectura modular PluginInterface</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plugins.map((p) => {
          const Icon = p.icon;
          return (
            <div key={p.id} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
                    {p.version}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-base text-slate-900">{p.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{p.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <span className={`text-xs font-bold ${p.isEnabled ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {p.isEnabled ? '● Plugin Activo' : '○ Desactivado'}
                </span>
                <button
                  onClick={() => togglePlugin(p.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    p.isEnabled
                      ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200'
                      : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{p.isEnabled ? 'Desactivar' : 'Activar Plugin'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
