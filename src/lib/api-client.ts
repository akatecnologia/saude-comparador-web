import type {
  Stats,
  PaginatedResponse,
  Operadora,
  OperadoraDetail,
  Plano,
  PlanoDetail,
  RankingEntry,
  Reajuste,
  LeadCreate,
  BuscarPlanosParams,
  OperadorasParams,
  RankingParams,
  ChatMessage,
  FaixasPrecoResponse,
  VcmResponse,
  VcmHistoricoResponse,
  QualidadeResponse,
} from "@/types";

const BASE_URL = import.meta.env.VITE_API_URL || "";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetcher<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    let message = `Erro ${res.status}`;
    try {
      const body = await res.json();
      message = body.detail || body.message || message;
    } catch {
      // ignore parse error
    }
    throw new ApiError(res.status, message);
  }

  return res.json() as Promise<T>;
}

function buildQuery(params: Record<string, unknown> | object): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value != null && value !== "") {
      searchParams.set(key, String(value));
    }
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}

// --- Stats ---
export function getStats(params: { uf?: string } = {}): Promise<Stats> {
  return fetcher<Stats>(`/api/v1/stats${buildQuery(params)}`);
}

// --- Operadoras ---
export function getOperadoras(
  params: OperadorasParams = {},
): Promise<PaginatedResponse<Operadora>> {
  return fetcher<PaginatedResponse<Operadora>>(
    `/api/v1/operadoras${buildQuery(params)}`,
  );
}

export async function getOperadora(registro: string): Promise<OperadoraDetail> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = await fetcher<any>(`/api/v1/operadoras/${registro}`);

  // Transform idss_scores → idss_historico
  const idss_historico = (raw.idss_scores || []).map((s: any) => ({
    ano: s.ano_referencia,
    nota_final: s.idss != null ? Number(s.idss) : 0,
    idqs: s.idqs != null ? Number(s.idqs) : null,
    idga: s.idga != null ? Number(s.idga) : null,
    idsm: s.idsm != null ? Number(s.idsm) : null,
    idgr: s.idgr != null ? Number(s.idgr) : null,
  }));

  // Transform igr_reclamacoes field names
  const igr_reclamacoes = (raw.igr_reclamacoes || []).map((r: any) => {
    const comp = r.competencia || "";
    const year = parseInt(comp.substring(0, 4), 10) || 0;
    const month = parseInt(comp.substring(4, 6), 10) || 1;
    return {
      ano: year,
      trimestre: Math.ceil(month / 3),
      indice: r.indice_reclamacao != null ? Number(r.indice_reclamacao) : 0,
      classificacao: r.classificacao_mes != null ? String(r.classificacao_mes) : null,
      total_reclamacoes: r.reclamacoes ?? null,
      beneficiarios_periodo: r.beneficiarios ?? null,
    };
  });

  // Transform reajustes field names
  const reajustes = (raw.reajustes || []).map((r: any) => ({
    ano: parseInt(r.ciclo, 10) || 0,
    percentual: r.pct_unico != null ? Number(r.pct_unico) : 0,
    tipo_plano: r.tipo_agrupamento || "geral",
  }));

  return {
    id: raw.id,
    registro_ans: raw.registro_ans,
    razao_social: raw.razao_social,
    nome_fantasia: raw.nome_fantasia ?? null,
    cnpj: raw.cnpj ?? "",
    modalidade: raw.modalidade ?? "",
    uf: raw.uf ?? "",
    cidade: raw.cidade ?? null,
    porte: null,
    beneficiarios: raw.beneficiarios ?? null,
    idss_score: raw.idss_score ?? raw.latest_idss ?? null,
    endereco: null,
    telefone: raw.telefone ?? null,
    email: raw.email ?? null,
    site: null,
    data_registro: raw.data_registro_ans ?? null,
    idss_historico,
    igr_reclamacoes,
    reajustes,
    total_planos: 0,
  };
}

// --- Planos ---
export function buscarPlanos(
  params: BuscarPlanosParams = {},
): Promise<PaginatedResponse<Plano>> {
  return fetcher<PaginatedResponse<Plano>>(
    `/api/v1/planos/buscar${buildQuery(params)}`,
  );
}

