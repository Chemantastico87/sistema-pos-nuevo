import React, { useState, useEffect } from 'react';
import { Database, Download, RefreshCw, Plus, CheckCircle2, Shield } from 'lucide-react';
import { apiClient } from '../core/services/apiClient';

export const BackupsPage: React.FC = () => {
  const [backups, setBackups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    setIsLoading(true);
    try {
      const res: any = await apiClient.get('/backups/list');
      setBackups(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      await apiClient.post('/backups/create', null, { params: { type: 'manual' } });
      alert('Copia de seguridad manual generada exitosamente.');
      fetchBackups();
    } catch (err: any) {
      alert('Error al generar copia de seguridad.');
    }
  };

  const handleDownload = async (id: string, fileName: string) => {
    try {
      const res: any = await apiClient.get(`/backups/download/${id}`);
      const blob = new Blob([res.content], { type: 'text/sql' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
    } catch (e) {
      alert('Error al descargar copia de seguridad.');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-heading">
            Copias de Seguridad (Backups)
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Generación de backups manuales y programados, descarga de dumps SQL y restauración.
          </p>
        </div>

        <button
          onClick={handleCreateBackup}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Generar Backup Manual Ahora</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900">Historial de Resguardos de Base de Datos</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3">Nombre del Archivo</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Tamaño Estimado</th>
                <th className="p-3">Fecha y Hora</th>
                <th className="p-3">Estado</th>
                <th className="p-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {backups.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-mono font-bold text-slate-900">{b.file_name}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[11px]">
                      {b.type?.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-500">{Math.round((b.file_size || 0) / 1024)} KB</td>
                  <td className="p-3 text-slate-500">{new Date(b.created_at).toLocaleString()}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                      COMPLETADO
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDownload(b.id, b.file_name)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center gap-1.5 ml-auto"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Descargar SQL</span>
                    </button>
                  </td>
                </tr>
              ))}
              {backups.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400">
                    No hay copias de seguridad anteriores. Haz clic en "Generar Backup Manual Ahora" para crear la primera.
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
