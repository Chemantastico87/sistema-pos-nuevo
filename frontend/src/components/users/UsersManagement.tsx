import React, { useState } from 'react';
import { UserCheck, UserPlus, Shield, Check, Lock, Mail, User } from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'cashier' | 'supervisor';
  permissions: string[];
  status: 'active' | 'inactive';
}

export const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([
    {
      id: 'usr_1',
      name: 'Admin Administrador',
      email: 'admin@possaas.com',
      role: 'admin',
      permissions: ['can_change_price', 'can_delete_sale', 'can_open_cash_register', 'can_view_profit', 'can_manage_users'],
      status: 'active',
    },
    {
      id: 'usr_2',
      name: 'Carlos Cajero',
      email: 'cajero1@possaas.com',
      role: 'cashier',
      permissions: ['can_open_cash_register'],
      status: 'active',
    },
    {
      id: 'usr_3',
      name: 'Maria Supervisora',
      email: 'supervisor@possaas.com',
      role: 'supervisor',
      permissions: ['can_change_price', 'can_open_cash_register', 'can_view_profit'],
      status: 'active',
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'cashier' | 'supervisor'>('cashier');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    const u: UserData = {
      id: `usr_${Date.now()}`,
      name: newName,
      email: newEmail,
      role: newRole,
      permissions: newRole === 'admin' ? ['can_change_price', 'can_delete_sale', 'can_open_cash_register', 'can_view_profit'] : ['can_open_cash_register'],
      status: 'active',
    };

    setUsers((prev) => [...prev, u]);
    setNewName('');
    setNewEmail('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestión de Usuarios & Permisos RBAC</h1>
          <p className="text-slate-500 text-sm">Administración de cajeros, administradores y permisos granulares</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-indigo px-4 py-2.5 flex items-center gap-2 text-xs">
          <UserPlus className="w-4 h-4" /> Registrar Nuevo Usuario
        </button>
      </div>

      {/* Modal Agregar Usuario */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-base text-slate-900 border-b border-slate-100 pb-2">Registrar Usuario</h3>
            <form onSubmit={handleAddUser} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Juan Pérez"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  placeholder="juan@possaas.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Rol de Usuario</label>
                <select
                  value={newRole}
                  onChange={(e: any) => setNewRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 outline-none"
                >
                  <option value="cashier">Cajero</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="w-1/2 py-2 rounded-xl border border-slate-200 font-bold text-slate-600">
                  Cancelar
                </button>
                <button type="submit" className="w-1/2 py-2 rounded-xl bg-indigo-600 text-white font-bold">
                  Guardar Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabla de Usuarios */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 font-bold text-slate-500 uppercase border-b border-slate-200">
            <tr>
              <th className="px-6 py-3.5">Usuario</th>
              <th className="px-6 py-3.5">Correo</th>
              <th className="px-6 py-3.5">Rol</th>
              <th className="px-6 py-3.5">Permisos Granulares</th>
              <th className="px-6 py-3.5">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-6 py-3.5 font-bold text-slate-900 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    {u.name.charAt(0)}
                  </div>
                  <span>{u.name}</span>
                </td>
                <td className="px-6 py-3.5 text-slate-600">{u.email}</td>
                <td className="px-6 py-3.5">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${
                    u.role === 'admin' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                    u.role === 'supervisor' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                    'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-3.5 text-slate-500 text-[11px]">
                  {u.permissions.join(', ')}
                </td>
                <td className="px-6 py-3.5 font-semibold text-emerald-600">
                  ● Activo
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
