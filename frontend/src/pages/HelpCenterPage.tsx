import React, { useState } from 'react';
import { BookOpen, Search, Clock, Sparkles, CheckCircle2, ChevronRight, HelpCircle, Keyboard, Headphones, Monitor, Package, Warehouse, Wallet, Receipt, Users, CreditCard, Database, Settings, Printer } from 'lucide-react';

interface Article {
  id: string;
  section: string;
  title: string;
  time: string;
  content: string;
  tips: string;
  icon: any;
}

const ARTICLES: Article[] = [
  {
    id: '1',
    section: 'Primeros pasos',
    title: 'Guía de Inicio Rápido en VENDIX POS',
    time: '3 min',
    content: 'Aprende a realizar tu primera venta, configurar la moneda de tu país y abrir tu caja registradora en menos de 3 minutos.',
    tips: 'Consejo: Utiliza el atajo F2 para enfocar el buscador de productos inmediatamente.',
    icon: Sparkles
  },
  {
    id: '2',
    section: 'Configuración',
    title: 'Configuración Fiscal & Datos de Empresa',
    time: '5 min',
    content: 'Define el NIF/CIF, razón social, dirección, tipo de IVA por defecto (21%, 10%, 4%, Exento) y Recargo de Equivalencia.',
    tips: 'Mantén actualizados los datos fiscales para que aparezcan en el encabezado de tus facturas y tickets.',
    icon: Settings
  },
  {
    id: '3',
    section: 'POS TPV',
    title: 'Operación de la Pantalla de Cobro TPV',
    time: '4 min',
    content: 'Selección de productos por código de barras, búsqueda por nombre, aplicación de descuentos globales y pago mixto.',
    tips: 'Presiona F4 para abrir directamente el diálogo de cobro sin tocar el ratón.',
    icon: Monitor
  },
  {
    id: '4',
    section: 'Productos',
    title: 'Gestión Comercial de Catálogo & Precios',
    time: '6 min',
    content: 'Creación de productos con SKU, EAN-13, precio de coste, PVP, margen neto estimado e historial auditado de precios.',
    tips: 'Asigna imágenes y categorías para agilizar la venta táctil en pantallas de mostrador.',
    icon: Package
  },
  {
    id: '5',
    section: 'Inventario',
    title: 'Control Multi-Almacén & Movimientos',
    time: '5 min',
    content: 'Registro auditado de Entradas, Salidas, Ajustes de Stock, Devoluciones y Transferencias entre almacenes.',
    tips: 'Configura el stock mínimo para recibir alertas preventivas de agotamiento desde VENDIX AI.',
    icon: Warehouse
  },
  {
    id: '6',
    section: 'Clientes',
    title: 'Fidelización & Base de Datos de Clientes',
    time: '3 min',
    content: 'Alta de clientes con datos de contacto, historial acumulado de compras y seguimiento de inactividad.',
    tips: 'Ofrece ofertas de re-enganche a clientes con más de 30 días sin comprar.',
    icon: Users
  },
  {
    id: '7',
    section: 'Caja',
    title: 'Apertura, Movimientos Manuales & Retiros',
    time: '4 min',
    content: 'Registro del saldo inicial de caja, depósitos adicionales e ingrso de justificaciones de retiro de efectivo.',
    tips: 'Registra los movimientos en el momento exacto para evitar descuadres al cierre.',
    icon: Wallet
  },
  {
    id: '8',
    section: 'Cierre del día',
    title: 'Arqueo de Caja Profesional & Firma Responsable',
    time: '5 min',
    content: 'Conteo de saldo esperado vs real en efectivo, tarjetas, Bizum y vales con cálculo de diferencias y firma de responsabilidad.',
    tips: 'Un cierre cuadrado garantiza la precisión contable de la jornada.',
    icon: CheckCircle2
  },
  {
    id: '9',
    section: 'Tickets',
    title: 'Consulta, Anulación & Reimpresión de Facturas',
    time: '3 min',
    content: 'Revisión del historial completo de tickets emitidos, anulación auditada y descarga en formato PDF o serie personalizada.',
    tips: 'Recuerda que cada factura sigue la serie configurada (ej. FAC-2026-00001).',
    icon: Receipt
  },
  {
    id: '10',
    section: 'Impresoras ESC/POS',
    title: 'Conexión WebUSB, Bluetooth & Térmica 80mm/58mm',
    time: '4 min',
    content: 'Configuración de impresoras de tickets térmicas mediante protocolo ESC/POS directo sin controladores complejos.',
    tips: 'Si la impresora no responde, ejecuta el test de conexión en el módulo de Diagnóstico.',
    icon: Printer
  },
  {
    id: '11',
    section: 'Usuarios',
    title: 'Roles de Personal (Admin, Encargado, Cajero)',
    time: '4 min',
    content: 'Creación de usuarios colaboradores con contraseña segura y limitación de permisos según el puesto.',
    tips: 'Revisa la matriz de permisos visuales para desactivar la apertura de caja a empleados no autorizados.',
    icon: Users
  },
  {
    id: '12',
    section: 'Permisos',
    title: 'Matriz de Permisos Visuales (✔ / ✖)',
    time: '3 min',
    content: 'Configuración transparente de permisos por módulo mediante tarjetas de estado verdes y rojas.',
    tips: 'Los administradores conservan acceso total por defecto.',
    icon: ShieldCheck
  },
  {
    id: '13',
    section: 'Suscripciones',
    title: 'Planes VENDIX (Starter, Profesional, Business, Enterprise)',
    time: '4 min',
    content: 'Comparativa de planes comerciales, canje de cupones (WELCOME50, PRIMERMES) y cambio de cuota sin interrupción.',
    tips: 'Si caduca el trial de 14 días, la cuenta pasa a modo solo lectura sin borrar datos.',
    icon: CreditCard
  },
  {
    id: '14',
    section: 'Backups Enterprise',
    title: 'Snapshots Pre-Críticos & Time Machine',
    time: '5 min',
    content: 'Generación de backups SQL/ZIP cifrados en AES-256 y restauración del sistema a cualquier fecha previa en <5 min.',
    tips: 'Descarga copias periódicas para almacenamiento en la nube o disco externo.',
    icon: Database
  },
  {
    id: '15',
    section: 'Preguntas frecuentes',
    title: 'Resolución de Dudas Comunes',
    time: '5 min',
    content: 'Respuestas a las preguntas operativas más frecuentes de los clientes comerciales.',
    tips: 'Utiliza el Asistente VENDIX AI si necesitas ayuda personalizada.',
    icon: HelpCircle
  },
  {
    id: '16',
    section: 'Atajos teclado',
    title: 'Tabla Completa de Teclas Rápidas',
    time: '2 min',
    content: 'F2 (Búsqueda), F4 (Cobro Rápido), ESC (Limpiar/Cancelar), F8 (Ticket en espera).',
    tips: 'Operar con atajos acelera el flujo de cobro en más de un 40%.',
    icon: Keyboard
  },
  {
    id: '17',
    section: 'Novedades',
    title: 'Notas de Versión VENDIX v5.0',
    time: '3 min',
    content: 'Descubre las últimas características añadidas: VENDIX Insights, VENDIX AI Contextual y VENDIX Cloud.',
    tips: 'Revisa periódicamente esta sección para conocer nuevas integraciones.',
    icon: Sparkles
  }
];

