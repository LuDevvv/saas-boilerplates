import React, { useState, useRef, useEffect } from "react";
import { useAi } from "@/hooks/use-ai";
import { ChatMessageDto } from "@node-stack/validators";
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Trash2, 
  Cpu, 
  Zap,
  Info
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const AIPlayground: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageDto[]>([
    { 
      role: "assistant", 
      content: "Hello! I'm your AI assistant. How can I help you today?" 
    }
  ]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState("gpt-4o");
  const [usage, setUsage] = useState<number | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const { streamChat, getUsage, loading } = useAi();
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchUsage = async () => {
    try {
      const currentUsage = await getUsage();
      setUsage(currentUsage);
    } catch (err) {
      console.error("Failed to fetch usage", err);
    }
  };

  useEffect(() => {
    fetchUsage();
  }, [getUsage]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading || quotaExceeded) return;

    const userMessage: ChatMessageDto = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInput("");

    // Add empty assistant message for streaming
    setMessages(prev => [...prev, { role: "assistant", content: "" }]);

    try {
      let fullContent = "";
      await streamChat(
        newMessages, 
        (chunk) => {
          fullContent += chunk;
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last && last.role === "assistant") {
              return [...prev.slice(0, -1), { ...last, content: fullContent }];
            }
            return prev;
          });
        },
        { model }
      );
      // Refresh usage after successful chat
      fetchUsage();
    } catch (error: any) {
      if (error.status === 403) {
        setQuotaExceeded(true);
        setMessages(prev => [
          ...prev.slice(0, -1),
          { 
            role: "assistant", 
            content: "You've reached your monthly AI token limit. Please upgrade your plan to continue using premium AI features." 
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev.slice(0, -1),
          { role: "assistant", content: "Error: Failed to get response from AI." }
        ]);
      }
    }
  };

  const clearChat = () => {
    setMessages([{ role: "assistant", content: "Chat cleared. How can I help you?" }]);
    setQuotaExceeded(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl rounded-3xl border border-gray-100 dark:border-white/10 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/10 bg-white/50 dark:bg-gray-900/50">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">AI Playground</h1>
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500 font-medium">Test our premium AI stack</p>
              {usage !== null && (
                <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                  {usage.toLocaleString()} tokens used
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {quotaExceeded && (
            <button 
              className="bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
              onClick={() => window.location.href = "/dashboard/settings/billing"}
            >
              <Zap size={12} fill="currentColor" />
              Upgrade Now
            </button>
          )}

          <select 
            value={model}
            onChange={(e) => setModel(e.target.value)}
            disabled={quotaExceeded}
            className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none disabled:opacity-50"
          >
            <option value="gpt-4o">GPT-4o (Smart)</option>
            <option value="gpt-4o-mini">GPT-4o Mini (Fast)</option>
            <option value="o1-preview">O1 Preview (Reasoning)</option>
          </select>
          
          <button 
            onClick={clearChat}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
            title="Clear Chat"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800"
      >
        {messages.map((m, i) => (
          <div 
            key={i} 
            className={cn(
              "flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
              m.role === "user" ? "flex-row-reverse" : "flex-row"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
              m.role === "user" 
                ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400" 
                : "bg-blue-600 text-white shadow-blue-500/20"
            )}>
              {m.role === "user" ? <User size={20} /> : <Bot size={20} />}
            </div>
            
            <div className={cn(
              "max-w-[80%] p-4 rounded-2xl text-sm md:text-base leading-relaxed",
              m.role === "user" 
                ? "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-100 rounded-tr-none shadow-sm" 
                : "bg-blue-50 dark:bg-blue-900/20 border border-blue-100/50 dark:border-blue-500/20 text-gray-800 dark:text-gray-100 rounded-tl-none"
            )}>
              {m.content || (loading && i === messages.length - 1 ? (
                <div className="flex gap-1 items-center py-1">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-75" />
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-150" />
                </div>
              ) : null)}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white/50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-white/10">
        <div className="relative group">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={quotaExceeded ? "Quota exceeded. Please upgrade." : "Type your message..."}
            disabled={loading || quotaExceeded}
            className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 pr-14 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none resize-none h-14 min-h-[56px] max-h-32 text-gray-800 dark:text-gray-100 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading || quotaExceeded}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all"
          >
            <Send size={18} />
          </button>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">
            <div className="flex items-center gap-1">
              <Zap size={10} className="text-amber-500" />
              <span>Real-time Stream</span>
            </div>
            <div className="flex items-center gap-1">
              <Cpu size={10} className="text-blue-500" />
              <span>Enterprise Stack</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-gray-400">
            <Info size={10} />
            <span>Shift + Enter for new line</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPlayground;
