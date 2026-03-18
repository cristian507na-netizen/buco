import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, Mic, Sparkles, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)] max-w-4xl mx-auto w-full border border-border/50 rounded-2xl bg-surface/30 overflow-hidden relative">
      
      {/* AI Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-surface/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <span className=" абсолют bottom-0 right-0 h-3 w-3 rounded-full bg-success border-2 border-surface block" style={{position: 'absolute'}}></span>
          </div>
          <div>
            <h1 className="font-bold text-white leading-tight">Buco AI</h1>
            <p className="text-xs text-gray-400">Tu asistente financiero personal</p>
          </div>
        </div>
        
        <Button variant="outline" size="sm" className="bg-transparent border-border text-white hover:bg-white/5 border-dashed">
          <PlusCircle className="w-4 h-4 mr-2" />
          Nuevo chat
        </Button>
      </div>

      {/* Chat Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col gap-6 pb-4">
          
          {/* Messages */}
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={cn(
                "flex max-w-[85%]",
                msg.role === "user" ? "ml-auto" : "mr-auto gap-3"
              )}
            >
              {msg.role === "assistant" && (
                <div className="h-8 w-8 shrink-0 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 mt-1">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
              )}
              
              <div className="flex flex-col gap-2">
                {/* Diagnostic Special Card */}
                {msg.type === "diagnostic" && (
                  <div className="bg-primary/10 border border-primary/20 rounded-2xl rounded-tl-none p-4 w-full">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                        📊 Diagnóstico de Marzo 2025
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed mb-4">
                      {msg.content}
                    </p>
                    <Button variant="outline" size="sm" className="w-full bg-surface border-border text-white hover:bg-white/5 text-xs h-8">
                      Ver diagnóstico completo
                    </Button>
                  </div>
                )}

                {/* Standard Text Bubble */}
                {msg.type !== "diagnostic" && (
                  <div 
                    className={cn(
                      "p-3 px-4 rounded-2xl text-[15px] leading-relaxed",
                      msg.role === "user" 
                        ? "bg-primary text-white rounded-tr-sm" 
                        : "bg-surface border border-border text-gray-300 rounded-tl-sm"
                    )}
                  >
                    {msg.content}
                  </div>
                )}

                {/* Embedded Data Card */}
                {msg.type === "text_with_card" && msg.cardData && (
                  <div className="bg-success/10 border border-success/20 rounded-xl p-4 mt-1">
                    <p className="text-xs text-success/80 font-medium uppercase tracking-wider mb-1">
                      {msg.cardData.title}
                    </p>
                    <p className="text-2xl font-bold text-success mb-1">
                      {msg.cardData.mainValue}
                    </p>
                    <p className="text-xs text-gray-400">
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
      <div className="p-4 bg-surface/50 border-t border-border mt-auto shrink-0">
        
        {/* Suggested Chips */}
        <div className="flex overflow-x-auto gap-2 pb-4 scrollbar-hide -mx-4 px-4 mask-fade-edges">
          {suggestedQuestions.map((q, i) => (
            <button 
              key={i}
              onClick={() => setInput(q)}
              className="shrink-0 bg-background border border-border rounded-full px-3 py-1.5 text-xs text-gray-300 hover:text-white hover:border-primary/50 transition-colors whitespace-nowrap"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="relative flex items-end gap-2">
          <div className="relative flex-1">
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Pregúntale algo a Buco AI..."
              className="pr-10 bg-background border-border text-white rounded-xl h-12"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
              <Mic className="w-5 h-5" />
            </button>
          </div>
          <Button 
            onClick={handleSend}
            size="icon" 
            className="h-12 w-12 rounded-xl bg-primary hover:bg-primary-hover text-white shrink-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-center text-[10px] text-gray-500 mt-3 flex items-center justify-center gap-1">
          <Bot className="w-3 h-3" /> Buco AI tiene acceso a todos tus datos financieros de forma segura.
        </p>
      </div>
    </div>
  );
}