export const HelpCenterPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(ARTICLES[0]);

  const filteredArticles = ARTICLES.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.section.toLowerCase().includes(search.toLowerCase()) ||
    a.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      {/* HEADER CENTRO DE AYUDA VENDIX */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <BookOpen className="w-4.5 h-4.5" />
            </div>
            <h1 className="text-2xl font-black tracking-tight font-heading">Centro de Ayuda VENDIX</h1>
          </div>
          <p className="text-xs text-slate-300">
            Documentación oficial, manuales de usuario, preguntas frecuentes y buenas prácticas.
          </p>
        </div>

        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar artículos o temas..."
            className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none shadow-xs"
          />
        </div>
      </div>

      {/* GRID PRINCIPAL: LISTADO DE ARTÍCULOS Y VISOR DETALLADO */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* COLUMNA IZQUIERDA: MENÚ DE 17 SECCIONES */}
        <div className="col-span-4 bg-white rounded-2xl border border-slate-200/80 p-4 space-y-2 max-h-[70vh] overflow-y-auto">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
            Secciones de Documentación ({filteredArticles.length})
          </h2>
          {filteredArticles.map((art) => {
            const Icon = art.icon;
            const isSelected = selectedArticle?.id === art.id;
            return (
              <div
                key={art.id}
                onClick={() => setSelectedArticle(art)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold shadow-xs'
                    : 'bg-slate-50/60 border-slate-100 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <div>
                    <span className="text-xs block leading-tight">{art.title}</span>
                    <span className="text-[10px] text-slate-400 block font-normal">{art.section}</span>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </div>
            );
          })}
        </div>

        {/* COLUMNA DERECHA: VISOR DEL ARTÍCULO SELECCIONADO */}
        <div className="col-span-8 bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6">
          {selectedArticle ? (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[11px]">
                    {selectedArticle.section}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {selectedArticle.time} de lectura
                  </span>
                </div>
                <h2 className="text-xl font-black text-slate-900 font-heading">{selectedArticle.title}</h2>
              </div>

              <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
                <p>{selectedArticle.content}</p>
                <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-1">
                  <span className="font-bold text-indigo-900 block text-xs">💡 Buenas Prácticas & Consejos</span>
                  <p className="text-xs text-indigo-700 leading-relaxed">{selectedArticle.tips}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              Selecciona una sección de la lista para leer la guía oficial VENDIX.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
