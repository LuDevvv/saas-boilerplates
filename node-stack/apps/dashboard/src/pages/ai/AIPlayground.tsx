import { FC, useState, useRef, useEffect } from "react";
import { useAi, useAiUsage } from "@/features/ai";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import type { ChatMessageDto } from "@node-stack/types";
import {
  Send,
  Bot,
  User,
  Trash2,
  Zap,
  Sparkles,
  MessageSquare,
  Bookmark,
  Plus,
  ChevronDown,
  Cpu,
  Hash,
  Clock,
} from "lucide-react";
import {
  PageHeader,
  Progress,
  StatusPill,
  TwoColumnLayout,
} from "@node-stack/ui";
import { cn } from "@/utils/classNames";

// ─── Types & mock data ────────────────────────────────────────────────────────

interface MockConversation {
  id: string;
  title: string;
  preview: string;
  updatedAt: string;
  tokens: number;
}

interface MockPrompt {
  id: string;
  title: string;
  body: string;
  category: "Marketing" | "Code" | "Soporte" | "Análisis";
}

interface ChatMessageWithMeta extends ChatMessageDto {
  tokens?: number;
  latencyMs?: number;
}

const MOCK_CONVERSATIONS: MockConversation[] = [
  { id: "1", title: "Brief campaña Q2", preview: "Necesito una estrategia para...", updatedAt: "Hace 12 min", tokens: 1842 },
  { id: "2", title: "Refactor componente Card", preview: "¿Cómo extraer el patrón...?", updatedAt: "Hace 1 h", tokens: 3120 },
  { id: "3", title: "Análisis de churn", preview: "Tengo estos datos del último...", updatedAt: "Ayer", tokens: 5680 },
  { id: "4", title: "Release notes v2.4", preview: "Resume estos changelogs en...", updatedAt: "2 días", tokens: 740 },
];

const MOCK_PROMPTS: MockPrompt[] = [
  { id: "1", title: "Summary técnico", body: "Resume el siguiente texto en 5 bullets técnicos...", category: "Análisis" },
  { id: "2", title: "Email de onboarding", body: "Redacta un correo de bienvenida cordial...", category: "Marketing" },
  { id: "3", title: "Code review", body: "Revisa este código y sugiere mejoras de...", category: "Code" },
  { id: "4", title: "Respuesta a queja", body: "Responde a un cliente molesto manteniendo...", category: "Soporte" },
];

