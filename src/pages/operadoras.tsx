import { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router";
import {
  Search,
  Building2,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
} from "lucide-react";
import SEO from "@/components/seo";
import { getOperadoras } from "@/lib/api-client";
import {
  cn,
  UF_LIST,
  MODALIDADES,
  getIdssBadge,
  getIdssBgColor,
  getInitials,
  getGradientForName,
  formatNumber,
} from "@/lib/utils";
import { useUserUf } from "@/hooks/use-user-uf";
import type { Operadora, PaginatedResponse } from "@/types";

export default function Operadoras() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [detectedUf, saveUf] = useUserUf();
  const [data, setData] = useState<PaginatedResponse<Operadora> | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  const q = searchParams.get("q") || "";
  const uf = searchParams.get("uf") ?? detectedUf;
  const modalidade = searchParams.get("modalidade") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const updateParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(searchParams);
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      if (key !== "page") next.delete("page");
      setSearchParams(next);
    },
    [searchParams, setSearchParams],
  );

  useEffect(() => {
    setLoading(true);
    getOperadoras({
      q: q || undefined,
      uf: uf || undefined,
      modalidade: modalidade || undefined,
      page,
      page_size: 18,
    })
      .then(setData)
      .catch(() =>
        setData({ items: [], total: 0, page: 1, page_size: 18, total_pages: 0 }),
      )
      .finally(() => setLoading(false));
  }, [q, uf, modalidade, page]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEO
        title="Operadoras de planos de saúde"
        description="Explore as operadoras de planos de saúde registradas na ANS. Compare IDSS, reclamações e reajustes."
        canonical="/operadoras"
      />
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Operadoras</h1>
        <p className="text-gray-500 text-sm mt-1">
          Explore as operadoras de planos de saúde registradas na ANS
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={q}
            onChange={(e) => updateParam("q", e.target.value)}
            placeholder="Buscar operadora por nome ou registro ANS..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
          />
        </div>
        <select
          value={uf}
          onChange={(e) => { saveUf(e.target.value); updateParam("uf", e.target.value); }}
          className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="">Todos os estados</option>
          {UF_LIST.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
        <select
          value={modalidade}
          onChange={(e) => updateParam("modalidade", e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="">Todas modalidades</option>
          {MODALIDADES.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
        <div className="hidden sm:flex items-center gap-1 border border-gray-200 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setViewMode("cards")}
            className={cn(
              "p-2 rounded-md transition-colors",
              viewMode === "cards"
                ? "bg-primary text-white"
                : "text-gray-400 hover:text-gray-600",
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={cn(
              "p-2 rounded-md transition-colors",
              viewMode === "table"
                ? "bg-primary text-white"
                : "text-gray-400 hover:text-gray-600",
            )}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Results count */}
      {data && !loading && (
        <div className="mb-4 text-sm text-gray-500">
          {data.total > 0
            ? `${formatNumber(data.total)} operadora${data.total > 1 ? "s" : ""}`
            : "Nenhuma operadora encontrada"}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex gap-3 mb-3">
                <div className="skeleton w-12 h-12 rounded-xl" />
                <div className="flex-1">
                  <div className="skeleton h-4 w-3/4 mb-2" />
                  <div className="skeleton h-3 w-1/2" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="skeleton h-12 rounded-lg" />
                <div className="skeleton h-12 rounded-lg" />
                <div className="skeleton h-12 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : data && data.items.length > 0 ? (
        viewMode === "cards" ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.items.map((op) => (
              <OperadoraCard key={op.id} operadora={op} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Operadora
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Registro ANS
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    UF
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Modalidade
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Beneficiários
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    IDSS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.items.map((op) => (
                  <tr key={op.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        to={`/operadoras/${op.registro_ans}`}
                        className="text-sm font-medium text-gray-900 hover:text-primary transition-colors"
                      >
                        {op.nome_fantasia || op.razao_social}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {op.registro_ans}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {op.uf}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {op.modalidade}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatNumber(op.beneficiarios)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center justify-center w-7 h-7 rounded-md text-xs font-bold",
                          getIdssBgColor(op.idss_score),
                        )}
                      >
                        {getIdssBadge(op.idss_score)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-700 mb-1">
            Nenhuma operadora encontrada
          </h3>
          <p className="text-gray-500 text-sm">Tente ajustar os filtros.</p>
        </div>
      )}

      {/* Pagination */}
      {data && data.total_pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            type="button"
            onClick={() => updateParam("page", String(page - 1))}
            disabled={page <= 1}
            className={cn(
              "p-2 rounded-lg border transition-colors",
              page <= 1
                ? "border-gray-200 text-gray-300 cursor-not-allowed"
                : "border-gray-200 text-gray-600 hover:bg-gray-50",
            )}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm text-gray-600">
            Página {page} de {data.total_pages}
          </span>
          <button
            type="button"
            onClick={() => updateParam("page", String(page + 1))}
            disabled={page >= data.total_pages}
            className={cn(
              "p-2 rounded-lg border transition-colors",
              page >= data.total_pages
                ? "border-gray-200 text-gray-300 cursor-not-allowed"
                : "border-gray-200 text-gray-600 hover:bg-gray-50",
            )}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}

function OperadoraCard({ operadora }: { operadora: Operadora }) {
  const gradient = getGradientForName(operadora.razao_social);
  const initials = getInitials(
    operadora.nome_fantasia || operadora.razao_social,
  );

  return (
    <Link
      to={`/operadoras/${operadora.registro_ans}`}
      className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow animate-fade-in"
    >
      <div className="flex items-start gap-3 mb-4">
        <div
          className={cn(
            "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-sm shrink-0",
            gradient,
          )}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
            {operadora.nome_fantasia || operadora.razao_social}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            ANS {operadora.registro_ans}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="text-center p-2 rounded-lg bg-gray-50">
          <div className="text-[10px] text-gray-500 uppercase font-medium mb-0.5">
            UF
          </div>
          <div className="text-sm font-semibold text-gray-800">
            {operadora.uf}
          </div>
        </div>
        <div className="text-center p-2 rounded-lg bg-gray-50">
          <div className="text-[10px] text-gray-500 uppercase font-medium mb-0.5">
            Benef.
          </div>
          <div className="text-sm font-semibold text-gray-800">
            {operadora.beneficiarios != null
              ? operadora.beneficiarios > 1000
                ? `${(operadora.beneficiarios / 1000).toFixed(0)}k`
                : formatNumber(operadora.beneficiarios)
              : "N/D"}
          </div>
        </div>
        <div className="text-center p-2 rounded-lg bg-gray-50">
          <div className="text-[10px] text-gray-500 uppercase font-medium mb-0.5">
            IDSS
          </div>
          <span
            className={cn(
              "inline-flex items-center justify-center w-7 h-7 rounded-md text-xs font-bold",
              getIdssBgColor(operadora.idss_score),
            )}
          >
            {getIdssBadge(operadora.idss_score)}
          </span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100">
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-100 text-gray-600">
          {operadora.modalidade}
        </span>
      </div>
    </Link>
  );
}
