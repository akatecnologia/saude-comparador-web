import { useState, useRef, useEffect, useCallback } from "react";
import { X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn, getSavedFaixaEtaria } from "@/lib/utils";
import { createLead } from "@/lib/api-client";
import { useUserUf } from "@/hooks/use-user-uf";
import { setLead } from "@/hooks/use-lead";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact" | "invisible";
        },
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

const TURNSTILE_SITE_KEY =
  import.meta.env.VITE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";

interface LeadCaptureModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  planoNome?: string;
}

export default function LeadCaptureModal({
  open,
  onClose,
  onSuccess,
  planoNome,
}: LeadCaptureModalProps) {
  const [detectedUf] = useUserUf();
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [lgpd, setLgpd] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Turnstile
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const renderTurnstile = useCallback(() => {
    if (!window.turnstile || !turnstileRef.current || widgetIdRef.current) return;
    widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      callback: (token: string) => setTurnstileToken(token),
      "expired-callback": () => setTurnstileToken(null),
      "error-callback": () => setTurnstileToken(null),
      theme: "light",
      size: "compact",
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    if (window.turnstile) {
      renderTurnstile();
      return;
    }
    const interval = setInterval(() => {
      if (window.turnstile) {
        renderTurnstile();
        clearInterval(interval);
      }
    }, 200);
    return () => {
      clearInterval(interval);
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [open, renderTurnstile]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  /** Strip everything except digits from the phone string. */
  function digitsOnly(value: string): string {
    return value.replace(/\D/g, "");
  }

  /** Apply (XX) XXXXX-XXXX mask to a digit string. */
  function applyPhoneMask(value: string): string {
    const d = digitsOnly(value).slice(0, 11);
    if (d.length <= 2) return d.length ? `(${d}` : "";
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }

  function handleTelefoneChange(raw: string) {
    setTelefone(applyPhoneMask(raw));
    setErrors((p) => { const n = { ...p }; delete n.telefone; return n; });
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!nome.trim()) errs.nome = "Nome é obrigatório";
    const digits = digitsOnly(telefone);
    if (!digits) {
      errs.telefone = "Celular é obrigatório";
    } else if (digits.length < 10 || digits.length > 11) {
      errs.telefone = "Número inválido";
    }
    if (!lgpd) errs.lgpd = "Você precisa aceitar os termos";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const faixa = getSavedFaixaEtaria() || "29 a 33 anos";
      const res = await createLead({
        nome,
        telefone: digitsOnly(telefone),
        uf: detectedUf || "SP",
        faixa_etaria: faixa,
        tipo_contratacao: "Individual ou familiar",
        lgpd_aceite: true,
        origem: "preco_gate",
        cf_turnstile_response: turnstileToken || undefined,
      });
      setLead({
        id: String(res.id),
        nome,
        uf: detectedUf || "SP",
        faixa_etaria: faixa,
        tipo_contratacao: "Individual ou familiar",
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current);
        setTurnstileToken(null);
      }
      setServerError(
        err instanceof Error ? err.message : "Erro ao enviar. Tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-primary px-6 py-4 text-white flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Ver preço real</h2>
            {planoNome && (
              <p className="text-sm opacity-80 line-clamp-1">{planoNome}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {serverError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {serverError}
            </div>
          )}

          <p className="text-sm text-gray-600">
            Preencha seus dados para ver os valores reais registrados na ANS.
          </p>

          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome *
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => { setNome(e.target.value); setErrors((p) => { const n = { ...p }; delete n.nome; return n; }); }}
              placeholder="Seu nome"
              className={cn(
                "w-full rounded-lg border bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition",
                errors.nome ? "border-red-300" : "border-gray-200",
              )}
              autoFocus
            />
            {errors.nome && <p className="mt-1 text-xs text-red-600">{errors.nome}</p>}
          </div>

          {/* Celular */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Celular (WhatsApp) *
            </label>
            <input
              type="tel"
              inputMode="numeric"
              value={telefone}
              onChange={(e) => handleTelefoneChange(e.target.value)}
              placeholder="(11) 99999-9999"
              className={cn(
                "w-full rounded-lg border bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition",
                errors.telefone ? "border-red-300" : "border-gray-200",
              )}
            />
            {errors.telefone && <p className="mt-1 text-xs text-red-600">{errors.telefone}</p>}
          </div>

          {/* LGPD */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={lgpd}
              onChange={(e) => { setLgpd(e.target.checked); setErrors((p) => { const n = { ...p }; delete n.lgpd; return n; }); }}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-xs text-gray-600 leading-relaxed">
              Concordo com os{" "}
              <a href="/termos" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">Termos de Uso</a>{" "}
              e a{" "}
              <a href="/privacidade" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">Política de Privacidade</a>{" "}
              e autorizo o compartilhamento dos meus dados com parceiros do
              setor de saúde suplementar para receber propostas de planos.
            </span>
          </label>
          {errors.lgpd && <p className="text-xs text-red-600">{errors.lgpd}</p>}

          {/* Turnstile */}
          <div ref={turnstileRef} className="flex justify-center" />

          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition-colors",
              isSubmitting
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-primary text-white hover:bg-primary-dark",
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Ver preços reais
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