const MODELS = [
  { value: "gpt-4o", label: "GPT-4o", description: "Balanceado", contextWindow: 128_000 },
  { value: "gpt-4o-mini", label: "GPT-4o Mini", description: "Rápido y económico", contextWindow: 128_000 },
  { value: "o1-preview", label: "O1 Preview", description: "Reasoning avanzado", contextWindow: 32_000 },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const ModelSelector: FC<{
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}> = ({ value, onChange, disabled }) => {
  const [open, setOpen] = useState(false);
  const current = MODELS.find((m) => m.value === value) ?? MODELS[0];

  return (
    <div className="relative">
      <button
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        className={cn(
          "flex items-center gap-2 h-10 px-3.5 rounded-xl border border-border bg-surface text-fg",
          "text-[13px] font-medium transition-colors",
          "hover:bg-surface-hover hover:border-border-strong disabled:opacity-50"
        )}
      >
        <Cpu className="h-3.5 w-3.5 text-primary" />
        <span>{current.label}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 text-fg-muted transition-transform", open && "rotate-180")} />
      </button>
      {open && !disabled && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-border bg-surface-elevated shadow-[var(--shadow-elevated)] z-50 overflow-hidden">
            {MODELS.map((m) => (
              <button
                key={m.value}
                onClick={() => {
                  onChange(m.value);
                  setOpen(false);
                }}
                className={cn(
                  "w-full text-left px-3.5 py-2.5 transition-colors flex items-start justify-between gap-2",
                  "hover:bg-surface-hover",
                  value === m.value && "bg-primary/[0.06]"
                )}
              >
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-fg leading-snug">{m.label}</p>
                  <p className="text-[11px] text-fg-muted mt-0.5">{m.description}</p>
                </div>
                <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-fg-muted">
                  {(m.contextWindow / 1000).toFixed(0)}K
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const ConversationItem: FC<{ conversation: MockConversation; active?: boolean }> = ({
  conversation,
  active,
}) => (
  <button
    className={cn(
      "w-full text-left p-3 rounded-xl border transition-colors",
      active
        ? "bg-primary/[0.06] border-primary/20"
        : "bg-transparent border-transparent hover:bg-surface-hover hover:border-border-subtle"
    )}
  >
    <p className="text-[13px] font-semibold text-fg truncate">{conversation.title}</p>
    <p className="text-[11px] text-fg-muted truncate mt-0.5">{conversation.preview}</p>
    <div className="flex items-center justify-between mt-2">
      <span className="text-[10px] text-fg-muted">{conversation.updatedAt}</span>
      <span className="text-[10px] text-fg-muted tabular-nums">
        {conversation.tokens.toLocaleString()} tok
      </span>
    </div>
  </button>
);

const PromptItem: FC<{ prompt: MockPrompt; onUse: (body: string) => void }> = ({ prompt, onUse }) => (
  <button
    onClick={() => onUse(prompt.body)}
    className="w-full text-left p-3 rounded-xl border border-border bg-surface hover:border-border-strong hover:bg-surface-hover transition-colors"
  >
    <div className="flex items-center justify-between gap-2 mb-1">
      <p className="text-[13px] font-semibold text-fg truncate">{prompt.title}</p>
      <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider text-primary px-1.5 py-0.5 rounded-md bg-primary/10">
        {prompt.category}
      </span>
    </div>
    <p className="text-[11px] text-fg-muted line-clamp-2 leading-relaxed">{prompt.body}</p>
  </button>
);

const TokenPill: FC<{ tokens: number; latencyMs?: number }> = ({ tokens, latencyMs }) => (
  <div className="flex items-center gap-2 mt-2 text-[10px] text-fg-muted">
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-surface-muted border border-border-subtle">
      <Hash className="h-2.5 w-2.5" />
      <span className="tabular-nums">{tokens.toLocaleString()} tok</span>
    </span>
    {latencyMs !== undefined && (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-surface-muted border border-border-subtle">
        <Clock className="h-2.5 w-2.5" />
        <span className="tabular-nums">{(latencyMs / 1000).toFixed(2)}s</span>
      </span>
    )}
  </div>
);

const ContextWindowBar: FC<{ used: number; total: number }> = ({ used, total }) => {
  const pct = Math.min((used / total) * 100, 100);
  const tone = pct < 60 ? "bg-emerald-500" : pct < 85 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-fg-muted">
        <span>Ventana de contexto</span>
        <span className="tabular-nums text-fg-secondary">
          {used.toLocaleString()} / {total.toLocaleString()}
        </span>
      </div>
      <Progress value={pct} className="h-1.5" indicatorClassName={tone} />
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const AIPlayground: FC = () => {
  const [messages, setMessages] = useState<ChatMessageWithMeta[]>([
    {
      role: "assistant",
      content:
        "¡Hola! Soy tu asistente de IA. Pregúntame lo que necesites — desde un brief de campaña hasta refactor de código.",
      tokens: 28,
    },
  ]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState("gpt-4o");
  const [activeTab, setActiveTab] = useState<"history" | "prompts">("history");
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  const { activeWorkspaceId } = useWorkspaceStore();
  const workspaceId = activeWorkspaceId || "";
  const { streamChat, loading } = useAi(workspaceId);
  const { data: usage } = useAiUsage(workspaceId);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentModel = MODELS.find((m) => m.value === model) ?? MODELS[0];
  const contextUsed = messages.reduce((sum, m) => sum + (m.tokens ?? 0), 0);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading || quotaExceeded) return;

    const userMessage: ChatMessageWithMeta = {
      role: "user",
      content: input,
      tokens: Math.ceil(input.length / 4),
    };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput("");

    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    const startTime = Date.now();
    try {
      let fullContent = "";
      await streamChat(
        newMessages,
        (chunk) => {
          fullContent += chunk;
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.role === "assistant") {
              return [...prev.slice(0, -1), { ...last, content: fullContent }];
            }
            return prev;
          });
        },
        { model }
      );

      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === "assistant") {
          return [
            ...prev.slice(0, -1),
            {
              ...last,
              tokens: Math.ceil(fullContent.length / 4),
              latencyMs: Date.now() - startTime,
            },
          ];
        }
        return prev;
      });
    } catch (error: any) {
      if (error.status === 403) {
        setQuotaExceeded(true);
        setMessages((prev) => [
          ...prev.slice(0, -1),
          {
            role: "assistant",
            content:
              "Has alcanzado tu cuota mensual de tokens de IA. Mejora tu plan para seguir usando funciones premium.",
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: "assistant", content: "Error: no pudimos obtener una respuesta de la IA." },
        ]);
      }
    }
  };

  const clearChat = () => {
    setMessages([{ role: "assistant", content: "Conversación limpia. ¿En qué te ayudo?", tokens: 12 }]);
    setQuotaExceeded(false);
  };

  return (
    <div className="pb-20 animate-in fade-in duration-500">
      <PageHeader
        eyebrow="AI"
        title="AI Playground"
        description="Experimenta con modelos de IA, guarda prompts y monitorea tu consumo de tokens."
        action={
          <div className="flex items-center gap-2">
            <ModelSelector value={model} onChange={setModel} disabled={quotaExceeded} />
            <button
              onClick={clearChat}
              className="h-10 w-10 rounded-xl border border-border text-fg-muted hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/25 transition-colors flex items-center justify-center"
              title="Limpiar chat"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        }
        className="mb-6"
      />

      <TwoColumnLayout gap="gap-5">
        {/* ── Aside: history + prompts ── */}
        <TwoColumnLayout.Aside position="left" sticky={false} className="lg:col-span-3 lg:col-start-1">
          <div className="rounded-[20px] border border-border bg-surface overflow-hidden flex flex-col h-[calc(100vh-260px)]">
            {/* Tabs */}
            <div className="grid grid-cols-2 border-b border-border-subtle">
              <button
                onClick={() => setActiveTab("history")}
                className={cn(
                  "flex items-center justify-center gap-1.5 py-3 text-[12px] font-semibold transition-colors",
                  activeTab === "history"
                    ? "text-fg border-b-2 border-primary -mb-px"
                    : "text-fg-muted hover:text-fg-secondary"
                )}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Historial
              </button>
              <button
                onClick={() => setActiveTab("prompts")}
                className={cn(
                  "flex items-center justify-center gap-1.5 py-3 text-[12px] font-semibold transition-colors",
                  activeTab === "prompts"
                    ? "text-fg border-b-2 border-primary -mb-px"
                    : "text-fg-muted hover:text-fg-secondary"
                )}
              >
                <Bookmark className="h-3.5 w-3.5" />
                Prompts
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
              {activeTab === "history" ? (
                <>
                  <button className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-primary/[0.06] border border-primary/20 text-primary text-[12px] font-semibold hover:bg-primary/10 transition-colors mb-1">
                    <Plus className="h-3.5 w-3.5" />
                    Nueva conversación
                  </button>
                  {MOCK_CONVERSATIONS.map((c, i) => (
                    <ConversationItem key={c.id} conversation={c} active={i === 0} />
                  ))}
                </>
              ) : (
                MOCK_PROMPTS.map((p) => (
                  <PromptItem key={p.id} prompt={p} onUse={(body) => setInput(body)} />
                ))
              )}
            </div>
          </div>
        </TwoColumnLayout.Aside>

        {/* ── Main: chat ── */}
        <TwoColumnLayout.Main className="lg:col-span-9 lg:col-start-4">
          <div className="rounded-[20px] border border-border bg-surface overflow-hidden flex flex-col h-[calc(100vh-260px)]">
            {/* Top bar — context usage */}
            <div className="px-5 py-3 border-b border-border-subtle bg-surface-muted flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <ContextWindowBar used={contextUsed} total={currentModel.contextWindow} />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {usage !== undefined && (
                  <StatusPill
                    label={`${usage?.toLocaleString() ?? 0} tokens este mes`}
                    tone="info"
                    hideDot
                  />
                )}
                {quotaExceeded && (
                  <button
                    onClick={() => (window.location.href = "/payments/pricing")}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold uppercase tracking-wider transition-colors"
                  >
                    <Zap className="h-3 w-3" fill="currentColor" />
                    Mejorar
                  </button>
                )}
              </div>
            </div>

            {/* Chat thread */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
              {messages.map((m, i) => {
                const isUser = m.role === "user";
                const isLastAssistant = !isUser && i === messages.length - 1;
                return (
                  <div
                    key={i}
                    className={cn(
                      "flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
                      isUser ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <div
                      className={cn(
                        "h-9 w-9 rounded-xl flex items-center justify-center shrink-0",
                        isUser
                          ? "bg-surface-hover border border-border text-fg-secondary"
                          : "bg-primary/15 border border-primary/20 text-primary"
                      )}
                    >
                      {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>

                    <div className={cn("max-w-[85%] flex flex-col", isUser ? "items-end" : "items-start")}>
                      <div
                        className={cn(
                          "p-4 rounded-2xl text-[14px] leading-relaxed text-fg border",
                          isUser
                            ? "bg-surface-muted border-border-subtle rounded-tr-md"
                            : "bg-surface border-border rounded-tl-md"
                        )}
                      >
                        {m.content || (loading && isLastAssistant ? (
                          <div className="flex gap-1 items-center py-1">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-75" />
                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-150" />
                          </div>
                        ) : null)}
                      </div>

                      {m.tokens !== undefined && m.content && (
                        <TokenPill tokens={m.tokens} latencyMs={m.latencyMs} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border-subtle bg-surface-muted">
              <div className="relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={
                    quotaExceeded ? "Cuota excedida. Mejora tu plan." : "Escribe tu mensaje..."
                  }
                  disabled={loading || quotaExceeded}
                  rows={2}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 pr-14 text-[14px] text-fg placeholder:text-fg-muted focus:outline-none focus:border-primary transition-colors resize-none disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading || quotaExceeded}
                  className="absolute right-2.5 bottom-2.5 h-9 w-9 rounded-lg bg-primary hover:bg-primary-600 text-primary-foreground disabled:opacity-50 disabled:hover:bg-primary transition-colors flex items-center justify-center"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-2.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-fg-muted">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Streaming en tiempo real
                  </span>
                </div>
                <span>Shift + Enter para salto de línea</span>
              </div>
            </div>
          </div>
        </TwoColumnLayout.Main>
      </TwoColumnLayout>
    </div>
  );
};

export default AIPlayground;
