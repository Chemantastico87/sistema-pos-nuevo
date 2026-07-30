import React, { useState, useEffect } from 'react';
import { AlertOctagon, CheckCircle2, RefreshCw } from 'lucide-react';
import { apiClient } from '../core/services/apiClient';

export const ErrorLogsPage: React.FC = () => {
  const [errors, setErrors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchErrors();
  }, []);

  const fetchErrors = async () => {
    setIsLoading(true);
    try {
      const res: any = await apiClient.get('/errors/list');
      setErrors(res || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await apiClient.patch(`/errors/${id}/resolve`);
      fetchErrors();
    } catch (e) {
      alert('Error al resolver');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-heading">
            Visor Interno de Errores & Excepciones
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Bitácora centralizada de stack traces, errores de navegador, SO e incidencias técnicas del cliente.
          </p>
        </div>

        <button
          onClick={fetchErrors}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Actualizar Registro</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3">Mensaje de Error</th>
                <th className="p-3">Fecha y Hora</th>
                <th className="p-3">SO / Navegador</th>
                <th className="p-3">Estado</th>
                <th className="p-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {errors.map((err) => (
                <tr key={err.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-mono font-bold text-rose-700">
                    <div>{err.error_message}</div>
                    {err.stack_trace && <span className="text-[10px] text-slate-400 font-normal block truncate max-w-md">{err.stack_trace}</span>}
                  </td>
                  <td className="p-3 text-slate-500">{new Date(err.created_at).toLocaleString()}</td>
                  <td className="p-3 text-slate-600">{err.os || 'Windows'} / {err.browser || 'Chrome'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                      err.status === 'resolved' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {err.status?.toUpperCase() || 'ABIERTO'}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {err.status !== 'resolved' && (
                      <button
                        onClick={() => handleResolve(err.id)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold transition-all"
                      >
                        Marcar Resuelto
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {errors.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400">
                    No se registran errores activos en la plataforma. Sistema estable.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
