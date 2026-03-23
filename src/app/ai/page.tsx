"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, Mic, Sparkles, PlusCircle, ArrowRight, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

// Mocks
const suggestedQuestions = [
  "💸 ¿Cuánto puedo gastar esta semana?",
  "📈 ¿En qué gasto más este mes?",
  "🎯 ¿Voy bien para ahorrar?",
  "💳 ¿Cuándo pago mi tarjeta?",
  "💰 ¿Cuándo termino de pagar mi deuda?",
];

const initialMessages = [
  {
    id: 1,
    role: "assistant",
    type: "diagnostic",
    content: "Este mes gastaste $2,180 de tu sueldo de $3,500 (62.3%). Tu mayor categoría fue Comida ($763). Pagaste a tiempo todas tus tarjetas. Recomendación: Reducir $150 en ocio te permitiría ahorrar $600/mes.",
  },
  {
    id: 2,
    role: "user",
    content: "¿Cuánto puedo gastar esta semana?",
  },
  {
    id: 3,
    role: "assistant",
    type: "text_with_card",
    content: "Considerando tu saldo disponible de $1,320 y que quedan 4 días del mes, te recomiendo no gastar más de $330 esta semana para mantener tu colchón de ahorro. 💡",
    cardData: {
      title: "Presupuesto Semanal Sugerido",
      mainValue: "$330",
      subValue: "Saldo actual: $1,320 (4 días restantes)",
    }
  }
];

