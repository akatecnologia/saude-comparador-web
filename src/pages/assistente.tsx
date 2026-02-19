import { Bot, MessageSquare, Shield } from "lucide-react";
import SEO from "@/components/seo";
import AiChat from "@/components/ai-chat";
import LeadForm from "@/components/lead-form";
import { trackEvent } from "@/lib/analytics";
import { useLead, setLead, clearLead } from "@/hooks/use-lead";
import type { Lead } from "@/types";

export default function Assistente() {
  const { isLead, lead } = useLead();

  function handleLeadSuccess(leadData: Lead) {
    setLead({
      id: leadData.id,
      nome: leadData.nome,
      uf: leadData.uf,
      faixa_etaria: leadData.faixa_etaria,
      tipo_contratacao: leadData.tipo_contratacao,
    });
    trackEvent("chat_start");
  }

  function handleReset() {
    clearLead();
  }

  return (
    <>
      <SEO
        title="Assistente IA para planos de saúde"
        description="Use nosso assistente virtual com inteligência artificial para encontrar o melhor plano de saúde baseado em dados reais da ANS."
        canonical="/assistente"
      />

      {!isLead ? (
        /* Pre-chat: normal scrollable page */
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-light text-primary mb-4">
              <Bot className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Assistente IA
            </h1>
            <p className="text-gray-500 text-sm max-w-lg mx-auto">
              Nosso assistente virtual analisa dados oficiais da ANS para ajudar
              você a encontrar o melhor plano de saúde para seu perfil.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <MessageSquare className="h-6 w-6 text-primary mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Conversa personalizada
              </h3>
              <p className="text-xs text-gray-500">
                Respostas baseadas no seu perfil e necessidades
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <Shield className="h-6 w-6 text-primary mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Dados reais da ANS
              </h3>
              <p className="text-xs text-gray-500">
                Informações verificadas de fontes oficiais
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <Bot className="h-6 w-6 text-primary mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Até 15 mensagens
              </h3>
              <p className="text-xs text-gray-500">
                Sessão gratuita com limite de perguntas
              </p>
            </div>
          </div>

          <LeadForm
            onSuccess={handleLeadSuccess}
            title="Preencha seus dados para começar"
            description="Precisamos de algumas informações para personalizar as recomendações do assistente."
          />
        </div>
      ) : (
        /* Active chat: fixed height, no outer scroll */
        <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
          <AiChat
            leadId={lead!.id}
            leadNome={lead!.nome}
            leadUf={lead!.uf}
            leadFaixaEtaria={lead!.faixa_etaria}
            leadTipoContratacao={lead!.tipo_contratacao}
            maxMessages={15}
            onReset={handleReset}
          />
        </div>
      )}
    </>
  );
}