export function getPlano(id: number | string): Promise<PlanoDetail> {
  return fetcher<PlanoDetail>(`/api/v1/planos/${id}`);
}

export async function compararPlanos(ids: number[]): Promise<PlanoDetail[]> {
  const data = await fetcher<{ planos: PlanoDetail[] }>(
    `/api/v1/planos/comparar${buildQuery({ ids: ids.join(",") })}`,
  );
  return data.planos;
}

// --- Faixas de Preco ---
export function getFaixasPreco(): Promise<FaixasPrecoResponse> {
  return fetcher<FaixasPrecoResponse>("/api/v1/faixas-preco");
}

// --- Precos VCM (preço real por faixa etária) ---
export function getPrecos(idPlanoAns: string): Promise<VcmResponse> {
  return fetcher<VcmResponse>(`/api/v1/precos/${idPlanoAns}`);
}

export function getPrecoHistorico(
  idPlanoAns: string,
  faixaEtaria: string,
): Promise<VcmHistoricoResponse> {
  return fetcher<VcmHistoricoResponse>(
    `/api/v1/precos/${idPlanoAns}/historico${buildQuery({ faixa_etaria: faixaEtaria })}`,
  );
}

// --- Qualidade da Operadora ---
export function getQualidade(registroAns: string): Promise<QualidadeResponse> {
  return fetcher<QualidadeResponse>(`/api/v1/qualidade/${registroAns}`);
}

// --- Ranking ---
export function getRanking(
  params: RankingParams = {},
): Promise<PaginatedResponse<RankingEntry>> {
  return fetcher<PaginatedResponse<RankingEntry>>(
    `/api/v1/ranking${buildQuery(params)}`,
  );
}

// --- Reajustes ---
interface ReajusteHistoricoAPI {
  operadora_id: number;
  registro_ans: string;
  razao_social: string;
  series: Record<string, { ciclo: string; pct_unico: number | null }[]>;
}

export async function getReajustes(registro?: string): Promise<Reajuste[]> {
  if (!registro) return [];
  const data = await fetcher<ReajusteHistoricoAPI>(
    `/api/v1/reajustes/${registro}`,
  );
  // Flatten series into the flat Reajuste[] the chart/table expects
  const items: Reajuste[] = [];
  for (const [tipo, points] of Object.entries(data.series)) {
    for (const p of points) {
      const ano = parseInt(p.ciclo, 10);
      if (isNaN(ano)) continue;
      items.push({
        ano,
        percentual: p.pct_unico != null ? Number(p.pct_unico) : 0,
        tipo_plano: tipo,
      });
    }
  }
  return items.sort((a, b) => a.ano - b.ano);
}

// --- Leads ---
interface LeadResponseAPI {
  id: number;
  nome: string | null;
  email: string | null;
  status: string;
  opt_in_lgpd: boolean;
  created_at: string;
}

export async function createLead(data: LeadCreate): Promise<LeadResponseAPI> {
  return fetcher<LeadResponseAPI>("/api/v1/leads", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// --- Chat IA (SSE streaming via fetch) ---
export async function chatIAStream(
  leadId: string,
  mensagem: string,
  historico: ChatMessage[],
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (error: Error) => void,
): Promise<AbortController> {
  const controller = new AbortController();
  const url = `${BASE_URL}/api/v1/ia/chat`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Lead-Id": leadId,
      },
      body: JSON.stringify({
        lead_id: Number(leadId),
        mensagem,
        historico,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new ApiError(res.status, `Erro ${res.status}`);
    }

    const reader = res.body?.getReader();
    if (!reader) {
      throw new Error("Streaming não suportado");
    }

    const decoder = new TextDecoder();
    let buffer = "";

    const processStream = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          onDone();
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              onDone();
              return;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                onChunk(parsed.content);
              }
            } catch {
              // If not JSON, treat as plain text chunk
              onChunk(data);
            }
          }
        }
      }
    };

    processStream().catch(onError);
  } catch (err) {
    if (err instanceof Error && err.name !== "AbortError") {
      onError(err);
    }
  }

  return controller;
}

export { ApiError };
