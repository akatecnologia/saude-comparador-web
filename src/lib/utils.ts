import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return "N/D";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatPercentage(value: number | null | undefined): string {
  if (value == null) return "N/D";
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(value / 100);
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null) return "N/D";
  return new Intl.NumberFormat("pt-BR").format(value);
}

export function getIdssColor(score: number | null | undefined): string {
  if (score == null) return "text-gray-400";
  if (score >= 0.8) return "text-success";
  if (score >= 0.6) return "text-warning";
  return "text-danger";
}

export function getIdssBgColor(score: number | string | null | undefined): string {
  if (score == null) return "bg-gray-100 text-gray-500";
  const n = Number(score);
  if (n >= 0.8) return "bg-green-100 text-green-800";
  if (n >= 0.6) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
}

export function getIdssBadge(score: number | string | null | undefined): string {
  if (score == null) return "N/A";
  const n = Number(score);
  if (n >= 0.8) return "A";
  if (n >= 0.6) return "B";
  return "C";
}

export function getIdssLabel(score: number | null | undefined): string {
  if (score == null) return "Sem avaliação";
  if (score >= 0.8) return "Excelente";
  if (score >= 0.6) return "Regular";
  return "Precisa melhorar";
}

export const UF_LIST = [
  "AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA",
  "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR", "RJ", "RN",
  "RO", "RR", "RS", "SC", "SE", "SP", "TO",
] as const;

export const UF_NAMES: Record<string, string> = {
  AC: "Acre", AL: "Alagoas", AM: "Amazonas", AP: "Amapá",
  BA: "Bahia", CE: "Ceará", DF: "Distrito Federal", ES: "Espírito Santo",
  GO: "Goiás", MA: "Maranhão", MG: "Minas Gerais", MS: "Mato Grosso do Sul",
  MT: "Mato Grosso", PA: "Pará", PB: "Paraíba", PE: "Pernambuco",
  PI: "Piauí", PR: "Paraná", RJ: "Rio de Janeiro", RN: "Rio Grande do Norte",
  RO: "Rondônia", RR: "Roraima", RS: "Rio Grande do Sul", SC: "Santa Catarina",
  SE: "Sergipe", SP: "São Paulo", TO: "Tocantins",
};

export const FAIXAS_ETARIAS = [
  { value: "00 a 18 anos", label: "0 a 18 anos" },
  { value: "19 a 23 anos", label: "19 a 23 anos" },
  { value: "24 a 28 anos", label: "24 a 28 anos" },
  { value: "29 a 33 anos", label: "29 a 33 anos" },
  { value: "34 a 38 anos", label: "34 a 38 anos" },
  { value: "39 a 43 anos", label: "39 a 43 anos" },
  { value: "44 a 48 anos", label: "44 a 48 anos" },
  { value: "49 a 53 anos", label: "49 a 53 anos" },
  { value: "54 a 58 anos", label: "54 a 58 anos" },
  { value: "59 anos ou mais", label: "59 anos ou mais" },
] as const;

const FAIXA_STORAGE_KEY = "saude_faixa_etaria";

// Migration map: old short format → DB format
const FAIXA_MIGRATION: Record<string, string> = {
  "0-18": "00 a 18 anos", "19-23": "19 a 23 anos", "24-28": "24 a 28 anos",
  "29-33": "29 a 33 anos", "34-38": "34 a 38 anos", "39-43": "39 a 43 anos",
  "44-48": "44 a 48 anos", "49-53": "49 a 53 anos", "54-58": "54 a 58 anos",
  "59+": "59 anos ou mais",
};

export function getSavedFaixaEtaria(): string {
  try {
    const raw = localStorage.getItem(FAIXA_STORAGE_KEY) || "";
    const migrated = FAIXA_MIGRATION[raw];
    if (migrated) {
      localStorage.setItem(FAIXA_STORAGE_KEY, migrated);
      return migrated;
    }
    return raw;
  } catch { return ""; }
}

export function saveFaixaEtaria(value: string) {
  try {
    if (value) localStorage.setItem(FAIXA_STORAGE_KEY, value);
    else localStorage.removeItem(FAIXA_STORAGE_KEY);
  } catch { /* ignore */ }
}

// --- Planos filters persistence ---
const FILTERS_STORAGE_KEY = "saude_planos_filters";

