import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router";
import { Search, SlidersHorizontal, Loader2, X, ChevronDown, MapPin } from "lucide-react";
import SEO from "@/components/seo";
import PlanCard from "@/components/plan-card";
import { buscarPlanos } from "@/lib/api-client";
import { trackEvent } from "@/lib/analytics";
import {
  UF_LIST,
  TIPOS_CONTRATACAO,
  SEGMENTACOES,
  ABRANGENCIAS,
  FAIXAS_ETARIAS,
  getSavedFaixaEtaria,
  saveFaixaEtaria,
  getSavedPlanoFilters,
  savePlanoFilters,
  cn,
} from "@/lib/utils";
import { useUserUf } from "@/hooks/use-user-uf";
import MunicipioAutocomplete from "@/components/municipio-autocomplete";
import type { Plano } from "@/types";

const PAGE_SIZE = 24;

const ORDEM_OPTIONS = [
  { value: "relevancia", label: "Melhor custo-benefício" },
  { value: "preco_asc", label: "Menor preço" },
  { value: "preco_desc", label: "Maior preço" },
  { value: "idss_desc", label: "Melhor IDSS" },
  { value: "idss_asc", label: "Menor IDSS" },
  { value: "reajuste_asc", label: "Menor reajuste" },
  { value: "reajuste_desc", label: "Maior reajuste" },
  { value: "igr_asc", label: "Menos reclamações" },
  { value: "nome_asc", label: "Nome (A-Z)" },
];

/* Filter section labels for the sidebar */
const FILTER_SECTIONS = [
  { key: "uf", label: "Estado" },
  { key: "tipo_contratacao", label: "Tipo de contratação" },
  { key: "segmentacao", label: "Segmentação" },
  { key: "abrangencia", label: "Abrangência" },
] as const;

type FilterKey = (typeof FILTER_SECTIONS)[number]["key"];

const FILTER_OPTIONS: Record<FilterKey, readonly { value: string; label: string }[]> = {
  uf: UF_LIST.map((u) => ({ value: u, label: u })),
  tipo_contratacao: TIPOS_CONTRATACAO,
  segmentacao: SEGMENTACOES,
  abrangencia: ABRANGENCIAS,
};

