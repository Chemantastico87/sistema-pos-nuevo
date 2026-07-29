import React, { useState } from 'react';
import { Settings, Building, Receipt, Save, CheckCircle2 } from 'lucide-react';

export const SystemSettings: React.FC = () => {
  const [companyName, setCompanyName] = useState('Mi Empresa S.A.S');
  const [taxId, setTaxId] = useState('900.123.456-7');
  const [phone, setPhone] = useState('+57 300 123 4567');
  const [address, setAddress] = useState('Calle 100 # 15-20, Bogotá');
  const [currency, setCurrency] = useState('COP ($)');
  const [taxRate, setTaxRate] = useState('19');
  const [paperWidth, setPaperWidth] = useState('80mm');
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configuración del Sistema POS</h1>
        <p className="text-slate-500 text-sm">Parámetros generales de la empresa, impuestos y recibos térmicos</p>
      </div>

      {savedMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Configuración guardada exitosamente.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Datos de la Empresa */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building className="w-5 h-5 text-indigo-600" /> Perfil de la Empresa
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Nombre Comercial</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">NIT / RUC / Tax ID</label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Teléfono de Contacto</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Dirección Física</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Moneda e Impuestos */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Receipt className="w-5 h-5 text-indigo-600" /> Moneda & Configuración de Recibos
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Moneda Principal</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none"
              >
                <option value="COP ($)">COP ($ - Peso Colombiano)</option>
                <option value="USD ($)">USD ($ - Dólar US)</option>
                <option value="MXN ($)">MXN ($ - Peso Mexicano)</option>
                <option value="EUR (€)">EUR (€ - Euro)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Tasa de Impuesto IVA (%)</label>
              <input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Ancho Papel Térmico</label>
              <select
                value={paperWidth}
                onChange={(e) => setPaperWidth(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none"
              >
                <option value="80mm">80mm (Estándar POS)</option>
                <option value="58mm">58mm (Portátil)</option>
              </select>
            </div>
          </div>
        </div>

        <button type="submit" className="btn-indigo px-6 py-3 text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30">
          <Save className="w-4 h-4" /> Guardar Cambios de Configuración
        </button>
      </form>
    </div>
  );
};