export default function AIPage() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { id: Date.now(), role: "user", content: input }]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] lg:h-[calc(100vh-2rem)] max-w-5xl mx-auto w-full border border-white/5 rounded-[32px] bg-[#0A0F1E]/50 backdrop-blur-3xl overflow-hidden relative shadow-2xl">
      
      {/* 🚀 Premium AI Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02] shrink-0">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl group-hover:bg-primary/40 transition-all"></div>
            <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center border border-white/20 shadow-lg cursor-pointer transition-transform hover:scale-105 active:scale-95">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-[#0A0F1E] block animate-pulse"></span>
          </div>
          <div>
            <h1 className="font-black text-white text-lg tracking-tight leading-none mb-1">Buco AI</h1>
            <div className="flex items-center gap-2">
               <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">En línea • Inteligencia Real</p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => setMessages([])}
          className="bg-white/5 hover:bg-white/10 p-3 rounded-2xl border border-white/10 transition-all group flex items-center gap-2"
        >
          <PlusCircle className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
          <span className="text-xs text-gray-400 font-bold group-hover:text-white transition-colors hidden sm:inline">Nuevo Chat</span>
        </button>
      </div>

      {/* Chat Area */}
      <ScrollArea className="flex-1 px-4 sm:px-8 py-6">
        <div className="flex flex-col gap-8 pb-10">
          
          {messages.length === 0 && (
             <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20 mb-4 animate-bounce duration-[3000ms]">
                   <Sparkles className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-black text-white">¿En qué puedo ayudarte hoy?</h2>
                <p className="text-gray-500 text-sm max-w-sm mx-auto">Pregúntame sobre tus gastos, ahorros o cómo mejorar tu salud financiera.</p>
             </div>
          )}

          {/* Messages */}
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={cn(
                "flex w-full group transition-all animate-in fade-in slide-in-from-bottom-2",
                msg.role === "user" ? "justify-end" : "justify-start gap-4"
              )}
            >
              {msg.role === "assistant" && (
                <div className="h-10 w-10 shrink-0 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 mt-1 shadow-sm">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
              )}
              
              <div className={cn(
                "flex flex-col gap-3 max-w-[85%] sm:max-w-[70%]",
                msg.role === "user" ? "items-end" : "items-start"
              )}>
                {/* Special Diagnostic Card */}
                {msg.type === "diagnostic" && (
                  <div className="bg-gradient-to-br from-blue-600/20 to-primary/5 border border-primary/30 rounded-[28px] rounded-tl-none p-6 shadow-2xl backdrop-blur-md">
                    <div className="flex items-center gap-3 mb-4">
                       <TrendingUp className="w-5 h-5 text-primary" />
                       <span className="text-primary font-black text-[10px] uppercase tracking-[0.2em]">Diagnóstico de Inteligencia</span>
                    </div>
                    <p className="text-white text-[15px] leading-relaxed font-medium mb-6">
                      {msg.content}
                    </p>
                    <button className="w-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-3.5 rounded-2xl border border-white/10 transition-all flex items-center justify-center gap-2 group/btn">
                      Ver informe detallado del mes <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                )}

                {/* Standard Text Bubble */}
                {!msg.type || msg.type === "text_with_card" ? (
                  <div 
                    className={cn(
                      "p-4 px-6 rounded-[24px] text-[15px] leading-relaxed font-medium shadow-lg transition-all",
                      msg.role === "user" 
                        ? "bg-primary text-white rounded-tr-none hover:bg-blue-600" 
                        : "bg-white/[0.03] border border-white/10 text-gray-200 rounded-tl-none hover:bg-white/[0.05]"
                    )}
                  >
                    {msg.content}
                  </div>
                ) : null}

                {/* Embedded Data Card */}
                {msg.type === "text_with_card" && msg.cardData && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[24px] p-6 w-full shadow-inner relative overflow-hidden group/card">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover/card:opacity-10 transition-all">
                       <TrendingUp size={100} className="text-emerald-500" />
                    </div>
                    <p className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.2em] mb-2 font-mono">
                      {msg.cardData.title}
                    </p>
                    <p className="text-4xl font-black text-white mb-2 tracking-tighter">
                      {msg.cardData.mainValue}
                    </p>
                    <p className="text-xs text-emerald-500/60 font-bold italic">
                      {msg.cardData.subValue}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
          
        </div>
      </ScrollArea>

      {/* Suggested & Input Area */}
      <div className="p-6 bg-white/[0.02] border-t border-white/5 mt-auto shrink-0 backdrop-blur-xl">
        
        {/* Suggested Chips */}
        <div className="flex overflow-x-auto gap-3 pb-6 no-scrollbar group">
          {suggestedQuestions.map((q, i) => (
            <button 
              key={i}
              onClick={() => setInput(q)}
              className="shrink-0 bg-white/5 border border-white/10 rounded-2xl px-5 py-2.5 text-xs text-gray-400 font-bold hover:text-white hover:bg-primary/20 hover:border-primary/40 transition-all whitespace-nowrap active:scale-95 shadow-sm"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="relative flex items-end gap-3 max-w-4xl mx-auto">
          <div className="relative flex-1 group">
            <Input 
              value={input}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSend()}
              placeholder="Habla con Buco AI..."
              className="pr-12 bg-white/5 border-white/10 text-white rounded-[20px] h-14 focus:ring-primary/20 focus:border-primary/50 transition-all font-medium placeholder:text-gray-600 shadow-inner"
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-primary transition-colors p-1">
              <Mic className="w-5 h-5" />
            </button>
          </div>
          <button 
            onClick={handleSend}
            disabled={!input.trim()}
            className="h-14 w-14 rounded-[20px] bg-primary hover:bg-blue-600 disabled:opacity-20 disabled:hover:bg-primary text-white flex items-center justify-center shrink-0 transition-all shadow-xl shadow-primary/20 active:scale-95 group"
          >
            <Send className="w-6 h-6 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
        <div className="mt-4 flex items-center justify-center gap-2">
           <div className="h-px w-8 bg-white/5"></div>
           <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em] flex items-center gap-2">
              <ShieldCheck className="w-3 h-3" /> Datos Protegidos por Buco Security
           </p>
           <div className="h-px w-8 bg-white/5"></div>
        </div>
      </div>
    </div>
  );
}

function ShieldCheck({ className }: { className?: string }) {
   return <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>;
}
