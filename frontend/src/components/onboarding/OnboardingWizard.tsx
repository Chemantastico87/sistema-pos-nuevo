import React, { useState } from 'react';
import { CheckCircle2, Sparkles, Building2, Upload, Coins, Percent, PackagePlus, Lock, ShoppingCart, ArrowRight, ArrowLeft, X } from 'lucide-react';
import { useAuthStore } from '../../core/store/authStore';
import { apiClient } from '../../core/services/apiClient';

interface OnboardingWizardProps {
  onFinish: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onFinish }) => {
  const [step, setStep] = useState(1);
  const user = useAuthStore((s) => s.user);
  const setOnboardingCompleted = useAuthStore((s) => s.setOnboardingCompleted);

  // Form states for wizard steps
  const [taxId, setTaxId] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [currency, setCurrency] = useState(user?.currency || 'EUR');
  const [vatRate, setVatRate] = useState(21.0);
  
  // Product state
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productCost, setProductCost] = useState('');
  const [productStock, setProductStock] = useState('');

  // Cash state
  const [openingBalance, setOpeningBalance] = useState('100.00');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNextStep = () => {
    if (step < 8) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSkipWizard = async () => {
    setOnboardingCompleted(true);
    onFinish();
    try {
      await apiClient.put('/auth/company-settings', { onboarding_completed: true });
    } catch (e) {
      // Ignorar errores al omitir
    }
  };

  const handleCompleteWizard = async () => {
    // Cerrar el modal e ir al TPV de inmediato
    setOnboardingCompleted(true);
    onFinish();

    try {
      // Guardar configuración de empresa en segundo plano
      await apiClient.put('/auth/company-settings', {
        tax_id: taxId,
        address,
        phone,
        logo_url: logoUrl,
        currency,
        default_vat_rate: vatRate,
        onboarding_completed: true,
      });

      // Crear primer producto si se ingresó
      if (productName && productPrice) {
        try {
          await apiClient.post('/products', {
            name: productName,
            price: parseFloat(productPrice) || 0,
            cost_price: productCost.trim() !== '' ? parseFloat(productCost) : null,
            stock: parseFloat(productStock) || 10,
            vat_rate: vatRate,
          });
        } catch (e) {
          console.warn('Error no crítico creando primer producto:', e);
        }
      }

      // Abrir caja con saldo inicial si se solicita
      if (openingBalance) {
        try {
          await apiClient.post('/cash/open', {
            opening_balance: parseFloat(openingBalance) || 0,
            name: 'Caja Principal',
          });
        } catch (e) {
          // Si la caja ya estaba abierta, ignorar error
        }
      }
    } catch (err: any) {
      console.error('Error guardando onboarding:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col font-sans">
        
        {/* Header con Barra de Progreso de 8 Pasos y Botón Cerrar/Omitir */}
        <div className="p-6 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Asistente de Configuración Inicial</h2>
              <p className="text-xs text-slate-400">Paso {step} de 8</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <div
                  key={s}
                  className={`w-3 h-3 rounded-full transition-all ${
                    s === step
                      ? 'bg-indigo-500 scale-125 ring-4 ring-indigo-500/20'
                      : s < step
                      ? 'bg-emerald-500'
                      : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={handleSkipWizard}
              title="Omitir asistente e ir directo al TPV"
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cuerpo Dinámico por Pasos */}
        <div className="p-8 flex-1 overflow-y-auto space-y-6">
          
          {/* Paso 1: BIENVENIDO */}
          {step === 1 && (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/30 rounded-3xl flex items-center justify-center mx-auto text-indigo-400">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-white">¡Bienvenido a NEXUS POS SaaS!</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  Gracias por registrar tu empresa. En menos de 3 minutos dejaremos configurado tu sistema TPV para que comiences a vender inmediatamente.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-4 text-left">
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
                  <span className="text-xs font-bold text-indigo-400 block mb-1">⚡ Rápido</span>
                  <span className="text-[11px] text-slate-400">Diseñado para cobros instantáneos en pantalla táctil o teclado.</span>
                </div>
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
                  <span className="text-xs font-bold text-emerald-400 block mb-1">🛡️ Seguro</span>
                  <span className="text-[11px] text-slate-400">Multi-tenant, cifrado y respaldos automáticos diarios.</span>
                </div>
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
                  <span className="text-xs font-bold text-purple-400 block mb-1">📊 Control</span>
                  <span className="text-[11px] text-slate-400">Inventario con cálculo de margen, lotes y cierres de caja.</span>
                </div>
              </div>
            </div>
          )}

          {/* Paso 2: CONFIGURAR EMPRESA */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Building2 className="w-6 h-6 text-indigo-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Paso 2: Datos Comerciales de la Empresa</h3>
                  <p className="text-xs text-slate-400">Esta información aparecerá en tus facturas y tickets impresos.</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">CIF / NIF / Tax ID</label>
                  <input
                    type="text"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    placeholder="B-12345678"
                    className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Dirección Fiscal / Comercio</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Av. Gran Vía #45, Madrid"
                    className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Teléfono de Contacto</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+34 912 345 678"
                    className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Paso 3: SUBIR LOGO */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Upload className="w-6 h-6 text-indigo-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Paso 3: Logo de la Empresa</h3>
                  <p className="text-xs text-slate-400">Ingresa la URL del logotipo para imprimirlo en los tickets térmicos y facturas PDF.</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">URL del Logo (Opcional)</label>
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://suempresa.com/logo.png"
                    className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                  />
                </div>
                {logoUrl && (
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-center">
                    <span className="text-xs font-bold text-slate-400 block mb-2">Vista Previa</span>
                    <img src={logoUrl} alt="Logo preview" className="h-12 mx-auto object-contain" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Paso 4: ELEGIR MONEDA */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Coins className="w-6 h-6 text-indigo-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Paso 4: Configuración de Moneda</h3>
                  <p className="text-xs text-slate-400">Selecciona el formato de moneda principal para tus ventas e informes.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                {['EUR (€)', 'USD ($)', 'MXN ($)', 'COP ($)'].map((curr) => {
                  const code = curr.split(' ')[0];
                  return (
                    <button
                      key={code}
                      onClick={() => setCurrency(code)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        currency === code
                          ? 'bg-indigo-600/20 border-indigo-500 text-white font-bold'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <span className="text-sm block">{curr}</span>
                      <span className="text-[11px] text-slate-400">Formato estándar de pre visualización</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Paso 5: ELEGIR IMPUESTOS */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Percent className="w-6 h-6 text-indigo-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Paso 5: Impuestos (IVA / Tax)</h3>
                  <p className="text-xs text-slate-400">Elige el tipo de impuesto por defecto aplicado a tus productos.</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                {[
                  { label: 'IVA General 21%', val: 21.0 },
                  { label: 'IVA Reducido 10%', val: 10.0 },
                  { label: 'Exento / 0%', val: 0.0 },
                ].map((item) => (
                  <button
                    key={item.val}
                    onClick={() => setVatRate(item.val)}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      vatRate === item.val
                        ? 'bg-indigo-600/20 border-indigo-500 text-white font-bold'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <span className="text-sm block">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Paso 6: CREAR PRIMER PRODUCTO */}
          {step === 6 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <PackagePlus className="w-6 h-6 text-indigo-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Paso 6: Crea tu Primer Producto Real</h3>
                  <p className="text-xs text-slate-400">Agrega tu primer artículo para estrenar tu catálogo.</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Nombre del Producto</label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Ej. Café Espresso Molido 250g"
                    className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Precio Venta ({currency})</label>
                    <input
                      type="number"
                      step="0.01"
                      value={productPrice}
                      onChange={(e) => setProductPrice(e.target.value)}
                      placeholder="12.50"
                      className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Precio Compra (Opcional) ({currency})</label>
                    <input
                      type="number"
                      step="0.01"
                      value={productCost}
                      onChange={(e) => setProductCost(e.target.value)}
                      placeholder="Opcional"
                      className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Stock Inicial</label>
                    <input
                      type="number"
                      value={productStock}
                      onChange={(e) => setProductStock(e.target.value)}
                      placeholder="50"
                      className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Paso 7: ABRIR CAJA */}
          {step === 7 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Lock className="w-6 h-6 text-indigo-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Paso 7: Apertura de Caja Registradora</h3>
                  <p className="text-xs text-slate-400">Ingresa el saldo base en efectivo para iniciar el turno.</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Fondo de Caja Inicial ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    value={openingBalance}
                    onChange={(e) => setOpeningBalance(e.target.value)}
                    placeholder="100.00"
                    className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Paso 8: REALIZAR PRIMERA VENTA */}
          {step === 8 && (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl flex items-center justify-center mx-auto text-emerald-400">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-white">¡Todo Listo para tu Primera Venta!</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Hemos guardado tu configuración. Tu TPV está listo para procesar cobros en efectivo, tarjeta o Bizum y generar tus cierres de caja diarios.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer con Controles de Navegación */}
        <div className="p-6 bg-slate-800/80 border-t border-slate-700 flex items-center justify-between">
          <button
            onClick={handlePrevStep}
            disabled={step === 1}
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${
              step === 1
                ? 'opacity-40 cursor-not-allowed border-slate-800 text-slate-600'
                : 'border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          {step < 8 ? (
            <button
              onClick={handleNextStep}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              <span>Siguiente</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleCompleteWizard}
              disabled={isLoading}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isLoading ? 'Finalizando...' : 'Comenzar a Vender Ahora'}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
