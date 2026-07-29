import React, { useState } from 'react';
import { Users, UserPlus, Star } from 'lucide-react';

export const CustomerSearch: React.FC = () => {
  const [customers] = useState([
    { id: 'cust_001', name: 'Cliente Frecuente Demo', email: 'cliente@gmail.com', phone: '555-987-6543', points: 150 }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Clientes & Puntos de Fidelidad</h1>
          <p className="text-slate-400 text-sm">Directorio de clientes y saldo de puntos acumulados</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> Registrar Cliente
        </button>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-900/80 text-xs font-semibold text-slate-400 uppercase border-b border-slate-800">
            <tr>
              <th className="px-6 py-4">Nombre</th>
              <th className="px-6 py-4">Teléfono</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Puntos de Fidelidad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-slate-900/40">
                <td className="px-6 py-4 font-medium text-slate-200">{c.name}</td>
                <td className="px-6 py-4 text-slate-400">{c.phone}</td>
                <td className="px-6 py-4 text-slate-400">{c.email}</td>
                <td className="px-6 py-4 font-bold text-amber-400 flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {c.points} pts
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
