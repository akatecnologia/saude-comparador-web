import { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router";
import {
  Menu,
  X,
  Shield,
  BarChart3,
  TrendingUp,
  Bot,
  Search,
  Database,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAnalytics } from "@/hooks/use-analytics";

const NAV_LINKS = [
  { to: "/planos", label: "Planos", icon: Search },
  { to: "/ranking", label: "Ranking", icon: BarChart3 },
  { to: "/reajustes", label: "Reajustes", icon: TrendingUp },
  { to: "/operadoras", label: "Operadoras", icon: Database },
  { to: "/assistente", label: "Assistente IA", icon: Bot, badge: "NOVO" },
];

export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isAssistente = location.pathname === "/assistente";

  // Track page views on route changes
  useAnalytics();

  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-gray-900">
                Saúde<span className="text-primary">Comparador</span>
              </span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname.startsWith(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary-light text-primary"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                    {link.badge && (
                      <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-primary text-white rounded-full">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Data freshness tag */}
            <div className="hidden lg:flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Dados ANS atualizados
              </span>
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Abrir menu"
            >
              {mobileOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 top-16 z-40">
            <div
              className="absolute inset-0 bg-black/20"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative bg-white border-b border-gray-200 shadow-lg">
              <div className="px-4 py-3 space-y-1">
                {NAV_LINKS.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname.startsWith(link.to);
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors",
                        isActive
                          ? "bg-primary-light text-primary"
                          : "text-gray-600 hover:bg-gray-100",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {link.label}
                      {link.badge && (
                        <span className="ml-auto px-2 py-0.5 text-[10px] font-bold bg-primary text-white rounded-full">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
              <div className="px-4 py-3 border-t border-gray-100">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Dados ANS atualizados
                </span>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer — hidden on fullscreen pages like the AI chat */}
      {!isAssistente && (
      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold text-white">
                  Saúde<span className="text-primary">Comparador</span>
                </span>
              </div>
              <p className="text-sm leading-relaxed">
                Plataforma de comparação de planos de saúde baseada em dados
                públicos da Agência Nacional de Saúde Suplementar (ANS).
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">
                Navegação
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/planos" className="hover:text-white transition-colors">
                    Buscar Planos
                  </Link>
                </li>
                <li>
                  <Link to="/ranking" className="hover:text-white transition-colors">
                    Ranking IDSS
                  </Link>
                </li>
                <li>
                  <Link to="/reajustes" className="hover:text-white transition-colors">
                    Histórico de Reajustes
                  </Link>
                </li>
                <li>
                  <Link to="/operadoras" className="hover:text-white transition-colors">
                    Operadoras
                  </Link>
                </li>
                <li>
                  <Link to="/assistente" className="hover:text-white transition-colors">
                    Assistente IA
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">
                Legal
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/termos" className="hover:text-white transition-colors">
                    Termos de Uso
                  </Link>
                </li>
                <li>
                  <Link to="/privacidade" className="hover:text-white transition-colors">
                    Política de Privacidade
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">
                Fonte dos dados
              </h3>
              <p className="text-sm leading-relaxed">
                Todos os dados apresentados são obtidos de fontes públicas
                oficiais da ANS (Agência Nacional de Saúde Suplementar) e do
                portal de dados abertos do governo brasileiro.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-800">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs">
                &copy; {new Date().getFullYear()} SaúdeComparador. Desenvolvido
                por{" "}
                <a
                  href="https://goworks.tech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Goworks Tecnologia
                </a>
                . Dados públicos ANS.
              </p>
              <p className="text-xs text-center sm:text-right max-w-xl">
                <strong className="text-gray-300">Aviso legal:</strong> As
                informações apresentadas têm caráter informativo e não
                substituem a consulta direta às operadoras ou à ANS. Preços e
                condições podem variar.
              </p>
            </div>
          </div>
        </div>
      </footer>
      )}
    </div>
  );
}
