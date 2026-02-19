import { useState, useRef, useEffect, useCallback } from "react";
import { Loader2, CheckCircle2, AlertCircle, Shield } from "lucide-react";
import {
  UF_LIST,
  FAIXAS_ETARIAS,
  TIPOS_CONTRATACAO,
  saveFaixaEtaria,
  cn,
} from "@/lib/utils";
import { createLead } from "@/lib/api-client";
import { useUserUf } from "@/hooks/use-user-uf";
import type { Lead, LeadCreate } from "@/types";

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

interface LeadFormProps {
  onSuccess: (lead: Lead) => void;
  title?: string;
  description?: string;
  className?: string;
}

interface FormErrors {
  nome?: string;
  email?: string;
  uf?: string;
  faixa_etaria?: string;
  tipo_contratacao?: string;
  lgpd_aceite?: string;
}

export default function LeadForm({
  onSuccess,
  title = "Comece sua consulta",
  description = "Preencha seus dados para receber recomendações personalizadas de planos de saúde.",
  className,
}: LeadFormProps) {
  const [detectedUf] = useUserUf();
  const [formData, setFormData] = useState<LeadCreate>({
    nome: "",
    email: "",
    telefone: "",
    uf: detectedUf,
    cidade: "",
    faixa_etaria: "",
    tipo_contratacao: "",
    lgpd_aceite: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
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
      size: "normal",
    });
  }, []);

  useEffect(() => {
    // Turnstile script may load async — poll until available
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
    return () => clearInterval(interval);
  }, [renderTurnstile]);

  function validate(): boolean {
    const errs: FormErrors = {};
    if (!formData.nome.trim()) errs.nome = "Nome é obrigatório";
    if (!formData.email?.trim()) {
      errs.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email!)) {
      errs.email = "Email inválido";
    }
    if (!formData.uf) errs.uf = "Selecione o estado";
    if (!formData.faixa_etaria) errs.faixa_etaria = "Selecione a faixa etária";
    if (!formData.tipo_contratacao)
      errs.tipo_contratacao = "Selecione o tipo de contratação";
    if (!formData.lgpd_aceite)
      errs.lgpd_aceite = "Você precisa aceitar os termos para continuar";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await createLead({
        ...formData,
        cf_turnstile_response: turnstileToken || undefined,
      });
      const lead: Lead = {
        id: String(res.id),
        nome: formData.nome,
        email: formData.email || "",
        telefone: formData.telefone || null,
        uf: formData.uf,
        cidade: formData.cidade || null,
        faixa_etaria: formData.faixa_etaria,
        tipo_contratacao: formData.tipo_contratacao,
        criado_em: res.created_at,
      };
      localStorage.setItem("saude_lead_id", lead.id);
      localStorage.setItem("saude_lead_nome", lead.nome);
      localStorage.setItem("saude_lead_uf", lead.uf);
      localStorage.setItem("saude_lead_faixa", lead.faixa_etaria);
      saveFaixaEtaria(lead.faixa_etaria);
      localStorage.setItem("saude_lead_tipo", lead.tipo_contratacao);
      onSuccess(lead);
    } catch (err) {
      // Reset turnstile on error so user can retry
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current);
        setTurnstileToken(null);
      }
      setServerError(
        err instanceof Error
          ? err.message
          : "Erro ao enviar dados. Tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateField<K extends keyof LeadCreate>(
    field: K,
    value: LeadCreate[K],
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field as keyof FormErrors];
        return next;
      });
    }
  }

  return (
    <div className={cn("max-w-lg mx-auto", className)}>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-primary px-6 py-5 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="h-5 w-5" />
            <h2 className="text-lg font-bold">{title}</h2>
          </div>
          <p className="text-sm opacity-90">{description}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {serverError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {serverError}
            </div>
          )}

          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome completo *
            </label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => updateField("nome", e.target.value)}
              placeholder="Seu nome"
              className={cn(
                "w-full rounded-lg border bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition",
                errors.nome ? "border-red-300" : "border-gray-200",
              )}
            />
            {errors.nome && (
              <p className="mt-1 text-xs text-red-600">{errors.nome}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="seu@email.com"
              className={cn(
                "w-full rounded-lg border bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition",
                errors.email ? "border-red-300" : "border-gray-200",
              )}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Telefone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefone (opcional)
            </label>
            <input
              type="tel"
              value={formData.telefone || ""}
              onChange={(e) => updateField("telefone", e.target.value)}
              placeholder="(11) 99999-9999"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
            />
          </div>

          {/* UF + Cidade */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado *
              </label>
              <select
                value={formData.uf}
                onChange={(e) => updateField("uf", e.target.value)}
                className={cn(
                  "w-full rounded-lg border bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition",
                  errors.uf ? "border-red-300" : "border-gray-200",
                )}
              >
                <option value="">Selecione</option>
                {UF_LIST.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
              {errors.uf && (
                <p className="mt-1 text-xs text-red-600">{errors.uf}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cidade (opcional)
              </label>
              <input
                type="text"
                value={formData.cidade || ""}
                onChange={(e) => updateField("cidade", e.target.value)}
                placeholder="Sua cidade"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Faixa etária */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Faixa etária *
            </label>
            <select
              value={formData.faixa_etaria}
              onChange={(e) => updateField("faixa_etaria", e.target.value)}
              className={cn(
                "w-full rounded-lg border bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition",
                errors.faixa_etaria ? "border-red-300" : "border-gray-200",
              )}
            >
              <option value="">Selecione</option>
              {FAIXAS_ETARIAS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
            {errors.faixa_etaria && (
              <p className="mt-1 text-xs text-red-600">
                {errors.faixa_etaria}
              </p>
            )}
          </div>

          {/* Tipo contratação */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de contratação *
            </label>
            <select
              value={formData.tipo_contratacao}
              onChange={(e) => updateField("tipo_contratacao", e.target.value)}
              className={cn(
                "w-full rounded-lg border bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition",
                errors.tipo_contratacao ? "border-red-300" : "border-gray-200",
              )}
            >
              <option value="">Selecione</option>
              {TIPOS_CONTRATACAO.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            {errors.tipo_contratacao && (
              <p className="mt-1 text-xs text-red-600">
                {errors.tipo_contratacao}
              </p>
            )}
          </div>

          {/* LGPD */}
          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.lgpd_aceite}
                onChange={(e) => updateField("lgpd_aceite", e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-xs text-gray-600 leading-relaxed">
                Declaro que li e concordo com os{" "}
                <a href="/termos" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
                  Termos de Uso
                </a>{" "}
                e a{" "}
                <a href="/privacidade" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
                  Política de Privacidade
                </a>{" "}
                e autorizo o compartilhamento dos meus dados pessoais com
                operadoras, corretoras e parceiros do setor de saúde suplementar
                para receber propostas e cotações de planos, conforme a LGPD
                (Lei nº 13.709/2018). Estou ciente de que posso revogar este
                consentimento a qualquer momento.
              </span>
            </label>
            {errors.lgpd_aceite && (
              <p className="mt-1 text-xs text-red-600">{errors.lgpd_aceite}</p>
            )}
          </div>

          {/* Turnstile widget */}
          <div ref={turnstileRef} className="flex justify-center" />

          {/* Submit */}
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
                Continuar
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
