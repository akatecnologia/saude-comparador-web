import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import SEO from "@/components/seo";
import RankingTable from "@/components/ranking-table";
import { getRanking } from "@/lib/api-client";
import { cn, UF_LIST, formatNumber } from "@/lib/utils";
import { useUserUf } from "@/hooks/use-user-uf";
import type { RankingEntry, PaginatedResponse } from "@/types";

const YEARS = Array.from({ length: 6 }, (_, i) => 2024 - i);

export default function Ranking() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [detectedUf, saveUf] = useUserUf();
  const [data, setData] = useState<PaginatedResponse<RankingEntry> | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<string>("posicao");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const uf = searchParams.get("uf") ?? detectedUf;
  const ano = searchParams.get("ano") || "";
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
    getRanking({
      uf: uf || undefined,
      ano: ano ? parseInt(ano) : undefined,
      ordem: `${sortField}_${sortDir}`,
      page,
      page_size: 20,
    })
      .then(setData)
      .catch(() =>
        setData({
          items: [],
          total: 0,
          page: 1,
          page_size: 20,
          total_pages: 0,
        }),
      )
      .finally(() => setLoading(false));
  }, [uf, ano, page, sortField, sortDir]);

  function handleSort(field: string) {
    if (field === sortField) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(field === "posicao" ? "asc" : "desc");
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEO
        title="Ranking IDSS de operadoras"
        description="Ranking de operadoras de planos de saúde pelo Índice de Desempenho da Saúde Suplementar (IDSS) avaliado pela ANS."
        canonical="/ranking"
      />
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          Ranking IDSS
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Índice de Desempenho da Saúde Suplementar - avaliação de qualidade pela
          ANS
        </p>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-green-100 text-green-800 text-xs font-bold flex items-center justify-center">
              A
            </span>
            <span className="text-xs text-gray-600">
              Excelente (0.80 - 1.00)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-yellow-100 text-yellow-800 text-xs font-bold flex items-center justify-center">
              B
            </span>
            <span className="text-xs text-gray-600">
              Regular (0.60 - 0.79)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-red-100 text-red-800 text-xs font-bold flex items-center justify-center">
              C
            </span>
            <span className="text-xs text-gray-600">
              Precisa melhorar (abaixo de 0.60)
            </span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
            <span>
              <strong>IDQS:</strong> Qualidade em saúde
            </span>
            <span>
              <strong>IDGA:</strong> Garantia de acesso
            </span>
            <span>
              <strong>IDSM:</strong> Sustentabilidade do mercado
            </span>
            <span>
              <strong>IDGR:</strong> Gestão de recursos
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <select
          value={uf}
          onChange={(e) => { saveUf(e.target.value); updateParam("uf", e.target.value); }}
          className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="">Todos os estados</option>
          {UF_LIST.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
        <select
          value={ano}
          onChange={(e) => updateParam("ano", e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="">Todos os anos</option>
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        {data && !loading && (
          <span className="text-sm text-gray-500 self-center ml-auto">
            {formatNumber(data.total)} resultado
            {data.total !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex gap-4 py-3 border-b border-gray-50 last:border-0">
              <div className="skeleton h-5 w-8" />
              <div className="skeleton h-5 flex-1" />
              <div className="skeleton h-5 w-16" />
              <div className="skeleton h-5 w-8" />
              <div className="skeleton h-5 w-8" />
              <div className="skeleton h-5 w-24" />
              <div className="skeleton h-5 w-24" />
              <div className="skeleton h-5 w-24" />
              <div className="skeleton h-5 w-24" />
            </div>
          ))}
        </div>
      ) : data && data.items.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200">
          <RankingTable
            data={data.items}
            sortField={sortField}
            sortDir={sortDir}
            onSort={handleSort}
          />
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-700 mb-1">
            Nenhum resultado encontrado
          </h3>
          <p className="text-gray-500 text-sm">
            Tente ajustar os filtros de busca.
          </p>
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

          {Array.from({ length: Math.min(data.total_pages, 7) }, (_, i) => {
            let p: number;
            if (data.total_pages <= 7) {
              p = i + 1;
            } else if (page <= 4) {
              p = i + 1;
            } else if (page >= data.total_pages - 3) {
              p = data.total_pages - 6 + i;
            } else {
              p = page - 3 + i;
            }
            return (
              <button
                key={p}
                type="button"
                onClick={() => updateParam("page", String(p))}
                className={cn(
                  "w-10 h-10 rounded-lg text-sm font-medium transition-colors",
                  p === page
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:bg-gray-100",
                )}
              >
                {p}
              </button>
            );
          })}

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
