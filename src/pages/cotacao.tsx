import { useState } from "react";
import { Link } from "react-router";
import { CheckCircle2, FileText, Bot, ArrowRight } from "lucide-react";
import LeadForm from "@/components/lead-form";
import { trackEvent } from "@/lib/analytics";
import type { Lead } from "@/types";

export default function Cotacao() {
  const [lead, setLead] = useState<Lead | null>(null);

  function handleLeadSubmit(newLead: Lead) {
    trackEvent("lead_submit");
    setLead(newLead);
  }

  if (lead) {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-success mb-6">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Solicitação enviada com sucesso!
          </h1>

          <p className="text-gray-500 mb-8 leading-relaxed">
            Obrigado, <span className="font-medium text-gray-700">{lead.nome}</span>!
            Recebemos sua solicitação de cotação e entraremos em contato em
            breve pelo email{" "}
            <span className="font-medium text-gray-700">{lead.email}</span>.
          </p>

          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 text-left">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Resumo da solicitação
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Estado</span>
                <span className="text-gray-900 font-medium">{lead.uf}</span>
              </div>
              {lead.cidade && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Cidade</span>
                  <span className="text-gray-900 font-medium">
                    {lead.cidade}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Faixa etária</span>
                <span className="text-gray-900 font-medium">
                  {lead.faixa_etaria}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tipo de contratação</span>
                <span className="text-gray-900 font-medium">
                  {lead.tipo_contratacao}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/planos"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-colors"
            >
              <FileText className="h-4 w-4" />
              Explorar planos
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/assistente"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
            >
              <Bot className="h-4 w-4" />
              Conversar com o assistente
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-light text-primary mb-4">
          <FileText className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Solicitar Cotação
        </h1>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          Preencha seus dados e receba cotações personalizadas de planos de
          saúde adequados ao seu perfil.
        </p>
      </div>

      {/* Form */}
      <LeadForm
        onSuccess={handleLeadSubmit}
        title="Seus dados"
        description="Informe seus dados para receber propostas personalizadas de planos de saúde."
      />
    </div>
  );
}
