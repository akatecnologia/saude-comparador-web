import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Building2,
  FileText,
  MapPin,
  Users,
  Bot,
  ArrowRight,
  BarChart3,
  Shield,
  TrendingUp,
} from "lucide-react";
import SEO from "@/components/seo";
import SearchBox from "@/components/search-box";
import PlanCard from "@/components/plan-card";
import { getStats, buscarPlanos } from "@/lib/api-client";
import { useUserUf } from "@/hooks/use-user-uf";
import { formatNumber, cn, UF_NAMES } from "@/lib/utils";
import type { Stats, Plano } from "@/types";

function StatCard({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  loading: boolean;
}) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100 text-center animate-fade-in">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-light text-primary mb-3">
        <Icon className="h-6 w-6" />
      </div>
      <div
        className={cn(
          "text-2xl font-bold text-gray-900 mb-1",
          loading && "skeleton h-8 w-20 mx-auto",
        )}
      >
        {!loading && value}
      </div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}

export default function Home() {
  const [initialUf] = useUserUf();
  const [activeUf, setActiveUf] = useState(initialUf);
  const [stats, setStats] = useState<Stats | null>(null);
  const [featuredPlanos, setFeaturedPlanos] = useState<Plano[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [planosLoading, setPlanosLoading] = useState(true);

  useEffect(() => {
    setStatsLoading(true);
    setPlanosLoading(true);

    getStats(activeUf ? { uf: activeUf } : {})
      .then(setStats)
      .catch(() => {
        setStats({
          total_operadoras: 0,
          total_planos: 0,
          total_municipios: 0,
          total_beneficiarios: 0,
          data_atualizacao: null,
        });
      })
      .finally(() => setStatsLoading(false));

    buscarPlanos({ uf: activeUf || undefined, page_size: 6, ordem: "idss_desc" })
      .then((res) => setFeaturedPlanos(res.items))
      .catch(() => setFeaturedPlanos([]))
      .finally(() => setPlanosLoading(false));
  }, [activeUf]);

  const ufLabel = activeUf ? (UF_NAMES[activeUf] || activeUf) : null;

  return (
    <div>
      <SEO
        title="Compare planos de saúde com dados reais"
        description="Analise rankings de qualidade, histórico de reajustes e índices de reclamação das operadoras usando dados oficiais da ANS."
        canonical="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "SaudeComparador",
          url: "/",
          description:
            "Plataforma de comparação de planos de saúde baseada em dados públicos da ANS.",
          potentialAction: {
            "@type": "SearchAction",
            target: "/planos?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }}
      />
      {/* Hero Section */}
      <section
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0066FF 0%, #0041A8 100%)",
        }}
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/5 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/3 rounded-full" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
              Compare planos de saúde com{" "}
              <span className="text-blue-200">dados reais</span>
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 leading-relaxed">
              Analise rankings de qualidade, histórico de reajustes e índices de
              reclamação das operadoras usando dados oficiais da ANS.
            </p>
          </div>

          {/* Search box */}
          <div className="max-w-4xl mx-auto">
            <SearchBox variant="hero" onUfChange={setActiveUf} />
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10 mb-16">
        {ufLabel && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <MapPin className="h-4 w-4 text-white/80" />
            <span className="text-sm font-medium text-white/80">
              Dados para <span className="text-white font-semibold">{ufLabel} ({activeUf})</span>
            </span>
          </div>
        )}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Building2}
            label={ufLabel ? `Operadoras em ${activeUf}` : "Operadoras"}
            value={formatNumber(stats?.total_operadoras)}
            loading={statsLoading}
          />
          <StatCard
            icon={FileText}
            label={ufLabel ? `Planos em ${activeUf}` : "Planos"}
            value={formatNumber(stats?.total_planos)}
            loading={statsLoading}
          />
          <StatCard
            icon={MapPin}
            label={ufLabel ? `Municípios em ${activeUf}` : "Municípios"}
            value={formatNumber(stats?.total_municipios)}
            loading={statsLoading}
          />
          <StatCard
            icon={Users}
            label={ufLabel ? `Beneficiários em ${activeUf}` : "Beneficiários"}
            value={formatNumber(stats?.total_beneficiarios)}
            loading={statsLoading}
          />
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Tudo que você precisa para escolher o melhor plano
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Reunimos dados oficiais e inteligência artificial para ajudar você a
            tomar a melhor decisão.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-primary flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Ranking IDSS
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Índice de Desempenho da Saúde Suplementar avaliado pela ANS.
              Compare a qualidade de atendimento das operadoras.
            </p>
            <Link
              to="/ranking"
              className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
            >
              Ver ranking <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-green-50 text-success flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Histórico de Reajustes
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Acompanhe o histórico de reajustes de cada operadora e compare com
              o teto autorizado pela ANS.
            </p>
            <Link
              to="/reajustes"
              className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
            >
              Ver reajustes <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Índice de Reclamações
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Confira o índice de reclamações (IGR) e saiba quais operadoras têm
              mais queixas registradas na ANS.
            </p>
            <Link
              to="/operadoras"
              className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
            >
              Ver operadoras <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured plans */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Planos em destaque{ufLabel ? ` em ${ufLabel}` : ""}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Planos com melhor avaliação IDSS{ufLabel ? ` no estado` : ""}
            </p>
          </div>
          <Link
            to="/planos"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
          >
            Ver todos <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {planosLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex gap-3 mb-4">
                  <div className="skeleton w-12 h-12 rounded-xl" />
                  <div className="flex-1">
                    <div className="skeleton h-4 w-3/4 mb-2" />
                    <div className="skeleton h-3 w-1/2" />
                  </div>
                </div>
                <div className="skeleton h-6 w-full mb-3" />
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="skeleton h-14 rounded-lg" />
                  <div className="skeleton h-14 rounded-lg" />
                  <div className="skeleton h-14 rounded-lg" />
                </div>
                <div className="skeleton h-12 w-full rounded-lg" />
              </div>
            ))}
          </div>
        ) : featuredPlanos.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPlanos.map((plano) => (
              <PlanCard key={plano.id} plano={plano} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              Nenhum plano disponível no momento. Conecte-se ao backend para ver
              os dados.
            </p>
          </div>
        )}

        <div className="sm:hidden text-center mt-4">
          <Link
            to="/planos"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
          >
            Ver todos os planos <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* CTA - AI Assistant */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div
          className="rounded-2xl p-8 sm:p-12 text-white relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #0066FF 0%, #0041A8 100%)",
          }}
        >
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>

          <div className="relative flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-sm font-medium mb-4">
                <Bot className="h-4 w-4" />
                Assistente com IA
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                Não sabe qual plano escolher?
              </h2>
              <p className="text-blue-100 leading-relaxed max-w-xl">
                Nosso assistente virtual utiliza inteligência artificial para
                analisar seu perfil e recomendar os melhores planos de saúde com
                base em dados reais da ANS.
              </p>
            </div>

            <Link
              to="/assistente"
              className="shrink-0 inline-flex items-center gap-2 bg-white text-primary hover:bg-blue-50 font-semibold px-8 py-4 rounded-xl transition-colors shadow-lg"
            >
              <Bot className="h-5 w-5" />
              Conversar com o assistente
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
