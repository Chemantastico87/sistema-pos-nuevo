import React, { useState } from 'react';
import { Grid, Power, Sparkles, Key, Utensils, Wrench, FileText, Info, CheckCircle2 } from 'lucide-react';

interface PluginItem {
  id: string;
  name: string;
  category: string;
  description: string;
  useCase: string;
  version: string;
  isEnabled: boolean;
  icon: any;
}

export const PluginsMarketplace: React.FC = () => {
  const [plugins, setPlugins] = useState<PluginItem[]>([
    {
      id: 'plugin_taller',
      name: 'Taller Mecánico & Servicios Técnicos',
      category: 'Talleres & Reparaciones',
      description: 'Órdenes de servicio, repuestos, vehículos y entregas de equipos.',
      useCase: 'Ideal para: Talleres automotrices, reparación de celulares, electrodomésticos.',
      version: 'v1.2.0',
      isEnabled: true,
      icon: Wrench,
    },
    {
      id: 'plugin_restaurante',
      name: 'Restaurante, Mesas & Comandas',
      category: 'Gastronomía',
      description: 'Mapa visual de mesas en tiempo real, división de cuentas y comanderas para cocina.',
      version: 'v2.0.1',
      isEnabled: false,
      icon: Utensils,
    },
    {
      id: 'plugin_ocr',
      name: 'OCR Escáner de Facturas de Proveedor',
      category: 'Inteligencia Artificial',
      description: 'Escanea fotos de facturas físicas y carga el inventario automáticamente con Inteligencia Artificial.',
      version: 'v1.0.0',
      isEnabled: true,
      icon: FileText,
    },
    {
      id: 'plugin_api_keys',
      name: 'API Pública & Webhooks Integración',
      category: 'Desarrolladores & Ecommerce',
      description: 'Conecta tu tienda WooCommerce, Shopify o sistemas externos vía API REST y Webhooks.',
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
      {/* Explicación Fácil e Intuitiva */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white rounded-3xl p-6 shadow-xl space-y-3 relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-cyan-300">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">¿Qué son los Apps & Plugins?</h1>
            <p className="text-xs text-indigo-200">Personalización según el modelo de negocio de tu cliente</p>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-indigo-100 max-w-3xl">
          Los <strong>Plugins</strong> te permiten encender o apagar funciones avanzadas con un solo clic. Si tu cliente es un <strong>Restaurante</strong>, enciendes el plugin de Mesas; si es un <strong>Taller</strong>, enciendes Órdenes de Trabajo. ¡Tu POS se adapta al negocio que sea!
        </p>
      </div>

      {/* Grid de Plugins */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plugins.map((p) => {
          const Icon = p.icon;
          return (
            <div key={p.id} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-700">
                        {p.category}
                      </span>
                      <h3 className="font-extrabold text-base text-slate-900 mt-1">{p.name}</h3>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-500 font-mono text-[10px] font-bold">
                    {p.version}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{p.description}</p>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-[11px] text-slate-600 font-medium">
                  💡 <strong>{p.useCase}</strong>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <span className={`text-xs font-extrabold flex items-center gap-1.5 ${p.isEnabled ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {p.isEnabled ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : '○'}
                  {p.isEnabled ? 'Plugin Activo' : 'Desactivado'}
                </span>
                <button
                  onClick={() => togglePlugin(p.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                    p.isEnabled
                      ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200'
                      : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-700'
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
