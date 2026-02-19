import { useState } from "react";
import { Link } from "react-router";
import {
  GitCompare,
  ArrowRight,
  AlertTriangle,
  ShieldCheck,
  Ban,
} from "lucide-react";
import type { Plano } from "@/types";
import {
  cn,
  formatCurrency,
  formatPercentage,
  formatCompetencia,
  getPriceLevel,
  getIdssBadge,
  getIdssBgColor,
  getInitials,
  getGradientForName,
} from "@/lib/utils";
import { MetricLabel, Tooltip } from "@/components/tooltip";
import { useLead } from "@/hooks/use-lead";
import PriceLevelBadge from "@/components/price-level-badge";
import LeadCaptureModal from "@/components/lead-capture-modal";
import ShareButton from "@/components/share-button";

interface PlanCardProps {
  plano: Plano;
  onCompare?: (plano: Plano) => void;
  isComparing?: boolean;
}

export default function PlanCard({
  plano,
  onCompare,
  isComparing = false,
}: PlanCardProps) {
  const { isLead } = useLead();
  const [showModal, setShowModal] = useState(false);
  const gradient = getGradientForName(plano.operadora_nome ?? "");
  const initials = getInitials(plano.operadora_nome ?? "");
  const priceLevel = getPriceLevel(plano.preco_mensal);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow animate-fade-in">
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start gap-3 mb-3">
          {/* Logo placeholder */}
          <div
            className={cn(
              "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-sm shrink-0",
              gradient,
            )}
          >
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
              {plano.nome}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {plano.operadora_nome}
            </p>
            <p className="text-xs text-gray-400">ANS {plano.operadora_registro_ans}</p>
          </div>

          <ShareButton
            variant="icon"
            url={`/planos/${plano.id}`}
            title={plano.nome}
          />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 text-blue-700">
            {plano.segmentacao}
          </span>
          {plano.tipo_contratacao && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-purple-50 text-purple-700">
              {plano.tipo_contratacao}
            </span>
          )}
          {plano.acomodacao && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-indigo-50 text-indigo-700">
              {plano.acomodacao === "Individual" ? "Apartamento" : plano.acomodacao === "Coletiva" ? "Enfermaria" : plano.acomodacao}
            </span>
          )}
          {plano.obstetricia && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-pink-50 text-pink-700">
              Obstetrícia
            </span>
          )}
          {plano.odontologico && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-cyan-50 text-cyan-700">
              Odontológico
            </span>
          )}
          {plano.abrangencia && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-100 text-gray-600">
              {plano.abrangencia}
            </span>
          )}
          {plano.situacao && plano.situacao !== "Ativo" && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-100 text-amber-800">
              {plano.situacao}
            </span>
          )}
        </div>

        {/* Price highlight */}
        {plano.preco_mensal != null && isLead && (
          <Tooltip text="Valor Comercial da Mensalidade (VCM) — preço real registrado na ANS para a faixa etária selecionada.">
            <div className="mb-3 p-3 rounded-lg bg-green-50 border border-green-100 w-full cursor-help text-center">
              <span className="text-[10px] text-green-600 uppercase font-medium">
                Mensalidade
              </span>
              {plano.preco_mes_referencia && (
                <span className="text-[9px] text-green-500 ml-1">
                  ref. {formatCompetencia(plano.preco_mes_referencia)}
                </span>
              )}
              <div className="text-lg font-bold text-green-800">
                {formatCurrency(plano.preco_mensal)}
              </div>
            </div>
          </Tooltip>
        )}
        {priceLevel && !isLead && (
          <div className="mb-3">
            <PriceLevelBadge level={priceLevel} onClick={() => setShowModal(true)} />
          </div>
        )}

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 rounded-lg bg-gray-50">
            <MetricLabel
              label="IDSS"
              tooltip="Índice de Desempenho da Saúde Suplementar — nota de qualidade da ANS (0 a 1). A = excelente, B = regular, C = precisa melhorar."
              date={plano.idss_ano ? String(plano.idss_ano) : null}
            />
            <span
              className={cn(
                "inline-flex items-center justify-center w-7 h-7 rounded-md text-xs font-bold mt-0.5",
                getIdssBgColor(plano.idss_score),
              )}
            >
              {getIdssBadge(plano.idss_score)}
            </span>
          </div>
          <div className="text-center p-2 rounded-lg bg-gray-50">
            <MetricLabel
              label="Reclam."
              tooltip="Índice Geral de Reclamações (IGR) — mede o volume de reclamações por beneficiário. Quanto menor, melhor."
              date={formatCompetencia(plano.igr_competencia)}
            />
            <div className="text-sm font-semibold text-gray-800 mt-0.5">
              {plano.igr_indice != null
                ? Number(plano.igr_indice).toFixed(1)
                : "N/D"}
            </div>
          </div>
          <div className="text-center p-2 rounded-lg bg-gray-50">
            <MetricLabel
              label="Reajuste"
              tooltip="Último percentual de reajuste anual aplicado ao plano, autorizado pela ANS."
              date={plano.reajuste_ciclo ? plano.reajuste_ciclo.slice(0, 4) : null}
            />
            <div className="text-sm font-semibold text-gray-800 mt-0.5">
              {formatPercentage(plano.reajuste_ultimo)}
            </div>
          </div>
        </div>

        {/* Quality badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {plano.regime_especial && (
            <Tooltip text="Operadora sob intervenção da ANS (direção técnica ou fiscal). Isso indica problemas financeiros ou assistenciais graves.">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-red-100 text-red-700 cursor-help">
                <AlertTriangle className="h-3 w-3" />
                Regime Especial
              </span>
            </Tooltip>
          )}
          {plano.acreditada && (
            <Tooltip text="Operadora certificada por entidade independente de qualidade em saúde. Indica compromisso com boas práticas.">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-100 text-emerald-700 cursor-help">
                <ShieldCheck className="h-3 w-3" />
                Acreditada
              </span>
            </Tooltip>
          )}
          {plano.tem_penalidades && (
            <Tooltip text="Penalidades aplicadas pela ANS nos últimos 3 anos por descumprimento de normas regulatórias.">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-100 text-amber-700 cursor-help">
                <Ban className="h-3 w-3" />
                {plano.qtd_penalidades} penalidade{plano.qtd_penalidades !== 1 ? "s" : ""}
              </span>
            </Tooltip>
          )}
        </div>

      </div>

      {/* Actions */}
      <div className="flex border-t border-gray-100 rounded-b-xl overflow-hidden">
        <Link
          to={`/planos/${plano.id}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium text-primary hover:bg-primary-light transition-colors"
        >
          Ver detalhes
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        {onCompare && (
          <button
            type="button"
            onClick={() => onCompare(plano)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium border-l border-gray-100 transition-colors",
              isComparing
                ? "bg-primary text-white"
                : "text-gray-600 hover:bg-gray-50",
            )}
          >
            <GitCompare className="h-3.5 w-3.5" />
            {isComparing ? "Comparando" : "Comparar"}
          </button>
        )}
      </div>

      <LeadCaptureModal
        open={showModal}
        onClose={() => setShowModal(false)}
        planoNome={plano.nome}
      />
    </div>
  );
}
