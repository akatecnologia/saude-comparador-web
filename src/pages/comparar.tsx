import { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router";
import {
  Search,
  X,
  Plus,
  GitCompare,
  AlertCircle,
  Check,
  Trophy,
  Eye,
} from "lucide-react";
import { compararPlanos, buscarPlanos } from "@/lib/api-client";
import { trackEvent } from "@/lib/analytics";
import {
  cn,
  formatCurrency,
  formatPercentage,
  getPriceLevel,
  getPriceLevelLabel,
  FAIXAS_ETARIAS,
  getSavedFaixaEtaria,
  saveFaixaEtaria,
  getIdssBadge,
  getIdssBgColor,
  getInitials,
  getGradientForName,
} from "@/lib/utils";
import { getPrecos } from "@/lib/api-client";
import { useLead } from "@/hooks/use-lead";
import LeadCaptureModal from "@/components/lead-capture-modal";
import ShareButton from "@/components/share-button";
import type { PlanoDetail, Plano, VcmFaixaItem } from "@/types";

interface ComparisonRow {
  label: string;
  key: string;
  getValue: (plano: PlanoDetail) => string | number | boolean | null;
  type?: "text" | "badge" | "currency" | "percentage" | "boolean" | "idss";
  bestFn?: "min" | "max";
}

const COMPARISON_ROWS: ComparisonRow[] = [
  {
    label: "Operadora",
    key: "operadora",
    getValue: (p) => p.operadora_nome,
  },
  {
    label: "Segmentação",
    key: "segmentacao",
    getValue: (p) => p.segmentacao,
  },
  {
    label: "Tipo Contratação",
    key: "tipo_contratacao",
    getValue: (p) => p.tipo_contratacao,
  },
  {
    label: "Acomodação",
    key: "acomodacao",
    getValue: (p) => p.acomodacao,
  },
  {
    label: "Abrangência",
    key: "abrangencia",
    getValue: (p) => p.abrangencia,
  },
  {
    label: "Obstetrícia",
    key: "obstetrica",
    getValue: (p) => p.obstetricia === "Sim",
    type: "boolean",
  },
  {
    label: "Odontológico",
    key: "odonto",
    getValue: (p) => p.odontologico,
    type: "boolean",
  },
  {
    label: "IDSS",
    key: "idss",
    getValue: (p) => p.idss_score,
    type: "idss",
    bestFn: "max",
  },
  {
    label: "Índice Reclamações",
    key: "igr",
    getValue: (p) => p.igr_indice,
    type: "text",
    bestFn: "min",
  },
  {
    label: "Último Reajuste",
    key: "reajuste",
    getValue: (p) => p.reajuste_ultimo,
    type: "percentage",
    bestFn: "min",
  },
];

export default function Comparar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [planos, setPlanos] = useState<PlanoDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search add
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Plano[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [faixaEtaria, setFaixaEtaria] = useState(getSavedFaixaEtaria);
  const { isLead } = useLead();
  const [showModal, setShowModal] = useState(false);

  // Persist when changed
  useEffect(() => { saveFaixaEtaria(faixaEtaria); }, [faixaEtaria]);

  // VCM prices per plan
  const [vcmByPlan, setVcmByPlan] = useState<Map<string, VcmFaixaItem[]>>(new Map());
  useEffect(() => {
    if (planos.length === 0) return;
    const planIds = planos.map((p) => p.id_plano_ans).filter(Boolean);
    Promise.all(
      planIds.map((id) =>
        getPrecos(id).then((res) => [id, res.faixas] as [string, VcmFaixaItem[]]).catch(() => [id, []] as [string, VcmFaixaItem[]])
      ),
    ).then((entries) => setVcmByPlan(new Map(entries)));
  }, [planos]);

  const idsParam = searchParams.get("ids") || "";
  const selectedIds = idsParam
    ? idsParam.split(",").map(Number).filter(Boolean)
    : [];

  useEffect(() => {
    if (selectedIds.length === 0) {
      setPlanos([]);
      return;
    }
    setLoading(true);
    setError(null);
    trackEvent("compare", { plan_ids: selectedIds.join(",") });
    compararPlanos(selectedIds)
      .then(setPlanos)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [idsParam]);

  const addPlan = useCallback(
    (id: number) => {
      if (selectedIds.includes(id) || selectedIds.length >= 4) return;
      const next = [...selectedIds, id];
      setSearchParams({ ids: next.join(",") });
      setShowSearch(false);
      setSearchQuery("");
      setSearchResults([]);
    },
    [selectedIds, setSearchParams],
  );

  const removePlan = useCallback(
    (id: number) => {
      const next = selectedIds.filter((i) => i !== id);
      if (next.length > 0) {
        setSearchParams({ ids: next.join(",") });
      } else {
        setSearchParams({});
      }
    },
    [selectedIds, setSearchParams],
  );

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      setSearching(true);
      buscarPlanos({ q: searchQuery, page_size: 5 })
        .then((res) => setSearchResults(res.items))
        .catch(() => setSearchResults([]))
        .finally(() => setSearching(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  function getBestIndex(row: ComparisonRow): number {
    if (!row.bestFn || planos.length < 2) return -1;
    const values = planos.map((p) => {
      const v = row.getValue(p);
      return typeof v === "number" ? v : null;
    });
    const validValues = values.filter((v): v is number => v !== null);
    if (validValues.length < 2) return -1;
    const target = row.bestFn === "min" ? Math.min(...validValues) : Math.max(...validValues);
    return values.indexOf(target);
  }

  function renderValue(
    row: ComparisonRow,
    plano: PlanoDetail,
    isBest: boolean,
  ) {
    const value = row.getValue(plano);

    const wrapBest = (content: React.ReactNode) => (
      <div className={cn("flex items-center gap-1", isBest && "font-bold")}>
        {content}
        {isBest && <Trophy className="h-3.5 w-3.5 text-warning" />}
      </div>
    );

    switch (row.type) {
      case "idss":
        return wrapBest(
          <span
            className={cn(
              "inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold",
              getIdssBgColor(value as number | null),
            )}
          >
            {getIdssBadge(value as number | null)}
          </span>,
        );
      case "currency":
        return wrapBest(
          <span className="text-sm">
            {formatCurrency(value as number | null)}
          </span>,
        );
      case "percentage":
        return wrapBest(
          <span className="text-sm">
            {formatPercentage(value as number | null)}
          </span>,
        );
      case "boolean":
        return value ? (
          <Check className="h-5 w-5 text-success" />
        ) : (
          <X className="h-5 w-5 text-gray-300" />
        );
      default:
        return wrapBest(
          <span className="text-sm text-gray-700">
            {value != null ? String(value) : "N/D"}
          </span>,
        );
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GitCompare className="h-6 w-6 text-primary" />
            Comparar Planos
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Compare até 4 planos lado a lado
          </p>
        </div>
        {selectedIds.length > 0 && (
          <ShareButton
            variant="button"
            url={`/comparar?ids=${selectedIds.join(",")}`}
            title="Comparação de planos no SaúdeComparador"
          />
        )}
      </div>

      {/* Plan selector header */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">
            {selectedIds.length}/4 planos selecionados
          </span>
          {selectedIds.length < 4 && (
            <button
              type="button"
              onClick={() => setShowSearch(!showSearch)}
              className="inline-flex items-center gap-1 text-sm text-primary font-medium hover:text-primary-dark"
            >
              <Plus className="h-4 w-4" />
              Adicionar plano
            </button>
          )}
        </div>

        {/* Search dropdown */}
        {showSearch && (
          <div className="relative animate-fade-in">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar plano por nome ou operadora..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                autoFocus
              />
            </div>
            {(searchResults.length > 0 || searching) && (
              <div className="absolute z-10 w-full mt-1 bg-white rounded-lg border border-gray-200 shadow-lg max-h-60 overflow-y-auto">
                {searching ? (
                  <div className="px-4 py-3 text-sm text-gray-500">
                    Buscando...
                  </div>
                ) : (
                  searchResults.map((plano) => (
                    <button
                      key={plano.id}
                      type="button"
                      onClick={() => addPlan(plano.id)}
                      disabled={selectedIds.includes(plano.id)}
                      className={cn(
                        "w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0",
                        selectedIds.includes(plano.id) && "opacity-50",
                      )}
                    >
                      <div className="font-medium text-gray-900">
                        {plano.nome}
                      </div>
                      <div className="text-xs text-gray-500">
                        {plano.operadora_nome} | {plano.segmentacao}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Selected plans chips */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {planos.map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-light text-primary text-sm font-medium"
              >
                {p.nome.length > 30 ? p.nome.slice(0, 30) + "..." : p.nome}
                <button
                  type="button"
                  onClick={() => removePlan(p.id)}
                  className="hover:text-primary-dark"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 text-red-700 text-sm mb-6">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-16">
          <div className="animate-pulse-soft text-gray-400 text-sm">
            Carregando comparação...
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && planos.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <GitCompare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-700 mb-1">
            Nenhum plano selecionado
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            Adicione planos para comparar lado a lado.
          </p>
          <Link
            to="/planos"
            className="inline-flex items-center gap-1 text-sm text-primary font-medium hover:text-primary-dark"
          >
            Buscar planos
          </Link>
        </div>
      )}

      {/* Age bracket selector */}
      {!loading && planos.length > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-green-50 border border-green-200">
          <label className="text-xs font-semibold text-green-800 uppercase tracking-wider whitespace-nowrap">
            Faixa etária
          </label>
          <select
            value={faixaEtaria}
            onChange={(e) => setFaixaEtaria(e.target.value)}
            className="rounded-lg border border-green-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Selecione para ver preços</option>
            {FAIXAS_ETARIAS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Comparison table */}
      {!loading && planos.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto animate-fade-in">
          <table className="w-full">
            {/* Plan headers */}
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-500 w-48 min-w-48">
                  Característica
                </th>
                {planos.map((p) => {
                  const gradient = getGradientForName(p.operadora_nome || "");
                  const initials = getInitials(p.operadora_nome || "");
                  return (
                    <th
                      key={p.id}
                      className="px-4 py-4 text-center min-w-[200px]"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-xs",
                            gradient,
                          )}
                        >
                          {initials}
                        </div>
                        <Link
                          to={`/planos/${p.id}`}
                          className="text-sm font-semibold text-gray-900 hover:text-primary transition-colors line-clamp-2"
                        >
                          {p.nome}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removePlan(p.id)}
                          className="text-xs text-gray-400 hover:text-danger"
                        >
                          Remover
                        </button>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {COMPARISON_ROWS.map((row) => {
                const bestIdx = getBestIndex(row);
                return (
                  <tr key={row.key} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-600">
                      {row.label}
                    </td>
                    {planos.map((p, idx) => (
                      <td
                        key={p.id}
                        className={cn(
                          "px-4 py-3 text-center",
                          idx === bestIdx && "bg-green-50/50",
                        )}
                      >
                        <div className="flex items-center justify-center">
                          {renderValue(row, p, idx === bestIdx)}
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              })}
              {faixaEtaria && (
                <tr className="bg-green-50/30 hover:bg-green-50/60">
                  <td className="px-4 py-3 text-sm font-medium text-green-700">
                    Mensalidade VCM
                  </td>
                  {planos.map((p) => {
                    const faixas = vcmByPlan.get(p.id_plano_ans) || [];
                    const match = faixas.find((f) => f.faixa_etaria === faixaEtaria);
                    if (!isLead) {
                      const level = getPriceLevel(match?.vcm ?? null);
                      return (
                        <td key={p.id} className="px-4 py-3 text-center">
                          {level ? (
                            <button
                              type="button"
                              onClick={() => setShowModal(true)}
                              className="inline-flex flex-col items-center gap-0.5 text-amber-700 hover:text-primary transition-colors"
                            >
                              <span className="text-sm font-bold tracking-wider">{level}</span>
                              <span className="text-[10px] text-amber-600">{getPriceLevelLabel(level)}</span>
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary">
                                <Eye className="h-3 w-3" />
                                Ver real
                              </span>
                            </button>
                          ) : (
                            <span className="text-sm text-gray-400">N/D</span>
                          )}
                        </td>
                      );
                    }
                    return (
                      <td key={p.id} className="px-4 py-3 text-center">
                        {match?.vcm != null ? (
                          <div className="text-sm font-semibold text-green-800">
                            {formatCurrency(match.vcm)}
                            <div className="text-[10px] font-normal text-green-600">/mês</div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">N/D</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Price disclaimer */}
      {!loading && planos.length > 0 && faixaEtaria && (
        <p className="text-[11px] text-gray-400 italic mt-3">
          *Preços VCM (Valor Comercial da Mensalidade) registrados na ANS. Valores de referência — preços reais podem variar conforme condições contratuais.
        </p>
      )}

      <LeadCaptureModal
        open={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}
