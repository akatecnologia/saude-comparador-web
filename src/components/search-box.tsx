import { useState } from "react";
import { useNavigate } from "react-router";
import { Search } from "lucide-react";
import {
  UF_LIST,
  TIPOS_CONTRATACAO,
  FAIXAS_ETARIAS,
  cn,
} from "@/lib/utils";
import { useUserUf } from "@/hooks/use-user-uf";

interface SearchBoxProps {
  className?: string;
  variant?: "hero" | "compact";
  defaultUf?: string;
  defaultTipo?: string;
  defaultFaixa?: string;
  onUfChange?: (uf: string) => void;
}

export default function SearchBox({
  className,
  variant = "hero",
  defaultUf,
  defaultTipo = "",
  defaultFaixa = "",
  onUfChange,
}: SearchBoxProps) {
  const navigate = useNavigate();
  const [detectedUf, saveUf] = useUserUf();
  const [uf, setUf] = useState(defaultUf ?? detectedUf);
  const [tipo, setTipo] = useState(defaultTipo);
  const [faixa, setFaixa] = useState(defaultFaixa);

  function handleUfChange(value: string) {
    setUf(value);
    saveUf(value);
    onUfChange?.(value);
  }

  function handleSearch() {
    const params = new URLSearchParams();
    if (uf) params.set("uf", uf);
    if (tipo) params.set("tipo_contratacao", tipo);
    if (faixa) params.set("faixa_etaria", faixa);
    navigate(`/planos?${params.toString()}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleSearch();
    }
  }

  const isHero = variant === "hero";

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row gap-3",
        isHero
          ? "bg-white rounded-2xl p-3 shadow-xl"
          : "bg-white rounded-xl p-2 shadow-md border border-gray-200",
        className,
      )}
      onKeyDown={handleKeyDown}
    >
      <select
        value={uf}
        onChange={(e) => handleUfChange(e.target.value)}
        className={cn(
          "flex-1 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition",
          isHero ? "px-4 py-3 text-base" : "px-3 py-2 text-sm",
        )}
      >
        <option value="">Todos os estados</option>
        {UF_LIST.map((u) => (
          <option key={u} value={u}>
            {u}
          </option>
        ))}
      </select>

      <select
        value={tipo}
        onChange={(e) => setTipo(e.target.value)}
        className={cn(
          "flex-1 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition",
          isHero ? "px-4 py-3 text-base" : "px-3 py-2 text-sm",
        )}
      >
        <option value="">Tipo de plano</option>
        {TIPOS_CONTRATACAO.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>

      <select
        value={faixa}
        onChange={(e) => setFaixa(e.target.value)}
        className={cn(
          "flex-1 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition",
          isHero ? "px-4 py-3 text-base" : "px-3 py-2 text-sm",
        )}
      >
        <option value="">Faixa etária</option>
        {FAIXAS_ETARIAS.map((f) => (
          <option key={f.value} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={handleSearch}
        className={cn(
          "inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors shrink-0",
          isHero ? "px-8 py-3 text-base" : "px-5 py-2 text-sm",
        )}
      >
        <Search className={isHero ? "h-5 w-5" : "h-4 w-4"} />
        Buscar
      </button>
    </div>
  );
}
