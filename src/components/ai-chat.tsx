import { useState, useRef, useEffect } from "react";
import { Bot, User, Send, Loader2, LogOut } from "lucide-react";
import type { ChatMessage } from "@/types";
import { chatIAStream } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface AiChatProps {
  leadId: string;
  leadNome: string;
  leadUf: string;
  leadFaixaEtaria: string;
  leadTipoContratacao: string;
  maxMessages?: number;
  onReset?: () => void;
}

export default function AiChat({
  leadId,
  leadNome,
  leadUf,
  leadFaixaEtaria,
  leadTipoContratacao,
  maxMessages = 15,
  onReset,
}: AiChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: `Olá, ${leadNome}! Sou o assistente virtual do SaúdeComparador. Posso te ajudar a encontrar o melhor plano de saúde para o seu perfil.\n\nVi que você está em ${leadUf}, na faixa de ${leadFaixaEtaria} anos e busca um plano ${leadTipoContratacao}. Como posso te ajudar?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const userMessageCount = messages.filter((m) => m.role === "user").length;
  const isLimitReached = userMessageCount >= maxMessages;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  async function handleSend() {
    const text = input.trim();
    if (!text || isStreaming || isLimitReached) return;

    const userMessage: ChatMessage = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsStreaming(true);
    setStreamingContent("");

    try {
      const historico = updatedMessages.filter((m) => m.role !== "assistant" || updatedMessages.indexOf(m) > 0);
      abortRef.current = await chatIAStream(
        leadId,
        text,
        historico,
        (chunk) => {
          setStreamingContent((prev) => prev + chunk);
        },
        () => {
          setStreamingContent((prev) => {
            const assistantMessage: ChatMessage = {
              role: "assistant",
              content: prev || "Desculpe, não consegui gerar uma resposta. Tente novamente.",
            };
            setMessages((msgs) => [...msgs, assistantMessage]);
            return "";
          });
          setIsStreaming(false);
        },
        (error) => {
          console.error("Chat error:", error);
          setMessages((msgs) => [
            ...msgs,
            {
              role: "assistant",
              content:
                "Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.",
            },
          ]);
          setStreamingContent("");
          setIsStreaming(false);
        },
      );
    } catch {
      setIsStreaming(false);
      setStreamingContent("");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header bar: user info + message count */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1.5 text-primary">
            <Bot className="h-5 w-5 shrink-0" />
            <span className="font-semibold text-sm hidden sm:inline">Assistente IA</span>
          </div>
          <span className="text-gray-300 hidden sm:inline">|</span>
          <span className="text-xs text-gray-500 truncate">
            {leadNome} &middot; {leadUf} &middot; {leadFaixaEtaria} &middot; {leadTipoContratacao}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-gray-400">
            {userMessageCount}/{maxMessages}
          </span>
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Encerrar</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages area — the only scrollable section */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-5">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "flex gap-3",
                msg.role === "user" ? "flex-row-reverse" : "flex-row",
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                  msg.role === "user"
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600",
                )}
              >
                {msg.role === "user" ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>

              <div
                className={cn(
                  "max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-primary text-white rounded-tr-sm"
                    : "bg-gray-100 text-gray-800 rounded-tl-sm",
                )}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {/* Streaming message */}
          {isStreaming && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 text-gray-600">
                <Bot className="h-4 w-4" />
              </div>
              <div className="max-w-[80%] sm:max-w-[70%] rounded-2xl rounded-tl-sm bg-gray-100 text-gray-800 px-4 py-3 text-sm leading-relaxed">
                {streamingContent ? (
                  <p className="whitespace-pre-wrap">{streamingContent}</p>
                ) : (
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span className="text-xs">Pensando...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area — pinned to bottom */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3">
          {isLimitReached ? (
            <div className="text-center text-sm text-gray-500 py-2">
              Você atingiu o limite de {maxMessages} mensagens. Para continuar a
              conversa, solicite uma cotação personalizada.
            </div>
          ) : (
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value.slice(0, 500))}
                  onKeyDown={handleKeyDown}
                  placeholder="Digite sua pergunta sobre planos de saúde..."
                  rows={1}
                  className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition placeholder:text-gray-400"
                  disabled={isStreaming}
                />
                <span className="absolute right-3 bottom-2 text-[10px] text-gray-400">
                  {input.length}/500
                </span>
              </div>
              <button
                type="button"
                onClick={handleSend}
                disabled={isStreaming || !input.trim()}
                className={cn(
                  "p-2.5 rounded-xl transition-colors shrink-0",
                  isStreaming || !input.trim()
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-primary text-white hover:bg-primary-dark",
                )}
              >
                {isStreaming ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
          )}
          <p className="text-[10px] text-gray-400 text-center mt-2">
            Baseado em dados públicos da ANS. Caráter informativo, não substitui consulta às operadoras.
          </p>
        </div>
      </div>
    </div>
  );
}
