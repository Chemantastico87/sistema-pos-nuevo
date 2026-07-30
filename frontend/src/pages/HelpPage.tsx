import React, { useState } from 'react';
import { BookOpen, HelpCircle, Keyboard, Headphones, FileText, CheckCircle2 } from 'lucide-react';

export const HelpPage: React.FC = () => {
  const [tab, setTab] = useState<'manual' | 'faq' | 'shortcuts' | 'support'>('shortcuts');

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-heading">
            Centro de Ayuda & Soporte Comercial
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manuales de usuario, preguntas frecuentes, guía de atajos de teclado y contacto con soporte técnico.
          </p>
        </div>
      </div>

      {/* Pestañas */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setTab('shortcuts')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            tab === 'shortcuts' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Keyboard className="w-4 h-4" />
          <span>Atajos de Teclado TPV</span>
        </button>

        <button
          onClick={() => setTab('faq')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            tab === 'faq' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Preguntas Frecuentes (FAQ)</span>
        </button>

        <button
          onClick={() => setTab('manual')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            tab === 'manual' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Manual de Operación</span>
        </button>

        <button
          onClick={() => setTab('support')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            tab === 'support' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Headphones className="w-4 h-4" />
          <span>Soporte Técnico Directo</span>
        </button>
      </div>

      {/* CONTENIDO ATAJOS DE TECLADO */}
      {tab === 'shortcuts' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900">Guía de Atajos Rápidos para Pantalla TPV</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">F2</span>
                <span className="text-[11px] text-slate-500">Enfocar campo de búsqueda de productos</span>
              </div>
              <kbd className="px-2.5 py-1 bg-white border border-slate-300 rounded shadow-xs text-xs font-mono font-bold text-slate-700">F2</kbd>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">F4</span>
                <span className="text-[11px] text-slate-500">Abrir modal de Cobro Rápido en TPV</span>
              </div>
              <kbd className="px-2.5 py-1 bg-white border border-slate-300 rounded shadow-xs text-xs font-mono font-bold text-slate-700">F4</kbd>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Esc</span>
                <span className="text-[11px] text-slate-500">Limpiar carrito actual / Cancelar modal</span>
              </div>
              <kbd className="px-2.5 py-1 bg-white border border-slate-300 rounded shadow-xs text-xs font-mono font-bold text-slate-700">ESC</kbd>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">F8</span>
                <span className="text-[11px] text-slate-500">Suspender venta actual (Ticket en espera)</span>
              </div>
              <kbd className="px-2.5 py-1 bg-white border border-slate-300 rounded shadow-xs text-xs font-mono font-bold text-slate-700">F8</kbd>
            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO FAQ */}
      {tab === 'faq' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900">Preguntas Frecuentes</h2>

          <div className="space-y-3 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1">
              <span className="font-bold text-slate-900 block">¿Qué sucede si expira mi suscripción?</span>
              <p className="text-slate-600 leading-relaxed">
                Tu cuenta pasará a modo solo lectura. Nunca se eliminarán tus productos, facturas ni historial de ventas. Podrás renovar tu plan en cualquier momento.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1">
              <span className="font-bold text-slate-900 block">¿Puedo utilizar un lector de código de barras USB/Bluetooth?</span>
              <p className="text-slate-600 leading-relaxed">
                Sí, el TPV está optimizado para capturar lecturas automáticas EAN-13/UPC sin necesidad de usar el ratón.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1">
              <span className="font-bold text-slate-900 block">¿Cómo se imprimen los cierres de caja en impresoras térmicas?</span>
              <p className="text-slate-600 leading-relaxed">
                El sistema soporta comandos ESC/POS estándar de 80mm y 58mm directamente desde el navegador.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO SOPORTE */}
      {tab === 'support' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4 max-w-xl">
          <h2 className="text-base font-bold text-slate-900">Contacto Directo con Soporte Comercial</h2>
          <form onSubmit={(e) => { e.preventDefault(); alert('Ticket de soporte enviado. Un agente se pondrá en contacto pronto.'); }} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Asunto</label>
              <input type="text" required placeholder="Consulta sobre cierres o configuración" className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Detalle del Mensaje</label>
              <textarea required placeholder="Describa su solicitud..." className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl p-3 text-xs text-slate-800 outline-none h-24" />
            </div>
            <button type="submit" className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all">
              Enviar Mensaje a Soporte
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
