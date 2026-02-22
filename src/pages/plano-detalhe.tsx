import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import {
  ArrowLeft,
  Building2,
  Heart,
  Smile,
  BedDouble,
  Globe,
  Shield,
  GitCompare,
  FileText,
  AlertCircle,
  AlertTriangle,
  ShieldCheck,
  Ban,
  DollarSign,
  Award,
  TrendingUp,
  Phone,
  Eye,
} from "lucide-react";
import { getPlano } from "@/lib/api-client";
import {
  cn,
  formatCurrency,
  formatPercentage,
  formatCompetencia,
  getPriceLevel,
  FAIXAS_ETARIAS,
  getSavedFaixaEtaria,
  saveFaixaEtaria,
  getIdssBadge,
  getIdssBgColor,
  getIdssLabel,
  getInitials,
  getGradientForName,
} from "@/lib/utils";
import { usePrecos } from "@/hooks/use-precos";
import { useLead } from "@/hooks/use-lead";
import { Tooltip, InfoTip } from "@/components/tooltip";
import PriceLevelBadge from "@/components/price-level-badge";
import LeadCaptureModal from "@/components/lead-capture-modal";
import ShareButton from "@/components/share-button";
import type { PlanoDetail } from "@/types";

export default function PlanoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const [plano, setPlano] = useState<PlanoDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [faixaEtaria, setFaixaEtaria] = useState(getSavedFaixaEtaria);
  const { isLead } = useLead();
  const [showModal, setShowModal] = useState(false);

  // Persist when changed
  useEffect(() => { saveFaixaEtaria(faixaEtaria); }, [faixaEtaria]);
  const { faixas: vcmFaixas, loading: vcmLoading } = usePrecos(plano?.id_plano_ans);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getPlano(id)
      .then(setPlano)
      .catch((err) => setError(err.message || "Erro ao carregar plano"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="skeleton h-6 w-32 mb-6" />
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex gap-4 mb-4">
            <div className="skeleton w-16 h-16 rounded-xl" />
            <div className="flex-1">
              <div className="skeleton h-6 w-2/3 mb-2" />
              <div className="skeleton h-4 w-1/3 mb-1" />
              <div className="skeleton h-3 w-1/4" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="skeleton h-20 rounded-lg" />
            <div className="skeleton h-20 rounded-lg" />
            <div className="skeleton h-20 rounded-lg" />
          </div>
        </div>
        <div className="skeleton h-48 rounded-xl" />
      </div>
    );
  }

  if (error || !plano) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/planos"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar para planos
        </Link>
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <AlertCircle className="h-12 w-12 text-danger mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Plano não encontrado
          </h2>
          <p className="text-gray-500 text-sm">
            {error || "O plano solicitado não foi encontrado."}
          </p>
        </div>
      </div>
    );
  }

  const gradient = getGradientForName(plano.operadora_nome || "");
  const initials = getInitials(plano.operadora_nome || "");

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/planos"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar para planos
      </Link>

      {/* Inactive plan warning */}
      {plano.situacao && plano.situacao !== "Ativo" && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 animate-fade-in">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
          <div>
            <span className="text-sm font-semibold text-amber-800">
              Plano {plano.situacao}
            </span>
            <p className="text-xs text-amber-600 mt-0.5">
              Este plano não está mais ativo na ANS. As informações são apenas para consulta.
            </p>
          </div>
        </div>
      )}

      {/* Plan header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div
            className={cn(
              "w-16 h-16 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-lg shrink-0",
              gradient,
            )}
          >
            {initials}
          </div>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
              {plano.nome}
            </h1>
            <Link
              to={`/operadoras/${plano.operadora_registro_ans}`}
              className="text-primary hover:text-primary-dark text-sm font-medium transition-colors"
            >
              {plano.operadora_nome}
            </Link>
            <p className="text-xs text-gray-400 mt-0.5">
              ANS {plano.id_plano_ans}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <Link
              to={`/comparar?ids=${plano.id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <GitCompare className="h-4 w-4" />
              Comparar
            </Link>
            <Link
              to="/cotacao"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
            >
              <FileText className="h-4 w-4" />
              Solicitar cotação
            </Link>
            <ShareButton
              variant="button"
              url={`/planos/${plano.id}`}
              title={`${plano.nome} — ${plano.operadora_nome}`}
            />
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="px-3 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700">
            {plano.segmentacao}
          </span>
          <span className="px-3 py-1 rounded-lg text-xs font-medium bg-purple-50 text-purple-700">
            {plano.tipo_contratacao}
          </span>
          {plano.abrangencia && (
            <span className="px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600">
              {plano.abrangencia}
            </span>
          )}
          {plano.situacao && plano.situacao !== "Ativo" && (
            <span className="px-3 py-1 rounded-lg text-xs font-medium bg-amber-100 text-amber-800">
              {plano.situacao}
            </span>
          )}
        </div>

        {/* Quality badges */}
        {(plano.regime_especial || plano.acreditada || plano.tem_penalidades) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {plano.regime_especial && (
              <Tooltip text="Operadora sob intervenção da ANS (direção técnica ou fiscal). Indica problemas financeiros ou assistenciais graves que podem afetar a prestação de serviços.">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-700 cursor-help">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Operadora em Regime Especial
                </span>
              </Tooltip>
            )}
            {plano.acreditada && (
              <Tooltip text="Operadora certificada por entidade independente de qualidade em saúde. Indica compromisso voluntário com boas práticas de gestão e atendimento.">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-700 cursor-help">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Operadora Acreditada{plano.nivel_acreditacao ? ` — ${plano.nivel_acreditacao}` : ""}
                </span>
              </Tooltip>
            )}
            {plano.tem_penalidades && (
              <Tooltip text="Penalidades aplicadas pela ANS nos últimos 3 anos por descumprimento de normas regulatórias (atrasos, negativas indevidas, etc.).">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-amber-100 text-amber-700 cursor-help">
                  <Ban className="h-3.5 w-3.5" />
                  {plano.qtd_penalidades} penalidade{plano.qtd_penalidades !== 1 ? "s" : ""}
                  {plano.total_multas != null && ` (${formatCurrency(plano.total_multas)} em multas)`}
                </span>
              </Tooltip>
            )}
          </div>
        )}

        {/* Operadora metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <Tooltip text="Índice de Desempenho da Saúde Suplementar — nota de qualidade calculada pela ANS com base em indicadores de assistência, econômico-financeiros e satisfação. Vai de 0 a 1.">
              <div className="text-xs text-gray-500 uppercase font-medium mb-2 cursor-help border-b border-dotted border-gray-300 inline-flex">
                IDSS
                {plano.idss_ano && <span className="text-[9px] text-gray-400 font-normal ml-1">{plano.idss_ano}</span>}
              </div>
            </Tooltip>
            <span
              className={cn(
                "inline-flex items-center justify-center w-10 h-10 rounded-lg text-sm font-bold mb-1",
                getIdssBgColor(plano.idss_score),
              )}
            >
              {getIdssBadge(plano.idss_score)}
            </span>
            <div className="text-xs text-gray-500">
              {plano.idss_score != null
                ? `${Number(plano.idss_score).toFixed(2)} - ${getIdssLabel(Number(plano.idss_score))}`
                : "Sem avaliação"}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <Tooltip text="Índice Geral de Reclamações (IGR) — mede o volume de reclamações registradas na ANS por beneficiário. Quanto menor o número, menos reclamações a operadora recebe.">
              <div className="text-xs text-gray-500 uppercase font-medium mb-2 cursor-help border-b border-dotted border-gray-300 inline-flex">
                Reclamações
                {plano.igr_competencia && <span className="text-[9px] text-gray-400 font-normal ml-1">{formatCompetencia(plano.igr_competencia)}</span>}
              </div>
            </Tooltip>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {plano.igr_indice != null ? Number(plano.igr_indice).toFixed(1) : "N/D"}
            </div>
            <div className="text-xs text-gray-500">
              {plano.igr_indice != null
                ? Number(plano.igr_indice) <= 30
                  ? "Abaixo da média"
                  : "Acima da média"
                : "Sem dados"}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <Tooltip text="Percentual de reajuste anual aplicado ao plano, autorizado pela ANS. O reajuste é o aumento no valor da mensalidade que ocorre uma vez por ano.">
              <div className="text-xs text-gray-500 uppercase font-medium mb-2 cursor-help border-b border-dotted border-gray-300 inline-flex">
                Reajuste
                {plano.reajuste_ciclo && <span className="text-[9px] text-gray-400 font-normal ml-1">{plano.reajuste_ciclo.slice(0, 4)}</span>}
              </div>
            </Tooltip>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {formatPercentage(plano.reajuste_ultimo)}
            </div>
            <div className="text-xs text-gray-500">
              Percentual aplicado
            </div>
          </div>

          {(() => {
            // Determine if we have any price to show or gate
            const heroPrice = plano.preco_mensal ?? (vcmFaixas.length > 0 && faixaEtaria ? vcmFaixas.find((f) => f.faixa_etaria === faixaEtaria)?.vcm ?? null : null);
            const heroLevel = getPriceLevel(heroPrice);

            // Non-lead with a price level → show gated badge
            if (!isLead && heroLevel) {
              return (
                <div className="rounded-xl p-4 text-center">
                  <PriceLevelBadge level={heroLevel} onClick={() => setShowModal(true)} />
                </div>
              );
            }

            // Lead or no price level → show real price (existing behavior)
            return (
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
                <Tooltip text="Valor Comercial da Mensalidade (VCM) — preço real registrado pela operadora na ANS para a faixa etária selecionada. É o valor base antes de eventuais descontos ou coparticipações.">
                  <div className="text-xs text-green-600 uppercase font-medium mb-2 cursor-help border-b border-dotted border-green-300 inline-flex">
                    Mensalidade
                    {plano.preco_mensal != null && plano.preco_mes_referencia && (
                      <span className="text-[9px] text-green-500 font-normal ml-1">{formatCompetencia(plano.preco_mes_referencia)}</span>
                    )}
                  </div>
                </Tooltip>
                {plano.preco_mensal != null ? (
                  <div>
                    <div className="text-2xl font-bold text-green-800 mb-0.5">
                      {formatCurrency(plano.preco_mensal)}
                    </div>
                    <div className="text-[10px] text-green-600">/mês</div>
                  </div>
                ) : vcmFaixas.length > 0 && faixaEtaria ? (
                  <div>
                    {(() => {
                      const match = vcmFaixas.find((f) => f.faixa_etaria === faixaEtaria);
                      return match?.vcm != null ? (
                        <>
                          <div className="text-2xl font-bold text-green-800 mb-0.5">
                            {formatCurrency(match.vcm)}
                          </div>
                          <div className="text-[10px] text-green-600">/mês</div>
                        </>
                      ) : (
                        <div className="text-lg font-bold text-gray-400">N/D</div>
                      );
                    })()}
                    <select
                      value={faixaEtaria}
                      onChange={(e) => setFaixaEtaria(e.target.value)}
                      className="mt-1 text-[10px] rounded border border-green-200 bg-white px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-green-500"
                    >
                      {FAIXAS_ETARIAS.map((f) => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <div className="text-lg font-bold text-gray-400 mb-1">N/D</div>
                    <select
                      value={faixaEtaria}
                      onChange={(e) => setFaixaEtaria(e.target.value)}
                      className="text-[10px] rounded border border-green-200 bg-white px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-green-500"
                    >
                      <option value="">Selecione idade</option>
                      {FAIXAS_ETARIAS.map((f) => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
        <p className="text-[10px] text-gray-400 italic mt-2">
          *VCM (Valor Comercial da Mensalidade) registrado na ANS{plano.preco_mes_referencia ? ` (ref. ${formatCompetencia(plano.preco_mes_referencia)})` : ""}. Valor base — preço final pode variar conforme condições contratuais.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Coverage details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Detalhes da cobertura
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <BedDouble className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-500">Acomodação</div>
                  <div className="text-sm font-medium text-gray-900">
                    {plano.acomodacao || "N/D"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <Heart className="h-5 w-5 text-pink-400" />
                <div>
                  <div className="text-xs text-gray-500">
                    Cobertura Obstétrica
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {plano.obstetricia === "Sim" ? "Sim" : "Não"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <Smile className="h-5 w-5 text-blue-400" />
                <div>
                  <div className="text-xs text-gray-500">Odontológico</div>
                  <div className="text-sm font-medium text-gray-900">
                    {plano.odontologico ? "Incluso" : "Não incluso"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <Globe className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-500">Abrangência</div>
                  <div className="text-sm font-medium text-gray-900">
                    {plano.abrangencia}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <Shield className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-500">Segmentação</div>
                  <div className="text-sm font-medium text-gray-900">
                    {plano.segmentacao}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <Building2 className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-500">Tipo Contratação</div>
                  <div className="text-sm font-medium text-gray-900">
                    {plano.tipo_contratacao}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Coberturas */}
          {plano.coberturas && plano.coberturas.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Coberturas incluídas
              </h2>
              <div className="grid sm:grid-cols-2 gap-2">
                {plano.coberturas.map((cob, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm text-gray-700"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
                    {cob}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Carencias */}
          {plano.carencias && Object.keys(plano.carencias).length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Carências
              </h2>
              <div className="space-y-2">
                {Object.entries(plano.carencias).map(([tipo, prazo]) => (
                  <div
                    key={tipo}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                  >
                    <span className="text-sm text-gray-700">{tipo}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {prazo}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* VCM Prices by age bracket */}
          {vcmFaixas.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-1">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600 shrink-0" />
                  Mensalidades por faixa etária
                  <InfoTip text="Valor Comercial da Mensalidade (VCM) — o preço base registrado pela operadora na ANS para cada faixa de idade. Pode haver variação conforme negociação e coparticipação." />
                </h2>
                {vcmFaixas[0]?.mes_referencia && (
                  <span className="text-[10px] text-gray-400 sm:mt-1.5 shrink-0">
                    ref. {formatCompetencia(vcmFaixas[0].mes_referencia)}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Valores VCM registrados na ANS
              </p>
              {isLead ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">
                          Faixa Etária
                        </th>
                        <th className="text-right py-2 px-3 text-xs font-medium text-gray-500 uppercase">
                          Mensalidade
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {vcmFaixas.map((f) => (
                        <tr key={f.faixa_etaria} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-2.5 px-3 text-gray-700">{f.faixa_etaria}</td>
                          <td className="py-2.5 px-3 text-right font-semibold text-gray-900">
                            {f.vcm != null ? formatCurrency(f.vcm) : "N/D"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="relative">
                  <div className="overflow-hidden blur-sm select-none pointer-events-none">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">Faixa Etária</th>
                          <th className="text-right py-2 px-3 text-xs font-medium text-gray-500 uppercase">Mensalidade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vcmFaixas.slice(0, 3).map((f) => (
                          <tr key={f.faixa_etaria} className="border-b border-gray-100">
                            <td className="py-2.5 px-3 text-gray-700">{f.faixa_etaria}</td>
                            <td className="py-2.5 px-3 text-right font-semibold text-gray-900">
                              {f.vcm != null ? formatCurrency(f.vcm) : "N/D"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                    <button
                      type="button"
                      onClick={() => setShowModal(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-colors shadow-lg"
                    >
                      <Eye className="h-4 w-4" />
                      Ver todas as mensalidades
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          {vcmLoading && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="skeleton h-6 w-48 mb-4" />
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="skeleton h-8 w-full rounded" />
                ))}
              </div>
            </div>
          )}

          {/* Quality metrics */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center flex-wrap gap-2">
              <Award className="h-5 w-5 text-blue-600 shrink-0" />
              Indicadores de qualidade
              <InfoTip text="Indicadores regulatórios da ANS que avaliam a operadora em diversas dimensões: saúde financeira, atendimento, reclamações e certificações." />
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Dados consolidados da operadora
            </p>
            <div className="space-y-3">
              {plano.classificacao_prudencial && (
                <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="text-sm text-gray-600">Classificação Prudencial</span>
                    <InfoTip text="Avalia a saúde financeira da operadora. S1 = situação mais sólida, S2 = boa, S3 e S4 = requerem atenção." />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 shrink-0">
                    {plano.classificacao_prudencial}
                  </span>
                </div>
              )}
              {plano.taxa_resolutividade != null && (
                <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="text-sm text-gray-600">Taxa de Resolutividade</span>
                    <InfoTip text="Percentual de demandas dos consumidores resolvidas diretamente pela operadora, sem necessidade de intervenção da ANS. Quanto maior, melhor." />
                  </div>
                  <span className={cn(
                    "text-sm font-semibold shrink-0",
                    Number(plano.taxa_resolutividade) >= 80 ? "text-green-700" : "text-amber-700",
                  )}>
                    {Number(plano.taxa_resolutividade).toFixed(1)}%
                  </span>
                </div>
              )}
              {plano.garantia_atendimento && (
                <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="text-sm text-gray-600">Garantia de Atendimento</span>
                    <InfoTip text="Monitoramento da ANS sobre os tempos de espera. Faixa 0 = melhor (sem atraso), faixas maiores indicam mais dificuldade de agendamento." />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 shrink-0">
                    {plano.garantia_atendimento}
                  </span>
                </div>
              )}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-1 min-w-0">
                  <span className="text-sm text-gray-600">Penalidades</span>
                  <InfoTip text="Multas e advertências aplicadas pela ANS nos últimos 3 anos por descumprimento de normas (negativas de cobertura, atrasos, etc.)." />
                </div>
                <span className="text-sm font-semibold text-gray-900 shrink-0">
                  {plano.qtd_penalidades > 0
                    ? `${plano.qtd_penalidades} (${formatCurrency(plano.total_multas)})`
                    : "Nenhuma"}
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-1 min-w-0">
                  <span className="text-sm text-gray-600">Programas de Prevenção</span>
                  <InfoTip text="Programas de promoção da saúde e prevenção de doenças (PromoPrev) cadastrados pela operadora na ANS." />
                </div>
                <span className="text-sm font-semibold text-gray-900 shrink-0">
                  {plano.qtd_programas_prevencao > 0
                    ? `${plano.qtd_programas_prevencao} programa${plano.qtd_programas_prevencao !== 1 ? "s" : ""}`
                    : "Nenhum"}
                </span>
              </div>
              {plano.acreditada && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-emerald-700">Acreditação</span>
                    <InfoTip text="Certificação voluntária de qualidade concedida por entidade independente. Indica que a operadora atende padrões elevados de gestão e assistência." className="[&_svg]:text-emerald-500" />
                  </div>
                  <span className="text-sm font-semibold text-emerald-800">
                    {plano.nivel_acreditacao || "Acreditada"}
                  </span>
                </div>
              )}
              {plano.regime_especial && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-100">
                  <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                  <Tooltip text="Medida excepcional da ANS quando a operadora apresenta problemas graves financeiros ou assistenciais. A ANS pode nomear um diretor técnico ou fiscal para supervisionar a operadora.">
                    <span className="text-sm font-medium text-red-700 cursor-help">
                      Operadora em Regime Especial (direção técnica/fiscal)
                    </span>
                  </Tooltip>
                </div>
              )}
            </div>
          </div>

          {/* IDSS sub-index breakdown */}
          {plano.idss_detalhes && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center flex-wrap gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-600 shrink-0" />
                IDSS — Detalhamento
                <InfoTip text="Índice de Desempenho da Saúde Suplementar, decomposto em 4 dimensões. Cada sub-índice vai de 0 a 1." />
              </h2>
              <p className="text-xs text-gray-500 mb-4">
                Referência: {plano.idss_detalhes.ano}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: "IDSS Geral", value: plano.idss_detalhes.idss, tip: "Nota geral composta pelas 4 dimensões abaixo." },
                  { label: "IDQS — Qualidade", value: plano.idss_detalhes.idqs, tip: "Qualidade em atenção à saúde: taxas de internação, partos cesáreos, prevenção." },
                  { label: "IDGA — Gestão", value: plano.idss_detalhes.idga, tip: "Gestão econômico-financeira: liquidez, endividamento, resultado operacional." },
                  { label: "IDSM — Satisfação", value: plano.idss_detalhes.idsm, tip: "Satisfação do beneficiário: pesquisas de satisfação e reclamações." },
                  { label: "IDGR — Governança", value: plano.idss_detalhes.idgr, tip: "Governança e responsabilidade: estrutura de compliance e transparência." },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-600">{item.label}</span>
                      <InfoTip text={item.tip} />
                    </div>
                    <span className={cn(
                      "text-sm font-bold",
                      item.value != null
                        ? Number(item.value) >= 0.7 ? "text-green-700"
                          : Number(item.value) >= 0.4 ? "text-amber-700"
                          : "text-red-700"
                        : "text-gray-400",
                    )}>
                      {item.value != null ? Number(item.value).toFixed(2) : "N/D"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* IGR complaint history */}
          {plano.igr_historico && plano.igr_historico.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center flex-wrap gap-2">
                <Phone className="h-5 w-5 text-orange-600 shrink-0" />
                Histórico de Reclamações (IGR)
                <InfoTip text="Evolução do Índice Geral de Reclamações ao longo dos últimos trimestres. Quanto menor o índice, menos reclamações a operadora recebe." />
              </h2>
              <p className="text-xs text-gray-500 mb-4">
                Últimas {plano.igr_historico.length} competências
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">Competência</th>
                      <th className="text-right py-2 px-3 text-xs font-medium text-gray-500 uppercase">Índice</th>
                      <th className="text-right py-2 px-3 text-xs font-medium text-gray-500 uppercase">Reclamações</th>
                      <th className="text-right py-2 px-3 text-xs font-medium text-gray-500 uppercase">Beneficiários</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plano.igr_historico.map((item) => (
                      <tr key={item.competencia} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2.5 px-3 text-gray-700">{formatCompetencia(item.competencia)}</td>
                        <td className="py-2.5 px-3 text-right font-semibold text-gray-900">
                          {item.indice != null ? Number(item.indice).toFixed(1) : "N/D"}
                        </td>
                        <td className="py-2.5 px-3 text-right text-gray-600">
                          {item.reclamacoes != null ? item.reclamacoes.toLocaleString("pt-BR") : "—"}
                        </td>
                        <td className="py-2.5 px-3 text-right text-gray-600">
                          {item.beneficiarios != null ? item.beneficiarios.toLocaleString("pt-BR") : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Reajuste history */}
          {plano.reajustes_historico && plano.reajustes_historico.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center flex-wrap gap-2">
                <DollarSign className="h-5 w-5 text-amber-600 shrink-0" />
                Histórico de Reajustes
                <InfoTip text="Percentuais de reajuste anual aplicados pela operadora nos últimos ciclos. O reajuste é o aumento autorizado pela ANS no valor da mensalidade." />
              </h2>
              <p className="text-xs text-gray-500 mb-4">
                Últimos {plano.reajustes_historico.length} ciclos
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">Ciclo</th>
                      <th className="text-right py-2 px-3 text-xs font-medium text-gray-500 uppercase">Reajuste</th>
                      <th className="text-right py-2 px-3 text-xs font-medium text-gray-500 uppercase">Beneficiários</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plano.reajustes_historico.map((item) => (
                      <tr key={item.ciclo} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2.5 px-3 text-gray-700">{item.ciclo}</td>
                        <td className="py-2.5 px-3 text-right font-semibold text-gray-900">
                          {item.pct_unico != null ? `${Number(item.pct_unico).toFixed(2)}%` : "N/D"}
                        </td>
                        <td className="py-2.5 px-3 text-right text-gray-600">
                          {item.qt_beneficiarios != null ? item.qt_beneficiarios.toLocaleString("pt-BR") : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Serviços opcionais */}
          {plano.servicos_opcionais && plano.servicos_opcionais.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Serviços opcionais
              </h2>
              <div className="grid sm:grid-cols-2 gap-2">
                {plano.servicos_opcionais.map((servico, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                    {servico}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* CTA cotação */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Interessado neste plano?
            </h3>
            <Link
              to="/cotacao"
              className="block w-full text-center py-2.5 bg-primary text-white font-semibold text-sm rounded-lg hover:bg-primary-dark transition-colors"
            >
              Solicitar cotação
            </Link>
          </div>

          {/* Operadora snapshot */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Operadora
            </h3>
            <Link
              to={`/operadoras/${plano.operadora_registro_ans}`}
              className="block p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center text-white font-bold text-xs",
                    gradient,
                  )}
                >
                  {initials}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {plano.operadora.nome_fantasia || plano.operadora.razao_social}
                  </div>
                  <div className="text-xs text-gray-400">
                    {plano.operadora.registro_ans}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-white rounded-lg p-2">
                  <div className="text-[10px] text-gray-500">UF</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {plano.operadora.uf}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-2">
                  <div className="text-[10px] text-gray-500">Modalidade</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {plano.operadora.modalidade}
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Área de atuação */}
          {plano.area_atuacao && plano.area_atuacao.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Área de atuação
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {plano.area_atuacao.map((area) => (
                  <span
                    key={area}
                    className="px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Municípios por UF */}
          {plano.municipios_por_uf && Object.keys(plano.municipios_por_uf).length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Municípios cobertos
                <span className="text-xs text-gray-400 font-normal ml-1">
                  ({Object.values(plano.municipios_por_uf).reduce((acc, arr) => acc + arr.length, 0)})
                </span>
              </h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {Object.entries(plano.municipios_por_uf)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([ufKey, municipios]) => (
                    <div key={ufKey}>
                      <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
                        {ufKey} ({municipios.length})
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {municipios.slice(0, 10).map((m) => (
                          <span key={m} className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600">
                            {m}
                          </span>
                        ))}
                        {municipios.length > 10 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-50 text-gray-400 italic">
                            +{municipios.length - 10} mais
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <LeadCaptureModal
        open={showModal}
        onClose={() => setShowModal(false)}
        planoNome={plano.nome}
      />
    </div>
  );
}
