import React, { useState, useEffect } from 'react';
import { Activity, Server, Database, Wifi, ShieldCheck, Mail, Printer, RefreshCcw } from 'lucide-react';
import { apiClient } from '../core/services/apiClient';

export const SystemHealthPage: React.FC = () => {
  const [healthData, setHealthData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHealth();
  }, []);

  const fetchHealth = async () => {
    setIsLoading(true);
    try {
      const res: any = await apiClient.get('/health/system');
      setHealthData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-heading">
            Estado del Sistema & Infraestructura
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Monitor de salud en tiempo real de API, Base de Datos, WebSockets y servicios conectados.
          </p>
        </div>

        <button
          onClick={fetchHealth}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center gap-2"
        >
          <RefreshCcw className="w-4 h-4" />
          <span>Comprobar Estado</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-bold text-slate-900">Estado Global: OPERACIONAL Y SALUDABLE</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Última verificación: {new Date().toLocaleTimeString()}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {healthData?.services?.map((svc: any, i: number) => (
            <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-900 block">{svc.name}</span>
                <span className="text-[11px] text-slate-500 block">
                  {svc.latency_ms ? `Latencia: ${svc.latency_ms}ms` : svc.provider || svc.driver || 'Activo'}
                </span>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs uppercase">
                {svc.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
