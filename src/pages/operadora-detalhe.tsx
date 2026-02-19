import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import {
  ArrowLeft,
  Phone,
  Mail,
  Globe,
  MapPin,
  Users,
  Calendar,
  AlertCircle,
  FileText,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { getOperadora, buscarPlanos } from "@/lib/api-client";
import ReajusteChart from "@/components/reajuste-chart";
import PlanCard from "@/components/plan-card";
import {
  cn,
  getIdssBadge,
  getIdssBgColor,
  getIdssLabel,
  getInitials,
  getGradientForName,
  formatNumber,
} from "@/lib/utils";
import type { OperadoraDetail, Plano } from "@/types";

export default function OperadoraDetalhe() {
  const { registro } = useParams<{ registro: string }>();
  const [operadora, setOperadora] = useState<OperadoraDetail | null>(null);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!registro) return;
    setLoading(true);
    setError(null);

    Promise.all([
      getOperadora(registro),
      buscarPlanos({ q: registro, page_size: 6 }).catch(() => ({
        items: [] as Plano[],
        total: 0,
        page: 1,
        page_size: 6,
        total_pages: 0,
      })),
    ])
      .then(([op, planosRes]) => {
        setOperadora({ ...op, total_planos: planosRes.total });
        setPlanos(planosRes.items);
      })
      .catch((err) => setError(err.message || "Erro ao carregar operadora"))
      .finally(() => setLoading(false));
  }, [registro]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="skeleton h-6 w-32 mb-6" />
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex gap-4 mb-4">
            <div className="skeleton w-16 h-16 rounded-xl" />
            <div className="flex-1">
              <div className="skeleton h-6 w-2/3 mb-2" />
              <div className="skeleton h-4 w-1/3" />
            </div>
          </div>
        </div>
        <div className="skeleton h-64 rounded-xl mb-6" />
        <div className="skeleton h-64 rounded-xl" />
      </div>
    );
  }

  if (error || !operadora) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/operadoras"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <AlertCircle className="h-12 w-12 text-danger mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Operadora não encontrada
          </h2>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const gradient = getGradientForName(operadora.razao_social);
  const initials = getInitials(
    operadora.nome_fantasia || operadora.razao_social,
  );
  const latestIdss =
    operadora.idss_historico.length > 0
      ? operadora.idss_historico[operadora.idss_historico.length - 1]!
      : null;

  const idssChartData = operadora.idss_historico
    .sort((a, b) => a.ano - b.ano)
    .map((h) => ({
      ano: h.ano,
      "Nota Final": h.nota_final,
      IDQS: h.idqs,
      IDGA: h.idga,
      IDSM: h.idsm,
      IDGR: h.idgr,
    }));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/operadoras"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar para operadoras
      </Link>

      {/* Header */}
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
              {operadora.nome_fantasia || operadora.razao_social}
            </h1>
            {operadora.nome_fantasia && (
              <p className="text-sm text-gray-500">{operadora.razao_social}</p>
            )}
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
              <span>ANS {operadora.registro_ans}</span>
              <span>CNPJ {operadora.cnpj}</span>
              <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-medium">
                {operadora.modalidade}
              </span>
            </div>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
            <MapPin className="h-5 w-5 text-gray-400 shrink-0" />
            <div>
              <div className="text-xs text-gray-500">Localização</div>
              <div className="text-sm font-medium text-gray-900">
                {operadora.cidade ? `${operadora.cidade} - ` : ""}
                {operadora.uf}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
            <Users className="h-5 w-5 text-gray-400 shrink-0" />
            <div>
              <div className="text-xs text-gray-500">Beneficiários</div>
              <div className="text-sm font-medium text-gray-900">
                {formatNumber(operadora.beneficiarios)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
            <FileText className="h-5 w-5 text-gray-400 shrink-0" />
            <div>
              <div className="text-xs text-gray-500">Planos ativos</div>
              <div className="text-sm font-medium text-gray-900">
                {operadora.total_planos}
              </div>
            </div>
          </div>
          {operadora.data_registro && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <Calendar className="h-5 w-5 text-gray-400 shrink-0" />
              <div>
                <div className="text-xs text-gray-500">Registro</div>
                <div className="text-sm font-medium text-gray-900">
                  {operadora.data_registro}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Contact */}
        {(operadora.telefone || operadora.email || operadora.site) && (
          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-100">
            {operadora.telefone && (
              <a
                href={`tel:${operadora.telefone}`}
                className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-primary transition-colors"
              >
                <Phone className="h-4 w-4" />
                {operadora.telefone}
              </a>
            )}
            {operadora.email && (
              <a
                href={`mailto:${operadora.email}`}
                className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-primary transition-colors"
              >
                <Mail className="h-4 w-4" />
                {operadora.email}
              </a>
            )}
            {operadora.site && (
              <a
                href={operadora.site}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-primary transition-colors"
              >
                <Globe className="h-4 w-4" />
                Site
              </a>
            )}
          </div>
        )}

        {/* IDSS current score */}
        {latestIdss && (
          <div className="mt-6 p-4 rounded-xl bg-primary-light">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-primary font-medium uppercase mb-1">
                  IDSS {latestIdss.ano}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center justify-center w-10 h-10 rounded-lg text-sm font-bold",
                      getIdssBgColor(latestIdss.nota_final),
                    )}
                  >
                    {getIdssBadge(latestIdss.nota_final)}
                  </span>
                  <div>
                    <div className="text-lg font-bold text-gray-900">
                      {latestIdss.nota_final.toFixed(4)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {getIdssLabel(latestIdss.nota_final)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="hidden sm:grid grid-cols-4 gap-4 text-center">
                {[
                  { label: "IDQS", value: latestIdss.idqs },
                  { label: "IDGA", value: latestIdss.idga },
                  { label: "IDSM", value: latestIdss.idsm },
                  { label: "IDGR", value: latestIdss.idgr },
                ].map((sub) => (
                  <div key={sub.label}>
                    <div className="text-[10px] text-gray-500 font-medium">
                      {sub.label}
                    </div>
                    <div className="text-sm font-semibold text-gray-800">
                      {sub.value?.toFixed(2) ?? "N/D"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* IDSS History Chart */}
        {idssChartData.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Histórico IDSS
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart
                data={idssChartData}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="ano"
                  tick={{ fontSize: 12, fill: "#6B7280" }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 1]}
                  tick={{ fontSize: 12, fill: "#6B7280" }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => value.toFixed(4)}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px" }}
                  iconType="circle"
                  iconSize={8}
                />
                <Line
                  type="monotone"
                  dataKey="Nota Final"
                  stroke="#0066FF"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="IDQS"
                  stroke="#00C853"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="IDGA"
                  stroke="#FF9100"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="IDSM"
                  stroke="#9C27B0"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="IDGR"
                  stroke="#FF1744"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Reajustes */}
        {operadora.reajustes.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Histórico de Reajustes
            </h2>
            <ReajusteChart data={operadora.reajustes} />
          </div>
        )}
      </div>

      {/* IGR */}
      {operadora.igr_reclamacoes.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Índice de Reclamações (IGR)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">
                    Período
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">
                    Índice
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">
                    Classificação
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">
                    Reclamações
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">
                    Beneficiários
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {operadora.igr_reclamacoes.map((igr, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-sm text-gray-700">
                      {igr.ano} T{igr.trimestre}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={cn(
                          "text-sm font-semibold",
                          igr.indice <= 30
                            ? "text-success"
                            : igr.indice <= 60
                              ? "text-warning"
                              : "text-danger",
                        )}
                      >
                        {igr.indice.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-600">
                      {igr.classificacao || "N/D"}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-600">
                      {formatNumber(igr.total_reclamacoes)}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-600">
                      {formatNumber(igr.beneficiarios_periodo)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Plans from this operator */}
      {planos.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Planos desta operadora
            </h2>
            <Link
              to={`/planos?q=${registro}`}
              className="text-sm text-primary font-medium hover:text-primary-dark transition-colors"
            >
              Ver todos
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {planos.map((plano) => (
              <PlanCard key={plano.id} plano={plano} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
