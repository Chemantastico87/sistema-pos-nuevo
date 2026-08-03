import React, { useState, useEffect } from 'react';
import { UserCheck, UserPlus, Shield, Check, Lock, Mail, User, Trash2, Edit3, ShieldAlert, Key } from 'lucide-react';

export interface UserPermission {
  id: string;
  name: string;
  description: string;
}

const ALL_PERMISSIONS: UserPermission[] = [
  { id: 'can_change_price', name: 'Cambiar Precios en POS', description: 'Permite modificar el precio de venta unitario durante el cobro.' },
  { id: 'can_delete_sale', name: 'Anular / Eliminar Ventas', description: 'Permite cancelar y anular tickets procesados en el sistema.' },
  { id: 'can_open_cash_register', name: 'Abrir Caja (F8)', description: 'Permite abrir la caja registradora sin realizar una venta.' },
  { id: 'can_view_profit', name: 'Ver Utilidades & Ganancias', description: 'Permite consultar el margen de costo vs precio en reportes.' },
  { id: 'can_manage_inventory', name: 'Ajustar Inventarios', description: 'Permite cambiar cantidades de stock manualmente.' },
  { id: 'can_manage_users', name: 'Administrar Usuarios & Permisos', description: 'Permite crear, modificar permisos y eliminar usuarios.' },
];

interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'cashier' | 'supervisor';
  permissions: string[];
  status: 'active' | 'inactive';
}

const INITIAL_USERS: UserData[] = [
  {
    id: 'usr_1',
    name: 'Admin Administrador',
    email: 'admin@possaas.com',
    role: 'admin',
    permissions: ['can_change_price', 'can_delete_sale', 'can_open_cash_register', 'can_view_profit', 'can_manage_inventory', 'can_manage_users'],
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
    name: 'María Supervisora',
    email: 'supervisor@possaas.com',
    role: 'supervisor',
    permissions: ['can_change_price', 'can_open_cash_register', 'can_view_profit', 'can_manage_inventory'],
    status: 'active',
  },
];

export const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>(() => {
    const saved = localStorage.getItem('pos_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  useEffect(() => {
    localStorage.setItem('pos_users', JSON.stringify(users));
  }, [users]);

  // Modal Crear Usuario
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'cashier' | 'supervisor'>('cashier');
  const [newPermissions, setNewPermissions] = useState<string[]>(['can_open_cash_register']);

  // Modal Editar Permisos
  const [editingUser, setEditingUser] = useState<UserData | null>(null);

  // Modal Eliminar Usuario
  const [deletingUser, setDeletingUser] = useState<UserData | null>(null);

  const togglePermissionInNew = (permId: string) => {
    setNewPermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const togglePermissionInEdit = (permId: string) => {
    if (!editingUser) return;
    const current = editingUser.permissions;
    const updated = current.includes(permId)
      ? current.filter((p) => p !== permId)
      : [...current, permId];
    setEditingUser({ ...editingUser, permissions: updated });
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    const u: UserData = {
      id: `usr_${Date.now()}`,
      name: newName,
      email: newEmail,
      role: newRole,
      permissions: newRole === 'admin' ? ALL_PERMISSIONS.map((p) => p.id) : newPermissions,
      status: 'active',
    };

    setUsers((prev) => [...prev, u]);
    setNewName('');
    setNewEmail('');
    setShowAddModal(false);
  };

  const handleSavePermissions = () => {
    if (!editingUser) return;
    setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? editingUser : u)));
    setEditingUser(null);
  };

  const handleDeleteUser = () => {
    if (!deletingUser) return;
    setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
    setDeletingUser(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestión Total de Usuarios, Permisos & Eliminación</h1>
          <p className="text-slate-500 text-sm">Crea, edita permisos, cambia roles o elimina cualquier usuario del sistema</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-indigo px-4 py-2.5 flex items-center gap-2 text-xs font-bold shadow-md shadow-indigo-600/30">
          <UserPlus className="w-4 h-4" /> + Crear Nuevo Usuario
        </button>
      </div>

      {/* Modal Crear Usuario */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" /> Crear Nuevo Usuario
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 font-bold hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Pedro Gómez"
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
                    placeholder="pedro@possaas.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Rol de Usuario</label>
                <select
                  value={newRole}
                  onChange={(e: any) => setNewRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 outline-none font-semibold"
                >
                  <option value="cashier">Cajero</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="font-extrabold text-slate-900 block">Asignar Permisos Específicos:</label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {ALL_PERMISSIONS.map((perm) => (
                    <label key={perm.id} className="flex items-start gap-2.5 p-2 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newRole === 'admin' || newPermissions.includes(perm.id)}
                        disabled={newRole === 'admin'}
                        onChange={() => togglePermissionInNew(perm.id)}
                        className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <p className="font-bold text-slate-800">{perm.name}</p>
                        <p className="text-[11px] text-slate-500">{perm.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="w-1/2 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600">Cancelar</button>
                <button type="submit" className="w-1/2 py-2.5 rounded-xl bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30">Guardar Usuario</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Permisos & Rol */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Key className="w-5 h-5 text-indigo-600" /> Permisos de {editingUser.name}
              </h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 font-bold hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Cambiar Rol</label>
                <select
                  value={editingUser.role}
                  onChange={(e: any) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 outline-none font-bold"
                >
                  <option value="cashier">Cajero</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <p className="text-slate-500 font-medium">Marca o desmarca los permisos granulares para este usuario:</p>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {ALL_PERMISSIONS.map((perm) => {
                  const hasPerm = editingUser.permissions.includes(perm.id);
                  return (
                    <label key={perm.id} className={`flex items-start gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                      hasPerm ? 'bg-indigo-50/60 border-indigo-200' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <input
                        type="checkbox"
                        checked={hasPerm}
                        onChange={() => togglePermissionInEdit(perm.id)}
                        className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <p className="font-extrabold text-slate-900">{perm.name}</p>
                        <p className="text-[11px] text-slate-500">{perm.description}</p>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="pt-3 flex gap-3">
                <button onClick={() => setEditingUser(null)} className="w-1/2 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600">Cancelar</button>
                <button onClick={handleSavePermissions} className="w-1/2 py-2.5 rounded-xl bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30">Guardar Permisos</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Eliminar Usuario */}
      {deletingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-slate-900">¿Eliminar Usuario?</h3>
              <p className="text-xs text-slate-500">
                ¿Confirmas eliminar a <span className="font-bold text-slate-800">{deletingUser.name}</span> ({deletingUser.email})? Se borrará definitivamente del sistema.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setDeletingUser(null)} className="w-1/2 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 text-xs">Cancelar</button>
              <button onClick={handleDeleteUser} className="w-1/2 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-600/30 hover:bg-rose-700">Sí, Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de Usuarios */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 font-bold text-slate-500 uppercase border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Usuario</th>
              <th className="px-6 py-4">Correo</th>
              <th className="px-6 py-4">Rol</th>
              <th className="px-6 py-4">Permisos Asignados</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black shadow-xs">
                    {u.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{u.name}</p>
                    <span className="text-[10px] text-emerald-600 font-bold">● Activo</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600 font-medium">{u.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${
                    u.role === 'admin' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                    u.role === 'supervisor' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                    'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500">
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {u.permissions.map((p) => (
                      <span key={p} className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold border border-slate-200">
                        {p}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setEditingUser(u)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold flex items-center gap-1 hover:bg-indigo-100 transition-colors"
                      title="Editar Permisos & Rol"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Permisos
                    </button>

                    <button
                      onClick={() => setDeletingUser(u)}
                      className="p-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 transition-colors"
                      title="Eliminar Usuario"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
