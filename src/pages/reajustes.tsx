import { useState, useEffect } from "react";
import { TrendingUp, Search, AlertCircle } from "lucide-react";
import ReajusteChart from "@/components/reajuste-chart";
import { getReajustes, getOperadoras } from "@/lib/api-client";
import { formatPercentage, cn } from "@/lib/utils";
import type { Reajuste, Operadora } from "@/types";

export default function ReajustesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOperadora, setSelectedOperadora] = useState<Operadora | null>(
    null,
  );
  const [suggestions, setSuggestions] = useState<Operadora[]>([]);
  const [searching, setSearching] = useState(false);
  const [reajustes, setReajustes] = useState<Reajuste[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search operadoras for autocomplete
  useEffect(() => {
    if (!searchQuery.trim() || selectedOperadora) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(() => {
      setSearching(true);
      getOperadoras({ q: searchQuery, page_size: 5 })
        .then((res) => setSuggestions(res.items))
        .catch(() => setSuggestions([]))
        .finally(() => setSearching(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedOperadora]);

  // Load reajustes when operadora selected
  useEffect(() => {
    if (!selectedOperadora) {
      setReajustes([]);
      return;
    }
    setLoading(true);
    setError(null);
    getReajustes(selectedOperadora.registro_ans)
      .then(setReajustes)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedOperadora]);

  function selectOperadora(op: Operadora) {
    setSelectedOperadora(op);
    setSearchQuery(op.nome_fantasia || op.razao_social);
    setSuggestions([]);
  }

  function clearSelection() {
    setSelectedOperadora(null);
    setSearchQuery("");
    setReajustes([]);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          Histórico de Reajustes
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Consulte o histórico de reajustes das operadoras e compare com o teto
          da ANS
        </p>
      </div>

      {/* Info box */}
      <div className="bg-primary-light rounded-xl p-4 mb-6">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm text-primary">
            <p className="font-medium mb-1">Sobre os reajustes</p>
            <p className="text-primary/80 leading-relaxed">
              A ANS define anualmente o teto máximo de reajuste para planos
              individuais e familiares. Planos coletivos não têm regulação
              direta de reajuste pela ANS, sendo negociados entre operadoras e
              contratantes.
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Buscar operadora
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (selectedOperadora) {
                setSelectedOperadora(null);
              }
            }}
            placeholder="Digite o nome da operadora..."
            className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
          />
          {selectedOperadora && (
            <button
              type="button"
              onClick={clearSelection}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <span className="text-xs">Limpar</span>
            </button>
          )}
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && !selectedOperadora && (
          <div className="mt-1 bg-white rounded-lg border border-gray-200 shadow-lg max-h-60 overflow-y-auto">
            {searching ? (
              <div className="px-4 py-3 text-sm text-gray-500">
                Buscando...
              </div>
            ) : (
              suggestions.map((op) => (
                <button
                  key={op.id}
                  type="button"
                  onClick={() => selectOperadora(op)}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                >
                  <div className="font-medium text-gray-900">
                    {op.nome_fantasia || op.razao_social}
                  </div>
                  <div className="text-xs text-gray-500">
                    ANS {op.registro_ans} | {op.uf} | {op.modalidade}
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Chart */}
      {selectedOperadora && !loading && reajustes.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 animate-fade-in">
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            {selectedOperadora.nome_fantasia || selectedOperadora.razao_social}
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            ANS {selectedOperadora.registro_ans}
          </p>
          <ReajusteChart data={reajustes} tetoAns={15.5} />
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="skeleton h-6 w-1/3 mb-4" />
          <div className="skeleton h-64 rounded-lg" />
        </div>
      )}

      {/* Table */}
      {selectedOperadora && !loading && reajustes.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-fade-in">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700">
              Detalhamento por ano
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Ano
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Tipo de Plano
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Percentual
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reajustes
                  .sort((a, b) => b.ano - a.ano)
                  .map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {r.ano}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {r.tipo_plano}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "text-sm font-semibold",
                            r.percentual > 15
                              ? "text-danger"
                              : r.percentual > 10
                                ? "text-warning"
                                : "text-success",
                          )}
                        >
                          {formatPercentage(r.percentual)}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state when operadora selected but no reajustes */}
      {selectedOperadora && !loading && reajustes.length === 0 && !error && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 animate-fade-in">
          <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-700 mb-1">
            Sem dados de reajuste
          </h3>
          <p className="text-gray-500 text-sm">
            Não foram encontrados registros de reajuste para esta operadora.
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Initial state */}
      {!selectedOperadora && !loading && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-700 mb-1">
            Selecione uma operadora
          </h3>
          <p className="text-gray-500 text-sm">
            Use o campo de busca acima para encontrar a operadora desejada.
          </p>
        </div>
      )}
    </div>
  );
}
