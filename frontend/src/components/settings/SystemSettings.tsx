import React, { useState } from 'react';
import { Building, Receipt, Save, CheckCircle2 } from 'lucide-react';
import { useSettingsStore } from '../../core/store/settingsStore';

export const SystemSettings: React.FC = () => {
  const { currency, taxRate, companyName, taxId, phone, address, paperWidth, setSettings } = useSettingsStore();

  const [formCurrency, setFormCurrency] = useState(currency);
  const [formTaxRate, setFormTaxRate] = useState(taxRate.toString());
  const [formCompanyName, setFormCompanyName] = useState(companyName);
  const [formTaxId, setFormTaxId] = useState(taxId);
  const [formPhone, setFormPhone] = useState(phone);
  const [formAddress, setFormAddress] = useState(address);
  const [formPaperWidth, setFormPaperWidth] = useState(paperWidth);
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSettings({
      currency: formCurrency,
      taxRate: parseFloat(formTaxRate) || 0,
      companyName: formCompanyName,
      taxId: formTaxId,
      phone: formPhone,
      address: formAddress,
      paperWidth: formPaperWidth,
    });

    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configuración del Sistema POS</h1>
        <p className="text-slate-500 text-sm">Cambio de moneda (Euro, Dólar, Peso), impuestos y datos comerciales</p>
      </div>

      {savedMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-extrabold flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>¡Configuración guardada exitosamente! El cambio de moneda ({formCurrency}) ya está activo en todo el sistema.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Datos de la Empresa */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building className="w-5 h-5 text-indigo-600" /> Perfil Comercial de la Empresa
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Nombre Comercial</label>
              <input
                type="text"
                required
                value={formCompanyName}
                onChange={(e) => setFormCompanyName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none focus:border-indigo-500 font-semibold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">NIT / RUC / Tax ID</label>
              <input
                type="text"
                value={formTaxId}
                onChange={(e) => setFormTaxId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none focus:border-indigo-500 font-semibold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Teléfono de Contacto</label>
              <input
                type="text"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none focus:border-indigo-500 font-semibold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Dirección Física</label>
              <input
                type="text"
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none focus:border-indigo-500 font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Moneda e Impuestos */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Receipt className="w-5 h-5 text-indigo-600" /> Moneda Principal & Formato de Recibos
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Seleccionar Moneda</label>
              <select
                value={formCurrency}
                onChange={(e) => setFormCurrency(e.target.value)}
                className="w-full bg-slate-50 border-2 border-indigo-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-extrabold outline-none focus:border-indigo-600"
              >
                <option value="EUR (€)">EUR (€ - Euro)</option>
                <option value="COP ($)">COP ($ - Peso Colombiano)</option>
                <option value="USD ($)">USD (US$ - Dólar Estadounidense)</option>
                <option value="MXN ($)">MXN (Mex$ - Peso Mexicano)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Tasa de Impuesto IVA (%)</label>
              <input
                type="number"
                value={formTaxRate}
                onChange={(e) => setFormTaxRate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none font-semibold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Ancho Impresora Térmica</label>
              <select
                value={formPaperWidth}
                onChange={(e) => setFormPaperWidth(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none font-semibold"
              >
                <option value="80mm">80mm (Estándar Impresora Térmica)</option>
                <option value="58mm">58mm (Portátil Bluetooth)</option>
              </select>
            </div>
          </div>
        </div>

        <button type="submit" className="btn-indigo px-8 py-3.5 text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-indigo-600/30 hover:scale-[1.01]">
          <Save className="w-4 h-4" /> Guardar Cambios de Configuración
        </button>
      </form>
    </div>
  );
};
