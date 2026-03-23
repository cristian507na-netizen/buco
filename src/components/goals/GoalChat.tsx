"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Trash2, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { addChatMessage } from "@/app/goals/actions";
import { PlansModal } from "../profile/PlansModal";
import ReactMarkdown from "react-markdown";

export default function GoalChat({ goal, initialMessages, progress, expenses, incomes, tasks, profile }: any) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isPlansModalOpen, setIsPlansModalOpen] = useState(false);
  const [localUsage, setLocalUsage] = useState(profile?.ai_messages_used || 0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const plan = profile?.plan || 'free';
  const limit = plan === 'pro' ? 200 : plan === 'premium' ? 50 : 5;
  const isLimitReached = localUsage >= limit;

  const suggestedQuestions = [
    "¿Cómo llego más rápido?",
    "¿Qué puedo recortar?",
    "Hazme un plan mes a mes",
    "¿Es realista mi meta?",
    "Analiza mi progreso",
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (text?: string) => {
    const msg = text ?? input;
    if (!msg.trim() || isTyping || isLimitReached) return;

    const updatedMessages = [...messages, { role: 'user', content: msg }];
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);
    setLocalUsage((prev: number) => prev + 1);

    try {
      await addChatMessage(goal.id, 'user', msg);

      const res = await fetch('/api/goals/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal,
          message: msg,
          history: messages,
          progress,
          expenses,
          incomes,
          tasks,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages((prev: any) => [...prev, {
          role: 'assistant',
          content: data.message || data.error || 'Lo siento, no puedo responder en este momento.',
        }]);
        return;
      }

      await addChatMessage(goal.id, 'assistant', data.content);
      setMessages((prev: any) => [...prev, { role: 'assistant', content: data.content }]);
    } catch {
      setMessages((prev: any) => [...prev, {
        role: 'assistant',
        content: 'Error de conexión. Inténtalo de nuevo.',
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent relative">
      {/* Header */}
      <div className="px-8 py-5 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-card)] shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-black text-[var(--text-primary)] tracking-tight uppercase italic leading-none">Buco IA</h3>
            <p className="text-[10px] text-[var(--text-muted)] font-medium mt-0.5">Asesor financiero personal</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="h-8 w-8 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-red-500 hover:border-red-200 transition-all"
            title="Limpiar chat"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar scroll-smooth">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-5">
            <div className="h-20 w-20 rounded-[2rem] bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
              <Sparkles className="w-10 h-10 text-primary animate-pulse" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-xl font-black text-[var(--text-primary)] tracking-tight italic uppercase">¡Hola! Soy Buco IA</h4>
              <p className="text-[var(--text-muted)] max-w-xs mx-auto text-sm leading-relaxed">
                Tu asesor personal para alcanzar <span className="font-bold text-[var(--text-primary)]">"{goal.name}"</span>. ¿Por dónde empezamos?
              </p>
            </div>
          </div>
        )}

        {messages.map((msg: any, idx: number) => (
          <div
            key={idx}
            className={cn(
              "flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300",
              msg.role === 'user' ? "justify-end" : "justify-start items-start gap-3"
            )}
          >
            {msg.role === 'assistant' && (
              <div className="h-8 w-8 shrink-0 rounded-xl bg-[var(--bg-card)] flex items-center justify-center border border-[var(--border-color)] shadow-sm mt-1">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
            )}
            <div className={cn(
              "rounded-2xl text-sm leading-relaxed shadow-sm max-w-[82%]",
              msg.role === 'user'
                ? "bg-primary text-white px-5 py-3 rounded-tr-sm font-semibold"
                : "bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] px-5 py-4 rounded-tl-sm"
            )}>
              {msg.role === 'assistant' ? (
                <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-headings:my-1 prose-strong:text-[var(--text-primary)] prose-p:text-[var(--text-primary)] prose-li:text-[var(--text-primary)] prose-headings:text-[var(--text-primary)]">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start items-start gap-3">
            <div className="h-8 w-8 shrink-0 rounded-xl bg-[var(--bg-card)] flex items-center justify-center border border-[var(--border-color)] shadow-sm">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            </div>
            <div className="bg-[var(--bg-secondary)] px-5 py-4 rounded-2xl rounded-tl-sm border border-[var(--border-color)] flex items-center gap-1.5 shadow-sm">
              <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:0.15s]" />
              <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:0.3s]" />
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-5 bg-[var(--bg-card)] border-t border-[var(--border-color)] shrink-0">
        {/* Usage */}
        <div className="flex justify-between items-center mb-3 px-1">
          <span className={cn(
            "text-[10px] font-bold uppercase tracking-widest",
            localUsage >= limit ? "text-red-500" : localUsage >= limit * 0.8 ? "text-amber-500" : "text-emerald-500"
          )}>
            {localUsage} / {limit} mensajes este mes
          </span>
          {isLimitReached && (
            <button
              onClick={() => setIsPlansModalOpen(true)}
              className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
            >
              Mejorar plan
            </button>
          )}
        </div>

        {/* Limit Banner */}
        {isLimitReached && (
          <div className="mb-3 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between dark:bg-amber-950/30 dark:border-amber-800">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="text-xs font-bold text-amber-900 dark:text-amber-400">
                Límite de {limit} mensajes alcanzado.
              </p>
            </div>
            <button
              onClick={() => setIsPlansModalOpen(true)}
              className="px-3 py-1 bg-amber-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-colors ml-2 shrink-0"
            >
              Ver planes
            </button>
          </div>
        )}

        {/* Chips */}
        {messages.length < 2 && !isLimitReached && (
          <div className="flex overflow-x-auto gap-2 pb-3 no-scrollbar">
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                className="shrink-0 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-2 text-[11px] text-[var(--text-muted)] font-semibold hover:border-primary/40 hover:text-primary transition-all active:scale-95"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="flex items-end gap-3">
          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isLimitReached ? "Límite alcanzado..." : "Escribe a Buco IA... (Enter para enviar)"}
              disabled={isLimitReached}
              rows={1}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] px-5 py-3.5 rounded-2xl font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 ring-primary/20 transition-all text-sm disabled:opacity-50 placeholder:text-[var(--text-muted)] resize-none overflow-hidden leading-relaxed"
              style={{ minHeight: '48px', maxHeight: '120px' }}
              onInput={(e) => {
                const t = e.target as HTMLTextAreaElement;
                t.style.height = 'auto';
                t.style.height = Math.min(t.scrollHeight, 120) + 'px';
              }}
            />
          </div>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping || isLimitReached}
            className="h-12 w-12 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[10px] text-[var(--text-muted)] text-center mt-2">Shift+Enter para nueva línea</p>
      </div>

      <PlansModal
        isOpen={isPlansModalOpen}
        onClose={() => setIsPlansModalOpen(false)}
        currentPlan={plan}
      />
    </div>
  );
}
