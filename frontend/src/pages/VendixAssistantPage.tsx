import React, { useState } from 'react';
import { Sparkles, Send, Bot, User, CheckCircle2, AlertTriangle, ArrowRight, Printer, Wallet, Settings, HelpCircle, FileText } from 'lucide-react';
import { useAuthStore } from '../core/store/authStore';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  actionButton?: { label: string; action: string };
  ticketCreated?: boolean;
}

export const VendixAssistantPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text: `Hola, ${user?.full_name || 'Administrador'}. Soy tu Asistente Técnico Virtual especializado en VENDIX POS. Conozco la configuración de tu empresa (${user?.company_name || 'Mi Empresa'}), tu plan ${user?.plan || 'Starter'} y las herramientas activas. ¿En qué te puedo ayudar hoy?`,
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    setTimeout(() => {
      let replyText = 'Entendido. Para solucionar esa solicitud en VENDIX:';
      let actionBtn: any = undefined;
      let isTicket = false;

      const qLower = query.toLowerCase();

      if (qLower.includes('cierre') || qLower.includes('caja')) {
        replyText = 'Para realizar un cierre de caja: Ve a "Caja & Cierre" desde el menú lateral, introduce el desglose contado en efectivo y haz clic en "Cerrar Caja con Firma".';
        actionBtn = { label: 'Ir a Caja & Cierre', action: '/cash' };
      } else if (qLower.includes('impresora') || qLower.includes('ticket') || qLower.includes('imprimir')) {
        replyText = 'Guía de solución para Impresora Térmica: 1. Comprueba que el cable USB/Bluetooth esté conectado. 2. Verifica en "Diagnóstico" si el estado WebUSB es verde. 3. Revisa que el papel térmico de 80mm/58mm tenga saldo suficiente.';
        actionBtn = { label: 'Ejecutar Diagnóstico de Impresora', action: '/diagnostics' };
      } else if (qLower.includes('iva') || qLower.includes('impuesto')) {
        replyText = 'Para modificar el tipo de IVA por defecto o aplicar Recargo de Equivalencia, accede a la sección de Configuración de Empresa.';
        actionBtn = { label: 'Ir a Configuración Fiscal', action: '/settings' };
      } else if (qLower.includes('plan') || qLower.includes('suscripcion')) {
        replyText = 'Puedes consultar o cambiar tu plan VENDIX desde la sección de Suscripciones y canjear cupones promocionales.';
        actionBtn = { label: 'Ir a Suscripción', action: '/subscriptions' };
      } else {
        replyText = 'No he podido resolver automáticamente la incidencia. He generado un Ticket de Soporte Técnico prioritario para nuestro equipo con el historial de tu cuenta.';
        isTicket = true;
      }

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: replyText,
        actionButton: actionBtn,
        ticketCreated: isTicket,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="space-y-6 font-sans max-w-4xl mx-auto">
      {/* HEADER DEL ASISTENTE TÉCNICO VENDIX AI */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Sparkles className="w-4.5 h-4.5 animate-pulse" />
            </div>
            <h1 className="text-2xl font-black tracking-tight font-heading">Asistente Técnico VENDIX AI</h1>
          </div>
          <p className="text-xs text-slate-300">
            Técnico virtual especializado en resolver dudas operativas, configuración e impresoras en tiempo real.
          </p>
        </div>
      </div>

      {/* CHAT DE SOPORTE TÉCNICO VIRTUAL */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4 flex flex-col h-[520px]">
        
        {/* ÁREA DE MENSAJES */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs shrink-0 shadow-xs">
                  <Bot className="w-4.5 h-4.5" />
                </div>
              )}

              <div className={`p-4 rounded-2xl text-xs max-w-lg space-y-2.5 ${
                m.sender === 'user'
                  ? 'bg-indigo-600 text-white font-medium rounded-tr-none'
                  : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-none'
              }`}>
                <p className="leading-relaxed">{m.text}</p>

                {m.actionButton && (
                  <button
                    onClick={() => window.location.href = m.actionButton!.action}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{m.actionButton.label}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}

                {m.ticketCreated && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Ticket #TK-{Math.floor(1000 + Math.random() * 9000)} generado exitosamente para Soporte Humano.</span>
                  </div>
                )}
              </div>

              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <Bot className="w-4 h-4 text-indigo-500 animate-spin" />
              <span>Analizando configuración VENDIX...</span>
            </div>
          )}
        </div>

        {/* ATACANTE RÁPIDO DE CONSULTAS FRECUENTES */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 overflow-x-auto text-xs">
          <button
            onClick={() => handleSendMessage('¿Cómo hago un cierre de caja?')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold shrink-0 transition-all cursor-pointer"
          >
            ¿Cómo hago un cierre de caja?
          </button>
          <button
            onClick={() => handleSendMessage('No imprime el ticket')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold shrink-0 transition-all cursor-pointer"
          >
            No imprime el ticket
          </button>
          <button
            onClick={() => handleSendMessage('¿Cómo cambio el IVA?')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold shrink-0 transition-all cursor-pointer"
          >
            ¿Cómo cambio el IVA?
          </button>
        </div>

        {/* INPUT DE ENVIAR PREGUNTA */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu consulta o error..."
            className="flex-1 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none shadow-xs"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <span>Enviar</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>
    </div>
  );
};