const PERSISTED_FILTER_KEYS = [
  "q", "uf", "cidade", "tipo_contratacao", "segmentacao",
  "acomodacao", "abrangencia", "faixa_etaria", "ordem",
] as const;

export type PlanoFilters = Partial<Record<(typeof PERSISTED_FILTER_KEYS)[number], string>>;

export function getSavedPlanoFilters(): PlanoFilters {
  try {
    const raw = localStorage.getItem(FILTERS_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as PlanoFilters;
  } catch { return {}; }
}

export function savePlanoFilters(params: URLSearchParams) {
  try {
    const obj: PlanoFilters = {};
    for (const key of PERSISTED_FILTER_KEYS) {
      const val = params.get(key);
      if (val) obj[key] = val;
    }
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(obj));
  } catch { /* ignore */ }
}

export const TIPOS_CONTRATACAO = [
  { value: "Individual ou familiar", label: "Individual ou Familiar" },
  { value: "Coletivo empresarial", label: "Coletivo Empresarial" },
  { value: "Coletivo por adesão", label: "Coletivo por Adesão" },
] as const;

export const SEGMENTACOES = [
  { value: "Ambulatorial + Hospitalar com obstetrícia", label: "Amb. + Hosp. com Obstetrícia" },
  { value: "Ambulatorial + Hospitalar sem obstetrícia", label: "Amb. + Hosp. sem Obstetrícia" },
  { value: "Ambulatorial", label: "Ambulatorial" },
  { value: "Referência", label: "Referência" },
] as const;

export const ACOMODACOES = [
  { value: "Coletiva", label: "Coletiva (Enfermaria)" },
  { value: "Individual", label: "Individual (Apartamento)" },
] as const;

export const ABRANGENCIAS = [
  { value: "Nacional", label: "Nacional" },
  { value: "Grupo de estados", label: "Grupo de Estados" },
  { value: "Estadual", label: "Estadual" },
  { value: "Grupo de municípios", label: "Grupo de Municípios" },
  { value: "Municipal", label: "Municipal" },
] as const;

export const MODALIDADES = [
  { value: "medicina_grupo", label: "Medicina de Grupo" },
  { value: "cooperativa_medica", label: "Cooperativa Médica" },
  { value: "seguradora", label: "Seguradora" },
  { value: "filantropia", label: "Filantropia" },
  { value: "autogestao", label: "Autogestão" },
] as const;

/**
 * Format a competencia/date string into a short MM/YYYY label.
 * "202401" → "01/2024", "2024-10" → "10/2024", "2024" → "2024"
 * "25/08/2026" → "08/2026" (DD/MM/YYYY from ANS dates)
 */
export function formatCompetencia(value: string | null | undefined): string | null {
  if (!value) return null;

  // Handle DD/MM/YYYY or MM/YYYY (contains slashes)
  if (value.includes("/")) {
    const parts = value.split("/");
    if (parts.length === 3 && parts[2]!.length === 4) {
      // DD/MM/YYYY → MM/YYYY
      return `${parts[1]}/${parts[2]}`;
    }
    if (parts.length === 2) return value; // already MM/YYYY
    return value;
  }

  const clean = value.replace(/-/g, "");
  if (clean.length >= 6) {
    return `${clean.slice(4, 6)}/${clean.slice(0, 4)}`;
  }
  if (clean.length === 4) {
    return clean;
  }
  return value;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0]!)
    .join("")
    .toUpperCase();
}

export type PriceLevel = "$" | "$$" | "$$$" | "$$$$";

export function getPriceLevel(value: number | null | undefined): PriceLevel | null {
  if (value == null) return null;
  if (value < 300) return "$";
  if (value < 600) return "$$";
  if (value < 1000) return "$$$";
  return "$$$$";
}

const PRICE_LEVEL_LABELS: Record<PriceLevel, string> = {
  $: "Econômico",
  $$: "Intermediário",
  $$$: "Premium",
  $$$$: "Top",
};

export function getPriceLevelLabel(level: PriceLevel): string {
  return PRICE_LEVEL_LABELS[level];
}

export function getGradientForName(name: string): string {
  const gradients = [
    "from-blue-500 to-blue-700",
    "from-purple-500 to-purple-700",
    "from-green-500 to-green-700",
    "from-orange-500 to-orange-700",
    "from-pink-500 to-pink-700",
    "from-teal-500 to-teal-700",
    "from-indigo-500 to-indigo-700",
    "from-cyan-500 to-cyan-700",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length]!;
}