export default function Planos() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [detectedUf, saveUf] = useUserUf();
  const [initialized, setInitialized] = useState(false);

  // Restore saved filters on first load when URL has no filters.
  // Flow: mount → URL empty → setSearchParams(saved) → re-render → URL has params → setInitialized(true)
  // The fetch effect is gated on `initialized` so no wasted request with empty filters.
  useEffect(() => {
    if (initialized) return;
    const hasUrlFilters = Array.from(searchParams.keys()).length > 0;
    if (hasUrlFilters) {
      setInitialized(true);
      return;
    }
    const saved = getSavedPlanoFilters();
    const entries = Object.entries(saved).filter(([, v]) => v);
    if (entries.length > 0) {
      const next = new URLSearchParams();
      for (const [k, v] of entries) {
        if (v) next.set(k, v);
      }
      setSearchParams(next, { replace: true });
      // Don't set initialized yet — wait for re-render with updated searchParams
      return;
    }
    // No saved filters, proceed with defaults
    setInitialized(true);
  }, [initialized, searchParams, setSearchParams]);

  // Infinite scroll state
  const [items, setItems] = useState<Plano[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [compareList, setCompareList] = useState<number[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set([...FILTER_SECTIONS.map((s) => s.key), "cidade"]),
  );

  // Read current params
  const qParam = searchParams.get("q") || "";
  const [searchText, setSearchText] = useState(qParam);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Debounce: push to URL params after 400ms, only if 2+ chars or empty
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const trimmed = searchText.trim();
      const effective = trimmed.length >= 2 ? trimmed : "";
      if (effective !== qParam) {
        const next = new URLSearchParams(searchParams);
        if (effective) { next.set("q", effective); } else { next.delete("q"); }
        setSearchParams(next);
      }
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [searchText]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync local state if URL param changes externally (e.g. back/forward)
  useEffect(() => {
    if (qParam !== searchText.trim() && qParam !== searchText) {
      setSearchText(qParam);
    }
  }, [qParam]); // eslint-disable-line react-hooks/exhaustive-deps

  const q = qParam;
  const uf = searchParams.get("uf") ?? detectedUf;
  const cidade = searchParams.get("cidade") || "";
  const tipo_contratacao = searchParams.get("tipo_contratacao") || "";
  const segmentacao = searchParams.get("segmentacao") || "";
  const acomodacao = searchParams.get("acomodacao") || "";
  const abrangencia = searchParams.get("abrangencia") || "";
  const faixa_etaria = searchParams.get("faixa_etaria") || getSavedFaixaEtaria();
  const ordem = searchParams.get("ordem") || "relevancia";

  // Persist faixa_etaria to localStorage when changed
  useEffect(() => { saveFaixaEtaria(faixa_etaria); }, [faixa_etaria]);

  // Persist all filters to localStorage when any filter changes
  useEffect(() => { savePlanoFilters(searchParams); }, [searchParams]);

  // Build a "filter key" — when this changes, we reset to page 1
  const filterKey = `${q}|${uf}|${cidade}|${tipo_contratacao}|${segmentacao}|${acomodacao}|${abrangencia}|${faixa_etaria}|${ordem}`;

  const filterValues: Record<FilterKey, string> = {
    uf,
    tipo_contratacao,
    segmentacao,
    abrangencia,
  };

  const activeFilters = FILTER_SECTIONS.filter((s) => filterValues[s.key]);

  const updateParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(searchParams);
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      setSearchParams(next);
    },
    [searchParams, setSearchParams],
  );

  // Reset and load page 1 whenever filters change (only after initialization)
  useEffect(() => {
    if (!initialized) return;

    setItems([]);
    setPage(1);
    setHasMore(true);
    setLoading(true);
    trackEvent("search", { uf: uf || undefined, tipo: tipo_contratacao || undefined });

    buscarPlanos({
      q: q || undefined,
      uf: uf || undefined,
      cidade: cidade || undefined,
      tipo_contratacao: tipo_contratacao || undefined,
      segmentacao: segmentacao || undefined,
      acomodacao: acomodacao || undefined,
      abrangencia: abrangencia || undefined,
      faixa_etaria: faixa_etaria || undefined,
      ordem: ordem !== "relevancia" ? ordem : undefined,
      page: 1,
      page_size: PAGE_SIZE,
    })
      .then((data) => {
        setItems(data.items);
        setTotal(data.total);
        setHasMore(data.items.length >= PAGE_SIZE && data.page < data.total_pages);
        setPage(1);
      })
      .catch(() => {
        setItems([]);
        setTotal(0);
        setHasMore(false);
      })
      .finally(() => setLoading(false));
  }, [filterKey, initialized]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load next page (called by "Carregar mais" button)
  function loadMore() {
    if (loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setLoadingMore(true);

    buscarPlanos({
      q: q || undefined,
      uf: uf || undefined,
      cidade: cidade || undefined,
      tipo_contratacao: tipo_contratacao || undefined,
      segmentacao: segmentacao || undefined,
      acomodacao: acomodacao || undefined,
      abrangencia: abrangencia || undefined,
      faixa_etaria: faixa_etaria || undefined,
      ordem: ordem !== "relevancia" ? ordem : undefined,
      page: nextPage,
      page_size: PAGE_SIZE,
    })
      .then((data) => {
        setItems((prev) => [...prev, ...data.items]);
        setTotal(data.total);
        setHasMore(data.items.length >= PAGE_SIZE && data.page < data.total_pages);
        setPage(nextPage);
      })
      .catch(() => setHasMore(false))
      .finally(() => setLoadingMore(false));
  }

  function toggleCompare(plano: Plano) {
    setCompareList((prev) =>
      prev.includes(plano.id)
        ? prev.filter((id) => id !== plano.id)
        : prev.length < 4
          ? [...prev, plano.id]
          : prev,
    );
  }

  function clearFilters() {
    setSearchParams(q ? { q } : {});
    // cidade is cleared along with other params since setSearchParams replaces all
  }

  function toggleSection(key: string) {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function handleFilterChange(key: FilterKey, value: string) {
    if (key === "uf") {
      saveUf(value);
      // Clear cidade when UF changes (municipio may not exist in the new state)
      if (cidade) {
        const next = new URLSearchParams(searchParams);
        if (value) { next.set("uf", value); } else { next.delete("uf"); }
        next.delete("cidade");
        setSearchParams(next);
        return;
      }
    }
    updateParam(key, value);
  }

  function removeFilter(key: FilterKey) {
    handleFilterChange(key, "");
  }

  /* Age bracket context selector (shared between desktop + mobile) */
  const faixaEtariaSelector = (
    <div className="rounded-lg bg-green-50 border border-green-200 p-3 mb-3">
      <label className="block text-xs font-semibold text-green-800 uppercase tracking-wider mb-1.5">
        Sua faixa etária
      </label>
      <select
        value={faixa_etaria}
        onChange={(e) => updateParam("faixa_etaria", e.target.value)}
        className="w-full rounded-lg border border-green-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
      >
        <option value="">Selecione para ver preços</option>
        {FAIXAS_ETARIAS.map((f) => (
          <option key={f.value} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>
      {faixa_etaria && (
        <p className="text-[10px] text-green-600 mt-1">
          Mostrando preços (VCM) para sua faixa etária.
        </p>
      )}
    </div>
  );

  /* Municipio autocomplete section (shared between desktop + mobile) */
  const cidadeSection = (
    <div className="border-b border-gray-100">
      <button
        type="button"
        onClick={() => toggleSection("cidade")}
        className="flex items-center justify-between w-full py-3 px-1 text-sm font-semibold text-gray-800 hover:text-primary transition-colors"
      >
        <span className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5" />
          Municipio
          {cidade && (
            <span className="w-2 h-2 rounded-full bg-primary" />
          )}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-gray-400 transition-transform",
            expandedSections.has("cidade") && "rotate-180",
          )}
        />
      </button>
      {expandedSections.has("cidade") && (
        <div className="pb-3 px-1">
          <MunicipioAutocomplete
            value={cidade}
            uf={uf || undefined}
            onChange={(value) => updateParam("cidade", value)}
          />
        </div>
      )}
    </div>
  );

  /* Shared filter sidebar content */
  const filterSidebar = (
    <div className="space-y-1">
      {FILTER_SECTIONS.map((section) => {
        const isExpanded = expandedSections.has(section.key);
        const currentValue = filterValues[section.key];
        const options = FILTER_OPTIONS[section.key];
        const useSelect = section.key === "uf";

        return (
          <div key={section.key}>
            <div className="border-b border-gray-100">
              <button
                type="button"
                onClick={() => toggleSection(section.key)}
                className="flex items-center justify-between w-full py-3 px-1 text-sm font-semibold text-gray-800 hover:text-primary transition-colors"
              >
                <span className="flex items-center gap-2">
                  {section.label}
                  {currentValue && (
                    <span className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-gray-400 transition-transform",
                    isExpanded && "rotate-180",
                  )}
                />
              </button>
              {isExpanded && useSelect ? (
                <div className="pb-3 px-1">
                  <select
                    value={currentValue}
                    onChange={(e) => handleFilterChange(section.key, e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Todos os estados</option>
                    {options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : isExpanded && (
                <div className="pb-3 space-y-0.5">
                  <button
                    type="button"
                    onClick={() => handleFilterChange(section.key, "")}
                    className={cn(
                      "block w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors",
                      !currentValue
                        ? "bg-primary-light text-primary font-medium"
                        : "text-gray-600 hover:bg-gray-50",
                    )}
                  >
                    Todos
                  </button>
                  {options.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleFilterChange(section.key, opt.value)}
                      className={cn(
                        "block w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors",
                        currentValue === opt.value
                          ? "bg-primary-light text-primary font-medium"
                          : "text-gray-600 hover:bg-gray-50",
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Insert municipio section after Estado */}
            {section.key === "uf" && cidadeSection}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 overflow-x-hidden">
      <SEO
        title="Buscar planos de saúde"
        description="Encontre o plano de saúde ideal comparando dados oficiais da ANS. Filtre por estado, tipo de contratação, segmentação e mais."
        canonical="/planos"
      />

      {/* Search bar — full width */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Buscar por nome do plano ou operadora (mín. 2 letras)..."
          className="w-full pl-12 pr-10 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition shadow-sm"
        />
        {searchText && (
          <button
            type="button"
            onClick={() => setSearchText("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Active filter chips */}
      {(activeFilters.length > 0 || cidade) && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {activeFilters.map((f) => {
            const value = filterValues[f.key];
            const opt = FILTER_OPTIONS[f.key].find((o) => o.value === value);
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => removeFilter(f.key)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors group"
              >
                {opt?.label || value}
                <X className="h-3.5 w-3.5 text-gray-400 group-hover:text-red-500" />
              </button>
            );
          })}
          {cidade && (
            <button
              type="button"
              onClick={() => updateParam("cidade", "")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors group"
            >
              <MapPin className="h-3.5 w-3.5" />
              {cidade}
              <X className="h-3.5 w-3.5 text-gray-400 group-hover:text-red-500" />
            </button>
          )}
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs text-primary font-medium hover:text-primary-dark ml-1"
          >
            Limpar tudo
          </button>
        </div>
      )}

      {/* Compare bar */}
      {compareList.length > 0 && (
        <div className="sticky top-16 z-30 mb-4 bg-primary text-white rounded-xl px-4 py-3 flex items-center justify-between shadow-lg">
          <span className="text-sm font-medium">
            {compareList.length} plano{compareList.length > 1 ? "s" : ""}{" "}
            selecionado{compareList.length > 1 ? "s" : ""} para comparação
            {compareList.length < 4 && " (max. 4)"}
          </span>
          <div className="flex items-center gap-2">
            <a
              href={`/comparar?ids=${compareList.join(",")}`}
              className="inline-flex items-center gap-1 bg-white text-primary px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors"
            >
              Comparar
            </a>
            <button
              type="button"
              onClick={() => setCompareList([])}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main layout: sidebar + results */}
      <div className="flex gap-6">
        {/* Sidebar — desktop only */}
        <aside className="hidden lg:block w-60 shrink-0">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto space-y-3">
            {faixaEtariaSelector}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Filtros</h2>
                {(activeFilters.length > 0 || cidade) && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-[11px] text-primary font-medium hover:text-primary-dark"
                  >
                    Limpar
                  </button>
                )}
              </div>
              {filterSidebar}
            </div>
          </div>
        </aside>

        {/* Results area */}
        <div className="flex-1 min-w-0">
          {/* Results header: count + acomodação toggle + sort + mobile filter toggle */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="flex items-center gap-3">
              {/* Mobile filter button */}
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className={cn(
                  "lg:hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors",
                  (activeFilters.length > 0 || cidade)
                    ? "bg-primary-light text-primary border-primary/30"
                    : "bg-white text-gray-600 border-gray-200",
                )}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filtros
                {(activeFilters.length > 0 || cidade) && (
                  <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">
                    {activeFilters.length + (cidade ? 1 : 0)}
                  </span>
                )}
              </button>

              {!loading && (
                <span className="text-sm text-gray-500">
                  {total > 0
                    ? <><strong className="text-gray-800">{total.toLocaleString("pt-BR")}</strong> resultado{total > 1 ? "s" : ""}</>
                    : "Nenhum resultado"}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              {/* Acomodação toggle */}
              <div className="inline-flex gap-1.5">
                <button
                  type="button"
                  onClick={() => updateParam("acomodacao", acomodacao === "Coletiva" ? "" : "Coletiva")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors",
                    acomodacao === "Coletiva"
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50",
                  )}
                >
                  Enfermaria
                </button>
                <button
                  type="button"
                  onClick={() => updateParam("acomodacao", acomodacao === "Individual" ? "" : "Individual")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors",
                    acomodacao === "Individual"
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50",
                  )}
                >
                  Apartamento
                </button>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <span className="hidden sm:inline">Ordenar por</span>
                <select
                  value={ordem}
                  onChange={(e) => updateParam("ordem", e.target.value)}
                  className="px-2 py-1.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent max-w-[180px]"
                >
                  {ORDEM_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results grid */}
          {loading ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex gap-3 mb-4">
                    <div className="skeleton w-12 h-12 rounded-xl" />
                    <div className="flex-1">
                      <div className="skeleton h-4 w-3/4 mb-2" />
                      <div className="skeleton h-3 w-1/2" />
                    </div>
                  </div>
                  <div className="flex gap-1.5 mb-4">
                    <div className="skeleton h-5 w-20 rounded-md" />
                    <div className="skeleton h-5 w-16 rounded-md" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="skeleton h-14 rounded-lg" />
                    <div className="skeleton h-14 rounded-lg" />
                    <div className="skeleton h-14 rounded-lg" />
                  </div>
                  <div className="skeleton h-10 w-full rounded-lg" />
                </div>
              ))}
            </div>
          ) : items.length > 0 ? (
            <>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {items.map((plano) => (
                  <PlanCard
                    key={plano.id}
                    plano={plano}
                    onCompare={toggleCompare}
                    isComparing={compareList.includes(plano.id)}
                  />
                ))}
              </div>

              {/* Load more / end indicator */}
              {hasMore ? (
                <div className="flex justify-center mt-8">
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Carregando...
                      </>
                    ) : (
                      <>Carregar mais planos</>
                    )}
                  </button>
                </div>
              ) : items.length > PAGE_SIZE && (
                <p className="text-center text-sm text-gray-400 py-6">
                  Todos os {total.toLocaleString("pt-BR")} planos foram carregados.
                </p>
              )}
            </>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-700 mb-1">
                Nenhum plano encontrado
              </h3>
              <p className="text-gray-500 text-sm">
                Tente ajustar os filtros ou termos de busca.
              </p>
              {(activeFilters.length > 0 || cidade) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 text-sm text-primary font-medium hover:text-primary-dark"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          )}

          {/* Price disclaimer */}
          {faixa_etaria && items.length > 0 && (
            <p className="text-[11px] text-gray-400 italic mt-4">
              *Preços VCM (Valor Comercial da Mensalidade) registrados na ANS. Valores de referência — preços reais podem variar conforme condições contratuais.
            </p>
          )}
        </div>
      </div>

      {/* Mobile filters — slide-over panel */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileFiltersOpen(false)}
          />
          {/* Panel */}
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h2 className="text-base font-bold text-gray-900">Filtros</h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-2">
              {faixaEtariaSelector}
              {filterSidebar}
            </div>
            <div className="border-t border-gray-200 px-4 py-3 flex gap-2">
              {(activeFilters.length > 0 || cidade) && (
                <button
                  type="button"
                  onClick={() => { clearFilters(); setMobileFiltersOpen(false); }}
                  className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Limpar
                </button>
              )}
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
              >
                Ver resultados
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
