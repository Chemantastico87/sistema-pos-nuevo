import React, { useState } from 'react';
import { BookOpen, HelpCircle, Keyboard, Headphones, MapPin, CheckCircle2, Clock, ThumbsUp, Sparkles } from 'lucide-react';

export const HelpPage: React.FC = () => {
  const [tab, setTab] = useState<'shortcuts' | 'faq' | 'roadmap' | 'support'>('shortcuts');

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-heading">
            Centro de Soporte & Roadmap Público VENDIX
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manuales de uso, guía de atajos de teclado, estado del desarrollo en vivo y soporte directo.
          </p>
        </div>
      </div>

      {/* PESTAÑAS */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setTab('shortcuts')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            tab === 'shortcuts' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Keyboard className="w-4 h-4" />
          <span>Atajos TPV</span>
        </button>

        <button
          onClick={() => setTab('roadmap')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            tab === 'roadmap' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Roadmap Público VENDIX</span>
        </button>

        <button
          onClick={() => setTab('faq')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            tab === 'faq' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Preguntas Frecuentes</span>
        </button>

        <button
          onClick={() => setTab('support')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            tab === 'support' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Headphones className="w-4 h-4" />
          <span>Soporte Directo</span>
        </button>
      </div>

      {/* ATAJOS */}
      {tab === 'shortcuts' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900">Guía de Atajos Rápidos TPV</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">F2</span>
                <span className="text-[11px] text-slate-500">Búsqueda rápida de productos</span>
              </div>
              <kbd className="px-2.5 py-1 bg-white border border-slate-300 rounded shadow-xs text-xs font-mono font-bold text-slate-700">F2</kbd>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">F4</span>
                <span className="text-[11px] text-slate-500">Cobro rápido en TPV</span>
              </div>
              <kbd className="px-2.5 py-1 bg-white border border-slate-300 rounded shadow-xs text-xs font-mono font-bold text-slate-700">F4</kbd>
            </div>
          </div>
        </div>
      )}

      {/* ROADMAP PÚBLICO VENDIX */}
      {tab === 'roadmap' && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">En Desarrollo</h3>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <span className="font-bold text-indigo-900 block">VENDIX Flow v2.0</span>
                  <span className="text-indigo-700 text-[11px]">Constructor visual de automatizaciones personalizadas.</span>
                </div>
                <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <span className="font-bold text-indigo-900 block">App Móvil Nativa iOS/Android</span>
                  <span className="text-indigo-700 text-[11px]">Control total de TPV desde teléfonos inteligentes.</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <ThumbsUp className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900">Próximamente / Votaciones</h3>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                  <span className="font-bold text-purple-900 block">Integración WooCommerce / Shopify</span>
                  <span className="text-purple-700 text-[11px]">Sincronización automática de stock con tiendas online.</span>
                </div>
                <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                  <span className="font-bold text-purple-900 block">Notificaciones por WhatsApp API</span>
                  <span className="text-purple-700 text-[11px]">Envío de facturas y tickets directo al móvil del cliente.</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Completado v1.0</h3>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                  <span className="font-bold text-emerald-900 block">VENDIX Insights Business Hub</span>
                  <span className="text-emerald-700 text-[11px]">Resumen inteligente diario y recomendador VENDIX AI.</span>
                </div>
                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                  <span className="font-bold text-emerald-900 block">Backups Enterprise AES-256</span>
                  <span className="text-emerald-700 text-[11px]">Snapshots pre-críticos y Time Machine en menos de 5 min.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAQ */}
      {tab === 'faq' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900">Preguntas Frecuentes</h2>
          <div className="p-4 bg-slate-50 rounded-xl text-xs space-y-1">
            <span className="font-bold text-slate-900 block">¿Cómo funciona la restauración Time Machine?</span>
            <p className="text-slate-600">Te permite volver a cualquier punto de resguardo anterior en menos de 5 minutos sin pérdida de datos.</p>
          </div>
        </div>
      )}

      {/* SOPORTE */}
      {tab === 'support' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4 max-w-xl">
          <h2 className="text-base font-bold text-slate-900">Soporte Directo VENDIX</h2>
          <form onSubmit={(e) => { e.preventDefault(); alert('Solicitud de soporte recibida.'); }} className="space-y-3">
            <input type="text" required placeholder="Asunto de la consulta" className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs" />
            <textarea required placeholder="Detalle..." className="w-full bg-slate-50 border rounded-xl p-3 text-xs h-24" />
            <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs">Enviar Solicitud</button>
          </form>
        </div>
      )}
    </div>
  );
};
