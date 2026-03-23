"use client";

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { X, Send, Bot, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import ReactMarkdown from 'react-markdown';

const SUGGESTIONS: Record<string, string[]> = {
  '/': ['📊 ¿Cómo van mis finanzas este mes?', '✂️ ¿Qué gastos puedo reducir?', '🎯 ¿Cuánto llevo en mis metas?', '🔔 ¿Tengo pagos próximos?'],
  '/expenses': ['📊 ¿En qué categoría gasto más?', '🔄 ¿Cuáles son mis suscripciones?', '📅 Compara con el mes pasado', '⚠️ ¿Hay gastos inusuales?'],
  '/goals': ['⚠️ ¿Cuál meta está en riesgo?', '💰 ¿Cuánto necesito ahorrar?', '📅 Plan para llegar más rápido', '🏆 ¿Cuál meta priorizo?'],
  '/cards': ['❤️ ¿Cómo está mi salud crediticia?', '💸 ¿Cuánto pago en intereses?', '📅 ¿Cuándo es mi próximo corte?', '📉 ¿Cómo bajo mi utilización?'],
  '/reports': ['🔍 Análisis de este mes', '📈 ¿En qué mejoré?', '💡 Mis top 3 insights', '💰 ¿Cuál es mi tasa de ahorro?'],
};

// Extract plain text from v6 UIMessage parts
function getMessageText(msg: { parts?: Array<{ type: string; text?: string }> }): string {
  if (!msg.parts) return '';
  return msg.parts
    .filter(p => p.type === 'text')
    .map(p => p.text ?? '')
    .join('');
}

export function AIAssistantWidget({ userId }: { userId?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const pathname = usePathname();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialMessages: UIMessage[] = [
    {
      id: 'greeting',
      role: 'assistant',
      parts: [{ type: 'text', text: '¡Hola! Soy Buco AI 👋 ¿En qué puedo ayudarte hoy?' }],
    },
  ];

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/assistant/chat' }),
    messages: initialMessages,
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!userId) return null;

  const currentSuggestions = SUGGESTIONS[pathname] ?? SUGGESTIONS['/'];

  const handleSend = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    setInput('');
    sendMessage({ text: trimmed });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  // Only show user and assistant messages (skip tool/system internals)
  const visibleMessages = messages.filter(
    m => m.role === 'user' || m.role === 'assistant'
  );

  return (
    <>
      {/* Trigger button — fixed bottom-right */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{ zIndex: 9999 }}
        className={cn(
          "fixed w-14 h-14 rounded-2xl flex items-center justify-center text-white transition-all duration-300 shadow-2xl",
          "bottom-[100px] right-6 md:bottom-6 md:right-6",
          isOpen ? "scale-90 opacity-80" : "scale-100 opacity-100",
          "bg-gradient-to-br from-[#2563EB] to-[#06B6D4] hover:shadow-[#2563EB]/50 hover:scale-105"
        )}
      >
        <Sparkles className="w-6 h-6" />
      </button>

      {/* Panel — desktop: 320×440 bottom-right; mobile: bottom sheet full width */}
      <div
        style={{ zIndex: 9999 }}
        className={cn(
          "fixed transition-all duration-500 flex flex-col overflow-hidden shadow-2xl",
          "md:w-[320px] md:max-h-[440px] md:bottom-[80px] md:right-6 md:left-auto md:rounded-3xl",
          "w-full h-[85vh] bottom-0 left-0 right-0 rounded-t-[24px] md:rounded-3xl",
          "bg-[#0A0F1E]/95 backdrop-blur-3xl border border-[#1F2D45]",
          isOpen
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "translate-y-[120%] opacity-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-11 px-3 border-b border-[#1F2D45] bg-[#1A2234]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#06B6D4] flex items-center justify-center shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
              <Bot className="w-3.5 h-3.5 text-white relative z-10" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white tracking-tight leading-none mb-0.5">Buco AI</h3>
              <p className="text-[8px] text-[#2563EB] font-black uppercase tracking-widest leading-none">Asistente</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto p-3 pb-6 space-y-4 no-scrollbar scroll-smooth">
          {visibleMessages.map((m) => {
            const text = getMessageText(m as Parameters<typeof getMessageText>[0]);
            return (
              <div key={m.id} className={cn("flex w-full", m.role === 'user' ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[85%] rounded-[18px] p-3 text-[13px] leading-relaxed relative transform transition-all",
                  m.role === 'user'
                    ? "bg-gradient-to-br from-[#2563EB] to-[#1E3A8A] text-white rounded-tr-sm shadow-md"
                    : "bg-[#1A2234] text-white shadow-sm border border-[#1F2D45] rounded-tl-sm"
                )}>
                  {m.role === 'assistant' && (
                    <div className="absolute -left-2.5 -top-2.5 opacity-80">
                      <Sparkles className="w-4 h-4 text-[#06B6D4]" />
                    </div>
                  )}
                  {m.role === 'assistant' ? (
                    <div className="prose prose-invert prose-sm max-w-none font-medium
                      [&_p]:mb-2 [&_p:last-child]:mb-0
                      [&_ol]:mb-2 [&_ol]:pl-4 [&_ol:last-child]:mb-0
                      [&_ul]:mb-2 [&_ul]:pl-4 [&_ul:last-child]:mb-0
                      [&_li]:mb-1
                      [&_strong]:text-white [&_strong]:font-bold
                      [&_code]:bg-white/10 [&_code]:px-1 [&_code]:rounded text-[13px]">
                      <ReactMarkdown>{text}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap font-medium text-[13px]">{text}</div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Error indicator */}
          {error && status === 'error' && (
            <div className="flex justify-start">
              <div className="bg-red-900/30 border border-red-500/30 rounded-[18px] rounded-tl-sm p-3 max-w-[85%]">
                <p className="text-[12px] text-red-400 font-medium">Error: {error.message}</p>
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#1A2234] border border-[#1F2D45] rounded-[18px] rounded-tl-sm p-3 relative">
                <div className="absolute -left-2.5 -top-2.5 opacity-80">
                  <Sparkles className="w-4 h-4 text-[#06B6D4]" />
                </div>
                <div className="flex items-center gap-1 h-5 px-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#06B6D4] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#06B6D4] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#06B6D4] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* Input area */}
        <div className="p-3 pb-[calc(env(safe-area-inset-bottom,20px)+70px)] md:pb-3 bg-[#0A0F1E] border-t border-[#1F2D45] relative z-10">
          {/* Suggestions — show only on initial state */}
          {visibleMessages.length === 1 && (
            <div className="flex flex-col gap-2 mb-2.5">
              <p className="text-[8px] font-black text-white/20 uppercase tracking-widest px-1">Sugerencias</p>
              <div className="flex flex-wrap gap-1.5">
                {currentSuggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(s)}
                    className="px-2.5 py-1.5 rounded-xl bg-[#1A2234] hover:bg-[#1F2D45] border border-[#1F2D45] text-[10px] font-bold text-white/70 hover:text-white transition-all text-left hover:scale-[1.02]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="relative flex items-end">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pregúntale a Buco..."
              className="w-full h-10 bg-[#1A2234] border border-[#1F2D45] rounded-xl text-[12px] font-medium text-white placeholder-white/30 px-3.5 py-2.5 pr-12 resize-none focus:outline-none focus:ring-1 focus:ring-[#2563EB]/50 block no-scrollbar transition-all"
              rows={1}
            />
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim() || isLoading}
              className="absolute right-1 bottom-1 w-8 h-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center disabled:opacity-50 disabled:bg-white/5 disabled:text-white/20 transition-all hover:bg-blue-500 hover:scale-105 active:scale-95 shadow-lg"
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 ml-0.5" />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
